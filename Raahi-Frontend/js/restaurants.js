/**
 * RAAHI — Restaurants & Culinary Guide Discovery Module
 *
 * Strictly for Food & Restaurant Discovery.
 * NEVER displays table reservations, booking, or payments.
 *
 * Reviews:
 * - Public users can read reviews.
 * - Logged-in users can submit one review per restaurant.
 * - Uses the existing RaahiAPI review system.
 */

const RaahiRestaurants = {

  cuisineFilter: 'all',
  searchQuery: '',

  currentPage: 1,
  totalPages: 1,
  totalRestaurants: 0,
  restaurantsPerPage: 20,
  loadingPage: false,

  // =========================================================
  // REVIEW STATE
  // =========================================================

  reviewRatings: {},


  // =========================================================
  // INIT
  // =========================================================

  async init() {

    this.bindEvents();

    await this.loadPage(1);

  },


  // =========================================================
  // NORMALIZE RESTAURANT
  // =========================================================

  normalizeRestaurant(rest) {

    if (!rest) return null;

    return {

      ...rest,

      // -----------------------------------------------------
      // IDs
      // -----------------------------------------------------

      id:
        rest.id ||
        rest.restaurantId ||
        rest._id,

      restaurantId:
        rest.restaurantId ||
        rest.id ||
        rest._id ||
        '',


      // -----------------------------------------------------
      // IMAGE
      // -----------------------------------------------------

      image:
        rest.image ||
        rest.images?.[0] ||
        '',


      // -----------------------------------------------------
      // CUISINE
      // -----------------------------------------------------

      cuisine:
        rest.cuisine ||
        rest.category ||
        'Restaurant',


      // -----------------------------------------------------
      // PRICE
      // -----------------------------------------------------

      priceRange:
        rest.priceRange ||
        rest.price ||
        'Price not available',


      // -----------------------------------------------------
      // DESCRIPTION
      // -----------------------------------------------------

      description:
        rest.description ||
        `${rest.name || 'This restaurant'} is a restaurant in ${rest.city || ''}, ${rest.state || ''}.`,


      // -----------------------------------------------------
      // LOCATION
      // -----------------------------------------------------

      location:
        rest.location ||
        rest.address ||
        `${rest.city || ''}, ${rest.state || ''}`,


      // -----------------------------------------------------
      // CONTACT
      // -----------------------------------------------------

      contact:
        rest.contact ||
        rest.phone ||
        'Contact restaurant directly',


      // -----------------------------------------------------
      // REVIEW COUNT
      // -----------------------------------------------------

      reviewsCount:
        rest.reviewsCount ??
        0,


      // -----------------------------------------------------
      // SPECIALTIES
      // -----------------------------------------------------

      specialties:
        Array.isArray(rest.specialties)
          ? rest.specialties
          : [],


      // -----------------------------------------------------
      // DIETARY OPTIONS
      // -----------------------------------------------------

      dietaryOptions:
        Array.isArray(rest.dietaryOptions)
          ? rest.dietaryOptions
          : ['Not specified'],


      // -----------------------------------------------------
      // OPENING HOURS
      // -----------------------------------------------------

      openingHours:
        rest.openingHours ||
        'Timings not available',


      // -----------------------------------------------------
      // RATING
      // -----------------------------------------------------

      rating:
        rest.rating ?? 0

    };

  },


  // =========================================================
  // GET STABLE RESTAURANT ID
  // =========================================================

  getRestaurantId(rest) {

    if (!rest) return '';

    return String(

      rest.restaurantId ||
      rest.id ||
      rest._id ||
      ''

    );

  },


  // =========================================================
  // FIND RESTAURANT LOCALLY
  // =========================================================

  findLocalRestaurant(restId) {

    const target =
      String(restId || '');

    if (!target) return null;


    // -------------------------------------------------------
    // 1. MAIN RESTAURANT CATALOG
    // -------------------------------------------------------

    const restaurants =
      Array.isArray(
        typeof RAAHI_DATA !== 'undefined'
          ? RAAHI_DATA.restaurants
          : null
      )
        ? RAAHI_DATA.restaurants
        : [];


    let rest =
      restaurants.find(r =>

        String(r.restaurantId || '') === target ||

        String(r.id || '') === target ||

        String(r._id || '') === target

      );


    if (rest) {

      return this.normalizeRestaurant(rest);

    }


    // -------------------------------------------------------
    // 2. CITY HUB
    // -------------------------------------------------------

    const cityItems =

      typeof RaahiCityHub !== 'undefined' &&

      Array.isArray(
        RaahiCityHub.items
      )

        ? RaahiCityHub.items

        : [];


    rest =
      cityItems.find(r =>

        String(r.restaurantId || '') === target ||

        String(r.id || '') === target ||

        String(r._id || '') === target

      );


    if (rest) {

      console.log(

        '[RaahiRestaurants] Found restaurant in City Hub:',

        rest.name,

        this.getRestaurantId(rest)

      );

      return this.normalizeRestaurant(rest);

    }


    return null;

  },


  // =========================================================
  // LOAD RESTAURANT BY ID
  // =========================================================

  async getRestaurantById(restId) {

    const target =
      String(restId || '');

    if (!target) {
      return null;
    }


    // -------------------------------------------------------
    // FIRST: LOCAL / CITY HUB
    // -------------------------------------------------------

    const localRestaurant =
      this.findLocalRestaurant(target);


    if (localRestaurant) {

      return localRestaurant;

    }


    // -------------------------------------------------------
    // SECOND: BACKEND INDIVIDUAL RESTAURANT API
    // -------------------------------------------------------

    try {

      if (

        typeof RaahiAPI !== 'undefined' &&

        typeof RaahiAPI.get === 'function'

      ) {

        console.log(

          '[RaahiRestaurants] Fetching restaurant:',

          target

        );


        const response =
          await RaahiAPI.get(

            `/api/restaurants/${encodeURIComponent(target)}`

          );


        if (

          response &&

          response.success &&

          response.data

        ) {

          const restaurant =
            this.normalizeRestaurant(
              response.data
            );


          // -------------------------------------------------
          // ADD / UPDATE LOCAL CATALOG
          // -------------------------------------------------

          if (
            typeof RAAHI_DATA !== 'undefined'
          ) {

            if (
              !Array.isArray(
                RAAHI_DATA.restaurants
              )
            ) {

              RAAHI_DATA.restaurants = [];

            }


            const existingIndex =
              RAAHI_DATA.restaurants.findIndex(
                r =>

                  String(
                    r.restaurantId ||
                    r.id ||
                    r._id ||
                    ''
                  ) ===

                  String(
                    restaurant.restaurantId ||
                    restaurant.id ||
                    restaurant._id ||
                    ''
                  )
              );


            if (existingIndex >= 0) {

              RAAHI_DATA.restaurants[
                existingIndex
              ] = restaurant;

            } else {

              RAAHI_DATA.restaurants.push(
                restaurant
              );

            }

          }


          return restaurant;

        }


        console.warn(

          '[RaahiRestaurants] Restaurant API returned no data:',

          target

        );

      }

    } catch (error) {

      console.error(

        '[RaahiRestaurants] Failed to fetch restaurant:',

        target,

        error

      );

    }


    return null;

  },


  // =========================================================
  // LOAD RESTAURANT PAGE
  // =========================================================

  async loadPage(page = 1) {

    if (this.loadingPage) {
      return;
    }


    this.loadingPage = true;


    try {

      const response =
        await fetch(

          `/api/restaurants?page=${page}&limit=${this.restaurantsPerPage}`

        );


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );

      }


      const result =
        await response.json();


      if (

        !result.success ||

        !Array.isArray(result.data)

      ) {

        throw new Error(
          'Invalid restaurants API response'
        );

      }


      if (
        typeof RAAHI_DATA !== 'undefined'
      ) {

        RAAHI_DATA.restaurants =
          result.data.map(
            rest =>
              this.normalizeRestaurant(rest)
          );

      }


      this.currentPage =
        result.page || page;


      this.totalPages =
        result.pages || 1;


      this.totalRestaurants =
        result.total ||
        result.data.length;


      console.log(

        `✅ Restaurants page ${this.currentPage}/${this.totalPages} loaded`

      );


      this.renderRestaurants();

      this.renderPagination();


    } catch (error) {

      console.error(

        '❌ Failed to load restaurants:',

        error

      );

    } finally {

      this.loadingPage = false;

    }

  },


  // =========================================================
  // PAGINATION
  // =========================================================

  renderPagination() {

    const container =
      document.getElementById(
        'restaurants-pagination'
      );


    if (!container) return;


    if (this.totalPages <= 1) {

      container.innerHTML = '';

      return;

    }


    container.innerHTML = `

      <div
        class="flex
               items-center
               justify-center
               gap-2
               py-6">

        <button
          onclick="RaahiRestaurants.loadPage(${this.currentPage - 1})"
          ${this.currentPage === 1 ? 'disabled' : ''}
          class="px-4
                 py-2
                 rounded-xl
                 text-xs
                 font-bold
                 bg-stone-100
                 dark:bg-stone-800
                 text-stone-700
                 dark:text-stone-200
                 disabled:opacity-40
                 disabled:cursor-not-allowed
                 hover:bg-amber-100
                 hover:text-amber-800">

          ← Previous

        </button>


        <span
          class="px-4
                 py-2
                 text-xs
                 font-bold
                 text-stone-600
                 dark:text-stone-300">

          Page ${this.currentPage}
          of
          ${this.totalPages}

        </span>


        <button
          onclick="RaahiRestaurants.loadPage(${this.currentPage + 1})"
          ${this.currentPage === this.totalPages ? 'disabled' : ''}
          class="px-4
                 py-2
                 rounded-xl
                 text-xs
                 font-bold
                 bg-stone-100
                 dark:bg-stone-800
                 text-stone-700
                 dark:text-stone-200
                 disabled:opacity-40
                 disabled:cursor-not-allowed
                 hover:bg-amber-100
                 hover:text-amber-800">

          Next →

        </button>

      </div>

    `;

  },


  // =========================================================
  // EVENTS
  // =========================================================

  bindEvents() {

    // -------------------------------------------------------
    // CUISINE FILTER
    // -------------------------------------------------------

    document
      .querySelectorAll('.rest-cuisine-btn')
      .forEach(btn => {

        btn.addEventListener(
          'click',
          () => {

            document
              .querySelectorAll(
                '.rest-cuisine-btn'
              )
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


            this.cuisineFilter =
              btn.getAttribute(
                'data-cuisine'
              ) || 'all';


            this.renderRestaurants();

          }
        );

      });


    // -------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------

    const searchInput =
      document.getElementById(
        'restaurants-search-input'
      );


    if (searchInput) {

      searchInput.addEventListener(
        'input',
        e => {

          this.searchQuery =
            e.target.value
              .toLowerCase()
              .trim();


          this.renderRestaurants();

        }
      );

    }

  },


  // =========================================================
  // FILTER RESTAURANTS
  // =========================================================

  getFilteredRestaurants() {

    if (
      typeof RAAHI_DATA === 'undefined' ||
      !Array.isArray(
        RAAHI_DATA.restaurants
      )
    ) {

      return [];

    }


    return RAAHI_DATA.restaurants.filter(
      rest => {

        const cuisine =
          String(
            rest.cuisine || ''
          ).toLowerCase();


        const name =
          String(
            rest.name || ''
          ).toLowerCase();


        const city =
          String(
            rest.city || ''
          ).toLowerCase();


        const specialties =
          Array.isArray(
            rest.specialties
          )
            ? rest.specialties
            : [];


        // ---------------------------------------------------
        // CUISINE FILTER
        // ---------------------------------------------------

        if (

          this.cuisineFilter !== 'all' &&

          !cuisine.includes(
            this.cuisineFilter.toLowerCase()
          )

        ) {

          return false;

        }


        // ---------------------------------------------------
        // SEARCH
        // ---------------------------------------------------

        if (this.searchQuery) {

          const query =
            this.searchQuery;


          const match =

            name.includes(query) ||

            city.includes(query) ||

            cuisine.includes(query) ||

            specialties.some(
              s =>
                String(s)
                  .toLowerCase()
                  .includes(query)
            );


          if (!match) {

            return false;

          }

        }


        return true;

      }
    );

  },


  // =========================================================
  // RENDER RESTAURANTS
  // =========================================================

  renderRestaurants() {

    const container =
      document.getElementById(
        'restaurants-grid-container'
      );


    const countBadge =
      document.getElementById(
        'restaurants-count-badge'
      );


    if (!container) {
      return;
    }


    const list =
      this.getFilteredRestaurants();


    if (countBadge) {

      countBadge.textContent =
        `${list.length} Culinary Spots`;

    }


    if (list.length === 0) {

      container.innerHTML = `

        <div
          class="col-span-full
                 py-16
                 text-center">

          <span
            class="material-symbols-outlined
                   text-5xl
                   text-stone-300
                   dark:text-stone-600
                   mb-3
                   block">

            restaurant

          </span>


          <h3
            class="font-heading
                   text-lg
                   font-bold
                   text-stone-700
                   dark:text-stone-300">

            No restaurants found

          </h3>


          <p
            class="text-xs
                   text-stone-500
                   mt-1">

            Try selecting a different cuisine
            or clearing your search term.

          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      list.map(rest => {

        const restaurantId =
          this.getRestaurantId(rest);


        const isSaved =
          typeof RaahiAuth !== 'undefined' &&
          RaahiAuth.isSaved(
            restaurantId
          );


        return `

          <div
            class="bg-white
                   dark:bg-stone-900
                   border
                   border-stone-200
                   dark:border-stone-800
                   rounded-2xl
                   overflow-hidden
                   shadow-sm
                   hover:shadow-xl
                   transition-all
                   duration-300
                   flex
                   flex-col
                   group
                   card-hover">


            <!-- IMAGE -->

            <div
              class="relative
                     h-56
                     w-full
                     overflow-hidden
                     bg-stone-100
                     dark:bg-stone-800">

              <img
                src="${rest.image}"
                alt="${rest.name}"
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


              <!-- BADGES -->

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
                         text-[11px]
                         font-bold
                         bg-black/60
                         backdrop-blur-md
                         text-white
                         border
                         border-white/20">

                  ${rest.city}

                </span>


                <span
                  class="px-2.5
                         py-1
                         rounded-full
                         text-[11px]
                         font-bold
                         bg-amber-600
                         text-white">

                  ${String(
                    rest.priceRange ||
                    'Price not available'
                  ).split('(')[0]}

                </span>

              </div>


              <!-- SAVE -->

              <button
                onclick="RaahiAuth.toggleSave('${restaurantId}')"
                title="Save Restaurant"
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


              <!-- RATING -->

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
                      class="material-symbols-outlined
                             text-sm">

                      star

                    </span>

                    ${rest.rating}

                    (${rest.reviewsCount} reviews)

                  </span>


                  <span
                    class="text-[11px]
                           text-amber-300
                           font-bold">

                    ${rest.cuisine}

                  </span>

                </div>

              </div>

            </div>


            <!-- CARD BODY -->

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
                         mb-2
                         line-clamp-1
                         group-hover:text-amber-600
                         transition-colors">

                  ${rest.name}

                </h3>


                <p
                  class="text-xs
                         text-stone-600
                         dark:text-stone-400
                         line-clamp-2
                         mb-3
                         leading-relaxed">

                  ${rest.description}

                </p>


                <!-- SPECIALTIES -->

                <div class="mb-4">

                  <span
                    class="text-[10px]
                           font-bold
                           uppercase
                           text-amber-600
                           tracking-wider
                           block
                           mb-1">

                    Must-Try Specialties

                  </span>


                  <div
                    class="flex
                           flex-wrap
                           gap-1">

                    ${
                      Array.isArray(
                        rest.specialties
                      )

                        ? rest.specialties
                            .slice(0, 3)
                            .map(
                              s => `

                                <span
                                  class="text-[10px]
                                         px-2
                                         py-0.5
                                         rounded-md
                                         bg-amber-50
                                         dark:bg-amber-950/40
                                         text-amber-900
                                         dark:text-amber-300
                                         font-semibold
                                         border
                                         border-amber-200/60
                                         dark:border-amber-900/40">

                                  ${s}

                                </span>

                              `
                            )
                            .join('')

                        : ''

                    }

                  </div>

                </div>

              </div>


              <!-- BOTTOM -->

              <div>

                <div
                  class="py-2
                         border-t
                         border-stone-100
                         dark:border-stone-800
                         text-[11px]
                         text-stone-500
                         mb-3
                         truncate
                         flex
                         items-center
                         justify-between">

                  <span
                    class="truncate
                           max-w-[180px]">

                    <span
                      class="material-symbols-outlined
                             text-xs
                             align-middle
                             text-amber-600
                             mr-0.5">

                      schedule

                    </span>

                    ${
                      String(
                        rest.openingHours ||
                        'Timings not available'
                      ).split('(')[0]
                    }

                  </span>


                  <span
                    class="text-emerald-600
                           dark:text-emerald-400
                           font-semibold">

                    ${
                      rest.dietaryOptions?.[0] ||
                      'Not specified'
                    }

                  </span>

                </div>


                <div
                  class="grid
                         grid-cols-2
                         gap-2">

                  <button
                    onclick="RaahiRestaurants.openRestModal('${restaurantId}')"
                    class="w-full
                           py-2.5
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
                      Dining Info
                    </span>

                    <span
                      class="material-symbols-outlined
                             text-sm">

                      arrow_forward

                    </span>

                  </button>


                  <button
                    onclick="RaahiCommunity.openSuggestModal('${restaurantId}', 'restaurant', '${String(rest.name || '').replace(/'/g, "\\'")}')"
                    class="w-full
                           py-2.5
                           px-3
                           rounded-xl
                           bg-stone-100
                           dark:bg-stone-800
                           text-stone-700
                           dark:text-stone-300
                           text-xs
                           font-bold
                           hover:bg-amber-50
                           dark:hover:bg-amber-950/30
                           hover:text-amber-700
                           transition-all
                           flex
                           items-center
                           justify-center
                           gap-1">

                    <span
                      class="material-symbols-outlined
                             text-sm
                             text-amber-600">

                      edit_note

                    </span>

                    <span>
                      Suggest
                    </span>

                  </button>

                </div>

              </div>

            </div>

          </div>

        `;

      }).join('');

  },


  // =========================================================
  // OPEN RESTAURANT MODAL
  // =========================================================

  async openRestModal(restId) {

    console.log(
      '[RaahiRestaurants] Opening restaurant:',
      restId
    );


    if (!restId) {

      console.warn(
        '[RaahiRestaurants] Missing restaurant ID'
      );

      return;

    }


    // -------------------------------------------------------
    // GET RESTAURANT
    // -------------------------------------------------------

    const rest =
      await this.getRestaurantById(
        restId
      );


    if (!rest) {

      console.error(
        '[RaahiRestaurants] Restaurant not found:',
        restId
      );

      if (
        typeof RaahiApp !== 'undefined' &&
        typeof RaahiApp.showToast === 'function'
      ) {

        RaahiApp.showToast(
          'Restaurant details could not be loaded.',
          'error'
        );

      }

      return;

    }


    // -------------------------------------------------------
    // MODAL
    // -------------------------------------------------------

    const modal =
      document.getElementById(
        'restaurant-detail-modal'
      );


    const content =
      document.getElementById(
        'restaurant-modal-content'
      );


    if (!modal || !content) {

      console.error(
        '[RaahiRestaurants] Restaurant modal elements not found.'
      );

      return;

    }


    const restaurantId =
      this.getRestaurantId(rest);


    if (!restaurantId) {

      console.error(
        '[RaahiRestaurants] Restaurant has no valid ID.',
        rest
      );

      return;

    }


    // Reset rating for this opening.

    this.reviewRatings[
      restaurantId
    ] = 0;


    // -------------------------------------------------------
    // RESTAURANT MODAL CONTENT
    // -------------------------------------------------------

    content.innerHTML = `

      <!-- =================================================
           HERO
      ================================================== -->

      <div
        class="relative
               h-72
               w-full
               overflow-hidden
               bg-stone-900">

        ${
          rest.image

            ? `

              <img
                src="${rest.image}"
                alt="${rest.name}"
                class="w-full
                       h-full
                       object-cover">

            `

            : `

              <div
                class="w-full
                       h-full
                       flex
                       items-center
                       justify-center
                       bg-stone-800">

                <span
                  class="material-symbols-outlined
                         text-6xl
                         text-stone-500">

                  restaurant

                </span>

              </div>

            `
        }


        <div
          class="absolute
                 inset-0
                 bg-gradient-to-t
                 from-black/90
                 via-black/30
                 to-transparent">
        </div>


        <!-- CLOSE -->

        <button
          onclick="RaahiRestaurants.closeRestModal()"
          class="absolute
                 top-4
                 right-4
                 w-9
                 h-9
                 rounded-full
                 bg-black/60
                 text-white
                 flex
                 items-center
                 justify-center
                 hover:bg-black
                 transition-colors
                 z-20">

          <span
            class="material-symbols-outlined
                   text-lg">

            close

          </span>

        </button>


        <!-- HERO TEXT -->

        <div
          class="absolute
                 bottom-6
                 left-6
                 right-6
                 text-white
                 z-10">

          <div
            class="flex
                   items-center
                   gap-2
                   mb-2
                   flex-wrap">

            <span
              class="px-3
                     py-1
                     rounded-full
                     text-xs
                     font-extrabold
                     bg-amber-600
                     text-white">

              ${rest.cuisine}

            </span>


            <span
              class="px-3
                     py-1
                     rounded-full
                     text-xs
                     font-bold
                     bg-white/20
                     backdrop-blur-md
                     text-white">

              ${rest.city}

            </span>


            <span
              class="text-amber-400
                     text-xs
                     font-bold
                     bg-black/50
                     px-2.5
                     py-1
                     rounded-full
                     flex
                     items-center
                     gap-1">

              <span
                class="material-symbols-outlined
                       text-sm">

                star

              </span>

              ${rest.rating}

              (${rest.reviewsCount} reviews)

            </span>

          </div>


          <h2
            class="font-heading
                   text-2xl
                   sm:text-3xl
                   font-extrabold
                   text-white">

            ${rest.name}

          </h2>

        </div>

      </div>


      <!-- =================================================
           BODY
      ================================================== -->

      <div
        class="p-6
               sm:p-8
               space-y-6
               bg-white
               dark:bg-stone-900">


        <!-- INFO NOTICE -->

        <div
          class="p-3
                 bg-amber-50
                 dark:bg-amber-950/40
                 rounded-xl
                 border
                 border-amber-200
                 dark:border-amber-800
                 text-xs
                 text-amber-900
                 dark:text-amber-300
                 flex
                 items-center
                 gap-2">

          <span
            class="material-symbols-outlined
                   text-amber-600">

            restaurant

          </span>

          <span>

            Raahi provides culinary discovery
            and menu info.
            Table reservation/booking is not offered.

          </span>

        </div>


        <!-- =================================================
             ABOUT
        ================================================== -->

        <div>

          <h4
            class="font-heading
                   text-base
                   font-bold
                   text-stone-900
                   dark:text-white
                   mb-2">

            About the Culinary Experience

          </h4>


          <p
            class="text-xs
                   sm:text-sm
                   text-stone-600
                   dark:text-stone-300
                   leading-relaxed">

            ${rest.description}

          </p>

        </div>


        <!-- =================================================
             CHEF RECOMMENDED DISHES
        ================================================== -->

        <div>

          <h4
            class="font-heading
                   text-base
                   font-bold
                   text-stone-900
                   dark:text-white
                   mb-2">

            Chef Recommended Dishes

          </h4>


          <div
            class="grid
                   grid-cols-2
                   gap-2">

            ${
              Array.isArray(
                rest.specialties
              ) &&
              rest.specialties.length

                ? rest.specialties
                    .map(
                      dish => `

                        <div
                          class="p-2.5
                                 rounded-lg
                                 bg-amber-50/50
                                 dark:bg-stone-800
                                 text-stone-800
                                 dark:text-stone-200
                                 text-xs
                                 font-semibold
                                 flex
                                 items-center
                                 gap-2
                                 border
                                 border-amber-200/50
                                 dark:border-stone-700">

                          <span
                            class="material-symbols-outlined
                                   text-sm
                                   text-amber-600">

                            restaurant_menu

                          </span>

                          <span>

                            ${dish}

                          </span>

                        </div>

                      `
                    )
                    .join('')

                : `

                    <div
                      class="col-span-2
                             text-xs
                             text-stone-500">

                      Menu information not available.

                    </div>

                  `
            }

          </div>

        </div>


        <!-- =================================================
             TIMINGS / LOCATION
        ================================================== -->

        <div
          class="grid
                 grid-cols-1
                 sm:grid-cols-2
                 gap-4
                 border-t
                 border-stone-200
                 dark:border-stone-800
                 pt-5">

          <div>

            <span
              class="text-[11px]
                     font-bold
                     text-stone-400
                     uppercase
                     block
                     mb-1">

              Opening Timings

            </span>


            <span
              class="text-xs
                     font-bold
                     text-stone-900
                     dark:text-white">

              ${rest.openingHours}

            </span>

          </div>


          <div>

            <span
              class="text-[11px]
                     font-bold
                     text-stone-400
                     uppercase
                     block
                     mb-1">

              Location & Contact

            </span>


            <span
              class="text-xs
                     text-stone-700
                     dark:text-stone-300">

              ${rest.location}

              ${
                rest.contact
                  ? ` (${rest.contact})`
                  : ''
              }

            </span>

          </div>

        </div>


        <!-- =================================================
             RESTAURANT REVIEWS
        ================================================== -->

        <div
          class="border-t
                 border-stone-200
                 dark:border-stone-800
                 pt-6">


          <!-- REVIEW HEADER -->

          <div
            class="flex
                   items-center
                   justify-between
                   gap-3
                   mb-4">

            <div>

              <h4
                class="font-heading
                       text-base
                       font-bold
                       text-stone-900
                       dark:text-white">

                Traveler Reviews

              </h4>


              <p
                id="restaurant-review-summary-${restaurantId}"
                class="text-xs
                       text-stone-500
                       dark:text-stone-400
                       mt-1">

                Loading reviews...

              </p>

            </div>


            <span
              class="material-symbols-outlined
                     text-amber-600">

              rate_review

            </span>

          </div>


          <!-- =================================================
               WRITE REVIEW
          ================================================== -->

          <div
            class="p-4
                   rounded-xl
                   bg-stone-50
                   dark:bg-stone-800/60
                   border
                   border-stone-200
                   dark:border-stone-700
                   mb-5">


            <p
              class="text-xs
                     font-bold
                     text-stone-800
                     dark:text-stone-200
                     mb-2">

              Share your experience

            </p>


            <!-- STAR RATING -->

            <div
              class="flex
                     items-center
                     gap-1
                     mb-3">

              ${[1, 2, 3, 4, 5]
                .map(
                  star => `

                    <button
                      type="button"
                      onclick="RaahiRestaurants.setReviewRating('${restaurantId}', ${star})"
                      class="restaurant-review-star-${restaurantId}
                             text-stone-300
                             hover:text-amber-500
                             transition-colors">

                      <span
                        class="material-symbols-outlined
                               text-2xl">

                        star

                      </span>

                    </button>

                  `
                )
                .join('')}

            </div>


            <!-- COMMENT -->

            <textarea
              id="restaurant-review-comment-${restaurantId}"
              rows="3"
              maxlength="1000"
              placeholder="Write your review..."
              class="w-full
                     rounded-xl
                     border
                     border-stone-200
                     dark:border-stone-700
                     bg-white
                     dark:bg-stone-900
                     text-stone-800
                     dark:text-stone-200
                     text-xs
                     p-3
                     outline-none
                     focus:ring-2
                     focus:ring-amber-500
                     resize-none"></textarea>


            <!-- SUBMIT -->

            <button
              id="restaurant-review-submit-${restaurantId}"
              type="button"
              onclick="RaahiRestaurants.submitReview('${restaurantId}')"
              class="mt-3
                     w-full
                     py-2.5
                     rounded-xl
                     bg-amber-600
                     hover:bg-amber-700
                     text-white
                     text-xs
                     font-bold
                     transition-colors">

              Submit Review

            </button>

          </div>


          <!-- =================================================
               REVIEW LIST
          ================================================== -->

          <div
            id="restaurant-reviews-list-${restaurantId}"
            class="space-y-3">

            <div
              class="py-6
                     text-center
                     text-xs
                     text-stone-400">

              Loading reviews...

            </div>

          </div>

        </div>


        <!-- =================================================
             BOTTOM ACTIONS
        ================================================== -->

        <div
          class="border-t
                 border-stone-200
                 dark:border-stone-800
                 pt-5
                 flex
                 items-center
                 justify-between
                 gap-3">

          <button
            onclick="RaahiRestaurants.closeRestModal(); RaahiCommunity.openSuggestModal('${restaurantId}', 'restaurant', '${String(rest.name || '').replace(/'/g, "\\'")}')"
            class="px-4
                   py-2
                   bg-stone-100
                   dark:bg-stone-800
                   text-stone-800
                   dark:text-stone-200
                   rounded-xl
                   text-xs
                   font-bold
                   hover:bg-amber-100
                   hover:text-amber-800
                   transition-colors
                   flex
                   items-center
                   gap-1.5">

            <span
              class="material-symbols-outlined
                     text-sm
                     text-amber-600">

              edit_note

            </span>


            <span>

              Suggest a Change

            </span>

          </button>


          <button
            onclick="RaahiRestaurants.closeRestModal()"
            class="px-5
                   py-2
                   bg-stone-900
                   dark:bg-stone-100
                   text-white
                   dark:text-stone-900
                   rounded-xl
                   text-xs
                   font-bold
                   hover:bg-amber-600
                   transition-colors">

            Close

          </button>

        </div>


      </div>

    `;


    // -------------------------------------------------------
    // OPEN MODAL
    // -------------------------------------------------------

    modal.classList.remove(
      'hidden'
    );


    document.body.style.overflow =
      'hidden';


    console.log(
      '[RaahiRestaurants] Restaurant modal opened:',
      rest.name
    );


    // -------------------------------------------------------
    // LOAD REVIEWS
    // -------------------------------------------------------

    await this.loadRestaurantReviews(
      restaurantId
    );

  },


  // =========================================================
  // REVIEW: SET STAR RATING
  // =========================================================

  setReviewRating(
    restaurantId,
    rating
  ) {

    const id =
      String(restaurantId || '');


    if (!id) return;


    const selectedRating =
      Math.max(
        1,
        Math.min(
          5,
          Number(rating) || 0
        )
      );


    this.reviewRatings[id] =
      selectedRating;


    // -------------------------------------------------------
    // Update visual stars
    // -------------------------------------------------------

    const selector =
      `.restaurant-review-star-${this.escapeSelector(id)}`;


    document
      .querySelectorAll(selector)
      .forEach(
        (star, index) => {

          star.classList.toggle(
            'text-amber-500',
            index < selectedRating
          );


          star.classList.toggle(
            'text-stone-300',
            index >= selectedRating
          );

        }
      );

  },


  // =========================================================
  // ESCAPE CSS SELECTOR
  // =========================================================

  escapeSelector(value) {

    const stringValue =
      String(value || '');


    if (
      typeof CSS !== 'undefined' &&
      typeof CSS.escape === 'function'
    ) {

      return CSS.escape(
        stringValue
      );

    }


    return stringValue.replace(
      /([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g,
      '\\$1'
    );

  },


  // =========================================================
  // REVIEW: LOAD
  // =========================================================

  async loadRestaurantReviews(
    restaurantId
  ) {

    const id =
      String(restaurantId || '');


    if (!id) return;


    const list =
      document.getElementById(
        `restaurant-reviews-list-${id}`
      );


    const summary =
      document.getElementById(
        `restaurant-review-summary-${id}`
      );


    if (!list) {

      console.warn(
        '[RaahiRestaurants] Review list element not found:',
        id
      );

      return;

    }


    try {

      console.log(
        '[RaahiRestaurants] Loading reviews:',
        {
          resourceType: 'Restaurant',
          resourceId: id
        }
      );


      const response =
        await RaahiAPI.getReviews(
          'Restaurant',
          id
        );


      if (

        !response ||

        !response.success ||

        !response.data

      ) {

        throw new Error(

          response?.message ||

          'Failed to load restaurant reviews'

        );

      }


      const reviews =
        Array.isArray(
          response.data.reviews
        )
          ? response.data.reviews
          : [];


      const reviewSummary =
        response.data.summary || {};


      // -----------------------------------------------------
      // SUMMARY
      // -----------------------------------------------------

      if (summary) {

        const average =
          Number(
            reviewSummary.averageRating || 0
          );


        const total =
          Number(
            reviewSummary.totalReviews || 0
          );


        summary.textContent =
          `${average.toFixed(1)} ★ · ${total} reviews`;

      }


      // -----------------------------------------------------
      // EMPTY
      // -----------------------------------------------------

      if (!reviews.length) {

        list.innerHTML = `

          <div
            class="py-8
                   text-center
                   rounded-xl
                   bg-stone-50
                   dark:bg-stone-800/50">

            <span
              class="material-symbols-outlined
                     text-3xl
                     text-stone-300">

              rate_review

            </span>


            <p
              class="text-xs
                     text-stone-500
                     mt-2">

              No reviews yet.
              Be the first!

            </p>

          </div>

        `;

        return;

      }


      // -----------------------------------------------------
      // REVIEW LIST
      // -----------------------------------------------------

      list.innerHTML =
        reviews
          .map(
            review => {

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


              const rating =
                Math.max(
                  0,
                  Math.min(
                    5,
                    Number(
                      review.rating
                    ) || 0
                  )
                );


              return `

                <article
                  class="p-4
                         rounded-xl
                         bg-white
                         dark:bg-stone-900
                         border
                         border-stone-200
                         dark:border-stone-700">


                  <div
                    class="flex
                           items-start
                           justify-between
                           gap-3">


                    <div>

                      <p
                        class="text-xs
                               font-bold
                               text-stone-900
                               dark:text-white">

                        ${name}

                      </p>


                      <p
                        class="text-[10px]
                               text-stone-400
                               mt-0.5">

                        ${date}

                      </p>

                    </div>


                    <span
                      class="text-amber-500
                             text-sm
                             font-bold
                             whitespace-nowrap">

                      ${'★'.repeat(rating)}
                      ${'☆'.repeat(5 - rating)}

                    </span>

                  </div>


                  <p
                    class="text-sm
                           text-stone-600
                           dark:text-stone-300
                           mt-3
                           leading-relaxed">

                    ${review.comment || ''}

                  </p>


                </article>

              `;

            }
          )
          .join('');


    } catch (error) {

      console.error(
        '[RaahiRestaurants] Review loading failed:',
        error
      );


      list.innerHTML = `

        <div
          class="py-6
                 text-center
                 text-xs
                 text-red-500">

          Unable to load reviews.

        </div>

      `;

    }

  },


  // =========================================================
  // REVIEW: SUBMIT
  // =========================================================

  async submitReview(
    restaurantId
  ) {

    const id =
      String(restaurantId || '');


    if (!id) {

      if (
        typeof RaahiApp !== 'undefined'
      ) {

        RaahiApp.showToast(
          'Restaurant ID is missing.',
          'error'
        );

      }

      return;

    }


    // -------------------------------------------------------
    // LOGIN REQUIRED
    // -------------------------------------------------------

    if (

      typeof RaahiAuth === 'undefined' ||

      !RaahiAuth.currentUser

    ) {

      RaahiAuth.openAuthModal(
        'signin'
      );

      return;

    }


    // -------------------------------------------------------
    // RATING
    // -------------------------------------------------------

    const rating =
      Number(
        this.reviewRatings[id] || 0
      );


    // -------------------------------------------------------
    // COMMENT
    // -------------------------------------------------------

    const commentEl =
      document.getElementById(
        `restaurant-review-comment-${id}`
      );


    const submitBtn =
      document.getElementById(
        `restaurant-review-submit-${id}`
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

        submitBtn.textContent =
          'Submitting...';

      }


      // -----------------------------------------------------
      // CREATE BACKEND REVIEW
      // -----------------------------------------------------

      console.log(
        '[RaahiRestaurants] Creating review:',
        {
          resourceType: 'Restaurant',
          resourceId: id,
          rating,
          comment
        }
      );


      const response =
        await RaahiAPI.createReview(
          'Restaurant',
          id,
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


      // -----------------------------------------------------
      // RELOAD RESTAURANT REVIEWS
      // -----------------------------------------------------

      await this.loadRestaurantReviews(
        id
      );


      // -----------------------------------------------------
      // REFRESH MY REVIEWS
      // -----------------------------------------------------

      try {

        const myReviewsResponse =
          await RaahiAPI.getMyReviews();


        if (

          myReviewsResponse &&

          myReviewsResponse.success &&

          Array.isArray(
            myReviewsResponse.data
          )

        ) {

          RaahiAuth.myReviews =
            myReviewsResponse.data;

        }

      } catch (refreshError) {

        console.warn(
          '[RaahiRestaurants] My reviews refresh failed:',
          refreshError
        );

      }


      // -----------------------------------------------------
      // REFRESH DASHBOARD
      // -----------------------------------------------------

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
            Array.isArray(
              RaahiAuth.myReviews
            )

              ? RaahiAuth.myReviews.length

              : 0;

        }

      }


      // -----------------------------------------------------
      // CLEAR FORM
      // -----------------------------------------------------

      if (commentEl) {

        commentEl.value = '';

      }


      this.reviewRatings[id] =
        0;


      // -----------------------------------------------------
      // RESET STARS
      // -----------------------------------------------------

      document
        .querySelectorAll(
          `.restaurant-review-star-${this.escapeSelector(id)}`
        )
        .forEach(
          star => {

            star.classList.remove(
              'text-amber-500'
            );


            star.classList.add(
              'text-stone-300'
            );

          }
        );


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      RaahiApp.showToast(
        'Review submitted successfully!',
        'success'
      );


    } catch (error) {

      console.error(
        '[RaahiRestaurants] Review submission failed:',
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

        submitBtn.textContent =
          'Submit Review';

      }

    }

  },


  // =========================================================
  // CLOSE RESTAURANT MODAL
  // =========================================================

  closeRestModal() {

    const modal =
      document.getElementById(
        'restaurant-detail-modal'
      );


    if (modal) {

      modal.classList.add(
        'hidden'
      );


      document.body.style.overflow =
        '';

    }

  }

};


// =========================================================
// GLOBAL EXPORT
// =========================================================

if (
  typeof window !== 'undefined'
) {

  window.RaahiRestaurants =
    RaahiRestaurants;

}