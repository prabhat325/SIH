/**
 * RAAHI — Tourist Places Controller
 * Filters by State, Category, Rating, Accessibility, and Search Query.
 * Rich Place Detail Modal with About, History, Timings, Entry Fee, Facilities, Accessibility, Reviews & Suggest a Change.
 */

const RaahiPlaces = {
  currentFilter: 'all',
  stateFilter: 'all',
  ratingFilter: 'all',
  accessibilityFilter: false,
  searchQuery: '',

  init() {
    this.bindEvents();
    this.renderPlaces();
  },

  bindEvents() {
    // Category chips
    document.querySelectorAll('.places-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.places-cat-btn').forEach(b => {
          b.classList.remove('bg-amber-600', 'text-white');
          b.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        });
        btn.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        btn.classList.add('bg-amber-600', 'text-white');
        this.currentFilter = btn.getAttribute('data-cat') || 'all';
        this.renderPlaces();
      });
    });

    // State filter dropdown
    const stateSelect = document.getElementById('places-state-filter');
    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        this.stateFilter = e.target.value;
        this.renderPlaces();
      });
    }

    // Rating filter dropdown
    const ratingSelect = document.getElementById('places-rating-filter');
    if (ratingSelect) {
      ratingSelect.addEventListener('change', (e) => {
        this.ratingFilter = e.target.value;
        this.renderPlaces();
      });
    }

    // Search input
    const searchInput = document.getElementById('places-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderPlaces();
      });
    }
  },

  getFilteredPlaces() {
    if (!RAAHI_DATA.places) return [];

    return RAAHI_DATA.places.filter(place => {
      // Category filter
      if (this.currentFilter !== 'all' && place.category.toLowerCase() !== this.currentFilter.toLowerCase()) {
        return false;
      }

      // State filter
      if (this.stateFilter !== 'all' && place.state !== this.stateFilter && place.city !== this.stateFilter) {
        return false;
      }

      // Rating filter
      if (this.ratingFilter !== 'all') {
        const minRating = parseFloat(this.ratingFilter);
        if (place.rating < minRating) return false;
      }

      // Search Query
      if (this.searchQuery) {
        const queryMatch = place.name.toLowerCase().includes(this.searchQuery) ||
                           place.city.toLowerCase().includes(this.searchQuery) ||
                           place.state.toLowerCase().includes(this.searchQuery) ||
                           place.description.toLowerCase().includes(this.searchQuery);
        if (!queryMatch) return false;
      }

      return true;
    });
  },

  renderPlaces() {
    const container = document.getElementById('places-grid-container');
    const countBadge = document.getElementById('places-count-badge');
    if (!container) return;

    const list = this.getFilteredPlaces();

    if (countBadge) {
      countBadge.textContent = `${list.length} Places Found`;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600 mb-3 block">travel_explore</span>
          <h3 class="font-heading text-lg font-bold text-stone-700 dark:text-stone-300">No tourist places found</h3>
          <p class="text-xs text-stone-500 mt-1 max-w-sm mx-auto">Try loosening your search filters or resetting your state selection.</p>
          <button onclick="RaahiPlaces.resetFilters()" class="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(place => {
      const isSaved = typeof RaahiAuth !== 'undefined' && RaahiAuth.isSaved(place.id);
      return `
        <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
          <!-- Card Image & Badges -->
          <div class="relative h-56 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img src="${place.image}" alt="${place.name}" loading="lazy" class="w-full h-full object-cover img-zoom">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <!-- Category & State Badge -->
            <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                ${place.category}
              </span>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                ${place.city}
              </span>
            </div>

            <!-- Bookmark / Save Button -->
            <button onclick="RaahiAuth.toggleSave('${place.id}')" title="Save to Journey Collection" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-all z-10 shadow-sm">
              <span class="material-symbols-outlined text-base ${isSaved ? 'text-amber-600 fill-current' : ''}">
                ${isSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>

            <!-- Bottom Content Overlay -->
            <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
                  <span class="material-symbols-outlined text-sm">star</span>
                  ${place.rating} (${place.reviewsCount})
                </span>
                <span class="text-[11px] text-stone-300 font-medium">
                  ${place.state}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                ${place.name}
              </h3>
              <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
                ${place.description}
              </p>
            </div>

            <!-- Card Bottom Meta & CTA -->
            <div>
              <div class="flex items-center justify-between py-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3">
                <span class="flex items-center gap-1 truncate max-w-[180px]">
                  <span class="material-symbols-outlined text-sm text-stone-400">schedule</span>
                  ${place.openingHours.split('(')[0]}
                </span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">
                  ${place.entryFee.split(',')[0]}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button onclick="RaahiPlaces.openDetailModal('${place.id}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all text-center flex items-center justify-center gap-1">
                  <span>View Details</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button onclick="RaahiCommunity.openSuggestModal('${place.id}', 'place', '${place.name}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all text-center flex items-center justify-center gap-1">
                  <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                  <span>Suggest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  resetFilters() {
    this.currentFilter = 'all';
    this.stateFilter = 'all';
    this.ratingFilter = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('places-search-input');
    if (searchInput) searchInput.value = '';
    const stateSelect = document.getElementById('places-state-filter');
    if (stateSelect) stateSelect.value = 'all';
    const ratingSelect = document.getElementById('places-rating-filter');
    if (ratingSelect) ratingSelect.value = 'all';
    this.renderPlaces();
  },

  openDetailModal(placeId) {
    const place = RAAHI_DATA.places.find(p => p.id === placeId);
    if (!place) return;

    const modal = document.getElementById('place-detail-modal');
    const content = document.getElementById('place-modal-content');
    if (!modal || !content) return;

    const isSaved = typeof RaahiAuth !== 'undefined' && RaahiAuth.isSaved(place.id);

    content.innerHTML = `
      <!-- Modal Header Gallery -->
      <div class="relative h-72 sm:h-96 w-full overflow-hidden bg-stone-900">
        <img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        <!-- Close Button -->
        <button onclick="RaahiPlaces.closeDetailModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>

        <!-- Place Title & Badges in Hero -->
        <div class="absolute bottom-6 left-6 right-6 text-white z-10">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-600 text-white">
              ${place.category}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white">
              ${place.city}, ${place.state}
            </span>
            <span class="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/50 px-2.5 py-1 rounded-full">
              <span class="material-symbols-outlined text-sm">star</span>
              ${place.rating} (${place.reviewsCount} reviews)
            </span>
          </div>
          <h2 class="font-heading text-2xl sm:text-4xl font-extrabold text-white">
            ${place.name}
          </h2>
        </div>
      </div>

      <!-- Modal Body Content -->
      <div class="p-6 sm:p-8 space-y-8 bg-white dark:bg-stone-900">
        <!-- Action Buttons Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div class="flex items-center gap-3">
            <button onclick="RaahiAuth.toggleSave('${place.id}')" class="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold flex items-center gap-2 text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors">
              <span class="material-symbols-outlined text-sm ${isSaved ? 'text-amber-600' : ''}">${isSaved ? 'bookmark_added' : 'bookmark_add'}</span>
              <span>${isSaved ? 'Saved in Collection' : 'Save Place'}</span>
            </button>
            <a href="https://maps.google.com/?q=${place.lat},${place.lng}" target="_blank" class="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-amber-700 transition-colors">
              <span class="material-symbols-outlined text-sm">directions</span>
              <span>Get Directions</span>
            </a>
          </div>
          <button onclick="RaahiPlaces.closeDetailModal(); RaahiCommunity.openSuggestModal('${place.id}', 'place', '${place.name}')" class="px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-2 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors">
            <span class="material-symbols-outlined text-sm">edit_note</span>
            <span>Suggest a Change</span>
          </button>
        </div>

        <!-- Section 1: Overview & History -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div>
              <h4 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-600 text-xl">info</span>
                About the Monument
              </h4>
              <p class="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                ${place.description}
              </p>
            </div>

            <div>
              <h4 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-600 text-xl">history_edu</span>
                Historical Significance
              </h4>
              <p class="text-sm text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800">
                ${place.history}
              </p>
            </div>

            <!-- Facilities & Accessibility -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <h5 class="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  Visitor Facilities
                </h5>
                <ul class="text-xs text-stone-600 dark:text-stone-400 space-y-1">
                  ${place.facilities.map(f => `<li>• ${f}</li>`).join('')}
                </ul>
              </div>
              <div class="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                <h5 class="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">accessible</span>
                  Accessibility Info
                </h5>
                <ul class="text-xs text-stone-600 dark:text-stone-400 space-y-1">
                  <li>• Wheelchair Access: ${place.accessibility.wheelchair ? '✅ Available' : '❌ Limited Stairs'}</li>
                  <li>• Audio Guides: ${place.accessibility.audioGuide ? '✅ Available at Entrance' : '❌ Not Available'}</li>
                  <li>• Senior Citizen Friendly: ${place.accessibility.seniorFriendly ? '✅ Yes' : '⚠️ Moderate Walking'}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Fast Facts Box -->
          <div class="space-y-4">
            <div class="p-5 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4">
              <h4 class="font-heading text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Visitor Key Information
              </h4>

              <div class="border-t border-stone-200 dark:border-stone-700 pt-3">
                <span class="text-[11px] text-stone-500 uppercase font-bold block">Opening Hours</span>
                <span class="text-xs font-semibold text-stone-800 dark:text-stone-200">${place.openingHours}</span>
              </div>

              <div class="border-t border-stone-200 dark:border-stone-700 pt-3">
                <span class="text-[11px] text-stone-500 uppercase font-bold block">Entry Fee</span>
                <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">${place.entryFee}</span>
              </div>

              <div class="border-t border-stone-200 dark:border-stone-700 pt-3">
                <span class="text-[11px] text-stone-500 uppercase font-bold block">Best Time to Visit</span>
                <span class="text-xs font-semibold text-stone-800 dark:text-stone-200">${place.bestTimeToVisit}</span>
              </div>

              <div class="border-t border-stone-200 dark:border-stone-700 pt-3">
                <span class="text-[11px] text-stone-500 uppercase font-bold block">Nearby Attractions</span>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  ${place.nearbyAttractions.map(att => `
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium">${att}</span>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Community Verification Banner -->
            <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
              <span class="material-symbols-outlined text-amber-600 text-2xl block mb-1">verified</span>
              <h6 class="text-xs font-bold text-stone-900 dark:text-white">Help Us Keep Raahi Accurate</h6>
              <p class="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 mb-3">Found incorrect timings or ticket rates? Submit a community change.</p>
              <button onclick="RaahiPlaces.closeDetailModal(); RaahiCommunity.openSuggestModal('${place.id}', 'place', '${place.name}')" class="w-full py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                Suggest Correction
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeDetailModal() {
    const modal = document.getElementById('place-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiPlaces = RaahiPlaces;
}
