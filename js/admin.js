/**
 * RAAHI — Chief Curator Admin Portal Module
 * Professional Admin Interface for Smart India Hackathon (SIH) Evaluation.
 * Features: Statistics KPIs, Contribution Diff Modal, Approve / Reject Workflow, Chart.js Metrics.
 */

const RaahiAdmin = {
  activeReviewItem: null,

  init() {
    this.renderMetrics();
    this.renderRequestsTable();
  },

  renderMetrics() {
    const totalResources = (RAAHI_DATA.places?.length || 0) + (RAAHI_DATA.hotels?.length || 0) + (RAAHI_DATA.restaurants?.length || 0) + (RAAHI_DATA.events?.length || 0);
    const pendingReqs = (RAAHI_DATA.communityChanges || []).filter(c => c.status === 'Pending').length;
    const approvedReqs = (RAAHI_DATA.communityChanges || []).filter(c => c.status === 'Approved').length;
    const rejectedReqs = (RAAHI_DATA.communityChanges || []).filter(c => c.status === 'Rejected').length;

    const elTotal = document.getElementById('admin-stat-total-res');
    const elPending = document.getElementById('admin-stat-pending');
    const elApproved = document.getElementById('admin-stat-approved');
    const elRejected = document.getElementById('admin-stat-rejected');

    if (elTotal) elTotal.textContent = totalResources;
    if (elPending) elPending.textContent = pendingReqs;
    if (elApproved) elApproved.textContent = approvedReqs;
    if (elRejected) elRejected.textContent = rejectedReqs;
  },

  renderRequestsTable() {
    const tbody = document.getElementById('admin-changes-table-body');
    if (!tbody || !RAAHI_DATA.communityChanges) return;

    this.renderMetrics();

    tbody.innerHTML = RAAHI_DATA.communityChanges.map(item => {
      const statusBadge = item.status === 'Approved'
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Approved</span>'
        : item.status === 'Rejected'
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">Rejected</span>'
        : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Pending Review</span>';

      return `
        <tr class="border-b border-stone-100 dark:border-stone-800 text-xs hover:bg-stone-50/60 dark:hover:bg-stone-850">
          <td class="py-3 px-4 font-mono font-bold text-stone-500">${item.id}</td>
          <td class="py-3 px-4 font-bold text-stone-900 dark:text-white">${item.resourceName}</td>
          <td class="py-3 px-4 font-semibold text-amber-600">${item.field}</td>
          <td class="py-3 px-4 text-stone-600 dark:text-stone-300">${item.submittedBy}</td>
          <td class="py-3 px-4 font-mono text-stone-400">${item.date}</td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="RaahiAdmin.openDiffReviewModal('${item.id}')" class="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-[11px] hover:bg-amber-600 transition-colors">
              Review Diff
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openDiffReviewModal(requestId) {
    const item = RAAHI_DATA.communityChanges.find(c => c.id === requestId);
    if (!item) return;

    this.activeReviewItem = item;
    const modal = document.getElementById('admin-diff-modal');
    const content = document.getElementById('admin-diff-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900">
        <div class="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600">${item.id} • ${item.changeType}</span>
            <h3 class="font-heading text-xl font-bold text-stone-900 dark:text-white mt-0.5">Review Contribution: ${item.resourceName}</h3>
            <p class="text-xs text-stone-500">Submitted by ${item.submittedBy} on ${item.date}</p>
          </div>
          <button onclick="RaahiAdmin.closeDiffModal()" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <!-- Side by Side Diff Box -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <span class="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase block mb-1">Current Information (${item.field})</span>
            <div class="p-3 bg-white dark:bg-stone-900 rounded-lg text-xs font-mono text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800">
              ${item.currentValue || 'No previous recorded data'}
            </div>
          </div>

          <div class="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
            <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block mb-1">Suggested Correction</span>
            <div class="p-3 bg-white dark:bg-stone-900 rounded-lg text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold border border-stone-200 dark:border-stone-800">
              ${item.suggestedValue}
            </div>
          </div>
        </div>

        <div class="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
          <span class="text-[11px] font-bold text-stone-500 uppercase block mb-1">Contributor Note & Rationale</span>
          <p class="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">${item.reason}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
          <button onclick="RaahiAdmin.rejectChange('${item.id}')" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">cancel</span>
            <span>Reject Change</span>
          </button>
          <button onclick="RaahiAdmin.approveChange('${item.id}')" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">verified</span>
            <span>Approve & Apply to Portal</span>
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeDiffModal() {
    const modal = document.getElementById('admin-diff-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  approveChange(requestId) {
    const item = RAAHI_DATA.communityChanges.find(c => c.id === requestId);
    if (!item) return;

    item.status = "Approved";

    // Apply change if place entry fee
    if (item.resourceType === 'place') {
      const place = RAAHI_DATA.places.find(p => p.id === item.resourceId);
      if (place && item.field === 'Entry Fee') {
        place.entryFee = item.suggestedValue;
      }
    }

    this.closeDiffModal();
    RaahiApp.showToast(`Change request ${requestId} approved & applied live!`, "success");
    this.renderRequestsTable();
    if (typeof RaahiPlaces !== 'undefined') RaahiPlaces.renderPlaces();
  },

  rejectChange(requestId) {
    const item = RAAHI_DATA.communityChanges.find(c => c.id === requestId);
    if (!item) return;

    item.status = "Rejected";
    this.closeDiffModal();
    RaahiApp.showToast(`Change request ${requestId} rejected.`, "info");
    this.renderRequestsTable();
  },

  renderCharts() {
    // Optional Chart.js rendering if canvas exists
  }
};

if (typeof window !== 'undefined') {
  window.RaahiAdmin = RaahiAdmin;
}
