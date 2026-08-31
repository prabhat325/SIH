/**
 * RAAHI — Cultural Events & Festivals Discovery Module
 * Strictly for Event Discovery & Information. NO TICKET BOOKING.
 */

const RaahiEvents = {
  searchQuery: '',

  currentPage: 1,
  totalPages: 1,
  totalEvents: 0,
  eventsPerPage: 20,
  loadingPage: false,

  // =========================================================
  // REVIEWS
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
  // NORMALIZE EVENT
  // =========================================================

  normalizeEvent(ev) {
    return {
      ...ev,

      id:
        ev.id ||
        ev.eventId ||
        ev._id,

      image:
        ev.image ||
        ev.images?.[0] ||
        '',

      category:
        ev.category ||
        'Event',

      description:
        ev.description ||
        `${ev.name} is an event in ${ev.city}, ${ev.state}.`,

      city:
        ev.city || '',

      state:
        ev.state || '',

      location:
        ev.location ||
        ev.address ||
        `${ev.city}, ${ev.state}`,

      date:
        ev.date ||
        'Date not available',

      time:
        ev.time ||
        'Time not available',

      organizer:
        ev.organizer ||
        'Organizer not available',

      highlights:
        Array.isArray(ev.highlights)
          ? ev.highlights
          : [],

      gallery:
        Array.isArray(ev.gallery)
          ? ev.gallery
          : []
    };
  },


  // =========================================================
  // LOAD EVENTS
  // =========================================================

  async loadPage(page = 1) {

    if (this.loadingPage) return;

    this.loadingPage = true;

    try {

      const response =
        await fetch(
          `/api/events?page=${page}&limit=${this.eventsPerPage}`
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
          'Invalid events API response'
        );
      }


      RAAHI_DATA.events =
        result.data.map(ev =>
          this.normalizeEvent(ev)
        );


      this.currentPage =
        result.page;

      this.totalPages =
        result.pages;

      this.totalEvents =
        result.total;


      console.log(
        `✅ Events page ${this.currentPage}/${this.totalPages} loaded`
      );


      this.renderEvents();

      this.renderPagination();


    } catch (error) {

      console.error(
        '❌ Failed to load events:',
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
        'events-pagination'
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
          onclick="RaahiEvents.loadPage(${this.currentPage - 1})"
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
          onclick="RaahiEvents.loadPage(${this.currentPage + 1})"
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
  // SEARCH
  // =========================================================

  bindEvents() {

    const searchInput =
      document.getElementById(
        'events-search-input'
      );


    if (searchInput) {

      searchInput.addEventListener(
        'input',
        (e) => {

          this.searchQuery =
            e.target.value
              .toLowerCase()
              .trim();


          this.renderEvents();

        }
      );

    }

  },


  getFilteredEvents() {

    if (!RAAHI_DATA.events) {
      return [];
    }


    return RAAHI_DATA.events.filter(
      ev => {

        if (this.searchQuery) {

          const match =

            ev.name
              .toLowerCase()
              .includes(
                this.searchQuery
              ) ||

            ev.city
              .toLowerCase()
              .includes(
                this.searchQuery
              ) ||

            ev.category
              .toLowerCase()
              .includes(
                this.searchQuery
              ) ||

            ev.description
              .toLowerCase()
              .includes(
                this.searchQuery
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
  // RENDER EVENT CARDS
  // =========================================================

  renderEvents() {

    const container =
      document.getElementById(
        'events-grid-container'
      );


    const homeContainer =
      document.getElementById(
        'home-events-container'
      );


    if (
      !container &&
      !homeContainer
    ) {
      return;
    }


    const list =
      this.getFilteredEvents();


    const renderCard =
      (ev) => `

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


        <div
          class="relative
                 h-56
                 w-full
                 overflow-hidden
                 bg-stone-100
                 dark:bg-stone-800">


          <img
            src="${ev.image}"
            alt="${ev.name}"
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
                     bg-amber-600
                     text-white">

              ${ev.category}

            </span>


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

              ${ev.city}

            </span>

          </div>


          <div
            class="absolute
                   bottom-3.5
                   left-3.5
                   right-3.5
                   text-white
                   z-10">


            <span
              class="text-xs
                     text-amber-300
                     font-bold
                     flex
                     items-center
                     gap-1">


              <span
                class="material-symbols-outlined
                       text-sm">

                calendar_month

              </span>


              ${ev.date}

            </span>

          </div>

        </div>


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

              ${ev.name}

            </h3>


            <p
              class="text-xs
                     text-stone-600
                     dark:text-stone-400
                     line-clamp-2
                     mb-4
                     leading-relaxed">

              ${ev.description}

            </p>


            <div
              class="mb-4">


              <span
                class="text-[10px]
                       font-bold
                       uppercase
                       text-stone-400
                       tracking-wider
                       block
                       mb-1">

                Key Highlights

              </span>


              <div
                class="flex
                       flex-wrap
                       gap-1">


                ${ev.highlights
                  .slice(0, 2)
                  .map(
                    h => `

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

                    • ${h}

                  </span>

                `
                  )
                  .join('')}

              </div>

            </div>

          </div>


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
                       mr-0.5">

                location_on

              </span>


              ${ev.location}

            </div>


            <div
              class="grid
                     grid-cols-2
                     gap-2">


              <button
                onclick="RaahiEvents.openEventModal('${ev.id}')"
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
                  View Event
                </span>


                <span
                  class="material-symbols-outlined
                         text-sm">

                  arrow_forward

                </span>

              </button>


              <button
                onclick="RaahiCommunity.openSuggestModal('${ev.id}', 'event', '${ev.name}')"
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
  // OPEN EVENT MODAL
  // =========================================================

  openEventModal(eventId) {

    const ev =
      RAAHI_DATA.events.find(
        e => e.id === eventId
      );


    if (!ev) {
      console.warn(
        '[RaahiEvents] Event not found:',
        eventId
      );
      return;
    }


    const modal =
      document.getElementById(
        'event-detail-modal'
      );


    const content =
      document.getElementById(
        'event-modal-content'
      );


    if (!modal || !content) {

      console.error(
        '[RaahiEvents] Event modal elements missing'
      );

      return;

    }


    content.innerHTML = `

      <!-- =================================================
           EVENT HERO
      ================================================== -->

      <div
        class="relative
               h-72
               w-full
               overflow-hidden
               bg-stone-900">


        <img
          src="${ev.image}"
          alt="${ev.name}"
          class="w-full
                 h-full
                 object-cover">


        <div
          class="absolute
                 inset-0
                 bg-gradient-to-t
                 from-black/90
                 via-black/30
                 to-transparent">
        </div>


        <button
          onclick="RaahiEvents.closeEventModal()"
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
                   mb-2">


            <span
              class="px-3
                     py-1
                     rounded-full
                     text-xs
                     font-extrabold
                     bg-amber-600
                     text-white">

              ${ev.category}

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

              ${ev.city},
              ${ev.state}

            </span>

          </div>


          <h2
            class="font-heading
                   text-2xl
                   sm:text-3xl
                   font-extrabold
                   text-white">

            ${ev.name}

          </h2>

        </div>

      </div>


      <!-- =================================================
           EVENT CONTENT
      ================================================== -->

      <div
        class="p-6
               sm:p-8
               space-y-6
               bg-white
               dark:bg-stone-900">


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

            event

          </span>


          <span>

            Raahi is a festival discovery platform.
            Public festival access schedules are verified
            with local tourism boards.

          </span>

        </div>


        <!-- EVENT OVERVIEW -->

        <div>

          <h4
            class="font-heading
                   text-base
                   font-bold
                   text-stone-900
                   dark:text-white
                   mb-2">

            Event Schedule & Overview

          </h4>


          <p
            class="text-xs
                   sm:text-sm
                   text-stone-600
                   dark:text-stone-300
                   leading-relaxed">

            ${ev.description}

          </p>

        </div>


        <!-- HIGHLIGHTS -->

        <div>

          <h4
            class="font-heading
                   text-base
                   font-bold
                   text-stone-900
                   dark:text-white
                   mb-2">

            Program Highlights

          </h4>


          <div
            class="grid
                   grid-cols-1
                   sm:grid-cols-2
                   gap-2">


            ${ev.highlights
              .map(
                h => `

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
                         text-amber-600">

                  star

                </span>


                <span>

                  ${h}

                </span>

              </div>

            `
              )
              .join('')}

          </div>

        </div>


        <!-- GALLERY -->

        ${
          ev.gallery &&
          ev.gallery.length
            ? `

          <div>

            <h4
              class="font-heading
                     text-base
                     font-bold
                     text-stone-900
                     dark:text-white
                     mb-2">

              Festival Photo Gallery

            </h4>


            <div
              class="grid
                     grid-cols-2
                     sm:grid-cols-4
                     gap-2">


              ${ev.gallery
                .map(
                  (img, idx) => `

                <div
                  class="h-24
                         rounded-xl
                         overflow-hidden
                         bg-stone-100
                         dark:bg-stone-800
                         border
                         border-stone-200
                         dark:border-stone-700
                         shadow-sm">


                  <img
                    src="${img}"
                    alt="${ev.name} ${idx + 1}"
                    class="w-full
                           h-full
                           object-cover
                           hover:scale-110
                           transition-transform
                           duration-300">

                </div>

              `
                )
                .join('')}

            </div>

          </div>

        `
            : ''
        }


        <!-- EVENT META -->

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

              Dates & Timings

            </span>


            <span
              class="text-xs
                     font-bold
                     text-stone-900
                     dark:text-white">

              ${ev.date}
              (${ev.time})

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

              Organizing Body

            </span>


            <span
              class="text-xs
                     text-stone-700
                     dark:text-stone-300">

              ${ev.organizer}

            </span>

          </div>

        </div>


        <!-- =================================================
             EVENT REVIEWS
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
                id="event-review-summary-${ev.id}"
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
                  onclick="RaahiEvents.setReviewRating('${ev.id}', ${star})"
                  class="event-review-star-${ev.id}
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
              id="event-review-comment-${ev.id}"
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
              id="event-review-submit-${ev.id}"
              type="button"
              onclick="RaahiEvents.submitReview('${ev.id}')"
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


          <!-- REVIEWS LIST -->

          <div
            id="event-reviews-list-${ev.id}"
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
                 justify-between">


          <button
            onclick="RaahiEvents.closeEventModal(); RaahiCommunity.openSuggestModal('${ev.id}', 'event', '${ev.name}')"
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
            onclick="RaahiEvents.closeEventModal()"
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


    modal.classList.remove('hidden');

    document.body.style.overflow =
      'hidden';


    // -------------------------------------------------------
    // LOAD EVENT REVIEWS
    // -------------------------------------------------------

    this.loadEventReviews(
      ev.id
    );

  },


  // =========================================================
  // LOAD EVENT REVIEWS
  // =========================================================

  async loadEventReviews(eventId) {

    const list =
      document.getElementById(
        `event-reviews-list-${eventId}`
      );


    const summary =
      document.getElementById(
        `event-review-summary-${eventId}`
      );


    if (!list) return;


    try {

      const response =
        await RaahiAPI.getReviews(
          'Event',
          eventId
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
              Math.min(
                5,
                Math.max(
                  0,
                  Number(review.rating) || 0
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
        '[RaahiEvents] Review loading failed:',
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
  // SET REVIEW RATING
  // =========================================================

  setReviewRating(
    eventId,
    rating
  ) {

    this.reviewRatings[eventId] =
      rating;


    document
      .querySelectorAll(
        `.event-review-star-${eventId}`
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
  // SUBMIT REVIEW
  // =========================================================

  async submitReview(eventId) {

    // -------------------------------------------------------
    // LOGIN CHECK
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
      this.reviewRatings[eventId] ||
      0;


    const commentEl =
      document.getElementById(
        `event-review-comment-${eventId}`
      );


    const submitBtn =
      document.getElementById(
        `event-review-submit-${eventId}`
      );


    const comment =
      commentEl?.value?.trim() ||
      '';


    // -------------------------------------------------------
    // VALIDATE RATING
    // -------------------------------------------------------

    if (!rating) {

      RaahiApp.showToast(
        'Please select a rating.',
        'error'
      );

      return;

    }


    // -------------------------------------------------------
    // VALIDATE COMMENT
    // -------------------------------------------------------

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


      // -----------------------------------------------------
      // CREATE REVIEW
      // -----------------------------------------------------

      const response =
        await RaahiAPI.createReview(
          'Event',
          eventId,
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
      // REFRESH EVENT REVIEWS
      // -----------------------------------------------------

      await this.loadEventReviews(
        eventId
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
          '[RaahiEvents] My reviews refresh failed:',
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


      this.reviewRatings[eventId] =
        0;


      // Reset stars

      document
        .querySelectorAll(
          `.event-review-star-${eventId}`
        )
        .forEach(star => {

          star.classList.remove(
            'text-amber-500'
          );

          star.classList.add(
            'text-stone-300'
          );

        });


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      RaahiApp.showToast(
        'Review submitted successfully!',
        'success'
      );


    } catch (error) {

      console.error(
        '[RaahiEvents] Review submission failed:',
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
  // CLOSE EVENT MODAL
  // =========================================================

  closeEventModal() {

    const modal =
      document.getElementById(
        'event-detail-modal'
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

  window.RaahiEvents =
    RaahiEvents;

}