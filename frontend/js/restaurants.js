/**
 * RAAHI — Restaurants & Culinary Guide Discovery Module
 * Strictly for Food & Restaurant Discovery.
 * NEVER displays table reservations, booking, or payments.
 */

const RaahiRestaurants = {
  cuisineFilter: 'all',
  searchQuery: '',

  init() {
    this.bindEvents();
    this.renderRestaurants();
  },

  bindEvents() {
    document.querySelectorAll('.rest-cuisine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.rest-cuisine-btn').forEach(b => {
          b.classList.remove('bg-amber-600', 'text-white');
          b.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        });
        btn.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        btn.classList.add('bg-amber-600', 'text-white');
        this.cuisineFilter = btn.getAttribute('data-cuisine') || 'all';
        this.renderRestaurants();
      });
    });

    const searchInput = document.getElementById('restaurants-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderRestaurants();
      });
    }
  },

  getFilteredRestaurants() {
    if (!RAAHI_DATA.restaurants) return [];
    return RAAHI_DATA.restaurants.filter(rest => {
      if (this.cuisineFilter !== 'all' && !rest.cuisine.toLowerCase().includes(this.cuisineFilter.toLowerCase())) {
        return false;
      }
      if (this.searchQuery) {
        const match = rest.name.toLowerCase().includes(this.searchQuery) ||
                      rest.city.toLowerCase().includes(this.searchQuery) ||
                      rest.cuisine.toLowerCase().includes(this.searchQuery) ||
                      rest.specialties.some(s => s.toLowerCase().includes(this.searchQuery));
        if (!match) return false;
      }
      return true;
    });
  },

  renderRestaurants() {
    const container = document.getElementById('restaurants-grid-container');
    const countBadge = document.getElementById('restaurants-count-badge');
    if (!container) return;

    const list = this.getFilteredRestaurants();
    if (countBadge) countBadge.textContent = `${list.length} Culinary Spots`;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600 mb-3 block">restaurant</span>
          <h3 class="font-heading text-lg font-bold text-stone-700 dark:text-stone-300">No restaurants found</h3>
          <p class="text-xs text-stone-500 mt-1">Try selecting a different cuisine or clearing your search term.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(rest => {
      const isSaved = typeof RaahiAuth !== 'undefined' && RaahiAuth.isSaved(rest.id);
      const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(rest, rest.city) : `https://maps.google.com/?q=${encodeURIComponent(rest.name + ', ' + (rest.location || rest.city))}`;
      return `
        <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
          <div class="relative h-56 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img src="${rest.image}" alt="${rest.name}" loading="lazy" class="w-full h-full object-cover img-zoom">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                ${rest.city}
              </span>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                ${rest.priceRange.split('(')[0]}
              </span>
            </div>

            <button onclick="RaahiAuth.toggleSave('${rest.id}')" title="Save Restaurant" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-all z-10 shadow-sm">
              <span class="material-symbols-outlined text-base ${isSaved ? 'text-amber-600 fill-current' : ''}">
                ${isSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>

            <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
                  <span class="material-symbols-outlined text-sm">star</span>
                  ${rest.rating} (${rest.reviewsCount} reviews)
                </span>
                <span class="text-[11px] text-amber-300 font-bold">${rest.cuisine}</span>
              </div>
            </div>
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                ${rest.name}
              </h3>
              <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                ${rest.description}
              </p>

              <!-- Must Try Specialties -->
              <div class="mb-4">
                <span class="text-[10px] font-bold uppercase text-amber-600 tracking-wider block mb-1">Must-Try Specialties</span>
                <div class="flex flex-wrap gap-1">
                  ${rest.specialties.slice(0, 3).map(s => `
                    <span class="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold border border-amber-200/60 dark:border-amber-900/40">
                      ${s}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>

            <div>
              <div class="py-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3 flex items-center justify-between">
                <span class="truncate max-w-[170px] flex items-center">
                  <span class="material-symbols-outlined text-xs align-middle text-amber-600 mr-1 shrink-0">location_on</span>
                  <span class="truncate">${rest.location || rest.city}</span>
                </span>
                <a href="${directionsUrl}" target="_blank" class="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 flex items-center gap-0.5" title="Get Directions on Google Maps">
                  <span class="material-symbols-outlined text-xs">directions</span>
                  <span>Directions</span>
                </a>
              </div>

              <div class="grid grid-cols-12 gap-2">
                <button onclick="RaahiRestaurants.openRestModal('${rest.id}')" class="col-span-7 py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm">
                  <span>Dining Info</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <a href="${directionsUrl}" target="_blank" class="col-span-3 py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm" title="Get Directions">
                  <span class="material-symbols-outlined text-sm">directions</span>
                  <span class="hidden sm:inline text-[11px]">Map</span>
                </a>
                <button onclick="RaahiCommunity.openSuggestModal('${rest.id}', 'restaurant', '${rest.name}')" class="col-span-2 py-2.5 px-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center border border-stone-200 dark:border-stone-700" title="Suggest a Change">
                  <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openRestModal(restId) {
    const rest = RAAHI_DATA.restaurants.find(r => r.id === restId);
    if (!rest) return;

    const modal = document.getElementById('restaurant-detail-modal');
    const content = document.getElementById('restaurant-modal-content');
    if (!modal || !content) return;

    const isSaved = typeof RaahiAuth !== 'undefined' && RaahiAuth.isSaved(rest.id);
    const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(rest, rest.city) : `https://maps.google.com/?q=${encodeURIComponent(rest.name + ', ' + (rest.location || rest.city))}`;

    content.innerHTML = `
      <div class="relative h-72 w-full overflow-hidden bg-stone-900">
        <img src="${rest.image}" alt="${rest.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        <button onclick="RaahiRestaurants.closeRestModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>

        <div class="absolute bottom-6 left-6 right-6 text-white z-10">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-600 text-white">${rest.cuisine}</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white">${rest.city}, ${rest.state}</span>
            <span class="text-amber-400 text-xs font-bold bg-black/50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">star</span>
              ${rest.rating} (${rest.reviewsCount} reviews)
            </span>
          </div>
          <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-white">${rest.name}</h2>
        </div>
      </div>

      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900">
        <!-- Action Buttons Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-stone-200 dark:border-stone-800">
          <div class="flex flex-wrap items-center gap-3">
            <button onclick="RaahiAuth.toggleSave('${rest.id}')" class="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold flex items-center gap-2 text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors">
              <span class="material-symbols-outlined text-sm ${isSaved ? 'text-amber-600 fill-current' : ''}">${isSaved ? 'bookmark_added' : 'bookmark_add'}</span>
              <span>${isSaved ? 'Saved in Collection' : 'Save Spot'}</span>
            </button>
            <a href="${directionsUrl}" target="_blank" class="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20">
              <span class="material-symbols-outlined text-sm">directions</span>
              <span>Get Directions</span>
            </a>
          </div>
          <button onclick="RaahiRestaurants.closeRestModal(); RaahiCommunity.openSuggestModal('${rest.id}', 'restaurant', '${rest.name}')" class="px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-2 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors">
            <span class="material-symbols-outlined text-sm">edit_note</span>
            <span>Suggest a Change</span>
          </button>
        </div>

        <div class="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2.5">
          <span class="material-symbols-outlined text-amber-600 text-lg">restaurant</span>
          <span>Raahi provides culinary discovery and menu info. Table reservation/booking is not offered.</span>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-lg">menu_book</span>
            About the Culinary Experience
          </h4>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${rest.description}</p>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-lg">restaurant_menu</span>
            Chef Recommended Dishes
          </h4>
          <div class="grid grid-cols-2 gap-2">
            ${rest.specialties.map(dish => `
              <div class="p-2.5 rounded-xl bg-amber-50/50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 border border-amber-200/50 dark:border-stone-700">
                <span class="material-symbols-outlined text-sm text-amber-600">restaurant_menu</span>
                <span>${dish}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dedicated Section: Location, Getting There & Directions -->
        <div class="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-700">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-600 text-xl">location_on</span>
              <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white">Location &amp; Directions</h4>
            </div>
            <a href="${directionsUrl}" target="_blank" class="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-amber-700 transition-colors w-fit shadow-xs">
              <span class="material-symbols-outlined text-sm">navigation</span>
              <span>Open in Google Maps</span>
            </a>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-start justify-between gap-4 p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800">
              <div>
                <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Dining Address</span>
                <p class="font-semibold text-stone-800 dark:text-stone-200">${rest.location}</p>
              </div>
              <button onclick="RaahiApp.copyToClipboard('${rest.location.replace(/'/g, "\\'")}', 'Restaurant Address')" class="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center gap-1 shrink-0" title="Copy Address">
                <span class="material-symbols-outlined text-sm">content_copy</span>
                <span>Copy</span>
              </button>
            </div>

            <!-- Transit & Dining Access Tips -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                <span class="material-symbols-outlined text-amber-600 text-lg">schedule</span>
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">Service Hours</span>
                  <span class="text-xs font-bold text-stone-800 dark:text-stone-200">${rest.openingHours.split('(')[0]}</span>
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                <span class="material-symbols-outlined text-amber-600 text-lg">local_parking</span>
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">Parking / Auto</span>
                  <span class="text-xs font-bold text-stone-800 dark:text-stone-200">Street / Nearby Stand</span>
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                <span class="material-symbols-outlined text-emerald-600 text-lg">restaurant</span>
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">Dietary</span>
                  <span class="text-xs font-bold text-emerald-600">${(rest.dietaryOptions || [])[0] || 'Vegetarian/Non-Veg'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-800 pt-5">
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Opening Timings</span>
            <span class="text-xs font-bold text-stone-900 dark:text-white">${rest.openingHours}</span>
          </div>
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Direct Contact</span>
            <span class="text-xs text-stone-700 dark:text-stone-300">${rest.contact}</span>
          </div>
        </div>

        <div class="border-t border-stone-200 dark:border-stone-800 pt-5 flex items-center justify-between">
          <a href="${directionsUrl}" target="_blank" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs">
            <span class="material-symbols-outlined text-sm">directions</span>
            <span>Get Directions</span>
          </a>
          <button onclick="RaahiRestaurants.closeRestModal()" class="px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeRestModal() {
    const modal = document.getElementById('restaurant-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
};

if (typeof window !== 'undefined') {
  window.RaahiRestaurants = RaahiRestaurants;
}
