/**
 * RAAHI — Verified Tourist Transport & Vehicles Module
 * Features:
 * - Certified Tourist Cabs, EV Rentals, Self-Drive SUVs, Tempo Coaches, and Heritage Rickshaws
 * - City filter & category tabs
 * - Direct Operator Desk Hotline, WhatsApp Contact, Verified RTO permit info
 * - Zero Booking Clutter / Discovery-First Travel Guidelines
 */

const RaahiVehicles = {
  activeCategory: 'all', // 'all' | 'cab' | 'ev' | 'rental' | 'tempo' | 'heritage'
  selectedCity: 'all',
  vehicles: [],

  init() {
    this.vehicles = RAAHI_DATA.vehicles || this.getDefaultVehicles();
    this.renderVehicles();
    this.bindEvents();
  },

  getDefaultVehicles() {
    return [
      {
        id: "veh-1",
        name: "Toyota Innova Crysta (Luxury 7-Seater)",
        category: "cab",
        categoryLabel: "Outstation & Airport Cab",
        city: "lucknow",
        cityName: "Lucknow",
        capacity: "6 Passengers + 1 Driver",
        fuelType: "Diesel • AC",
        rating: 4.9,
        tripsCount: 342,
        verifiedBadge: "Ministry of Tourism Certified Driver",
        pricePerDay: "₹3,200/day",
        ratePerKm: "₹14/km (Includes Toll & Tax)",
        features: ["Clean sanitized cabin", "GPS Live Tracked", "English/Hindi Speaking Driver", "Luggage Carrier"],
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        operator: "Awadh Heritage Chauffeurs",
        phone: "+91 522 2894100",
        whatsapp: "+91 94150 12345",
        rtoLicense: "UP-32-COMM-TOUR-8941",
        pickupLocations: "Chaudhary Charan Singh Airport, Charbagh Junction, Hazratganj Hotels",
        fareRules: {
          basePackage: "8 Hours / 80 Kms package @ ₹3,200",
          extraKm: "₹14/km after 80 kms",
          driverAllowance: "₹300 night charge (post 10 PM)",
          tollTax: "FastTag tolls included in outstation package"
        }
      },
      {
        id: "veh-2",
        name: "Tata Nexon EV Max (Eco Green Cab)",
        category: "ev",
        categoryLabel: "Zero-Emission Electric",
        city: "lucknow",
        cityName: "Lucknow",
        capacity: "4 Passengers",
        fuelType: "100% Electric • Zero Emission",
        rating: 4.8,
        tripsCount: 215,
        verifiedBadge: "Green Tourism Initiative",
        pricePerDay: "₹2,400/day",
        ratePerKm: "₹11/km (City Sightseeing)",
        features: ["Silent Electric Ride", "Free In-Car Fast Charging", "Panoramic Sunroof", "Automated Climate Control"],
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        operator: "EcoRaahi Green Fleet Desk",
        phone: "+91 522 2981200",
        whatsapp: "+91 98390 55443",
        rtoLicense: "UP-32-EV-GREEN-2981",
        pickupLocations: "Airport Terminal 3, Gomti Nagar, Alambagh Metro",
        fareRules: {
          basePackage: "Full Day City Sightseeing (8 hrs / 70 kms) @ ₹2,400",
          extraKm: "₹11/km for additional intra-city travel",
          driverAllowance: "Nil for day rides",
          tollTax: "Green vehicle toll discounts applied"
        }
      },
      {
        id: "veh-3",
        name: "Mahindra Thar 4x4 (Self-Drive Expedition)",
        category: "rental",
        categoryLabel: "Self-Drive SUV",
        city: "jaipur",
        cityName: "Jaipur",
        capacity: "4 Passengers",
        fuelType: "Diesel 4x4 • Manual/Auto",
        rating: 4.9,
        tripsCount: 180,
        verifiedBadge: "Verified RTO Self-Drive Permit",
        pricePerDay: "₹4,500/day",
        ratePerKm: "Unlimited Kms Included",
        features: ["Convertible Soft-top", "All-Terrain 4WD", "Comprehensive Insurance Included", "Roadside SOS Assist"],
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        operator: "Royal Rajputana Drive Hub",
        phone: "+91 141 2789123",
        whatsapp: "+91 98290 14123",
        rtoLicense: "RJ-14-SELFDRIVE-7781",
        pickupLocations: "Jaipur International Airport, MI Road, Sindhi Camp",
        fareRules: {
          basePackage: "24-Hour Rental @ ₹4,500 (Zero security deposit with Aadhaar)",
          extraKm: "Unlimited kilometres across Rajasthan",
          driverAllowance: "Self-drive (Valid driving licence mandatory)",
          tollTax: "FastTag on-board with digital recharge"
        }
      },
      {
        id: "veh-4",
        name: "Force Urbania Luxury Coach (17-Seater)",
        category: "tempo",
        categoryLabel: "Family & Group Coach",
        city: "varanasi",
        cityName: "Varanasi",
        capacity: "16 Passengers + 1 Guide",
        fuelType: "Diesel • Dual AC",
        rating: 4.9,
        tripsCount: 420,
        verifiedBadge: "ASI & UP Tourism Authorized",
        pricePerDay: "₹6,800/day",
        ratePerKm: "₹22/km (Intercity Pilgrim Tour)",
        features: ["Reclining Push-back Seats", "PA Audio System for Guide", "Individual USB Chargers", "Spacious Luggage Trunk"],
        image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
        operator: "Kashi Yatra Heritage Fleet Desk",
        phone: "+91 542 2459900",
        whatsapp: "+91 94500 88990",
        rtoLicense: "UP-65-TOURIST-BUS-4599",
        pickupLocations: "Varanasi Cantt Station, Babatpur Airport, Godowlia Hub",
        fareRules: {
          basePackage: "Varanasi-Sarnath Temple Circuit (10 hrs) @ ₹6,800",
          extraKm: "₹22/km for Ayodhya / Prayagraj extension",
          driverAllowance: "₹500 helper & driver allowance",
          tollTax: "State pilgrim tourist tax covered"
        }
      },
      {
        id: "veh-5",
        name: "Royal Awadhi Heritage Tuk-Tuk & E-Rickshaw",
        category: "heritage",
        categoryLabel: "Heritage Food & Old City Tour",
        city: "lucknow",
        cityName: "Lucknow",
        capacity: "3 Passengers",
        fuelType: "Electric Eco-Mobility",
        rating: 4.9,
        tripsCount: 560,
        verifiedBadge: "Certified Heritage Storyteller Driver",
        pricePerDay: "₹900/4-Hour Tour",
        ratePerKm: "Fixed Route Old Chowk Heritage",
        features: ["Navigates historic narrow food alleys", "Local street food stops included", "Traditional Awadhi decor", "Photo stops at Rumi Darwaza"],
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        operator: "Chowk Heritage Rickshaw Guild Desk",
        phone: "+91 522 2618822",
        whatsapp: "+91 94155 61882",
        rtoLicense: "UP-32-ECO-E-RICK-2618",
        pickupLocations: "Bara Imambara Gate, Clock Tower, Aminabad Old Gate",
        fareRules: {
          basePackage: "4-Hour Food & Heritage Circuit @ ₹900 fixed",
          extraKm: "₹150 per extra hour beyond scheduled tour",
          driverAllowance: "Tips customary for local storytelling",
          tollTax: "Zero toll entry into Old City heritage zones"
        }
      },
      {
        id: "veh-6",
        name: "Maruti Dzire Sedan (Airport & City Express)",
        category: "cab",
        categoryLabel: "Affordable City Sedan",
        city: "agra",
        cityName: "Agra",
        capacity: "4 Passengers",
        fuelType: "CNG / Petrol • AC",
        rating: 4.7,
        tripsCount: 890,
        verifiedBadge: "FastTag & Taj Corridor Approved",
        pricePerDay: "₹2,100/day",
        ratePerKm: "₹12/km (Agra & Fatehpur Sikri)",
        features: ["Instant Pick-up at Agra Cantt", "Cool Mineral Water & Mints", "Trained Tourism Chauffeur", "Digital Receipt"],
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
        operator: "Taj City Chauffeur Helpdesk",
        phone: "+91 562 2334455",
        whatsapp: "+91 97600 33445",
        rtoLicense: "UP-80-TAJ-CAB-2334",
        pickupLocations: "Agra Cantt Railway Station, Taj East Gate, Fatehabad Road Hotels",
        fareRules: {
          basePackage: "Agra Fort & Taj Mahal Same Day Tour (8 hrs) @ ₹2,100",
          extraKm: "₹12/km for Fatehpur Sikri excursion",
          driverAllowance: "₹250 post 9 PM",
          tollTax: "Taj Expressway toll paid at toll gate"
        }
      },
      {
        id: "veh-7",
        name: "Royal Enfield Classic 350 (Bike Rental)",
        category: "rental",
        categoryLabel: "Heritage Cruiser Motorcycle",
        city: "goa",
        cityName: "Goa",
        capacity: "2 Riders",
        fuelType: "Petrol 350cc",
        rating: 4.9,
        tripsCount: 710,
        verifiedBadge: "Helmet & Insurance Provided",
        pricePerDay: "₹900/day",
        ratePerKm: "Unlimited Mileage",
        features: ["2 ISI Certified Helmets", "Mobile Phone Mount & Charger", "24x7 Puncture & Fuel Assist", "Coastal Route Map"],
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
        operator: "Goa Coastal Riders Dispatch",
        phone: "+91 832 2456789",
        whatsapp: "+91 98221 45678",
        rtoLicense: "GA-03-BIKE-RENTAL-8890",
        pickupLocations: "Mopa Airport (GOX), Dabolim Airport, Panjim Hub, Calangute",
        fareRules: {
          basePackage: "24-Hour Rental @ ₹900 (Valid 2-wheeler licence required)",
          extraKm: "Unlimited kilometres across North & South Goa",
          driverAllowance: "Self-ride motorcycle",
          tollTax: "Mandovi Bridge and state tolls applicable"
        }
      },
      {
        id: "veh-8",
        name: "Mercedes-Benz E-Class (VIP Chauffeur)",
        category: "cab",
        categoryLabel: "Executive Luxury Chauffeur",
        city: "delhi",
        cityName: "Delhi",
        capacity: "3 Passengers",
        fuelType: "Luxury Sedan • AC",
        rating: 5.0,
        tripsCount: 145,
        verifiedBadge: "Diplomatic & VIP Protocol Certified",
        pricePerDay: "₹8,500/day",
        ratePerKm: "₹45/extra km (8 hrs / 80 kms)",
        features: ["Uniformed Chauffeur", "Wi-Fi Hotspot on board", "Leather seating with massage", "Chilled beverages & sanitizers"],
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
        operator: "Imperial Capital Limousine Concierge",
        phone: "+91 11 41556677",
        whatsapp: "+91 98110 41556",
        rtoLicense: "DL-1-VIP-CHAUFFEUR-4155",
        pickupLocations: "IGI Airport Terminal 3, Lutyens Delhi, Aerocity Hotels",
        fareRules: {
          basePackage: "8 Hours / 80 Kms Diplomatic Class package @ ₹8,500",
          extraKm: "₹45/km after 80 kms",
          driverAllowance: "Night driver allowance ₹500",
          tollTax: "MCD entry and airport commercial parking included"
        }
      }
    ];
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const catBtn = e.target.closest('.vehicle-filter-btn');
      if (catBtn) {
        const cat = catBtn.getAttribute('data-cat');
        if (cat) {
          this.setCategory(cat);
        }
      }
    });
  },

  setCategory(cat) {
    this.activeCategory = cat;
    document.querySelectorAll('.vehicle-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-cat') === cat) {
        btn.className = 'vehicle-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-md transition-all cursor-pointer';
      } else {
        btn.className = 'vehicle-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer';
      }
    });
    this.renderVehicles();
  },

  filterByCity(city) {
    this.selectedCity = city || 'all';
    this.renderVehicles();
  },

  renderVehicles() {
    const container = document.getElementById('vehicles-grid-container');
    if (!container) return;

    let list = this.vehicles;

    if (this.activeCategory !== 'all') {
      list = list.filter(v => v.category === this.activeCategory);
    }

    if (this.selectedCity !== 'all') {
      const normCity = this.selectedCity.toLowerCase();
      list = list.filter(v => v.city.toLowerCase() === normCity);
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-stone-500 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <span class="material-symbols-outlined text-5xl text-amber-500 mb-3 block">directions_car</span>
          <h3 class="font-heading text-lg font-bold text-stone-800 dark:text-stone-200">No vehicles matching this filter</h3>
          <p class="text-xs text-stone-500 mt-1">Try switching categories or view all verified transport options.</p>
          <button onclick="RaahiVehicles.setCategory('all')" class="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700">View All Vehicles</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const cleanPhone = item.phone.replace(/[\s\-\+]/g, '');
      const cleanWhatsapp = (item.whatsapp || item.phone).replace(/[\s\-\+]/g, '');
      
      return `
      <div class="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/60 dark:hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group">
        
        <div>
          <!-- Image & Badges -->
          <div class="relative h-52 overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            
            <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/75 backdrop-blur-md text-amber-400 border border-amber-400/40">
                ${item.categoryLabel}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-md flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">verified</span>
                <span>${item.cityName}</span>
              </span>
            </div>

            <div class="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-extrabold flex items-center gap-1">
              <span class="text-amber-400">★</span>
              <span>${item.rating}</span>
              <span class="text-[10px] text-stone-400 font-normal">(${item.tripsCount} trips)</span>
            </div>
          </div>

          <!-- Content Details -->
          <div class="p-6 space-y-3">
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1 truncate">
                  <span class="material-symbols-outlined text-xs text-amber-500">storefront</span>
                  <span class="truncate">${item.operator}</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 shrink-0">
                  Govt RTO Verified
                </span>
              </div>

              <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                ${item.name}
              </h3>
            </div>

            <div class="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 font-medium">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-amber-500">group</span>
                <span>${item.capacity}</span>
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-cyan-500">local_gas_station</span>
                <span>${item.fuelType}</span>
              </span>
            </div>

            <!-- Features List -->
            <div class="pt-1 flex flex-wrap gap-1.5">
              ${item.features.map(f => `
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60">
                  ✓ ${f}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer / Contact Actions -->
        <div class="p-6 pt-0 space-y-3">
          <div class="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-stone-400 block font-medium">Standard Tariff</span>
              <span class="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">${item.pricePerDay}</span>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-stone-400 block font-medium">Extra Kms</span>
              <span class="text-xs font-bold text-stone-700 dark:text-stone-300">${item.ratePerKm.split(' ')[0]}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <a href="tel:${item.phone.replace(/\s+/g, '')}" class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95">
              <span class="material-symbols-outlined text-sm">call</span>
              <span class="truncate">Call Desk</span>
            </a>

            <button onclick="RaahiVehicles.openInfoModal('${item.id}')" class="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <span class="material-symbols-outlined text-sm text-amber-500">info</span>
              <span>Tariff &amp; Info</span>
            </button>
          </div>
        </div>

      </div>
    `;
    }).join('');
  },

  openInfoModal(vehicleId) {
    const item = this.vehicles.find(v => v.id === vehicleId) || this.getDefaultVehicles().find(v => v.id === vehicleId);
    if (!item) return;

    const modal = document.getElementById('vehicle-inquiry-modal');
    const content = document.getElementById('vehicle-inquiry-modal-content');
    if (!modal || !content) return;

    const rules = item.fareRules || {
      basePackage: item.pricePerDay,
      extraKm: item.ratePerKm,
      driverAllowance: "Night allowance applicable after 10 PM",
      tollTax: "Tolls & parking paid at actuals"
    };

    const cleanPhone = item.phone.replace(/[\s\-\+]/g, '');
    const whatsappNum = (item.whatsapp || item.phone).replace(/[\s\-\+]/g, '');

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900 rounded-3xl">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">directions_car</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 uppercase">
                  ${item.categoryLabel}
                </span>
                <span class="text-[10px] text-emerald-600 font-bold">✓ RTO Permit Verified</span>
              </div>
              <h3 class="font-heading text-xl font-bold text-stone-900 dark:text-white truncate mt-0.5">${item.name}</h3>
              <p class="text-xs text-stone-500 truncate">${item.operator} • ${item.cityName}</p>
            </div>
          </div>
          <button onclick="RaahiVehicles.closeModal()" class="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shrink-0">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <!-- Direct Contact Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3">
            <div>
              <span class="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Official Operator Helpline</span>
              <div class="text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">${item.phone}</div>
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Instant Call Support</span>
            </div>
            <a href="tel:${item.phone.replace(/\s+/g, '')}" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">call</span>
              <span>Call</span>
            </a>
          </div>

          <div class="p-4 rounded-2xl bg-green-50/70 dark:bg-green-950/30 border border-green-200/80 dark:border-green-800/60 flex items-center justify-between gap-3">
            <div>
              <span class="text-[10px] font-extrabold text-green-700 dark:text-green-400 uppercase tracking-wider block">WhatsApp Direct Chat</span>
              <div class="text-base font-extrabold text-green-800 dark:text-green-300 font-mono mt-0.5">${item.whatsapp || item.phone}</div>
              <span class="text-[11px] text-green-600 dark:text-green-400 font-medium">Quick Route &amp; Rates Query</span>
            </div>
            <a href="https://wa.me/${whatsappNum}?text=Hello%20Raahi%20Tourism,%20I%20am%20inquiring%20about%20${encodeURIComponent(item.name)}%20in%20${encodeURIComponent(item.cityName)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">chat</span>
              <span>Chat</span>
            </a>
          </div>
        </div>

        <!-- Tariff & Route Breakdown -->
        <div class="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
          <h4 class="font-heading text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-amber-500">receipt_long</span>
            <span>Government Benchmark Fare Structure</span>
          </h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
              <span class="text-[10px] text-stone-400 block font-semibold">Standard Base Package</span>
              <span class="font-bold text-stone-900 dark:text-white">${rules.basePackage}</span>
            </div>
            <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
              <span class="text-[10px] text-stone-400 block font-semibold">Extra Distance Billing</span>
              <span class="font-bold text-stone-900 dark:text-white">${rules.extraKm}</span>
            </div>
            <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
              <span class="text-[10px] text-stone-400 block font-semibold">Driver Allowance</span>
              <span class="font-bold text-stone-900 dark:text-white">${rules.driverAllowance}</span>
            </div>
            <div class="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
              <span class="text-[10px] text-stone-400 block font-semibold">Tolls, Taxes &amp; FastTag</span>
              <span class="font-bold text-stone-900 dark:text-white">${rules.tollTax}</span>
            </div>
          </div>
        </div>

        <!-- Key Pickup Hubs -->
        <div class="space-y-2 text-xs">
          <span class="text-[11px] font-bold uppercase text-stone-500 tracking-wider block">Verified Transit Hubs &amp; Pick-up Points</span>
          <div class="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium flex items-center gap-2">
            <span class="material-symbols-outlined text-base text-amber-500">pin_drop</span>
            <span>${item.pickupLocations || 'Airport Terminal, Main Railway Station, Central Tourist Corridor'}</span>
          </div>
        </div>

        <!-- Tourist Safety Guidelines -->
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
          <div class="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <span class="material-symbols-outlined text-base">shield</span>
            <span>Raahi Tourist Safety &amp; Fair Price Advisory</span>
          </div>
          <ul class="space-y-1 text-stone-600 dark:text-stone-300 text-[11px] list-disc list-inside">
            <li>Always check the driver's verified tourism ID badge and registration plate (<strong>${item.rtoLicense || 'Verified Commercial RTO'}</strong>) before boarding.</li>
            <li>All quoted fares comply with regional tourist vehicle union guidelines. No hidden surge pricing.</li>
            <li>In case of emergency or route discrepancy, dial National Tourist SOS <strong>112</strong> or <strong>1363</strong>.</li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="pt-2 flex items-center justify-between gap-3">
          <button onclick="RaahiVehicles.copyContact('${item.phone}')" class="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-sm">content_copy</span>
            <span>Copy Phone Number</span>
          </button>
          
          <button onclick="RaahiVehicles.closeModal()" class="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer">
            Close Guidelines
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const modal = document.getElementById('vehicle-inquiry-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  copyContact(phone) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone).then(() => {
        if (typeof RaahiApp !== 'undefined') {
          RaahiApp.showToast(`Operator hotline ${phone} copied to clipboard!`, "success");
        }
      });
    } else {
      if (typeof RaahiApp !== 'undefined') {
        RaahiApp.showToast(`Operator phone: ${phone}`, "info");
      }
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiVehicles = RaahiVehicles;
}

