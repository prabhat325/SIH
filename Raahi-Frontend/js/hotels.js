/**
 * RAAHI — Hotels & Heritage Stays Discovery Module
 * Strictly for Discovery and Stay Information.
 *
 * Includes:
 * - Hotel listing
 * - City filter
 * - Search
 * - Pagination
 * - Hotel detail modal
 * - Save hotel
 * - Traveler reviews
 *
 * Review resourceType:
 * "Hotel"
 */

const RaahiHotels = {

  // =========================================================
  // STATE
  // =========================================================

  reviewRatings: {},

  cityFilter: 'all',
  searchQuery: '',

  currentPage: 1,
  totalPages: 1,
  totalHotels: 0,
  hotelsPerPage: 20,

  loadingPage: false,


  // =========================================================
  // INIT
  // =========================================================

  async init() {

    this.bindEvents();

    await this.loadPage(1);

  },


  // =========================================================
  // NORMALIZE HOTEL
  // =========================================================

  normalizeHotel(hotel) {

    if (!hotel) {
      return null;
    }

    return {

      ...hotel,

      id:
        hotel.id ||
        hotel.hotelId ||
        hotel._id,

      image:
        hotel.image ||
        hotel.images?.[0] ||
        '',

      priceTier:
        hotel.priceTier ||
        hotel.category ||
        'Stay',

      description:
        hotel.description ||
        `${hotel.name || 'This property'} is a ${hotel.category || 'hotel'} in ${hotel.city || ''}, ${hotel.state || ''}.`,

      location:
        hotel.location ||
        hotel.address ||
        `${hotel.city || ''}, ${hotel.state || ''}`,

      contact:
        hotel.contact ||
        hotel.phone ||
        'Contact property directly',

      reviewsCount:
        Number(hotel.reviewsCount) || 0,

      amenities:
        Array.isArray(hotel.amenities)
          ? hotel.amenities
          : [],

      specialFeatures:
        Array.isArray(hotel.specialFeatures)
          ? hotel.specialFeatures
          : [],

      rating:
        hotel.rating ?? 0

    };

  },


  // =========================================================
  // LOAD HOTELS
  // =========================================================

  async loadPage(page = 1) {

    if (this.loadingPage) {
      return;
    }

    if (page < 1) {
      page = 1;
    }

    this.loadingPage = true;

    try {

      const response =
        await RaahiAPI.get(
          `/api/hotels?page=${page}&limit=${this.hotelsPerPage}`
        );


      if (
        !response ||
        !response.success ||
        !Array.isArray(response.data)
      ) {

        throw new Error(
          response?.message ||
          'Invalid hotels API response'
        );

      }


      RAAHI_DATA.hotels =
        response.data
          .map(hotel =>
            this.normalizeHotel(hotel)
          )
          .filter(Boolean);


      this.currentPage =
        Number(response.page) || page;

      this.totalPages =
        Number(response.pages) || 1;

      this.totalHotels =
        Number(response.total) || 0;


      console.log(
        `✅ Hotels page ${this.currentPage}/${this.totalPages} loaded`
      );


      this.renderHotels();

      this.renderPagination();


    } catch (error) {

      console.error(
        '❌ Failed to load hotels:',
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
        'hotels-pagination'
      );


    if (!container) {
      return;
    }


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
          onclick="RaahiHotels.loadPage(${this.currentPage - 1})"
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
          onclick="RaahiHotels.loadPage(${this.currentPage + 1})"
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

    const citySelect =
      document.getElementById(
        'hotels-city-filter'
      );


    if (citySelect) {

      citySelect.addEventListener(
        'change',
        e => {

          this.cityFilter =
            e.target.value;

          this.renderHotels();

        }
      );

    }


    const searchInput =
      document.getElementById(
        'hotels-search-input'
      );


    if (searchInput) {

      searchInput.addEventListener(
        'input',
        e => {

          this.searchQuery =
            e.target.value
              .toLowerCase()
              .trim();

          this.renderHotels();

        }
      );

    }

  },


  // =========================================================
  // FILTER HOTELS
  // =========================================================

  getFilteredHotels() {

    if (
      typeof RAAHI_DATA === 'undefined' ||
      !Array.isArray(RAAHI_DATA.hotels)
    ) {

      return [];

    }


    return RAAHI_DATA.hotels.filter(
      hotel => {

        if (
          this.cityFilter !== 'all' &&
          hotel.city !== this.cityFilter &&
          hotel.state !== this.cityFilter
        ) {

          return false;

        }


        if (this.searchQuery) {

          const name =
            String(
              hotel.name || ''
            ).toLowerCase();

          const city =
            String(
              hotel.city || ''
            ).toLowerCase();

          const description =
            String(
              hotel.description || ''
            ).toLowerCase();


          const match =
            name.includes(this.searchQuery) ||
            city.includes(this.searchQuery) ||
            description.includes(this.searchQuery);


          if (!match) {
            return false;
          }

        }


        return true;

      }
    );

  },


  // =========================================================
  // RENDER HOTELS
  // =========================================================

  renderHotels() {

    const container =
      document.getElementById(
        'hotels-grid-container'
      );


    const countBadge =
      document.getElementById(
        'hotels-count-badge'
      );


    if (!container) {
      return;
    }


    const list =
      this.getFilteredHotels();


    if (countBadge) {

      countBadge.textContent =
        `${list.length} Verified Stays Found`;

    }


    if (!list.length) {

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

            hotel

          </span>


          <h3
            class="font-heading
                   text-lg
                   font-bold
                   text-stone-700
                   dark:text-stone-300">

            No hotels found

          </h3>


          <p
            class="text-xs
                   text-stone-500
                   mt-1">

            Try selecting a different city
            or clearing your search keywords.

          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      list.map(
        hotel => {

          const hotelId =
            String(
              hotel.id ||
              hotel.hotelId ||
              hotel._id ||
              ''
            );


          const isSaved =
            typeof RaahiAuth !== 'undefined' &&
            RaahiAuth.isSaved(hotelId);


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
                  src="${hotel.image || ''}"
                  alt="${hotel.name || 'Hotel'}"
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

                    ${hotel.city || ''}

                  </span>


                  <span
                    class="px-2.5
                           py-1
                           rounded-full
                           text-[11px]
                           font-bold
                           bg-emerald-600
                           text-white">

                    ${hotel.priceTier || 'Stay'}

                  </span>

                </div>


                <!-- SAVE -->

                <button
                  onclick="RaahiAuth.toggleSave('${hotelId}')"
                  title="Save Stay"
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
                           ${isSaved
                             ? 'text-amber-600 fill-current'
                             : ''}">

                    ${isSaved
                      ? 'bookmark_added'
                      : 'bookmark_add'}

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

                      ${hotel.rating || 0}

                      (${hotel.reviewsCount || 0}
                      reviews)

                    </span>


                    <span
                      class="text-[11px]
                             text-stone-300
                             font-medium">

                      ${hotel.state || ''}

                    </span>

                  </div>

                </div>

              </div>


              <!-- CONTENT -->

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

                    ${hotel.name || 'Hotel'}

                  </h3>


                  <p
                    class="text-xs
                           text-stone-600
                           dark:text-stone-400
                           line-clamp-2
                           mb-3
                           leading-relaxed">

                    ${hotel.description || ''}

                  </p>


                  <!-- AMENITIES -->

                  <div
                    class="flex
                           flex-wrap
                           gap-1
                           mb-4">

                    ${hotel.amenities
                      .slice(0, 3)
                      .map(am => `

                        <span
                          class="text-[10px]
                                 px-2
                                 py-0.5
                                 rounded-md
                                 bg-stone-100
                                 dark:bg-stone-800
                                 text-stone-600
                                 dark:text-stone-300
                                 font-medium">

                          ${am}

                        </span>

                      `)
                      .join('')}

                  </div>

                </div>


                <!-- FOOTER -->

                <div>

                  <div
                    class="py-2
                           border-t
                           border-stone-100
                           dark:border-stone-800
                           text-[11px]
                           text-stone-500
                           mb-3
                           truncate">

                    <span
                      class="material-symbols-outlined
                             text-xs
                             align-middle
                             text-amber-600
                             mr-1">

                      location_on

                    </span>

                    ${hotel.location || ''}

                  </div>


                  <div
                    class="grid
                           grid-cols-2
                           gap-2">

                    <button
                      onclick="RaahiHotels.openHotelModal('${hotelId}')"
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
                        Stay Info
                      </span>

                      <span
                        class="material-symbols-outlined
                               text-sm">

                        arrow_forward

                      </span>

                    </button>


                    <button
                      onclick="RaahiCommunity.openSuggestModal('${hotelId}', 'hotel', '${String(hotel.name || '').replace(/'/g, "\\'")}')"
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

        }
      ).join('');

  },


  // =========================================================
  // OPEN HOTEL MODAL
  // =========================================================

  async openHotelModal(hotelId) {

    let hotel = null;


    // -------------------------------------------------------
    // FIRST: LOCAL DATA
    // -------------------------------------------------------

    if (
      typeof RAAHI_DATA !== 'undefined' &&
      Array.isArray(RAAHI_DATA.hotels)
    ) {

      hotel =
        RAAHI_DATA.hotels.find(
          h =>
            String(
              h.id ||
              h.hotelId ||
              h._id
            ) ===
            String(hotelId)
        );

    }


    // -------------------------------------------------------
    // SECOND: BACKEND
    // -------------------------------------------------------

    if (!hotel) {

      try {

        const response =
          await RaahiAPI.get(
            `/api/hotels/${encodeURIComponent(hotelId)}`
          );


        if (
          response &&
          response.data
        ) {

          hotel =
            this.normalizeHotel(
              response.data
            );

        }

      } catch (error) {

        console.error(
          '[RaahiHotels] Failed to fetch hotel:',
          error
        );

      }

    }


    // -------------------------------------------------------
    // NOT FOUND
    // -------------------------------------------------------

    if (!hotel) {

      console.error(
        '[RaahiHotels] Hotel not found:',
        hotelId
      );

      RaahiApp.showToast(
        'Hotel details could not be loaded.',
        'error'
      );

      return;

    }


    hotel =
      this.normalizeHotel(
        hotel
      );


    const resourceId =
      String(
        hotel.id ||
        hotel.hotelId ||
        hotel._id ||
        hotelId
      );


    // -------------------------------------------------------
    // MODAL
    // -------------------------------------------------------

    const modal =
      document.getElementById(
        'hotel-detail-modal'
      );


    const content =
      document.getElementById(
        'hotel-modal-content'
      );


    if (!modal || !content) {

      console.error(
        '[RaahiHotels] Hotel modal elements missing.'
      );

      return;

    }


    // Reset selected rating

    this.reviewRatings[resourceId] = 0;


    // -------------------------------------------------------
    // RENDER MODAL
    // -------------------------------------------------------

    content.innerHTML = `

      <!-- ===================================================
           HERO
      ==================================================== -->

      <div
        class="relative
               h-72
               w-full
               overflow-hidden
               bg-stone-900">

        ${
          hotel.image
            ? `
              <img
                src="${hotel.image}"
                alt="${hotel.name || 'Hotel'}"
                class="w-full
                       h-full
                       object-cover">
            `
            : ''
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
          onclick="RaahiHotels.closeHotelModal()"
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


        <!-- HERO DETAILS -->

        <div
          class="absolute
                 bottom-6
                 left-6
                 right-6
                 text-white
                 z-10">

          <div
            class="flex
                   flex-wrap
                   items-center
                   gap-2
                   mb-2">

            <span
              class="px-3
                     py-1
                     rounded-full
                     text-xs
                     font-extrabold
                     bg-emerald-600
                     text-white">

              ${hotel.priceTier || 'Stay'}

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

              ${hotel.city || ''}

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

              ${hotel.rating || 0}

              (${hotel.reviewsCount || 0} reviews)

            </span>

          </div>


          <h2
            class="font-heading
                   text-2xl
                   sm:text-3xl
                   font-extrabold
                   text-white">

            ${hotel.name || 'Hotel'}

          </h2>

        </div>

      </div>


      <!-- ===================================================
           BODY
      ==================================================== -->

      <div
        class="p-6
               sm:p-8
               space-y-6
               bg-white
               dark:bg-stone-900">


        <!-- DISCOVERY NOTICE -->

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

            info

          </span>

          <span>

            Raahi is a discovery & planning platform.
            Please contact the property directly for
            availability and bookings.

          </span>

        </div>


        <!-- ABOUT -->

        <div>

          <h4
            class="font-heading
                   text-base
                   font-bold
                   text-stone-900
                   dark:text-white
                   mb-2">

            About the Property

          </h4>


          <p
            class="text-xs
                   sm:text-sm
                   text-stone-600
                   dark:text-stone-300
                   leading-relaxed">

            ${hotel.description || 'No description available.'}

          </p>

        </div>


        <!-- AMENITIES -->

        <div>

          <h4
            class="font-heading
                   text-base
                   font-bold
                   text-stone-900
                   dark:text-white
                   mb-2">

            Stay Amenities & Facilities

          </h4>


          <div
            class="grid
                   grid-cols-2
                   sm:grid-cols-3
                   gap-2">

            ${
              hotel.amenities.length
                ? hotel.amenities
                    .map(
                      am => `

                        <div
                          class="p-2.5
                                 rounded-lg
                                 bg-stone-50
                                 dark:bg-stone-800
                                 text-stone-800
                                 dark:text-stone-200
                                 text-xs
                                 font-semibold
                                 flex
                                 items-center
                                 gap-2
                                 border
                                 border-stone-200
                                 dark:border-stone-700">

                          <span
                            class="material-symbols-outlined
                                   text-sm
                                   text-emerald-600">

                            check

                          </span>

                          <span>
                            ${am}
                          </span>

                        </div>

                      `
                    )
                    .join('')
                : `
                    <p
                      class="text-xs
                             text-stone-500">

                      Amenities not available.

                    </p>
                  `
            }

          </div>

        </div>


        <!-- CONTACT -->

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

              Direct Contact & Desk

            </span>


            <span
              class="text-xs
                     font-bold
                     text-stone-900
                     dark:text-white">

              ${hotel.contact || 'Contact property directly'}

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

              Address

            </span>


            <span
              class="text-xs
                     text-stone-700
                     dark:text-stone-300">

              ${hotel.location || 'Address not available'}

            </span>

          </div>

        </div>


        <!-- =================================================
             TRAVELER REVIEWS
        ================================================== -->

        <section
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
                id="hotel-review-summary-${resourceId}"
                class="text-xs
                       text-stone-500
                       dark:text-stone-400
                       mt-1">

                Loading reviews...

              </p>

            </div>


            <span
              class="material-symbols-outlined
                     text-amber-500">

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
                     text-stone-900
                     dark:text-white
                     mb-3">

              Share your experience

            </p>


            <!-- STAR SELECTOR -->

            <div
              class="flex
                     items-center
                     gap-1
                     mb-3">

              ${[1, 2, 3, 4, 5]
                .map(
                  rating => `

                    <button
                      type="button"
                      onclick="RaahiHotels.setReviewRating('${resourceId}', ${rating})"
                      class="hotel-review-star-${resourceId}
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
              id="hotel-review-comment-${resourceId}"
              rows="4"
              maxlength="1000"
              placeholder="Tell other travelers about your experience..."
              class="w-full
                     resize-none
                     rounded-xl
                     border
                     border-stone-200
                     dark:border-stone-700
                     bg-white
                     dark:bg-stone-900
                     text-stone-800
                     dark:text-stone-200
                     text-sm
                     p-3
                     outline-none
                     focus:ring-2
                     focus:ring-amber-500/40
                     focus:border-amber-500">
            </textarea>


            <!-- SUBMIT -->

            <button
              id="hotel-review-submit-${resourceId}"
              type="button"
              onclick="RaahiHotels.submitReview('${resourceId}')"
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
               EXISTING REVIEWS
          ================================================== -->

          <div
            id="hotel-reviews-list-${resourceId}"
            class="space-y-3">

            <div
              class="py-6
                     text-center
                     text-xs
                     text-stone-400">

              Loading reviews...

            </div>

          </div>

        </section>


        <!-- =================================================
             FOOTER
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
            onclick="RaahiHotels.closeHotelModal(); RaahiCommunity.openSuggestModal('${resourceId}', 'hotel', '${String(hotel.name || '').replace(/'/g, "\\'")}')"
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
            onclick="RaahiHotels.closeHotelModal()"
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


    // =======================================================
    // OPEN
    // =======================================================

    modal.classList.remove('hidden');

    document.body.style.overflow = 'hidden';


    // =======================================================
    // LOAD REVIEWS FROM BACKEND
    // =======================================================

    await this.loadHotelReviews(
      resourceId
    );

  },


  // =========================================================
  // REVIEW STAR RATING
  // =========================================================

  setReviewRating(
    hotelId,
    rating
  ) {

    rating =
      Number(rating);


    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {

      return;

    }


    this.reviewRatings[hotelId] =
      rating;


    document
      .querySelectorAll(
        `.hotel-review-star-${hotelId}`
      )
      .forEach(
        (star, index) => {

          const active =
            index < rating;


          star.classList.toggle(
            'text-amber-500',
            active
          );


          star.classList.toggle(
            'text-stone-300',
            !active
          );

        }
      );

  },


  // =========================================================
  // LOAD HOTEL REVIEWS
  // =========================================================

  async loadHotelReviews(
    hotelId
  ) {

    const list =
      document.getElementById(
        `hotel-reviews-list-${hotelId}`
      );


    const summary =
      document.getElementById(
        `hotel-review-summary-${hotelId}`
      );


    if (!list) {
      return;
    }


    try {

      const response =
        await RaahiAPI.getReviews(
          'Hotel',
          hotelId
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
            reviewSummary.averageRating
          ) || 0;


        const total =
          Number(
            reviewSummary.totalReviews
          ) || 0;


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
      // REVIEWS
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
                    Number(review.rating) || 0
                  )
                );


              const comment =
                String(
                  review.comment || ''
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
                             font-bold">

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

                    ${comment}

                  </p>


                </article>

              `;

            }
          )
          .join('');


    } catch (error) {

      console.error(
        '[RaahiHotels] Review loading failed:',
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
  // SUBMIT HOTEL REVIEW
  // =========================================================

  async submitReview(
    hotelId
  ) {

    // -------------------------------------------------------
    // LOGIN
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
        this.reviewRatings[hotelId]
      ) || 0;


    // -------------------------------------------------------
    // COMMENT
    // -------------------------------------------------------

    const commentEl =
      document.getElementById(
        `hotel-review-comment-${hotelId}`
      );


    const submitBtn =
      document.getElementById(
        `hotel-review-submit-${hotelId}`
      );


    const comment =
      commentEl?.value?.trim() || '';


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

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


    if (comment.length > 1000) {

      RaahiApp.showToast(
        'Review cannot exceed 1000 characters.',
        'error'
      );

      return;

    }


    // -------------------------------------------------------
    // SUBMIT
    // -------------------------------------------------------

    try {

      if (submitBtn) {

        submitBtn.disabled = true;

        submitBtn.textContent =
          'Submitting...';

      }


      console.log(
        '[RaahiHotels] Creating review:',
        {
          resourceType: 'Hotel',
          resourceId: hotelId,
          rating,
          comment
        }
      );


      const response =
        await RaahiAPI.createReview(
          'Hotel',
          hotelId,
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
      // REFRESH HOTEL REVIEWS
      // -----------------------------------------------------

      await this.loadHotelReviews(
        hotelId
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
          '[RaahiHotels] My reviews refresh failed:',
          refreshError
        );

      }


      // -----------------------------------------------------
      // DASHBOARD
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


      this.reviewRatings[hotelId] =
        0;


      // Reset stars

      document
        .querySelectorAll(
          `.hotel-review-star-${hotelId}`
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
        '[RaahiHotels] Review submission failed:',
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
  // CLOSE HOTEL MODAL
  // =========================================================

  closeHotelModal() {

    const modal =
      document.getElementById(
        'hotel-detail-modal'
      );


    if (modal) {

      modal.classList.add(
        'hidden'
      );

    }


    document.body.style.overflow =
      '';

  }

};


// ===========================================================
// GLOBAL
// ===========================================================

if (
  typeof window !== 'undefined'
) {

  window.RaahiHotels =
    RaahiHotels;

}