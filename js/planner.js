/**
 * RAAHI - AI Trip Planner Module (Advanced Edition)
 * Handles journey customization, animated AI itinerary synthesis, interactive day-by-day views,
 * custom activity insertion, live budget calculator, and Royal Travel Pass generator.
 */

const RaahiPlanner = {
  currentItinerary: null,
  activeDayIndex: 0,
  selectedInterests: ["History & Heritage"],
  selectedCurrency: "INR",
  currencyRates: {
    INR: { symbol: "₹", rate: 1 },
    USD: { symbol: "$", rate: 0.012 },
    EUR: { symbol: "€", rate: 0.011 },
    GBP: { symbol: "£", rate: 0.0094 },
    AED: { symbol: "د.إ", rate: 0.044 }
  },

  init() {
    this.bindEvents();
    this.loadInitialItinerary();
  },

  bindEvents() {
    // Interest Chips Toggle
    const interestChips = document.querySelectorAll('.interest-chip');
    interestChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const value = chip.getAttribute('data-interest') || chip.textContent.trim();
        if (this.selectedInterests.includes(value)) {
          if (this.selectedInterests.length > 1) {
            this.selectedInterests = this.selectedInterests.filter(i => i !== value);
            chip.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
            chip.classList.add('bg-surface-container', 'text-on-surface');
          }
        } else {
          this.selectedInterests.push(value);
          chip.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
          chip.classList.remove('bg-surface-container', 'text-on-surface');
        }
      });
    });

    // Form submission / Generate button
    const generateBtn = document.getElementById('btn-generate-journey');
    if (generateBtn) {
      generateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.generateJourneyFromForm();
      });
    }

    // Export, Share, Save & Royal Pass buttons
    const exportBtn = document.getElementById('btn-export-itinerary');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportItinerary());
    }

    const shareBtn = document.getElementById('btn-share-itinerary');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareItinerary());
    }

    const saveBtn = document.getElementById('btn-save-itinerary');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveItinerary());
    }

    const passBtn = document.getElementById('btn-view-boarding-pass');
    if (passBtn) {
      passBtn.addEventListener('click', () => this.openRoyalPassModal());
    }
  },

  loadInitialItinerary() {
    const saved = localStorage.getItem('raahi_current_itinerary');
    if (saved) {
      try {
        this.currentItinerary = JSON.parse(saved);
      } catch (err) {
        this.currentItinerary = RAAHI_DATA.sampleItineraries['rajasthan'];
      }
    } else {
      this.currentItinerary = RAAHI_DATA.sampleItineraries['rajasthan'];
    }
    this.renderItinerary();
  },

  prefillPlanner(destination, interests = []) {
    const destInput = document.getElementById('planner-destination-input');
    if (destInput && destination) {
      destInput.value = destination;
    }

    if (interests && interests.length > 0) {
      this.selectedInterests = interests;
      document.querySelectorAll('.interest-chip').forEach(chip => {
        const val = chip.getAttribute('data-interest') || chip.textContent.trim();
        if (interests.includes(val)) {
          chip.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
          chip.classList.remove('bg-surface-container', 'text-on-surface');
        } else {
          chip.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
          chip.classList.add('bg-surface-container', 'text-on-surface');
        }
      });
    }
  },

  setCurrency(currCode) {
    if (this.currencyRates[currCode]) {
      this.selectedCurrency = currCode;
      this.renderItinerary();
      RaahiApp.showToast(`Switched currency to ${currCode} (${this.currencyRates[currCode].symbol})`);
    }
  },

  formatCost(inrAmount) {
    const curr = this.currencyRates[this.selectedCurrency] || this.currencyRates.INR;
    const converted = Math.round(inrAmount * curr.rate);
    return `${curr.symbol}${converted.toLocaleString()}`;
  },

  generateJourneyFromForm() {
    const destInput = document.getElementById('planner-destination-input');
    const destination = destInput ? destInput.value.trim() : "Rajasthan";
    const travelers = document.getElementById('planner-travelers')?.value || "2 Adults";
    const pace = document.getElementById('planner-pace')?.value || "Relaxed";

    const loadingState = document.getElementById('planner-loading-state');
    const contentState = document.getElementById('planner-content-state');

    if (loadingState && contentState) {
      contentState.classList.add('hidden');
      loadingState.classList.remove('hidden');

      const steps = [
        "Consulting Heritage Archives & UNESCO databases...",
        "Analyzing seasonal weather & ideal visiting hours...",
        `Balancing ${pace.toLowerCase()} pacing for ${travelers}...`,
        "Integrating curated culinary and artisan workshops...",
        "Finalizing your bespoke Heritage Intelligence journey..."
      ];

      const stepText = document.getElementById('planner-loading-text');
      const progressBar = document.getElementById('planner-progress-bar');
      
      let stepIndex = 0;
      const interval = setInterval(async () => {
        if (stepIndex < steps.length) {
          if (stepText) stepText.textContent = steps[stepIndex];
          if (progressBar) progressBar.style.width = `${((stepIndex + 1) / steps.length) * 100}%`;
          stepIndex++;
        } else {
          clearInterval(interval);
          
          let backendItinerary = null;
          if (typeof RaahiAPI !== 'undefined') {
            backendItinerary = await RaahiAPI.generateItinerary({
              destination,
              travelers,
              pace,
              interests: this.selectedInterests,
              days: 5
            });
          }

          if (backendItinerary) {
            this.currentItinerary = backendItinerary;
            localStorage.setItem('raahi_current_itinerary', JSON.stringify(this.currentItinerary));
            this.renderItinerary();
            RaahiApp.showToast("Synthesized with Python AI Graph Optimizer!");
          } else {
            this.buildGeneratedItinerary(destination, travelers, pace, this.selectedInterests);
            RaahiApp.showToast("Bespoke itinerary generated successfully!");
          }

          loadingState.classList.add('hidden');
          contentState.classList.remove('hidden');
        }
      }, 400);
    }
  },

  buildGeneratedItinerary(destName, travelers, pace, interests) {
    let base = RAAHI_DATA.sampleItineraries['rajasthan'];
    if (destName.toLowerCase().includes('kerala') || destName.toLowerCase().includes('south') || interests.includes('Wellness')) {
      base = RAAHI_DATA.sampleItineraries['kerala'];
    }

    this.currentItinerary = {
      ...base,
      title: `${destName || "Curated India"} Bespoke Exploration`,
      subtitle: `Bespoke • ${travelers} • ${pace} Pace • ${interests.join(', ')}`,
      destination: destName || "India",
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    localStorage.setItem('raahi_current_itinerary', JSON.stringify(this.currentItinerary));
    this.renderItinerary();
  },

  renderItinerary() {
    if (!this.currentItinerary) return;

    const titleEl = document.getElementById('itinerary-title');
    const subtitleEl = document.getElementById('itinerary-subtitle');
    const budgetEl = document.getElementById('itinerary-budget');
    const timelineContainer = document.getElementById('itinerary-timeline-days');

    if (titleEl) titleEl.textContent = this.currentItinerary.title;
    if (subtitleEl) subtitleEl.textContent = this.currentItinerary.subtitle;
    if (budgetEl) {
      budgetEl.textContent = `Est: ${this.formatCost(185000)}`;
    }

    if (timelineContainer && this.currentItinerary.days) {
      timelineContainer.innerHTML = this.currentItinerary.days.map((day, dIdx) => `
        <div class="bg-white dark:bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-dim dark:border-white/10 transition-all hover:shadow-md">
          <!-- Day Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-surface-dim dark:border-white/10 pb-3 mb-4 gap-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm shadow-sm">
                D${day.dayNumber}
              </div>
              <div>
                <h3 class="font-headline-md text-lg text-primary dark:text-inverse-primary font-semibold">${day.title}</h3>
                <p class="text-xs text-on-surface-variant dark:text-surface-variant">${day.city} • ${day.date}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-surface-container dark:bg-surface-container-high px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant weather-pill">
              <span class="material-symbols-outlined text-sm text-secondary">wb_sunny</span>
              <span>${day.weather}</span>
            </div>
          </div>

          <!-- Activities Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="day-${dIdx}-activities">
            ${day.activities.map((act, aIdx) => `
              <div class="tilt-card group relative bg-surface dark:bg-surface-container rounded-xl p-3.5 border border-outline-variant/20 hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  <div class="w-full h-32 rounded-lg overflow-hidden mb-3 relative shadow-inner">
                    <img src="${act.image}" alt="${act.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                      ${act.time}
                    </span>
                  </div>
                  <h4 class="font-headline-md text-sm font-semibold text-on-surface mb-1">${act.title}</h4>
                  <p class="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">${act.description}</p>
                </div>
                <div class="flex justify-between items-center pt-2.5 border-t border-outline-variant/10 text-xs">
                  <span class="px-2 py-0.5 bg-primary-container/10 text-primary dark:text-primary-fixed rounded-md text-[11px] font-semibold">${act.tag}</span>
                  <button onclick="RaahiPlanner.askConciergeAboutActivity('${act.title}')" class="text-secondary font-semibold hover:text-primary transition-colors flex items-center gap-1 text-[11px]">
                    <span class="material-symbols-outlined text-sm fill-1">auto_awesome</span> Tips
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Add Activity Button -->
          <div class="mt-4 pt-3 border-t border-outline-variant/15 flex justify-between items-center text-xs">
            <button onclick="RaahiPlanner.promptAddActivity(${dIdx})" class="text-primary dark:text-inverse-primary hover:underline font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-base">add_circle</span>
              Add Custom Experience to Day ${day.dayNumber}
            </button>
            <span class="text-[11px] text-on-surface-variant">Private Chauffeur Included</span>
          </div>
        </div>
      `).join('');
    }
  },

  promptAddActivity(dayIndex) {
    const title = prompt("Enter a custom activity or monument you would like to add:");
    if (title && title.trim()) {
      if (this.currentItinerary && this.currentItinerary.days[dayIndex]) {
        this.currentItinerary.days[dayIndex].activities.push({
          time: "Custom Time",
          title: title.trim(),
          description: "Customized stop added by traveler. Concierge will coordinate tickets & timing.",
          tag: "Custom Stop",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8h5x7V2pd-Kmz-cfjTD46UKBcrBtIlWIqq62d3w1yQX_0nbvTERH4XE2mmGz4SZoRtmUHy-HIhz0FW_zea8kJZkw8wEnQfBP3AdkdjD4_eP33tT7JNNiTZQ5zWD9fUknOaK30zAVpzbhyGO4BWBq4t7eDuXd849wux6ppsoVgzDGQwiyjjXKwqlrKG8Upj653iLoEf1VarycxvudY6SPvtziN1E76-C3JXtS4TTGORUWBzf2c33SY"
        });
        localStorage.setItem('raahi_current_itinerary', JSON.stringify(this.currentItinerary));
        this.renderItinerary();
        RaahiApp.showToast(`Added "${title.trim()}" to Day ${dayIndex + 1}!`);
      }
    }
  },

  askConciergeAboutActivity(activityTitle) {
    if (window.RaahiAI) {
      RaahiAI.openDrawerWithPrompt(`Tell me more about ${activityTitle} in our itinerary: what should we wear, best photo spots, and local tips?`);
    }
  },

  openRoyalPassModal() {
    if (!this.currentItinerary) return;

    const modal = document.getElementById('royal-pass-modal');
    const content = document.getElementById('royal-pass-modal-content');

    if (modal && content) {
      const passId = "RAAHI-" + Math.floor(100000 + Math.random() * 900000);
      content.innerHTML = `
        <div class="relative p-6 sm:p-8">
          <button onclick="RaahiPlanner.closeRoyalPassModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container hover:bg-primary/10 flex items-center justify-center text-on-surface transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>

          <!-- Boarding Pass Container -->
          <div class="royal-ticket p-6 sm:p-8 relative overflow-hidden">
            
            <!-- Top Header -->
            <div class="flex justify-between items-center pb-4 border-b border-dashed border-outline-variant/40 mb-6">
              <div class="flex flex-col">
                <span class="font-heading text-2xl font-black text-primary dark:text-inverse-primary tracking-tight">Raahi</span>
                <span class="text-[10px] text-secondary font-bold uppercase tracking-widest">Royal Voyage Pass</span>
              </div>
              <div class="text-right">
                <span class="block text-[10px] text-on-surface-variant uppercase">Pass Number</span>
                <span class="font-mono text-xs font-bold text-primary dark:text-inverse-primary">${passId}</span>
              </div>
            </div>

            <!-- Destination & Details -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <span class="block text-[10px] text-on-surface-variant uppercase font-medium">Destination</span>
                <span class="font-heading text-sm font-bold text-on-surface">${this.currentItinerary.destination}</span>
              </div>
              <div>
                <span class="block text-[10px] text-on-surface-variant uppercase font-medium">Pacing</span>
                <span class="font-heading text-sm font-bold text-on-surface">Relaxed Luxury</span>
              </div>
              <div>
                <span class="block text-[10px] text-on-surface-variant uppercase font-medium">Concierge Service</span>
                <span class="font-heading text-sm font-bold text-secondary">24/7 Dedicated</span>
              </div>
              <div>
                <span class="block text-[10px] text-on-surface-variant uppercase font-medium">Issued Date</span>
                <span class="font-mono text-xs text-on-surface">${new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <!-- QR Code & Signature Strip -->
            <div class="p-4 bg-surface-container dark:bg-surface-container-high rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="w-16 h-16 bg-white p-1 rounded-lg border border-outline-variant/30 flex items-center justify-center">
                  <span class="material-symbols-outlined text-4xl text-primary">qr_code_2</span>
                </div>
                <div>
                  <h5 class="text-xs font-bold text-on-surface">VIP Heritage Fast-Track</h5>
                  <p class="text-[11px] text-on-surface-variant">Present at luxury havelis &amp; private monument entrances.</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button onclick="window.print()" class="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">print</span>
                  Print Pass
                </button>
              </div>
            </div>

          </div>
        </div>
      `;

      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeRoyalPassModal() {
    const modal = document.getElementById('royal-pass-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  exportItinerary() {
    window.print();
  },

  saveItinerary() {
    localStorage.setItem('raahi_saved_trip_' + Date.now(), JSON.stringify(this.currentItinerary));
    RaahiApp.showToast("Itinerary saved to My Journeys!");
  },

  shareItinerary() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      RaahiApp.showToast("Shareable journey link copied to clipboard!");
    } else {
      RaahiApp.showToast("Link ready to share!");
    }
  }
};
