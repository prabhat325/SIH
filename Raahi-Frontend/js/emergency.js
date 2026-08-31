/**
 * RAAHI — 24x7 Emergency Services & National Helplines Hub
 * "Raahi Has Your Back"
 *
 * Added:
 * - Emergency detail modal
 * - Traveler reviews
 * - 1–5 star rating
 * - Submit review
 * - Load public reviews
 * - Refresh user's reviews
 *
 * Existing emergency functionality is preserved.
 */

const RaahiEmergency = {

  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage: 1,
  totalPages: 1,
  totalEmergencyServices: 0,
  emergencyPerPage: 20,
  loadingPage: false,

  // =========================================================
  // REVIEWS
  // =========================================================

  reviewRatings: {},


  // =========================================================
  // NORMALIZE EMERGENCY SERVICE
  // =========================================================

  normalizeEmergency(srv) {

    if (!srv) return null;

    return {

      ...srv,

      id:
        srv.id ||
        srv.serviceId ||
        srv._id,

      name:
        srv.name ||
        'Emergency Service',

      city:
        srv.city ||
        '',

      state:
        srv.state ||
        '',

      type:
        srv.type ||
        'Emergency Service',

      address:
        srv.address ||
        'Address not available',

      phone:
        srv.phone ||
        '',

      website:
        srv.website ||
        '',

      lat:
        srv.lat ??
        srv.latitude ??
        null,

      lng:
        srv.lng ??
        srv.longitude ??
        null,

      available24x7:
        srv.available24x7 ?? false,

      emergencyFacilities:
        Array.isArray(srv.emergencyFacilities)
          ? srv.emergencyFacilities
          : [],

      verified:
        srv.verified ?? false,

      available:
        srv.available ?? true

    };

  },


  // =========================================================
  // LOAD PAGINATED EMERGENCY SERVICES
  // =========================================================

  async loadPage(page = 1) {

    if (this.loadingPage) return;

    if (page < 1) page = 1;

    if (
      this.totalPages &&
      page > this.totalPages
    ) {
      return;
    }

    this.loadingPage = true;

    try {

      const response =
        await fetch(
          `/api/emergency?page=${page}&limit=${this.emergencyPerPage}`
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
          'Invalid emergency API response'
        );
      }

      RAAHI_DATA.emergencyServices =
        result.data
          .map(srv =>
            this.normalizeEmergency(srv)
          )
          .filter(Boolean);

      this.currentPage =
        result.page || page;

      this.totalPages =
        result.pages || 1;

      this.totalEmergencyServices =
        result.total || 0;

      console.log(
        `✅ Emergency page ${this.currentPage}/${this.totalPages} loaded`
      );

      this.renderServices();

      this.renderPagination();

    } catch (error) {

      console.error(
        '❌ Failed to load emergency services:',
        error
      );

      RaahiApp.showToast(
        'Unable to load emergency services.',
        'error'
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
        'emergency-pagination'
      );

    if (!container) return;

    container.innerHTML = `

      <div
        class="flex
               items-center
               justify-center
               gap-2
               py-6">

        <button
          onclick="RaahiEmergency.loadPage(${this.currentPage - 1})"
          ${this.currentPage === 1 ? 'disabled' : ''}
          class="px-4
                 py-2
                 rounded-xl
                 text-xs
                 font-bold
                 bg-stone-100
                 dark:bg-stone-800
                 disabled:opacity-40">

          ← Previous

        </button>


        <span
          class="px-4
                 py-2
                 text-xs
                 font-bold
                 text-stone-700
                 dark:text-stone-300">

          Page ${this.currentPage}
          of
          ${this.totalPages}

        </span>


        <button
          onclick="RaahiEmergency.loadPage(${this.currentPage + 1})"
          ${this.currentPage === this.totalPages ? 'disabled' : ''}
          class="px-4
                 py-2
                 rounded-xl
                 text-xs
                 font-bold
                 bg-stone-100
                 dark:bg-stone-800
                 disabled:opacity-40">

          Next →

        </button>

      </div>

    `;

  },


  // =========================================================
  // INIT
  // =========================================================

  async init() {

    this.renderHelplines();

    await this.loadPage(1);

  },


  // =========================================================
  // NATIONAL HELPLINES
  // =========================================================

  renderHelplines() {

    const container =
      document.getElementById(
        'emergency-helplines-container'
      );

    const homeContainer =
      document.getElementById(
        'home-emergency-container'
      );

    if (
      !RAAHI_DATA.nationalHelplines
    ) {
      return;
    }


    const cardsHtml =
      RAAHI_DATA.nationalHelplines
        .map(line => `

          <div
            class="p-6
                   rounded-2xl
                   bg-white
                   dark:bg-stone-900
                   border-2
                   ${
                     line.number === '112'
                       ? 'border-red-500 shadow-red-100 dark:shadow-none'
                       : 'border-stone-200 dark:border-stone-800'
                   }
                   shadow-md
                   flex
                   flex-col
                   justify-between
                   group
                   hover:scale-[1.02]
                   transition-transform">

            <div>

              <div
                class="flex
                       items-center
                       justify-between
                       mb-3">

                <span
                  class="text-2xl
                         sm:text-3xl
                         font-extrabold
                         text-red-600
                         tracking-tight
                         flex
                         items-center
                         gap-1.5
                         font-mono">

                  <span
                    class="material-symbols-outlined
                           text-2xl">

                    call

                  </span>

                  ${line.number}

                </span>


                <span
                  class="px-2.5
                         py-0.5
                         rounded-full
                         text-[10px]
                         font-extrabold
                         uppercase
                         ${
                           line.number === '112'
                             ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                             : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                         }">

                  Toll-Free 24x7

                </span>

              </div>


              <h4
                class="font-heading
                       text-base
                       font-bold
                       text-stone-900
                       dark:text-white
                       mb-1.5">

                ${line.title}

              </h4>


              <p
                class="text-xs
                       text-stone-600
                       dark:text-stone-400
                       leading-relaxed">

                ${line.description}

              </p>

            </div>


            <div
              class="mt-5
                     pt-3
                     border-t
                     border-stone-100
                     dark:border-stone-800">

              <a
                href="tel:${line.number}"
                class="w-full
                       py-2.5
                       px-4
                       rounded-xl
                       ${
                         line.number === '112'
                           ? 'bg-red-600 hover:bg-red-700'
                           : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white'
                       }
                       text-white
                       dark:text-stone-900
                       font-bold
                       text-xs
                       flex
                       items-center
                       justify-center
                       gap-2
                       transition-colors
                       shadow-sm">

                <span
                  class="material-symbols-outlined
                         text-sm">

                  phone_in_talk

                </span>

                <span>

                  Dial ${line.number} Now

                </span>

              </a>

            </div>

          </div>

        `)
        .join('');


    if (container) {

      container.innerHTML =
        cardsHtml;

    }


    if (homeContainer) {

      homeContainer.innerHTML =
        cardsHtml;

    }

  },


  // =========================================================
  // EMERGENCY SERVICE LIST
  // =========================================================

  renderServices() {

    const container =
      document.getElementById(
        'emergency-services-list'
      );

    if (
      !container ||
      !RAAHI_DATA.emergencyServices
    ) {
      return;
    }


    container.innerHTML =
      RAAHI_DATA.emergencyServices
        .map(srv => {

          const emergencyId =
            srv.id ||
            srv.serviceId ||
            srv._id;


          const phone =
            String(
              srv.phone || ''
            )
              .split('/')[0]
              .trim();


          const isPolice =
            String(
              srv.type || ''
            ).toLowerCase()
              .includes('police');


          return `

            <div
              class="p-5
                     rounded-2xl
                     bg-white
                     dark:bg-stone-900
                     border
                     border-stone-200
                     dark:border-stone-800
                     shadow-sm
                     flex
                     flex-col
                     sm:flex-row
                     sm:items-center
                     justify-between
                     gap-4">


              <div
                class="flex
                       items-start
                       gap-3.5">


                <div
                  class="w-10
                         h-10
                         rounded-xl
                         ${
                           isPolice
                             ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                             : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                         }
                         flex
                         items-center
                         justify-center
                         shrink-0">

                  <span
                    class="material-symbols-outlined
                           text-xl">

                    ${
                      isPolice
                        ? 'local_police'
                        : 'local_hospital'
                    }

                  </span>

                </div>


                <div>

                  <div
                    class="flex
                           items-center
                           gap-2
                           mb-0.5">

                    <span
                      class="text-[11px]
                             font-extrabold
                             uppercase
                             ${
                               isPolice
                                 ? 'text-blue-600'
                                 : 'text-red-600'
                             }">

                      ${srv.type} Center

                    </span>


                    <span
                      class="text-xs
                             text-stone-400">

                      •

                    </span>


                    <span
                      class="text-xs
                             font-semibold
                             text-stone-600
                             dark:text-stone-400">

                      ${srv.city},
                      ${srv.state}

                    </span>

                  </div>


                  <h4
                    class="font-heading
                           text-sm
                           font-bold
                           text-stone-900
                           dark:text-white">

                    ${srv.name}

                  </h4>


                  <p
                    class="text-xs
                           text-stone-500
                           mt-0.5">

                    ${srv.address}

                  </p>


                  ${
                    srv.available24x7
                      ? `
                        <span
                          class="inline-flex
                                 mt-2
                                 px-2
                                 py-0.5
                                 rounded-full
                                 bg-red-50
                                 dark:bg-red-950/30
                                 text-red-600
                                 dark:text-red-300
                                 text-[10px]
                                 font-bold">

                          24x7 Available

                        </span>
                      `
                      : ''
                  }

                </div>

              </div>


              <div
                class="flex
                       items-center
                       gap-2
                       shrink-0
                       flex-wrap">


                <button
                  type="button"
                  onclick="RaahiEmergency.openEmergencyModal('${emergencyId}')"
                  class="py-2
                         px-4
                         rounded-xl
                         bg-stone-900
                         dark:bg-stone-100
                         text-white
                         dark:text-stone-900
                         font-bold
                         text-xs
                         flex
                         items-center
                         gap-1.5
                         hover:bg-amber-600
                         transition-colors">

                  <span
                    class="material-symbols-outlined
                           text-sm">

                    info

                  </span>

                  Details

                </button>


                ${
                  phone
                    ? `
                      <a
                        href="tel:${phone}"
                        class="py-2
                               px-4
                               rounded-xl
                               bg-red-600
                               text-white
                               font-bold
                               text-xs
                               flex
                               items-center
                               gap-1.5
                               hover:bg-red-700
                               transition-colors">

                        <span
                          class="material-symbols-outlined
                                 text-sm">

                          call

                        </span>

                        Emergency Call

                      </a>
                    `
                    : ''
                }


                ${
                  Number.isFinite(
                    Number(srv.lat)
                  ) &&
                  Number.isFinite(
                    Number(srv.lng)
                  )
                    ? `
                      <a
                        href="https://maps.google.com/?q=${srv.lat},${srv.lng}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="p-2
                               rounded-xl
                               bg-stone-100
                               dark:bg-stone-800
                               text-stone-700
                               dark:text-stone-300
                               hover:bg-stone-200
                               transition-colors"
                        title="Locate on Map">

                        <span
                          class="material-symbols-outlined
                                 text-base">

                          directions

                        </span>

                      </a>
                    `
                    : ''
                }

              </div>

            </div>

          `;

        })
        .join('');

  },


  // =========================================================
  // OPEN EMERGENCY DETAIL MODAL
  // =========================================================

  async openEmergencyModal(emergencyId) {

    if (!emergencyId) {

      console.error(
        '[RaahiEmergency] Missing emergency ID'
      );

      return;

    }


    let service =
      (RAAHI_DATA.emergencyServices || [])
        .find(item =>
          String(
            item.id ||
            item.serviceId ||
            item._id
          ) === String(emergencyId)
        );


    /*
     * If the service isn't on the current page,
     * fetch it directly from backend.
     */

    if (!service) {

      try {

        const response =
          await RaahiAPI.get(
            `/api/emergency/${encodeURIComponent(emergencyId)}`
          );


        if (
          response &&
          response.success &&
          response.data
        ) {

          service =
            this.normalizeEmergency(
              response.data
            );

        }

      } catch (error) {

        console.error(
          '[RaahiEmergency] Failed to fetch emergency details:',
          error
        );

      }

    }


    if (!service) {

      RaahiApp.showToast(
        'Emergency service details not found.',
        'error'
      );

      return;

    }


    const modal =
      document.getElementById(
        'emergency-detail-modal'
      );

    const content =
      document.getElementById(
        'emergency-modal-content'
      );


    if (!modal || !content) {

      console.error(
        '[RaahiEmergency] Detail modal elements not found.'
      );

      RaahiApp.showToast(
        'Emergency detail modal is missing from the page.',
        'error'
      );

      return;

    }


    const emergencyIdFinal =
      service.id ||
      service.serviceId ||
      service._id;


    const phone =
      String(
        service.phone || ''
      )
        .split('/')[0]
        .trim();


    const facilities =
      Array.isArray(
        service.emergencyFacilities
      )
        ? service.emergencyFacilities
        : [];


    content.innerHTML = `

      <div
        class="bg-white
               dark:bg-stone-900">


        <!-- HEADER -->

        <div
          class="relative
                 p-6
                 sm:p-8
                 bg-red-600
                 text-white">


          <button
            type="button"
            onclick="RaahiEmergency.closeEmergencyModal()"
            class="absolute
                   top-4
                   right-4
                   w-9
                   h-9
                   rounded-full
                   bg-black/20
                   hover:bg-black/40
                   flex
                   items-center
                   justify-center">

            <span
              class="material-symbols-outlined">

              close

            </span>

          </button>


          <span
            class="inline-flex
                   px-3
                   py-1
                   rounded-full
                   bg-white/20
                   text-xs
                   font-bold
                   uppercase">

            ${service.type}

          </span>


          <h2
            class="font-heading
                   text-xl
                   sm:text-2xl
                   font-extrabold
                   mt-3
                   pr-10">

            ${service.name}

          </h2>


          <p
            class="text-xs
                   text-red-100
                   mt-2">

            ${service.city},
            ${service.state}

          </p>

        </div>


        <!-- DETAILS -->

        <div
          class="p-6
                 sm:p-8
                 space-y-6">


          <div>

            <h4
              class="text-[11px]
                     font-bold
                     uppercase
                     tracking-wider
                     text-stone-400
                     mb-2">

              Address

            </h4>


            <p
              class="text-sm
                     text-stone-700
                     dark:text-stone-300">

              ${service.address}

            </p>

          </div>


          ${
            facilities.length
              ? `
                <div>

                  <h4
                    class="text-[11px]
                           font-bold
                           uppercase
                           tracking-wider
                           text-stone-400
                           mb-2">

                    Emergency Facilities

                  </h4>


                  <div
                    class="flex
                           flex-wrap
                           gap-2">

                    ${facilities
                      .map(facility => `

                        <span
                          class="px-3
                                 py-1.5
                                 rounded-lg
                                 bg-red-50
                                 dark:bg-red-950/30
                                 text-red-700
                                 dark:text-red-300
                                 text-xs
                                 font-semibold">

                          ${facility}

                        </span>

                      `)
                      .join('')}

                  </div>

                </div>
              `
              : ''
          }


          <div
            class="grid
                   grid-cols-1
                   sm:grid-cols-2
                   gap-3">


            ${
              phone
                ? `
                  <a
                    href="tel:${phone}"
                    class="py-3
                           rounded-xl
                           bg-red-600
                           hover:bg-red-700
                           text-white
                           text-xs
                           font-bold
                           flex
                           items-center
                           justify-center
                           gap-2">

                    <span
                      class="material-symbols-outlined
                             text-sm">

                      call

                    </span>

                    Call ${phone}

                  </a>
                `
                : ''
            }


            ${
              service.website
                ? `
                  <a
                    href="${service.website}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="py-3
                           rounded-xl
                           bg-stone-100
                           dark:bg-stone-800
                           text-stone-800
                           dark:text-stone-200
                           text-xs
                           font-bold
                           flex
                           items-center
                           justify-center
                           gap-2">

                    <span
                      class="material-symbols-outlined
                             text-sm">

                      language

                    </span>

                    Website

                  </a>
                `
                : ''
            }

          </div>


          <!-- =================================================
               REVIEWS
          ================================================== -->

          <div
            class="border-t
                   border-stone-200
                   dark:border-stone-800
                   pt-6">


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
                  id="emergency-review-summary-${emergencyIdFinal}"
                  class="text-xs
                         text-stone-500
                         dark:text-stone-400
                         mt-1">

                  Loading reviews...

                </p>

              </div>


              <span
                class="material-symbols-outlined
                       text-red-600">

                rate_review

              </span>

            </div>


            <!-- REVIEW FORM -->

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


              <!-- STARS -->

              <div
                class="flex
                       items-center
                       gap-1
                       mb-3">


                ${[1, 2, 3, 4, 5]
                  .map(star => `

                    <button
                      type="button"
                      onclick="RaahiEmergency.setReviewRating('${emergencyIdFinal}', ${star})"
                      class="emergency-review-star-${emergencyIdFinal}
                             text-stone-300
                             hover:text-amber-500
                             transition-colors">

                      <span
                        class="material-symbols-outlined
                               text-2xl">

                        star

                      </span>

                    </button>

                  `)
                  .join('')}

              </div>


              <!-- COMMENT -->

              <textarea
                id="emergency-review-comment-${emergencyIdFinal}"
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
                       focus:ring-red-500
                       resize-none"></textarea>


              <!-- SUBMIT -->

              <button
                id="emergency-review-submit-${emergencyIdFinal}"
                type="button"
                onclick="RaahiEmergency.submitReview('${emergencyIdFinal}')"
                class="mt-3
                       w-full
                       py-2.5
                       rounded-xl
                       bg-red-600
                       hover:bg-red-700
                       text-white
                       text-xs
                       font-bold
                       transition-colors">

                Submit Review

              </button>

            </div>


            <!-- REVIEWS LIST -->

            <div
              id="emergency-reviews-list-${emergencyIdFinal}"
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


          <!-- CLOSE -->

          <div
            class="border-t
                   border-stone-200
                   dark:border-stone-800
                   pt-5
                   flex
                   justify-end">


            <button
              type="button"
              onclick="RaahiEmergency.closeEmergencyModal()"
              class="px-5
                     py-2
                     rounded-xl
                     bg-stone-900
                     dark:bg-stone-100
                     text-white
                     dark:text-stone-900
                     text-xs
                     font-bold
                     hover:bg-red-600
                     transition-colors">

              Close

            </button>

          </div>


        </div>

      </div>

    `;


    modal.classList.remove(
      'hidden'
    );

    document.body.style.overflow =
      'hidden';


    /*
     * Load reviews AFTER modal
     * HTML has been rendered.
     */

    await this.loadEmergencyReviews(
      emergencyIdFinal
    );

  },


  // =========================================================
  // CLOSE EMERGENCY MODAL
  // =========================================================

  closeEmergencyModal() {

    const modal =
      document.getElementById(
        'emergency-detail-modal'
      );

    if (modal) {

      modal.classList.add(
        'hidden'
      );

    }

    document.body.style.overflow =
      '';

  },


  // =========================================================
  // SET REVIEW RATING
  // =========================================================

  setReviewRating(
    emergencyId,
    rating
  ) {

    this.reviewRatings[
      emergencyId
    ] = rating;


    document
      .querySelectorAll(
        `.emergency-review-star-${emergencyId}`
      )
      .forEach(
        (star, index) => {

          star.classList.toggle(
            'text-amber-500',
            index < rating
          );

          star.classList.toggle(
            'text-stone-300',
            index >= rating
          );

        }
      );

  },


  // =========================================================
  // LOAD EMERGENCY REVIEWS
  // =========================================================

  async loadEmergencyReviews(
    emergencyId
  ) {

    const list =
      document.getElementById(
        `emergency-reviews-list-${emergencyId}`
      );

    const summary =
      document.getElementById(
        `emergency-review-summary-${emergencyId}`
      );


    if (!list) return;


    try {

      const response =
        await RaahiAPI.getReviews(
          'Emergency',
          emergencyId
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
        response.data.summary ||
        {};


      if (summary) {

        summary.textContent =
          `${reviewSummary.averageRating || 0} ★ · ${reviewSummary.totalReviews || 0} reviews`;

      }


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

              No reviews yet. Be the first!

            </p>

          </div>

        `;

        return;

      }


      list.innerHTML =
        reviews
          .map(review => {

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
                1,
                Math.min(
                  5,
                  Number(
                    review.rating
                  ) || 1
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

                  ${review.comment || ''}

                </p>

              </article>

            `;

          })
          .join('');


    } catch (error) {

      console.error(
        '[RaahiEmergency] Review loading failed:',
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
  // SUBMIT REVIEW
  // =========================================================

  async submitReview(
    emergencyId
  ) {

    /*
     * LOGIN CHECK
     */

    if (
      typeof RaahiAuth === 'undefined' ||
      !RaahiAuth.currentUser
    ) {

      RaahiAuth.openAuthModal(
        'signin'
      );

      return;

    }


    const rating =
      this.reviewRatings[
        emergencyId
      ] || 0;


    const commentEl =
      document.getElementById(
        `emergency-review-comment-${emergencyId}`
      );


    const submitBtn =
      document.getElementById(
        `emergency-review-submit-${emergencyId}`
      );


    const comment =
      commentEl?.value?.trim() ||
      '';


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

        submitBtn.disabled =
          true;

        submitBtn.textContent =
          'Submitting...';

      }


      /*
       * CREATE REVIEW
       */

      const response =
        await RaahiAPI.createReview(
          'Emergency',
          emergencyId,
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


      /*
       * REFRESH PUBLIC REVIEWS
       */

      await this.loadEmergencyReviews(
        emergencyId
      );


      /*
       * REFRESH USER REVIEWS
       */

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
          '[RaahiEmergency] My reviews refresh failed:',
          refreshError
        );

      }


      /*
       * REFRESH DASHBOARD
       */

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


      /*
       * CLEAR FORM
       */

      if (commentEl) {

        commentEl.value =
          '';

      }


      this.reviewRatings[
        emergencyId
      ] = 0;


      this
        .setReviewRating(
          emergencyId,
          0
        );


      RaahiApp.showToast(
        'Review submitted successfully!',
        'success'
      );


    } catch (error) {

      console.error(
        '[RaahiEmergency] Review submission failed:',
        error
      );


      RaahiApp.showToast(
        error.message ||
        'Unable to submit review.',
        'error'
      );


    } finally {

      if (submitBtn) {

        submitBtn.disabled =
          false;

        submitBtn.textContent =
          'Submit Review';

      }

    }

  },


  // =========================================================
  // LOCATE NEAR ME
  // =========================================================

  locateNearMe() {

    if (
      "geolocation" in navigator
    ) {

      RaahiApp.showToast(
        "Locating nearest verified police & trauma centers...",
        "info"
      );


      navigator.geolocation.getCurrentPosition(

        (pos) => {

          RaahiApp.showToast(
            `Found emergency facilities near lat: ${pos.coords.latitude.toFixed(2)}, lng: ${pos.coords.longitude.toFixed(2)}`,
            "success"
          );

        },

        () => {

          RaahiApp.showToast(
            "Location permission unavailable. Showing verified national hub numbers.",
            "info"
          );

        }

      );

    } else {

      RaahiApp.showToast(
        "National emergency number 112 is active across all mobile networks.",
        "info"
      );

    }

  }

};


// =========================================================
// GLOBAL EXPORT
// =========================================================

if (
  typeof window !== 'undefined'
) {

  window.RaahiEmergency =
    RaahiEmergency;

}