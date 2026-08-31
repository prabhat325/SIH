/**
 * RAAHI — Local Guides Directory Module
 * "Meet the People Who Know the Place"
 *
 * Includes:
 * - Guide listing
 * - Search
 * - Pagination
 * - Guide detail modal
 * - Traveler reviews
 * - Review submission
 * - My-review/dashboard refresh
 */

const RaahiGuides = {

  searchQuery: '',

  currentPage: 1,
  totalPages: 1,
  totalGuides: 0,
  guidesPerPage: 20,
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
  // NORMALIZE GUIDE
  // =========================================================

  normalizeGuide(g) {

    return {

      ...g,

      id:
        g.id ||
        g.guideId ||
        g._id,

      guideId:
        g.guideId ||
        g.id ||
        g._id,

      photo:
        g.photo ||
        g.image ||
        g.images?.[0] ||
        '',

      name:
        g.name ||
        'Local Guide',

      city:
        g.city ||
        '',

      state:
        g.state ||
        '',

      rating:
        g.rating ?? 0,

      reviewsCount:
        g.reviewsCount ?? 0,

      experience:
        g.experience ||
        'Experience not available',

      about:
        g.about ||
        g.description ||
        `Local guide in ${g.city || 'this destination'}.`,

      languages:
        Array.isArray(g.languages)
          ? g.languages
          : [],

      specialization:
        g.specialization ||
        'Local Tourism',

      contact:
        g.contact ||
        g.phone ||
        'Contact details not available'

    };

  },


  // =========================================================
  // LOAD GUIDE PAGE
  // =========================================================

  async loadPage(page = 1) {

    if (this.loadingPage) return;

    this.loadingPage = true;

    try {

      const response = await fetch(
        `/api/guides?page=${page}&limit=${this.guidesPerPage}`
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
          'Invalid guides API response'
        );
      }

      RAAHI_DATA.guides =
        result.data.map(
          g => this.normalizeGuide(g)
        );

      this.currentPage =
        result.page;

      this.totalPages =
        result.pages;

      this.totalGuides =
        result.total;

      console.log(
        `✅ Guides page ${this.currentPage}/${this.totalPages} loaded`
      );

      this.renderGuides();

      this.renderPagination();

    } catch (error) {

      console.error(
        '❌ Failed to load guides:',
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
        'guides-pagination'
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
          onclick="RaahiGuides.loadPage(${this.currentPage - 1})"
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
          onclick="RaahiGuides.loadPage(${this.currentPage + 1})"
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

    const searchInput =
      document.getElementById(
        'guides-search-input'
      );

    if (searchInput) {

      searchInput.addEventListener(
        'input',
        (e) => {

          this.searchQuery =
            e.target.value
              .toLowerCase()
              .trim();

          this.renderGuides();

        }
      );

    }

  },


  // =========================================================
  // FILTER GUIDES
  // =========================================================

  getFilteredGuides() {

    if (!RAAHI_DATA.guides) {
      return [];
    }

    return RAAHI_DATA.guides.filter(
      g => {

        if (this.searchQuery) {

          const name =
            String(g.name || '')
              .toLowerCase();

          const city =
            String(g.city || '')
              .toLowerCase();

          const specialization =
            String(g.specialization || '')
              .toLowerCase();

          const languages =
            Array.isArray(g.languages)
              ? g.languages
                  .map(l =>
                    String(l).toLowerCase()
                  )
              : [];

          const match =
            name.includes(this.searchQuery) ||
            city.includes(this.searchQuery) ||
            specialization.includes(this.searchQuery) ||
            languages.some(
              l =>
                l.includes(
                  this.searchQuery
                )
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
  // RENDER GUIDES
  // =========================================================

  renderGuides() {

    const container =
      document.getElementById(
        'guides-grid-container'
      );

    const homeContainer =
      document.getElementById(
        'home-guides-container'
      );

    if (
      !container &&
      !homeContainer
    ) {
      return;
    }

    const list =
      this.getFilteredGuides();


    const renderCard = (g) => {

      const guideId =
        g.guideId ||
        g.id ||
        g._id;

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
                 card-hover
                 p-6">


          <div
            class="flex
                   items-start
                   gap-4
                   mb-4">

            <img
              src="${g.photo}"
              alt="${g.name}"
              class="w-16
                     h-16
                     rounded-full
                     object-cover
                     border-2
                     border-amber-600
                     shadow-md">


            <div
              class="flex-1">

              <div
                class="flex
                       items-center
                       justify-between">

                <span
                  class="text-[11px]
                         font-bold
                         text-amber-600
                         uppercase
                         tracking-wider">

                  ${g.city},
                  ${g.state}

                </span>


                <span
                  class="flex
                         items-center
                         gap-1
                         text-amber-500
                         text-xs
                         font-bold">

                  <span
                    class="material-symbols-outlined
                           text-sm">

                    star

                  </span>

                  ${g.rating}
                  (${g.reviewsCount})

                </span>

              </div>


              <h3
                class="font-heading
                       text-base
                       font-bold
                       text-stone-900
                       dark:text-white
                       mt-0.5">

                ${g.name}

              </h3>


              <span
                class="text-xs
                       text-stone-500
                       font-medium">

                ${g.experience}

              </span>

            </div>

          </div>


          <p
            class="text-xs
                   text-stone-600
                   dark:text-stone-400
                   line-clamp-3
                   mb-4
                   leading-relaxed">

            ${g.about}

          </p>


          <div
            class="space-y-2
                   mb-5
                   border-t
                   border-stone-100
                   dark:border-stone-800
                   pt-3">


            <div>

              <span
                class="text-[10px]
                       font-bold
                       text-stone-400
                       uppercase
                       block
                       mb-1">

                Languages Spoken

              </span>


              <div
                class="flex
                       flex-wrap
                       gap-1">

                ${g.languages
                  .map(l => `

                    <span
                      class="text-[10px]
                             px-2
                             py-0.5
                             rounded-md
                             bg-stone-100
                             dark:bg-stone-800
                             text-stone-700
                             dark:text-stone-300
                             font-medium">

                      ${l}

                    </span>

                  `)
                  .join('')}

              </div>

            </div>


            <div>

              <span
                class="text-[10px]
                       font-bold
                       text-stone-400
                       uppercase
                       block
                       mb-1">

                Expertise

              </span>


              <span
                class="text-xs
                       text-amber-900
                       dark:text-amber-300
                       font-semibold">

                ${g.specialization}

              </span>

            </div>

          </div>


          <div
            class="mt-auto">

            <button
              onclick="RaahiGuides.openGuideModal('${guideId}')"
              class="w-full
                     py-2.5
                     px-4
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
                     gap-1.5">

              <span>
                View Verified Profile
              </span>

              <span
                class="material-symbols-outlined
                       text-sm">

                arrow_forward

              </span>

            </button>

          </div>

        </div>

      `;

    };


    if (container) {

      container.innerHTML =
        list
          .map(renderCard)
          .join('');

    }


    if (homeContainer) {

      homeContainer.innerHTML =
        list
          .slice(0, 3)
          .map(renderCard)
          .join('');

    }

  },


  // =========================================================
  // REVIEW RATING
  // =========================================================

  setReviewRating(
    guideId,
    rating
  ) {

    this.reviewRatings[guideId] =
      Number(rating);


    document
      .querySelectorAll(
        `.guide-review-star-${guideId}`
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
  // LOAD GUIDE REVIEWS
  // =========================================================

  async loadGuideReviews(
    guideId
  ) {

    const list =
      document.getElementById(
        `guide-reviews-list-${guideId}`
      );

    const summary =
      document.getElementById(
        `guide-review-summary-${guideId}`
      );

    if (!list) {
      return;
    }


    try {

      const response =
        await RaahiAPI.getReviews(
          'Guide',
          guideId
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

              No reviews yet.
              Be the first!

            </p>

          </div>

        `;

        return;

      }


      list.innerHTML =
        reviews
          .map(review => {

            const user =
              review.user ||
              {};


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
                    review.rating || 0
                  )
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

          })
          .join('');


    } catch (error) {

      console.error(
        '[RaahiGuides] Review loading failed:',
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
  // SUBMIT GUIDE REVIEW
  // =========================================================

  async submitReview(
    guideId
  ) {

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


    const rating =
      Number(
        this.reviewRatings[guideId] ||
        0
      );


    const commentEl =
      document.getElementById(
        `guide-review-comment-${guideId}`
      );


    const submitBtn =
      document.getElementById(
        `guide-review-submit-${guideId}`
      );


    const comment =
      commentEl?.value?.trim() ||
      '';


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


    try {

      if (submitBtn) {

        submitBtn.disabled = true;

        submitBtn.textContent =
          'Submitting...';

      }


      // -----------------------------------------------------
      // SAVE TO EXISTING REVIEW BACKEND
      // -----------------------------------------------------

      const response =
        await RaahiAPI.createReview(
          'Guide',
          guideId,
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
      // REFRESH GUIDE REVIEWS
      // -----------------------------------------------------

      await this.loadGuideReviews(
        guideId
      );


      // -----------------------------------------------------
      // REFRESH USER REVIEWS
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
          '[RaahiGuides] My reviews refresh failed:',
          refreshError
        );

      }


      // -----------------------------------------------------
      // REFRESH DASHBOARD
      // -----------------------------------------------------

      if (
        typeof RaahiDashboard !==
        'undefined'
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


      this.reviewRatings[guideId] =
        0;


      // Reset stars visually

      document
        .querySelectorAll(
          `.guide-review-star-${guideId}`
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


      RaahiApp.showToast(
        'Review submitted successfully!',
        'success'
      );


    } catch (error) {

      console.error(
        '[RaahiGuides] Review submission failed:',
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
  // OPEN GUIDE MODAL
  // =========================================================

  async openGuideModal(
    guideId
  ) {

    console.log(
      '[RaahiGuides] Opening guide:',
      guideId
    );


    let g =
      (RAAHI_DATA.guides || [])
        .find(
          item =>
            String(
              item.guideId || ''
            ) === String(guideId) ||

            String(
              item.id || ''
            ) === String(guideId) ||

            String(
              item._id || ''
            ) === String(guideId)
        );


    // -------------------------------------------------------
    // FALLBACK TO BACKEND
    // -------------------------------------------------------

    if (
      !g &&
      typeof RaahiAPI !==
      'undefined'
    ) {

      try {

        const response =
          await RaahiAPI.get(
            `/api/guides/${encodeURIComponent(guideId)}`
          );


        if (
          response?.success &&
          response?.data
        ) {

          g =
            this.normalizeGuide(
              response.data
            );

        }

      } catch (error) {

        console.error(
          '[RaahiGuides] Failed to fetch guide:',
          error
        );

      }

    }


    if (!g) {

      console.error(
        '[RaahiGuides] Guide not found:',
        guideId
      );

      return;

    }


    g =
      this.normalizeGuide(g);


    const realGuideId =
      g.guideId ||
      g.id ||
      g._id ||
      guideId;


    const modal =
      document.getElementById(
        'guide-detail-modal'
      );


    const content =
      document.getElementById(
        'guide-modal-content'
      );


    if (
      !modal ||
      !content
    ) {

      console.error(
        '[RaahiGuides] Guide modal elements missing'
      );

      return;

    }


    // -------------------------------------------------------
    // BUILD MODAL
    // -------------------------------------------------------

    content.innerHTML = `

      <div
        class="p-6
               sm:p-8
               space-y-6
               bg-white
               dark:bg-stone-900">


        <!-- ===============================================
             GUIDE HEADER
        ================================================ -->

        <div
          class="flex
                 items-center
                 justify-between
                 pb-4
                 border-b
                 border-stone-200
                 dark:border-stone-800">


          <div
            class="flex
                   items-center
                   gap-4">


            ${
              g.photo
                ? `
                  <img
                    src="${g.photo}"
                    alt="${g.name}"
                    class="w-20
                           h-20
                           rounded-full
                           object-cover
                           border-4
                           border-amber-600
                           shadow-md">
                `
                : `
                  <div
                    class="w-20
                           h-20
                           rounded-full
                           bg-amber-100
                           dark:bg-amber-950
                           flex
                           items-center
                           justify-center">

                    <span
                      class="material-symbols-outlined
                             text-3xl
                             text-amber-600">

                      person

                    </span>

                  </div>
                `
            }


            <div>

              <span
                class="px-2.5
                       py-0.5
                       rounded-full
                       text-[10px]
                       font-bold
                       bg-amber-100
                       text-amber-800
                       dark:bg-amber-950/60
                       dark:text-amber-300
                       border
                       border-amber-300
                       dark:border-amber-800">

                Certified Heritage Guide

              </span>


              <h3
                class="font-heading
                       text-xl
                       sm:text-2xl
                       font-bold
                       text-stone-900
                       dark:text-white
                       mt-1">

                ${g.name}

              </h3>


              <p
                class="text-xs
                       text-stone-500">

                ${g.city},
                ${g.state}
                •
                ${g.experience}

              </p>

            </div>

          </div>


          <button
            onclick="RaahiGuides.closeGuideModal()"
            class="w-8
                   h-8
                   rounded-full
                   bg-stone-100
                   dark:bg-stone-800
                   text-stone-700
                   dark:text-stone-300
                   flex
                   items-center
                   justify-center
                   hover:bg-stone-200">

            <span
              class="material-symbols-outlined
                     text-base">

              close

            </span>

          </button>

        </div>


        <!-- ===============================================
             ABOUT GUIDE
        ================================================ -->

        <div>

          <h4
            class="font-heading
                   text-sm
                   font-bold
                   text-stone-900
                   dark:text-white
                   uppercase
                   tracking-wider
                   mb-2">

            About the Guide

          </h4>


          <p
            class="text-xs
                   sm:text-sm
                   text-stone-600
                   dark:text-stone-300
                   leading-relaxed">

            ${g.about}

          </p>

        </div>


        <!-- ===============================================
             LANGUAGES + SPECIALIZATION
        ================================================ -->

        <div
          class="grid
                 grid-cols-1
                 sm:grid-cols-2
                 gap-4
                 bg-stone-50
                 dark:bg-stone-800/60
                 p-4
                 rounded-xl
                 border
                 border-stone-200
                 dark:border-stone-700">


          <div>

            <span
              class="text-[11px]
                     font-bold
                     text-stone-400
                     uppercase
                     block
                     mb-1">

              Languages Mastered

            </span>


            <div
              class="flex
                     flex-wrap
                     gap-1">

              ${
                g.languages.length
                  ? g.languages
                      .map(
                        l => `
                          <span
                            class="text-xs
                                   font-semibold
                                   text-stone-800
                                   dark:text-stone-200">

                            • ${l}

                          </span>
                        `
                      )
                      .join(' ')
                  : `
                      <span
                        class="text-xs
                               text-stone-500">

                        Not available

                      </span>
                    `
              }

            </div>

          </div>


          <div>

            <span
              class="text-[11px]
                     font-bold
                     text-stone-400
                     uppercase
                     block
                     mb-1">

              Specialization

            </span>


            <span
              class="text-xs
                     font-bold
                     text-amber-700
                     dark:text-amber-300">

              ${g.specialization}

            </span>

          </div>

        </div>


        <!-- ===============================================
             CONTACT
        ================================================ -->

        <div
          class="border-t
                 border-stone-200
                 dark:border-stone-800
                 pt-4">


          <span
            class="text-[11px]
                   font-bold
                   text-stone-400
                   uppercase
                   block
                   mb-1">

            Direct Contact Details

          </span>


          <span
            class="text-xs
                   font-bold
                   text-stone-900
                   dark:text-white">

            ${g.contact}

          </span>

        </div>


        <!-- =================================================
             GUIDE REVIEWS
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
                id="guide-review-summary-${realGuideId}"
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


          <!-- =============================================
               REVIEW FORM
          ============================================== -->

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
                      onclick="RaahiGuides.setReviewRating('${realGuideId}', ${star})"
                      class="guide-review-star-${realGuideId}
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
              id="guide-review-comment-${realGuideId}"
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
              id="guide-review-submit-${realGuideId}"
              type="button"
              onclick="RaahiGuides.submitReview('${realGuideId}')"
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


          <!-- =============================================
               REVIEW LIST
          ============================================== -->

          <div
            id="guide-reviews-list-${realGuideId}"
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


        <!-- ===============================================
             FOOTER
        ================================================ -->

        <div
          class="border-t
                 border-stone-200
                 dark:border-stone-800
                 pt-4
                 flex
                 justify-end">


          <button
            onclick="RaahiGuides.closeGuideModal()"
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


    // -------------------------------------------------------
    // RESET RATING FOR THIS GUIDE
    // -------------------------------------------------------

    this.reviewRatings[realGuideId] =
      0;


    // -------------------------------------------------------
    // LOAD REVIEWS AFTER MODAL EXISTS
    // -------------------------------------------------------

    await this.loadGuideReviews(
      realGuideId
    );

  },


  // =========================================================
  // CLOSE GUIDE MODAL
  // =========================================================

  closeGuideModal() {

    const modal =
      document.getElementById(
        'guide-detail-modal'
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


// =============================================================
// GLOBAL EXPORT
// =============================================================

if (
  typeof window !== 'undefined'
) {

  window.RaahiGuides =
    RaahiGuides;

}