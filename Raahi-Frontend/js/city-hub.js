/**
 * RAAHI — City Details & Travel Hub Controller
 * "Safar Aapka, Planning Hamari"
 * Comprehensive travel hub for selected cities with backend API integration,
 * live climate suitability diagnostics, category switcher, and server-side pagination.
 */

const RaahiCityHub = {
  currentCityId: "lucknow",
  cityData: null,
  weatherData: null,
  activeCategory: "hotels", // 'hotels' | 'restaurants' | 'events' | 'guides' | 'emergency'
  currentPage: 1,
  limit: 4,
  totalPages: 1,
  totalItems: 0,
  hasNext: false,
  hasPrev: false,
  items: [],
  isLoading: false,
  searchQuery: "",
  selectedMonth: "Nov",

  async init() {
    this.bindEvents();
  },

  bindEvents() {
    // Category switching buttons
    document.addEventListener("click", (e) => {
      const catBtn = e.target.closest(".city-cat-tab-btn");
      if (catBtn) {
        const cat = catBtn.getAttribute("data-category");
        if (cat && cat !== this.activeCategory) {
          this.switchCategory(cat);
        }
      }

      const pageBtn = e.target.closest(".city-page-btn");
      if (pageBtn) {
        const pageNum = parseInt(pageBtn.getAttribute("data-page"), 10);
        if (
          !isNaN(pageNum) &&
          pageNum !== this.currentPage &&
          pageNum >= 1 &&
          pageNum <= this.totalPages
        ) {
          this.goToPage(pageNum);
        }
      }
    });
  },

  // Main entrypoint when user opens/selects a city
async openCity(
  cityId = "lucknow",
  initialCategory = "hotels",
  initialSearch = ""
) {
  if (!cityId) {
    cityId = "lucknow";
  }

  this.currentCityId =
    String(cityId)
      .toLowerCase()
      .replace(/[^a-z]/g, "");

  // Center map on selected city
 

  // Category
  this.activeCategory =
    initialCategory || "hotels";

  // Reset pagination
  this.currentPage = 1;

  // IMPORTANT:
  // Keep the search term passed by global search.
  this.searchQuery =
    String(initialSearch || "").trim();

  // Update URL
  let newHash =
    `city?id=${encodeURIComponent(this.currentCityId)}` +
    `&cat=${encodeURIComponent(this.activeCategory)}`;

  // Preserve selected search term in URL
  if (this.searchQuery) {
    newHash +=
      `&search=${encodeURIComponent(this.searchQuery)}`;
  }

  window.location.hash = newHash;

  // Switch to EXISTING City view
  if (typeof RaahiApp !== "undefined") {
    RaahiApp.navigate("city", false);
  }

  // Scroll to top
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  // Render existing City Hub layout
  this.renderInitialLayout();

  // Put selected search term into EXISTING City Hub search box
  const searchInput =
    document.getElementById(
      "city-category-search-input"
    );

  if (searchInput) {
    searchInput.value =
      this.searchQuery;

    searchInput.placeholder =
      `Search in ${this.activeCategory}...`;
  }

  // Fetch city overview + weather
await Promise.all([
  this.fetchCityOverview(),
  this.fetchWeather()
]);

// Center map using the REAL resolved city name
if (
  typeof RaahiMap !== "undefined" &&
  typeof RaahiMap.setCity === "function"
) {
  RaahiMap.setCity(
    this.cityData?.name ||
    this.currentCityId
  );
}

// Fetch existing category
await this.fetchCategoryData();
},

  openMap() {
    // Open the existing Map view
    if (typeof RaahiApp !== "undefined") {
      RaahiApp.navigate("map");
    }

    // Initialize the map after the Map view becomes visible
    setTimeout(() => {
      if (
        typeof RaahiMap !== "undefined" &&
        typeof RaahiMap.initLeafletMap === "function"
      ) {
        RaahiMap.initLeafletMap();
      }
    }, 200);
  },

  // Renders the overall structural containers
  renderInitialLayout() {
    const container = document.getElementById("view-city");
    if (!container) return;

    container.innerHTML = `
      <!-- Breadcrumb Bar -->
      <div class="mb-6 flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
        <a href="#home" class="hover:text-amber-600 transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">home</span>
          <span>Home</span>
        </a>
        <span>/</span>
        <a href="#explore" class="hover:text-amber-600 transition-colors">Destinations</a>
        <span>/</span>
        <span id="city-breadcrumb-name" class="text-amber-600 dark:text-amber-400 capitalize font-bold">${this.currentCityId}</span>
        <span>/</span>
        <span class="text-stone-700 dark:text-stone-300 font-bold capitalize" id="city-breadcrumb-cat">${this.activeCategory}</span>
      </div>

      <!-- Top City Hero Banner Container -->
      <div id="city-hero-container" class="mb-8">
        <div class="h-64 sm:h-80 md:h-96 w-full rounded-3xl overflow-hidden bg-stone-200 dark:bg-stone-800 animate-pulse flex items-end p-8">
          <div class="h-8 w-48 bg-stone-300 dark:bg-stone-700 rounded-xl"></div>
        </div>
      </div>

      <!-- Live Weather Information & Climate Diagnostics Card -->
      <div id="city-weather-container" class="mb-8">
        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse h-32"></div>
      </div>

      <!-- Quick Navigation / Category Selection Bar -->
      <div class="mb-8 sticky top-20 z-30 bg-[#faf8f5]/95 dark:bg-stone-950/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-y border-stone-200/60 dark:border-stone-800/60">
        <div class="flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar">
          <div class="flex items-center gap-2">
            <button data-category="places" class="city-cat-tab-btn ${this.activeCategory === "places" ? "active-cat-btn" : "inactive-cat-btn"}">
              <span class="material-symbols-outlined text-base">museum</span>
              <span>Places &amp; Sights</span>
            </button>
            <button data-category="hotels" class="city-cat-tab-btn ${this.activeCategory === "hotels" ? "active-cat-btn" : "inactive-cat-btn"}">
              <span class="material-symbols-outlined text-base">hotel</span>
              <span>Hotels &amp; Stays</span>
            </button>
            <button data-category="restaurants" class="city-cat-tab-btn ${this.activeCategory === "restaurants" ? "active-cat-btn" : "inactive-cat-btn"}">
              <span class="material-symbols-outlined text-base">restaurant</span>
              <span>Restaurants &amp; Food</span>
            </button>
            <button data-category="events" class="city-cat-tab-btn ${this.activeCategory === "events" ? "active-cat-btn" : "inactive-cat-btn"}">
              <span class="material-symbols-outlined text-base">event</span>
              <span>Cultural Events</span>
            </button>
            <button data-category="guides" class="city-cat-tab-btn ${this.activeCategory === "guides" ? "active-cat-btn" : "inactive-cat-btn"}">
              <span class="material-symbols-outlined text-base">badge</span>
              <span>Local Guides</span>
            </button>
            <button data-category="vehicles" class="city-cat-tab-btn ${this.activeCategory === "vehicles" ? "active-cat-btn" : "inactive-cat-btn"}">
              <span class="material-symbols-outlined text-base">directions_car</span>
              <span>Tourist Vehicles</span>
            </button>
            <button data-category="emergency" class="city-cat-tab-btn ${this.activeCategory === "emergency" ? "active-cat-btn" : "inactive-cat-btn"}">
              <span class="material-symbols-outlined text-base text-red-500">emergency</span>
              <span>Emergency Services</span>
            </button>

            <button
  type="button"
  onclick="RaahiCityHub.openMap()"  class="city-cat-tab-btn inactive-cat-btn"
>
  <span class="material-symbols-outlined text-base">map</span>
  <span>Map</span>
</button>

<button
  type="button"
onclick="document.getElementById('city-weather-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })"
  class="city-cat-tab-btn inactive-cat-btn"
>
  <span class="material-symbols-outlined text-base">cloud</span>
  <span>Weather</span>
</button>
          </div>

          <!-- Quick City Switcher Dropdown -->
          <div class="shrink-0 flex items-center gap-2 pl-2">
            <span class="text-xs font-bold text-stone-500 hidden sm:inline">Change City:</span>
            <select onchange="RaahiCityHub.openCity(this.value, RaahiCityHub.activeCategory)" class="py-1.5 px-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 outline-none focus:ring-1 focus:ring-amber-500">
              <option value="lucknow" ${this.currentCityId === "lucknow" ? "selected" : ""}>Lucknow</option>
              <option value="agra" ${this.currentCityId === "agra" ? "selected" : ""}>Agra</option>
              <option value="varanasi" ${this.currentCityId === "varanasi" ? "selected" : ""}>Varanasi</option>
              <option value="jaipur" ${this.currentCityId === "jaipur" ? "selected" : ""}>Jaipur</option>
              <option value="delhi" ${this.currentCityId === "delhi" ? "selected" : ""}>Delhi</option>
              <option value="goa" ${this.currentCityId === "goa" ? "selected" : ""}>Goa</option>
              <option value="kerala" ${this.currentCityId === "kerala" ? "selected" : ""}>Kerala</option>
              <option value="kashmir" ${this.currentCityId === "kashmir" ? "selected" : ""}>Kashmir</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Category Display Container -->
      <div id="city-category-content-area" class="space-y-6">
        <!-- Dynamic Category Header & Filter Bar -->
        <div id="city-category-header" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="city-section-title" class="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
              <span>Loading Category...</span>
            </h2>
            <p id="city-section-subtitle" class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              Fetching verified listings from backend database...
            </p>
          </div>

          <!-- In-category search -->
          <div class="relative w-full sm:w-72">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base">search</span>
            <input id="city-category-search-input" type="text" placeholder="Search in ${this.activeCategory}..."
              oninput="RaahiCityHub.handleSearchInput(this.value)"
              class="w-full pl-10 pr-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs">
          </div>
        </div>

        <!-- Cards Grid Container (Populated dynamically) -->
        <div id="city-cards-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
          <!-- Skeletons rendered here initially -->
        </div>

        <!-- Server-Side Pagination Bar Container -->
        <div id="city-pagination-bar" class="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    this.renderSkeletons();
  },

  // Skeletons while fetching
  renderSkeletons() {
    const grid = document.getElementById("city-cards-grid");
    if (!grid) return;

    grid.innerHTML = Array.from({ length: 4 })
      .map(
        () => `
      <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm animate-pulse space-y-4">
        <div class="h-48 w-full bg-stone-200 dark:bg-stone-800 rounded-xl"></div>
        <div class="space-y-2">
          <div class="h-5 w-3/4 bg-stone-200 dark:bg-stone-800 rounded"></div>
          <div class="h-3 w-1/2 bg-stone-200 dark:bg-stone-800 rounded"></div>
          <div class="h-3 w-full bg-stone-200 dark:bg-stone-800 rounded"></div>
        </div>
        <div class="flex gap-2 pt-2">
          <div class="h-9 w-1/2 bg-stone-200 dark:bg-stone-800 rounded-xl"></div>
          <div class="h-9 w-1/2 bg-stone-200 dark:bg-stone-800 rounded-xl"></div>
        </div>
      </div>
    `,
      )
      .join("");
  },

  // Fetch City Overview data from API
  async fetchCityOverview() {
    try {
      this.cityData = await RaahiAPI.getCity(this.currentCityId);
      this.renderCityHero();
    } catch (e) {
      console.warn("Failed to load city overview:", e);
    }
  },

  // Render City Hero Section
  renderCityHero() {
    const container = document.getElementById("city-hero-container");
    const breadcrumbName = document.getElementById("city-breadcrumb-name");
    if (!container || !this.cityData) return;

    if (breadcrumbName) {
      breadcrumbName.textContent = this.cityData.name;
    }

    // High quality imagery mapping for Indian destinations
    const imageMap = {
      lucknow:
        "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1400&q=80",
      agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1400&q=80",
      varanasi:
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1400&q=80",
      jaipur:
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1400&q=80",
      delhi:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1400&q=80",
      goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=80",
      kerala:
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80",
      kashmir:
        "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1400&q=80",
    };

    const heroImg =
      this.cityData.image ||
      imageMap[this.currentCityId] ||
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1400&q=80";

    container.innerHTML = `
      <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-stone-900 group">
        <!-- Hero Background Image with Parallax / Zoom -->
        <div class="relative h-72 sm:h-96 w-full overflow-hidden">
          <img src="${heroImg}" alt="${this.cityData.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
          <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20"></div>

          <!-- Top Status Pill Badges -->
          <div class="absolute top-6 left-6 right-6 flex items-center justify-between flex-wrap gap-2 z-10">
            <div class="flex items-center gap-2">
              <span class="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                <span class="material-symbols-outlined text-sm text-amber-400">verified</span>
                <span>Verified City Travel Hub</span>
              </span>
              <span class="px-3.5 py-1.5 rounded-full bg-amber-600/90 text-white text-xs font-extrabold shadow-md">
                ${this.cityData.state}
              </span>
            </div>

            <!-- Quick Action Buttons (Save City, Plan Trip) -->
            <div class="flex items-center gap-2">
              <button onclick="RaahiPlanner.startQuickPlan('${this.cityData.id}')" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Plan AI Trip</span>
              </button>
            </div>
          </div>

          <!-- Hero Bottom Details -->
          <div class="absolute bottom-6 left-6 right-6 text-white z-10 space-y-3">
            <div>
              <span class="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-widest block mb-1">
                ${this.cityData.tagline || "Incredible India Heritage Destination"}
              </span>
              <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                ${this.cityData.name}
              </h1>
            </div>

            <p class="text-xs sm:text-sm text-stone-200 max-w-3xl leading-relaxed line-clamp-2 sm:line-clamp-none font-medium">
              ${this.cityData.description}
            </p>

            <!-- Quick Stats Counters -->
            <div class="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1">
              <div class="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-semibold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-amber-400">account_balance</span>
                <span>${this.cityData.attractionsCount || 20}+ Top Sights</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-semibold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-emerald-400">hotel</span>
                <span>Verified Stays</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-semibold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-amber-400">restaurant</span>
                <span>Regional Gastronomy</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-semibold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-blue-400">shield</span>
                <span>Safety Index: ${this.cityData.safetyScore || 9.0}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Fetch Weather Diagnostics from Backend
async fetchWeather() {
  try {
    // Capture the city name at the exact moment
    // this request starts.
    const cityName =
      this.cityData?.name ||
      this.currentCityId;

    if (!cityName) {
      console.warn(
        "[RaahiCityHub] No city available for weather"
      );
      return;
    }

    // Fetch weather specifically for this city.
    const weather =
      await RaahiAPI.getWeather(cityName);

    // IMPORTANT:
    // If the user changed city while the request
    // was running, don't display the old request's
    // result on the new city.
    const currentCityName =
      this.cityData?.name ||
      this.currentCityId;

    if (
      String(currentCityName).toLowerCase() !==
      String(cityName).toLowerCase()
    ) {
      console.log(
        "[RaahiCityHub] Ignoring stale weather response for:",
        cityName
      );
      return;
    }

    this.weatherData = weather;

    this.renderWeather();

  } catch (e) {

    console.warn(
      "[RaahiCityHub] Failed to load weather:",
      e
    );
  }
},

  // Render Live Weather & Climate Suitability Widget

  renderWeather() {
    const container = document.getElementById("city-weather-container");

    if (!container || !this.weatherData) return;

    const w = this.weatherData;
    const current = w.current || {};
    const location = w.location || {};
    const forecast = w.forecast || {};

    const weatherCodeText = (code) => {
      const map = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Rime fog",
        51: "Light drizzle",
        53: "Drizzle",
        55: "Heavy drizzle",
        61: "Light rain",
        63: "Rain",
        65: "Heavy rain",
        71: "Light snow",
        73: "Snow",
        75: "Heavy snow",
        80: "Rain showers",
        81: "Rain showers",
        82: "Heavy rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with hail",
      };

      return map[code] || "Weather conditions";
    };

    const weatherIcon = (code) => {
      if (code === 0) return "sunny";
      if (code <= 3) return "partly_cloudy_day";
      if (code <= 48) return "foggy";
      if (code <= 67) return "rainy";
      if (code <= 77) return "ac_unit";
      if (code <= 82) return "rainy";
      return "thunderstorm";
    };

    const formatDay = (dateString) => {
      if (!dateString) return "";

      const date = new Date(dateString + "T00:00:00");

      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    };

    const dates = Array.isArray(forecast.dates) ? forecast.dates : [];

    const maxTemps = Array.isArray(forecast.maxTemperature)
      ? forecast.maxTemperature
      : [];

    const minTemps = Array.isArray(forecast.minTemperature)
      ? forecast.minTemperature
      : [];

    const forecastCodes = Array.isArray(forecast.weatherCode)
      ? forecast.weatherCode
      : [];

    const rainProbabilities = Array.isArray(forecast.precipitationProbability)
      ? forecast.precipitationProbability
      : [];

    const forecastCards = dates
      .map(
        (date, index) => `
    <div class="min-w-[120px] flex-1 p-4 rounded-2xl
      bg-white dark:bg-stone-900
      border border-stone-200 dark:border-stone-800
      text-center">

      <p class="text-xs font-bold text-stone-500 dark:text-stone-400">
        ${formatDay(date)}
      </p>

      <span class="material-symbols-outlined text-3xl
        text-amber-500 my-2">
        ${weatherIcon(forecastCodes[index])}
      </span>

      <p class="text-sm font-bold text-stone-900 dark:text-white">
        ${Math.round(maxTemps[index] ?? 0)}°
        <span class="text-stone-400 font-normal">
          / ${Math.round(minTemps[index] ?? 0)}°
        </span>
      </p>

      <p class="text-[11px] text-stone-500 mt-1">
        ${weatherCodeText(forecastCodes[index])}
      </p>

      <p class="text-[10px] text-blue-600 dark:text-blue-400 mt-2 font-bold">
        ${rainProbabilities[index] ?? 0}% rain
      </p>
    </div>
  `,
      )
      .join("");

    container.innerHTML = `
    <div class="rounded-3xl overflow-hidden
      bg-gradient-to-br from-amber-500/10
      via-white to-stone-50
      dark:from-stone-900 dark:via-stone-900 dark:to-stone-950
      border border-stone-200 dark:border-stone-800
      shadow-sm">

      <!-- Current Weather -->
      <div class="p-6 sm:p-7">

        <div class="flex flex-col lg:flex-row
          lg:items-center lg:justify-between gap-6">

          <div class="flex items-start gap-4">

            <div class="w-16 h-16 rounded-2xl
              bg-amber-500 text-white
              flex items-center justify-center
              shadow-lg shadow-amber-500/20 shrink-0">

              <span class="material-symbols-outlined text-4xl">
                ${weatherIcon(current.weatherCode)}
              </span>

            </div>

            <div>

              <div class="flex items-center gap-2 flex-wrap">

                <span class="text-xs font-extrabold
                  uppercase tracking-wider
                  text-amber-700 dark:text-amber-400">
                  Live Weather
                </span>

                <span class="px-2 py-0.5 rounded-full
                  bg-emerald-100 dark:bg-emerald-950/40
                  text-emerald-700 dark:text-emerald-300
                  text-[10px] font-bold">
                  LIVE
                </span>

              </div>

              <h3 class="font-heading text-xl sm:text-2xl
                font-black text-stone-900 dark:text-white mt-1">
                ${location.city || this.currentCityId}
              </h3>

              <p class="text-xs text-stone-500 mt-1">
                ${location.state || "India"}
              </p>

            </div>
          </div>

          <div class="flex items-center gap-4">

            <div class="text-right">

              <div class="flex items-start justify-end">

                <span class="text-5xl sm:text-6xl
                  font-black text-stone-900 dark:text-white">
                  ${Math.round(current.temperature ?? 0)}°
                </span>

                <span class="text-sm text-stone-500 mt-2">
                  C
                </span>

              </div>

              <p class="text-sm font-semibold
                text-stone-600 dark:text-stone-400">
                ${weatherCodeText(current.weatherCode)}
              </p>

            </div>

          </div>
        </div>

        <!-- Weather Metrics -->

        <div class="grid grid-cols-2 sm:grid-cols-4
          gap-3 mt-6">

          <div class="p-3 rounded-2xl
            bg-stone-100/70 dark:bg-stone-800/60">

            <span class="material-symbols-outlined
              text-blue-500 text-lg">
              thermostat
            </span>

            <p class="text-[10px] uppercase
              font-bold text-stone-400 mt-1">
              Feels Like
            </p>

            <p class="text-sm font-black
              text-stone-900 dark:text-white">
              ${Math.round(current.apparentTemperature ?? 0)}°C
            </p>
          </div>

          <div class="p-3 rounded-2xl
            bg-stone-100/70 dark:bg-stone-800/60">

            <span class="material-symbols-outlined
              text-blue-500 text-lg">
              humidity_percentage
            </span>

            <p class="text-[10px] uppercase
              font-bold text-stone-400 mt-1">
              Humidity
            </p>

            <p class="text-sm font-black
              text-stone-900 dark:text-white">
              ${current.humidity ?? 0}%
            </p>
          </div>

          <div class="p-3 rounded-2xl
            bg-stone-100/70 dark:bg-stone-800/60">

            <span class="material-symbols-outlined
              text-blue-500 text-lg">
              air
            </span>

            <p class="text-[10px] uppercase
              font-bold text-stone-400 mt-1">
              Wind
            </p>

            <p class="text-sm font-black
              text-stone-900 dark:text-white">
              ${current.windSpeed ?? 0} km/h
            </p>
          </div>

          <div class="p-3 rounded-2xl
            bg-stone-100/70 dark:bg-stone-800/60">

            <span class="material-symbols-outlined
              text-amber-500 text-lg">
              location_on
            </span>

            <p class="text-[10px] uppercase
              font-bold text-stone-400 mt-1">
              Location
            </p>

            <p class="text-sm font-black
              text-stone-900 dark:text-white">
              ${location.country || "India"}
            </p>
          </div>

        </div>

      </div>

      <!-- 5 Day Forecast -->

      <div class="px-6 pb-6">

        <div class="flex items-center justify-between mb-3">

          <div>
            <p class="text-xs font-extrabold
              uppercase tracking-wider
              text-stone-400">
              Forecast
            </p>

            <h4 class="font-heading text-base font-bold
              text-stone-900 dark:text-white">
              Next 5 Days
            </h4>
          </div>

          <span class="text-[10px] font-bold
            text-stone-400">
            Open-Meteo
          </span>

        </div>

        <div class="flex gap-3 overflow-x-auto pb-2">
          ${forecastCards}
        </div>

      </div>

    </div>
  `;
  },

  async changeWeatherMonth(newMonth) {
    this.selectedMonth = newMonth;
    await this.fetchWeather();
  },

  // Category Switcher Action
  async switchCategory(newCategory) {
    this.activeCategory = newCategory;
    this.currentPage = 1; // Critical requirement: reset pagination to page 1 on category switch
    this.searchQuery = "";

    // Update URL hash
    window.location.hash = `city?id=${this.currentCityId}&cat=${this.activeCategory}`;

    // Update breadcrumb
    const breadcrumbCat = document.getElementById("city-breadcrumb-cat");
    if (breadcrumbCat) breadcrumbCat.textContent = newCategory;

    // Update active tab styles
    document.querySelectorAll(".city-cat-tab-btn").forEach((btn) => {
      if (btn.getAttribute("data-category") === newCategory) {
        btn.className = "city-cat-tab-btn active-cat-btn";
      } else {
        btn.className = "city-cat-tab-btn inactive-cat-btn";
      }
    });

    // Reset search input
    const searchInput = document.getElementById("city-category-search-input");
    if (searchInput) {
      searchInput.value = "";
      searchInput.placeholder = `Search in ${newCategory}...`;
    }

    // Render loading skeletons and fetch page 1 from backend
    this.renderSkeletons();
    await this.fetchCategoryData();
  },

  // In-category search input handler
  handleSearchInput(query) {
    this.searchQuery = query.trim();
    this.currentPage = 1;
    this.fetchCategoryData();
  },

  // Pagination page click handler (Makes fresh server-side API call for that page)
  async goToPage(pageNum) {
    if (
      pageNum < 1 ||
      pageNum > this.totalPages ||
      pageNum === this.currentPage
    )
      return;
    this.currentPage = pageNum;

    // Smooth scroll to top of category section
    const contentArea = document.getElementById("city-category-content-area");
    if (contentArea) {
      const topOffset =
        contentArea.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }

    this.renderSkeletons();
    await this.fetchCategoryData();
  },

  // Fetch Category Data with Server-Side Pagination
  async fetchCategoryData() {
    this.isLoading = true;

    const cat = this.activeCategory;
    const city = this.currentCityId;
    const page = this.currentPage;
    const limit = this.limit;
    const query = this.searchQuery;

    let res = null;

    try {
      // =========================================================
      // PLACES
      // =========================================================
      if (cat === "places") {
        const cityName = this.cityData?.name || city;

        const response = await RaahiAPI.get(
          `/api/places/city/${encodeURIComponent(cityName)}`,
        );

        if (!response || !Array.isArray(response.places)) {
          throw new Error(response?.message || "Invalid places response");
        }

        let list = response.places.map((place) => {
          if (
            typeof RaahiPlaces !== "undefined" &&
            typeof RaahiPlaces.normalizePlace === "function"
          ) {
            return RaahiPlaces.normalizePlace(place);
          }

          return place;
        });

        // Make City Hub places available to the main Places detail modal.
        if (
          typeof RAAHI_DATA !== "undefined" &&
          Array.isArray(RAAHI_DATA.places)
        ) {
          list.forEach((place) => {
            const index = RAAHI_DATA.places.findIndex(
              (existing) => existing.id === place.id,
            );

            if (index === -1) {
              RAAHI_DATA.places.push(place);
            } else {
              RAAHI_DATA.places[index] = place;
            }
          });
        }

        // Search inside selected city's places
        if (query) {
          const q = query.toLowerCase().trim();

          list = list.filter(
            (p) =>
              (p.name || "").toLowerCase().includes(q) ||
              (p.description || "").toLowerCase().includes(q),
          );
        }

        const total = list.length;

        const start = (page - 1) * limit;

        const paginated = list.slice(start, start + limit);

        res = {
          data: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };

        // =========================================================
        // VEHICLES
        // =========================================================
      } else if (cat === "vehicles") {
        const cityName = this.cityData?.name || city;

        const response = await RaahiAPI.get(
          `/api/vehicles/city/${encodeURIComponent(cityName)}`,
        );

        if (!response || !Array.isArray(response.data)) {
          throw new Error(
            response?.message || "Invalid city vehicles response",
          );
        }

        let list = response.data;

        // Search within selected city's vehicles
        if (query) {
          const q = query.toLowerCase().trim();

          list = list.filter(
            (vehicle) =>
              (vehicle.name || "").toLowerCase().includes(q) ||
              (vehicle.description || "").toLowerCase().includes(q) ||
              (vehicle.city || "").toLowerCase().includes(q) ||
              (vehicle.category || "").toLowerCase().includes(q),
          );
        }

        const total = list.length;

        const start = (page - 1) * limit;

        const paginated = list.slice(start, start + limit);

        res = {
          data: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };

        // =========================================================
        // HOTELS
        // =========================================================
      } else if (cat === "hotels") {
        const cityName = this.cityData?.name || city;

        const response = await RaahiAPI.get(
          `/api/hotels/city/${encodeURIComponent(cityName)}`,
        );

        if (!response || !Array.isArray(response.data)) {
          throw new Error(response?.message || "Invalid city hotels response");
        }

        let list = response.data;

        // Search within selected city's hotels
        if (query) {
          const q = query.toLowerCase().trim();

          list = list.filter(
            (h) =>
              (h.name || "").toLowerCase().includes(q) ||
              (h.description || "").toLowerCase().includes(q) ||
              (h.city || "").toLowerCase().includes(q),
          );
        }

        const total = list.length;

        const start = (page - 1) * limit;

        const paginated = list.slice(start, start + limit);

        res = {
          data: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };
        // =========================================================
        // RESTAURANTS
        // =========================================================
      } else if (cat === "restaurants") {
        const cityName = this.cityData?.name || city;

        const response = await RaahiAPI.get(
          `/api/restaurants/city/${encodeURIComponent(cityName)}`,
        );

        if (!response || !Array.isArray(response.data)) {
          throw new Error(
            response?.message || "Invalid city restaurants response",
          );
        }

        let list = response.data;

        // Search within selected city's restaurants
        if (query) {
          const q = query.toLowerCase().trim();

          list = list.filter(
            (r) =>
              (r.name || "").toLowerCase().includes(q) ||
              (r.description || "").toLowerCase().includes(q) ||
              (r.city || "").toLowerCase().includes(q),
          );
        }

        const total = list.length;

        const start = (page - 1) * limit;

        const paginated = list.slice(start, start + limit);

        res = {
          data: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };

        // =========================================================
        // EVENTS
        // =========================================================
      } else if (cat === "events") {
        const cityName = this.cityData?.name || city;

        const response = await RaahiAPI.get(
          `/api/events/city/${encodeURIComponent(cityName)}`,
        );

        if (!response || !Array.isArray(response.data)) {
          throw new Error(response?.message || "Invalid city events response");
        }

        let list = response.data;

        // Search within selected city's events
        if (query) {
          const q = query.toLowerCase().trim();

          list = list.filter(
            (event) =>
              (event.name || "").toLowerCase().includes(q) ||
              (event.description || "").toLowerCase().includes(q) ||
              (event.city || "").toLowerCase().includes(q),
          );
        }

        const total = list.length;

        const start = (page - 1) * limit;

        const paginated = list.slice(start, start + limit);

        res = {
          data: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };
        // =========================================================
        // GUIDES
        // =========================================================
      } else if (cat === "guides") {
        const cityName = this.cityData?.name || city;

        const response = await RaahiAPI.get(
          `/api/guides/city/${encodeURIComponent(cityName)}`,
        );

        if (!response || !Array.isArray(response.data)) {
          throw new Error(response?.message || "Invalid city guides response");
        }

        let list = response.data;

        // Search within selected city's guides
        if (query) {
          const q = query.toLowerCase().trim();

          list = list.filter(
            (guide) =>
              (guide.name || "").toLowerCase().includes(q) ||
              (guide.about || "").toLowerCase().includes(q) ||
              (guide.city || "").toLowerCase().includes(q) ||
              (guide.specialization || "").toLowerCase().includes(q),
          );
        }

        const total = list.length;

        const start = (page - 1) * limit;

        const paginated = list.slice(start, start + limit);

        res = {
          data: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };

        // =========================================================
        // EMERGENCY
        // =========================================================
      } else if (cat === "emergency") {
        const cityName = this.cityData?.name || city;

        const response = await RaahiAPI.get(
          `/api/emergency/city/${encodeURIComponent(cityName)}`,
        );

        if (!response || !Array.isArray(response.data)) {
          throw new Error(
            response?.message || "Invalid city emergency response",
          );
        }

        let list = response.data;

        // Search within selected city's emergency services
        if (query) {
          const q = query.toLowerCase().trim();

          list = list.filter(
            (service) =>
              (service.name || "").toLowerCase().includes(q) ||
              (service.address || "").toLowerCase().includes(q) ||
              (service.type || "").toLowerCase().includes(q) ||
              (service.city || "").toLowerCase().includes(q),
          );
        }

        const total = list.length;

        const start = (page - 1) * limit;

        const paginated = list.slice(start, start + limit);

        res = {
          data: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };
      }

      // =========================================================
      // APPLY RESPONSE
      // =========================================================
      if (res && Array.isArray(res.data) && res.pagination) {
        this.items = res.data;

        this.totalItems = res.pagination.total || 0;

        this.totalPages = res.pagination.totalPages || 1;

        this.hasNext = !!res.pagination.hasNext;

        this.hasPrev = !!res.pagination.hasPrev;
      } else {
        this.items = [];
        this.totalItems = 0;
        this.totalPages = 1;
        this.hasNext = false;
        this.hasPrev = false;
      }
    } catch (err) {
      console.error(`❌ Error fetching category ${cat}:`, err);

      this.items = [];
      this.totalItems = 0;
      this.totalPages = 1;
      this.hasNext = false;
      this.hasPrev = false;
    } finally {
      this.isLoading = false;

      this.renderCategoryHeader();
      this.renderCategoryCards();
      this.renderPaginationBar();
    }
  },

  // Update Category Header Titles
  renderCategoryHeader() {
    const title = document.getElementById("city-section-title");
    const subtitle = document.getElementById("city-section-subtitle");
    const cityName = this.cityData ? this.cityData.name : this.currentCityId;

    const headers = {
      places: {
        icon: "museum",
        title: `Tourist Places & Sights in ${cityName}`,
        subtitle: `Explore UNESCO monuments, heritage architecture, and iconic landmarks across ${cityName}.`,
      },
      hotels: {
        icon: "hotel",
        title: `Hotels & Heritage Stays in ${cityName}`,
        subtitle: `Discover verified heritage havelis, luxury boutique resorts, and comfort stays in ${cityName}.`,
      },
      restaurants: {
        icon: "restaurant",
        title: `Iconic Dining & Food Spots in ${cityName}`,
        subtitle: `Authentic regional flavors, famous street food joints, and celebrated culinary institutions.`,
      },
      events: {
        icon: "event",
        title: `Cultural Events & Festivals in ${cityName}`,
        subtitle: `Living traditions, spiritual celebrations, classical recitals, and seasonal fairs.`,
      },
      guides: {
        icon: "badge",
        title: `Certified Local Guides in ${cityName}`,
        subtitle: `Connect directly with government-certified historians, language experts, and heritage scholars.`,
      },
      vehicles: {
        icon: "directions_car",
        title: `Tourist Vehicles & Cabs in ${cityName}`,
        subtitle: `Verified tourist transport, outstation cabs, EV rentals, and heritage tours in ${cityName}.`,
      },
      emergency: {
        icon: "emergency",
        title: `24x7 Emergency Services & Helplines in ${cityName}`,
        subtitle: `Verified tourist police desks, apex trauma centers, and national toll-free helplines.`,
      },
    };

    const info = headers[this.activeCategory] || headers.hotels;
    if (title) {
      title.innerHTML = `
        <span class="material-symbols-outlined text-2xl text-amber-600">${info.icon}</span>
        <span>${info.title}</span>
      `;
    }
    if (subtitle) {
      subtitle.textContent = info.subtitle;
    }
  },

  // Render Responsive Cards Grid for the Active Category
  renderCategoryCards() {
    const grid = document.getElementById("city-cards-grid");
    if (!grid) return;

    if (!this.items || this.items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <span class="material-symbols-outlined text-6xl text-stone-300 dark:text-stone-600 mb-3 block">search_off</span>
          <h3 class="font-heading text-lg font-bold text-stone-700 dark:text-stone-300">No listings found in ${this.cityData ? this.cityData.name : this.currentCityId}</h3>
          <p class="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            ${this.searchQuery ? `No results match your search "${this.searchQuery}". Try clearing search keywords.` : "We are continuously indexing more verified listings for this destination."}
          </p>
          ${
            this.searchQuery
              ? `
            <button onclick="document.getElementById('city-category-search-input').value=''; RaahiCityHub.handleSearchInput('')" class="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
              Clear Search
            </button>
          `
              : ""
          }
        </div>
      `;
      return;
    }

    if (this.activeCategory === "places") {
      grid.innerHTML = this.items.map((p) => this.renderPlaceCard(p)).join("");
    } else if (this.activeCategory === "vehicles") {
      grid.innerHTML = this.items
        .map((v) => this.renderVehicleCard(v))
        .join("");
    } else if (this.activeCategory === "hotels") {
      grid.innerHTML = this.items
        .map((hotel) => this.renderHotelCard(hotel))
        .join("");
    } else if (this.activeCategory === "restaurants") {
      grid.innerHTML = this.items
        .map((rest) => this.renderRestaurantCard(rest))
        .join("");
    } else if (this.activeCategory === "events") {
      grid.innerHTML = this.items
        .map((ev) => this.renderEventCard(ev))
        .join("");
    } else if (this.activeCategory === "guides") {
      grid.innerHTML = this.items
        .map((guide) => this.renderGuideCard(guide))
        .join("");
    } else if (this.activeCategory === "emergency") {
      grid.innerHTML = this.items
        .map((srv) => this.renderEmergencyCard(srv))
        .join("");
    }
  },

  renderPlaceCard(p) {
    return `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
        <div class="relative h-60 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img src="${p.image}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white">${p.category || "Heritage"}</span>
          </div>
          <div class="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/80 text-white text-xs font-extrabold flex items-center gap-1">
            <span class="text-amber-400">★</span><span>${p.rating || 4.8}</span>
          </div>
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white group-hover:text-amber-600 transition-colors">${p.name}</h3>
            <p class="text-xs text-stone-500 mt-1 line-clamp-2">${p.description}</p>
          </div>
          <div class="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-amber-600">${p.entryFee || "₹50 Entry"}</span>
            <button onclick="RaahiPlaces.openDetailModal('${p.id}');" class="px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 transition-colors">Details →</button>
          </div>
        </div>
      </div>
    `;
  },

renderVehicleCard(v) {
  const vehicleId =
    v.vehicleId ||
    v.id ||
    v._id;

  const vehicleType =
    v.vehicleType ||
    v.category ||
    v.name ||
    "Tourist Vehicle";

  const vehicleName =
    v.name ||
    v.vehicleType ||
    "Tourist Vehicle";

  const city =
    v.city ||
    this.currentCityId ||
    "";

  const state =
    v.state ||
    "";

  const image =
    v.image ||
    (Array.isArray(v.images) ? v.images[0] : "") ||
    "";

  const phone =
    v.phone ||
    (Array.isArray(v.contacts) && v.contacts.length
      ? v.contacts[0].phone
      : "");

  const operator =
    v.operator ||
    (Array.isArray(v.contacts) && v.contacts.length
      ? v.contacts[0].name
      : "Verified Tourist Fleet");

  const baseFare =
    v.baseFare ?? 0;

  const farePerKm =
    v.farePerKm ?? 0;

  const rating =
    v.rating ?? 0;

  const available =
    v.available !== false;

  /*
   * IMPORTANT:
   * CityHub gets vehicles independently from RaahiVehicles.
   * Store this vehicle in RaahiVehicles before opening its modal.
   */
  const safeVehicleId = String(vehicleId)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");

  return `
    <div class="bg-white dark:bg-stone-900
      border border-stone-200 dark:border-stone-800
      rounded-3xl overflow-hidden shadow-sm
      hover:shadow-xl transition-all duration-300
      flex flex-col justify-between group">

      <div>

        <!-- IMAGE -->
        <div class="relative h-60 w-full overflow-hidden
          bg-stone-100 dark:bg-stone-800">

          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${vehicleName}"
                  loading="lazy"
                  class="w-full h-full object-cover
                  group-hover:scale-105 transition-transform duration-500"
                >
              `
              : `
                <div class="w-full h-full flex items-center
                  justify-center bg-stone-900">

                  <span class="material-symbols-outlined
                    text-6xl text-stone-600">
                    directions_car
                  </span>

                </div>
              `
          }

          <div class="absolute inset-0
            bg-gradient-to-t from-black/80
            via-black/20 to-transparent">
          </div>

          <!-- TYPE -->
          <div class="absolute top-3.5 left-3.5
            flex items-center gap-1.5 z-10">

            <span class="px-2.5 py-1 rounded-full
              text-[11px] font-bold
              bg-amber-600 text-white">

              ${vehicleType}

            </span>

            ${
              available
                ? `
                  <span class="px-2.5 py-1 rounded-full
                    text-[11px] font-bold
                    bg-emerald-600 text-white">

                    Available

                  </span>
                `
                : `
                  <span class="px-2.5 py-1 rounded-full
                    text-[11px] font-bold
                    bg-red-600 text-white">

                    Unavailable

                  </span>
                `
            }

          </div>

          <!-- RATING -->
          <div class="absolute bottom-3 right-3
            px-2.5 py-1 rounded-xl
            bg-black/80 text-white text-xs
            font-extrabold flex items-center gap-1">

            <span class="text-amber-400">★</span>

            <span>
              ${rating || "Verified"}
            </span>

          </div>

        </div>

        <!-- BASIC INFO -->
        <div class="p-6 space-y-3">

          <div class="flex items-center
            justify-between text-[11px]
            text-stone-500">

            <span class="truncate font-semibold
              flex items-center gap-1">

              <span class="material-symbols-outlined
                text-xs text-amber-500">
                storefront
              </span>

              ${operator}

            </span>

            <span class="text-[10px]
              text-emerald-600 font-bold shrink-0">

              RTO Verified

            </span>

          </div>

          <h3 class="font-heading text-lg font-bold
            text-stone-900 dark:text-white
            group-hover:text-amber-600
            transition-colors">

            ${vehicleName}

          </h3>

          <p class="text-xs text-stone-500">

            ${city}${state ? ` • ${state}` : ""}

          </p>

        </div>

      </div>

      <!-- FOOTER -->
      <div class="p-6 pt-0 space-y-3">

        <!-- FARE -->
        <div class="pt-3 border-t
          border-stone-100 dark:border-stone-800
          flex items-center justify-between">

          <div>

            <span class="block text-[10px]
              text-stone-400 uppercase font-bold">

              Base Fare

            </span>

            <span class="text-sm font-bold
              text-amber-600">

              ₹${baseFare}

            </span>

          </div>

          <div class="text-right">

            <span class="block text-[10px]
              text-stone-400 uppercase font-bold">

              Per KM

            </span>

            <span class="text-sm font-bold
              text-stone-700 dark:text-stone-300">

              ₹${farePerKm}/km

            </span>

          </div>

        </div>

        <!-- ACTIONS -->
        <div class="grid grid-cols-2 gap-2">

          ${
            phone
              ? `
                <a
                  href="tel:${String(phone).replace(
                    /[\\s\\-]/g,
                    ""
                  )}"
                  class="py-2.5 px-3 rounded-xl
                    bg-emerald-600
                    hover:bg-emerald-700
                    text-white text-xs font-bold
                    transition-all flex items-center
                    justify-center gap-1"
                >

                  <span class="material-symbols-outlined
                    text-sm">
                    call
                  </span>

                  <span>
                    Call Desk
                  </span>

                </a>
              `
              : `
                <div
                  class="py-2.5 px-3 rounded-xl
                    bg-stone-100 dark:bg-stone-800
                    text-stone-400 text-xs font-bold
                    flex items-center
                    justify-center gap-1"
                >

                  <span class="material-symbols-outlined
                    text-sm">
                    phone_disabled
                  </span>

                  <span>
                    No Phone
                  </span>

                </div>
              `
          }

          <!-- FIXED VIEW BUTTON -->
          <button
            type="button"
            onclick="RaahiCityHub.openVehicleDetails('${safeVehicleId}')"
            class="w-full py-2.5 px-3 rounded-xl
              bg-stone-900 dark:bg-stone-100
              hover:bg-amber-600
              dark:hover:bg-amber-400
              text-white dark:text-stone-900
              hover:text-white text-xs font-bold
              transition-all flex items-center
              justify-center gap-1 cursor-pointer"
          >

            <span class="material-symbols-outlined text-sm">
              info
            </span>

            <span>
              Fare Details
            </span>

          </button>

        </div>

      </div>

    </div>
  `;
},

openVehicleDetails(vehicleId) {
  const id = String(vehicleId || "");

  if (!id) {
    console.error("[RaahiCityHub] Vehicle ID missing");
    return;
  }

  /*
   * Find the vehicle currently displayed in City Hub.
   */
  const vehicle = this.items.find((v) => {
    return String(
      v.vehicleId ||
      v.id ||
      v._id ||
      ""
    ) === id;
  });

  if (!vehicle) {
    console.error(
      "[RaahiCityHub] Vehicle not found:",
      id,
      this.items
    );
    return;
  }

  /*
   * Make the City Hub vehicle available to the
   * main RaahiVehicles module.
   */
  if (typeof RaahiVehicles !== "undefined") {

    if (!Array.isArray(RaahiVehicles.vehicles)) {
      RaahiVehicles.vehicles = [];
    }

    const normalized =
      typeof RaahiVehicles.normalizeVehicle === "function"
        ? RaahiVehicles.normalizeVehicle(vehicle)
        : vehicle;

    const existingIndex =
      RaahiVehicles.vehicles.findIndex((v) => {
        return String(
          v.id ||
          v.vehicleId ||
          v._id ||
          ""
        ) === id;
      });

    if (existingIndex >= 0) {
      RaahiVehicles.vehicles[existingIndex] = normalized;
    } else {
      RaahiVehicles.vehicles.push(normalized);
    }

    /*
     * Your vehicles.js has openInfoModal(),
     * NOT openVehicleModal().
     */
    if (
      typeof RaahiVehicles.openInfoModal === "function"
    ) {
      RaahiVehicles.openInfoModal(id);
      return;
    }

    console.error(
      "[RaahiCityHub] RaahiVehicles.openInfoModal() is missing"
    );
    return;
  }

  console.error(
    "[RaahiCityHub] RaahiVehicles module is not loaded"
  );
},

  // 1. Hotel Card
  renderHotelCard(h) {
  const hotelId = h.id || h._id;

  const hotelImage =
    h.image ||
    (Array.isArray(h.images) ? h.images[0] : "") ||
    h.imageUrl ||
    h.photo ||
    "";

  const isSaved =
    typeof RaahiAuth !== "undefined" && RaahiAuth.isSaved(hotelId);

  return `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
        <div class="relative h-60 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
  src="${hotelImage}"
  alt="${h.name}"
  loading="lazy"
  onerror="this.onerror=null; this.style.display='none';"
  class="w-full h-full object-cover img-zoom"
>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
              ${h.cityName || h.city}
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
              ${h.priceTier}
            </span>
          </div>

          <button onclick="RaahiAuth.toggleSave('${hotelId}')" title="Save Stay" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-all z-10 shadow-sm">
            <span class="material-symbols-outlined text-base ${isSaved ? "text-amber-600 fill-current" : ""}">
              ${isSaved ? "bookmark_added" : "bookmark_add"}
            </span>
          </button>

          <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10 flex items-center justify-between">
            <span class="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
              <span class="material-symbols-outlined text-sm">star</span>
              ${h.rating} (${h.reviewsCount} reviews)
            </span>
            <span class="text-[11px] text-stone-300 font-medium">${h.priceRange || "Verified Rates"}</span>
          </div>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
              ${h.name}
            </h3>
            <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
              ${h.description}
            </p>

            <!-- Amenities Pills -->
            <div class="flex flex-wrap gap-1.5 mb-5">
              ${(h.amenities || [])
                .slice(0, 3)
                .map(
                  (am) => `
                <span class="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs text-emerald-600">check</span>
                  <span>${am}</span>
                </span>
              `,
                )
                .join("")}
            </div>
          </div>

          <div>
            <div class="py-2.5 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3 truncate flex items-center">
              <span class="material-symbols-outlined text-sm text-amber-600 mr-1 shrink-0">location_on</span>
              <span class="truncate">${h.location}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="RaahiHotels.openHotelModal('${hotelId}')"  class="w-full py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm">
                <span>Stay Info</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button onclick="RaahiCommunity.openSuggestModal('${hotelId}', 'hotel', '${h.name}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700">
                <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                <span>Suggest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderRestaurantCard(r) {
  const restaurantId = r.restaurantId || r.id || r._id;

  const restaurantImage =
    r.image ||
    (Array.isArray(r.images) ? r.images[0] : "") ||
    r.imageUrl ||
    r.photo ||
    "";

  const isSaved =
    typeof RaahiAuth !== "undefined" && RaahiAuth.isSaved(restaurantId);

  return `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
        <div class="relative h-60 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
  src="${restaurantImage}"
  alt="${r.name}"
  loading="lazy"
  onerror="this.onerror=null; this.style.display='none';"
  class="w-full h-full object-cover img-zoom"
>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white">
              ${r.cuisine}
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
              ${r.cityName || r.city}
            </span>
          </div>

          <button onclick="RaahiAuth.toggleSave('${restaurantId}')" title="Save Restaurant" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-all z-10 shadow-sm">
            <span class="material-symbols-outlined text-base ${isSaved ? "text-amber-600 fill-current" : ""}">
              ${isSaved ? "bookmark_added" : "bookmark_add"}
            </span>
          </button>

          <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10 flex items-center justify-between">
            <span class="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
              <span class="material-symbols-outlined text-sm">star</span>
              ${r.rating} (${r.reviewsCount} foodies)
            </span>
            <span class="text-[11px] text-stone-300 font-bold">${r.costForTwo || r.priceRange}</span>
          </div>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
              ${r.name}
            </h3>
            <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
              ${r.description}
            </p>

            <!-- Specialties -->
            <div class="mb-4">
              <span class="text-[10px] font-bold uppercase text-stone-400 tracking-wider block mb-1.5">Must-Try Specialties</span>
              <div class="flex flex-wrap gap-1.5">
                ${(r.specialties || [])
                  .slice(0, 3)
                  .map(
                    (sp) => `
                  <span class="text-[10px] px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold border border-amber-200/60 dark:border-amber-800/40">
                    ★ ${sp}
                  </span>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div>
            <div class="py-2.5 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3 flex items-center justify-between">
              <span class="truncate flex items-center">
                <span class="material-symbols-outlined text-sm text-amber-600 mr-1 shrink-0">location_on</span>
                ${r.location}
              </span>
              <span class="shrink-0 text-stone-400 font-mono ml-2">${r.openingHours ? r.openingHours.split("(")[0] : ""}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
             
 <button
    onclick="RaahiRestaurants.openRestModal('${restaurantId}')"
    class="w-full py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
  >
    <span>View Restaurant</span>
    <span class="material-symbols-outlined text-sm">arrow_forward</span>
  </button>

            
              <button onclick="RaahiCommunity.openSuggestModal('${restaurantId}', 'restaurant', '${r.name}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700">
                <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                <span>Suggest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 3. Cultural Event Card
  renderEventCard(ev) {
    const eventId = ev.eventId || ev.id || ev._id;

    return `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
        <div class="relative h-60 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img src="${ev.image}" alt="${ev.name}" loading="lazy" class="w-full h-full object-cover img-zoom">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white">
              ${ev.category}
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
              ${ev.cityName || ev.city}
            </span>
          </div>

          <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
            <span class="text-xs text-amber-300 font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">calendar_month</span>
              ${ev.date}
            </span>
          </div>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
              ${ev.name}
            </h3>
            <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
              ${ev.description}
            </p>

            <div class="mb-4">
              <span class="text-[10px] font-bold uppercase text-stone-400 tracking-wider block mb-1.5">Festival Highlights</span>
              <div class="flex flex-wrap gap-1.5">
                ${(ev.highlights || [])
                  .slice(0, 2)
                  .map(
                    (h) => `
                  <span class="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                    • ${h}
                  </span>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div>
            <div class="py-2.5 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3 truncate flex items-center">
              <span class="material-symbols-outlined text-sm text-amber-600 mr-1 shrink-0">location_on</span>
              <span class="truncate">${ev.location}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="RaahiEvents.openEventModal('${eventId}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm">
                <span>View Event</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button onclick="RaahiCommunity.openSuggestModal('${eventId}', 'event', '${ev.name}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700">
                <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                <span>Suggest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Local Guide Card
  renderGuideCard(g) {
    const guideId = g.guideId || g.id || g._id;

    return `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover p-6">
        <div class="flex items-start gap-4 mb-4">
          <img src="${g.photo}" alt="${g.name}" class="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600 shadow-md shrink-0">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-amber-600 uppercase tracking-wider truncate">${g.cityName || g.city}, ${g.state}</span>
              <span class="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
                <span class="material-symbols-outlined text-sm">star</span>
                ${g.rating} (${g.reviewsCount})
              </span>
            </div>
            <h3 class="font-heading text-base font-bold text-stone-900 dark:text-white mt-0.5 truncate">${g.name}</h3>
            <span class="text-xs text-stone-500 font-medium block">${g.experience}</span>
          </div>
        </div>

        <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 mb-4 leading-relaxed">
          ${g.about}
        </p>

        <div class="space-y-2.5 mb-6 border-t border-stone-100 dark:border-stone-800 pt-3">
          <div>
            <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Languages Spoken</span>
            <div class="flex flex-wrap gap-1">
              ${(g.languages || [])
                .map(
                  (l) => `
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">${l}</span>
              `,
                )
                .join("")}
            </div>
          </div>
          <div>
            <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Specialization</span>
            <span class="text-xs text-amber-900 dark:text-amber-300 font-bold">${g.specialization}</span>
          </div>
        </div>

        <div class="mt-auto">
          <button
  onclick="RaahiGuides.openGuideModal('${guideId}')"
  class="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
>
  <span>View Verified Profile</span>
  <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
        </div>
      </div>
    `;
  },

  // 5. Emergency Service Card
  renderEmergencyCard(srv) {
    const isPolice = srv.type === "Police" || srv.type === "Police Station";

    // Safely handle missing/null fields from backend
    const phone =
      typeof srv.phone === "string" && srv.phone.trim()
        ? srv.phone.split("/")[0].trim()
        : "";

    const phoneDisplay = phone || "Phone unavailable";

    const hasLocation = srv.lat != null && srv.lng != null;

    const cityName =
      srv.cityName || srv.city || this.currentCityId || "Unknown City";

    const state = srv.state || "";

    const address = srv.address || "Address information unavailable";

    const name = srv.name || "Emergency Service";

    const hours =
      srv.hours ||
      (srv.available24x7 === true
        ? "24x7 Active"
        : "Availability information unavailable");

    return `
    <div class="p-6 rounded-3xl bg-white dark:bg-stone-900
      border border-stone-200 dark:border-stone-800
      shadow-sm hover:shadow-lg transition-all
      flex flex-col justify-between gap-4">

      <div class="flex items-start gap-4">

        <div class="w-12 h-12 rounded-2xl ${
          isPolice
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
            : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
        } flex items-center justify-center shrink-0 shadow-sm">

          <span class="material-symbols-outlined text-2xl">
            ${isPolice ? "local_police" : "local_hospital"}
          </span>

        </div>

        <div class="flex-1 min-w-0">

          <div class="flex items-center gap-2 mb-1 flex-wrap">

            <span class="text-[11px] font-extrabold uppercase ${
              isPolice ? "text-blue-600" : "text-red-600"
            }">
              ${srv.type || "Emergency"} Desk
            </span>

            <span class="text-xs text-stone-400">•</span>

            <span class="text-xs font-semibold text-stone-600 dark:text-stone-400">
              ${cityName}${state ? `, ${state}` : ""}
            </span>

            <span class="px-2 py-0.2 rounded-full text-[9px]
              font-bold bg-emerald-100 dark:bg-emerald-950/40
              text-emerald-700 dark:text-emerald-300
              border border-emerald-200 dark:border-emerald-800">
              ${hours}
            </span>

          </div>

          <h4 class="font-heading text-base font-bold
            text-stone-900 dark:text-white">
            ${name}
          </h4>

          <p class="text-xs text-stone-500 mt-1">
            ${address}
          </p>

        </div>
      </div>

      <div class="flex items-center gap-2 pt-2
        border-t border-stone-100 dark:border-stone-800">

        ${
          phone
            ? `
              <a
                href="tel:${phone}"
                class="flex-1 py-2.5 px-4 rounded-xl
                bg-red-600 hover:bg-red-700 text-white
                font-bold text-xs flex items-center
                justify-center gap-2 transition-colors
                shadow-sm">

                <span class="material-symbols-outlined text-sm">
                  phone_in_talk
                </span>

                <span>Call ${phone}</span>

              </a>
            `
            : `
              <div
                class="flex-1 py-2.5 px-4 rounded-xl
                bg-stone-100 dark:bg-stone-800
                text-stone-500 dark:text-stone-400
                font-bold text-xs flex items-center
                justify-center gap-2">

                <span class="material-symbols-outlined text-sm">
                  phone_disabled
                </span>

                <span>${phoneDisplay}</span>

              </div>
            `
        }

        ${
          hasLocation
            ? `
              <a
                href="https://maps.google.com/?q=${srv.lat},${srv.lng}"
                target="_blank"
                class="p-2.5 rounded-xl
                bg-stone-100 dark:bg-stone-800
                hover:bg-stone-200 dark:hover:bg-stone-700
                text-stone-700 dark:text-stone-300
                transition-colors"
                title="Locate on Map">

                <span class="material-symbols-outlined text-base">
                  directions
                </span>

              </a>
            `
            : ""
        }

      </div>
    </div>
  `;
  },

  // Render Server-Side Pagination Bar
  renderPaginationBar() {
    const container = document.getElementById("city-pagination-bar");
    if (!container) return;

    if (this.totalItems === 0 || this.totalPages <= 1) {
      container.innerHTML = `
        <div class="text-xs text-stone-500 font-medium">
          Showing all ${this.totalItems} verified listings in ${this.cityData ? this.cityData.name : this.currentCityId}
        </div>
      `;
      return;
    }

    const startItem = (this.currentPage - 1) * this.limit + 1;
    const endItem = Math.min(this.currentPage * this.limit, this.totalItems);

    // Build page buttons array
    let pagesHtml = "";
    for (let p = 1; p <= this.totalPages; p++) {
      const isActive = p === this.currentPage;
      pagesHtml += `
        <button data-page="${p}" class="city-page-btn w-9 h-9 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-amber-600 text-white shadow-md shadow-amber-600/20" : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-600"}">
          ${p}
        </button>
      `;
    }

    container.innerHTML = `
      <div class="text-xs text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
        <span>Showing <strong class="text-stone-800 dark:text-stone-200">${startItem} – ${endItem}</strong> of <strong class="text-stone-800 dark:text-stone-200">${this.totalItems}</strong> listings</span>
      </div>

      <!-- Pagination Buttons -->
      <div class="flex items-center gap-1.5">
        <!-- Prev Button -->
        <button data-page="${this.currentPage - 1}" ${!this.hasPrev ? "disabled" : ""} class="city-page-btn px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${!this.hasPrev ? "opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800 text-stone-400" : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-600 shadow-2xs"}">
          <span class="material-symbols-outlined text-sm">chevron_left</span>
          <span class="hidden sm:inline">Previous</span>
        </button>

        <!-- Numbered Page Buttons -->
        <div class="flex items-center gap-1">
          ${pagesHtml}
        </div>

        <!-- Next Button -->
        <button data-page="${this.currentPage + 1}" ${!this.hasNext ? "disabled" : ""} class="city-page-btn px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${!this.hasNext ? "opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800 text-stone-400" : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-600 shadow-2xs"}">
          <span class="hidden sm:inline">Next</span>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    `;
  },
};

// Global Exposure
if (typeof window !== "undefined") {
  window.RaahiCityHub = RaahiCityHub;
}
