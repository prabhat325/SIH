/**
 * RAAHI — Community Change Requests & Verification Pipeline
 * "Help us keep Raahi accurate"
 * Supports field-level corrections (Timings, Entry Fee, Contact, Facilities, Details),
 * evidence upload simulation, and submission into the Chief Curator Admin verification queue.
 */

const RaahiCommunity = {
  activeResourceId: null,
  activeResourceType: null,
  activeResourceName: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById('suggest-change-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitChangeRequest();
      });
    }
  },

  openSuggestModal(resourceId, resourceType, resourceName) {
    this.activeResourceId = resourceId;
    this.activeResourceType = resourceType;
    this.activeResourceName = resourceName;

    const modal = document.getElementById('suggest-change-modal');
    const titleEl = document.getElementById('suggest-modal-title');
    const resourceNameEl = document.getElementById('suggest-modal-resource-name');
    if (!modal) return;

    if (titleEl) titleEl.textContent = `Suggest a Change for ${resourceName}`;
    if (resourceNameEl) resourceNameEl.value = `${resourceName} (${resourceType.toUpperCase()})`;

    // Reset Form fields
    const fieldInput = document.getElementById('suggest-field-select');
    const currentValInput = document.getElementById('suggest-current-val');
    const newValInput = document.getElementById('suggest-new-val');
    const reasonInput = document.getElementById('suggest-reason');
    if (fieldInput) fieldInput.selectedIndex = 0;
    if (currentValInput) currentValInput.value = '';
    if (newValInput) newValInput.value = '';
    if (reasonInput) reasonInput.value = '';

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeSuggestModal() {
    const modal = document.getElementById('suggest-change-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  submitChangeRequest() {
    const changeType = document.getElementById('suggest-type-select')?.value || 'Update Information';
    const field = document.getElementById('suggest-field-select')?.value || 'General Information';
    const currentValue = document.getElementById('suggest-current-val')?.value || 'As currently displayed';
    const suggestedValue = document.getElementById('suggest-new-val')?.value || '';
    const reason = document.getElementById('suggest-reason')?.value || '';

    if (!suggestedValue || !reason) {
      RaahiApp.showToast("Please provide the suggested correction and a brief reason.", "error");
      return;
    }

    const newRequest = {
      id: `cr-${Date.now().toString().slice(-4)}`,
      resourceId: this.activeResourceId,
      resourceName: this.activeResourceName,
      resourceType: this.activeResourceType,
      changeType: changeType,
      field: field,
      currentValue: currentValue,
      suggestedValue: suggestedValue,
      reason: reason,
      evidence: "",
      submittedBy: RaahiAuth.currentUser ? RaahiAuth.currentUser.name : "Traveler Community Member",
      date: new Date().toISOString().split('T')[0],
      status: "Pending"
    };

    RAAHI_DATA.communityChanges.unshift(newRequest);

    if (RaahiAuth.currentUser) {
      if (!RaahiAuth.currentUser.contributions) RaahiAuth.currentUser.contributions = [];
      RaahiAuth.currentUser.contributions.unshift(newRequest);
      RaahiAuth.saveState();
    }

    this.closeSuggestModal();
    RaahiApp.showToast("Thank you! Your contribution has been submitted for Chief Curator verification.", "success");

    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderContributions();
    if (typeof RaahiAdmin !== 'undefined') RaahiAdmin.renderRequestsTable();
  }
};

if (typeof window !== 'undefined') {
  window.RaahiCommunity = RaahiCommunity;
}
