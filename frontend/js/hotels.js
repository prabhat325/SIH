/**
 * RAAHI — Hotels & Heritage Stays Discovery Module
 * Strictly for Discovery and Stay Information.
 * NEVER displays booking, reservations, payment, check-in, or checkout.
 */

const RaahiHotels = {
  cityFilter: 'all',
  searchQuery: '',

  init() {
    this.bindEvents();
    this.renderHotels();
  },

  bindEvents() {
    const citySelect = document.getElementById('hotels-city-filter');
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        this.cityFilter = e.target.value;
        this.renderHotels();
      });
    }

    const searchInput = document.getElementById('hotels-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderHotels();
      });
    }
  },

  getFilteredHotels() {
    if (!RAAHI_DATA.hotels) return [];
    return RAAHI_DATA.hotels.filter(hotel => {
      if (this.cityFilter !== 'all' && hotel.city !== this.cityFilter && hotel.state !== this.cityFilter) {
        return false;
      }
      if (this.searchQuery) {
        const match = hotel.name.toLowerCase().includes(this.searchQuery) ||
                      hotel.city.toLowerCase().includes(this.searchQuery) ||
                      hotel.description.toLowerCase().includes(this.searchQuery);
        if (!match) return false;
      }
      return true;
    });
  },

  renderHotels() {
    const container = document.getElementById('hotels-grid-container');
    const countBadge = document.getElementById('hotels-count-badge');
    if (!container) return;

    const list = this.getFilteredHotels();
    if (countBadge) countBadge.textContent = `${list.length} Verified Stays Found`;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600 mb-3 block">hotel</span>
          <h3 class="font-heading text-lg font-bold text-stone-700 dark:text-stone-300">No hotels found</h3>
          <p class="text-xs text-stone-500 mt-1">Try selecting a different city or clearing your search keywords.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(hotel => {
      const isSaved = typeof RaahiAuth !== 'undefined' && RaahiAuth.isSaved(hotel.id);
      const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(hotel, hotel.city) : `https://maps.google.com/?q=${encodeURIComponent(hotel.name + ', ' + (hotel.location || hotel.city))}`;
      return `
        <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
          <!-- Card Image & Price Tier Badge -->
          <div class="relative h-56 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img src="${hotel.image}" alt="${hotel.name}" loading="lazy" class="w-full h-full object-cover img-zoom">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                ${hotel.city}
              </span>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                ${hotel.priceTier}
              </span>
            </div>

            <button onclick="RaahiAuth.toggleSave('${hotel.id}')" title="Save Stay" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-all z-10 shadow-sm">
              <span class="material-symbols-outlined text-base ${isSaved ? 'text-amber-600 fill-current' : ''}">
                ${isSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>

            <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
                  <span class="material-symbols-outlined text-sm">star</span>
                  ${hotel.rating} (${hotel.reviewsCount} reviews)
                </span>
                <span class="text-[11px] text-stone-300 font-medium">${hotel.state}</span>
              </div>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                ${hotel.name}
              </h3>
              <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                ${hotel.description}
              </p>

              <!-- Amenities Pills -->
              <div class="flex flex-wrap gap-1 mb-4">
                ${hotel.amenities.slice(0, 3).map(am => `
                  <span class="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    ${am}
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Footer & Actions (Strictly Info - No Booking) -->
            <div>
              <div class="py-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3 flex items-center justify-between">
                <span class="truncate flex items-center mr-2">
                  <span class="material-symbols-outlined text-xs align-middle text-amber-600 mr-1 shrink-0">location_on</span>
                  <span class="truncate">${hotel.location}</span>
                </span>
                <a href="${directionsUrl}" target="_blank" class="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 flex items-center gap-0.5" title="Get Directions on Google Maps">
                  <span class="material-symbols-outlined text-xs">directions</span>
                  <span>Directions</span>
                </a>
              </div>

              <div class="grid grid-cols-12 gap-2">
                <button onclick="RaahiHotels.openHotelModal('${hotel.id}')" class="col-span-7 py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm">
                  <span>Stay Info</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <a href="${directionsUrl}" target="_blank" class="col-span-3 py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm" title="Get Directions">
                  <span class="material-symbols-outlined text-sm">directions</span>
                  <span class="hidden sm:inline text-[11px]">Map</span>
                </a>
                <button onclick="RaahiCommunity.openSuggestModal('${hotel.id}', 'hotel', '${hotel.name}')" class="col-span-2 py-2.5 px-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center border border-stone-200 dark:border-stone-700" title="Suggest a Change">
                  <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openHotelModal(hotelId) {
    const hotel = RAAHI_DATA.hotels.find(h => h.id === hotelId);
    if (!hotel) return;

    const modal = document.getElementById('hotel-detail-modal');
    const content = document.getElementById('hotel-modal-content');
    if (!modal || !content) return;

    const isSaved = typeof RaahiAuth !== 'undefined' && RaahiAuth.isSaved(hotel.id);
    const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(hotel, hotel.city) : `https://maps.google.com/?q=${encodeURIComponent(hotel.name + ', ' + (hotel.location || hotel.city))}`;

    content.innerHTML = `
      <div class="relative h-72 w-full overflow-hidden bg-stone-900">
        <img src="${hotel.image}" alt="${hotel.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        <button onclick="RaahiHotels.closeHotelModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>

        <div class="absolute bottom-6 left-6 right-6 text-white z-10">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white">${hotel.priceTier}</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white">${hotel.city}, ${hotel.state}</span>
            <span class="text-amber-400 text-xs font-bold bg-black/50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">star</span>
              ${hotel.rating} (${hotel.reviewsCount} reviews)
            </span>
          </div>
          <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-white">${hotel.name}</h2>
        </div>
      </div>

      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900">
        <!-- Action Buttons Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-stone-200 dark:border-stone-800">
          <div class="flex flex-wrap items-center gap-3">
            <button onclick="RaahiAuth.toggleSave('${hotel.id}')" class="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold flex items-center gap-2 text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors">
              <span class="material-symbols-outlined text-sm ${isSaved ? 'text-amber-600 fill-current' : ''}">${isSaved ? 'bookmark_added' : 'bookmark_add'}</span>
              <span>${isSaved ? 'Saved in Collection' : 'Save Stay'}</span>
            </button>
            <a href="${directionsUrl}" target="_blank" class="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20">
              <span class="material-symbols-outlined text-sm">directions</span>
              <span>Get Directions</span>
            </a>
          </div>
          <button onclick="RaahiHotels.closeHotelModal(); RaahiCommunity.openSuggestModal('${hotel.id}', 'hotel', '${hotel.name}')" class="px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-2 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors">
            <span class="material-symbols-outlined text-sm">edit_note</span>
            <span>Suggest a Change</span>
          </button>
        </div>

        <!-- Strictly Discovery Disclaimer Banner -->
        <div class="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2.5">
          <span class="material-symbols-outlined text-amber-600 text-lg">info</span>
          <span>Raahi is a cultural discovery platform. Please contact the property desk directly for availability and stay information.</span>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-lg">hotel</span>
            About the Property
          </h4>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${hotel.description}</p>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-lg">room_service</span>
            Stay Amenities & Facilities
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${hotel.amenities.map(am => `
              <div class="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-200 dark:border-stone-700">
                <span class="material-symbols-outlined text-sm text-emerald-600">check</span>
                <span>${am}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dedicated Section: Location, Map & Directions -->
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
                <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Full Address</span>
                <p class="font-semibold text-stone-800 dark:text-stone-200">${hotel.location}</p>
              </div>
              <button onclick="RaahiApp.copyToClipboard('${hotel.location.replace(/'/g, "\\'")}', 'Hotel Address')" class="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center gap-1 shrink-0" title="Copy Address">
                <span class="material-symbols-outlined text-sm">content_copy</span>
                <span>Copy</span>
              </button>
            </div>

            <!-- Transit & Connectivity Overview -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                <span class="material-symbols-outlined text-amber-600 text-lg">flight</span>
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">Airport Transit</span>
                  <span class="text-xs font-bold text-stone-800 dark:text-stone-200">~25-45 mins</span>
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                <span class="material-symbols-outlined text-amber-600 text-lg">train</span>
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">Main Station</span>
                  <span class="text-xs font-bold text-stone-800 dark:text-stone-200">~15-25 mins</span>
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5">
                <span class="material-symbols-outlined text-amber-600 text-lg">local_taxi</span>
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">Local Cabs & Auto</span>
                  <span class="text-xs font-bold text-emerald-600">Available 24x7</span>
                </div>
              </div>
            </div>

            ${hotel.nearbyPlaces && hotel.nearbyPlaces.length ? `
              <div class="pt-2">
                <span class="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">Proximity to Key Heritage Spots:</span>
                <div class="flex flex-wrap gap-1.5">
                  ${hotel.nearbyPlaces.map(np => `
                    <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[11px] flex items-center gap-1">
                      <span class="material-symbols-outlined text-xs text-amber-600">near_me</span>
                      ${np}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-800 pt-5">
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Direct Contact & Desk</span>
            <span class="text-xs font-bold text-stone-900 dark:text-white">${hotel.contact}</span>
          </div>
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Destination</span>
            <span class="text-xs text-stone-700 dark:text-stone-300">${hotel.city}, ${hotel.state}</span>
          </div>
        </div>

        <div class="border-t border-stone-200 dark:border-stone-800 pt-5 flex items-center justify-between">
          <a href="${directionsUrl}" target="_blank" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs">
            <span class="material-symbols-outlined text-sm">directions</span>
            <span>Get Directions</span>
          </a>
          <button onclick="RaahiHotels.closeHotelModal()" class="px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeHotelModal() {
    const modal = document.getElementById('hotel-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
};

if (typeof window !== 'undefined') {
  window.RaahiHotels = RaahiHotels;
}
