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
              <div class="py-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3 truncate">
                <span class="material-symbols-outlined text-xs align-middle text-amber-600 mr-1">location_on</span>
                ${hotel.location}
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button onclick="RaahiHotels.openHotelModal('${hotel.id}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1">
                  <span>Stay Info</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button onclick="RaahiCommunity.openSuggestModal('${hotel.id}', 'hotel', '${hotel.name}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center gap-1">
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

  openHotelModal(hotelId) {
    const hotel = RAAHI_DATA.hotels.find(h => h.id === hotelId);
    if (!hotel) return;

    const modal = document.getElementById('hotel-detail-modal');
    const content = document.getElementById('hotel-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="relative h-72 w-full overflow-hidden bg-stone-900">
        <img src="${hotel.image}" alt="${hotel.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        <button onclick="RaahiHotels.closeHotelModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>

        <div class="absolute bottom-6 left-6 right-6 text-white z-10">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white">${hotel.priceTier}</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white">${hotel.city}</span>
            <span class="text-amber-400 text-xs font-bold bg-black/50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">star</span>
              ${hotel.rating} (${hotel.reviewsCount} reviews)
            </span>
          </div>
          <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-white">${hotel.name}</h2>
        </div>
      </div>

      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900">
        <!-- Strictly Discovery Disclaimer Banner -->
        <div class="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-600">info</span>
          <span>Raahi is a discovery & planning platform. Please contact the property directly for availability and bookings.</span>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2">About the Property</h4>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${hotel.description}</p>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2">Stay Amenities & Facilities</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${hotel.amenities.map(am => `
              <div class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-200 dark:border-stone-700">
                <span class="material-symbols-outlined text-sm text-emerald-600">check</span>
                <span>${am}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-800 pt-5">
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Direct Contact & Desk</span>
            <span class="text-xs font-bold text-stone-900 dark:text-white">${hotel.contact}</span>
          </div>
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Address</span>
            <span class="text-xs text-stone-700 dark:text-stone-300">${hotel.location}</span>
          </div>
        </div>

        <div class="border-t border-stone-200 dark:border-stone-800 pt-5 flex items-center justify-between">
          <button onclick="RaahiHotels.closeHotelModal(); RaahiCommunity.openSuggestModal('${hotel.id}', 'hotel', '${hotel.name}')" class="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold hover:bg-amber-100 hover:text-amber-800 transition-colors flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
            <span>Suggest a Change</span>
          </button>
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
