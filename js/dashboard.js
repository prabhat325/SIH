/**
 * RAAHI — User Dashboard Module
 * "Welcome back to Raahi"
 * Sections: Stats, Saved Places (My Journey Collection), My Reviews, My Contributions
 */

const RaahiDashboard = {
  activeTab: 'saved',

  init() {
    this.bindEvents();
    this.renderAll();
  },

  bindEvents() {
    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.dash-tab-btn').forEach(b => {
          b.classList.remove('bg-amber-600', 'text-white');
          b.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        });
        btn.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        btn.classList.add('bg-amber-600', 'text-white');
        this.activeTab = btn.getAttribute('data-tab') || 'saved';

        document.querySelectorAll('.dash-tab-pane').forEach(p => p.classList.add('hidden'));
        const pane = document.getElementById(`dash-pane-${this.activeTab}`);
        if (pane) pane.classList.remove('hidden');
      });
    });
  },

  renderAll() {
    this.renderProfileHeader();
    this.renderSavedCollection();
    this.renderReviews();
    this.renderContributions();
  },

  renderProfileHeader() {
    const user = RaahiAuth.currentUser;
    if (!user) return;

    const nameEl = document.getElementById('dash-user-name');
    const emailEl = document.getElementById('dash-user-email');
    const avatarEl = document.getElementById('dash-user-avatar');
    const bioEl = document.getElementById('dash-user-bio');

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.src = user.avatar;
    if (bioEl) bioEl.textContent = user.bio || "Heritage traveler & explorer.";

    // Stats
    const savedCount = RaahiAuth.savedItems ? RaahiAuth.savedItems.length : 0;
    const reviewCount = RaahiAuth.myReviews ? RaahiAuth.myReviews.length : 0;
    const contribCount = RAAHI_DATA.communityChanges ? RAAHI_DATA.communityChanges.length : 0;

    const statSaved = document.getElementById('dash-stat-saved');
    const statReviews = document.getElementById('dash-stat-reviews');
    const statContribs = document.getElementById('dash-stat-contribs');

    if (statSaved) statSaved.textContent = savedCount;
    if (statReviews) statReviews.textContent = reviewCount;
    if (statContribs) statContribs.textContent = contribCount;
  },

  renderSavedCollection() {
    const container = document.getElementById('dash-saved-grid');
    if (!container) return;

    const savedIds = RaahiAuth.savedItems || [];
    if (savedIds.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-stone-500">
          <span class="material-symbols-outlined text-4xl mb-2 block text-stone-300">bookmark_border</span>
          <p class="text-xs font-semibold">Your Journey Collection is currently empty.</p>
          <button onclick="RaahiApp.navigate('places')" class="mt-3 px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700">Explore Places</button>
        </div>
      `;
      return;
    }

    const matchedPlaces = (RAAHI_DATA.places || []).filter(p => savedIds.includes(p.id));
    const matchedHotels = (RAAHI_DATA.hotels || []).filter(h => savedIds.includes(h.id));
    const matchedRestaurants = (RAAHI_DATA.restaurants || []).filter(r => savedIds.includes(r.id));
    const allSaved = [...matchedPlaces, ...matchedHotels, ...matchedRestaurants];

    container.innerHTML = allSaved.map(item => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between p-4">
        <div class="flex items-start gap-3">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
          <div class="flex-1">
            <span class="text-[10px] font-bold text-amber-600 uppercase">${item.city || item.state}</span>
            <h4 class="font-heading text-sm font-bold text-stone-900 dark:text-white line-clamp-1">${item.name}</h4>
            <span class="text-xs text-amber-500 font-bold">★ ${item.rating}</span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <button onclick="RaahiAuth.toggleSave('${item.id}')" class="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">delete</span>
            <span>Remove</span>
          </button>
          <button onclick="${item.category ? `RaahiPlaces.openDetailModal('${item.id}')` : item.cuisine ? `RaahiRestaurants.openRestModal('${item.id}')` : `RaahiHotels.openHotelModal('${item.id}')`}" class="text-xs font-bold text-stone-900 dark:text-white hover:text-amber-600">
            View Details →
          </button>
        </div>
      </div>
    `).join('');
  },

  renderReviews() {
    const container = document.getElementById('dash-reviews-list');
    if (!container) return;

    const reviews = RaahiAuth.myReviews || [];
    if (reviews.length === 0) {
      container.innerHTML = `<div class="py-8 text-center text-xs text-stone-500">No traveler reviews written yet.</div>`;
      return;
    }

    container.innerHTML = reviews.map(rev => `
      <div class="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="font-heading text-sm font-bold text-stone-900 dark:text-white">${rev.resourceName}</h4>
          <span class="text-xs text-stone-400 font-mono">${rev.date}</span>
        </div>
        <div class="flex items-center gap-1 text-amber-500 text-xs">
          ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
        </div>
        <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">${rev.comment}</p>
      </div>
    `).join('');
  },

  renderContributions() {
    const container = document.getElementById('dash-contributions-table-body');
    if (!container || !RAAHI_DATA.communityChanges) return;

    container.innerHTML = RAAHI_DATA.communityChanges.map(c => {
      const statusBadge = c.status === 'Approved'
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Approved</span>'
        : c.status === 'Rejected'
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">Rejected</span>'
        : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Pending Review</span>';

      return `
        <tr class="border-b border-stone-100 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
          <td class="py-3 px-4 font-mono font-bold">${c.id}</td>
          <td class="py-3 px-4 font-bold text-stone-900 dark:text-white">${c.resourceName}</td>
          <td class="py-3 px-4">${c.changeType}</td>
          <td class="py-3 px-4 font-semibold text-amber-700 dark:text-amber-400">${c.field}</td>
          <td class="py-3 px-4 font-mono text-stone-400">${c.date}</td>
          <td class="py-3 px-4">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }
};

if (typeof window !== 'undefined') {
  window.RaahiDashboard = RaahiDashboard;
}
