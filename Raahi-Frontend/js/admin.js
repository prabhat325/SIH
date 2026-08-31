/**
 * RAAHI — Chief Curator Admin Portal
 * Backend-connected change request management.
 */

const RaahiAdmin = {

  activeReviewItem: null,
  activeFilter: 'Pending',

  requests: {
    Pending: [],
    Approved: [],
    Rejected: []
  },

  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  },


  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  async init() {
    await this.loadDashboard();
  },


  // =========================================================================
  // LOAD DASHBOARD
  // =========================================================================

  async loadDashboard() {
    this.setLoading(true);

    try {
      await this.loadStats();
      await this.loadRequests(this.activeFilter);

    } catch (error) {
      console.error(
        '[RaahiAdmin] Dashboard load failed:',
        error
      );

      if (typeof RaahiApp !== 'undefined') {
        RaahiApp.showToast(
          error.message || 'Failed to load admin dashboard',
          'error'
        );
      }

    } finally {
      this.setLoading(false);
    }
  },


  // =========================================================================
  // LOAD STATISTICS
  // =========================================================================

  async loadStats() {

    const response =
      await RaahiAPI.getAdminStats();

    if (!response || !response.success) {
      throw new Error(
        response?.message ||
        'Failed to load dashboard statistics'
      );
    }

    this.stats = {
      total: response.data?.total || 0,
      pending: response.data?.pending || 0,
      approved: response.data?.approved || 0,
      rejected: response.data?.rejected || 0
    };

    this.renderMetrics();
  },


  // =========================================================================
  // RENDER STATISTICS
  // =========================================================================

  renderMetrics() {

    const total = document.getElementById(
      'admin-stat-total-res'
    );

    const pending = document.getElementById(
      'admin-stat-pending'
    );

    const approved = document.getElementById(
      'admin-stat-approved'
    );

    const rejected = document.getElementById(
      'admin-stat-rejected'
    );

    if (total) {
      total.textContent = this.stats.total;
    }

    if (pending) {
      pending.textContent = this.stats.pending;
    }

    if (approved) {
      approved.textContent = this.stats.approved;
    }

    if (rejected) {
      rejected.textContent = this.stats.rejected;
    }
  },


  // =========================================================================
  // STATUS FILTER
  // =========================================================================

  async setRequestFilter(status) {

    if (
      ![
        'Pending',
        'Approved',
        'Rejected'
      ].includes(status)
    ) {
      return;
    }

    this.activeFilter = status;

    this.updateFilterButtons();

    await this.loadRequests(status);
  },


  updateFilterButtons() {

    const statuses = [
      'Pending',
      'Approved',
      'Rejected'
    ];

    statuses.forEach(status => {

      const button =
        document.getElementById(
          `admin-filter-${status.toLowerCase()}`
        );

      if (!button) return;

      if (status === this.activeFilter) {

        button.className =
          'px-3 py-2 rounded-lg text-[11px] font-bold bg-amber-600 text-white transition-all';

      } else {

        button.className =
          'px-3 py-2 rounded-lg text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-white transition-all';
      }
    });
  },


  // =========================================================================
  // LOAD REQUESTS
  // =========================================================================

  async loadRequests(status) {

    this.setLoading(true);

    try {

      const response =
        await RaahiAPI.getAdminChangeRequests(
          status
        );

      if (!response || !response.success) {
        throw new Error(
          response?.message ||
          `Failed to load ${status} requests`
        );
      }

      this.requests[status] =
        Array.isArray(response.data)
          ? response.data
          : [];

      this.renderRequests();

    } catch (error) {

      console.error(
        `[RaahiAdmin] Failed to load ${status} requests:`,
        error
      );

      const list =
        document.getElementById(
          'admin-request-list'
        );

      if (list) {
        list.innerHTML = `
          <div class="p-10 text-center">
            <span class="material-symbols-outlined text-3xl text-red-400">
              error
            </span>

            <p class="mt-2 text-sm font-bold text-stone-700 dark:text-stone-300">
              Failed to load requests
            </p>

            <p class="mt-1 text-xs text-stone-500">
              ${this.escapeHtml(error.message)}
            </p>

            <button
              onclick="RaahiAdmin.loadRequests('${status}')"
              class="mt-4 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold">
              Try Again
            </button>
          </div>
        `;
      }

    } finally {

      this.setLoading(false);
    }
  },


  // =========================================================================
  // RENDER REQUEST LIST
  // =========================================================================

  renderRequests() {

    const list =
      document.getElementById(
        'admin-request-list'
      );

    const empty =
      document.getElementById(
        'admin-request-empty'
      );

    if (!list) return;

    const requests =
      this.requests[this.activeFilter] || [];

    if (!requests.length) {

      list.innerHTML = '';

      if (empty) {
        empty.classList.remove('hidden');
      }

      return;
    }

    if (empty) {
      empty.classList.add('hidden');
    }

    list.innerHTML =
      requests
        .map(request =>
          this.renderRequestCard(request)
        )
        .join('');
  },


  // =========================================================================
  // REQUEST CARD
  // =========================================================================

  renderRequestCard(request) {

    const requester =
      request.submittedBy || {};

    const requesterName =
      requester.fullName ||
      requester.username ||
      'Unknown user';

    const requesterEmail =
      requester.email ||
      '';

    const requestId =
      request.requestId ||
      request._id ||
      'Unknown';

    const requestType =
      request.requestType ||
      'Unknown';

    const resourceType =
      request.resourceType ||
      'Unknown';

    const reason =
      request.reason ||
      'No reason provided';

    const createdAt =
      this.formatDate(request.createdAt);

    const status =
      request.status || 'Pending';

    const statusClass =
      status === 'Approved'
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
        : status === 'Rejected'
        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';

    const actionButtons =
      status === 'Pending'
        ? `
          <div class="flex flex-wrap items-center gap-2">

            <button
              onclick="RaahiAdmin.openRequestDetails('${this.escapeAttr(request._id)}')"
              class="px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-[11px] font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all">
              View Details
            </button>

            <button
              onclick="RaahiAdmin.approveChange('${this.escapeAttr(request._id)}')"
              class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all">
              ✓ Approve
            </button>

            <button
              onclick="RaahiAdmin.rejectChange('${this.escapeAttr(request._id)}')"
              class="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-all">
              ✕ Reject
            </button>

          </div>
        `
        : `
          <button
            onclick="RaahiAdmin.openRequestDetails('${this.escapeAttr(request._id)}')"
            class="px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-[11px] font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all">
            View Details
          </button>
        `;

    return `
      <div
        class="p-5 sm:p-6 hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-all">

        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

          <div class="min-w-0 flex-1">

            <div class="flex flex-wrap items-center gap-2 mb-2">

              <span class="font-mono text-[11px] font-bold text-stone-500">
                ${this.escapeHtml(requestId)}
              </span>

              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">
                ${this.escapeHtml(status)}
              </span>

            </div>


            <div class="flex flex-wrap items-center gap-2 text-xs mb-3">

              <span class="font-bold text-stone-900 dark:text-white">
                ${this.escapeHtml(requestType)}
              </span>

              <span class="text-stone-300">•</span>

              <span class="font-semibold text-amber-600">
                ${this.escapeHtml(resourceType)}
              </span>

              ${
                request.resourceId
                  ? `
                    <span class="text-stone-300">•</span>
                    <span class="font-mono text-stone-500">
                      ${this.escapeHtml(request.resourceId)}
                    </span>
                  `
                  : ''
              }

            </div>


            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

              <div>
                <span class="block text-[10px] uppercase font-bold text-stone-400">
                  Submitted By
                </span>

                <span class="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  ${this.escapeHtml(requesterName)}
                </span>

                ${
                  requesterEmail
                    ? `
                      <span class="block text-[10px] text-stone-400">
                        ${this.escapeHtml(requesterEmail)}
                      </span>
                    `
                    : ''
                }
              </div>


              <div>
                <span class="block text-[10px] uppercase font-bold text-stone-400">
                  Submitted
                </span>

                <span class="text-xs text-stone-600 dark:text-stone-400">
                  ${this.escapeHtml(createdAt)}
                </span>
              </div>

            </div>


            <div
              class="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700">

              <span class="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                Reason
              </span>

              <p class="text-xs text-stone-700 dark:text-stone-300 line-clamp-2">
                ${this.escapeHtml(reason)}
              </p>

            </div>

          </div>


          <div class="lg:pt-1 shrink-0">
            ${actionButtons}
          </div>

        </div>

      </div>
    `;
  },


  // =========================================================================
  // OPEN FULL REQUEST DETAILS
  // =========================================================================

  async openRequestDetails(requestId) {

    if (!requestId) return;

    let request =
      Object.values(this.requests)
        .flat()
        .find(item =>
          item._id === requestId
        );

    try {

      const response =
        await RaahiAPI.getAdminChangeRequest(
          requestId
        );

      if (
        response &&
        response.success &&
        response.data
      ) {
        request = response.data;
      }

    } catch (error) {

      console.warn(
        '[RaahiAdmin] Could not fetch full request:',
        error
      );
    }

    if (!request) {
      if (typeof RaahiApp !== 'undefined') {
        RaahiApp.showToast(
          'Change request not found',
          'error'
        );
      }
      return;
    }

    this.activeReviewItem = request;

    const modal =
      document.getElementById(
        'admin-diff-modal'
      );

    const content =
      document.getElementById(
        'admin-diff-modal-content'
      );

    if (!modal || !content) return;

    content.innerHTML =
      this.renderRequestDetails(request);

    modal.classList.remove('hidden');

    document.body.style.overflow = 'hidden';
  },


  // =========================================================================
  // FULL REQUEST DETAILS
  // =========================================================================

  renderRequestDetails(request) {

    const requester =
      request.submittedBy || {};

    const status =
      request.status || 'Pending';

    const changes =
      Array.isArray(request.changes)
        ? request.changes
        : [];

    const submittedData =
      request.submittedData;

    const evidence =
      Array.isArray(request.evidence)
        ? request.evidence
        : [];

    return `
      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900">

        <!-- Header -->

        <div class="flex items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">

          <div>

            <div class="flex flex-wrap items-center gap-2 mb-2">

              <span class="font-mono text-[10px] font-bold text-amber-600">
                ${this.escapeHtml(request.requestId || request._id)}
              </span>

              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold
                ${
                  status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'Rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }">
                ${this.escapeHtml(status)}
              </span>

            </div>

            <h3 class="font-heading text-xl font-bold text-stone-900 dark:text-white">
              ${this.escapeHtml(request.requestType || 'Request')}
              •
              ${this.escapeHtml(request.resourceType || 'Resource')}
            </h3>

          </div>


          <button
            onclick="RaahiAdmin.closeDiffModal()"
            class="w-8 h-8 shrink-0 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">

            <span class="material-symbols-outlined text-base">
              close
            </span>

          </button>

        </div>


        <!-- Requester -->

        <section>

          <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
            Requester
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

            ${this.detailBox(
              'Full Name',
              requester.fullName || '—'
            )}

            ${this.detailBox(
              'Username',
              requester.username || '—'
            )}

            ${this.detailBox(
              'Email',
              requester.email || '—'
            )}

          </div>

        </section>


        <!-- Request information -->

        <section>

          <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
            Request Information
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

            ${this.detailBox(
              'Request Type',
              request.requestType || '—'
            )}

            ${this.detailBox(
              'Resource Type',
              request.resourceType || '—'
            )}

            ${this.detailBox(
              'Resource ID',
              request.resourceId || 'Not applicable'
            )}

            ${this.detailBox(
              'Submitted',
              this.formatDate(request.createdAt)
            )}

          </div>

        </section>


        <!-- Reason -->

        <section>

          <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
            Reason / Rationale
          </h4>

          <div class="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">

            <p class="text-xs leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
              ${this.escapeHtml(request.reason || 'No reason provided')}
            </p>

          </div>

        </section>


        <!-- Changes -->

        ${
          changes.length
            ? `
              <section>

                <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Proposed Changes
                </h4>

                <div class="space-y-3">

                  ${changes.map(change => `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

                      <div class="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">

                        <span class="block text-[10px] font-bold uppercase text-red-600 mb-1">
                          ${this.escapeHtml(change.field || 'Field')} — Current
                        </span>

                        <pre class="text-xs whitespace-pre-wrap break-words text-stone-700 dark:text-stone-300">${this.escapeHtml(this.formatValue(change.oldValue))}</pre>

                      </div>

                      <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">

                        <span class="block text-[10px] font-bold uppercase text-emerald-600 mb-1">
                          ${this.escapeHtml(change.field || 'Field')} — Proposed
                        </span>

                        <pre class="text-xs whitespace-pre-wrap break-words text-stone-700 dark:text-stone-300">${this.escapeHtml(this.formatValue(change.newValue))}</pre>

                      </div>

                    </div>
                  `).join('')}

                </div>

              </section>
            `
            : ''
        }


        <!-- Submitted data -->

        ${
          submittedData
            ? `
              <section>

                <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Submitted Data
                </h4>

                <pre class="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs whitespace-pre-wrap break-words overflow-x-auto text-stone-700 dark:text-stone-300">${this.escapeHtml(this.formatValue(submittedData))}</pre>

              </section>
            `
            : ''
        }


        <!-- Evidence -->

        ${
          evidence.length
            ? `
              <section>

                <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Evidence
                </h4>

                <div class="space-y-2">

                  ${evidence.map((item, index) => `
                    <div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">

                      <span class="text-[10px] font-bold text-stone-400">
                        Evidence ${index + 1}
                      </span>

                      <p class="mt-1 text-xs break-all text-stone-700 dark:text-stone-300">
                        ${this.escapeHtml(String(item))}
                      </p>

                    </div>
                  `).join('')}

                </div>

              </section>
            `
            : ''
        }


        <!-- Review information -->

        ${
          status !== 'Pending'
            ? `
              <section>

                <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Review Information
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  ${this.detailBox(
                    'Reviewed At',
                    this.formatDate(request.reviewedAt)
                  )}

                  ${this.detailBox(
                    'Admin Note',
                    request.adminNote || 'No admin note'
                  )}

                </div>

              </section>
            `
            : ''
        }


        <!-- Actions -->

        ${
          status === 'Pending'
            ? `
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">

                <button
                  onclick="RaahiAdmin.rejectChange('${this.escapeAttr(request._id)}')"
                  class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors">
                  ✕ Reject Request
                </button>

                <button
                  onclick="RaahiAdmin.approveChange('${this.escapeAttr(request._id)}')"
                  class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors">
                  ✓ Approve & Apply
                </button>

              </div>
            `
            : ''
        }

      </div>
    `;
  },


  // =========================================================================
  // APPROVE
  // =========================================================================

  async approveChange(requestId) {

    if (!requestId) return;

    const confirmed =
      window.confirm(
        'Approve this change request? The backend will apply the requested change.'
      );

    if (!confirmed) return;

    try {

      const response =
        await RaahiAPI.approveChangeRequest(
          requestId
        );

      if (!response || !response.success) {
        throw new Error(
          response?.message ||
          'Failed to approve request'
        );
      }

      this.closeDiffModal();

      if (typeof RaahiApp !== 'undefined') {
        RaahiApp.showToast(
          response.message ||
          'Change request approved successfully',
          'success'
        );
      }

      await this.refreshAfterAction();

    } catch (error) {

      console.error(
        '[RaahiAdmin] Approve failed:',
        error
      );

      if (typeof RaahiApp !== 'undefined') {
        RaahiApp.showToast(
          error.message ||
          'Failed to approve request',
          'error'
        );
      }
    }
  },


  // =========================================================================
  // REJECT
  // =========================================================================

  async rejectChange(requestId) {

    if (!requestId) return;

    const adminNote =
      window.prompt(
        'Optional rejection note:',
        ''
      );

    if (adminNote === null) {
      return;
    }

    try {

      const response =
        await RaahiAPI.rejectChangeRequest(
          requestId,
          adminNote
        );

      if (!response || !response.success) {
        throw new Error(
          response?.message ||
          'Failed to reject request'
        );
      }

      this.closeDiffModal();

      if (typeof RaahiApp !== 'undefined') {
        RaahiApp.showToast(
          response.message ||
          'Change request rejected',
          'success'
        );
      }

      await this.refreshAfterAction();

    } catch (error) {

      console.error(
        '[RaahiAdmin] Reject failed:',
        error
      );

      if (typeof RaahiApp !== 'undefined') {
        RaahiApp.showToast(
          error.message ||
          'Failed to reject request',
          'error'
        );
      }
    }
  },


  // =========================================================================
  // REFRESH AFTER APPROVE / REJECT
  // =========================================================================

  async refreshAfterAction() {

    await this.loadStats();

    // Reload currently visible list
    await this.loadRequests(
      this.activeFilter
    );

    // Refresh the other lists if they were already loaded
    for (const status of [
      'Pending',
      'Approved',
      'Rejected'
    ]) {

      if (status !== this.activeFilter) {
        this.requests[status] = [];
      }
    }
  },


  // =========================================================================
  // MODAL
  // =========================================================================

  closeDiffModal() {

    const modal =
      document.getElementById(
        'admin-diff-modal'
      );

    if (modal) {
      modal.classList.add('hidden');
    }

    document.body.style.overflow = '';
    this.activeReviewItem = null;
  },


  // =========================================================================
  // LOADING
  // =========================================================================

  setLoading(isLoading) {

    const loading =
      document.getElementById(
        'admin-request-loading'
      );

    const list =
      document.getElementById(
        'admin-request-list'
      );

    if (loading) {
      loading.classList.toggle(
        'hidden',
        !isLoading
      );
    }

    if (isLoading && list) {
      list.innerHTML = '';
    }
  },


  // =========================================================================
  // HELPERS
  // =========================================================================

  detailBox(label, value) {

    return `
      <div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">

        <span class="block text-[10px] uppercase font-bold text-stone-400 mb-1">
          ${this.escapeHtml(label)}
        </span>

        <span class="block text-xs font-semibold text-stone-700 dark:text-stone-300 break-words">
          ${this.escapeHtml(String(value ?? '—'))}
        </span>

      </div>
    `;
  },


  formatValue(value) {

    if (value === null || value === undefined) {
      return '—';
    }

    if (typeof value === 'object') {

      try {
        return JSON.stringify(
          value,
          null,
          2
        );
      } catch {
        return String(value);
      }
    }

    return String(value);
  },


  formatDate(value) {

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  },


  escapeHtml(value) {

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },


  escapeAttr(value) {
    return this.escapeHtml(value);
  },


  renderCharts() {
    // Reserved for future backend metrics.
  }

};


if (typeof window !== 'undefined') {
  window.RaahiAdmin = RaahiAdmin;
}