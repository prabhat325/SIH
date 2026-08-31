/**
 * RAAHI — Tourist Places Controller & AI Intelligence Layer
 * Filters by State, Category, Rating, Accessibility, and Search Query.
 * Rich Place Detail Modal with About, History, Timings, Entry Fee,
 * Facilities, Accessibility, Raahi Nearby, Reviews & Suggest a Change.
 */

const RaahiPlaces = {
  currentFilter: 'all',
  stateFilter: 'all',
  ratingFilter: 'all',
  accessibilityFilter: false,
  searchQuery: '',

  selectedCity: 'all',

  // Backend pagination
  currentPage: 1,
  totalPages: 1,
  totalPlaces: 0,
  placesPerPage: 20,
  loadingPage: false,

  /**
   * Convert backend place schema into the schema expected
   * by the existing frontend UI.
   */

  async loadCity(cityName) {
  this.selectedCity = cityName || 'all';
  this.currentPage = 1;
  this.totalPages = 1;

  console.log(
    `📍 Loading places for city: ${this.selectedCity}`
  );

  await this.loadPage(1);
},


  normalizePlace(place) {
    return {
      ...place,

      // ID
      id: place.placeId || place._id,

      // Real backend image
    image:
  Array.isArray(place.images) && place.images.length > 0
    ? place.images[0]
    : '',
      // Rating
      rating: place.rating ?? 0,

      reviewsCount: place.reviewsCount ?? 0,

      // Opening / closing time
      openingHours:
        place.openingTime && place.closingTime
          ? `${place.openingTime} - ${place.closingTime}`
          : 'Timing not available',

      // Fields expected by the existing detail modal
      history:
        place.history ||
        'Historical information not available.',

      facilities:
        Array.isArray(place.specialFeatures)
          ? place.specialFeatures
          : [],

      accessibility: {
        wheelchair: false,
        audioGuide: false,
        seniorFriendly: false
      },

      nearbyAttractions:
        Array.isArray(place.nearbyAttractions)
          ? place.nearbyAttractions
          : [],

      aiPick: false,
      aiReason: ''
    };
  },
  testImage(url) {
  return new Promise(resolve => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();

    img.onload = () => {
      resolve(
        img.naturalWidth > 0 &&
        img.naturalHeight > 0
      );
    };

    img.onerror = () => {
      resolve(false);
    };

    img.src = url;
  });
},
async resolvePlaceImage(place) {
  if (!place) return '';

  const existingImage =
    Array.isArray(place.images) && place.images.length
      ? place.images[0]
      : '';

  // 1. Try the image already supplied by the backend.
  if (
    existingImage &&
    !existingImage.includes('Special:MediaSearch')
  ) {
    const works = await this.testImage(existingImage);

    if (works) {
      return existingImage;
    }

    console.warn(
      `⚠️ Backend image failed: ${place.name}`
    );
  }

  const cacheKey =
    `raahi_image_${place.id || place.placeId || place._id}`;

  // 2. Check our previously resolved image.
  const cached =
    sessionStorage.getItem(cacheKey);

  if (cached) {
    const works = await this.testImage(cached);

    if (works) {
      return cached;
    }

    sessionStorage.removeItem(cacheKey);
  }

  /*
   * 3. Generate progressively broader searches.
   *
   * This is generic and works for every place.
   */
  const searches = [
    // Exact place + full location
    [
      place.name,
      place.city,
      place.state,
      'India'
    ],

    // Place + city
    [
      place.name,
      place.city,
      'India'
    ],

    // Place + state
    [
      place.name,
      place.state,
      'India'
    ],

    // Exact place
    [
      place.name
    ],

    // City + state tourism
    [
      place.city,
      place.state,
      'tourism',
      'India'
    ],

    // City tourism
    [
      place.city,
      'tourism',
      'India'
    ]
  ]
    .map(parts =>
      parts
        .filter(Boolean)
        .join(' ')
        .trim()
    )
    .filter(Boolean);

  /*
   * Remove duplicate searches.
   */
  const uniqueSearches =
    [...new Set(searches)];

  for (const searchText of uniqueSearches) {
    try {
      console.log(
        `🔎 Wikimedia image search: ${searchText}`
      );

      const apiUrl =
        'https://commons.wikimedia.org/w/api.php?' +
        new URLSearchParams({
          action: 'query',
          generator: 'search',
          gsrsearch: searchText,
          gsrnamespace: '6',
          gsrlimit: '10',
          prop: 'imageinfo',
          iiprop: 'url',
          iiurlwidth: '1200',
          format: 'json',
          origin: '*'
        });

      const response =
        await fetch(apiUrl);

      if (!response.ok) {
        console.warn(
          `⚠️ Wikimedia HTTP ${response.status}`
        );
        continue;
      }

      const data =
        await response.json();

      const pages =
        Object.values(
          data.query?.pages || {}
        );

      /*
       * Test every returned image until
       * we find one that actually loads.
       */
      for (const page of pages) {
        const imageInfo =
          page.imageinfo?.[0];

        const image =
          imageInfo?.thumburl ||
          imageInfo?.url;

        if (!image) continue;

        const works =
          await this.testImage(image);

        if (!works) continue;

        console.log(
          `✅ Image found for ${place.name}`
        );

        sessionStorage.setItem(
          cacheKey,
          image
        );

        return image;
      }

    } catch (error) {
      console.warn(
        `⚠️ Wikimedia search failed for ${place.name}:`,
        error.message
      );
    }
  }

  /*
   * 4. Nothing specific was found.
   *
   * Return empty for now.
   * We will handle the final universal fallback
   * separately instead of showing the wrong image.
   */
 console.warn(
  `⚠️ No specific image found for ${place.name}; using fallback`
);

return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
},

  /**
   * Initialize Places page.
   */
  async resolvePlaceDescription(place) {
  if (
    place.description &&
    place.description.trim().length >= 40
  ) {
    return place.description;
  }

  const cacheKey =
    `raahi_description_${place.id || place.placeId || place._id}`;

  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    return cached;
  }
const searches = [
  `${place.name} ${place.city || ''} ${place.state || ''} India`,
  `${place.name} ${place.city || ''} India`,
  `${place.name} ${place.state || ''} India`,
  `${place.name} tourist place India`,
  `${place.name} India`,
  place.name
]
  .map(s => s.replace(/\s+/g, ' ').trim())
  .filter(Boolean);
 

  for (const searchText of searches) {
    try {
      console.log(
        `🔎 Wikipedia description search: ${searchText}`
      );

      const apiUrl =
        'https://en.wikipedia.org/w/api.php?' +
        new URLSearchParams({
          action: 'query',
          generator: 'search',
          gsrsearch: searchText,
          gsrnamespace: '0',
          gsrlimit: '3',
          prop: 'extracts',
          exintro: '1',
          explaintext: '1',
          exchars: '600',
          format: 'json',
          origin: '*'
        });

      const response = await fetch(apiUrl);

      if (!response.ok) continue;

      const data = await response.json();

      const pages = Object.values(
        data.query?.pages || {}
      );

      for (const page of pages) {
        const description =
          page.extract?.trim();

        if (
          description &&
          description.length >= 40
        ) {
          console.log(
            `✅ Description found: ${place.name}`
          );

          sessionStorage.setItem(
            cacheKey,
            description
          );

          return description;
        }
      }

    } catch (error) {
      console.warn(
        `⚠️ Description search failed for ${place.name}:`,
        error.message
      );
    }
  }

  console.warn(
    `❌ No description found for ${place.name}`
  );

  return '';
},

async resolvePlaceAddress(place) {
  if (
    place.address &&
    place.address.trim().length >= 10
  ) {
    return place.address;
  }

  const cacheKey =
    `raahi_address_${place.id || place.placeId || place._id}`;

  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    return cached;
  }

  const searches = [
    `${place.name} ${place.city || ''} ${place.state || ''} India`,
    `${place.name} ${place.city || ''} India`,
    `${place.name} ${place.state || ''} India`,
    `${place.name} address ${place.city || ''} India`
  ]
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const searchText of searches) {
    try {
      console.log(
        `🔎 Address search: ${searchText}`
      );

      const apiUrl =
        'https://nominatim.openstreetmap.org/search?' +
        new URLSearchParams({
          q: searchText,
          format: 'json',
          addressdetails: '1',
          limit: '3',
          countrycodes: 'in'
        });

      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) continue;

      const results = await response.json();

      if (!Array.isArray(results)) continue;

    for (const result of results) {
  const address =
    result.display_name?.trim();

if (
  address &&
  address.length >= 10
) {
    console.log(
      `✅ Address found: ${place.name}`
    );

    sessionStorage.setItem(
      cacheKey,
      address
    );

    return address;
  }
}
    } catch (error) {
      console.warn(
        `⚠️ Address search failed for ${place.name}:`,
        error.message
      );
    }
  }

  console.warn(
    `❌ No address found for ${place.name}`
  );

  return '';
},

  async init() {
    this.bindEvents();

    try {
      await this.loadPage(1);

      console.log(
        `✅ Places loaded: ${this.totalPlaces} total`
      );
    } catch (error) {
      console.error(
        '❌ Failed to initialize places:',
        error
      );

      const container =
        document.getElementById('places-grid-container');

      if (container) {
        container.innerHTML = `
          <div class="col-span-full py-16 text-center">
            <span class="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600 mb-3 block">
              cloud_off
            </span>

            <h3 class="font-heading text-lg font-bold text-stone-700 dark:text-stone-300">
              Unable to load tourist places
            </h3>

            <p class="text-sm text-stone-500 mt-2">
              Please check your connection and try again.
            </p>

            <button
              onclick="RaahiPlaces.loadPage(1)"
              class="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
              Try Again
            </button>
          </div>
        `;
      }
    }
  },

  /**
   * Load a specific backend page.
*/
async loadPage(page = 1) {
  if (this.loadingPage) return;

  if (
    page < 1 ||
    (this.totalPages > 1 && page > this.totalPages)
  ) {
    return;
  }

  this.loadingPage = true;

  try {
    let response;

    // =========================================================
    // CITY-SPECIFIC PLACES
    // =========================================================
    if (
      this.selectedCity &&
      this.selectedCity !== 'all'
    ) {
      response = await RaahiAPI.get(
        `/api/places/city/${encodeURIComponent(this.selectedCity)}`
      );

      // City endpoint returns:
      // { count: 15, places: [...] }

      if (
        !response ||
        !Array.isArray(response.places)
      ) {
        throw new Error(
          response?.message ||
          'Invalid city places response'
        );
      }

      RAAHI_DATA.places = response.places.map(
        place => this.normalizePlace(place)
      );

      this.currentPage = 1;
      this.totalPages = 1;
      this.totalPlaces = response.places.length;

      this.renderPlaces();
      this.renderPagination();

      console.log(
        `✅ Places loaded for ${this.selectedCity}: ${this.totalPlaces} places`
      );

      return;
    }

    // =========================================================
    // ALL PLACES — NORMAL BACKEND PAGINATION
    // =========================================================
    response = await RaahiAPI.getPlaces(
      page,
      this.placesPerPage
    );

    if (
      !response ||
      !response.success ||
      !Array.isArray(response.data)
    ) {
      throw new Error(
        response?.message ||
        'Invalid places response'
      );
    }

    RAAHI_DATA.places = response.data.map(
      place => this.normalizePlace(place)
    );

    this.currentPage = response.page || page;
    this.totalPages = response.pages || 1;
    this.totalPlaces =
      response.total ||
      response.data.length;

    this.renderPlaces();
    this.renderPagination();

    console.log(
      `✅ Places loaded: ${
        this.selectedCity || 'all'
      } | page ${this.currentPage}/${
        this.totalPages
      } | ${this.totalPlaces} total`
    );

  } catch (error) {

    console.error(
      '❌ Failed to load places page:',
      error
    );

    const container =
      document.getElementById(
        'places-grid-container'
      );

    if (container) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">

          <p class="text-sm text-red-600 font-semibold">
            Failed to load places.
          </p>

          <p class="text-xs text-stone-500 mt-1">
            ${error.message || 'Please try again.'}
          </p>

          <button
            onclick="RaahiPlaces.loadPage(${this.currentPage || 1})"
            class="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
            Retry
          </button>

        </div>
      `;
    }

  } finally {
    this.loadingPage = false;
  }
},



  /**
   * Render backend pagination controls.
   *
   * Requires:
   * <div id="places-pagination"></div>
   */
  renderPagination() {
    const pagination =
      document.getElementById('places-pagination');

    if (!pagination) return;

    if (this.totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    const previousDisabled =
      this.currentPage <= 1;

    const nextDisabled =
      this.currentPage >= this.totalPages;

    pagination.innerHTML = `
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">

        <button
          onclick="RaahiPlaces.loadPage(${this.currentPage - 1})"
          ${previousDisabled ? 'disabled' : ''}
          class="px-5 py-2.5 rounded-xl
                 border border-stone-200 dark:border-stone-700
                 bg-white dark:bg-stone-900
                 text-sm font-semibold
                 text-stone-700 dark:text-stone-200
                 hover:border-amber-500
                 hover:text-amber-600
                 hover:shadow-lg
                 disabled:opacity-40
                 disabled:cursor-not-allowed
                 transition-all duration-200">
          ← Previous
        </button>

        <div
          class="px-5 py-2.5 rounded-xl
                 bg-stone-100 dark:bg-stone-800
                 border border-stone-200 dark:border-stone-700
                 text-sm font-semibold
                 text-stone-700 dark:text-stone-200">
          Page ${this.currentPage} of ${this.totalPages}
        </div>

        <button
          onclick="RaahiPlaces.loadPage(${this.currentPage + 1})"
          ${nextDisabled ? 'disabled' : ''}
          class="px-5 py-2.5 rounded-xl
                 border border-stone-200 dark:border-stone-700
                 bg-white dark:bg-stone-900
                 text-sm font-semibold
                 text-stone-700 dark:text-stone-200
                 hover:border-amber-500
                 hover:text-amber-600
                 hover:shadow-lg
                 disabled:opacity-40
                 disabled:cursor-not-allowed
                 transition-all duration-200">
          Next →
        </button>

      </div>

      <div class="text-center pb-6 text-xs text-stone-500">
        Showing
        ${((this.currentPage - 1) * this.placesPerPage) + 1}
        -
        ${Math.min(
          this.currentPage * this.placesPerPage,
          this.totalPlaces
        )}
        of ${this.totalPlaces} places
      </div>
    `;
  },

  /**
   * Bind Places filters/search events.
   */
  bindEvents() {

    // Category chips
    document
      .querySelectorAll('.places-cat-btn')
      .forEach(btn => {

        btn.addEventListener('click', () => {

          document
            .querySelectorAll('.places-cat-btn')
            .forEach(b => {
              b.classList.remove(
                'bg-amber-600',
                'text-white'
              );

              b.classList.add(
                'bg-stone-100',
                'dark:bg-stone-800',
                'text-stone-700',
                'dark:text-stone-300'
              );
            });

          btn.classList.remove(
            'bg-stone-100',
            'dark:bg-stone-800',
            'text-stone-700',
            'dark:text-stone-300'
          );

          btn.classList.add(
            'bg-amber-600',
            'text-white'
          );

          this.currentFilter =
            btn.getAttribute('data-cat') || 'all';

          this.renderPlaces();
        });
      });

    // State filter
    const stateSelect =
      document.getElementById(
        'places-state-filter'
      );

    if (stateSelect) {
      stateSelect.addEventListener(
        'change',
        e => {
          this.stateFilter = e.target.value;
          this.renderPlaces();
        }
      );
    }

    // Rating filter
    const ratingSelect =
      document.getElementById(
        'places-rating-filter'
      );

    if (ratingSelect) {
      ratingSelect.addEventListener(
        'change',
        e => {
          this.ratingFilter = e.target.value;
          this.renderPlaces();
        }
      );
    }

    // Search
    const searchInput =
      document.getElementById(
        'places-search-input'
      );

    if (searchInput) {
      searchInput.addEventListener(
        'input',
        e => {

          this.searchQuery =
            e.target.value
              .toLowerCase()
              .trim();

          if (!this.searchQuery) {
            this.clearAISearchBanner();
          }

          this.renderPlaces();
        }
      );
    }
  },

  /**
   * AI search banner.
   */
  showAISearchBanner(query) {
    const banner =
      document.getElementById(
        'places-ai-search-banner'
      );

    const text =
      document.getElementById(
        'places-ai-search-text'
      );

    if (banner && text) {
      text.textContent =
        `"I found verified places and monuments matching '${query}'."`;

      banner.classList.remove('hidden');
    }
  },

  clearAISearchBanner() {
    const banner =
      document.getElementById(
        'places-ai-search-banner'
      );

    if (banner) {
      banner.classList.add('hidden');
    }
  },

  /**
   * Apply frontend filters to currently loaded page.
   */
  getFilteredPlaces() {

    if (!RAAHI_DATA.places) {
      return [];
    }

    return RAAHI_DATA.places.filter(place => {

      // Category
      if (
        this.currentFilter !== 'all' &&
        (place.category || '').toLowerCase() !==
          this.currentFilter.toLowerCase()
      ) {
        return false;
      }

      // State / city
      if (
        this.stateFilter !== 'all' &&
        place.state !== this.stateFilter &&
        place.city !== this.stateFilter
      ) {
        return false;
      }

      // Rating
      if (this.ratingFilter !== 'all') {

        const minRating =
          parseFloat(this.ratingFilter);

        if (
          Number(place.rating || 0) <
          minRating
        ) {
          return false;
        }
      }

      // Search
      if (this.searchQuery) {

        const q = this.searchQuery;

        const name =
          (place.name || '').toLowerCase();

        const city =
          (place.city || '').toLowerCase();

        const state =
          (place.state || '').toLowerCase();

        const category =
          (place.category || '').toLowerCase();

        const description =
          (place.description || '').toLowerCase();

        const tags =
          Array.isArray(place.tags)
            ? place.tags
            : [];

        const aiReason =
          (place.aiReason || '').toLowerCase();

        const queryMatch =
          name.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          category.includes(q) ||
          description.includes(q) ||
          tags.some(tag =>
            String(tag)
              .toLowerCase()
              .includes(q)
          ) ||
          aiReason.includes(q);

        if (!queryMatch) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Render Places cards.
   */
  renderPlaces() {

    const container =
      document.getElementById(
        'places-grid-container'
      );

    const countBadge =
      document.getElementById(
        'places-count-badge'
      );

    if (!container) {
      return;
    }

    const list =
      this.getFilteredPlaces();

    if (countBadge) {

      countBadge.textContent =
        `${list.length} Places Found`;
    }

    if (list.length === 0) {

      container.innerHTML = `
        <div class="col-span-full py-16 text-center">

          <span
            class="material-symbols-outlined
                   text-5xl
                   text-stone-300
                   dark:text-stone-600
                   mb-3
                   block">
            travel_explore
          </span>

          <h3
            class="font-heading
                   text-lg
                   font-bold
                   text-stone-700
                   dark:text-stone-300">
            No tourist places found
          </h3>

          <p
            class="text-xs
                   text-stone-500
                   mt-1
                   max-w-sm
                   mx-auto">
            Try loosening your search filters
            or resetting your state selection.
          </p>

          <button
            onclick="RaahiPlaces.resetFilters()"
            class="mt-4
                   px-4
                   py-2
                   bg-amber-600
                   text-white
                   rounded-xl
                   text-xs
                   font-bold
                   hover:bg-amber-700
                   transition-colors">
            Reset Filters
          </button>

        </div>
      `;

      return;
    }

    container.innerHTML =
      list.map(place => {

        const isSaved =
          typeof RaahiAuth !== 'undefined' &&
          RaahiAuth.isSaved(place.id);

        return `
          <div
            class="bg-white
                   dark:bg-stone-900
                   border
                   border-stone-200/80
                   dark:border-stone-800
                   rounded-3xl
                   overflow-hidden
                   shadow-sm
                   hover:shadow-xl
                   transition-all
                   duration-300
                   flex
                   flex-col
                   group
                   card-hover">

            <!-- Image -->
            <div
              class="relative
                     h-56
                     w-full
                     overflow-hidden
                     bg-stone-100
                     dark:bg-stone-800">

              <img
                src="${place.image}"
                alt="${place.name}"
                loading="lazy"
                class="w-full
                       h-full
                       object-cover
                       img-zoom">

              <div
                class="absolute
                       inset-0
                       bg-gradient-to-t
                       from-black/80
                       via-black/20
                       to-transparent">
              </div>

              <!-- Category -->
              <div
                class="absolute
                       top-3.5
                       left-3.5
                       flex
                       items-center
                       gap-1.5
                       z-10">

                <span
                  class="px-2.5
                         py-1
                         rounded-full
                         text-xs
                         font-extrabold
                         bg-black/60
                         backdrop-blur-md
                         text-white
                         border
                         border-white/20">

                  ${place.category || 'Place'}

                </span>

                ${
                  place.aiPick
                    ? `
                      <span
                        class="px-2.5
                               py-1
                               rounded-full
                               text-[11px]
                               font-extrabold
                               bg-amber-600
                               text-white
                               flex
                               items-center
                               gap-1
                               shadow-sm">

                        <span
                          class="material-symbols-outlined text-xs">
                          auto_awesome
                        </span>

                        Raahi AI Pick

                      </span>
                    `
                    : ''
                }

              </div>

              <!-- Save -->
              <button
                onclick="RaahiAuth.toggleSave('${place.id}')"
                title="Save Place"
                class="absolute
                       top-3.5
                       right-3.5
                       w-8
                       h-8
                       rounded-full
                       bg-white/80
                       dark:bg-stone-900/80
                       backdrop-blur-md
                       flex
                       items-center
                       justify-center
                       text-stone-700
                       dark:text-stone-200
                       hover:text-amber-600
                       transition-all
                       z-10
                       shadow-sm">

                <span
                  class="material-symbols-outlined
                         text-base
                         ${
                           isSaved
                             ? 'text-amber-600 fill-current'
                             : ''
                         }">

                  ${
                    isSaved
                      ? 'bookmark_added'
                      : 'bookmark_add'
                  }

                </span>

              </button>

              <!-- Bottom image info -->
              <div
                class="absolute
                       bottom-3.5
                       left-3.5
                       right-3.5
                       text-white
                       z-10">

                <div
                  class="flex
                         items-center
                         justify-between">

                  <span
                    class="flex
                           items-center
                           gap-1
                           text-amber-400
                           text-xs
                           font-extrabold">

                    <span
                      class="material-symbols-outlined text-sm">
                      star
                    </span>

                    ${place.rating || 0}
                    (${place.reviewsCount || 0})

                  </span>

                  <span
                    class="text-[11px]
                           text-stone-300
                           font-medium">

                    ${place.city || ''}
                    ${place.city && place.state ? ', ' : ''}
                    ${place.state || ''}

                  </span>

                </div>

              </div>

            </div>

            <!-- Card body -->
            <div
              class="p-5
                     flex-1
                     flex
                     flex-col
                     justify-between">

              <div>

                <h3
                  class="font-heading
                         text-lg
                         font-bold
                         text-stone-900
                         dark:text-white
                         mb-1.5
                         line-clamp-1
                         group-hover:text-amber-600
                         transition-colors">

                  ${place.name || 'Unnamed Place'}

                </h3>

                <p
                  class="text-xs
                         text-stone-600
                         dark:text-stone-400
                         line-clamp-2
                         mb-3
                         leading-relaxed">

                  ${
                    place.description ||
                    'No description available.'
                  }

                </p>

                <!-- Entry Fee & Timing -->
                <div
                  class="flex
                         items-center
                         justify-between
                         py-2
                         border-t
                         border-stone-100
                         dark:border-stone-800
                         text-[11px]
                         font-semibold
                         text-stone-600
                         dark:text-stone-400
                         mb-3">

                  <span
                    class="text-emerald-600
                           dark:text-emerald-400
                           font-bold">

                    ${
                      place.entryFee === 0
                        ? 'Free Entry'
                        : `₹${place.entryFee}`
                    }

                  </span>

                  <span
                    class="truncate
                           max-w-[140px]">

                    ${place.openingHours}

                  </span>

                </div>

              </div>

              <!-- Buttons -->
              <div
                class="grid
                       grid-cols-2
                       gap-2">

                <button
                 onclick="event.preventDefault(); event.stopPropagation(); RaahiPlaces.openDetailModal('${place.id}')"
                  class="w-full
                         py-2
                         px-3
                         rounded-xl
                         bg-stone-900
                         dark:bg-stone-100
                         text-white
                         dark:text-stone-900
                         text-xs
                         font-bold
                         hover:bg-amber-600
                         dark:hover:bg-amber-400
                         hover:text-white
                         transition-all
                         flex
                         items-center
                         justify-center
                         gap-1">

                  <span>
                    View Details
                  </span>

                  <span
                    class="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>

                </button>

                <button
                  onclick="RaahiPlaces.quickAddToPlan('${place.id}')"
                  class="w-full
                         py-2
                         px-3
                         rounded-xl
                         bg-amber-50
                         dark:bg-amber-950/40
                         border
                         border-amber-300
                         dark:border-amber-800
                         text-amber-900
                         dark:text-amber-300
                         text-xs
                         font-bold
                         hover:bg-amber-600
                         hover:text-white
                         transition-all
                         flex
                         items-center
                         justify-center
                         gap-1">

                  <span
                    class="material-symbols-outlined text-sm">
                    auto_awesome
                  </span>

                  <span>
                    Add to Plan
                  </span>

                </button>

              </div>

            </div>

          </div>
        `;
      }).join('');
  },

  /**
   * Quick add to planner.
   */
  quickAddToPlan(placeId) {

    const place =
      RAAHI_DATA.places.find(
        p => p.id === placeId
      );

    if (!place) return;

    RaahiPlanner.selectQuickDest(
      place.city
    );

    RaahiApp.navigate('planner');

    RaahiApp.showToast(
      `Selected ${place.name} for your AI Journey Plan!`,
      'success'
    );
  },

  /**
   * Reset filters.
   */
  resetFilters() {

    this.currentFilter = 'all';
    this.stateFilter = 'all';
    this.ratingFilter = 'all';
    this.searchQuery = '';

    this.clearAISearchBanner();

    const searchInput =
      document.getElementById(
        'places-search-input'
      );

    if (searchInput) {
      searchInput.value = '';
    }

    const stateSelect =
      document.getElementById(
        'places-state-filter'
      );

    if (stateSelect) {
      stateSelect.value = 'all';
    }

    const ratingSelect =
      document.getElementById(
        'places-rating-filter'
      );

    if (ratingSelect) {
      ratingSelect.value = 'all';
    }

    this.renderPlaces();
  },

  /**
   * Open place details modal.
   */
  openDetailModal(placeId) {

    const place =
      RAAHI_DATA.places.find(
        p => p.id === placeId
      );

    if (!place) return;

    const modal =
      document.getElementById('place-detail-modal');

    const content =
      document.getElementById('place-modal-content');

    if (!modal || !content) return;

    const isSaved =
      typeof RaahiAuth !== 'undefined' &&
      RaahiAuth.isSaved(place.id);

    const nearbyPlaces =
      (RAAHI_DATA.places || [])
        .filter(
          p =>
            p.id !== place.id &&
            p.city === place.city
        )
        .slice(0, 2);

    const nearbyDining =
      (RAAHI_DATA.restaurants || [])
        .filter(
          r => r.city === place.city
        )
        .slice(0, 2);

    const facilities =
      Array.isArray(place.facilities)
        ? place.facilities
        : [];

    const nearbyAttractions =
      Array.isArray(place.nearbyAttractions)
        ? place.nearbyAttractions
        : [];

    const accessibility =
      place.accessibility || {};

    content.innerHTML = `
      <!-- Modal Header Gallery -->
      <div
        class="relative h-72 sm:h-96 w-full overflow-hidden bg-stone-900">

        <img
          src="${place.image || ''}"
          alt="${place.name || 'Place'}"
          class="w-full h-full object-cover">

        <div
          class="absolute inset-0
                 bg-gradient-to-t
                 from-black/90
                 via-black/30
                 to-transparent">
        </div>

        <!-- Close -->
        <button
          type="button"
          onclick="RaahiPlaces.closeDetailModal()"
          class="absolute top-4 right-4 w-9 h-9 rounded-full
                 bg-black/60 text-white flex items-center
                 justify-center hover:bg-black transition-colors z-20">

          <span class="material-symbols-outlined text-lg">
            close
          </span>

        </button>

        <!-- Hero title -->
        <div
          class="absolute bottom-6 left-6 right-6 text-white z-10">

          <div
            class="flex flex-wrap items-center gap-2 mb-2">

            <span
              class="px-3 py-1 rounded-full text-xs font-extrabold
                     bg-amber-600 text-white">
              ${place.category || 'Place'}
            </span>

            <span
              class="px-3 py-1 rounded-full text-xs font-bold
                     bg-white/20 backdrop-blur-md text-white">
              ${place.city || ''}
              ${place.city && place.state ? ', ' : ''}
              ${place.state || ''}
            </span>

            <span
              class="flex items-center gap-1 text-amber-400 text-xs
                     font-bold bg-black/50 px-2.5 py-1 rounded-full">

              <span class="material-symbols-outlined text-sm">
                star
              </span>

              ${place.rating || 0}
              (${place.reviewsCount || 0} reviews)

            </span>

          </div>

          <h2
            class="font-heading text-2xl sm:text-4xl
                   font-extrabold text-white">
            ${place.name || 'Unnamed Place'}
          </h2>

        </div>
      </div>

      <!-- Modal Body -->
      <div
        id="place-detail-modal-scroll"
        class="p-6 sm:p-8 space-y-8 bg-white dark:bg-stone-900">

        <!-- Action bar -->
        <div
          class="flex flex-wrap items-center justify-between gap-3
                 pb-6 border-b border-stone-200 dark:border-stone-800">

          <div class="flex items-center gap-3">

            <button
              type="button"
              onclick="RaahiAuth.toggleSave('${place.id}')"
              class="px-4 py-2.5 rounded-xl border
                     border-stone-300 dark:border-stone-700
                     text-xs font-bold flex items-center gap-2
                     text-stone-800 dark:text-stone-200
                     hover:bg-amber-50 dark:hover:bg-stone-800
                     transition-colors">

              <span
                class="material-symbols-outlined text-sm
                       ${isSaved ? 'text-amber-600' : ''}">
                ${isSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>

              <span>
                ${isSaved ? 'Saved in Collection' : 'Save Place'}
              </span>

            </button>

            ${
              place.latitude != null &&
              place.longitude != null
                ? `
                  <a
                    href="https://maps.google.com/?q=${place.latitude},${place.longitude}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-4 py-2.5 rounded-xl bg-amber-600
                           text-white text-xs font-bold flex items-center
                           gap-2 hover:bg-amber-700 transition-colors">

                    <span class="material-symbols-outlined text-sm">
                      directions
                    </span>

                    <span>Get Directions</span>

                  </a>
                `
                : ''
            }

          </div>

          <button
            type="button"
            onclick="RaahiPlaces.closeDetailModal(); RaahiCommunity.openSuggestModal('${place.id}', 'place', '${String(place.name || '').replace(/'/g, "\\'")}')"
            class="px-4 py-2.5 rounded-xl
                   bg-amber-100 dark:bg-amber-950/60
                   text-amber-900 dark:text-amber-300
                   text-xs font-bold flex items-center gap-2
                   border border-amber-300 dark:border-amber-800
                   hover:bg-amber-200 transition-colors">

            <span class="material-symbols-outlined text-sm">
              edit_note
            </span>

            <span>Suggest a Change</span>

          </button>

        </div>

        <!-- Overview -->
        <div
          class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Main information -->
          <div
            class="lg:col-span-2 space-y-6">

            <!-- About -->
            <div>

              <h4
                class="font-heading text-lg font-bold
                       text-stone-900 dark:text-white mb-2
                       flex items-center gap-2">

                <span
                  class="material-symbols-outlined text-amber-600 text-xl">
                  info
                </span>

                About the Monument

              </h4>

              <p
                class="text-sm text-stone-600 dark:text-stone-300
                       leading-relaxed">

                ${place.description || 'No description available.'}

              </p>

            </div>

            <!-- History -->
            <div>

              <h4
                class="font-heading text-lg font-bold
                       text-stone-900 dark:text-white mb-2
                       flex items-center gap-2">

                <span
                  class="material-symbols-outlined text-amber-600 text-xl">
                  history_edu
                </span>

                Historical Significance

              </h4>

              <p
                class="text-sm text-stone-600 dark:text-stone-300
                       leading-relaxed bg-stone-50 dark:bg-stone-800/50
                       p-4 rounded-xl border
                       border-stone-200/60 dark:border-stone-800">

                ${place.history || 'Historical information not available.'}

              </p>

            </div>

            <!-- Facilities / Accessibility -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div
                class="p-4 rounded-xl
                       bg-emerald-50/50 dark:bg-emerald-950/20
                       border border-emerald-200
                       dark:border-emerald-900/40">

                <h5
                  class="text-xs font-bold text-emerald-900
                         dark:text-emerald-300 mb-2
                         flex items-center gap-1.5">

                  <span class="material-symbols-outlined text-sm">
                    check_circle
                  </span>

                  Visitor Facilities

                </h5>

                <ul
                  class="text-xs text-stone-600
                         dark:text-stone-400 space-y-1">

                  ${
                    facilities.length
                      ? facilities
                          .map(f => `<li>• ${f}</li>`)
                          .join('')
                      : '<li>• Information not available</li>'
                  }

                </ul>

              </div>

              <div
                class="p-4 rounded-xl
                       bg-blue-50/50 dark:bg-blue-950/20
                       border border-blue-200
                       dark:border-blue-900/40">

                <h5
                  class="text-xs font-bold text-blue-900
                         dark:text-blue-300 mb-2
                         flex items-center gap-1.5">

                  <span class="material-symbols-outlined text-sm">
                    accessible
                  </span>

                  Accessibility Info

                </h5>

                <ul
                  class="text-xs text-stone-600
                         dark:text-stone-400 space-y-1">

                  <li>
                    • Wheelchair Access:
                    ${
                      accessibility.wheelchair
                        ? '✓ Available'
                        : 'Moderate Walking'
                    }
                  </li>

                </ul>

              </div>

            </div>

            <!-- Nearby -->
            <div
              class="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800
                     border border-stone-200 dark:border-stone-700
                     space-y-3">

              <div
                class="flex items-center justify-between">

                <div
                  class="flex items-center gap-2">

                  <span
                    class="material-symbols-outlined text-amber-600 text-lg">
                    near_me
                  </span>

                  <h4
                    class="font-heading text-sm font-bold
                           text-stone-900 dark:text-white">
                    Raahi Nearby Recommendations
                  </h4>

                </div>

                <span
                  class="text-[10px] text-amber-700
                         dark:text-amber-400 font-bold uppercase">
                  Within 2.5 km
                </span>

              </div>

              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                ${
                  nearbyPlaces.length
                    ? nearbyPlaces
                        .map(
                          np => `
                            <div
                              onclick="RaahiPlaces.openDetailModal('${np.id}')"
                              class="p-3 rounded-xl bg-white
                                     dark:bg-stone-900
                                     border border-stone-200
                                     dark:border-stone-700
                                     flex items-center gap-3
                                     cursor-pointer hover:border-amber-500
                                     transition-colors">

                              <img
                                src="${np.image || ''}"
                                alt="${np.name || 'Place'}"
                                class="w-12 h-12 rounded-lg object-cover">

                              <div class="truncate">

                                <h5
                                  class="text-xs font-bold
                                         text-stone-900 dark:text-white
                                         truncate">
                                  ${np.name || 'Unnamed Place'}
                                </h5>

                                <span
                                  class="text-[10px] text-stone-500">
                                  1.2 km • ${np.category || 'Place'}
                                </span>

                              </div>

                            </div>
                          `
                        )
                        .join('')
                    : ''
                }

                ${
                  nearbyDining
                    .map(
                      nd => `
                        <div
                          onclick="RaahiPlaces.closeDetailModal(); RaahiRestaurants.openRestModal('${nd.id}')"
                          class="p-3 rounded-xl bg-white
                                 dark:bg-stone-900
                                 border border-stone-200
                                 dark:border-stone-700
                                 flex items-center gap-3
                                 cursor-pointer hover:border-amber-500
                                 transition-colors">

                          <img
                            src="${nd.image || ''}"
                            alt="${nd.name || 'Restaurant'}"
                            class="w-12 h-12 rounded-lg object-cover">

                          <div class="truncate">

                            <h5
                              class="text-xs font-bold
                                     text-stone-900 dark:text-white
                                     truncate">
                              ${nd.name || 'Restaurant'}
                            </h5>

                            <span
                              class="text-[10px] text-amber-600
                                     font-semibold">
                              2.1 km • ${nd.cuisine || 'Restaurant'}
                            </span>

                          </div>

                        </div>
                      `
                    )
                    .join('')
                }

              </div>

            </div>

            <!-- REVIEWS -->
            <div
              class="mt-8 pt-8 border-t
                     border-stone-200 dark:border-stone-800">

              <div
                class="flex items-center justify-between
                       gap-3 mb-5">

                <div>

                  <h4
                    class="font-heading text-xl font-extrabold
                           text-stone-900 dark:text-white">
                    Traveler Reviews
                  </h4>

                  <p
                    class="text-xs text-stone-500
                           dark:text-stone-400 mt-1">
                    Real reviews from the Raahi community.
                  </p>

                </div>

                <span
                  id="place-review-summary-${place.id}"
                  class="text-sm font-bold text-amber-600">
                  Loading...
                </span>

              </div>

              <div
                id="place-reviews-list-${place.id}"
                class="space-y-3 mb-6">

                <div
                  class="py-8 text-center
                         text-xs text-stone-500">
                  Loading reviews...
                </div>

              </div>

              ${
                typeof RaahiAuth !== 'undefined' &&
                RaahiAuth.currentUser
                  ? `
                    <div
                      class="p-5 rounded-2xl
                             bg-stone-50 dark:bg-stone-800/60
                             border border-stone-200
                             dark:border-stone-700">

                      <h5
                        class="font-heading text-sm font-extrabold
                               text-stone-900 dark:text-white mb-4">
                        Write a Review
                      </h5>

                      <div class="mb-4">

                        <label
                          class="block text-[10px]
                                 uppercase tracking-wider
                                 font-extrabold text-stone-400 mb-2">
                          Your Rating
                        </label>

                        <div
                          id="place-review-stars-${place.id}"
                          class="flex gap-1">

                          ${[1,2,3,4,5].map(star => `
                            <button
                              type="button"
                              onclick="RaahiPlaces.setReviewRating('${place.id}', ${star})"
                              class="place-review-star-${place.id}
                                     text-2xl text-stone-300
                                     hover:text-amber-500
                                     transition-colors">
                              ★
                            </button>
                          `).join('')}

                        </div>

                      </div>

                      <textarea
                        id="place-review-comment-${place.id}"
                        rows="4"
                        maxlength="1000"
                        placeholder="Share your experience..."
                        class="w-full rounded-xl border
                               border-stone-300 dark:border-stone-700
                               bg-white dark:bg-stone-900
                               text-sm text-stone-900 dark:text-white
                               p-3 outline-none
                               focus:border-amber-500
                               resize-none"></textarea>

                      <button
                        id="place-review-submit-${place.id}"
                        type="button"
                        onclick="RaahiPlaces.submitReview('${place.id}')"
                        class="mt-3 px-5 py-2.5 rounded-xl
                               bg-amber-600 hover:bg-amber-700
                               text-white text-xs font-bold
                               transition-all">
                        Submit Review
                      </button>

                    </div>
                  `
                  : `
                    <div
                      class="p-5 rounded-2xl
                             bg-stone-50 dark:bg-stone-800/60
                             text-center">

                      <p class="text-xs text-stone-500">
                        Sign in to write a review.
                      </p>

                    </div>
                  `
              }

            </div>

          </div>

          <!-- Fast facts -->
          <div class="space-y-4">

            <div
              class="p-5 bg-stone-50 dark:bg-stone-800
                     rounded-2xl border border-stone-200
                     dark:border-stone-700 space-y-4">

              <h4
                class="font-heading text-sm font-bold
                       text-stone-900 dark:text-white
                       uppercase tracking-wider">
                Visitor Key Information
              </h4>

              <div
                class="border-t border-stone-200
                       dark:border-stone-700 pt-3">

                <span
                  class="text-[11px] text-stone-500
                         uppercase font-bold block">
                  Address
                </span>

                <span
                  class="text-xs font-semibold
                         text-stone-800 dark:text-stone-200
                         block mt-1 mb-3">
                  ${place.address || 'Address not available'}
                </span>

                <span
                  class="text-[11px] text-stone-500
                         uppercase font-bold block">
                  Opening Hours
                </span>

                <span
                  class="text-xs font-semibold
                         text-stone-800 dark:text-stone-200">
                  ${place.openingHours || 'Timing not available'}
                </span>

              </div>

              <div
                class="border-t border-stone-200
                       dark:border-stone-700 pt-3">

                <span
                  class="text-[11px] text-stone-500
                         uppercase font-bold block">
                  Entry Fee
                </span>

                <span
                  class="text-xs font-semibold
                         text-emerald-600 dark:text-emerald-400">

                  ${
                    Number(place.entryFee || 0) === 0
                      ? 'Free Entry'
                      : `₹${place.entryFee}`
                  }

                </span>

              </div>

              <div
                class="border-t border-stone-200
                       dark:border-stone-700 pt-3">

                <span
                  class="text-[11px] text-stone-500
                         uppercase font-bold block">
                  Best Time to Visit
                </span>

                <span
                  class="text-xs font-semibold
                         text-stone-800 dark:text-stone-200">
                  ${place.bestTimeToVisit || 'Information not available'}
                </span>

              </div>

              <div
                class="border-t border-stone-200
                       dark:border-stone-700 pt-3">

                <span
                  class="text-[11px] text-stone-500
                         uppercase font-bold block">
                  Nearby Attractions
                </span>

                <div
                  class="flex flex-wrap gap-1.5 mt-1.5">

                  ${
                    nearbyAttractions.length
                      ? nearbyAttractions
                          .map(
                            att => `
                              <span
                                class="text-[10px] px-2 py-0.5
                                       rounded-full bg-stone-200
                                       dark:bg-stone-700
                                       text-stone-800
                                       dark:text-stone-200
                                       font-medium">
                                ${att}
                              </span>
                            `
                          )
                          .join('')
                      : `
                        <span
                          class="text-[10px] text-stone-500">
                          Information not available
                        </span>
                      `
                  }

                </div>

              </div>

            </div>

            <!-- Community banner -->
            <div
              class="p-4 rounded-xl
                     bg-amber-50 dark:bg-amber-950/40
                     border border-amber-200
                     dark:border-amber-800/60
                     text-center">

              <span
                class="material-symbols-outlined text-amber-600
                       text-2xl block mb-1">
                verified
              </span>

              <h6
                class="text-xs font-bold
                       text-stone-900 dark:text-white">
                Help Us Keep Raahi Accurate
              </h6>

              <p
                class="text-[11px] text-stone-600
                       dark:text-stone-400 mt-0.5 mb-3">
                Found incorrect timings or ticket rates?
                Submit a community change.
              </p>

              <button
                type="button"
                onclick="RaahiPlaces.closeDetailModal(); RaahiCommunity.openSuggestModal('${place.id}', 'place', '${String(place.name || '').replace(/'/g, "\\'")}')"
                class="w-full py-2 bg-amber-600 text-white
                       rounded-lg text-xs font-bold
                       hover:bg-amber-700 transition-colors">
                Suggest Correction
              </button>

            </div>

          </div>

        </div>

      </div>
    `;

    // Open the modal and always start at the top.
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const scrollBox =
      document.getElementById('place-detail-modal-scroll');

    if (scrollBox) {
      scrollBox.scrollTop = 0;
      scrollBox.scrollTo(0, 0);
    }

    // Load reviews AFTER the complete place details have rendered.
    this.loadPlaceReviews(place.id);
  },

  // =========================================================
  // REVIEWS
  // =========================================================

  reviewRatings: {},


  setReviewRating(placeId, rating) {

    this.reviewRatings[placeId] = rating;

    document
      .querySelectorAll(
        `.place-review-star-${placeId}`
      )
      .forEach((star, index) => {

        star.classList.toggle(
          'text-amber-500',
          index < rating
        );

        star.classList.toggle(
          'text-stone-300',
          index >= rating
        );

      });

  },


  async loadPlaceReviews(placeId) {

    const list =
      document.getElementById(
        `place-reviews-list-${placeId}`
      );

    const summary =
      document.getElementById(
        `place-review-summary-${placeId}`
      );

    if (!list) return;


    try {

      const response =
        await RaahiAPI.getReviews(
          'Place',
          placeId
        );


      if (
        !response ||
        !response.success ||
        !response.data
      ) {

        throw new Error(
          response?.message ||
          'Failed to load reviews'
        );

      }


      const reviews =
        Array.isArray(response.data.reviews)
          ? response.data.reviews
          : [];


      const reviewSummary =
        response.data.summary || {};


      if (summary) {

        summary.textContent =
          `${reviewSummary.averageRating || 0} ★ · ${reviewSummary.totalReviews || 0} reviews`;

      }


      if (!reviews.length) {

        list.innerHTML = `

          <div
            class="py-8 text-center
                   rounded-xl
                   bg-stone-50 dark:bg-stone-800/50">

            <span
              class="material-symbols-outlined
                     text-3xl text-stone-300">

              rate_review

            </span>

            <p
              class="text-xs text-stone-500 mt-2">

              No reviews yet. Be the first!

            </p>

          </div>

        `;

        return;

      }


      list.innerHTML =
        reviews.map(review => {

          const user =
            review.user || {};

          const name =
            user.fullName ||
            user.username ||
            'Raahi Traveler';


          const date =
            review.createdAt
              ? new Date(
                  review.createdAt
                ).toLocaleDateString(
                  'en-IN',
                  {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }
                )
              : '';


          return `

            <article
              class="p-4 rounded-xl
                     bg-white dark:bg-stone-900
                     border border-stone-200
                     dark:border-stone-700">

              <div
                class="flex items-start
                       justify-between gap-3">

                <div>

                  <p
                    class="text-xs font-bold
                           text-stone-900
                           dark:text-white">

                    ${name}

                  </p>

                  <p
                    class="text-[10px]
                           text-stone-400 mt-0.5">

                    ${date}

                  </p>

                </div>


                <span
                  class="text-amber-500
                         text-sm font-bold">

                  ${'★'.repeat(review.rating)}
                  ${'☆'.repeat(5 - review.rating)}

                </span>

              </div>


              <p
                class="text-sm
                       text-stone-600
                       dark:text-stone-300
                       mt-3
                       leading-relaxed">

                ${review.comment}

              </p>

            </article>

          `;

        }).join('');


    } catch (error) {

      console.error(
        '[RaahiPlaces] Review loading failed:',
        error
      );

      list.innerHTML = `

        <div
          class="py-6 text-center
                 text-xs text-red-500">

          Unable to load reviews.

        </div>

      `;

    }

  },


 async submitReview(placeId) {

  if (
    typeof RaahiAuth === 'undefined' ||
    !RaahiAuth.currentUser
  ) {
    RaahiAuth.openAuthModal('signin');
    return;
  }

  const rating =
    this.reviewRatings[placeId] || 0;

  const commentEl =
    document.getElementById(
      `place-review-comment-${placeId}`
    );

  const submitBtn =
    document.getElementById(
      `place-review-submit-${placeId}`
    );

  const comment =
    commentEl?.value?.trim() || '';

  if (!rating) {
    RaahiApp.showToast(
      'Please select a rating.',
      'error'
    );
    return;
  }

  if (!comment) {
    RaahiApp.showToast(
      'Please write a review.',
      'error'
    );
    return;
  }

  try {

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    // -----------------------------------------
    // CREATE REVIEW IN BACKEND
    // -----------------------------------------

    const response =
      await RaahiAPI.createReview(
        'Place',
        placeId,
        rating,
        comment
      );

    if (
      !response ||
      !response.success
    ) {
      throw new Error(
        response?.message ||
        'Failed to submit review'
      );
    }

    // -----------------------------------------
    // REFRESH REVIEWS FOR THIS PLACE
    // -----------------------------------------

    await this.loadPlaceReviews(placeId);

    // -----------------------------------------
    // REFRESH USER'S REVIEWS FROM BACKEND
    // -----------------------------------------

    try {

      const myReviewsResponse =
        await RaahiAPI.getMyReviews();

      if (
        myReviewsResponse &&
        myReviewsResponse.success &&
        Array.isArray(myReviewsResponse.data)
      ) {
        RaahiAuth.myReviews =
          myReviewsResponse.data;
      }

    } catch (refreshError) {

      console.warn(
        '[RaahiPlaces] My reviews refresh failed:',
        refreshError
      );

    }

    // -----------------------------------------
    // REFRESH DASHBOARD
    // -----------------------------------------

    if (
      typeof RaahiDashboard !== 'undefined'
    ) {

      if (
        typeof RaahiDashboard.renderReviews ===
        'function'
      ) {
        RaahiDashboard.renderReviews();
      }

      const reviewStat =
        document.getElementById(
          'dash-stat-reviews'
        );

      if (reviewStat) {
        reviewStat.textContent =
          Array.isArray(RaahiAuth.myReviews)
            ? RaahiAuth.myReviews.length
            : 0;
      }

    }

    // -----------------------------------------
    // CLEAR FORM
    // -----------------------------------------

    if (commentEl) {
      commentEl.value = '';
    }

    this.reviewRatings[placeId] = 0;

    RaahiApp.showToast(
      'Review submitted successfully!',
      'success'
    );

  } catch (error) {

    console.error(
      '[RaahiPlaces] Review submission failed:',
      error
    );

    RaahiApp.showToast(
      error.message ||
      'Unable to submit review.',
      'error'
    );

  } finally {

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
    }

  }

},


  /**
   * Close detail modal.
   */
  
  
  
  closeDetailModal() {

    const modal =
      document.getElementById(
        'place-detail-modal'
      );

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
