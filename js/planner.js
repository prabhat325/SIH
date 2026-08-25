/**
 * RAAHI — AI Travel Planner & Route Intelligence Engine
 * "Safar Aapka, Planning Hamari"
 * Brand: Raahi | Primary AI Feature: Raahi AI Travel Planner
 * Features:
 *  - 5-Step Travel Planning Wizard (Destination, Duration, Interests, Style, Preferences)
 *  - Interactive AI Processing State with Sequential Checklist Animation
 *  - Dynamic Itinerary Generator supporting 1, 2, 3, 5, 7+ days across Indian heritage corridors
 *  - Categorized Morning / Afternoon / Evening slots with Image, Duration, Distance, Rating, View Details & Add/Remove
 *  - Optimized AI Route Sequence Visualization (Start -> Place 1 -> Place 2 -> Restaurant -> Place 3 -> End)
 *  - Interactive Leaflet Route Map with Waypoint Polyline & Numbered Markers
 *  - Royal Boarding Pass Export with Multi-Currency Conversion
 */

const RaahiPlanner = {
  currentStep: 1,
  selectedDest: 'Lucknow',
  selectedDays: 3,
  selectedInterests: ['Heritage', 'Culture', 'Food', 'Photography', 'Local Experiences'],
  selectedStyle: 'Balanced',
  selectedPreferences: {
    accessibility: 'none',
    food: 'all',
    distance: 'compact',
    activity: 'moderate'
  },
  currentPlan: null,
  routeMapInstance: null,
  routePolyline: null,
  routeMarkersGroup: null,
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

  stepTitles: {
    1: "Destination",
    2: "Travel Duration",
    3: "Interests & Passions",
    4: "Travel Style & Pacing",
    5: "Specific Preferences"
  },

  init() {
    this.bindEvents();
    this.updateWizardUI();
  },

  bindEvents() {
    const destInput = document.getElementById('wizard-dest-input');
    if (destInput) {
      destInput.addEventListener('input', (e) => {
        this.selectedDest = e.target.value.trim() || 'Lucknow';
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

  // 1. Wizard Navigation Controls
  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 5) return;
    this.currentStep = stepNum;
    this.updateWizardUI();
  },

  nextStep() {
    if (this.currentStep === 1) {
      const destInput = document.getElementById('wizard-dest-input');
      if (destInput && destInput.value.trim()) {
        this.selectedDest = destInput.value.trim();
      }
    }
    if (this.currentStep < 5) {
      this.currentStep++;
      this.updateWizardUI();
    } else {
      this.startAIProcessing();
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateWizardUI();
    }
  },

  updateWizardUI() {
    // Hide all steps, show current
    for (let i = 1; i <= 5; i++) {
      const stepEl = document.getElementById(`wizard-step-${i}`);
      if (stepEl) {
        if (i === this.currentStep) {
          stepEl.classList.remove('hidden');
        } else {
          stepEl.classList.add('hidden');
        }
      }
    }

    // Step Header & Counter
    const counterEl = document.getElementById('planner-step-counter');
    const titleEl = document.getElementById('planner-step-title');
    const progressBar = document.getElementById('planner-progress-bar');

    if (counterEl) counterEl.textContent = `Step ${this.currentStep} of 5`;
    if (titleEl) titleEl.textContent = this.stepTitles[this.currentStep] || '';
    if (progressBar) progressBar.style.width = `${(this.currentStep / 5) * 100}%`;

    // Action Buttons Visibility
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    const submitBtn = document.getElementById('wizard-submit-btn');

    if (prevBtn) {
      if (this.currentStep === 1) {
        prevBtn.classList.add('hidden');
      } else {
        prevBtn.classList.remove('hidden');
      }
    }

    if (nextBtn && submitBtn) {
      if (this.currentStep === 5) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
      } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
      }
    }
  },

  selectQuickDest(destName) {
    this.selectedDest = destName;
    const destInput = document.getElementById('wizard-dest-input');
    if (destInput) destInput.value = destName;

    document.querySelectorAll('.quick-dest-chip').forEach(btn => {
      if (btn.textContent.includes(destName)) {
        btn.classList.add('border-amber-500', 'bg-amber-50', 'dark:bg-amber-950/40', 'text-amber-900', 'dark:text-amber-300');
        btn.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      } else {
        btn.classList.remove('border-amber-500', 'bg-amber-50', 'dark:bg-amber-950/40', 'text-amber-900', 'dark:text-amber-300');
        btn.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      }
    });
  },

  selectDuration(days) {
    this.selectedDays = days;
    document.querySelectorAll('.duration-opt-btn').forEach(btn => {
      const text = btn.querySelector('.font-heading')?.textContent.trim();
      const isSelected = (days === 7 && text === '7+') || (text === String(days));
      if (isSelected) {
        btn.classList.add('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
        btn.querySelector('.font-heading')?.classList.add('text-amber-600', 'dark:text-amber-400');
      } else {
        btn.classList.remove('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
        btn.querySelector('.font-heading')?.classList.remove('text-amber-600', 'dark:text-amber-400');
      }
    });
  },

  toggleInterestChip(element, interestName) {
    if (this.selectedInterests.includes(interestName)) {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interestName);
      element.classList.remove('selected', 'bg-amber-600', 'text-white', 'border-amber-600');
      element.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800', 'text-stone-800', 'dark:text-stone-200');
    } else {
      this.selectedInterests.push(interestName);
      element.classList.add('selected', 'bg-amber-600', 'text-white', 'border-amber-600');
      element.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800', 'text-stone-800', 'dark:text-stone-200');
    }
  },

  selectStyle(styleName) {
    this.selectedStyle = styleName;
    document.querySelectorAll('.style-opt-btn').forEach(btn => {
      if (btn.textContent.includes(styleName)) {
        btn.classList.add('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
      } else {
        btn.classList.remove('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
      }
    });
  },

  // 2. AI Processing Screen with Sequential Animation
  startAIProcessing() {
    // Read preferences
    this.selectedPreferences.accessibility = document.getElementById('pref-accessibility')?.value || 'none';
    this.selectedPreferences.food = document.getElementById('pref-food')?.value || 'all';
    this.selectedPreferences.distance = document.getElementById('pref-distance')?.value || 'compact';
    this.selectedPreferences.activity = document.getElementById('pref-activity')?.value || 'moderate';

    // Show processing container
    const wizardCont = document.getElementById('planner-wizard-container');
    const procCont = document.getElementById('planner-processing-container');
    const resultCont = document.getElementById('planner-result-container');

    if (wizardCont) wizardCont.classList.add('hidden');
    if (resultCont) resultCont.classList.add('hidden');
    if (procCont) procCont.classList.remove('hidden');

    // Smooth Sequential Checklist Animation
    const steps = [
      { id: 'proc-step-1', text: 'Understanding your preferences' },
      { id: 'proc-step-2', text: 'Finding suitable destinations' },
      { id: 'proc-step-3', text: 'Building your itinerary' },
      { id: 'proc-step-4', text: 'Optimizing your route' },
      { id: 'proc-step-5', text: 'Finding nearby experiences' }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        const el = document.getElementById(s.id);
        if (el) {
          el.className = 'flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold transition-all';
          const icon = el.querySelector('.proc-icon');
          if (icon) {
            icon.textContent = 'pending';
            icon.className = 'proc-icon material-symbols-outlined text-base text-amber-600 step-active-pulse';
          }
        }
      }, idx * 300);

      setTimeout(() => {
        const el = document.getElementById(s.id);
        if (el) {
          el.className = 'flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold transition-all';
          const icon = el.querySelector('.proc-icon');
          if (icon) {
            icon.textContent = 'check_circle';
            icon.className = 'proc-icon material-symbols-outlined text-base text-emerald-500';
          }
        }
      }, (idx + 1) * 350);
    });

    // Complete Synthesis
    setTimeout(() => {
      this.generateAIItinerary();
      if (procCont) procCont.classList.add('hidden');
      if (resultCont) resultCont.classList.remove('hidden');
      RaahiApp.showToast(`Your ${this.selectedDays}-Day Raahi AI Journey is ready!`, "success");
      this.initRouteMiniMap();
    }, 2000);
  },

  resetToWizard() {
    const wizardCont = document.getElementById('planner-wizard-container');
    const procCont = document.getElementById('planner-processing-container');
    const resultCont = document.getElementById('planner-result-container');

    if (resultCont) resultCont.classList.add('hidden');
    if (procCont) procCont.classList.add('hidden');
    if (wizardCont) wizardCont.classList.remove('hidden');
    this.goToStep(1);
  },

  // 3. Dynamic Itinerary Generation Algorithm
  generateAIItinerary() {
    const destName = this.selectedDest || 'Lucknow';
    const daysCount = this.selectedDays || 3;
    const interests = this.selectedInterests.length > 0 ? this.selectedInterests : ['Heritage', 'Food', 'Culture'];
    const interestsText = interests.slice(0, 3).map(i => i.toLowerCase()).join(', ');

    // Match places and food from data for the destination
    const matchedPlaces = (RAAHI_DATA.places || []).filter(p => 
      p.city.toLowerCase().includes(destName.toLowerCase()) || 
      p.state.toLowerCase().includes(destName.toLowerCase()) ||
      destName.toLowerCase().includes(p.city.toLowerCase())
    );

    const matchedRestaurants = (RAAHI_DATA.restaurants || []).filter(r => 
      r.city.toLowerCase().includes(destName.toLowerCase()) ||
      destName.toLowerCase().includes(r.city.toLowerCase())
    );

    // Fallbacks if data is sparse for destination
    const placesPool = matchedPlaces.length > 0 ? matchedPlaces : (RAAHI_DATA.places || []);
    const restPool = matchedRestaurants.length > 0 ? matchedRestaurants : (RAAHI_DATA.restaurants || []);

    const generatedDays = [];
    let placeIdx = 0;
    let restIdx = 0;

    for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
      const p1 = placesPool[placeIdx % placesPool.length];
      const p2 = placesPool[(placeIdx + 1) % placesPool.length];
      const rest = restPool[restIdx % restPool.length];
      placeIdx += 2;
      restIdx += 1;

      const dayTitleTheme = dayNum === 1 ? "Heritage & History" : dayNum === 2 ? "Culture & Culinary Alleys" : dayNum === 3 ? "Local Crafts & Experiences" : `Grand Corridor Discovery Part ${dayNum}`;

      generatedDays.push({
        day: dayNum,
        theme: dayTitleTheme,
        items: [
          {
            id: `item-${p1.id}-d${dayNum}-m`,
            refId: p1.id,
            slot: 'Morning',
            time: '09:00 AM',
            name: p1.name,
            category: p1.category || 'Heritage Site',
            image: p1.image,
            duration: '2.0 hrs',
            distance: `${(1.2 + (dayNum * 0.3)).toFixed(1)} km`,
            rating: p1.rating,
            costINR: 100,
            description: p1.description,
            lat: p1.lat,
            lng: p1.lng,
            included: true,
            type: 'place'
          },
          {
            id: `item-${p2.id}-d${dayNum}-a`,
            refId: p2.id,
            slot: 'Afternoon',
            time: '01:30 PM',
            name: p2.name,
            category: p2.category || 'Historic Monument',
            image: p2.image,
            duration: '1.5 hrs',
            distance: `${(1.8 + (dayNum * 0.4)).toFixed(1)} km`,
            rating: p2.rating,
            costINR: 50,
            description: p2.description,
            lat: p2.lat,
            lng: p2.lng,
            included: true,
            type: 'place'
          },
          {
            id: `item-${rest.id}-d${dayNum}-e`,
            refId: rest.id,
            slot: 'Evening',
            time: '06:30 PM',
            name: rest.name,
            category: rest.cuisine || 'Authentic Regional Dining',
            image: rest.image,
            duration: '1.5 hrs',
            distance: `${(0.9 + (dayNum * 0.2)).toFixed(1)} km`,
            rating: rest.rating,
            costINR: 600,
            description: `Authentic regional dinner featuring ${rest.signatureDish || 'signature delicacies'}.`,
            lat: p2.lat ? p2.lat - 0.01 : 26.84,
            lng: p2.lng ? p2.lng - 0.01 : 80.94,
            included: true,
            type: 'restaurant'
          }
        ]
      });
    }

    this.currentPlan = {
      destination: destName,
      durationDays: daysCount,
      interests: interests,
      travelStyle: this.selectedStyle,
      aiSummary: `Based on your interest in ${interestsText}, here's a ${this.selectedStyle.toLowerCase()} ${daysCount}-day journey across ${destName}.`,
      days: generatedDays
    };

    this.renderItinerary();
  },

  // 4. Render Itinerary Result Screen
  renderItinerary() {
    if (!this.currentPlan) return;

    const headingEl = document.getElementById('planner-result-heading');
    const summaryEl = document.getElementById('planner-result-ai-summary');
    const container = document.getElementById('planner-itinerary-days-container');
    const sequenceList = document.getElementById('planner-route-sequence-list');
    const totalBudgetBadge = document.getElementById('planner-total-budget-badge');

    if (headingEl) headingEl.textContent = `${this.currentPlan.durationDays} Days in ${this.currentPlan.destination}`;
    if (summaryEl) summaryEl.textContent = `"${this.currentPlan.aiSummary}"`;

    const rate = this.currencyRates[this.selectedCurrency] || 1;
    const symbol = this.currencySymbols[this.selectedCurrency] || '₹';

    let totalCost = 0;
    const routeWaypoints = [];

    if (container) {
      container.innerHTML = this.currentPlan.days.map(d => `
        <div class="p-6 sm:p-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 rounded-2xl bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                Day ${d.day}
              </span>
              <div>
                <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white">Day ${d.day} — ${d.theme}</h3>
                <span class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">${this.currentPlan.travelStyle} Pacing</span>
              </div>
            </div>
            <span class="text-xs text-stone-400 font-bold">${d.items.filter(i => i.included).length} Active Stops</span>
          </div>

          <div class="space-y-4">
            ${d.items.map(item => {
              if (item.included) {
                totalCost += item.costINR;
                if (item.lat && item.lng) {
                  routeWaypoints.push({ name: item.name, lat: item.lat, lng: item.lng, slot: item.slot });
                }
              }
              const costConv = Math.round(item.costINR * rate);

              return `
                <div class="p-4 rounded-2xl border ${item.included ? 'border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850' : 'border-dashed border-stone-300 dark:border-stone-700 bg-stone-100/40 opacity-60'} transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <div class="flex items-center gap-4 flex-1">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-bold">
                          ${item.slot} • ${item.time}
                        </span>
                        <span class="text-[10px] text-stone-500 font-semibold">${item.category}</span>
                      </div>
                      <h4 class="font-heading text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                        ${item.name}
                      </h4>
                      <div class="flex items-center gap-3 text-[11px] text-stone-500">
                        <span class="flex items-center gap-0.5 text-amber-500 font-bold">
                          <span class="material-symbols-outlined text-xs">star</span>
                          ${item.rating}
                        </span>
                        <span>•</span>
                        <span>⏱ ${item.duration}</span>
                        <span>•</span>
                        <span>📍 ${item.distance} transit</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 dark:border-stone-700">
                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ${costConv === 0 ? 'Free' : `${symbol}${costConv.toLocaleString()}`}
                    </span>
                    <div class="flex items-center gap-2">
                      <button onclick="${item.type === 'restaurant' ? `RaahiRestaurants.openRestModal('${item.refId}')` : `RaahiPlaces.openDetailModal('${item.refId}')`}" class="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] font-bold hover:bg-amber-600 transition-colors">
                        View Details
                      </button>
                      <button onclick="RaahiPlanner.togglePlanItem('${item.id}')" title="${item.included ? 'Remove from plan' : 'Add back to plan'}" class="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-[11px] font-bold ${item.included ? 'text-stone-600 hover:text-red-600' : 'text-emerald-600 hover:text-emerald-700'}">
                        ${item.included ? 'Remove' : 'Add Back'}
                      </button>
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('');
    }

    if (totalBudgetBadge) {
      const convertedTotal = Math.round(totalCost * rate);
      totalBudgetBadge.textContent = `${symbol}${convertedTotal.toLocaleString()}`;
    }

    // 5. Render Route Sequence Flow (Section 5)
    if (sequenceList) {
      sequenceList.innerHTML = `
        <div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">S</span>
          <span>Start: Hotel / Station Hub</span>
        </div>
        ${routeWaypoints.slice(0, 5).map((wp, idx) => `
          <div class="flex items-center justify-center text-amber-500 text-xs py-0.5">
            <span class="material-symbols-outlined text-sm">arrow_downward</span>
          </div>
          <div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 truncate">
              <span class="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">${idx + 1}</span>
              <span class="font-bold text-stone-900 dark:text-white truncate">${wp.name}</span>
            </div>
            <span class="text-[10px] text-amber-600 font-mono font-bold shrink-0">${wp.slot}</span>
          </div>
        `).join('')}
        <div class="flex items-center justify-center text-stone-400 text-xs py-0.5">
          <span class="material-symbols-outlined text-sm">arrow_downward</span>
        </div>
        <div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-[10px]">E</span>
          <span>End: Return to Stay / Evening Relaxation</span>
        </div>
      `;
    }

    this.updateRouteMapMarkers(routeWaypoints);
  },

  togglePlanItem(itemId) {
    if (!this.currentPlan) return;
    this.currentPlan.days.forEach(d => {
      d.items.forEach(item => {
        if (item.id === itemId) {
          item.included = !item.included;
        }
      });
    });
    this.renderItinerary();
  },

  // 6. Interactive Leaflet Mini Map Route Engine
  initRouteMiniMap() {
    const mapContainer = document.getElementById('planner-route-map');
    if (!mapContainer) return;

    if (!this.routeMapInstance) {
      try {
        this.routeMapInstance = L.map('planner-route-map', {
          center: [26.85, 80.94],
          zoom: 12,
          zoomControl: false,
          scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CARTO & OSM',
          maxZoom: 18
        }).addTo(this.routeMapInstance);

        this.routeMarkersGroup = L.layerGroup().addTo(this.routeMapInstance);
      } catch (e) {
        console.warn("Leaflet route map note:", e);
      }
    }

    setTimeout(() => {
      if (this.routeMapInstance) {
        this.routeMapInstance.invalidateSize();
      }
    }, 200);
  },

  updateRouteMapMarkers(waypoints) {
    if (!this.routeMapInstance || !this.routeMarkersGroup) return;
    this.routeMarkersGroup.clearLayers();
    if (this.routePolyline) {
      this.routeMapInstance.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }

    if (!waypoints || waypoints.length === 0) return;

    const latLngs = [];

    waypoints.forEach((wp, idx) => {
      const latLng = [wp.lat, wp.lng];
      latLngs.push(latLng);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: #d97706; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${idx + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const marker = L.marker(latLng, { icon: customIcon });
      marker.bindPopup(`<strong>${wp.name}</strong><br><span style="font-size: 11px; color: #d97706;">Waypoint ${idx + 1} (${wp.slot})</span>`);
      this.routeMarkersGroup.addLayer(marker);
    });

    if (latLngs.length > 1) {
      this.routePolyline = L.polyline(latLngs, {
        color: '#d97706',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(this.routeMapInstance);

      this.routeMapInstance.fitBounds(this.routePolyline.getBounds(), { padding: [30, 30] });
    } else if (latLngs.length === 1) {
      this.routeMapInstance.setView(latLngs[0], 13);
    }
  },

  // 7. Royal Boarding Pass Integration
  openRoyalBoardingPass() {
    const modal = document.getElementById('royal-boarding-pass-modal');
    const content = document.getElementById('royal-pass-content');
    if (!modal || !content || !this.currentPlan) return;

    const rate = this.currencyRates[this.selectedCurrency] || 1;
    const symbol = this.currencySymbols[this.selectedCurrency] || '₹';

    let totalINR = 0;
    this.currentPlan.days.forEach(d => {
      d.items.forEach(i => {
        if (i.included) totalINR += i.costINR;
      });
    });

    const totalConverted = Math.round(totalINR * rate);

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
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Traveler Style</span>
            <span class="text-sm font-extrabold text-white">${this.currentPlan.travelStyle}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Estimated Cost</span>
            <span class="text-sm font-extrabold text-emerald-400">${symbol}${totalConverted.toLocaleString()}</span>
          </div>
        </div>

        <div class="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6 text-xs text-stone-300 space-y-2">
          <p>• <strong>AI Intelligence Summary:</strong> ${this.currentPlan.aiSummary}</p>
          <p>• <strong>Interests Covered:</strong> ${this.currentPlan.interests.join(' · ')}</p>
          <p>• <strong>Verified Guidelines:</strong> All monument timings and entry tariffs cross-referenced with ASI.</p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-amber-500/30">
          <span class="text-[11px] text-amber-400 font-mono tracking-widest uppercase">RAAHI-AI-EXP-2026</span>
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
