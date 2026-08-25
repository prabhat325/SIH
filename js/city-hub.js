/**
 * RAAHI — City Destination Travel Hub Module (js/city-hub.js)
 * Transforms any selected Indian city into a complete, unified destination travel hub.
 * 
 * Strict Category Order:
 * 1. 📍 Places to Explore (Attractions, Heritage, Temples, Ghats, Forts, Museums, Hidden Gems)
 * 2. 🏨 Hotels & Stays (Luxury, Mid-Range, Budget, Homestays, Near Attractions)
 * 3. 🍽️ Restaurants & Food (Iconic Dining, Local Cuisine, Cafes, Street Food)
 * 4. 🚗 Vehicles & Transport (Cabs, Car Rentals, Bike Rentals, Auto/E-Rickshaws, Public Transit)
 * 5. 🧑‍🏫 Local Guides (Verified Guides, Local Experts, Language Guides)
 * 6. 🎉 Events & Experiences (Festivals, Cultural Gatherings, Seasonal Experiences)
 * 7. 🚨 Emergency & Tourist Help (Dedicated Safety-First Hub: 112 SOS, Police, Hospitals)
 */

const RaahiCityHub = {
  activeCityId: 'lucknow',
  placesSubFilter: 'all',
  hotelsSubFilter: 'all',
  restaurantsSubFilter: 'all',
  vehiclesSubFilter: 'all',
  searchQuery: '',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('city-hub-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderAllSections();
      });
    }
  },

  getCityData(cityId = this.activeCityId) {
    const norm = (cityId || 'lucknow').toLowerCase().replace(/[^a-z]/g, '');
    const dest = (RAAHI_DATA.destinations || []).find(d => 
      d.id.toLowerCase() === norm || 
      d.name.toLowerCase().includes(norm) ||
      norm.includes(d.id.toLowerCase())
    ) || RAAHI_DATA.destinations[0];
    return dest;
  },

  selectCity(cityId, scroll = true) {
    const dest = this.getCityData(cityId);
    this.activeCityId = dest.id;
    this.placesSubFilter = 'all';
    this.hotelsSubFilter = 'all';
    this.restaurantsSubFilter = 'all';
    this.vehiclesSubFilter = 'all';
    this.searchQuery = '';

    const searchInput = document.getElementById('city-hub-search-input');
    if (searchInput) searchInput.value = '';

    // Switch view to city hub
    RaahiApp.navigate('city', false);
    window.location.hash = `city/${this.activeCityId}`;

    this.renderHero(dest);
    this.updateFilterButtons();
    this.renderAllSections();

    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  setPlacesFilter(subCategory) {
    this.placesSubFilter = subCategory;
    this.updateFilterButtons();
    this.renderPlacesSection();
  },

  setHotelsFilter(type) {
    this.hotelsSubFilter = type;
    this.updateFilterButtons();
    this.renderHotelsSection();
  },

  setRestaurantsFilter(category) {
    this.restaurantsSubFilter = category;
    this.updateFilterButtons();
    this.renderRestaurantsSection();
  },

  setVehiclesFilter(type) {
    this.vehiclesSubFilter = type;
    this.updateFilterButtons();
    this.renderVehiclesSection();
  },

  updateFilterButtons() {
    // Update places filter chips
    document.querySelectorAll('.city-places-filter-btn').forEach(btn => {
      const cat = btn.getAttribute('data-filter');
      if (cat === this.placesSubFilter) {
        btn.className = 'city-places-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-sm transition-colors';
      } else {
        btn.className = 'city-places-filter-btn px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700 transition-colors';
      }
    });

    // Update hotels filter chips
    document.querySelectorAll('.city-hotels-filter-btn').forEach(btn => {
      const type = btn.getAttribute('data-filter');
      if (type === this.hotelsSubFilter) {
        btn.className = 'city-hotels-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm transition-colors';
      } else {
        btn.className = 'city-hotels-filter-btn px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-100 dark:hover:bg-stone-700 transition-colors';
      }
    });

    // Update restaurants filter chips
    document.querySelectorAll('.city-restaurants-filter-btn').forEach(btn => {
      const cat = btn.getAttribute('data-filter');
      if (cat === this.restaurantsSubFilter) {
        btn.className = 'city-restaurants-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm transition-colors';
      } else {
        btn.className = 'city-restaurants-filter-btn px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-100 dark:hover:bg-stone-700 transition-colors';
      }
    });

    // Update vehicles filter chips
    document.querySelectorAll('.city-vehicles-filter-btn').forEach(btn => {
      const type = btn.getAttribute('data-filter');
      if (type === this.vehiclesSubFilter) {
        btn.className = 'city-vehicles-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm transition-colors';
      } else {
        btn.className = 'city-vehicles-filter-btn px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors';
      }
    });
  },

  renderHero(dest) {
    const container = document.getElementById('city-hub-hero-container');
    if (!container) return;

    const xaiSummary = (typeof RaahiDestinations !== 'undefined' && RaahiDestinations.xaiKnowledgeBase && RaahiDestinations.xaiKnowledgeBase[dest.id])
      ? RaahiDestinations.xaiKnowledgeBase[dest.id].summary
      : `Explore verified heritage monuments, authentic culinary lanes, certified guides, and 24x7 tourist safety assistance in ${dest.name}.`;

    const allDestinations = RAAHI_DATA.destinations || [];

    container.innerHTML = `
      <!-- Top City Switcher Pills -->
      <div class="mb-6 flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <span class="text-xs font-extrabold uppercase text-stone-500 dark:text-stone-400 shrink-0 mr-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">location_city</span>
          <span>Select Destination:</span>
        </span>
        ${allDestinations.map(d => `
          <button onclick="RaahiCityHub.selectCity('${d.id}')" class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${d.id === dest.id ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-105' : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750'}">
            <span>${d.name}</span>
            ${d.id === dest.id ? '<span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>' : ''}
          </button>
        `).join('')}
      </div>

      <!-- Hero Banner Card -->
      <div class="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-800">
        <div class="relative h-72 sm:h-96 w-full">
          <img src="${dest.image}" alt="${dest.name}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20"></div>

          <!-- Top Action Badges -->
          <div class="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-600 text-white shadow-sm">
                ${dest.state}
              </span>
              <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                ⭐ 4.9 Raahi Heritage Index
              </span>
            </div>
            <button onclick="RaahiDestinations.openDetailModal('${dest.id}')" class="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1 border border-white/30 shadow-sm" title="Explainable AI Match">
              <span class="material-symbols-outlined text-sm text-amber-300">psychology</span>
              <span class="hidden sm:inline">Why ${dest.name}?</span>
            </button>
          </div>

          <!-- Bottom Hero Title & Tagline -->
          <div class="absolute bottom-6 left-6 right-6 text-white z-10 space-y-2">
            <h1 class="font-heading text-3xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-3">
              <span>${dest.name}</span>
              <span class="text-xs sm:text-sm font-semibold text-amber-300 uppercase tracking-widest hidden sm:inline">Travel Hub</span>
            </h1>
            <p class="text-xs sm:text-base text-amber-200/90 font-medium max-w-2xl">
              ${dest.tagline}
            </p>

            <!-- Quick Metrics Badges Bar -->
            <div class="flex items-center gap-2.5 sm:gap-4 pt-2 flex-wrap text-xs text-stone-200">
              <span class="flex items-center gap-1 font-semibold">
                <span class="material-symbols-outlined text-sm text-amber-400">account_balance</span>
                <span>${dest.attractionsCount || 20}+ Places</span>
              </span>
              <span class="text-stone-500">•</span>
              <span class="flex items-center gap-1 font-semibold">
                <span class="material-symbols-outlined text-sm text-emerald-400">hotel</span>
                <span>${dest.hotelsCount || 35}+ Stays</span>
              </span>
              <span class="text-stone-500">•</span>
              <span class="flex items-center gap-1 font-semibold">
                <span class="material-symbols-outlined text-sm text-rose-400">restaurant</span>
                <span>${dest.restaurantsCount || 50}+ Food Hubs</span>
              </span>
              <span class="text-stone-500">•</span>
              <span class="flex items-center gap-1 font-semibold">
                <span class="material-symbols-outlined text-sm text-blue-400">directions_car</span>
                <span>Transit Guide</span>
              </span>
              <span class="text-stone-500">•</span>
              <span class="flex items-center gap-1 font-bold text-red-400">
                <span class="material-symbols-outlined text-sm">emergency</span>
                <span>24x7 Help (112)</span>
              </span>
            </div>
          </div>
        </div>

        <!-- AI Narrative & Fast Action Bar -->
        <div class="p-5 sm:p-6 bg-stone-900/95 border-t border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p class="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl italic">
            "${xaiSummary}"
          </p>
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="RaahiPlanner.startWithCity('${dest.name}')" class="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">auto_awesome</span>
              <span>AI Trip Plan</span>
            </button>
            <button onclick="RaahiBudgetForecaster.openModal('${dest.name}')" class="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-sm text-amber-400">calculate</span>
              <span>Forecast Budget</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sticky Category Jump Navigation Bar (7 Categories in Exact Order) -->
      <div class="sticky top-20 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md py-3 border-b border-stone-200 dark:border-stone-800 my-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-sm">
        <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button onclick="RaahiCityHub.jumpToSection('city-sec-places')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shrink-0 transition-colors">
            <span class="material-symbols-outlined text-sm text-amber-600">account_balance</span>
            <span>1. Places to Explore</span>
          </button>

          <button onclick="RaahiCityHub.jumpToSection('city-sec-hotels')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shrink-0 transition-colors">
            <span class="material-symbols-outlined text-sm text-emerald-600">hotel</span>
            <span>2. Hotels &amp; Stays</span>
          </button>

          <button onclick="RaahiCityHub.jumpToSection('city-sec-restaurants')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 shrink-0 transition-colors">
            <span class="material-symbols-outlined text-sm text-rose-600">restaurant</span>
            <span>3. Restaurants &amp; Food</span>
          </button>

          <button onclick="RaahiCityHub.jumpToSection('city-sec-vehicles')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shrink-0 transition-colors">
            <span class="material-symbols-outlined text-sm text-blue-600">directions_car</span>
            <span>4. Vehicles &amp; Transport</span>
          </button>

          <button onclick="RaahiCityHub.jumpToSection('city-sec-guides')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shrink-0 transition-colors">
            <span class="material-symbols-outlined text-sm text-purple-600">school</span>
            <span>5. Local Guides</span>
          </button>

          <button onclick="RaahiCityHub.jumpToSection('city-sec-events')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 shrink-0 transition-colors">
            <span class="material-symbols-outlined text-sm text-teal-600">celebration</span>
            <span>6. Events &amp; Experiences</span>
          </button>

          <button onclick="RaahiCityHub.jumpToSection('city-sec-emergency')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 flex items-center gap-1.5 shrink-0 shadow-md shadow-red-600/20 transition-colors ml-auto">
            <span class="material-symbols-outlined text-sm">emergency</span>
            <span>7. Emergency 112</span>
          </button>
        </div>
      </div>
    `;
  },

  jumpToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  },

  renderAllSections() {
    this.renderPlacesSection();
    this.renderHotelsSection();
    this.renderRestaurantsSection();
    this.renderVehiclesSection();
    this.renderGuidesSection();
    this.renderEventsSection();
    this.renderEmergencySection();
  },

  // 1. PLACES TO EXPLORE
  renderPlacesSection() {
    const container = document.getElementById('city-places-container');
    const headerTitle = document.getElementById('city-places-title');
    if (!container) return;

    const dest = this.getCityData();
    if (headerTitle) headerTitle.textContent = `Places to Explore in ${dest.name}`;

    const rawList = (RAAHI_DATA.places || []).filter(p => p.destinationId === dest.id || p.city.toLowerCase().includes(dest.id) || dest.name.toLowerCase().includes(p.city.toLowerCase()));

    const filtered = rawList.filter(p => {
      if (this.placesSubFilter !== 'all') {
        const cat = (p.subCategory || p.category || '').toLowerCase();
        if (!cat.includes(this.placesSubFilter.toLowerCase())) return false;
      }
      if (this.searchQuery) {
        const match = p.name.toLowerCase().includes(this.searchQuery) ||
                      p.description.toLowerCase().includes(this.searchQuery);
        if (!match) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <span class="material-symbols-outlined text-4xl text-amber-500 mb-2">travel_explore</span>
          <h4 class="font-heading font-bold text-stone-900 dark:text-white">No places matching "${this.placesSubFilter !== 'all' ? this.placesSubFilter : this.searchQuery}" in ${dest.name}</h4>
          <button onclick="RaahiCityHub.setPlacesFilter('all')" class="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold">Reset Place Filter</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group card-hover">
        <div>
          <div class="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer" onclick="RaahiPlaces.openPlaceModal('${p.id}')">
            <img src="${p.image}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
                ${p.subCategory || p.category}
              </span>
            </div>

            <div class="absolute top-3 right-3 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                ⭐ ${p.rating}
              </span>
            </div>

            <div class="absolute bottom-3 left-3 right-3 text-white">
              <h4 class="font-heading text-lg font-bold text-white line-clamp-1">${p.name}</h4>
              <p class="text-[11px] text-amber-200 font-medium">${p.openingHours || 'Open for visitors'}</p>
            </div>
          </div>

          <div class="p-4 space-y-2.5">
            <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
              ${p.description}
            </p>

            <div class="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span class="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <span class="material-symbols-outlined text-xs">payments</span>
                ${p.entryFee ? p.entryFee.split(',')[0] : 'Free Entry'}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">accessible</span>
                ${p.accessibility?.wheelchair ? 'Accessible' : 'Standard'}
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 pt-0 grid grid-cols-2 gap-2">
          <button onclick="RaahiPlaces.openPlaceModal('${p.id}')" class="py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1">
            <span>View Details</span>
          </button>
          <button onclick="RaahiAuth.toggleSave('${p.id}')" class="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-xs">bookmark</span>
            <span>Save</span>
          </button>
        </div>
      </div>
    `).join('');
  },

  // 2. HOTELS & STAYS
  renderHotelsSection() {
    const container = document.getElementById('city-hotels-container');
    const headerTitle = document.getElementById('city-hotels-title');
    if (!container) return;

    const dest = this.getCityData();
    if (headerTitle) headerTitle.textContent = `Hotels & Stays in ${dest.name}`;

    const rawList = (RAAHI_DATA.hotels || []).filter(h => h.destinationId === dest.id || h.city.toLowerCase().includes(dest.id) || dest.name.toLowerCase().includes(h.city.toLowerCase()));

    const filtered = rawList.filter(h => {
      if (this.hotelsSubFilter !== 'all') {
        const type = (h.type || '').toLowerCase();
        if (!type.includes(this.hotelsSubFilter.toLowerCase())) return false;
      }
      if (this.searchQuery) {
        const match = h.name.toLowerCase().includes(this.searchQuery) ||
                      h.description.toLowerCase().includes(this.searchQuery);
        if (!match) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-10 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <span class="material-symbols-outlined text-4xl text-emerald-500 mb-2">hotel</span>
          <h4 class="font-heading font-bold text-stone-900 dark:text-white">No stays matching "${this.hotelsSubFilter !== 'all' ? this.hotelsSubFilter : this.searchQuery}" in ${dest.name}</h4>
          <button onclick="RaahiCityHub.setHotelsFilter('all')" class="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Reset Stays Filter</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(h => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group card-hover">
        <div>
          <div class="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer" onclick="RaahiHotels.openDetailModal('${h.id}')">
            <img src="${h.image}" alt="${h.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
                ${h.type || 'Stay Discovery'}
              </span>
            </div>

            <div class="absolute top-3 right-3 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                ⭐ ${h.rating}
              </span>
            </div>

            <div class="absolute bottom-3 left-3 right-3 text-white">
              <h4 class="font-heading text-lg font-bold text-white line-clamp-1">${h.name}</h4>
              <p class="text-[11px] text-emerald-200 font-semibold">${h.priceTier}</p>
            </div>
          </div>

          <div class="p-4 space-y-3">
            <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
              ${h.description}
            </p>

            <!-- Amenities Pills -->
            <div class="flex items-center gap-1.5 flex-wrap">
              ${(h.amenities || []).slice(0, 3).map(a => `
                <span class="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">
                  ${a}
                </span>
              `).join('')}
            </div>

            <div class="text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-emerald-600">pin_drop</span>
              <span class="truncate">${h.location}</span>
            </div>
          </div>
        </div>

        <div class="p-4 pt-0 flex items-center gap-2">
          <button onclick="RaahiHotels.openDetailModal('${h.id}')" class="flex-1 py-2 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-xs">visibility</span>
            <span>View Stay Info</span>
          </button>
          <a href="tel:${h.contact ? h.contact.split('/')[0].trim() : ''}" class="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-bold transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-xs">call</span>
            <span>Contact</span>
          </a>
        </div>
      </div>
    `).join('');
  },

  // 3. RESTAURANTS & FOOD
  renderRestaurantsSection() {
    const container = document.getElementById('city-restaurants-container');
    const headerTitle = document.getElementById('city-restaurants-title');
    if (!container) return;

    const dest = this.getCityData();
    if (headerTitle) headerTitle.textContent = `Restaurants & Culinary Spots in ${dest.name}`;

    const rawList = (RAAHI_DATA.restaurants || []).filter(r => r.destinationId === dest.id || r.city.toLowerCase().includes(dest.id) || dest.name.toLowerCase().includes(r.city.toLowerCase()));

    const filtered = rawList.filter(r => {
      if (this.restaurantsSubFilter !== 'all') {
        const cat = (r.category || r.cuisine || '').toLowerCase();
        if (!cat.includes(this.restaurantsSubFilter.toLowerCase())) return false;
      }
      if (this.searchQuery) {
        const match = r.name.toLowerCase().includes(this.searchQuery) ||
                      r.description.toLowerCase().includes(this.searchQuery);
        if (!match) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-10 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <span class="material-symbols-outlined text-4xl text-rose-500 mb-2">restaurant</span>
          <h4 class="font-heading font-bold text-stone-900 dark:text-white">No food spots matching "${this.restaurantsSubFilter !== 'all' ? this.restaurantsSubFilter : this.searchQuery}" in ${dest.name}</h4>
          <button onclick="RaahiCityHub.setRestaurantsFilter('all')" class="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">Reset Food Filter</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(r => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group card-hover">
        <div>
          <div class="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer" onclick="RaahiRestaurants.openDetailModal('${r.id}')">
            <img src="${r.image}" alt="${r.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
                ${r.cuisine}
              </span>
            </div>

            <div class="absolute top-3 right-3 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-sm flex items-center gap-1">
                ⭐ ${r.rating}
              </span>
            </div>

            <div class="absolute bottom-3 left-3 right-3 text-white">
              <h4 class="font-heading text-lg font-bold text-white line-clamp-1">${r.name}</h4>
              <p class="text-[11px] text-rose-200 font-semibold">${r.priceRange}</p>
            </div>
          </div>

          <div class="p-4 space-y-3">
            <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
              ${r.description}
            </p>

            <!-- Signature Specialties -->
            <div>
              <span class="text-[10px] font-bold uppercase text-stone-400 block mb-1">Must-Try Specialties:</span>
              <div class="flex items-center gap-1.5 flex-wrap">
                ${(r.specialties || []).slice(0, 3).map(s => `
                  <span class="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-[10px] font-bold text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                    🍲 ${s}
                  </span>
                `).join('')}
              </div>
            </div>

            <div class="text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span class="truncate">${r.location}</span>
              <span class="text-[10px] font-extrabold text-amber-600 shrink-0">${r.openingHours?.split('(')[0] || '12 PM - 11 PM'}</span>
            </div>
          </div>
        </div>

        <div class="p-4 pt-0 flex items-center gap-2">
          <button onclick="RaahiRestaurants.openDetailModal('${r.id}')" class="flex-1 py-2 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-xs">restaurant_menu</span>
            <span>View Menu &amp; Info</span>
          </button>
          <a href="tel:${r.contact ? r.contact.split('/')[0].trim() : ''}" class="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 text-xs font-bold transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-xs">call</span>
            <span>Call</span>
          </a>
        </div>
      </div>
    `).join('');
  },

  // 4. VEHICLES & TRANSPORTATION
  renderVehiclesSection() {
    const container = document.getElementById('city-vehicles-container');
    const headerTitle = document.getElementById('city-vehicles-title');
    if (!container) return;

    const dest = this.getCityData();
    if (headerTitle) headerTitle.textContent = `Vehicles & Local Transport in ${dest.name}`;

    const rawList = (RAAHI_DATA.vehicles || []).filter(v => v.destinationId === dest.id || v.city.toLowerCase().includes(dest.id) || dest.name.toLowerCase().includes(v.city.toLowerCase()));

    const filtered = rawList.filter(v => {
      if (this.vehiclesSubFilter !== 'all') {
        const type = (v.type || '').toLowerCase();
        if (!type.includes(this.vehiclesSubFilter.toLowerCase())) return false;
      }
      if (this.searchQuery) {
        const match = v.name.toLowerCase().includes(this.searchQuery) ||
                      v.keyRoutes.toLowerCase().includes(this.searchQuery) ||
                      v.tips.toLowerCase().includes(this.searchQuery);
        if (!match) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-10 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <span class="material-symbols-outlined text-4xl text-blue-500 mb-2">directions_car</span>
          <h4 class="font-heading font-bold text-stone-900 dark:text-white">No transit modes matching "${this.vehiclesSubFilter !== 'all' ? this.vehiclesSubFilter : this.searchQuery}" in ${dest.name}</h4>
          <button onclick="RaahiCityHub.setVehiclesFilter('all')" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Reset Transit Filter</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(v => `
      <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group card-hover">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800/60 shadow-2xs">
                <span class="material-symbols-outlined text-2xl">${v.icon || 'directions_car'}</span>
              </div>
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                  ${v.type}
                </span>
                <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mt-1">${v.name}</h4>
              </div>
            </div>
          </div>

          <!-- Fare Tariff Card -->
          <div class="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase text-stone-400 block">Estimated Tariff / Rate</span>
              <span class="text-xs sm:text-sm font-extrabold text-blue-900 dark:text-blue-200">${v.fare}</span>
            </div>
            <span class="text-[11px] font-semibold text-stone-500 dark:text-stone-400 text-right">${v.timings}</span>
          </div>

          <div class="space-y-2 text-xs text-stone-600 dark:text-stone-300">
            <div>
              <strong class="text-stone-900 dark:text-stone-100">Key Routes:</strong>
              <p class="text-stone-500 dark:text-stone-400 mt-0.5">${v.keyRoutes}</p>
            </div>
            <div>
              <strong class="text-stone-900 dark:text-stone-100">How to Book:</strong>
              <p class="text-stone-500 dark:text-stone-400 mt-0.5">${v.bookingInfo}</p>
            </div>
            <div class="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 text-[11px] flex items-start gap-1.5 border border-amber-200/40">
              <span class="material-symbols-outlined text-xs mt-0.5">lightbulb</span>
              <span><strong>Local Tip:</strong> ${v.tips}</span>
            </div>
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
          <div class="text-[11px] text-stone-500">
            <span>Provider: <strong>${v.provider}</strong></span>
          </div>
          <a href="tel:${v.helpline.split('/')[0].trim()}" class="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0">
            <span class="material-symbols-outlined text-xs">phone_in_talk</span>
            <span>${v.helpline}</span>
          </a>
        </div>
      </div>
    `).join('');
  },

  // 5. LOCAL GUIDES
  renderGuidesSection() {
    const container = document.getElementById('city-guides-container');
    const headerTitle = document.getElementById('city-guides-title');
    if (!container) return;

    const dest = this.getCityData();
    if (headerTitle) headerTitle.textContent = `Verified Tourist Guides in ${dest.name}`;

    const rawList = (RAAHI_DATA.guides || []).filter(g => g.destinationId === dest.id || g.city.toLowerCase().includes(dest.id) || dest.name.toLowerCase().includes(g.city.toLowerCase()));

    if (rawList.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-10 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <span class="material-symbols-outlined text-4xl text-purple-500 mb-2">school</span>
          <h4 class="font-heading font-bold text-stone-900 dark:text-white">Certified Ministry of Tourism guides available for ${dest.name}</h4>
          <button onclick="RaahiApp.navigate('guides')" class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Open Full Guides Registry</button>
        </div>
      `;
      return;
    }

    container.innerHTML = rawList.map(g => `
      <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group card-hover">
        <div class="space-y-4">
          <div class="flex items-start gap-4">
            <img src="${g.photo}" alt="${g.name}" class="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-sm shrink-0">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                  ${g.type || 'Verified Guide'}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ⭐ ${g.rating} (${g.reviewsCount})
                </span>
              </div>
              <h4 class="font-heading text-lg font-bold text-stone-900 dark:text-white mt-1">${g.name}</h4>
              <p class="text-xs font-bold text-purple-700 dark:text-purple-400">${g.experience}</p>
            </div>
          </div>

          <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            ${g.about}
          </p>

          <!-- Languages Spoken -->
          <div>
            <span class="text-[10px] font-bold uppercase text-stone-400 block mb-1">Languages:</span>
            <div class="flex items-center gap-1.5 flex-wrap">
              ${(g.languages || []).map(lang => `
                <span class="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-700 dark:text-stone-300">
                  🗣️ ${lang}
                </span>
              `).join('')}
            </div>
          </div>

          <div class="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-200">
            <strong>Specialization:</strong> ${g.specialization}
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
          <a href="tel:${g.contact.split('/')[0].trim()}" class="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-colors">
            <span class="material-symbols-outlined text-xs">call</span>
            <span>Direct Call</span>
          </a>
          <button onclick="RaahiApp.showToast('Connecting with ${g.name}...', 'info')" class="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors">
            Inquire
          </button>
        </div>
      </div>
    `).join('');
  },

  // 6. EVENTS & EXPERIENCES
  renderEventsSection() {
    const container = document.getElementById('city-events-container');
    const headerTitle = document.getElementById('city-events-title');
    if (!container) return;

    const dest = this.getCityData();
    if (headerTitle) headerTitle.textContent = `Events & Cultural Experiences in ${dest.name}`;

    const rawList = (RAAHI_DATA.events || []).filter(e => e.destinationId === dest.id || e.city.toLowerCase().includes(dest.id) || dest.name.toLowerCase().includes(e.city.toLowerCase()));

    if (rawList.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-10 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <span class="material-symbols-outlined text-4xl text-teal-500 mb-2">celebration</span>
          <h4 class="font-heading font-bold text-stone-900 dark:text-white">Year-round cultural gatherings in ${dest.name}</h4>
          <button onclick="RaahiApp.navigate('events')" class="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">Explore Pan-India Events Calendar</button>
        </div>
      `;
      return;
    }

    container.innerHTML = rawList.map(ev => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group card-hover">
        <div>
          <div class="relative h-48 w-full overflow-hidden bg-stone-900 cursor-pointer" onclick="RaahiEvents.openDetailModal('${ev.id}')">
            <img src="${ev.image}" alt="${ev.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            <div class="absolute top-3 left-3 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-600 text-white shadow-sm">
                ${ev.category}
              </span>
            </div>

            <div class="absolute bottom-3 left-3 right-3 text-white">
              <span class="text-[10px] font-extrabold text-amber-300 block uppercase tracking-wider">${ev.date}</span>
              <h4 class="font-heading text-lg font-bold text-white line-clamp-1">${ev.name}</h4>
            </div>
          </div>

          <div class="p-4 space-y-3">
            <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
              ${ev.description}
            </p>

            <div class="text-[11px] text-stone-500 dark:text-stone-400 space-y-1 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-xs text-teal-600">schedule</span>
                <span>${ev.time}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-xs text-teal-600">location_on</span>
                <span class="truncate">${ev.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 pt-0">
          <button onclick="RaahiEvents.openDetailModal('${ev.id}')" class="w-full py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-xs">visibility</span>
            <span>View Event Schedule</span>
          </button>
        </div>
      </div>
    `).join('');
  },

  // 7. EMERGENCY & TOURIST SAFETY (Distinct High-Priority Safety Hub Design)
  renderEmergencySection() {
    const container = document.getElementById('city-emergency-container');
    const headerTitle = document.getElementById('city-emergency-title');
    if (!container) return;

    const dest = this.getCityData();
    if (headerTitle) headerTitle.textContent = `24x7 Emergency & Tourist Safety in ${dest.name}`;

    const rawList = (RAAHI_DATA.emergencyServices || []).filter(e => e.destinationId === dest.id || e.city.toLowerCase().includes(dest.id) || dest.name.toLowerCase().includes(e.city.toLowerCase()));

    container.innerHTML = `
      <!-- Prominent 112 SOS Banner -->
      <div class="col-span-full p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-red-500 mb-2">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white text-red-600 flex items-center justify-center shrink-0 shadow-md">
            <span class="material-symbols-outlined text-3xl animate-pulse">emergency</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-900/60 text-white">National Unified SOS</span>
              <span class="text-xs text-red-100 font-semibold">Toll-Free Pan-India</span>
            </div>
            <h3 class="font-heading text-2xl sm:text-3xl font-black text-white mt-1">112 — National Emergency Response</h3>
            <p class="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed mt-1">
              One-touch dispatch for Police, Fire, Ambulance, and Tourist Rescue in ${dest.name} and across India.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <a href="tel:112" class="px-6 py-3.5 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
            <span class="material-symbols-outlined text-base">phone_in_talk</span>
            <span>DIAL 112 NOW</span>
          </a>
          <a href="tel:1363" class="px-4 py-3.5 rounded-2xl bg-red-800/80 hover:bg-red-800 text-white border border-red-400/50 font-bold text-xs flex items-center gap-1.5 transition-colors" title="Tourist Helpline">
            <span class="material-symbols-outlined text-sm">support_agent</span>
            <span>1363 Tourist Help</span>
          </a>
        </div>
      </div>

      <!-- City Verified Stations List -->
      ${rawList.map(srv => `
        <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 ${srv.type === 'Police' ? 'border-blue-200 dark:border-blue-900/60' : 'border-red-200 dark:border-red-900/60'} shadow-sm flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl ${srv.type === 'Police' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'} flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-xl">${srv.type === 'Police' ? 'local_police' : 'local_hospital'}</span>
                </div>
                <div>
                  <span class="text-[10px] font-extrabold uppercase ${srv.type === 'Police' ? 'text-blue-600' : 'text-red-600'}">
                    Verified ${srv.type}
                  </span>
                  <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white line-clamp-1">${srv.name}</h4>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                24x7
              </span>
            </div>

            <p class="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
              <span class="material-symbols-outlined text-xs text-stone-400 shrink-0 mt-0.5">pin_drop</span>
              <span>${srv.address}</span>
            </p>

            <div class="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 text-xs font-mono font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
              <span>Direct Phone:</span>
              <span class="text-red-600 dark:text-red-400">${srv.phone}</span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
            <a href="tel:${srv.phone.split('/')[0].trim()}" class="flex-1 py-2 px-3 rounded-xl ${srv.type === 'Police' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors">
              <span class="material-symbols-outlined text-xs">call</span>
              <span>Call Station</span>
            </a>
            <button onclick="RaahiApp.showToast('Locating ${srv.name}...', 'info'); RaahiApp.navigate('map');" class="py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">map</span>
              <span>Map</span>
            </button>
          </div>
        </div>
      `).join('')}
    `;
  }
};

// Global expose
if (typeof window !== 'undefined') {
  window.RaahiCityHub = RaahiCityHub;
}
