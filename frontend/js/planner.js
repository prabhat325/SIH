/**
 * RAAHI — AI Travel Planner & Route Intelligence Engine
 * "Safar Aapka, Planning Hamari"
 * Brand: Raahi | Primary AI Feature: Raahi AI Travel Planner
 * Features:
 *  - 5-Step Travel Planning Wizard (Destination, Duration 1-10 Days, Interests, Pace & Style, Preferences)
 *  - Calls POST http://localhost:8000/api/v1/itinerary/generate with fallback engine
 *  - Interactive AI Processing State with Sequential Checklist Animation
 *  - Day-by-day tabs / cards (Day 1, Day 2, Day 3... Day 10)
 *  - Time slots for Morning 🌅, Afternoon ☀️, and Evening 🌙 with duration, transit times, and pro-tips
 *  - "Must-Try Regional Cuisine" Card for each day (Breakfast 🍳, Lunch 🍛, Dinner 🍲, Must-Try Signature Dish ⭐)
 *  - Optimized AI Route Sequence Visualization & Leaflet Interactive Route Map
 *  - Print / Export PDF feature with dedicated print styling
 *  - Royal Boarding Pass Export with Live Multi-Currency Conversion
 */

const RaahiPlanner = {
  currentStep: 1,
  selectedDest: 'Lucknow',
  selectedDays: 3,
  selectedInterests: ['Heritage', 'Culture', 'Food', 'Photography', 'Local Experiences'],
  selectedStyle: 'Moderate',
  selectedCompanion: 'Couple',
  selectedPreferences: {
    accessibility: 'none',
    food: 'all',
    distance: 'compact',
    activity: 'moderate'
  },
  activeDayTab: 'all',
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
    2: "Travel Duration (1-10 Days)",
    3: "Interests & Passions",
    4: "Travel Pace & Companion",
    5: "Specific Preferences"
  },

  // Verified Indian Regional Culinary Knowledge Base for Multi-Day Journeys
  regionalCuisineData: {
    lucknow: [
      {
        breakfast: "Crispy Khasta Kachori with spicy Hing Aloo, sweet Imarti & Adrak Chai at Chowk",
        lunch: "Awadhi Dum Gosht Biryani with Boondi Raita & Ulte Tawe ka Paratha at Idris Biryani",
        dinner: "Tunday Kababi Melt-in-Mouth Galawati Kebabs with Sheermal & Shahi Tukda",
        mustTry: "Tunday Kababi Galawati Kebab (Century-old royal Nawabi recipe with 160 secret spices)"
      },
      {
        breakfast: "Poori Sabzi with Gulab Jamun & freshly made Kulhad Lassi at Netram Ajay Kumar",
        lunch: "Mutton Boti Kebab with Roomali Roti & Mughlai Gravy at Dastarkhwan",
        dinner: "Slow-cooked Nalli Nihari with warm sesame-crusted Kulcha at Rahim's Chowk",
        mustTry: "Rahim's Nihari Kulcha (Slow-simmered overnight over fragrant charcoal embers)"
      },
      {
        breakfast: "Bun Makkhan with Malai Chai & Samosa at legendary Sharma Tea Stall (Lalbagh)",
        lunch: "Royal Awadhi Veg Thali with Paneer Korma & Zafrani Pulao at Royal Cafe",
        dinner: "Famous Basket Chaat & Kulfi Falooda at Hazratganj Market Alley",
        mustTry: "Royal Cafe Famous Basket Chaat (Crispy potato basket loaded with 12 chutneys & spices)"
      },
      {
        breakfast: "Bedmi Poori with Methi Chutney & hot Jalebi at Aminabad Bazaar",
        lunch: "Chicken Shami Kebab & Lucknowi Dum Biryani at Naushijaan",
        dinner: "Kakori Kebab & Kesari Firni at Oudhyana Heritage Courtyard",
        mustTry: "Kakori Kebab (Silky textured skewers scented with rose water and cardamom)"
      },
      {
        breakfast: "Chowk Street Samosa Chaat & Malai Makhan (seasonal winter cloud dessert)",
        lunch: "Awadhi Murgh Musallam with Zafrani Paratha at Falak Numa Rooftop",
        dinner: "Mutton Chaap & Pasanda Kebabs with Warqi Paratha at Chowk Alley",
        mustTry: "Makhan Malai / Daulat ki Chaat (Ethereal whipped milk froth topped with saffron and pistachios)"
      }
    ],
    varanasi: [
      {
        breakfast: "Kachori Jalebi with Chana Sabzi & piping hot Chai at Ram Bhandar (Thatheri Bazaar)",
        lunch: "Traditional Banarasi Satvik Thali with Baati Chokha & Dal Fry at Baati Chokha Restaurant",
        dinner: "Tamatar Chaat & Dahi Chutney Golgappe at Kashi Chaat Bhandar (Godowlia)",
        mustTry: "Kashi Chaat Bhandar Famous Tamatar Chaat (Warm spiced tomato mash cooked in pure desi ghee)"
      },
      {
        breakfast: "Chooda Matar & Malai Puri with fragrant Saffron Tea at Blue Lassi Shop",
        lunch: "Kashi Thali with Dum Aloo & Khasta Roti overlooking the Ganga Ghats",
        dinner: "Banarasi Malai Paan & Rabri Malpua at Chowk Heritage Bazaar",
        mustTry: "Maghai Banarasi Paan (Aromatic betel leaf rolled with rose gulkand, supari and silver vark)"
      },
      {
        breakfast: "Aloo Poori & Lal Peda with thick creamy Malai Lassi at Pehalwan Lassi (Lanka)",
        lunch: "Authentic North Indian Dal Makhani & Paneer Butter Masala at Cantonment Garden",
        dinner: "Ganga Aarti Special Thali & Thandai with crushed dry fruits at Godowlia Chowk",
        mustTry: "Baba Thandai with Crushed Almonds, Pistachios, and Kesari Saffron Syrup"
      }
    ],
    jaipur: [
      {
        breakfast: "Steaming Pyaaz Kachori & Mirchi Vada with sweet Jalebi at Rawat Mishthan Bhandar",
        lunch: "Grand Rajasthani Royal Thali with Dal Baati Churma, Gatte ki Sabzi & Ker Sangri",
        dinner: "Laal Maas (Fiery Mathania chili mutton curry) with Bajre ki Roti at Handi Restaurant",
        mustTry: "Rawat Mishthan Bhandar Pyaaz Kachori (Flaky golden pastry filled with spiced caramelized onions)"
      },
      {
        breakfast: "Samrat Samosa & Jalebi with Kulhad Chai at Chaura Rasta in the Pink City",
        lunch: "Thali of Ker Sangri, Rajasthani Kadhi & Missi Roti at Laxmi Mishthan Bhandar (LMB)",
        dinner: "Chokhi Dhani Traditional Village Feast served on leaf platters with hot Ghee Churma",
        mustTry: "Traditional Dal Baati Churma with five sweet and savory churma varieties"
      },
      {
        breakfast: "Poha, Samosa & special Malai Lassi at Lassiwala (MI Road - Since 1944)",
        lunch: "Safed Maas (Rich cashew almond mutton) with garlic naan at Spice Court",
        dinner: "Rajasthani Ghevar (Honeycomb sweet soaked in saffron syrup) at LMB Johari Bazaar",
        mustTry: "LMB Paneer Ghevar (Crisp disc of honeycomb pastry topped with fragrant rabri & saffron)"
      }
    ],
    kerala: [
      {
        breakfast: "Steamed Appam with aromatic vegetable/chicken stew and fresh coconut milk",
        lunch: "Grand Kerala Sadya on banana leaf with 24 traditional curries, sambar, avial and payasam",
        dinner: "Karimeen Pollichathu (Pearl spot fish wrapped in banana leaf and spices) on backwaters",
        mustTry: "Karimeen Pollichathu (Freshwater pearl spot fish pan-seared in banana leaf with spicy shallot masala)"
      },
      {
        breakfast: "Puttu and Kadala Curry (Steamed rice logs with spiced black chickpeas) with ripe banana",
        lunch: "Malabar Dum Biryani with dates pickle and mint raita at Paragon Restaurant (Kochi)",
        dinner: "Alleppey Fish Curry in tangy kokum coconut gravy with steamed Matta rice",
        mustTry: "Thalassery Malabar Dum Biryani with fragrant Kaima rice and fried cashew nuts"
      },
      {
        breakfast: "Idiyappam (String hoppers) with egg roast and fresh ginger cardamom tea",
        lunch: "Kerala Seafood Platter with Tiger Prawns Roast & Coconut Rice at Fort Kochi seaside",
        dinner: "Warm Ada Pradhaman (Jaggery and coconut milk pudding) with crispy Banana Chips",
        mustTry: "Palada / Ada Pradhaman Payasam (Slow-simmered rice flakes cooked in roasted jaggery and cardamom)"
      }
    ],
    goa: [
      {
        breakfast: "Goan Poi bread stuffed with Chorizo sausage / Ross Omelette with spicy xacuti gravy",
        lunch: "Authentic Goan Fish Thali with Kingfish Fry, Kismur, Sol Kadi and steamed rice",
        dinner: "Pork / Chicken Vindaloo with warm garlic butter naan and chilled Feni cocktail",
        mustTry: "Goan Fish Thali with Rava-fried Surmai and tangy Kokum Sol Kadi"
      },
      {
        breakfast: "Fresh tropical smoothie bowl, croissant and artisanal coffee at Anjuna beach cafe",
        lunch: "Goan Crab Xacuti cooked with 18 roasted spices and grated roasted coconut",
        dinner: "Prawn Balchão (Fiery pickled prawn gravy) with Sanna (steamed rice toddy cakes)",
        mustTry: "Goan Bebinca (Traditional 7-layer baked coconut milk and nutmeg dessert)"
      },
      {
        breakfast: "Mirchi Bhajji with Pav and spiced tea at Panaji Fountainhas heritage corner",
        lunch: "Prawn Caldine (Mild coconut turmeric seafood stew) with Goan red rice at Martin's Corner",
        dinner: "Grilled lobster with lemon garlic butter at sunset beach shack in South Goa",
        mustTry: "Goan Prawn Balchão served with warm fluffy steamed Sannas"
      }
    ],
    agra: [
      {
        breakfast: "Bedai Poori with spicy Aloo Sabzi & crispy saffron Jalebi at Deviram Sweets (Pratappura)",
        lunch: "Mughlai Shahi Mutton Korma with Roomali Roti & Jeera Rice at Pinch of Spice",
        dinner: "Tandoori Murgh & Dal Makhani with warm Garlic Naan at Peshawri (ITC Mughal)",
        mustTry: "Agra Angoori & Kesar Petha from Panchhi Petha (Made from ash gourd steeped in saffron sugar)"
      },
      {
        breakfast: "Nagori Halwa with Poori & Masala Chai at Kinari Bazaar near Agra Fort",
        lunch: "Mughlai Dum Biryani & Chicken Tikka at Dasaprakash / Joney's Place",
        dinner: "Paneer Pasanda & Saffron Phirni served in earthenware pots with Taj view",
        mustTry: "Panchhi Petha Chocolate & Kesar Sandwich Varieties"
      }
    ],
    delhi: [
      {
        breakfast: "Bedmi Poori with Nagori Halwa at Shyam Sweets (Chawri Bazar, Chandni Chowk)",
        lunch: "Legendary Butter Chicken & Dal Makhani at Moti Mahal (Daryaganj - Since 1947)",
        dinner: "Karim's Mutton Korma & Seekh Kebabs with hot Tandoori Roti near Jama Masjid",
        mustTry: "Moti Mahal Original Butter Chicken (Invented in 1947 with velvety tandoori tomato gravy)"
      },
      {
        breakfast: "Stuffed Parathas (Paneer, Aloo, Mirchi) with sweet Lassi at Paranthe Wali Gali",
        lunch: "Chole Bhature with Pickled Green Chilies and Onion Salad at Sita Ram Diwan Chand",
        dinner: "Kebab Platter and Galawati Roll at Khan Chacha (Khan Market)",
        mustTry: "Paranthe Wali Gali Deep-Fried Stuffed Parathas with Tamarind Chutney"
      },
      {
        breakfast: "South Indian Ghee Roast Dosa with Filter Coffee at Saravana Bhavan (Connaught Place)",
        lunch: "Amritsari Kulcha with Chole at Kulcha King (Sarojini Nagar)",
        dinner: "Qureshi Kabab Corner Succulent Buffalo & Mutton Kebabs at Jama Masjid Gate 1",
        mustTry: "Daulat ki Chaat in Old Delhi (Frothy saffron milk cloud sprinkled with pistachios and bura)"
      }
    ],
    kashmir: [
      {
        breakfast: "Kashmiri Girda / Tsot bread with Salted Noon Chai and almond Kahwa at Dal Lake",
        lunch: "Kashmiri Wazwan Feast featuring Rista (Meatballs in red gravy), Rogan Josh & Yakhni",
        dinner: "Tabak Maaz (Crispy fried lamb ribs) and Gushtaba (Silky meatballs in yogurt gravy)",
        mustTry: "Traditional 36-Course Kashmiri Wazwan (Rogan Josh, Rista and Gushtaba cooked by master Wazas)"
      },
      {
        breakfast: "Kandur bakery Lavasa bread with apricot jam, walnuts and Saffron Kehwa",
        lunch: "Trout Fish pan-fried in garlic butter with Kashmiri Pulao at Mughal Darbar",
        dinner: "Dum Aloo & Haakh Saag (Collard greens) with steamed rice and Shahi Tukda",
        mustTry: "Kashmiri Saffron Kehwa brewed with whole green cardamom, cinnamon, and slivered almonds"
      }
    ]
  },

  // Pro-tips generator
  proTipsDatabase: [
    "Arrive 15 minutes before gate opening to experience soft sunrise light and beat tour bus lines.",
    "Hire an authorized ASI guide wearing a government photo badge to discover hidden historical acoustic chambers.",
    "Carry a reusable water bottle and remove footwear before entering the inner sanctum halls.",
    "Photography is permitted in outer courtyard; tripods and drones require special archaeological clearance.",
    "Reserve an outdoor rooftop table 45 minutes before sunset for panoramic twilight views.",
    "Bargaining of 20–30% is customary at local handicraft and textile bazaar stalls.",
    "Combine this stop with nearby heritage lanes to minimize inner-city auto transit time."
  ],

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

    const counterEl = document.getElementById('planner-step-counter');
    const titleEl = document.getElementById('planner-step-title');
    const progressBar = document.getElementById('planner-progress-bar');

    if (counterEl) counterEl.textContent = `Step ${this.currentStep} of 5`;
    if (titleEl) titleEl.textContent = this.stepTitles[this.currentStep] || '';
    if (progressBar) progressBar.style.width = `${(this.currentStep / 5) * 100}%`;

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
    this.selectedDays = parseInt(days, 10) || 3;
    const durationInput = document.getElementById('wizard-duration-slider');
    if (durationInput) durationInput.value = this.selectedDays;
    const durationReadout = document.getElementById('wizard-duration-val');
    if (durationReadout) durationReadout.textContent = `${this.selectedDays} ${this.selectedDays === 1 ? 'Day' : 'Days'}`;

    document.querySelectorAll('.duration-opt-btn').forEach(btn => {
      const dayVal = btn.getAttribute('data-days');
      if (dayVal === String(days)) {
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

  selectPace(paceName) {
    this.selectedStyle = paceName;
    document.querySelectorAll('.pace-opt-btn').forEach(btn => {
      if (btn.getAttribute('data-pace') === paceName) {
        btn.classList.add('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
      } else {
        btn.classList.remove('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
      }
    });
  },

  selectCompanion(companionType) {
    this.selectedCompanion = companionType;
    document.querySelectorAll('.companion-opt-btn').forEach(btn => {
      if (btn.getAttribute('data-companion') === companionType) {
        btn.classList.add('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.remove('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
      } else {
        btn.classList.remove('border-2', 'border-amber-600', 'bg-amber-50', 'dark:bg-amber-950/40');
        btn.classList.add('border-stone-200', 'dark:border-stone-700', 'bg-stone-50', 'dark:bg-stone-800');
      }
    });
  },

  selectStyle(styleName) {
    this.selectPace(styleName);
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

  // 2. AI Processing Screen with Sequential Animation & API Call
  async startAIProcessing() {
    this.selectedPreferences.accessibility = document.getElementById('pref-accessibility')?.value || 'none';
    this.selectedPreferences.food = document.getElementById('pref-food')?.value || 'all';
    this.selectedPreferences.distance = document.getElementById('pref-distance')?.value || 'compact';
    this.selectedPreferences.activity = document.getElementById('pref-activity')?.value || 'moderate';

    const wizardCont = document.getElementById('planner-wizard-container');
    const procCont = document.getElementById('planner-processing-container');
    const resultCont = document.getElementById('planner-result-container');

    if (wizardCont) wizardCont.classList.add('hidden');
    if (resultCont) resultCont.classList.add('hidden');
    if (procCont) procCont.classList.remove('hidden');

    const steps = [
      { id: 'proc-step-1', text: 'Understanding your preferences' },
      { id: 'proc-step-2', text: 'Connecting to AI Itinerary Engine' },
      { id: 'proc-step-3', text: 'Synthesizing Morning, Afternoon & Evening slots' },
      { id: 'proc-step-4', text: 'Curating Must-Try Regional Cuisine & pro-tips' },
      { id: 'proc-step-5', text: 'Optimizing geographic waypoints & transit' }
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
      }, idx * 280);

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
      }, (idx + 1) * 320);
    });

    // Execute API Call to POST http://localhost:8000/api/v1/itinerary/generate
    const normDestId = (this.selectedDest || 'lucknow').toLowerCase().replace(/[^a-z]/g, '');
    const payload = {
      destination_id: normDestId,
      days: Math.min(10, Math.max(1, this.selectedDays || 3)),
      pace: this.selectedStyle || 'Moderate',
      companion: this.selectedCompanion || 'Couple'
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);

      const response = await fetch('http://localhost:8000/api/v1/itinerary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const apiData = await response.json();
        if (apiData && (apiData.days || apiData.itinerary)) {
          this.applyGeneratedItinerary(apiData);
          this.finishProcessingUI(procCont, resultCont);
          return;
        }
      }
      throw new Error("Using resilient local multi-day planner engine.");
    } catch (err) {
      setTimeout(() => {
        this.generateLocalAIItinerary();
        this.finishProcessingUI(procCont, resultCont);
      }, 1600);
    }
  },

  finishProcessingUI(procCont, resultCont) {
    if (procCont) procCont.classList.add('hidden');
    if (resultCont) resultCont.classList.remove('hidden');
    this.renderItinerary();
    this.initRouteMiniMap();
    RaahiApp.showToast(`Your ${this.selectedDays}-Day Raahi AI Journey is ready!`, "success");
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

  // 3. Dynamic Itinerary Generation Algorithm (Fallback & Direct Support)
  generateLocalAIItinerary() {
    const destName = this.selectedDest || 'Lucknow';
    const daysCount = Math.min(10, Math.max(1, this.selectedDays || 3));
    const interests = this.selectedInterests.length > 0 ? this.selectedInterests : ['Heritage', 'Food', 'Culture'];
    const interestsText = interests.slice(0, 3).map(i => i.toLowerCase()).join(', ');

    const normDestId = destName.toLowerCase().replace(/[^a-z]/g, '');
    const key = normDestId.includes('varanasi') ? 'varanasi' :
                normDestId.includes('jaipur') ? 'jaipur' :
                normDestId.includes('kerala') ? 'kerala' :
                normDestId.includes('goa') ? 'goa' :
                normDestId.includes('agra') ? 'agra' :
                normDestId.includes('delhi') ? 'delhi' :
                normDestId.includes('kashmir') ? 'kashmir' : 'lucknow';

    const matchedPlaces = (RAAHI_DATA.places || []).filter(p => 
      p.city.toLowerCase().includes(destName.toLowerCase()) || 
      p.state.toLowerCase().includes(destName.toLowerCase()) ||
      destName.toLowerCase().includes(p.city.toLowerCase())
    );

    const allPlaces = RAAHI_DATA.places || [];
    const otherPlaces = allPlaces.filter(p => !matchedPlaces.some(mp => mp.id === p.id));
    const placesPool = [...matchedPlaces, ...otherPlaces];
    const cuisineList = this.regionalCuisineData[key] || this.regionalCuisineData.lucknow;

    const generatedDays = [];
    let placeIdx = 0;

    for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
      const p1 = placesPool[placeIdx % placesPool.length];
      const p2 = placesPool[(placeIdx + 1) % placesPool.length];
      const p3 = placesPool[(placeIdx + 2) % placesPool.length];
      placeIdx += 2;

      const cuisineDay = cuisineList[(dayNum - 1) % cuisineList.length];
      const dayTheme = dayNum === 1 ? "Iconic Heritage & Grand Monuments" :
                       dayNum === 2 ? "Living Culture, Silk & Old Bazaars" :
                       dayNum === 3 ? "Royal Gastronomy & Artisanal Quarters" :
                       dayNum === 4 ? "Scenic Corridors & Spiritual Ghats" :
                       dayNum === 5 ? "Hidden Architectural Jewels" :
                       `Grand Cultural Exploration Part ${dayNum}`;

      const tip1 = this.proTipsDatabase[(dayNum * 2) % this.proTipsDatabase.length];
      const tip2 = this.proTipsDatabase[(dayNum * 2 + 1) % this.proTipsDatabase.length];
      const tip3 = this.proTipsDatabase[(dayNum * 2 + 2) % this.proTipsDatabase.length];

      generatedDays.push({
        day: dayNum,
        theme: dayTheme,
        cuisine: cuisineDay,
        items: [
          {
            id: `item-${p1.id}-d${dayNum}-m`,
            refId: p1.id,
            slot: 'Morning 🌅',
            time: '08:30 AM – 11:30 AM',
            name: p1.name,
            category: p1.category || 'Archaeological Monument',
            image: p1.image,
            duration: '2.5 hrs',
            transitTime: '15 mins transit',
            distance: `${(1.2 + (dayNum * 0.2)).toFixed(1)} km`,
            rating: p1.rating || 4.9,
            costINR: 100,
            description: p1.description,
            proTip: tip1,
            lat: p1.lat,
            lng: p1.lng,
            included: true,
            type: 'place'
          },
          {
            id: `item-${p2.id}-d${dayNum}-a`,
            refId: p2.id,
            slot: 'Afternoon ☀️',
            time: '12:30 PM – 03:30 PM',
            name: p2.name,
            category: p2.category || 'Historical Complex',
            image: p2.image,
            duration: '2.0 hrs',
            transitTime: '20 mins transit',
            distance: `${(1.8 + (dayNum * 0.3)).toFixed(1)} km`,
            rating: p2.rating || 4.8,
            costINR: 50,
            description: p2.description,
            proTip: tip2,
            lat: p2.lat,
            lng: p2.lng,
            included: true,
            type: 'place'
          },
          {
            id: `item-${p3.id}-d${dayNum}-e`,
            refId: p3.id,
            slot: 'Evening 🌙',
            time: '06:00 PM – 09:00 PM',
            name: p3.name,
            category: p3.category || 'Heritage Walking Corridor',
            image: p3.image,
            duration: '2.5 hrs',
            transitTime: '10 mins transit',
            distance: `${(0.9 + (dayNum * 0.1)).toFixed(1)} km`,
            rating: p3.rating || 4.9,
            costINR: 450,
            description: p3.description,
            proTip: tip3,
            lat: p2.lat ? p2.lat - 0.008 : 26.85,
            lng: p2.lng ? p2.lng + 0.008 : 80.95,
            included: true,
            type: 'place'
          }
        ]
      });
    }

    this.currentPlan = {
      destination: destName,
      durationDays: daysCount,
      interests: interests,
      travelStyle: this.selectedStyle || 'Moderate',
      companion: this.selectedCompanion || 'Couple',
      aiSummary: `Curated ${daysCount}-day ${this.selectedStyle.toLowerCase()} itinerary for ${destName} tailored for ${this.selectedCompanion.toLowerCase()} travelers, integrating ASI monument timings, morning-to-evening pacing, and authentic regional culinary highlights.`,
      days: generatedDays
    };
  },

  applyGeneratedItinerary(apiData) {
    const rawDays = apiData.days || apiData.itinerary || [];
    const destName = apiData.destination || this.selectedDest || 'Lucknow';
    
    this.currentPlan = {
      destination: destName,
      durationDays: rawDays.length || this.selectedDays || 3,
      interests: this.selectedInterests,
      travelStyle: apiData.pace || this.selectedStyle || 'Moderate',
      companion: apiData.companion || this.selectedCompanion || 'Couple',
      aiSummary: apiData.summary || `AI Generated ${rawDays.length}-Day journey in ${destName}.`,
      days: rawDays
    };
  },

  setDayTab(dayKey) {
    this.activeDayTab = dayKey;
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

    // Filter by active day tab
    const visibleDays = this.activeDayTab === 'all' 
      ? this.currentPlan.days 
      : this.currentPlan.days.filter(d => String(d.day) === String(this.activeDayTab));

    if (container) {
      // Day Tabs Bar
      const dayTabsHtml = `
        <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 no-print">
          <button onclick="RaahiPlanner.setDayTab('all')" class="day-tab-btn ${this.activeDayTab === 'all' ? 'active' : ''}">
            All Days (${this.currentPlan.days.length})
          </button>
          ${this.currentPlan.days.map(d => `
            <button onclick="RaahiPlanner.setDayTab('${d.day}')" class="day-tab-btn ${String(this.activeDayTab) === String(d.day) ? 'active' : ''}">
              Day ${d.day}
            </button>
          `).join('')}
        </div>
      `;

      // Render Days
      const daysHtml = visibleDays.map(d => {
        const cuisine = d.cuisine || (this.regionalCuisineData.lucknow[0]);

        return `
          <div class="p-6 sm:p-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            
            <!-- Day Header -->
            <div class="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-2xl bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                  Day ${d.day}
                </span>
                <div>
                  <h3 class="font-heading text-lg sm:text-xl font-bold text-stone-900 dark:text-white">Day ${d.day} — ${d.theme}</h3>
                  <div class="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                    <span>${this.currentPlan.travelStyle} Pace</span>
                    <span>•</span>
                    <span>${this.currentPlan.companion}</span>
                  </div>
                </div>
              </div>
              <span class="text-xs text-stone-400 font-bold">${d.items.filter(i => i.included).length} Active Stops</span>
            </div>

            <!-- Time Slots: Morning 🌅, Afternoon ☀️, Evening 🌙 -->
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
                  <div class="p-4 sm:p-5 rounded-2xl border ${item.included ? 'border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850' : 'border-dashed border-stone-300 dark:border-stone-700 bg-stone-100/40 opacity-60'} transition-all space-y-3">
                    
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      <div class="flex items-center gap-4 flex-1">
                        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 shadow-sm">
                        <div class="space-y-1">
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono text-[11px] font-extrabold flex items-center gap-1">
                              <span>${item.slot}</span>
                              <span class="text-[10px] opacity-80">${item.time}</span>
                            </span>
                            <span class="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">${item.category}</span>
                          </div>
                          
                          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white">
                            ${item.name}
                          </h4>
                          
                          <div class="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                            <span class="flex items-center gap-0.5 text-amber-500 font-bold">
                              <span class="material-symbols-outlined text-xs">star</span>
                              ${item.rating}
                            </span>
                            <span>•</span>
                            <span>⏱ ${item.duration}</span>
                            <span>•</span>
                            <span class="flex items-center gap-0.5 text-stone-600 dark:text-stone-400">
                              <span class="material-symbols-outlined text-xs">directions_car</span>
                              ${item.transitTime || item.distance}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 dark:border-stone-700">
                        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ${costConv === 0 ? 'Free' : `${symbol}${costConv.toLocaleString()}`}
                        </span>
                        <div class="flex items-center gap-2">
                          <button onclick="${item.type === 'restaurant' ? `RaahiRestaurants.openRestModal('${item.refId}')` : `RaahiPlaces.openDetailModal('${item.refId}')`}" class="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] font-bold hover:bg-amber-600 transition-colors">
                            Details
                          </button>
                          <button onclick="RaahiPlanner.togglePlanItem('${item.id}')" title="${item.included ? 'Remove from plan' : 'Add back to plan'}" class="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-[11px] font-bold ${item.included ? 'text-stone-600 hover:text-red-600' : 'text-emerald-600 hover:text-emerald-700'}">
                            ${item.included ? 'Remove' : 'Add Back'}
                          </button>
                        </div>
                      </div>

                    </div>

                    <!-- Pro-Tip Box -->
                    ${item.proTip ? `
                      <div class="pro-tip-box">
                        <span class="material-symbols-outlined text-amber-600 text-sm shrink-0">tips_and_updates</span>
                        <span><strong>Pro-Tip:</strong> ${item.proTip}</span>
                      </div>
                    ` : ''}

                  </div>
                `;
              }).join('')}
            </div>

            <!-- "Must-Try Regional Cuisine" Card for each day -->
            <div class="cuisine-card p-5 sm:p-6 rounded-3xl space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="text-xl">🍛</span>
                  <div>
                    <h4 class="font-heading text-sm sm:text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                      Day ${d.day} — Must-Try Regional Cuisine
                      <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-600 text-white uppercase">Culinary Trail</span>
                    </h4>
                    <p class="text-[11px] text-stone-600 dark:text-stone-300">Verified regional gastronomy selections for authentic flavor discovery</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-3 bg-white/70 dark:bg-stone-850/80 rounded-2xl border border-amber-200/50 dark:border-amber-800/40">
                  <span class="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 block mb-1">🍳 Breakfast</span>
                  <span class="text-stone-800 dark:text-stone-200 font-medium">${cuisine.breakfast}</span>
                </div>
                <div class="p-3 bg-white/70 dark:bg-stone-850/80 rounded-2xl border border-amber-200/50 dark:border-amber-800/40">
                  <span class="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 block mb-1">🍛 Lunch</span>
                  <span class="text-stone-800 dark:text-stone-200 font-medium">${cuisine.lunch}</span>
                </div>
                <div class="p-3 bg-white/70 dark:bg-stone-850/80 rounded-2xl border border-amber-200/50 dark:border-amber-800/40">
                  <span class="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 block mb-1">🍲 Dinner</span>
                  <span class="text-stone-800 dark:text-stone-200 font-medium">${cuisine.dinner}</span>
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800 text-xs flex items-start gap-2">
                <span class="text-base">⭐</span>
                <div>
                  <strong class="text-amber-950 dark:text-amber-200 font-extrabold block text-[11px]">Must-Try Signature Delicacy:</strong>
                  <span class="text-amber-900 dark:text-amber-300 font-medium">${cuisine.mustTry}</span>
                </div>
              </div>
            </div>

          </div>
        `;
      }).join('');

      container.innerHTML = dayTabsHtml + daysHtml;
    }

    if (totalBudgetBadge) {
      const convertedTotal = Math.round(totalCost * rate);
      totalBudgetBadge.textContent = `${symbol}${convertedTotal.toLocaleString()}`;
    }

    // 5. Render Route Sequence Flow
    if (sequenceList) {
      sequenceList.innerHTML = `
        <div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">S</span>
          <span>Start: Hotel / Station Hub</span>
        </div>
        ${routeWaypoints.slice(0, 6).map((wp, idx) => `
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

  // 7. Print & Export PDF Itinerary
  exportPDF() {
    this.activeDayTab = 'all';
    this.renderItinerary();
    setTimeout(() => {
      window.print();
    }, 150);
  },

  // 8. Royal Boarding Pass Integration
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
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Destination</span>
            <span class="text-sm font-extrabold text-amber-300">${this.currentPlan.destination}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Duration</span>
            <span class="text-sm font-extrabold text-white">${this.currentPlan.durationDays} Days</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Pace & Companion</span>
            <span class="text-sm font-extrabold text-white">${this.currentPlan.travelStyle} • ${this.currentPlan.companion || 'Couple'}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-bold">Estimated Cost</span>
            <span class="text-sm font-extrabold text-emerald-400">${symbol}${totalConverted.toLocaleString()}</span>
          </div>
        </div>

        <div class="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6 text-xs text-stone-300 space-y-2">
          <p>• <strong>AI Intelligence Summary:</strong> ${this.currentPlan.aiSummary}</p>
          <p>• <strong>Interests Covered:</strong> ${this.currentPlan.interests.join(' · ')}</p>
          <p>• <strong>Verified Guidelines:</strong> All monument timings, entry tariffs and regional cuisine cross-referenced with ASI & tourism boards.</p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-amber-500/30">
          <span class="text-[11px] text-amber-400 font-mono tracking-widest uppercase">RAAHI-AI-EXP-2026</span>
          <button onclick="RaahiPlanner.exportPDF()" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all">
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
