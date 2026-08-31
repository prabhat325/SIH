/**
 * RAAHI — Main Application Orchestrator & Client-Side Router
 * Brand: Raahi | Tagline: Safar Aapka, Planning Hamari
 * Primary AI Feature: Raahi AI Travel Planner & Intelligent Search Layer
 */

const RaahiApp = {
  currentRoute: 'home',
  darkMode: false,

 async init() {
    this.initTheme();
    this.initRouter();
    this.initNavLinks();
    this.initMobileMenu();
    this.initGlobalSearch();
    this.initHomeSearch();

    // Initialize all domain submodules
    if (typeof RaahiAPI !== 'undefined'){await RaahiAPI.init();}
    if (typeof RaahiCityHub !== 'undefined') RaahiCityHub.init();
   if (typeof RaahiAuth !== 'undefined') {
  await RaahiAuth.init();
}

    if (typeof RaahiSidebar !== 'undefined') RaahiSidebar.init();
    if (typeof RaahiVehicles !== 'undefined') RaahiVehicles.init();
    if (typeof RaahiDestinations !== 'undefined') RaahiDestinations.init();
    if (typeof RaahiPlaces !== 'undefined') RaahiPlaces.init();
    if (typeof RaahiHotels !== 'undefined') RaahiHotels.init();
    if (typeof RaahiRestaurants !== 'undefined') RaahiRestaurants.init();
    if (typeof RaahiEvents !== 'undefined') RaahiEvents.init();
    if (typeof RaahiGuides !== 'undefined') RaahiGuides.init();
    if (typeof RaahiEmergency !== 'undefined') RaahiEmergency.init();
    if (typeof RaahiPlanner !== 'undefined') RaahiPlanner.init();
    if (typeof RaahiSmartMatch !== 'undefined') RaahiSmartMatch.init();
    if (typeof RaahiBudgetForecaster !== 'undefined') RaahiBudgetForecaster.init();
    if (typeof RaahiFeedback !== 'undefined') RaahiFeedback.init();
    if (typeof RaahiCommunity !== 'undefined') RaahiCommunity.init();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.init();

    if (
  typeof RaahiAdmin !== 'undefined' &&
  RaahiAuth.currentUser &&
  RaahiAuth.currentUser.role === 'admin'
) {
  RaahiAdmin.init();
}

    if (typeof RaahiAI !== 'undefined') RaahiAI.init();
    if (typeof RaahiMap !== 'undefined') RaahiMap.init();

    this.renderPopularDestinations();
    this.renderAIRecommendations();
  },

  initTheme() {
    const savedTheme = localStorage.getItem('raahi_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.applyTheme();

    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.darkMode = !this.darkMode;
        localStorage.setItem('raahi_theme', this.darkMode ? 'dark' : 'light');
        this.applyTheme();
      });
    }
  },

  applyTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-toggle-icon');
    if (this.darkMode) {
      html.classList.add('dark');
      if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
      html.classList.remove('dark');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
  },



  initRouter() {
  window.addEventListener('hashchange', () => {
    this.handleHashChange();
  });

  // Handle email verification links:
  // /verify-email/<token>
  const path = window.location.pathname;

  if (path.startsWith('/verify-email/')) {
    const token = path.split('/verify-email/')[1];

    if (token) {
      this.handleEmailVerification(token);
      return;
    }
  }

  this.handleHashChange();
},


async handleEmailVerification(token) {
  if (!token) {
    RaahiApp.showToast(
      "Verification token is missing.",
      "error"
    );
    this.navigate('home');
    return;
  }

  try {
    const response = await RaahiAPI.verifyEmail(token);

    if (!response || !response.success) {
      throw new Error(
        response?.message || "Email verification failed"
      );
    }

    RaahiApp.showToast(
      "Email verified successfully. You can now sign in.",
      "success"
    );

    // Open the real sign-in form.
    if (typeof RaahiAuth !== 'undefined') {
      RaahiAuth.openAuthModal('signin');
    }

    // Return the SPA to a normal route.
   window.history.replaceState({}, document.title, '/');
this.navigate('home', false);
  } catch (error) {
    console.error(
      "[RaahiApp] Email verification failed:",
      error
    );

    RaahiApp.showToast(
  "This verification link is invalid or has already been used. If your email is already verified, please sign in.",
  "warning"
);

window.history.replaceState({}, document.title, '/');
this.navigate('home', false);

   
  }
},


  handleHashChange() {
    const fullHash = window.location.hash.replace('#', '').trim();
    let hash = fullHash.toLowerCase();

    // Check for city details route with params: #city?id=lucknow&cat=hotels
    if (hash.startsWith('city')) {
      const queryPart = fullHash.includes('?') ? fullHash.split('?')[1] : '';
      const params = new URLSearchParams(queryPart);
      const cityId = params.get('id') || 'lucknow';
      const cat = params.get('cat') || 'hotels';

      this.navigate('city', false);
      if (typeof RaahiCityHub !== 'undefined') {
        RaahiCityHub.openCity(cityId, cat);
      }
      return;
    }

    if (hash === 'destinations') hash = 'explore';

    // Map Traveler Sub-routes to Dashboard
    if (['saved', 'reviews', 'contributions', 'profile', 'settings'].includes(hash)) {
      this.navigate('dashboard', false);
      if (typeof RaahiDashboard !== 'undefined') {
        const tabMap = {
          'saved': 'saved',
          'reviews': 'reviews',
          'contributions': 'contributions',
          'profile': 'personalized',
          'settings': 'personalized'
        };
        RaahiDashboard.switchTab(tabMap[hash] || 'personalized');
      }
      return;
    }

    const validRoutes = [
      'home', 'explore', 'cities', 'city', 'places', 'hotels', 'restaurants',
      'events', 'guides', 'vehicles', 'map', 'weather', 'emergency', 'planner',
      'dashboard', 'admin'
    ];

    const targetRoute = validRoutes.includes(hash) ? hash : 'home';
    this.navigate(targetRoute, false);
  },



  navigate(routeId, updateHash = true) {
    this.currentRoute = routeId;
    if (updateHash) {
      window.location.hash = routeId;
    }

    const actualViewId = (routeId === 'cities') ? 'explore' : routeId;

    // Toggle view sections
    document.querySelectorAll('.view-section').forEach(view => {
      if (view.id === `view-${actualViewId}`) {
        view.classList.remove('hidden-view');
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
      }
    });

    // If navigating to cities specifically, initialize destinations
    if (routeId === 'cities' && typeof RaahiDestinations !== 'undefined') {
      RaahiDestinations.init();
    }

    // Update active navbar & sidebar links
    if (typeof RaahiSidebar !== 'undefined') {
      RaahiSidebar.updateActiveState(routeId);
    }

    // Invalidate map size if navigating to map view
    if (routeId === 'map' && typeof RaahiMap !== 'undefined') {
      setTimeout(() => {
        RaahiMap.initLeafletMap();
        if (RaahiMap.mapInstance) RaahiMap.mapInstance.invalidateSize();
      }, 150);
    }

    // Refresh Dashboard if navigating to dashboard
    if (routeId === 'dashboard' && typeof RaahiDashboard !== 'undefined') {
      RaahiDashboard.renderAll();
    }

    // Refresh Planner if navigating to planner
    if (routeId === 'planner' && typeof RaahiPlanner !== 'undefined') {
      if (RaahiPlanner.currentPlan) {
        RaahiPlanner.renderItinerary();
      }
    }

    // Refresh Vehicles if navigating to vehicles
    if (routeId === 'vehicles' && typeof RaahiVehicles !== 'undefined') {
      RaahiVehicles.renderVehicles();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.closeMobileMenu();
  },

  initNavLinks() {
    document.querySelectorAll('.nav-route-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        if (route) this.navigate(route);
      });
    });
  },

  initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    const drawer = document.getElementById('mobile-menu-drawer');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.remove('-translate-x-full');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }
  },

  closeMobileMenu() {
    const drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) {
      drawer.classList.add('-translate-x-full');
    }
  },

  initHomeSearch() {
    const form = document.getElementById('home-search-form');
    const input = document.getElementById('home-search-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          this.runSmartQuery(query);
        }
      });
    }
  },

  // Smart Query Handler for Section 7 & 8 Natural Search Queries
  runSmartQuery(queryText) {
    if (!queryText) return;
    const cleanQuery = queryText.trim();

    const homeInput = document.getElementById('home-search-input');
    if (homeInput) homeInput.value = cleanQuery;

    if (typeof RaahiPlaces !== 'undefined') {
      RaahiPlaces.searchQuery = cleanQuery.toLowerCase();
      const placesInput = document.getElementById('places-search-input');
      if (placesInput) placesInput.value = cleanQuery;
      RaahiPlaces.showAISearchBanner(cleanQuery);
      RaahiPlaces.renderPlaces();
    }

    this.navigate('places');
  },

  
  

    /*
   * ============================================================
   * RAAHI GLOBAL SEARCH
   * ============================================================
   *
   * Searches:
   *  - Tourist Places
   *  - Hotels
   *  - Restaurants
   *  - Events
   *  - Guides
   *  - Emergency Services
   *
   * Supports backend IDs:
   *  - _id
   *  - id
   *  - placeId
   *  - hotelId
   *  - restaurantId
   *  - eventId
   *  - guideId
   *  - serviceId
   *
   * Backend search APIs are used first.
   * RAAHI_DATA is used as fallback.
   * ============================================================
   */

initGlobalSearch() {

  window.addEventListener('keydown', (e) => {

    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === 'k'
    ) {
      e.preventDefault();
      this.openGlobalSearch();
    }

    if (e.key === 'Escape') {
      this.closeGlobalSearch();
    }

  });


  const searchInput =
    document.getElementById(
      'global-search-modal-input'
    );


  const resultsContainer =
    document.getElementById(
      'global-search-results'
    );


  if (!searchInput) {

    console.warn(
      '[RaahiApp] Global search input not found.'
    );

    return;
  }


  // Avoid duplicate listeners
  if (
    searchInput.dataset.raahiSearchBound === 'true'
  ) {
    return;
  }

  searchInput.dataset.raahiSearchBound = 'true';


  let timer = null;


  // =====================================================
  // SEARCH INPUT
  // =====================================================

  searchInput.addEventListener(
    'input',
    (e) => {

      clearTimeout(timer);

      const query =
        e.target.value.trim();

      timer = setTimeout(() => {

        this.performGlobalSearch(query);

      }, 300);

    }
  );


  // =====================================================
  // GLOBAL SEARCH RESULT CLICK
  // =====================================================

  if (resultsContainer) {

    resultsContainer.addEventListener(
      'click',
      async (e) => {

        const result =
          e.target.closest(
            '.global-search-result'
          );


        if (!result) {
          return;
        }


        // -----------------------------------------------
        // Read result information
        // -----------------------------------------------

        const type =
          result.dataset.type || 'place';


        const id =
          result.dataset.id || '';


        const name =
          result.querySelector('h5')
            ?.textContent
            ?.trim() || '';


        // -----------------------------------------------
        // Get city from result
        // -----------------------------------------------

        const text =
          result.innerText || '';


        const lines =
          text
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);


        let city = '';


        /*
         * Current global-search result format:
         *
         * Janeshwar Mishra Park
         * Lucknow
         * •
         * Nature
         *
         * So the second meaningful line is the city.
         */

        if (lines.length >= 2) {
          city = lines[1];
        }


        console.log(
          '[RaahiApp] Global search result clicked:',
          {
            type,
            id,
            name,
            city
          }
        );


        // -----------------------------------------------
        // Safety check
        // -----------------------------------------------

        if (!city) {

          console.error(
            '[RaahiApp] Could not determine city:',
            result.innerText
          );

          return;
        }


        // -----------------------------------------------
        // Category mapping
        // -----------------------------------------------

        const categoryMap = {

          place: 'places',

          hotel: 'hotels',

          restaurant: 'restaurants',

          event: 'events',

          guide: 'guides',

          emergency: 'emergency',

          vehicle: 'vehicles'

        };


        const category =
          categoryMap[type] || 'places';


        // -----------------------------------------------
        // Close global search
        // -----------------------------------------------

        this.closeGlobalSearch();


        // -----------------------------------------------
        // Open EXISTING City Hub
        // -----------------------------------------------

        if (
          typeof RaahiCityHub !== 'undefined' &&
          typeof RaahiCityHub.openCity === 'function'
        ) {

          await RaahiCityHub.openCity(
            city,
            category,
            name
          );

          return;
        }


        console.error(
          '[RaahiApp] RaahiCityHub.openCity() not available.'
        );

      }
    );

  }

},


  /*
   * ============================================================
   * PERFORM GLOBAL SEARCH
   * ============================================================
   */

  async performGlobalSearch(query) {
  query = String(query || '').trim();

  const resultsContainer =
    document.getElementById('global-search-results');

  if (!resultsContainer) return;

  if (!query) {
    resultsContainer.innerHTML = `
      <div class="p-6 text-center text-xs text-stone-400">
        Type to discover monuments, stays, food,
        events, guides, and emergency services...
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = `
    <div class="p-6 text-center text-xs text-stone-400">
      Searching Raahi...
    </div>
  `;

  try {
    const q = encodeURIComponent(query);

    const responses = await Promise.allSettled([
      RaahiAPI.get(`/api/places?search=${q}&limit=10`),
      RaahiAPI.get(`/api/hotels?search=${q}&limit=10`),
      RaahiAPI.get(`/api/restaurants?search=${q}&limit=10`),
      RaahiAPI.get(`/api/events?search=${q}&limit=10`),
      RaahiAPI.get(`/api/guides?search=${q}&limit=10`),
      RaahiAPI.get(`/api/emergency?search=${q}&limit=10`)
    ]);

    const getData = (index) => {
      const result = responses[index];

      if (!result || result.status !== 'fulfilled') {
        return [];
      }

      const response = result.value;

      return (
        response?.data ||
        response?.places ||
        response?.hotels ||
        response?.restaurants ||
        response?.events ||
        response?.guides ||
        response?.emergency ||
        response?.emergencies ||
        []
      );
    };

    const places = getData(0);
    const hotels = getData(1);
    const restaurants = getData(2);
    const events = getData(3);
    const guides = getData(4);
    const emergency = getData(5);

    console.log('[RaahiApp] Global Search:', {
      query,
      places: places.length,
      hotels: hotels.length,
      restaurants: restaurants.length,
      events: events.length,
      guides: guides.length,
      emergency: emergency.length
    });

    let html = '';

    // =====================================================
    // PLACES
    // =====================================================

    if (places.length) {
      html += `
        <div class="p-3 bg-stone-50 dark:bg-stone-800/80
                    font-bold text-[10px] uppercase text-amber-600">
          🏛️ Tourist Places
        </div>
      `;

      html += places.slice(0, 5).map(p => {

        const id =
          p.placeId ||
          p.id ||
          p._id;

        return `
          <div
            class="global-search-result p-3 flex items-center
                   justify-between cursor-pointer
                   hover:bg-amber-50/50
                   dark:hover:bg-stone-800
                   border-b border-stone-100
                   dark:border-stone-800"
            data-type="place"
            data-id="${id || ''}"
          >
            <div>
              <h5 class="text-xs font-bold
                         text-stone-900 dark:text-white">
                ${p.name || 'Tourist Place'}
              </h5>

              <span class="text-[11px] text-stone-500">
                ${p.city || ''}
                •
                ${p.category || 'Place'}
              </span>
            </div>

            ${
              p.rating != null
                ? `<span class="text-xs text-amber-500 font-bold">
                     ★ ${p.rating}
                   </span>`
                : ''
            }
          </div>
        `;
      }).join('');
    }


    // =====================================================
    // HOTELS
    // =====================================================

    if (hotels.length) {
      html += `
        <div class="p-3 bg-stone-50 dark:bg-stone-800/80
                    font-bold text-[10px] uppercase text-emerald-600">
          🏨 Hotels
        </div>
      `;

      html += hotels.slice(0, 5).map(h => {

        const id =
          h.hotelId ||
          h.id ||
          h._id;

        return `
          <div
            class="global-search-result p-3 flex items-center
                   justify-between cursor-pointer
                   hover:bg-emerald-50/50
                   dark:hover:bg-stone-800
                   border-b border-stone-100
                   dark:border-stone-800"
            data-type="hotel"
            data-id="${id || ''}"
          >
            <div>
              <h5 class="text-xs font-bold
                         text-stone-900 dark:text-white">
                ${h.name || 'Hotel'}
              </h5>

              <span class="text-[11px] text-stone-500">
                ${h.city || ''}
                •
                ${h.category || h.type || 'Hotel'}
              </span>
            </div>

            ${
              h.rating != null
                ? `<span class="text-xs text-amber-500 font-bold">
                     ★ ${h.rating}
                   </span>`
                : ''
            }
          </div>
        `;
      }).join('');
    }


    // =====================================================
    // RESTAURANTS
    // =====================================================

    if (restaurants.length) {
      html += `
        <div class="p-3 bg-stone-50 dark:bg-stone-800/80
                    font-bold text-[10px] uppercase text-orange-600">
          🍽️ Restaurants
        </div>
      `;

      html += restaurants.slice(0, 5).map(r => {

        const id =
          r.restaurantId ||
          r.id ||
          r._id;

        return `
          <div
            class="global-search-result p-3 flex items-center
                   justify-between cursor-pointer
                   hover:bg-orange-50/50
                   dark:hover:bg-stone-800
                   border-b border-stone-100
                   dark:border-stone-800"
            data-type="restaurant"
            data-id="${id || ''}"
          >
            <div>
              <h5 class="text-xs font-bold
                         text-stone-900 dark:text-white">
                ${r.name || 'Restaurant'}
              </h5>

              <span class="text-[11px] text-stone-500">
                ${r.cuisine || r.category || 'Dining'}
                •
                ${r.city || ''}
              </span>
            </div>

            ${
              r.rating != null
                ? `<span class="text-xs text-amber-500 font-bold">
                     ★ ${r.rating}
                   </span>`
                : ''
            }
          </div>
        `;
      }).join('');
    }


    // =====================================================
    // EVENTS
    // =====================================================

    if (events.length) {
      html += `
        <div class="p-3 bg-stone-50 dark:bg-stone-800/80
                    font-bold text-[10px] uppercase text-purple-600">
          🎉 Events
        </div>
      `;

      html += events.slice(0, 5).map(event => {

        const id =
          event.eventId ||
          event.id ||
          event._id;

        return `
          <div
            class="global-search-result p-3 cursor-pointer
                   hover:bg-purple-50/50
                   dark:hover:bg-stone-800
                   border-b border-stone-100
                   dark:border-stone-800"
            data-type="event"
            data-id="${id || ''}"
          >
            <h5 class="text-xs font-bold
                       text-stone-900 dark:text-white">
              ${event.name || event.title || 'Event'}
            </h5>

            <span class="text-[11px] text-stone-500">
              ${event.city || ''}
              •
              ${event.category || event.type || 'Event'}
            </span>
          </div>
        `;
      }).join('');
    }


    // =====================================================
    // GUIDES
    // =====================================================

    if (guides.length) {
      html += `
        <div class="p-3 bg-stone-50 dark:bg-stone-800/80
                    font-bold text-[10px] uppercase text-blue-600">
          🧭 Travel Guides
        </div>
      `;

      html += guides.slice(0, 5).map(guide => {

        const id =
          guide.guideId ||
          guide.id ||
          guide._id;

        return `
          <div
            class="global-search-result p-3 cursor-pointer
                   hover:bg-blue-50/50
                   dark:hover:bg-stone-800
                   border-b border-stone-100
                   dark:border-stone-800"
            data-type="guide"
            data-id="${id || ''}"
          >
            <h5 class="text-xs font-bold
                       text-stone-900 dark:text-white">
              ${guide.name || guide.title || 'Travel Guide'}
            </h5>

            <span class="text-[11px] text-stone-500">
              ${guide.city || guide.location || ''}
              • Guide
            </span>
          </div>
        `;
      }).join('');
    }


    // =====================================================
    // EMERGENCY
    // =====================================================

    if (emergency.length) {
      html += `
        <div class="p-3 bg-stone-50 dark:bg-stone-800/80
                    font-bold text-[10px] uppercase text-red-600">
          🚨 Emergency Services
        </div>
      `;

      html += emergency.slice(0, 5).map(e => {

        // YOUR EMERGENCY MODEL USES serviceId
        const id =
          e.serviceId ||
          e.id ||
          e._id;

        return `
          <div
            class="global-search-result p-3 cursor-pointer
                   hover:bg-red-50/50
                   dark:hover:bg-stone-800
                   border-b border-stone-100
                   dark:border-stone-800"
            data-type="emergency"
            data-id="${id || ''}"
          >
            <h5 class="text-xs font-bold
                       text-stone-900 dark:text-white">
              ${e.name || 'Emergency Service'}
            </h5>

            <span class="text-[11px] text-stone-500">
              ${e.type || 'Emergency'}
              •
              ${e.city || ''}
            </span>
          </div>
        `;
      }).join('');
    }


    // =====================================================
    // NO RESULTS
    // =====================================================

    if (!html) {
      resultsContainer.innerHTML = `
        <div class="p-6 text-center">
          <div class="text-2xl mb-2">🔎</div>

          <div class="text-xs font-semibold
                      text-stone-600 dark:text-stone-300">
            No matching results
          </div>

          <div class="text-[11px] text-stone-400 mt-1">
            Try another place, hotel, restaurant,
            event, guide, or emergency service.
          </div>
        </div>
      `;

      return;
    }


    resultsContainer.innerHTML = html;


    // =====================================================
    // RESULT CLICK
    // =====================================================

    resultsContainer
      .querySelectorAll('.global-search-result')
      .forEach(result => {

        result.addEventListener('click', async () => {

          const type =
            result.dataset.type;

          const id =
            result.dataset.id;

          if (!id) {
            console.warn(
              '[RaahiApp] Result has no ID:',
              result
            );
            return;
          }

          this.closeGlobalSearch();


          try {

            switch (type) {

              case 'place':

                if (
                  typeof RaahiPlaces !== 'undefined' &&
                  typeof RaahiPlaces.openDetailModal === 'function'
                ) {
                  await RaahiPlaces.openDetailModal(id);
                }

                break;


              case 'hotel':

                if (
                  typeof RaahiHotels !== 'undefined' &&
                  typeof RaahiHotels.openHotelModal === 'function'
                ) {
                  await RaahiHotels.openHotelModal(id);
                }

                break;


              case 'restaurant':

                if (
                  typeof RaahiRestaurants !== 'undefined' &&
                  typeof RaahiRestaurants.openRestModal === 'function'
                ) {
                  await RaahiRestaurants.openRestModal(id);
                }

                break;


              case 'event':

                if (
                  typeof RaahiEvents !== 'undefined'
                ) {

                  if (
                    typeof RaahiEvents.openEventModal === 'function'
                  ) {
                    await RaahiEvents.openEventModal(id);

                  } else if (
                    typeof RaahiEvents.openDetailModal === 'function'
                  ) {
                    await RaahiEvents.openDetailModal(id);
                  }
                }

                break;


              case 'guide':

                if (
                  typeof RaahiGuides !== 'undefined'
                ) {

                  if (
                    typeof RaahiGuides.openGuideModal === 'function'
                  ) {
                    await RaahiGuides.openGuideModal(id);

                  } else if (
                    typeof RaahiGuides.openDetailModal === 'function'
                  ) {
                    await RaahiGuides.openDetailModal(id);
                  }
                }

                break;


              case 'emergency':

                if (
                  typeof RaahiEmergency !== 'undefined'
                ) {

                  if (
                    typeof RaahiEmergency.openEmergencyModal === 'function'
                  ) {
                    await RaahiEmergency.openEmergencyModal(id);

                  } else if (
                    typeof RaahiEmergency.openDetailModal === 'function'
                  ) {
                    await RaahiEmergency.openDetailModal(id);
                  }
                }

                break;
            }

          } catch (error) {

            console.error(
              `[RaahiApp] Failed to open ${type} details:`,
              error
            );

          }

        });

      });


  } catch (error) {

    console.error(
      '[RaahiApp] Global search failed:',
      error
    );

    resultsContainer.innerHTML = `
      <div class="p-6 text-center text-xs text-red-500">
        Search temporarily unavailable.
      </div>
    `;
  }
},

  /*
   * ============================================================
   * LOCAL SEARCH
   * ============================================================
   */

  searchLocalCollection(
    collection,
    query,
    fields
  ) {

    if (
      !Array.isArray(collection)
    ) {

      return [];
    }


    return collection.filter(
      (item) => {

        if (!item) {

          return false;
        }


        return fields.some(
          (field) => {

            const value =
              item[field];


            /*
             * Array values
             *
             * Example:
             * emergencyFacilities
             */

            if (
              Array.isArray(value)
            ) {

              return value.some(
                (entry) =>
                  String(entry)
                    .toLowerCase()
                    .includes(query)
              );
            }


            return String(
              value ?? ''
            )
              .toLowerCase()
              .includes(query);
          }
        );
      }
    );
  },


  /*
   * ============================================================
   * NORMALIZE SEARCH RESULT
   * ============================================================
   */

  normalizeGlobalSearchResults(
    items,
    type
  ) {

    if (
      !Array.isArray(items)
    ) {

      return [];
    }


    return items
      .filter(Boolean)
      .map(
        (item) => {

          /*
           * Your backend models use different ID names.
           *
           * Places:
           * placeId
           *
           * Emergency:
           * serviceId
           *
           * MongoDB:
           * _id
           */

          const id =
            item.id ||
            item.placeId ||
            item.hotelId ||
            item.restaurantId ||
            item.eventId ||
            item.guideId ||
            item.serviceId ||
            item._id ||
            '';


          const name =
            item.name ||
            (
              type === 'emergency'
                ? 'Emergency Service'
                : 'Unnamed'
            );


          const city =
            item.city ||
            item.cityName ||
            '';


          let category =
            item.category ||
            item.type ||
            item.cuisine ||
            '';


          if (!category) {

            if (
              type === 'place'
            ) {

              category =
                'Tourist Place';

            } else if (
              type === 'hotel'
            ) {

              category =
                'Hotel';

            } else if (
              type === 'restaurant'
            ) {

              category =
                'Restaurant';

            } else if (
              type === 'event'
            ) {

              category =
                'Event';

            } else if (
              type === 'guide'
            ) {

              category =
                'Travel Guide';

            } else if (
              type === 'emergency'
            ) {

              category =
                'Emergency Service';

            } else {

              category =
                'Raahi';
            }
          }


          return {

            ...item,

            id,

            name,

            city,

            category,

            type
          };
        }
      );
  },


  /*
   * ============================================================
   * RENDER SEARCH RESULTS
   * ============================================================
   */

  renderGlobalSearchResults(
    data,
    query,
    resultsContainer
  ) {

    let html = '';


    /*
     * PLACES
     */

    if (
      data.places.length
    ) {

      html +=
        this.globalSearchSection(
          'Tourist Places',
          'amber',
          data.places
            .slice(0, 5)
            .map(
              item =>
                this.globalSearchResultRow(
                  item,
                  'place'
                )
            )
            .join('')
        );
    }


    /*
     * HOTELS
     */

    if (
      data.hotels.length
    ) {

      html +=
        this.globalSearchSection(
          'Hotels',
          'emerald',
          data.hotels
            .slice(0, 5)
            .map(
              item =>
                this.globalSearchResultRow(
                  item,
                  'hotel'
                )
            )
            .join('')
        );
    }


    /*
     * RESTAURANTS
     */

    if (
      data.restaurants.length
    ) {

      html +=
        this.globalSearchSection(
          'Restaurants',
          'orange',
          data.restaurants
            .slice(0, 5)
            .map(
              item =>
                this.globalSearchResultRow(
                  item,
                  'restaurant'
                )
            )
            .join('')
        );
    }


    /*
     * EVENTS
     */

    if (
      data.events.length
    ) {

      html +=
        this.globalSearchSection(
          'Events',
          'purple',
          data.events
            .slice(0, 5)
            .map(
              item =>
                this.globalSearchResultRow(
                  item,
                  'event'
                )
            )
            .join('')
        );
    }


    /*
     * GUIDES
     */

    if (
      data.guides.length
    ) {

      html +=
        this.globalSearchSection(
          'Travel Guides',
          'blue',
          data.guides
            .slice(0, 5)
            .map(
              item =>
                this.globalSearchResultRow(
                  item,
                  'guide'
                )
            )
            .join('')
        );
    }


    /*
     * EMERGENCY
     */

    if (
      data.emergency.length
    ) {

      html +=
        this.globalSearchSection(
          'Emergency Services',
          'red',
          data.emergency
            .slice(0, 5)
            .map(
              item =>
                this.globalSearchResultRow(
                  item,
                  'emergency'
                )
            )
            .join('')
        );
    }


    /*
     * NO RESULTS
     */

    if (!html) {

      resultsContainer.innerHTML = `

        <div class="p-8 text-center">

          <span
            class="material-symbols-outlined
                   text-stone-300
                   dark:text-stone-600
                   text-4xl">
            search_off
          </span>

          <p
            class="mt-2
                   text-xs
                   font-bold
                   text-stone-700
                   dark:text-stone-300">

            No matching results

          </p>

          <p
            class="mt-1
                   text-[11px]
                   text-stone-400">

            Nothing found for
            "<strong>
              ${this.escapeHTML(query)}
            </strong>"

          </p>

        </div>
      `;

      return;
    }


    resultsContainer.innerHTML =
      html;
  },


  /*
   * ============================================================
   * SEARCH SECTION
   * ============================================================
   */

  globalSearchSection(
    title,
    color,
    content
  ) {

    const colorMap = {

      amber:
        'text-amber-600',

      emerald:
        'text-emerald-600',

      orange:
        'text-orange-600',

      purple:
        'text-purple-600',

      blue:
        'text-blue-600',

      red:
        'text-red-600'
    };


    return `

      <div
        class="p-3
               bg-stone-50
               dark:bg-stone-800/80
               font-bold
               text-[10px]
               uppercase
               tracking-wider
               ${colorMap[color] || 'text-stone-600'}">

        ${title}

      </div>

      ${content}
    `;
  },


  /*
   * ============================================================
   * SEARCH RESULT ROW
   * ============================================================
   */

  globalSearchResultRow(
    item,
    type
  ) {

    const name =
      this.escapeHTML(
        item.name || 'Unnamed'
      );


    const city =
      this.escapeHTML(
        item.city || ''
      );


    const category =
      this.escapeHTML(
        item.category || ''
      );


    const rating =
      item.rating !== null &&
      item.rating !== undefined &&
      item.rating !== ''
        ? this.escapeHTML(
            String(item.rating)
          )
        : '';


    const clickAction =
      this.getGlobalSearchClickAction(
        item,
        type
      );


    let hoverClass =
      'hover:bg-stone-50 dark:hover:bg-stone-800';


    let icon =
      'search';


    /*
     * Category-specific icon.
     */

    switch (type) {

      case 'place':

        hoverClass =
          'hover:bg-amber-50/60 dark:hover:bg-stone-800';

        icon =
          'temple_hindu';

        break;


      case 'hotel':

        hoverClass =
          'hover:bg-emerald-50/60 dark:hover:bg-stone-800';

        icon =
          'hotel';

        break;


      case 'restaurant':

        hoverClass =
          'hover:bg-orange-50/60 dark:hover:bg-stone-800';

        icon =
          'restaurant';

        break;


      case 'event':

        hoverClass =
          'hover:bg-purple-50/60 dark:hover:bg-stone-800';

        icon =
          'event';

        break;


      case 'guide':

        hoverClass =
          'hover:bg-blue-50/60 dark:hover:bg-stone-800';

        icon =
          'menu_book';

        break;


      case 'emergency':

        hoverClass =
          'hover:bg-red-50/60 dark:hover:bg-stone-800';

        icon =
          'local_hospital';

        break;
    }


    return `

      <div
        onclick="${clickAction}"
        class="p-3
               flex
               items-center
               gap-3
               ${hoverClass}
               cursor-pointer
               border-b
               border-stone-100
               dark:border-stone-800
               transition-colors">

        <div
          class="w-9
                 h-9
                 rounded-xl
                 bg-stone-100
                 dark:bg-stone-800
                 flex
                 items-center
                 justify-center
                 shrink-0">

          <span
            class="material-symbols-outlined
                   text-base
                   text-stone-500">

            ${icon}

          </span>

        </div>


        <div
          class="min-w-0
                 flex-1">

          <h5
            class="text-xs
                   font-bold
                   text-stone-900
                   dark:text-white
                   truncate">

            ${name}

          </h5>


          <span
            class="text-[11px]
                   text-stone-500
                   dark:text-stone-400">

            ${city}

            ${
              city && category
                ? ' • '
                : ''
            }

            ${category}

          </span>

        </div>


        ${
          rating
            ? `
              <span
                class="text-xs
                       text-amber-500
                       font-bold
                       shrink-0">

                ★ ${rating}

              </span>
            `
            : ''
        }

      </div>
    `;
  },


  /*
   * ============================================================
   * RESULT CLICK HANDLER
   * ============================================================
   */

getGlobalSearchClickAction(
  item,
  type
) {

  if (!item) {

    console.error(
      '[RaahiApp] Global search clicked item is missing.'
    );

    return '';
  }


  // ---------------------------------------------
  // Get city directly from the global-search item
  // ---------------------------------------------

  const city =
    String(
      item.city ||
      item.cityName ||
      item.location ||
      ''
    ).trim();


  // ---------------------------------------------
  // Get exact searched resource name
  // ---------------------------------------------

  const name =
    String(
      item.name ||
      item.title ||
      ''
    ).trim();


  // ---------------------------------------------
  // Category mapping
  // ---------------------------------------------

  const categoryMap = {

    place: 'places',
    places: 'places',

    hotel: 'hotels',
    hotels: 'hotels',

    restaurant: 'restaurants',
    restaurants: 'restaurants',

    event: 'events',
    events: 'events',

    guide: 'guides',
    guides: 'guides',

    emergency: 'emergency',

    vehicle: 'vehicles'

  };


  const targetCategory =
    categoryMap[type] || 'places';


  // ---------------------------------------------
  // Escape values for inline onclick
  // ---------------------------------------------

  const safeCity =
    city
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'");

  const safeName =
    name
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'");


  // ---------------------------------------------
  // Open EXISTING City Hub
  // ---------------------------------------------

  return `
    RaahiApp.closeGlobalSearch();

    if (
      typeof RaahiCityHub !== 'undefined' &&
      typeof RaahiCityHub.openCity === 'function'
    ) {

      RaahiCityHub.openCity(
        '${safeCity}',
        '${targetCategory}',
        '${safeName}'
      );

    } else {

      console.error(
        '[RaahiApp] Existing City Hub is unavailable.'
      );

    }
  `;
},


  /*
   * ============================================================
   * HTML ESCAPE
   * ============================================================
   */

  escapeHTML(value) {

    return String(
      value ?? ''
    )
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );
  },


  /*
   * ============================================================
   * OPEN GLOBAL SEARCH
   * ============================================================
   */

  openGlobalSearch() {

    const modal =
      document.getElementById(
        'global-search-modal'
      );


    const input =
      document.getElementById(
        'global-search-modal-input'
      );


    const results =
      document.getElementById(
        'global-search-results'
      );


    if (!modal) {

      console.warn(
        '[RaahiApp] Global search modal not found.'
      );

      return;
    }


    /*
     * Show modal.
     */

    modal.classList.remove(
      'hidden'
    );


    /*
     * Prevent background scrolling.
     */

    document.body.style.overflow =
      'hidden';


    /*
     * Reset results.
     */

    if (results) {

      results.innerHTML = `
        <div class="p-6 text-center text-xs text-stone-400">

          <span
            class="material-symbols-outlined
                   text-2xl
                   text-stone-300
                   dark:text-stone-600
                   block
                   mb-2">
            search
          </span>

          Search monuments, stays, dining,
          events, guides, or emergency services...

        </div>
      `;
    }


    /*
     * Focus input.
     */

    if (input) {

      input.value = '';


      setTimeout(
        () => {

          input.focus();

        },
        100
      );
    }
  },


  /*
   * ============================================================
   * CLOSE GLOBAL SEARCH
   * ============================================================
   */

  closeGlobalSearch() {

    const modal =
      document.getElementById(
        'global-search-modal'
      );


    if (modal) {

      modal.classList.add(
        'hidden'
      );
    }


    document.body.style.overflow =
      '';


    const input =
      document.getElementById(
        'global-search-modal-input'
      );


    if (input) {

      input.value = '';
    }


    /*
     * Clear pending debounce.
     */

    if (
      this.globalSearchTimer
    ) {

      clearTimeout(
        this.globalSearchTimer
      );
    }
  },

  renderPopularDestinations() {
    const container = document.getElementById('home-destinations-container');
    const exploreContainer = document.getElementById('explore-destinations-container');
    if (!container && !exploreContainer) return;
    if (!RAAHI_DATA.destinations) return;

    const renderFn = (d) => {
      if (typeof RaahiDestinations !== 'undefined' && RaahiDestinations.createDestinationCard) {
        return RaahiDestinations.createDestinationCard(d);
      }
      return '';
    };

    if (container) {
      container.innerHTML = RAAHI_DATA.destinations.map(renderFn).join('');
    }

    if (exploreContainer) {
      if (typeof RaahiDestinations !== 'undefined' && RaahiDestinations.renderExploreList) {
        RaahiDestinations.renderExploreList();
      } else {
        exploreContainer.innerHTML = RAAHI_DATA.destinations.map(renderFn).join('');
      }
    }
  },


  // Section 6 & 12: AI Recommendations with "Why this recommendation?" trust trigger
  renderAIRecommendations() {
    const container = document.getElementById('home-ai-recommendations-container');
    if (!container || !RAAHI_DATA.places) return;

    const aiList = RAAHI_DATA.places.filter(p => p.aiPick);

    container.innerHTML = aiList.map(place => {
      const isSaved = typeof RaahiAuth !== 'undefined' && RaahiAuth.isSaved(place.id);
      return `
        <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
          <div class="relative h-56 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img src="${place.image}" alt="${place.name}" loading="lazy" class="w-full h-full object-cover img-zoom">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
              <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-600 text-white flex items-center gap-1 shadow-sm">
                <span class="material-symbols-outlined text-sm">auto_awesome</span>
                Raahi AI Pick
              </span>
            </div>

            <button onclick="RaahiAuth.toggleSave('${place.id}')" title="Save Place" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-all z-10 shadow-sm">
              <span class="material-symbols-outlined text-base ${isSaved ? 'text-amber-600 fill-current' : ''}">
                ${isSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>

            <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
                  <span class="material-symbols-outlined text-sm">star</span>
                  ${place.rating} (${place.reviewsCount})
                </span>
                <span class="text-[11px] text-stone-300 font-medium">${place.city}, ${place.state}</span>
              </div>
            </div>
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                ${place.name}
              </h3>
              
              <!-- Transparent AI Reason Box (Section 6 & 12) -->
              <div class="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 mb-4 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs text-amber-600">psychology</span>
                    Why Raahi recommends this
                  </span>
                  <button onclick="RaahiApp.openAIExplanation('${place.aiReason.replace(/'/g, "\\'")}', '${place.name.replace(/'/g, "\\'")}')" class="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                    Why this?
                  </button>
                </div>
                <p class="text-xs text-stone-700 dark:text-stone-300 italic leading-relaxed">"${place.aiReason}"</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="RaahiPlaces.openDetailModal('${place.id}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1">
                <span>View Details</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button onclick="RaahiAuth.toggleSave('${place.id}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-sm ${isSaved ? 'text-amber-600' : ''}">${isSaved ? 'bookmark_added' : 'bookmark_add'}</span>
                <span>${isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Modal 11: Open AI Transparent Explanation
  openAIExplanation(reasonText, placeName) {
    const modal = document.getElementById('ai-explanation-modal');
    const content = document.getElementById('ai-explanation-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-2">
        <p class="font-bold text-stone-900 dark:text-white">Recommendation for ${placeName}:</p>
        <p class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-stone-800 dark:text-stone-200">
          "${reasonText}"
        </p>
        <div class="space-y-1 pt-1 text-[11px] text-stone-500">
          <p>• <strong>Factors evaluated:</strong> Visitor footfall, verified ASI preservation rating, seasonal daylight, proximity to cultural food clusters, and historical significance.</p>
          <p>• <strong>Pacing Match:</strong> Perfectly timed for relaxed morning or sunset exploration.</p>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeAIExplanation() {
    const modal = document.getElementById('ai-explanation-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-stone-900 dark:bg-stone-800';
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

    toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${bgClass} text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all duration-300 translate-y-12 opacity-0 pointer-events-none`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-base">${icon}</span>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-12', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-12', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Global Bootstrapper on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  RaahiApp.init();
});

if (typeof window !== 'undefined') {
  window.RaahiApp = RaahiApp;
}
