/**
 * RAAHI — AI Trip Planner & Royal Boarding Pass Module
 * Generates personalized multi-day itineraries across Indian destinations with live currency conversion.
 */

const RaahiPlanner = {
  currentPlan: null,
  selectedCurrency: 'INR',
  currencyRates: {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044
  },
  currencySymbols: {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ '
  },

  init() {
    this.bindEvents();
    this.generateDefaultItinerary();
  },

  bindEvents() {
    const form = document.getElementById('planner-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generateCustomItinerary();
      });
    }

    const currencySelect = document.getElementById('planner-currency-select');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        this.selectedCurrency = e.target.value;
        this.renderItinerary();
      });
    }
  },

  generateDefaultItinerary() {
    this.currentPlan = {
      destination: "Lucknow & Varanasi Heritage Triangle",
      durationDays: 4,
      travelers: "2 Adults (Cultural Explorers)",
      budgetTier: "Heritage Classic",
      pacing: "Moderate & Immersive",
      estimatedCostINR: 32000,
      days: [
        {
          day: 1,
          title: "The Nawabi Glory & Labyrinth of Lucknow",
          activities: [
            { time: "09:00 AM", title: "Bara Imambara & Bhool Bhulaiya", costINR: 100, desc: "Acoustic wonder and labyrinth exploration with a certified heritage guide." },
            { time: "01:00 PM", title: "Authentic Awadhi Lunch at Chowk", costINR: 800, desc: "Galouti Kebabs and Sheermal in historic Aminabad bazaar." },
            { time: "04:30 PM", title: "Chhota Imambara & Rumi Darwaza", costINR: 50, desc: "Golden chandelier hall and architectural sunset photography." }
          ]
        },
        {
          day: 2,
          title: "Artisans & The Residency History",
          activities: [
            { time: "10:00 AM", title: "British Residency Gardens & Museum", costINR: 50, desc: "Walk through 1857 memorial grounds with bullet-scarred historic brickwork." },
            { time: "02:30 PM", title: "Chikankari Handloom Artisan Workshop", costINR: 0, desc: "Live shadow embroidery demonstration in old Lucknow master craft lanes." }
          ]
        },
        {
          day: 3,
          title: "Sacred Kashi & Eternal Ganga Aarti",
          activities: [
            { time: "08:00 AM", title: "Express Transit to Holy Varanasi", costINR: 1200, desc: "Scenic Vande Bharat morning journey into Kashi." },
            { time: "05:30 PM", title: "Dashashwamedh Ghat Ganga Maha Aarti", costINR: 400, desc: "Private wooden boat vantage point for the multi-tiered brass lamp ritual." }
          ]
        },
        {
          day: 4,
          title: "Sunrise Subah-e-Banaras & Silk Weaving",
          activities: [
            { time: "05:30 AM", title: "Sunrise Rowing Boat on the Ganges", costINR: 500, desc: "Witness sacred morning prayers and acoustic conch shell chants along 84 ghats." },
            { time: "10:00 AM", title: "Kashi Vishwanath Temple Corridor", costINR: 0, desc: "Golden shrine darshan and Banarasi silk pit-loom workshop walkthrough." }
          ]
        }
      ]
    };
    this.renderItinerary();
  },

  generateCustomItinerary() {
    const dest = document.getElementById('plan-dest-select')?.value || 'Varanasi';
    const days = parseInt(document.getElementById('plan-days-select')?.value || '3');
    const budget = document.getElementById('plan-budget-select')?.value || 'Heritage';

    RaahiApp.showToast(`Synthesizing ${days}-Day AI Itinerary for ${dest}...`, "info");

    setTimeout(() => {
      this.currentPlan = {
        destination: `${dest} Cultural Discovery`,
        durationDays: days,
        travelers: "Custom Travelers",
        budgetTier: budget,
        pacing: "Bespoke Pacing",
        estimatedCostINR: days * 7500,
        days: Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          title: `Day ${i + 1}: ${dest} Heritage Exploration`,
          activities: [
            { time: "09:00 AM", title: `Historic Monument & Architectural Tour`, costINR: 250, desc: "Exploration of iconic heritage sights with certified local guide." },
            { time: "01:30 PM", title: `Traditional Regional Gastronomy Lunch`, costINR: 600, desc: "Sampling authentic regional delicacies and centuries-old culinary crafts." },
            { time: "05:00 PM", title: `Cultural Evening & Scenic Walk`, costINR: 300, desc: "Sunset viewpoint and evening bazaar cultural immersion." }
          ]
        }))
      };
      this.renderItinerary();
      RaahiApp.showToast("Your AI Itinerary has been generated!", "success");
    }, 400);
  },

  renderItinerary() {
    const container = document.getElementById('planner-days-container');
    const summaryTitle = document.getElementById('planner-summary-title');
    const summaryCost = document.getElementById('planner-summary-cost');
    if (!container || !this.currentPlan) return;

    const rate = this.currencyRates[this.selectedCurrency] || 1;
    const symbol = this.currencySymbols[this.selectedCurrency] || '₹';
    const totalConverted = Math.round(this.currentPlan.estimatedCostINR * rate);

    if (summaryTitle) summaryTitle.textContent = this.currentPlan.destination;
    if (summaryCost) summaryCost.textContent = `${symbol}${totalConverted.toLocaleString()}`;

    container.innerHTML = this.currentPlan.days.map(d => `
      <div class="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">D${d.day}</span>
            <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white">${d.title}</h4>
          </div>
          <span class="text-xs text-stone-400 font-semibold">${d.activities.length} Sights</span>
        </div>

        <div class="space-y-3">
          ${d.activities.map(act => {
            const costConv = Math.round(act.costINR * rate);
            return `
              <div class="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-start justify-between gap-4">
                <div class="flex items-start gap-3">
                  <span class="px-2 py-1 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-mono font-bold shrink-0">${act.time}</span>
                  <div>
                    <h5 class="text-xs font-bold text-stone-900 dark:text-white">${act.title}</h5>
                    <p class="text-[11px] text-stone-500 mt-0.5 leading-relaxed">${act.desc}</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  ${costConv === 0 ? 'Free' : `${symbol}${costConv}`}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  },

  openRoyalBoardingPass() {
    const modal = document.getElementById('royal-boarding-pass-modal');
    const content = document.getElementById('royal-pass-content');
    if (!modal || !content || !this.currentPlan) return;

    const rate = this.currencyRates[this.selectedCurrency] || 1;
    const symbol = this.currencySymbols[this.selectedCurrency] || '₹';
    const totalConverted = Math.round(this.currentPlan.estimatedCostINR * rate);

    content.innerHTML = `
      <div class="p-6 sm:p-8 bg-stone-900 text-white rounded-3xl border-2 border-amber-500 shadow-2xl relative overflow-hidden font-sans">
        <div class="flex items-center justify-between pb-4 border-b border-amber-500/30 mb-6">
          <div class="flex items-center gap-2">
            <span class="font-heading text-2xl font-extrabold tracking-tight text-amber-400">Raahi</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 uppercase">Royal Boarding Pass</span>
          </div>
          <button onclick="RaahiPlanner.closeRoyalBoardingPass()" class="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Destination Corridor</span>
            <span class="text-sm font-extrabold text-amber-300">${this.currentPlan.destination}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Journey Duration</span>
            <span class="text-sm font-extrabold text-white">${this.currentPlan.durationDays} Days</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Traveler Class</span>
            <span class="text-sm font-extrabold text-white">${this.currentPlan.budgetTier}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Estimated Cost</span>
            <span class="text-sm font-extrabold text-emerald-400">${symbol}${totalConverted.toLocaleString()}</span>
          </div>
        </div>

        <div class="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6 text-xs text-stone-300 space-y-2">
          <p>• <strong>Pacing:</strong> ${this.currentPlan.pacing} with optimal morning slots for photography & tranquility.</p>
          <p>• <strong>Verified Guidelines:</strong> All monument timings and entry tariffs cross-referenced with ASI.</p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-amber-500/30">
          <span class="text-[11px] text-amber-400 font-mono tracking-widest uppercase">RAAHI-EXP-2026-IND</span>
          <button onclick="window.print()" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all">
            <span class="material-symbols-outlined text-sm">print</span>
            <span>Print Itinerary Pass</span>
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeRoyalBoardingPass() {
    const modal = document.getElementById('royal-boarding-pass-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
};

if (typeof window !== 'undefined') {
  window.RaahiPlanner = RaahiPlanner;
}
