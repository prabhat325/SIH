/**
 * RAAHI — Tourist Places Controller & AI Intelligence Layer
 * Filters by State, Category, Rating, Accessibility, and Search Query.
 * Rich Place Detail Modal with About, History, Timings, Entry Fee, Facilities, Accessibility, Raahi Nearby, Reviews & Suggest a Change.
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
        if (!this.searchQuery) {
          this.clearAISearchBanner();
        }
        this.renderPlaces();
      });
    }
  },

  showAISearchBanner(query) {
    const banner = document.getElementById('places-ai-search-banner');
    const text = document.getElementById('places-ai-search-text');
    if (banner && text) {
      text.textContent = `"I found verified places and monuments matching '${query}'."`;
      banner.classList.remove('hidden');
    }
  },

  clearAISearchBanner() {
    const banner = document.getElementById('places-ai-search-banner');
    if (banner) {
      banner.classList.add('hidden');
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
        const q = this.searchQuery;
        const queryMatch = place.name.toLowerCase().includes(q) ||
                           place.city.toLowerCase().includes(q) ||
                           place.state.toLowerCase().includes(q) ||
                           place.category.toLowerCase().includes(q) ||
                           place.description.toLowerCase().includes(q) ||
                           (place.tags && place.tags.some(t => t.toLowerCase().includes(q))) ||
                           (place.aiReason && place.aiReason.toLowerCase().includes(q));
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
      const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(place, place.city) : `https://maps.google.com/?q=${place.lat},${place.lng}`;
      return `
        <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
          <!-- Card Image & Badges -->
          <div class="relative h-56 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img src="${place.image}" alt="${place.name}" loading="lazy" class="w-full h-full object-cover img-zoom">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                ${place.category}
              </span>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                ${place.city}
              </span>
              ${place.aiPick ? `
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-xs">auto_awesome</span>
                  AI Pick
                </span>
              ` : ''}
            </div>

            <!-- Save to Bucket List Button -->
            <button onclick="RaahiAuth.toggleSave('${place.id}')" title="Save to Travel Bag" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-all z-10 shadow-sm">
              <span class="material-symbols-outlined text-base ${isSaved ? 'text-amber-600 fill-current' : ''}">
                ${isSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>

            <!-- Card Bottom Bar: Rating -->
            <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
                  <span class="material-symbols-outlined text-sm">star</span>
                  ${place.rating} (${place.reviewsCount} reviews)
                </span>
                <span class="text-[11px] text-stone-300 font-medium">${place.state}</span>
              </div>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-amber-600 transition-colors">
                ${place.name}
              </h3>
              <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                ${place.description}
              </p>

              <!-- Entry Fee & Timings Badges -->
              <div class="flex items-center justify-between py-2 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-3">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">${place.entryFee}</span>
                <a href="${directionsUrl}" target="_blank" class="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 flex items-center gap-0.5" title="Get Directions on Google Maps">
                  <span class="material-symbols-outlined text-xs">directions</span>
                  <span>Directions</span>
                </a>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
              <button onclick="RaahiPlaces.openDetailModal('${place.id}')" class="col-span-6 py-2 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm">
                <span>Details</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <a href="${directionsUrl}" target="_blank" class="col-span-3 py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm" title="Get Directions">
                <span class="material-symbols-outlined text-sm">directions</span>
                <span class="hidden sm:inline text-[11px]">Map</span>
              </a>
              <button onclick="RaahiPlaces.quickAddToPlan('${place.id}')" class="col-span-3 py-2 px-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-0.5 shadow-sm" title="Add to AI Plan">
                <span class="material-symbols-outlined text-sm">auto_awesome</span>
                <span class="hidden sm:inline text-[10px]">Plan</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  quickAddToPlan(placeId) {
    const place = RAAHI_DATA.places.find(p => p.id === placeId);
    if (!place) return;
    RaahiPlanner.selectQuickDest(place.city);
    RaahiApp.navigate('planner');
    RaahiApp.showToast(`Selected ${place.name} for your AI Journey Plan!`, 'success');
  },

  resetFilters() {
    this.currentFilter = 'all';
    this.stateFilter = 'all';
    this.ratingFilter = 'all';
    this.searchQuery = '';
    this.clearAISearchBanner();
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
    const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(place, place.city) : `https://maps.google.com/?q=${place.lat},${place.lng}`;

    // Find nearby places & dining in the same city for Section 9
    const nearbyPlaces = (RAAHI_DATA.places || []).filter(p => p.id !== place.id && p.city === place.city).slice(0, 2);
    const nearbyDining = (RAAHI_DATA.restaurants || []).filter(r => r.city === place.city).slice(0, 2);

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
          <div class="flex items-center gap-2 mb-2 flex-wrap">
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
          <div class="flex flex-wrap items-center gap-3">
            <button onclick="RaahiAuth.toggleSave('${place.id}')" class="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold flex items-center gap-2 text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors">
              <span class="material-symbols-outlined text-sm ${isSaved ? 'text-amber-600 fill-current' : ''}">${isSaved ? 'bookmark_added' : 'bookmark_add'}</span>
              <span>${isSaved ? 'Saved in Collection' : 'Save Place'}</span>
            </button>
            <a href="${directionsUrl}" target="_blank" class="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20">
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

            <!-- Dedicated Section: How to Reach & Directions -->
            <div class="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-700">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-600 text-xl">location_on</span>
                  <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white">How to Reach &amp; Directions</h4>
                </div>
                <a href="${directionsUrl}" target="_blank" class="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-amber-700 transition-colors w-fit shadow-xs">
                  <span class="material-symbols-outlined text-sm">navigation</span>
                  <span>Navigate in Google Maps</span>
                </a>
              </div>

              <div class="space-y-3 text-xs">
                <div class="flex items-start justify-between gap-4 p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800">
                  <div>
                    <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Location &amp; Coordinates</span>
                    <p class="font-semibold text-stone-800 dark:text-stone-200">${place.name}, ${place.city}, ${place.state} (${place.lat.toFixed(4)}, ${place.lng.toFixed(4)})</p>
                  </div>
                  <button onclick="RaahiApp.copyToClipboard('${place.lat}, ${place.lng}', 'Coordinates')" class="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center gap-1 shrink-0" title="Copy GPS Coordinates">
                    <span class="material-symbols-outlined text-sm">content_copy</span>
                    <span>Copy GPS</span>
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                    <span class="material-symbols-outlined text-amber-600 text-lg">local_taxi</span>
                    <div>
                      <span class="text-[10px] text-stone-400 block font-semibold">City Cabs / E-Rickshaw</span>
                      <span class="text-xs font-bold text-stone-800 dark:text-stone-200">Direct Gate Drop</span>
                    </div>
                  </div>
                  <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                    <span class="material-symbols-outlined text-amber-600 text-lg">train</span>
                    <div>
                      <span class="text-[10px] text-stone-400 block font-semibold">Nearest Railway Hub</span>
                      <span class="text-xs font-bold text-stone-800 dark:text-stone-200">~15-20 mins</span>
                    </div>
                  </div>
                  <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                    <span class="material-symbols-outlined text-emerald-600 text-lg">local_parking</span>
                    <div>
                      <span class="text-[10px] text-stone-400 block font-semibold">Visitor Parking</span>
                      <span class="text-xs font-bold text-emerald-600">Available at Entry</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 9: Near You / Raahi Nearby AI Recommendations -->
            <div class="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-600 text-lg">near_me</span>
                  <h4 class="font-heading text-sm font-bold text-stone-900 dark:text-white">Raahi Nearby Recommendations</h4>
                </div>
                <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Within 2.5 km</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${nearbyPlaces.map(np => `
                  <div onclick="RaahiPlaces.openDetailModal('${np.id}')" class="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 flex items-center gap-3 cursor-pointer hover:border-amber-500 transition-colors">
                    <img src="${np.image}" alt="${np.name}" class="w-12 h-12 rounded-lg object-cover">
                    <div class="truncate">
                      <h5 class="text-xs font-bold text-stone-900 dark:text-white truncate">${np.name}</h5>
                      <span class="text-[10px] text-stone-500">1.2 km • ${np.category}</span>
                    </div>
                  </div>
                `).join('')}
                ${nearbyDining.map(nd => `
                  <div onclick="RaahiPlaces.closeDetailModal(); RaahiRestaurants.openRestModal('${nd.id}')" class="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 flex items-center gap-3 cursor-pointer hover:border-amber-500 transition-colors">
                    <img src="${nd.image}" alt="${nd.name}" class="w-12 h-12 rounded-lg object-cover">
                    <div class="truncate">
                      <h5 class="text-xs font-bold text-stone-900 dark:text-white truncate">${nd.name}</h5>
                      <span class="text-[10px] text-amber-600 font-semibold">2.1 km • ${nd.cuisine}</span>
                    </div>
                  </div>
                `).join('')}
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
