/**
 * RAAHI — AI Smart Match Preference Engine
 * Connects to POST http://localhost:8000/api/v1/recommend
 * Features:
 *  - 10 Custom Range Sliders with Emojis (Nature, History, Adventure, Food, Beach, Culture, Relaxation, Wildlife, Spirituality, Nightlife)
 *  - Quick Selectors for Companion & Budget Tier
 *  - Animated Match Button & Radar Loading State
 *  - High-Fidelity Results Rendering with Match % Badges, Safety Scores, and Top Attractions Chips
 *  - Resilient Local Vector Similarity Fallback for Standalone/Offline Reliability
 */

const RaahiSmartMatch = {
  preferences: {
    nature: 4,
    history: 5,
    adventure: 2,
    food: 5,
    beach: 1,
    culture: 5,
    relaxation: 3,
    wildlife: 2,
    spirituality: 4,
    nightlife: 1
  },
  companion: 'Couple',
  budgetTier: 'Moderate',
  sliderConfigs: [
    { key: 'nature', label: 'Nature', emoji: '🌿', defaultVal: 4, desc: 'Lush hills, backwaters, valleys' },
    { key: 'history', label: 'History', emoji: '🏛️', defaultVal: 5, desc: 'Ancient forts, palaces, ruins' },
    { key: 'adventure', label: 'Adventure', emoji: '🧗', defaultVal: 2, desc: 'Trekking, rafting, thrills' },
    { key: 'food', label: 'Food', emoji: '🍛', defaultVal: 5, desc: 'Street culinary, royal feasts' },
    { key: 'beach', label: 'Beach', emoji: '🏖️', defaultVal: 1, desc: 'Coastal breeze, golden sands' },
    { key: 'culture', label: 'Culture', emoji: '🎭', defaultVal: 5, desc: 'Folk arts, rituals, music' },
    { key: 'relaxation', label: 'Relaxation', emoji: '🧘', defaultVal: 3, desc: 'Ayurveda, serene retreats' },
    { key: 'wildlife', label: 'Wildlife', emoji: '🐅', defaultVal: 2, desc: 'Tiger safaris, sanctuaries' },
    { key: 'spirituality', label: 'Spirituality', emoji: '🕉️', defaultVal: 4, desc: 'Sacred temples, river aartis' },
    { key: 'nightlife', label: 'Nightlife', emoji: '🎆', defaultVal: 1, desc: 'Evening cafes, bazaars' }
  ],

  // Destination profile vectors for local similarity calculation & fallback
  destinationProfiles: [
    {
      id: 'lucknow',
      name: 'Lucknow',
      state: 'Uttar Pradesh',
      tagline: 'The City of Nawabs, Architectural Labyrinths & Awadhi Delicacies',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.4,
      profile: { nature: 2, history: 5, adventure: 1, food: 5, beach: 0, culture: 5, relaxation: 3, wildlife: 2, spirituality: 3, nightlife: 3 },
      topAttractions: ['Bara Imambara', 'Rumi Darwaza', 'British Residency', 'Tunday Kababi Chowk'],
      suitableCompanions: ['Solo', 'Couple', 'Family', 'Friends'],
      suitableBudgets: ['Budget', 'Moderate', 'Luxury']
    },
    {
      id: 'varanasi',
      name: 'Varanasi (Kashi)',
      state: 'Uttar Pradesh',
      tagline: 'The Eternal Spiritual Capital, Sacred Ghats & Silk Weaving',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.3,
      profile: { nature: 3, history: 5, adventure: 2, food: 4, beach: 0, culture: 5, relaxation: 4, wildlife: 1, spirituality: 5, nightlife: 2 },
      topAttractions: ['Dashashwamedh Ghat Aarti', 'Kashi Vishwanath Corridor', 'Sunrise Boat Ride', 'Assi Ghat'],
      suitableCompanions: ['Solo', 'Couple', 'Family', 'Friends', 'Backpacker'],
      suitableBudgets: ['Budget', 'Moderate']
    },
    {
      id: 'jaipur',
      name: 'Jaipur',
      state: 'Rajasthan',
      tagline: 'The Royal Pink City, Hilltop Fortresses & Rajasthani Royalty',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.5,
      profile: { nature: 2, history: 5, adventure: 3, food: 5, beach: 0, culture: 5, relaxation: 3, wildlife: 3, spirituality: 3, nightlife: 3 },
      topAttractions: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Chokhi Dhani Heritage'],
      suitableCompanions: ['Solo', 'Couple', 'Family', 'Friends'],
      suitableBudgets: ['Moderate', 'Luxury']
    },
    {
      id: 'kerala',
      name: 'Kerala Backwaters & Munnar',
      state: 'Kerala',
      tagline: "God's Own Country, Tranquil Canals, Ayurveda & Tea Mist",
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.7,
      profile: { nature: 5, history: 3, adventure: 3, food: 4, beach: 4, culture: 4, relaxation: 5, wildlife: 4, spirituality: 3, nightlife: 1 },
      topAttractions: ['Alleppey Houseboat Cruise', 'Munnar Tea Hills', 'Kathakali Dance Center', 'Fort Kochi'],
      suitableCompanions: ['Couple', 'Family', 'Solo', 'Backpacker'],
      suitableBudgets: ['Budget', 'Moderate', 'Luxury']
    },
    {
      id: 'goa',
      name: 'Goa Coastal Heritage',
      state: 'Goa',
      tagline: 'Golden Coastlines, Portuguese Cathedrals & Sunset Breezes',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.6,
      profile: { nature: 4, history: 4, adventure: 4, food: 5, beach: 5, culture: 4, relaxation: 5, wildlife: 3, spirituality: 2, nightlife: 5 },
      topAttractions: ['Basilica of Bom Jesus', 'Palolem Beach', 'Fort Aguada', 'Fontainhas Latin Quarter'],
      suitableCompanions: ['Friends', 'Couple', 'Solo', 'Backpacker'],
      suitableBudgets: ['Budget', 'Moderate', 'Luxury']
    },
    {
      id: 'agra',
      name: 'Agra',
      state: 'Uttar Pradesh',
      tagline: 'Imperial Mughal Capital & The Immortal Wonder of the World',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.2,
      profile: { nature: 2, history: 5, adventure: 1, food: 4, beach: 0, culture: 4, relaxation: 3, wildlife: 1, spirituality: 2, nightlife: 1 },
      topAttractions: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh', 'Fatehpur Sikri'],
      suitableCompanions: ['Couple', 'Family', 'Solo'],
      suitableBudgets: ['Budget', 'Moderate', 'Luxury']
    },
    {
      id: 'delhi',
      name: 'Delhi NCR',
      state: 'National Capital Territory',
      tagline: 'Heart of the Nation, Seven Historic Cities & Living Heritage',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.1,
      profile: { nature: 2, history: 5, adventure: 2, food: 5, beach: 0, culture: 5, relaxation: 2, wildlife: 1, spirituality: 4, nightlife: 5 },
      topAttractions: ['Qutub Minar', 'Humayun Tomb', 'Chandni Chowk Alleys', 'Red Fort'],
      suitableCompanions: ['Solo', 'Friends', 'Family', 'Backpacker'],
      suitableBudgets: ['Budget', 'Moderate', 'Luxury']
    },
    {
      id: 'kashmir',
      name: 'Kashmir Valley & Gulmarg',
      state: 'Jammu & Kashmir',
      tagline: 'Paradise on Earth, Snow Peaks, Dal Lake Shikaras & Mughal Gardens',
      image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
      safetyScore: 9.4,
      profile: { nature: 5, history: 3, adventure: 5, food: 4, beach: 0, culture: 4, relaxation: 5, wildlife: 3, spirituality: 3, nightlife: 1 },
      topAttractions: ['Dal Lake Shikara Ride', 'Gulmarg Gondola', 'Nishat Mughal Gardens', 'Pahalgam Valley'],
      suitableCompanions: ['Couple', 'Family', 'Friends', 'Solo'],
      suitableBudgets: ['Moderate', 'Luxury']
    }
  ],

  init() {
    this.renderSliders();
    this.bindEvents();
  },

  renderSliders() {
    const container = document.getElementById('smart-match-sliders-container');
    if (!container) return;

    container.innerHTML = this.sliderConfigs.map(cfg => {
      const val = this.preferences[cfg.key] ?? cfg.defaultVal;
      return `
        <div class="p-3 sm:p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl shrink-0">${cfg.emoji}</span>
              <div>
                <h4 class="font-heading text-xs sm:text-sm font-bold text-stone-900 dark:text-white">${cfg.label}</h4>
                <p class="text-[10px] text-stone-500 hidden sm:block">${cfg.desc}</p>
              </div>
            </div>
            <span id="slider-val-${cfg.key}" class="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold shadow-2xs">
              ${val} / 5
            </span>
          </div>

          <div class="pt-1">
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="1" 
              value="${val}" 
              id="slider-input-${cfg.key}"
              oninput="RaahiSmartMatch.updateSlider('${cfg.key}', this.value)"
              class="smart-match-slider"
            >
            <div class="flex justify-between text-[9px] text-stone-400 font-semibold px-0.5 mt-1">
              <span>0 (None)</span>
              <span>2.5</span>
              <span>5 (Max)</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  bindEvents() {
    // ESC key listener to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  },

  updateSlider(key, val) {
    const num = parseInt(val);
    this.preferences[key] = num;
    const badge = document.getElementById(`slider-val-${key}`);
    if (badge) {
      badge.textContent = `${num} / 5`;
    }
  },

  selectCompanion(comp) {
    this.companion = comp;
    document.querySelectorAll('.companion-opt-btn').forEach(btn => {
      if (btn.getAttribute('data-comp') === comp) {
        btn.classList.add('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/50', 'text-amber-900', 'dark:text-amber-300', 'shadow-sm');
        btn.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      } else {
        btn.classList.remove('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/50', 'text-amber-900', 'dark:text-amber-300', 'shadow-sm');
        btn.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      }
    });
  },

  selectBudget(budget) {
    this.budgetTier = budget;
    document.querySelectorAll('.budget-opt-btn').forEach(btn => {
      if (btn.getAttribute('data-budget') === budget) {
        btn.classList.add('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/50', 'text-amber-900', 'dark:text-amber-300', 'shadow-sm');
        btn.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      } else {
        btn.classList.remove('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/50', 'text-amber-900', 'dark:text-amber-300', 'shadow-sm');
        btn.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      }
    });
  },

  openModal() {
    const modal = document.getElementById('ai-smart-match-modal');
    if (!modal) return;

    this.showInputView();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const modal = document.getElementById('ai-smart-match-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  showInputView() {
    const inputView = document.getElementById('smart-match-input-view');
    const loadingView = document.getElementById('smart-match-loading-view');
    const resultsView = document.getElementById('smart-match-results-view');

    if (inputView) inputView.classList.remove('hidden');
    if (loadingView) loadingView.classList.add('hidden');
    if (resultsView) resultsView.classList.add('hidden');
  },

  showLoadingView() {
    const inputView = document.getElementById('smart-match-input-view');
    const loadingView = document.getElementById('smart-match-loading-view');
    const resultsView = document.getElementById('smart-match-results-view');

    if (inputView) inputView.classList.add('hidden');
    if (loadingView) loadingView.classList.remove('hidden');
    if (resultsView) resultsView.classList.add('hidden');
  },

  showResultsView() {
    const inputView = document.getElementById('smart-match-input-view');
    const loadingView = document.getElementById('smart-match-loading-view');
    const resultsView = document.getElementById('smart-match-results-view');

    if (inputView) inputView.classList.add('hidden');
    if (loadingView) loadingView.classList.add('hidden');
    if (resultsView) resultsView.classList.remove('hidden');
  },

  // Main Submit Handler — Connects to POST http://localhost:8000/api/v1/recommend
  async generateAIMatches() {
    this.showLoadingView();

    // Convert frontend budget names to AI/ML budget levels
    const budgetMap = {
      'Budget': 1,
      'Moderate': 2,
      'Luxury': 3
    };

    const payload = {
      preferences: {
        nature: this.preferences.nature,
        history: this.preferences.history,
        adventure: this.preferences.adventure,
        food: this.preferences.food,
        beach: this.preferences.beach,
        culture: this.preferences.culture,
        relaxation: this.preferences.relaxation,
        wildlife: this.preferences.wildlife,
        spirituality: this.preferences.spirituality,
        nightlife: this.preferences.nightlife
      },

      // FastAPI expects companion_type
      companion_type: this.companion,

      // FastAPI expects budget_level: 1, 2 or 3
      budget_level: budgetMap[this.budgetTier] || 2,

      // Return top 6 recommendations
      top_n: 6
    };

    try {
      console.log("Sending AI recommendation request:", payload);

      // IMPORTANT:
      // Frontend → Node Backend → FastAPI AI/ML
      const data = await RaahiAPI.post(
        '/api/ai/recommend',
        payload
      );

      console.log("AI recommendation response:", data);

      if (
        data &&
        data.status === 'success' &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {
        this.renderResults(data.results, true);
        return;
      }

      throw new Error("No AI recommendations returned.");

    } catch (error) {
      console.error("AI recommendation failed:", error);

      // Keep your existing local fallback
      setTimeout(() => {
        const scoredResults = this.computeLocalMatchScores();
        this.renderResults(scoredResults, false);
      }, 700);
    }
  },

  // Multidimensional cosine/weighted affinity matching algorithm
  computeLocalMatchScores() {
    const weights = this.preferences;
    const topDimensions = Object.entries(weights)
      .sort((a, b) => b[1] - a[1])
      .filter(([k, v]) => v >= 3)
      .map(([k]) => k);

    const scored = this.destinationProfiles.map(dest => {
      let totalWeightedScore = 0;
      let totalPossible = 0;

      Object.keys(weights).forEach(dim => {
        const userWeight = weights[dim] || 0;
        const destScore = dest.profile[dim] || 0;
        const affinity = 5 - Math.abs(userWeight - destScore);
        totalWeightedScore += affinity * (userWeight + 1);
        totalPossible += 5 * (userWeight + 1);
      });

      // Boost for companion & budget tier alignment
      let bonus = 0;
      if (dest.suitableCompanions.includes(this.companion)) bonus += 3;
      if (dest.suitableBudgets.includes(this.budgetTier)) bonus += 3;

      const rawPercentage = Math.round(((totalWeightedScore / totalPossible) * 100) + bonus);
      const matchScore = Math.min(99, Math.max(74, rawPercentage));

      // Compose tailored match reason
      const alignedTraits = topDimensions.filter(d => (dest.profile[d] || 0) >= 3);
      const traitNames = alignedTraits.map(t => t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 3).join(', ');
      const matchReason = traitNames
        ? `High alignment with your preference for ${traitNames} (${this.companion} pace).`
        : `Well balanced travel experience matching your ${this.budgetTier.toLowerCase()} itinerary preferences.`;

      return {
        ...dest,
        matchScore: matchScore,
        matchReason: matchReason
      };
    });

    // Sort descending by match score
    return scored.sort((a, b) => b.matchScore - a.matchScore);
  },

  renderResults(destinations, isLiveApi = false) {

    // =========================================================
    // Convert AI/ML response format → Frontend format
    // =========================================================
    if (isLiveApi) {
      destinations = destinations.map(dest => ({
        ...dest,

        // ID
        id: dest.id || dest.destination_id || '',

        // Destination name
        name: dest.name || dest.destination || 'Unknown Destination',

        // State
        state: dest.state || '',

        // Match score
        matchScore:
          dest.matchScore ??
          dest.match_score ??
          dest.match_percentage ??
          0,

        // Safety score
        safetyScore:
          dest.safetyScore ??
          dest.safety_score ??
          0,

        // Attractions
        topAttractions:
          dest.topAttractions ||
          dest.top_attractions ||
          dest.attractions ||
          [],

        // Tagline / description
        tagline:
          dest.tagline ||
          dest.description ||
          '',

        // AI explanation
        matchReason:
          dest.matchReason ||
          dest.match_reason ||
          dest.explanation ||
          '',

        // Image
        image:
          dest.image ||
          dest.image_url ||
          ''
      }));
    }

    // =========================================================
    // DOM Elements
    // =========================================================
    const listContainer =
      document.getElementById('smart-match-results-list');

    const summaryBadge =
      document.getElementById('smart-match-summary-badge');

    if (!listContainer) return;

    // =========================================================
    // Summary
    // =========================================================
    if (summaryBadge) {
      summaryBadge.textContent =
        `${this.companion} • ${this.budgetTier} Budget • ${destinations.length} Matches`;
    }

    // =========================================================
    // No results
    // =========================================================
    if (!destinations || destinations.length === 0) {
      listContainer.innerHTML = `
      <div class="p-8 text-center">
        <div class="text-4xl mb-3">🔍</div>

        <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white">
          No matches found
        </h3>

        <p class="text-sm text-stone-500 dark:text-stone-400 mt-2">
          Try adjusting your preferences and search again.
        </p>
      </div>
    `;

      this.showResultsView();
      return;
    }

    // =========================================================
    // Render Results
    // =========================================================
    listContainer.innerHTML = destinations
      .slice(0, 6)
      .map((dest, idx) => {

        // -------------------------------------------------------
        // Match percentage
        // -------------------------------------------------------
        const matchPercent =
          dest.matchScore ??
          dest.match_score ??
          dest.match_percentage ??
          (98 - (idx * 3));

        // -------------------------------------------------------
        // Safety score
        // -------------------------------------------------------
        const safety =
          dest.safetyScore ??
          dest.safety_score ??
          (9.6 - (idx * 0.1)).toFixed(1);

        // -------------------------------------------------------
        // Attractions
        // -------------------------------------------------------
        const attractions =
          dest.topAttractions ||
          dest.top_attractions ||
          dest.attractions ||
          [
            'Heritage Monuments',
            'Local Food Alley',
            'Cultural Center'
          ];

        // Make sure attractions is always an array
        const attractionList = Array.isArray(attractions)
          ? attractions
          : [attractions];

        // -------------------------------------------------------
        // Reason
        // -------------------------------------------------------
        const reason =
          dest.matchReason ||
          dest.match_reason ||
          dest.explanation ||
          dest.description ||
          dest.tagline ||
          'This destination matches your travel preferences.';

        // -------------------------------------------------------
        // Destination name
        // -------------------------------------------------------
        const name =
          dest.name ||
          dest.destination ||
          'Unknown Destination';

        // -------------------------------------------------------
        // Destination ID
        // -------------------------------------------------------
        const destinationId =
          dest.id ||
          dest.destination_id ||
          '';

        // -------------------------------------------------------
        // Image
        // -------------------------------------------------------
        const image =
          dest.image ||
          dest.image_url ||
          '';

        // -------------------------------------------------------
        // State
        // -------------------------------------------------------
        const state =
          dest.state ||
          '';

        // -------------------------------------------------------
        // Tagline
        // -------------------------------------------------------
        const tagline =
          dest.tagline ||
          dest.description ||
          '';

        return `
        <div
          class="p-5 sm:p-6
          bg-white dark:bg-stone-900
          border border-stone-200 dark:border-stone-800
          rounded-3xl
          shadow-sm hover:shadow-xl
          transition-all duration-300
          flex flex-col md:flex-row
          items-start md:items-center
          justify-between
          gap-6
          group card-hover"
        >

          <!-- =================================================
               IMAGE & BASE INFORMATION
          ================================================== -->

          <div class="flex items-center gap-4 flex-1 w-full sm:w-auto">

            <!-- Image -->
            <div
              class="relative
              w-24 h-24
              sm:w-28 sm:h-28
              rounded-2xl
              overflow-hidden
              shrink-0
              bg-stone-100 dark:bg-stone-800
              shadow-md"
            >

              ${image
            ? `
                    <img
                      src="${image}"
                      alt="${name}"
                      class="w-full h-full object-cover
                      group-hover:scale-105
                      transition-transform duration-300"
                      onerror="this.style.display='none'"
                    >
                  `
            : `
                    <div
                      class="w-full h-full
                      flex items-center justify-center
                      text-3xl"
                    >
                      🏛️
                    </div>
                  `
          }

              <!-- Rank -->
              <div class="absolute top-1.5 left-1.5">

                <span
                  class="px-2 py-0.5
                  rounded-full
                  text-[9px]
                  font-extrabold
                  bg-black/70
                  backdrop-blur-md
                  text-white
                  border border-white/20"
                >
                  #${idx + 1}
                </span>

              </div>

            </div>


            <!-- =================================================
                 DESTINATION INFORMATION
            ================================================== -->

            <div class="space-y-1.5 flex-1 min-w-0">

              <!-- Scores + Feedback -->
              <div
                class="flex flex-wrap
                items-center
                justify-between
                gap-2"
              >

                <div
                  class="flex flex-wrap
                  items-center gap-2"
                >

                  <!-- Match Score -->
                  <span
                    class="px-3 py-1
                    rounded-full
                    bg-gradient-to-r
                    from-emerald-600
                    to-emerald-700
                    text-white
                    font-mono
                    text-xs
                    font-extrabold
                    shadow-sm
                    flex items-center gap-1
                    match-badge-glow"
                  >

                    <span
                      class="material-symbols-outlined text-xs"
                    >
                      auto_awesome
                    </span>

                    ${matchPercent}% Match

                  </span>


                  <!-- Safety Score -->
                  <span
                    class="px-2.5 py-1
                    rounded-full
                    bg-stone-100
                    dark:bg-stone-800
                    text-stone-700
                    dark:text-stone-300
                    text-[11px]
                    font-bold
                    border border-stone-200
                    dark:border-stone-700
                    flex items-center gap-1"
                  >

                    <span
                      class="material-symbols-outlined
                      text-xs text-blue-500"
                    >
                      verified_user
                    </span>

                    🛡️ ${safety} Safety Score

                  </span>

                </div>


                <!-- Feedback Toolbar -->
                ${typeof RaahiFeedback !== 'undefined'
            ? RaahiFeedback.renderCardFeedbackToolbar(
              destinationId
            )
            : ''
          }

              </div>


              <!-- Destination Name -->
              <h3
                class="font-heading
                text-lg sm:text-xl
                font-bold
                text-stone-900
                dark:text-white
                truncate"
              >
                ${name}
              </h3>


              <!-- State + Tagline -->
              <p
                class="text-xs
                text-amber-700
                dark:text-amber-400
                font-medium
                line-clamp-1"
              >
                ${state}${state && tagline ? ' • ' : ''}${tagline}
              </p>


              <!-- AI Reason -->
              <p
                class="text-xs
                text-stone-600
                dark:text-stone-400
                italic
                line-clamp-2
                leading-relaxed"
              >
                "${reason}"
              </p>


              <!-- =================================================
                   TOP ATTRACTIONS
              ================================================== -->

              <div
                class="flex flex-wrap
                items-center
                gap-1.5 pt-1"
              >

                <span
                  class="text-[10px]
                  font-extrabold
                  text-stone-400
                  uppercase
                  tracking-wider"
                >
                  Top Spots:
                </span>

                ${attractionList
            .slice(0, 4)
            .map(
              att => `
                        <span
                          class="px-2.5 py-0.5
                          rounded-full
                          bg-amber-50
                          dark:bg-amber-950/40
                          border border-amber-200
                          dark:border-amber-900/60
                          text-amber-900
                          dark:text-amber-300
                          text-[10px]
                          font-semibold"
                        >
                          ${att}
                        </span>
                      `
            )
            .join('')
          }

              </div>

            </div>

          </div>


          <!-- =================================================
               ACTION BUTTONS
          ================================================== -->

          <div
            class="flex sm:flex-col
            items-stretch sm:items-end
            justify-between
            w-full md:w-auto
            gap-2
            shrink-0
            pt-3 md:pt-0
            border-t md:border-t-0
            border-stone-100
            dark:border-stone-800"
          >

            <!-- Why this destination -->
            <button
              onclick="
                RaahiSmartMatch.closeModal();
                RaahiDestinations.openDetailModal('${destinationId}');
              "
              class="px-3.5 py-2
              rounded-xl
              bg-amber-50
              dark:bg-amber-950/40
              hover:bg-amber-100
              dark:hover:bg-amber-900/60
              text-amber-800
              dark:text-amber-300
              text-xs
              font-bold
              transition-all
              flex items-center
              justify-center
              gap-1
              border border-amber-200
              dark:border-amber-800"
            >

              <span
                class="material-symbols-outlined
                text-xs text-amber-600"
              >
                psychology
              </span>

              <span>
                Why ${name}? (xAI)
              </span>

            </button>


            <!-- Plan Trip -->
            <button
              onclick="
                RaahiSmartMatch.planTrip('${name}')
              "
              class="px-4 py-2.5
              rounded-xl
              bg-amber-600
              hover:bg-amber-700
              text-white
              font-bold
              text-xs
              shadow-md
              transition-all
              flex items-center
              justify-center
              gap-1.5
              group-hover:scale-102"
            >

              <span
                class="material-symbols-outlined text-sm"
              >
                auto_awesome
              </span>

              <span>
                Plan Trip with AI
              </span>

            </button>


            <!-- Explore Places -->
            <button
              onclick="
                RaahiSmartMatch.explorePlaces('${name}')
              "
              class="px-3.5 py-1.5
              rounded-xl
              bg-stone-100
              dark:bg-stone-800
              hover:bg-stone-200
              dark:hover:bg-stone-700
              text-stone-800
              dark:text-stone-200
              text-xs
              font-semibold
              transition-colors
              flex items-center
              justify-center
              gap-1"
            >

              <span>
                Explore Places
              </span>

              <span
                class="material-symbols-outlined text-xs"
              >
                arrow_forward
              </span>

            </button>

          </div>

        </div>
      `;
      })
      .join('');

    // =========================================================
    // Show results
    // =========================================================
    this.showResultsView();
  },

  planTrip(destinationName) {
    this.closeModal();
    if (typeof RaahiPlanner !== 'undefined') {
      RaahiPlanner.selectQuickDest(destinationName);
    }
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate('planner');
      RaahiApp.showToast(`Starting AI Trip Planner for ${destinationName}`, 'success');
    }
  },

  explorePlaces(destinationName) {
    this.closeModal();
    if (typeof RaahiPlaces !== 'undefined') {
      RaahiPlaces.stateFilter = destinationName;
      RaahiPlaces.searchQuery = '';
      RaahiPlaces.renderPlaces();
    }
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate('places');
    }
  }
};

// Global Exposure
if (typeof window !== 'undefined') {
  window.RaahiSmartMatch = RaahiSmartMatch;
}
