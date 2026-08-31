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


async submitChangeRequest() {

  const changeType =
    document.getElementById('suggest-type-select')?.value ||
    'UPDATE';

  const field =
    document.getElementById('suggest-field-select')?.value ||
    'General Information';

  const currentValue =
    document.getElementById('suggest-current-val')?.value ||
    '';

  const suggestedValue =
    document.getElementById('suggest-new-val')?.value ||
    '';

  const reason =
    document.getElementById('suggest-reason')?.value ||
    '';


  // ==========================================
  // Require login
  // ==========================================

  if (!RaahiAPI.currentUser) {

    RaahiApp.showToast(
      'Please sign in before submitting a change request.',
      'warning'
    );

    if (typeof RaahiAuth !== 'undefined') {
      RaahiAuth.openAuthModal('signin');
    }

    return;
  }


  // ==========================================
  // Validate form
  // ==========================================

  if (!suggestedValue || !reason) {

    RaahiApp.showToast(
      'Please provide the suggested correction and a brief reason.',
      'error'
    );

    return;
  }


  // ==========================================
  // Convert UI request type
  // ==========================================

let requestType = 'UPDATE';

switch (changeType) {
  case 'Update Information':
  case 'Correct Information':
    requestType = 'UPDATE';
    break;

  case 'Report Incorrect Information':
    requestType = 'REPORT';
    break;

  case 'Suggest Deletion':
    requestType = 'DELETE';
    break;

  default:
    requestType = 'UPDATE';
}




  // ==========================================
  // Build backend request
  // ==========================================


  const resourceTypeMap = {
  place: 'Place',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  event: 'Event',
  guide: 'Guide',
  emergency: 'Emergency',
  vehicle: 'Vehicle'
};

const rawResourceType =
  String(this.activeResourceType || '').trim();

const resourceType =
  resourceTypeMap[rawResourceType.toLowerCase()] ||
  rawResourceType;

const requestData = {
  requestType,

  resourceType,

  resourceId:
    requestType === 'CREATE'
      ? null
      : this.activeResourceId,

  changes:
    requestType === 'UPDATE'
      ? [
          {
            field,
            oldValue: currentValue,
            newValue: suggestedValue
          }
        ]
      : [],

  submittedData:
    requestType === 'CREATE'
      ? {
          name: suggestedValue
        }
      : null,

  reason,

  evidence: []
};


  // ==========================================
  // Submit to backend
  // ==========================================

  try {

    const response =
      await RaahiAPI.createChangeRequest(
        requestData
      );


    if (!response || !response.success) {

      throw new Error(
        response?.message ||
        'Failed to submit change request'
      );
    }


    // ========================================
    // Success
    // ========================================

    this.closeSuggestModal();


    RaahiApp.showToast(
      response.message ||
      'Your change request has been submitted for review.',
      'success'
    );


    // Refresh user's real requests
    if (
      typeof RaahiDashboard !== 'undefined' &&
      typeof RaahiDashboard.loadContributions === 'function'
    ) {
      await RaahiDashboard.loadContributions();
    }


  } catch (error) {

    console.error(
      '[RaahiCommunity] Change request submission failed:',
      error
    );


    RaahiApp.showToast(
      error.message ||
      'Failed to submit change request.',
      'error'
    );
  }
},

};

if (typeof window !== 'undefined') {
  window.RaahiCommunity = RaahiCommunity;
}
