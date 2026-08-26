/**
 * RAAHI — Main Application Orchestrator & Client-Side Router
 * Brand: Raahi | Tagline: Safar Aapka, Planning Hamari
 * Primary AI Feature: Raahi AI Travel Planner & Intelligent Search Layer
 */

const RaahiApp = {
  currentRoute: 'home',
  darkMode: false,

  init() {
    this.initTheme();
    this.initRouter();
    this.initNavLinks();
    this.initMobileMenu();
    this.initGlobalSearch();
    this.initHomeSearch();

    // Initialize all domain submodules
    if (typeof RaahiAPI !== 'undefined') RaahiAPI.init();
    if (typeof RaahiCityHub !== 'undefined') RaahiCityHub.init();
    if (typeof RaahiAuth !== 'undefined') RaahiAuth.init();
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
    if (typeof RaahiAdmin !== 'undefined') RaahiAdmin.init();
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
    this.handleHashChange();
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

    if (hash === 'destinations' || hash === 'cities') hash = 'explore';

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
      'home', 'explore', 'city', 'places', 'hotels', 'restaurants',
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

    // Toggle view sections
    document.querySelectorAll('.view-section').forEach(view => {
      if (view.id === `view-${routeId}`) {
        view.classList.remove('hidden-view');
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
      }
    });

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

  initGlobalSearch() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openGlobalSearch();
      }
    });

    const searchInput = document.getElementById('global-search-modal-input');
    const resultsContainer = document.getElementById('global-search-results');

    if (searchInput && resultsContainer) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          resultsContainer.innerHTML = '<div class="p-6 text-center text-xs text-stone-400">Type to discover monuments, stays, food, and events...</div>';
          return;
        }

        const matchedPlaces = (RAAHI_DATA.places || []).filter(p => p.name.toLowerCase().includes(query) || p.city.toLowerCase().includes(query));
        const matchedHotels = (RAAHI_DATA.hotels || []).filter(h => h.name.toLowerCase().includes(query) || h.city.toLowerCase().includes(query));
        const matchedRest = (RAAHI_DATA.restaurants || []).filter(r => r.name.toLowerCase().includes(query) || r.cuisine.toLowerCase().includes(query));

        let html = '';

        if (matchedPlaces.length > 0) {
          html += `<div class="p-3 bg-stone-50 dark:bg-stone-800/80 font-bold text-[10px] uppercase text-amber-600">Tourist Places</div>`;
          html += matchedPlaces.slice(0, 3).map(p => `
            <div onclick="RaahiApp.closeGlobalSearch(); RaahiPlaces.openDetailModal('${p.id}')" class="p-3 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-stone-800 cursor-pointer border-b border-stone-100 dark:border-stone-800">
              <div>
                <h5 class="text-xs font-bold text-stone-900 dark:text-white">${p.name}</h5>
                <span class="text-[11px] text-stone-500">${p.city} • ${p.category}</span>
              </div>
              <span class="text-xs text-amber-500 font-bold">★ ${p.rating}</span>
            </div>
          `).join('');
        }

        if (matchedHotels.length > 0) {
          html += `<div class="p-3 bg-stone-50 dark:bg-stone-800/80 font-bold text-[10px] uppercase text-emerald-600">Hotels (Discovery)</div>`;
          html += matchedHotels.slice(0, 2).map(h => `
            <div onclick="RaahiApp.closeGlobalSearch(); RaahiHotels.openHotelModal('${h.id}')" class="p-3 flex items-center justify-between hover:bg-emerald-50/50 dark:hover:bg-stone-800 cursor-pointer border-b border-stone-100 dark:border-stone-800">
              <div>
                <h5 class="text-xs font-bold text-stone-900 dark:text-white">${h.name}</h5>
                <span class="text-[11px] text-stone-500">${h.city} • ${h.category}</span>
              </div>
              <span class="text-xs text-amber-500 font-bold">★ ${h.rating}</span>
            </div>
          `).join('');
        }

        if (matchedRest.length > 0) {
          html += `<div class="p-3 bg-stone-50 dark:bg-stone-800/80 font-bold text-[10px] uppercase text-amber-700">Restaurants</div>`;
          html += matchedRest.slice(0, 2).map(r => `
            <div onclick="RaahiApp.closeGlobalSearch(); RaahiRestaurants.openRestModal('${r.id}')" class="p-3 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-stone-800 cursor-pointer border-b border-stone-100 dark:border-stone-800">
              <div>
                <h5 class="text-xs font-bold text-stone-900 dark:text-white">${r.name}</h5>
                <span class="text-[11px] text-stone-500">${r.cuisine} • ${r.city}</span>
              </div>
              <span class="text-xs text-amber-500 font-bold">★ ${r.rating}</span>
            </div>
          `).join('');
        }

        if (!html) {
          resultsContainer.innerHTML = `<div class="p-6 text-center text-xs text-stone-500">No matching results found for "${query}".</div>`;
        } else {
          resultsContainer.innerHTML = html;
        }
      });
    }
  },

  openGlobalSearch() {
    const modal = document.getElementById('global-search-modal');
    const input = document.getElementById('global-search-modal-input');
    if (modal) {
      modal.classList.remove('hidden');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
      }
      document.body.style.overflow = 'hidden';
    }
  },

  closeGlobalSearch() {
    const modal = document.getElementById('global-search-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
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
