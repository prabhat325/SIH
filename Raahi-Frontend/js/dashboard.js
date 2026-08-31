/**
 * RAAHI — User Dashboard & AI Personalization Module
 * User profile, personalized feed, saved places, reviews,
 * and backend-connected change requests.
 */

const RaahiDashboard = {

  activeTab: 'personalized',

  changeRequests: [],

  // =========================================================
  // INIT
  // =========================================================

  init() {
    this.bindEvents();
    this.renderAll();
  },


  // =========================================================
  // EVENTS
  // =========================================================

  bindEvents() {

    document.querySelectorAll('.dash-tab-btn').forEach(btn => {

      btn.addEventListener('click', () => {

        const tab =
          btn.getAttribute('data-tab') ||
          'personalized';

        this.switchTab(tab);

      });

    });


    // Contribution filters
    document.querySelectorAll('.dash-request-filter')
      .forEach(button => {

        button.addEventListener('click', () => {

          const status =
            button.dataset.requestFilter || 'All';

          this.filterContributions(status);

        });

      });

  },


  // =========================================================
  // TAB SWITCHING
  // =========================================================

  switchTab(tabId) {

    this.activeTab =
      tabId || 'personalized';


    document
      .querySelectorAll('.dash-tab-btn')
      .forEach(button => {

        const active =
          button.getAttribute('data-tab') ===
          this.activeTab;

        button.classList.toggle(
          'bg-amber-600',
          active
        );

        button.classList.toggle(
          'text-white',
          active
        );

        button.classList.toggle(
          'bg-stone-100',
          !active
        );

        button.classList.toggle(
          'dark:bg-stone-800',
          !active
        );

        button.classList.toggle(
          'text-stone-700',
          !active
        );

        button.classList.toggle(
          'dark:text-stone-300',
          !active
        );

      });


    document
      .querySelectorAll('.dash-tab-pane')
      .forEach(pane => {

        pane.classList.add('hidden');

      });


    const pane =
      document.getElementById(
        `dash-pane-${this.activeTab}`
      );

    if (pane) {
      pane.classList.remove('hidden');
    }

  },


  // =========================================================
  // RENDER EVERYTHING
  // =========================================================

  renderAll() {

    this.renderProfileHeader();

    this.renderPersonalizedFeed();

    this.renderSavedCollection();

    this.renderReviews();

    this.renderContributions();

  },


  // =========================================================
  // PROFILE HEADER
  // =========================================================

  renderProfileHeader() {

    const user =
      RaahiAuth.currentUser || {

        name: 'Guest Explorer',

        email:
          'Not signed in — Click to Sign In',

        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',

        bio:
          'Exploring Raahi in guest mode.'

      };


    const nameEl =
      document.getElementById(
        'dash-user-name'
      );

    const emailEl =
      document.getElementById(
        'dash-user-email'
      );

    const avatarEl =
      document.getElementById(
        'dash-user-avatar'
      );

    const bioEl =
      document.getElementById(
        'dash-user-bio'
      );


    const displayName =
      user.fullName ||
      user.name ||
      user.username ||
      'Traveler';


    if (nameEl) {
      nameEl.textContent =
        displayName;
    }


    if (emailEl) {
      emailEl.textContent =
        user.email ||
        'Traveler';
    }


    if (avatarEl) {

      avatarEl.src =
        user.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

    }


    if (bioEl) {

      bioEl.textContent =
        user.bio ||
        'Heritage traveler & explorer.';

    }


    // ---------------------------------------------------------
    // Dashboard statistics
    // ---------------------------------------------------------

    const savedCount =
      Array.isArray(RaahiAuth.savedItems)
        ? RaahiAuth.savedItems.length
        : 0;


    const reviewCount =
      Array.isArray(RaahiAuth.myReviews)
        ? RaahiAuth.myReviews.length
        : 0;


    const contributionCount =
      this.changeRequests.length;


    const savedEl =
      document.getElementById(
        'dash-stat-saved'
      );

    const reviewEl =
      document.getElementById(
        'dash-stat-reviews'
      );

    const contributionEl =
      document.getElementById(
        'dash-stat-contribs'
      );


    if (savedEl) {
      savedEl.textContent =
        savedCount;
    }


    if (reviewEl) {
      reviewEl.textContent =
        reviewCount;
    }


    if (contributionEl) {
      contributionEl.textContent =
        contributionCount;
    }

  },


  // =========================================================
  // PERSONALIZED FEED
  // =========================================================

  renderPersonalizedFeed() {

    const container =
      document.getElementById(
        'dash-personalized-grid'
      );

    if (
      !container ||
      !RAAHI_DATA.places
    ) {
      return;
    }


    const recommendations =
      RAAHI_DATA.places
        .filter(place =>
          place.aiPick ||
          place.category === 'Heritage' ||
          place.category === 'Forts'
        )
        .slice(0, 6);


    if (!recommendations.length) {

      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-stone-500">
          <span class="material-symbols-outlined text-4xl block mb-2">
            explore
          </span>

          <p class="text-xs font-semibold">
            Personalized recommendations are being prepared.
          </p>
        </div>
      `;

      return;
    }


    container.innerHTML =
      recommendations.map(item => `

        <article
          class="
            bg-white dark:bg-stone-900
            border border-stone-200 dark:border-stone-800
            rounded-2xl
            overflow-hidden
            shadow-sm
            flex flex-col justify-between
            p-4
            group
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-xl
            hover:border-amber-500
          ">

          <div class="flex items-start gap-3">

            <img
              src="${item.image || ''}"
              alt="${item.name || 'Place'}"
              class="
                w-20 h-20
                rounded-xl
                object-cover
                shrink-0
                transition-transform duration-500
                group-hover:scale-105
              ">

            <div class="space-y-1 min-w-0">

              <div class="flex items-center gap-1.5">

                <span
                  class="
                    text-[10px]
                    font-extrabold
                    text-amber-600
                    uppercase
                    tracking-wider
                  ">
                  ${item.city || ''}
                </span>

                <span
                  class="
                    text-[9px]
                    px-1.5 py-0.5
                    rounded
                    bg-amber-100
                    dark:bg-amber-950
                    text-amber-800
                    dark:text-amber-300
                    font-bold
                  ">
                  98% Match
                </span>

              </div>


              <h4
                class="
                  font-heading
                  text-sm
                  font-bold
                  text-stone-900
                  dark:text-white
                  line-clamp-1
                  group-hover:text-amber-600
                  transition-colors
                ">
                ${item.name || 'Untitled Place'}
              </h4>


              <p
                class="
                  text-[11px]
                  text-stone-500
                  line-clamp-2
                  italic
                ">
                ${item.aiReason || item.description || ''}
              </p>

            </div>

          </div>


          <div
            class="
              mt-3 pt-3
              border-t
              border-stone-100
              dark:border-stone-800
              flex items-center justify-between
            ">

            <span
              class="
                text-xs
                text-amber-500
                font-bold
              ">
              ★ ${item.rating || '—'}
            </span>


            <button
              onclick="RaahiPlaces.openDetailModal('${item.id}')"
              class="
                text-xs
                font-bold
                text-amber-600
                hover:text-amber-500
                flex items-center gap-1
              ">

              Explore

              <span
                class="
                  material-symbols-outlined
                  text-xs
                  transition-transform
                  group-hover:translate-x-1
                ">
                arrow_forward
              </span>

            </button>

          </div>

        </article>

      `).join('');

  },


  // =========================================================
  // SAVED COLLECTION
  // =========================================================

  renderSavedCollection() {

    const container =
      document.getElementById(
        'dash-saved-grid'
      );

    if (!container) {
      return;
    }


    const savedIds =
      Array.isArray(RaahiAuth.savedItems)
        ? RaahiAuth.savedItems
        : [];


    if (!savedIds.length) {

      container.innerHTML = `

        <div
          class="
            col-span-full
            py-12
            text-center
            text-stone-500
          ">

          <span
            class="
              material-symbols-outlined
              text-4xl
              mb-2
              block
              text-stone-300
            ">
            bookmark_border
          </span>

          <p class="text-xs font-semibold">
            Your Journey Collection is currently empty.
          </p>


          <button
            onclick="RaahiApp.navigate('places')"
            class="
              mt-3
              px-4 py-2
              bg-amber-600
              text-white
              rounded-xl
              text-xs
              font-bold
              hover:bg-amber-700
              transition-all
              hover:-translate-y-0.5
              hover:shadow-lg
            ">
            Explore Places
          </button>

        </div>

      `;

      return;
    }


    const places =
  (RAAHI_DATA.places || [])
    .filter(item =>
      savedIds.includes(item.id)
    );

const hotels =
  (RAAHI_DATA.hotels || [])
    .filter(item =>
      savedIds.includes(item.id)
    );

const restaurants =
  (RAAHI_DATA.restaurants || [])
    .filter(item =>
      savedIds.includes(item.id)
    );

const allSaved = [
  ...places.map(item => ({
    ...item,
    resourceType: 'Place'
  })),

  ...hotels.map(item => ({
    ...item,
    resourceType: 'Hotel'
  })),

  ...restaurants.map(item => ({
    ...item,
    resourceType: 'Restaurant'
  }))
];

// If backend saved IDs exist but the catalog data
// has not loaded yet, do not show a false empty state.
// Wait for the catalog scripts and render again.
if (
  savedIds.length > 0 &&
  allSaved.length === 0
) {
  container.innerHTML = `
    <div class="col-span-full py-12 text-center text-stone-500">
      <span class="material-symbols-outlined text-4xl block mb-2 animate-spin">
        progress_activity
      </span>
      <p class="text-xs font-semibold">
        Loading your saved places...
      </p>
    </div>
  `;

  setTimeout(() => {
    if (
      typeof RaahiDashboard !== 'undefined' &&
      typeof RaahiDashboard.renderSavedCollection === 'function'
    ) {
      RaahiDashboard.renderSavedCollection();
    }
  }, 500);

  return;
}


    container.innerHTML =
      allSaved.map(item => `

       <article
  class="
    group
    relative
    overflow-hidden
    rounded-3xl
    bg-white
    dark:bg-stone-900
    border
    border-stone-200
    dark:border-stone-800
    shadow-sm
    transition-all
    duration-500
    hover:-translate-y-2
    hover:border-amber-400
    hover:shadow-[0_0_35px_rgba(245,158,11,0.18)]
  ">

  <!-- Glow -->
  <div
    class="
      absolute
      -top-24
      -right-24
      w-56
      h-56
      rounded-full
      bg-amber-400/10
      blur-3xl
      opacity-0
      group-hover:opacity-100
      transition-opacity
      duration-500
      pointer-events-none
    ">
  </div>


  <!-- Image -->

  <div class="relative h-48 overflow-hidden">

    <img
      src="${item.image || ''}"
      alt="${item.name || 'Saved item'}"
      class="
        w-full
        h-full
        object-cover
        transition-transform
        duration-700
        group-hover:scale-110
      ">

    <div
      class="
        absolute
        inset-0
        bg-gradient-to-t
        from-black/70
        via-black/10
        to-transparent
      ">
    </div>


    <!-- Saved badge -->

    <div
      class="
        absolute
        top-3
        right-3
        w-9
        h-9
        rounded-full
        bg-black/40
        backdrop-blur-md
        border
        border-white/20
        flex
        items-center
        justify-center
        text-amber-300
        shadow-lg
      ">

      <span class="material-symbols-outlined text-lg">
        bookmark
      </span>

    </div>


    <!-- Location -->

    <div
      class="
        absolute
        bottom-3
        left-4
        right-4
        text-white
      ">

      <p class="
        text-[9px]
        font-extrabold
        uppercase
        tracking-[0.18em]
        text-amber-300
      ">
        ${item.city || item.state || 'India'}
      </p>

      <h4
        class="
          mt-1
          font-heading
          text-lg
          font-extrabold
          leading-tight
          line-clamp-2
        ">
        ${item.name || 'Saved Item'}
      </h4>

    </div>

  </div>


  <!-- Content -->

  <div class="relative p-5">

    <div class="flex items-center justify-between gap-3">

      <div>

        <p class="
          text-[9px]
          uppercase
          tracking-wider
          font-extrabold
          text-stone-400
        ">
          Rating
        </p>

        <p class="
          mt-1
          text-sm
          font-extrabold
          text-amber-500
        ">
          ★ ${item.rating || '—'}
        </p>

      </div>


      <div
        class="
          px-2.5
          py-1
          rounded-lg
          bg-stone-100
          dark:bg-stone-800
          text-[9px]
          font-extrabold
          uppercase
          text-stone-500
          dark:text-stone-400
        ">

        Saved

      </div>

    </div>


    <!-- Actions -->

    <div
      class="
        flex
        items-center
        justify-between
        gap-3
        mt-5
        pt-4
        border-t
        border-stone-100
        dark:border-stone-800
      ">

      <button
        onclick="RaahiAuth.toggleSave('${item.id}')"
        class="
          flex
          items-center
          gap-1.5
          text-xs
          font-bold
          text-red-500
          hover:text-red-600
          transition-all
          hover:-translate-y-0.5
        ">

        <span class="material-symbols-outlined text-sm">
          bookmark_remove
        </span>

        Remove

      </button>

<button
onclick="${
  item.resourceType === 'Place'
    ? `RaahiPlaces.openDetailModal('${item.id}')`
    : item.resourceType === 'Hotel'
      ? `RaahiHotels.openHotelModal('${item.id}')`
      : item.resourceType === 'Restaurant'
        ? `RaahiRestaurants.openRestModal('${item.id}')`
        : `RaahiApp.navigate('explore')`
}"
        class="
          group/btn
          inline-flex
          items-center
          gap-1.5
          px-3.5
          py-2
          rounded-xl
          bg-stone-900
          dark:bg-stone-100
          text-white
          dark:text-stone-900
          text-[10px]
          font-extrabold
          transition-all
          duration-300
          hover:bg-amber-500
          hover:text-white
          hover:-translate-y-0.5
          hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]
        ">

        Explore

        <span
          class="
            material-symbols-outlined
            text-sm
            transition-transform
            group-hover/btn:translate-x-1
          ">
          arrow_forward
        </span>

      </button>

    </div>

  </div>

</article>

      `).join('');

  },


  // =========================================================
  // REVIEWS
  // =========================================================

  renderReviews() {

  const container =
    document.getElementById('dash-reviews-list');

  if (!container) return;

  const reviews =
    Array.isArray(RaahiAuth.myReviews)
      ? RaahiAuth.myReviews
      : [];


  // ---------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------

  if (!reviews.length) {

    container.innerHTML = `
      <div class="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-dashed
        border-stone-300
        dark:border-stone-700
        bg-white
        dark:bg-stone-900
        p-12
        text-center
      ">

        <div class="
          mx-auto
          w-16
          h-16
          rounded-2xl
          bg-amber-50
          dark:bg-amber-950/30
          flex
          items-center
          justify-center
        ">
          <span class="
            material-symbols-outlined
            text-3xl
            text-amber-500
          ">
            rate_review
          </span>
        </div>

        <h3 class="
          mt-5
          font-heading
          text-xl
          font-extrabold
          text-stone-900
          dark:text-white
        ">
          Your Review Journey Starts Here
        </h3>

        <p class="
          mt-2
          text-xs
          text-stone-500
          dark:text-stone-400
        ">
          Share your experience and help fellow travellers.
        </p>

      </div>
    `;

    return;
  }


  // ---------------------------------------------------------
  // REVIEW CARDS
  // ---------------------------------------------------------

  container.innerHTML = reviews.map(review => {

    const rating =
      Math.max(
        0,
        Math.min(
          5,
          Number(review.rating) || 0
        )
      );

    const stars =
      '★'.repeat(rating) +
      '☆'.repeat(5 - rating);

   const dateValue =
  review.createdAt ||
  review.date ||
  review.updatedAt ||
  null;

const date =
  dateValue
    ? new Date(dateValue).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      )
    : '—';


    return `
      <article
        class="
          group
          relative
          overflow-hidden
          rounded-3xl
          bg-white
          dark:bg-stone-900
          border
          border-stone-200
          dark:border-stone-800
          p-6
          transition-all
          duration-500
          hover:-translate-y-1.5
          hover:border-amber-400
          hover:shadow-[0_0_35px_rgba(245,158,11,0.15)]
        ">

        <!-- Ambient glow -->

        <div class="
          absolute
          -top-24
          -right-24
          w-56
          h-56
          rounded-full
          bg-amber-400/10
          blur-3xl
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-500
          pointer-events-none
        "></div>


        <!-- Header -->

        <div class="
          relative
          flex
          items-start
          justify-between
          gap-4
        ">

          <div class="min-w-0">

            <p class="
              text-[9px]
              uppercase
              tracking-[0.18em]
              font-extrabold
              text-amber-600
            ">
              Traveler Review
            </p>

            <h3 class="
              mt-1
              font-heading
              text-lg
              font-extrabold
              text-stone-900
              dark:text-white
              group-hover:text-amber-500
              transition-colors
              line-clamp-2
            ">
             ${
  review.resourceName ||
  (RAAHI_DATA.places || []).find(
    place => place.id === review.resourceId
  )?.name ||
  review.resourceId ||
  'Travel Experience'
}
            </h3>

          </div>


          <!-- Rating -->

          <div class="
            shrink-0
            px-3
            py-2
            rounded-xl
            bg-amber-50
            dark:bg-amber-950/30
            border
            border-amber-200
            dark:border-amber-900/40
          ">

            <div class="
              text-amber-500
              text-sm
              tracking-tight
              whitespace-nowrap
            ">
              ${stars}
            </div>

            <p class="
              text-[9px]
              text-center
              font-extrabold
              text-amber-700
              dark:text-amber-400
              mt-0.5
            ">
              ${rating}/5
            </p>

          </div>

        </div>


        <!-- Review text -->

        <div class="
          relative
          mt-6
          p-5
          rounded-2xl
          bg-stone-50
          dark:bg-stone-800/60
          border
          border-stone-100
          dark:border-stone-800
        ">

          <span class="
            material-symbols-outlined
            text-2xl
            text-amber-400/50
          ">
            format_quote
          </span>

          <p class="
            text-sm
            leading-relaxed
            text-stone-700
            dark:text-stone-300
            italic
            mt-1
          ">
            ${review.comment || 'No review text provided.'}
          </p>

        </div>


        <!-- Footer -->

        <div class="
          relative
          flex
          items-center
          justify-between
          gap-3
          mt-5
          pt-4
          border-t
          border-stone-100
          dark:border-stone-800
        ">

          <div class="
            flex
            items-center
            gap-2
            text-[10px]
            font-semibold
            text-stone-400
          ">

            <span class="material-symbols-outlined text-sm">
              calendar_month
            </span>

            ${date}

          </div>


          <span class="
            inline-flex
            items-center
            gap-1
            px-2.5
            py-1
            rounded-lg
            bg-stone-100
            dark:bg-stone-800
            text-[9px]
            font-extrabold
            uppercase
            text-stone-500
            dark:text-stone-400
          ">
            Verified Experience
          </span>

        </div>

      </article>
    `;

  }).join('');

},


  // =========================================================
  // CHANGE REQUESTS
  // =========================================================

 async renderContributions() {

  const container =
    document.getElementById('dash-contributions-table-body');

  if (!container) return;


  // ---------------------------------------------------------
  // LOAD USER'S REAL CHANGE REQUESTS FROM BACKEND
  // ---------------------------------------------------------

  container.innerHTML = `
    <div class="lg:col-span-2 p-10 text-center">
      <span class="material-symbols-outlined animate-spin text-3xl text-amber-500">
        progress_activity
      </span>

      <p class="text-sm text-stone-500 mt-3">
        Loading your change requests...
      </p>
    </div>
  `;


  try {

    const response =
      await RaahiAPI.getMyChangeRequests();


    if (!response || !response.success) {
      throw new Error(
        response?.message ||
        'Unable to load change requests'
      );
    }


    const requests =
      Array.isArray(response.data)
        ? response.data
        : [];


   this.changeRequests = requests;

   const contributionStat =
  document.getElementById('dash-stat-contribs');

if (contributionStat) {
  contributionStat.textContent =
    requests.length;
}


    // -------------------------------------------------------
    // COUNTS
    // -------------------------------------------------------

    const allCount =
      requests.length;

    const pendingCount =
      requests.filter(
        r => r.status === 'Pending'
      ).length;

    const approvedCount =
      requests.filter(
        r => r.status === 'Approved'
      ).length;

    const rejectedCount =
      requests.filter(
        r => r.status === 'Rejected'
      ).length;


    const allEl =
      document.getElementById(
        'dash-request-count-all'
      );

    const pendingEl =
      document.getElementById(
        'dash-request-count-pending'
      );

    const approvedEl =
      document.getElementById(
        'dash-request-count-approved'
      );

    const rejectedEl =
      document.getElementById(
        'dash-request-count-rejected'
      );


    if (allEl)
      allEl.textContent = allCount;

    if (pendingEl)
      pendingEl.textContent = pendingCount;

    if (approvedEl)
      approvedEl.textContent = approvedCount;

    if (rejectedEl)
      rejectedEl.textContent = rejectedCount;


    // -------------------------------------------------------
    // EMPTY STATE
    // -------------------------------------------------------

    if (!requests.length) {

      container.innerHTML = `

        <div
          class="
            lg:col-span-2
            rounded-3xl
            border
            border-dashed
            border-stone-300
            dark:border-stone-700
            p-12
            text-center
            bg-white
            dark:bg-stone-900
          ">

          <span
            class="
              material-symbols-outlined
              text-5xl
              text-stone-400
            ">
            inbox
          </span>

          <h3
            class="
              font-heading
              text-xl
              font-bold
              text-stone-900
              dark:text-white
              mt-4
            ">
            No Change Requests Yet
          </h3>

          <p
            class="
              text-sm
              text-stone-500
              dark:text-stone-400
              mt-2
            ">
            Your submitted corrections will appear here.
          </p>

        </div>

      `;

      return;
    }


    // -------------------------------------------------------
    // RENDER ALL REQUESTS
    // -------------------------------------------------------

    this.renderContributionRequests(
      requests
    );


    // -------------------------------------------------------
    // FILTER BUTTONS
    // -------------------------------------------------------

    document
      .querySelectorAll(
        '.dash-request-filter'
      )
      .forEach(button => {

        button.onclick = () => {

          const filter =
            button.dataset.requestFilter ||
            'All';


          document
            .querySelectorAll(
              '.dash-request-filter'
            )
            .forEach(btn => {

              btn.classList.remove(
                'bg-amber-600',
                'text-white'
              );

              btn.classList.add(
                'bg-stone-100',
                'dark:bg-stone-800',
                'text-stone-700',
                'dark:text-stone-300'
              );

            });


          button.classList.remove(
            'bg-stone-100',
            'dark:bg-stone-800',
            'text-stone-700',
            'dark:text-stone-300'
          );

          button.classList.add(
            'bg-amber-600',
            'text-white'
          );


          const filtered =
            filter === 'All'
              ? requests
              : requests.filter(
                  r => r.status === filter
                );


          this.renderContributionRequests(
            filtered
          );

        };

      });


  } catch (error) {

    console.error(
      '[RaahiDashboard] Change requests failed:',
      error
    );


    container.innerHTML = `

      <div
        class="
          lg:col-span-2
          rounded-3xl
          border
          border-red-200
          dark:border-red-900/40
          bg-red-50
          dark:bg-red-950/20
          p-10
          text-center
        ">

        <span
          class="
            material-symbols-outlined
            text-4xl
            text-red-500
          ">
          error
        </span>

        <h3
          class="
            text-lg
            font-bold
            text-red-700
            dark:text-red-400
            mt-3
          ">
          Could not load your requests
        </h3>

        <p
          class="
            text-xs
            text-stone-500
            mt-2
          ">
          ${this.escapeHtml(
            error.message ||
            'Please try again.'
          )}
        </p>

        <button
          onclick="RaahiDashboard.renderContributions()"
          class="
            mt-5
            px-5
            py-2.5
            rounded-xl
            bg-amber-600
            hover:bg-amber-700
            text-white
            text-xs
            font-bold
            transition-all
          ">
          Try Again
        </button>

      </div>

    `;

  }

},


renderContributionRequests(requests) {

  const container = document.getElementById(
    'dash-contributions-table-body'
  );

  if (!container) return;

  if (!Array.isArray(requests)) {
    requests = [];
  }

  if (!requests.length) {
    container.innerHTML = `
      <div class="lg:col-span-2 rounded-3xl border border-dashed
        border-stone-300 dark:border-stone-700 p-12 text-center">

        <span class="material-symbols-outlined text-4xl text-stone-400">
          inbox
        </span>

        <p class="text-sm text-stone-500 mt-3">
          No requests in this category.
        </p>

      </div>
    `;

    return;
  }

  const escape = (value) => {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
  };

  container.innerHTML = requests.map(request => {

    const status = request.status || 'Pending';

    const change =
      Array.isArray(request.changes) && request.changes.length
        ? request.changes[0]
        : null;

    const field =
      change?.field || 'General Information';

    const oldValue =
      change?.oldValue ?? 'Not provided';

    const newValue =
      change?.newValue ?? 'Not provided';

    const date = request.createdAt
      ? new Date(request.createdAt).toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }
        )
      : '—';

    let statusClass =
      'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50';

    let statusIcon = 'schedule';

    if (status === 'Approved') {
      statusClass =
        'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50';

      statusIcon = 'verified';

    } else if (status === 'Rejected') {
      statusClass =
        'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/50';

      statusIcon = 'cancel';
    }

    return `
      <article
        class="
          group
          relative
          overflow-hidden
          rounded-3xl
          p-6
          bg-white
          dark:bg-stone-900
          border
          border-stone-200
          dark:border-stone-800
          shadow-sm
          cursor-pointer
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-amber-500
          hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]
        "
        onclick="RaahiDashboard.openRequestDetails('${escape(request._id)}')"
      >

        <div class="
          absolute
          -top-20
          -right-20
          w-48
          h-48
          rounded-full
          bg-amber-500/10
          blur-3xl
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-500
          pointer-events-none
        "></div>


        <!-- Header -->

        <div class="relative flex items-start justify-between gap-4">

          <div class="min-w-0">

            <p class="
              text-[10px]
              font-mono
              font-bold
              text-stone-400
              truncate
            ">
              ${escape(request.requestId || request._id)}
            </p>

            <div class="flex flex-wrap gap-2 mt-3">

              <span class="
                px-2.5 py-1
                rounded-lg
                bg-purple-100
                dark:bg-purple-950/50
                text-purple-700
                dark:text-purple-300
                text-[9px]
                font-extrabold
                uppercase
              ">
                ${escape(request.requestType || 'UPDATE')}
              </span>

              <span class="
                px-2.5 py-1
                rounded-lg
                bg-stone-100
                dark:bg-stone-800
                text-stone-600
                dark:text-stone-300
                text-[9px]
                font-extrabold
                uppercase
              ">
                ${escape(request.resourceType || 'Resource')}
              </span>

            </div>

          </div>


          <!-- Status -->

          <span class="
            shrink-0
            inline-flex
            items-center
            gap-1.5
            px-3
            py-1.5
            rounded-full
            text-[10px]
            font-extrabold
            ${statusClass}
          ">

            <span class="material-symbols-outlined text-sm">
              ${statusIcon}
            </span>

            ${escape(status)}

          </span>

        </div>


        <!-- Resource -->

        <div class="relative mt-6">

          <p class="
            text-[9px]
            font-extrabold
            uppercase
            tracking-wider
            text-stone-400
          ">
            Resource
          </p>

          <h3 class="
            mt-1
            text-xl
            font-heading
            font-extrabold
            text-stone-900
            dark:text-white
            group-hover:text-amber-500
            transition-colors
          ">
            ${escape(request.resourceId || 'New Resource')}
          </h3>

        </div>


        <!-- Values -->

        <div class="
          relative
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-3
          mt-6
        ">

          <div class="
            p-4
            rounded-2xl
            bg-red-50
            dark:bg-red-950/20
            border
            border-red-100
            dark:border-red-900/30
          ">

            <p class="
              text-[9px]
              font-extrabold
              uppercase
              tracking-wider
              text-red-600
              dark:text-red-400
            ">
              Current Value
            </p>

            <p class="
              mt-2
              text-xs
              font-semibold
              text-stone-700
              dark:text-stone-300
              break-words
              line-clamp-3
            ">
              ${escape(String(oldValue))}
            </p>

          </div>


          <div class="
            p-4
            rounded-2xl
            bg-emerald-50
            dark:bg-emerald-950/20
            border
            border-emerald-100
            dark:border-emerald-900/30
          ">

            <p class="
              text-[9px]
              font-extrabold
              uppercase
              tracking-wider
              text-emerald-600
              dark:text-emerald-400
            ">
              Suggested Value
            </p>

            <p class="
              mt-2
              text-xs
              font-semibold
              text-emerald-700
              dark:text-emerald-300
              break-words
              line-clamp-3
            ">
              ${escape(String(newValue))}
            </p>

          </div>

        </div>


        <!-- Field -->

        <div class="relative mt-5">

          <p class="
            text-[9px]
            font-extrabold
            uppercase
            tracking-wider
            text-stone-400
          ">
            Field Being Changed
          </p>

          <p class="
            mt-1
            text-sm
            font-bold
            text-amber-600
            dark:text-amber-400
          ">
            ${escape(field)}
          </p>

        </div>


        <!-- Reason -->

        <div class="relative mt-5">

          <p class="
            text-[9px]
            font-extrabold
            uppercase
            tracking-wider
            text-stone-400
          ">
            Reason
          </p>

          <p class="
            mt-1
            text-xs
            leading-relaxed
            text-stone-500
            dark:text-stone-400
            line-clamp-2
          ">
            ${escape(request.reason || 'No reason provided.')}
          </p>

        </div>


        <!-- Footer -->

        <div class="
          relative
          flex
          items-center
          justify-between
          mt-6
          pt-4
          border-t
          border-stone-100
          dark:border-stone-800
        ">

          <span class="
            text-[10px]
            font-mono
            text-stone-400
          ">
            ${date}
          </span>

          <span class="
            inline-flex
            items-center
            gap-1
            text-xs
            font-extrabold
            text-stone-500
            group-hover:text-amber-500
            transition-colors
          ">
            View Details
            <span class="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </span>

        </div>

      </article>
    `;

  }).join('');
},







  // =========================================================
  // CONTRIBUTION COUNTS
  // =========================================================

  updateContributionCounts() {

    const counts = {

      All:
        this.changeRequests.length,

      Pending:
        this.changeRequests.filter(
          request =>
            request.status === 'Pending'
        ).length,

      Approved:
        this.changeRequests.filter(
          request =>
            request.status === 'Approved'
        ).length,

      Rejected:
        this.changeRequests.filter(
          request =>
            request.status === 'Rejected'
        ).length

    };


    Object.entries(counts)
      .forEach(([status, count]) => {

        const element =
          document.querySelector(
            `[data-request-count="${status}"]`
          );

        if (element) {
          element.textContent =
            count;
        }

      });

  },


  // =========================================================
  // FILTER CONTRIBUTIONS
  // =========================================================

  filterContributions(status = 'All') {

    const container =
      document.getElementById(
        'dash-contributions-table-body'
      );

    if (!container) {
      return;
    }


    const filtered =
      status === 'All'
        ? this.changeRequests
        : this.changeRequests.filter(
            request =>
              request.status === status
          );


    document
      .querySelectorAll('.dash-request-filter')
      .forEach(button => {

        const active =
          button.dataset.requestFilter === status;

        button.classList.toggle(
          'active',
          active
        );

      });


    if (!filtered.length) {

      const label =
        status === 'All'
          ? 'No change requests yet'
          : `No ${status.toLowerCase()} requests`;


      this.renderContributionEmptyState(
        container,
        label
      );

      return;
    }


    container.innerHTML =
      filtered.map(request =>
        this.renderContributionCard(
          request
        )
      ).join('');

  },




 


  // =========================================================
  // EMPTY STATE
  // =========================================================

  renderContributionEmptyState(
    container,
    message
  ) {

    container.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="py-16 text-center">

          <span
            class="
              material-symbols-outlined
              text-5xl
              text-stone-300
              dark:text-stone-700
            ">
            inbox
          </span>


          <h3
            class="
              font-heading
              text-lg
              font-bold
              text-stone-900
              dark:text-white
              mt-3
            ">
            ${message}
          </h3>


          <p
            class="
              text-xs
              text-stone-500
              mt-1
            ">
            Your submitted corrections will appear here.
          </p>

        </td>

      </tr>

    `;

  },


  // =========================================================
  // ERROR STATE
  // =========================================================

  renderContributionError(container) {

    container.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="py-16 text-center">

          <span
            class="
              material-symbols-outlined
              text-4xl
              text-red-400
            ">
            error_outline
          </span>


          <h3
            class="
              font-heading
              text-lg
              font-bold
              text-stone-900
              dark:text-white
              mt-3
            ">
            Unable to load your requests
          </h3>


          <p
            class="
              text-xs
              text-stone-500
              mt-1
            ">
            Please refresh and try again.
          </p>


          <button
            onclick="RaahiDashboard.renderContributions()"
            class="
              mt-4
              px-4 py-2
              rounded-xl
              bg-amber-600
              hover:bg-amber-700
              text-white
              text-xs
              font-bold
            ">
            Try Again
          </button>

        </td>

      </tr>

    `;

  },


  // =========================================================
  // REQUEST DETAILS MODAL
  // =========================================================

  openRequestDetails(requestId) {

    const request =
      this.changeRequests.find(
        item =>
          item._id === requestId
      );


    if (!request) {
      return;
    }


    const modal =
      document.getElementById(
        'dash-request-details-modal'
      );

    const content =
      document.getElementById(
        'dash-request-details-content'
      );


    if (!modal || !content) {
      console.warn(
        '[RaahiDashboard] Request modal elements not found'
      );

      return;
    }


    const change =
      Array.isArray(request.changes) &&
      request.changes.length
        ? request.changes[0]
        : null;


    const submittedDate =
      request.createdAt
        ? new Date(
            request.createdAt
          ).toLocaleString('en-IN')
        : '—';


    const reviewedDate =
      request.reviewedAt
        ? new Date(
            request.reviewedAt
          ).toLocaleString('en-IN')
        : 'Not reviewed yet';


    const status =
      request.status || 'Pending';


    let statusClass =
      'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';


    if (status === 'Approved') {

      statusClass =
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';

    } else if (status === 'Rejected') {

      statusClass =
        'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300';

    }


    content.innerHTML = `

      <div class="p-6 sm:p-8">

        <!-- HEADER -->

        <div
          class="
            flex
            items-start
            justify-between
            gap-4
            mb-7
          ">

          <div>

            <span
              class="
                text-[10px]
                font-mono
                font-bold
                text-amber-600
              ">
              ${request.requestId || request._id}
            </span>


            <h2
              class="
                font-heading
                text-2xl
                font-extrabold
                text-stone-900
                dark:text-white
                mt-1
              ">
              Change Request Details
            </h2>

          </div>


          <button
            onclick="RaahiDashboard.closeRequestDetails()"
            class="
              w-10 h-10
              shrink-0
              rounded-xl
              bg-stone-100
              dark:bg-stone-800
              text-stone-700
              dark:text-stone-300
              flex
              items-center
              justify-center
              hover:bg-red-100
              dark:hover:bg-red-950/40
              hover:text-red-600
              transition-all
            ">

            <span class="material-symbols-outlined">
              close
            </span>

          </button>

        </div>


        <!-- STATUS -->

        <div
          class="
            flex
            flex-wrap
            items-center
            gap-3
            mb-6
          ">

          <span
            class="
              inline-flex
              items-center
              gap-1.5
              px-4 py-2
              rounded-full
              text-xs
              font-extrabold
              ${statusClass}
            ">

            <span
              class="
                material-symbols-outlined
                text-sm
              ">
              ${
                status === 'Approved'
                  ? 'verified'
                  : status === 'Rejected'
                    ? 'cancel'
                    : 'schedule'
              }
            </span>

            ${status}

          </span>


          <span
            class="
              px-3 py-2
              rounded-xl
              bg-purple-50
              dark:bg-purple-950/30
              text-purple-700
              dark:text-purple-300
              text-xs
              font-bold
            ">
            ${request.requestType || 'UPDATE'}
          </span>


          <span
            class="
              px-3 py-2
              rounded-xl
              bg-stone-100
              dark:bg-stone-800
              text-stone-600
              dark:text-stone-300
              text-xs
              font-bold
            ">
            ${request.resourceType || 'Resource'}
          </span>

        </div>


        <!-- RESOURCE -->

        <div
          class="
            p-5
            rounded-2xl
            bg-stone-50
            dark:bg-stone-800/60
            border
            border-stone-200
            dark:border-stone-700
            mb-5
          ">

          <label
            class="
              text-[9px]
              font-extrabold
              uppercase
              tracking-wider
              text-stone-400
            ">
            Resource
          </label>


          <p
            class="
              text-lg
              font-heading
              font-extrabold
              text-stone-900
              dark:text-white
              mt-1
            ">
            ${request.resourceId || 'New Resource'}
          </p>

        </div>


        <!-- CHANGE -->

        ${
          change
            ? `

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                <div
                  class="
                    p-5
                    rounded-2xl
                    bg-red-50
                    dark:bg-red-950/20
                    border
                    border-red-200
                    dark:border-red-900/40
                  ">

                  <label
                    class="
                      text-[9px]
                      font-extrabold
                      uppercase
                      tracking-wider
                      text-red-600
                      dark:text-red-400
                    ">
                    Current Value
                  </label>


                  <p
                    class="
                      text-sm
                      text-stone-700
                      dark:text-stone-300
                      mt-2
                      break-words
                    ">
                    ${change.oldValue ?? 'Not provided'}
                  </p>

                </div>


                <div
                  class="
                    p-5
                    rounded-2xl
                    bg-emerald-50
                    dark:bg-emerald-950/20
                    border
                    border-emerald-200
                    dark:border-emerald-900/40
                  ">

                  <label
                    class="
                      text-[9px]
                      font-extrabold
                      uppercase
                      tracking-wider
                      text-emerald-600
                      dark:text-emerald-400
                    ">
                    Suggested Value
                  </label>


                  <p
                    class="
                      text-sm
                      text-emerald-800
                      dark:text-emerald-300
                      font-semibold
                      mt-2
                      break-words
                    ">
                    ${change.newValue ?? 'Not provided'}
                  </p>

                </div>

              </div>

            `
            : ''
        }


        <!-- FIELD -->

        ${
          change?.field
            ? `

              <div
                class="
                  p-4
                  rounded-2xl
                  bg-amber-50
                  dark:bg-amber-950/20
                  border
                  border-amber-200
                  dark:border-amber-900/40
                  mb-5
                ">

                <label
                  class="
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-wider
                    text-amber-600
                  ">
                  Field Being Changed
                </label>


                <p
                  class="
                    text-sm
                    font-bold
                    text-stone-900
                    dark:text-white
                    mt-1
                  ">
                  ${change.field}
                </p>

              </div>

            `
            : ''
        }


        <!-- REASON -->

        <div
          class="
            p-5
            rounded-2xl
            bg-stone-50
            dark:bg-stone-800/60
            mb-5
          ">

          <label
            class="
              text-[9px]
              font-extrabold
              uppercase
              tracking-wider
              text-stone-400
            ">
            Reason
          </label>


          <p
            class="
              text-sm
              text-stone-700
              dark:text-stone-300
              leading-relaxed
              mt-2
            ">
            ${request.reason || 'No reason provided.'}
          </p>

        </div>


        <!-- ADMIN NOTE -->

        ${
          request.adminNote
            ? `

              <div
                class="
                  p-5
                  rounded-2xl
                  bg-purple-50
                  dark:bg-purple-950/20
                  border
                  border-purple-200
                  dark:border-purple-900/40
                  mb-5
                ">

                <label
                  class="
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-wider
                    text-purple-600
                  ">
                  Admin Response
                </label>


                <p
                  class="
                    text-sm
                    text-stone-700
                    dark:text-stone-300
                    mt-2
                  ">
                  ${request.adminNote}
                </p>

              </div>

            `
            : ''
        }


        <!-- DATES -->

        <div
          class="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          ">

          <div
            class="
              p-4
              rounded-2xl
              bg-stone-50
              dark:bg-stone-800/60
            ">

            <label
              class="
                text-[9px]
                font-extrabold
                uppercase
                text-stone-400
              ">
              Submitted
            </label>


            <p
              class="
                text-xs
                font-semibold
                mt-1
              ">
              ${submittedDate}
            </p>

          </div>


          <div
            class="
              p-4
              rounded-2xl
              bg-stone-50
              dark:bg-stone-800/60
            ">

            <label
              class="
                text-[9px]
                font-extrabold
                uppercase
                text-stone-400
              ">
              Reviewed
            </label>


            <p
              class="
                text-xs
                font-semibold
                mt-1
              ">
              ${reviewedDate}
            </p>

          </div>

        </div>


        <!-- USER ONLY -->
        <!--
          There are intentionally NO approve/reject buttons here.
          Only admins can approve/reject.
        -->

      </div>

    `;


    // ---------------------------------------------------------
    // OPEN MODAL
    // ---------------------------------------------------------

    modal.classList.remove('hidden');

    modal.classList.add('flex');

    document.body.style.overflow =
      'hidden';


    // Scroll the modal container to top
    const panel =
      modal.querySelector(
        '.dash-request-modal-panel'
      );

    if (panel) {
      panel.scrollTop = 0;
    }

  },


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  closeRequestDetails() {

    const modal =
      document.getElementById(
        'dash-request-details-modal'
      );


    if (!modal) {
      return;
    }


    // THIS WAS THE BUG:
    // The old code was adding "hidden" incorrectly.
    // We simply hide the modal.

    modal.classList.add('hidden');

    modal.classList.remove('flex');

    document.body.style.overflow = '';

  }

};


// =============================================================
// GLOBAL
// =============================================================

if (typeof window !== 'undefined') {

  window.RaahiDashboard =
    RaahiDashboard;

}