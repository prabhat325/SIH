/**
 * RAAHI — Verified Tourist Transport & Vehicles Module
 * Features:
 * - Certified Tourist Cabs, EV Rentals, Self-Drive SUVs, Tempo Travelers, and Heritage Auto/Rickshaws
 * - City filter & category tabs
 * - Fare estimates, driver ratings, verified GPS tracking & AC badges
 * - Instant Booking / Inquiry modal
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
        operator: "Awadh Heritage Cabs",
        phone: "+91 522 2894100"
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
        operator: "EcoRaahi Green Fleet",
        phone: "+91 522 2981200"
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
        phone: "+91 141 2789123"
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
        operator: "Kashi Yatra Heritage Fleet",
        phone: "+91 542 2459900"
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
        operator: "Chowk Heritage Rickshaw Guild",
        phone: "+91 522 2618822"
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
        operator: "Taj City Chauffeurs",
        phone: "+91 562 2334455"
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
        operator: "Goa Coastal Riders",
        phone: "+91 832 2456789"
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
        pricePerDay: "₹8,500/day (8 hrs / 80 kms)",
        ratePerKm: "₹45/extra km",
        features: ["Uniformed Chauffeur", "Wi-Fi Hotspot on board", "Leather seating with massage", "Chilled beverages & sanitizers"],
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
        operator: "Imperial Capital Limousines",
        phone: "+91 11 41556677"
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

    container.innerHTML = list.map(item => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/60 dark:hover:border-amber-500/50 transition-all duration-300 flex flex-col group">
        
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

        <!-- Details -->
        <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              ${item.name}
            </h3>

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
            <div class="pt-2 flex flex-wrap gap-1.5">
              ${item.features.map(f => `
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60">
                  ✓ ${f}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Price & Action -->
          <div class="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
            <div>
              <span class="text-xs text-stone-400 block font-medium">Estimated Rate</span>
              <span class="text-base font-extrabold text-stone-900 dark:text-white font-mono text-amber-600 dark:text-amber-400">${item.pricePerDay}</span>
            </div>

            <button onclick="RaahiVehicles.openBookModal('${item.id}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-sm">hail</span>
              <span>Book / Inquire</span>
            </button>
          </div>
        </div>

      </div>
    `).join('');
  },

  openBookModal(vehicleId) {
    const item = this.vehicles.find(v => v.id === vehicleId);
    if (!item) return;

    const modal = document.getElementById('vehicle-inquiry-modal');
    const content = document.getElementById('vehicle-inquiry-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900 rounded-3xl">
        <div class="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">directions_car</span>
            </div>
            <div>
              <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white">${item.name}</h3>
              <p class="text-xs text-stone-500">${item.operator} • ${item.cityName}</p>
            </div>
          </div>
          <button onclick="RaahiVehicles.closeModal()" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1">
            <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pricing Structure</span>
            <div class="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono">${item.pricePerDay}</div>
            <p class="text-xs text-stone-600 dark:text-stone-300">${item.ratePerKm}</p>
          </div>

          <div class="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <span class="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Direct Helpline</span>
            <div class="text-base font-extrabold text-stone-900 dark:text-white font-mono">${item.phone}</div>
            <p class="text-xs text-emerald-600 font-semibold">✓ 24x7 Dispatch Active</p>
          </div>
        </div>

        <form id="vehicle-booking-form" onsubmit="RaahiVehicles.submitBooking(event, '${item.id}')" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Your Full Name</label>
              <input type="text" required placeholder="Aakash Verma" class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">
            </div>
            <div>
              <label class="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Contact Number</label>
              <input type="tel" required placeholder="+91 98765 43210" class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Pick-up Date & Time</label>
              <input type="datetime-local" required class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">
            </div>
            <div>
              <label class="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Pick-up Location / Landmark</label>
              <input type="text" required placeholder="Lucknow Airport / Hotel" class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">
            </div>
          </div>

          <div class="pt-3 flex items-center justify-end gap-2">
            <button type="button" onclick="RaahiVehicles.closeModal()" class="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold">Cancel</button>
            <button type="submit" class="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-sm">send</span>
              <span>Confirm Instant Inquiry</span>
            </button>
          </div>
        </form>
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

  submitBooking(e, vehicleId) {
    e.preventDefault();
    this.closeModal();
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.showToast("Vehicle inquiry sent! The verified driver will contact you via WhatsApp shortly.", "success");
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiVehicles = RaahiVehicles;
}
