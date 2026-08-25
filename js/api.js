/**
 * RAAHI — Unified API Service Layer
 * Communicates with the FastAPI Backend (http://localhost:8000)
 * Provides server-side pagination, live weather diagnostics, city hubs, and transparent client fallback.
 */

const RaahiAPI = {
  baseUrl: 'http://localhost:8000',
  isBackendOnline: false,
  healthChecked: false,

  async init() {
    await this.checkHealth();
  },

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.isBackendOnline = true;
        this.healthChecked = true;
        this.updateStatusBadge(true);
        console.log("✅ [Raahi API]: Connected to FastAPI AI/ML Backend (v" + (data.version || "1.0.0") + ")");
        return true;
      }
    } catch (err) {
      this.isBackendOnline = false;
      this.healthChecked = true;
      this.updateStatusBadge(false);
      console.log("ℹ️ [Raahi API]: Backend offline / standby. Running in resilient client-side fallback mode.");
    }
    return false;
  },

  updateStatusBadge(online) {
    const badges = document.querySelectorAll('.ai-engine-status-badge');
    badges.forEach(badge => {
      if (online) {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>FastAPI Backend Active (:8000)</span>
        `;
        badge.className = 'ai-engine-status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20';
      } else {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          <span>Client Standby Mode</span>
        `;
        badge.className = 'ai-engine-status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20';
      }
    });
  },

  // Helper for generic GET with fallback
  async get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const url = `${this.baseUrl}${endpoint}${query.toString() ? '?' + query.toString() : ''}`;

    if (!this.healthChecked) {
      await this.checkHealth();
    }

    if (this.isBackendOnline) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn(`[RaahiAPI] GET ${endpoint} network error:`, e.message);
      }
    }
    return null;
  },

  // =========================================================================
  // 1. CITY OVERVIEW & DESTINATIONS
  // =========================================================================
  // 1. DESTINATION OVERVIEW
  // =========================================================================
  async getCity(cityId) {
    const normId = (cityId || '').toLowerCase().replace(/[^a-z]/g, '');
    const cityImages = {
      lucknow: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=1200&q=80",
      varanasi: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
      agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
      delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
      goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
      kashmir: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80"
    };

    const remote = await this.get(`/api/v1/destinations/${normId}`);
    if (remote && remote.destination) {
      return {
        id: remote.destination_id || normId,
        name: remote.destination,
        state: remote.state,
        tagline: `${remote.category} Paradise in ${remote.region} India`,
        description: remote.description,
        image: cityImages[normId] || `https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80`,
        attractionsCount: (remote.attractions_list || []).length || 20,
        hotelsCount: 35,
        restaurantsCount: 50,
        popularityScore: remote.popularity_score || 9.2,
        safetyScore: remote.safety_score || 9.0,
        budgetPerDay: remote.avg_cost_per_day_inr || 2500,
        idealDuration: remote.ideal_duration_days || 3,
        idealFor: remote.ideal_for_list || ['Family', 'Couples', 'Solo'],
        topAttractions: remote.attractions_list || []
      };
    }

    // Local fallback
    const local = (RAAHI_DATA.destinations || []).find(d => 
      d.id.toLowerCase() === normId || d.name.toLowerCase().includes(normId) || normId.includes(d.id.toLowerCase())
    );
    if (local) return local;

    return {
      id: normId || 'city',
      name: cityId.charAt(0).toUpperCase() + cityId.slice(1),
      state: 'India',
      tagline: 'Rich Cultural & Historic Travel Destination',
      description: 'Explore verified monuments, authentic culinary lanes, certified local guides, and regional heritage.',
      image: cityImages[normId] || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
      attractionsCount: 15,
      hotelsCount: 25,
      restaurantsCount: 40,
      safetyScore: 9.0
    };
  },


  // =========================================================================
  // 2. LIVE WEATHER & CLIMATE SUITABILITY
  // =========================================================================
  async getWeather(cityId, month = 'Nov') {
    const normId = (cityId || '').toLowerCase().replace(/[^a-z]/g, '');
    const remote = await this.get(`/api/v1/weather/${normId}`, { month });
    if (remote && remote.status === 'success') {
      return {
        city: remote.destination,
        month: remote.month,
        temperature: remote.temperature_range || '18°C - 28°C',
        condition: remote.condition || 'Pleasant & clear skies',
        suitabilityScore: remote.suitability_score || 9.2,
        comfortTag: remote.comfort_tag || 'Prime Sightseeing Season',
        bestTimeToVisit: 'October to March'
      };
    }

    // High quality local seasonal fallback
    return {
      city: cityId,
      month: month,
      temperature: '16°C – 27°C',
      condition: 'Pleasant, cool breezes & comfortable sightseeing atmosphere',
      suitabilityScore: 9.4,
      comfortTag: 'Prime Travel Season',
      bestTimeToVisit: 'October to March'
    };
  },

  // =========================================================================
  // 3. PAGINATED HOTELS
  // =========================================================================
  async getHotels({ city = 'all', page = 1, limit = 6, query = '' } = {}) {
    const remote = await this.get('/api/v1/hotels', { city, page, limit, query });
    if (remote && remote.data) {
      return {
        data: remote.data,
        pagination: {
          page: remote.page || page,
          limit: remote.limit || limit,
          total: remote.total || remote.data.length,
          totalPages: remote.totalPages || Math.ceil((remote.total || remote.data.length) / limit),
          hasNext: !!remote.hasNext,
          hasPrev: !!remote.hasPrev
        }
      };
    }

    // Client-side fallback pagination
    let list = RAAHI_DATA.hotels || [];
    if (city && city.toLowerCase() !== 'all') {
      const cNorm = city.toLowerCase().replace(/[^a-z]/g, '');
      list = list.filter(h => (h.city || '').toLowerCase().replace(/[^a-z]/g, '').includes(cNorm));
    }
    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q));
    }
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  // =========================================================================
  // 4. PAGINATED RESTAURANTS
  // =========================================================================
  async getRestaurants({ city = 'all', page = 1, limit = 6, query = '' } = {}) {
    const remote = await this.get('/api/v1/restaurants', { city, page, limit, query });
    if (remote && remote.data) {
      return {
        data: remote.data,
        pagination: {
          page: remote.page || page,
          limit: remote.limit || limit,
          total: remote.total || remote.data.length,
          totalPages: remote.totalPages || Math.ceil((remote.total || remote.data.length) / limit),
          hasNext: !!remote.hasNext,
          hasPrev: !!remote.hasPrev
        }
      };
    }

    // Client-side fallback pagination
    let list = RAAHI_DATA.restaurants || [];
    if (city && city.toLowerCase() !== 'all') {
      const cNorm = city.toLowerCase().replace(/[^a-z]/g, '');
      list = list.filter(r => (r.city || '').toLowerCase().replace(/[^a-z]/g, '').includes(cNorm));
    }
    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
    }
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  // =========================================================================
  // 5. PAGINATED CULTURAL EVENTS
  // =========================================================================
  async getEvents({ city = 'all', page = 1, limit = 6, query = '' } = {}) {
    const eventImageOverrides = {
      'varanasi-dev-deepawali': 'https://images.unsplash.com/photo-1605335198099-317730e69888?auto=format&fit=crop&w=1200&q=80',
      'pushkar-camel-fair': 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&w=1200&q=80'
    };

    const remote = await this.get('/api/v1/events', { city, page, limit, query });
    if (remote && remote.data) {
      const data = remote.data.map(e => ({
        ...e,
        image: eventImageOverrides[e.id] || e.image
      }));
      return {
        data,
        pagination: {
          page: remote.page || page,
          limit: remote.limit || limit,
          total: remote.total || remote.data.length,
          totalPages: remote.totalPages || Math.ceil((remote.total || remote.data.length) / limit),
          hasNext: !!remote.hasNext,
          hasPrev: !!remote.hasPrev
        }
      };
    }


    let list = RAAHI_DATA.events || [];
    if (city && city.toLowerCase() !== 'all') {
      const cNorm = city.toLowerCase().replace(/[^a-z]/g, '');
      list = list.filter(e => (e.city || '').toLowerCase().replace(/[^a-z]/g, '').includes(cNorm));
    }
    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  // =========================================================================
  // 6. PAGINATED LOCAL GUIDES
  // =========================================================================
  async getGuides({ city = 'all', page = 1, limit = 6, query = '' } = {}) {
    const remote = await this.get('/api/v1/guides', { city, page, limit, query });
    if (remote && remote.data) {
      return {
        data: remote.data,
        pagination: {
          page: remote.page || page,
          limit: remote.limit || limit,
          total: remote.total || remote.data.length,
          totalPages: remote.totalPages || Math.ceil((remote.total || remote.data.length) / limit),
          hasNext: !!remote.hasNext,
          hasPrev: !!remote.hasPrev
        }
      };
    }

    let list = RAAHI_DATA.guides || [];
    if (city && city.toLowerCase() !== 'all') {
      const cNorm = city.toLowerCase().replace(/[^a-z]/g, '');
      list = list.filter(g => (g.city || '').toLowerCase().replace(/[^a-z]/g, '').includes(cNorm));
    }
    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(g => g.name.toLowerCase().includes(q) || g.specialization.toLowerCase().includes(q));
    }
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  // =========================================================================
  // 7. PAGINATED EMERGENCY SERVICES
  // =========================================================================
  async getEmergency({ city = 'all', page = 1, limit = 6, type = '' } = {}) {
    const remote = await this.get('/api/v1/emergency', { city, page, limit, type });
    if (remote && remote.data) {
      return {
        data: remote.data,
        helplines: remote.helplines || RAAHI_DATA.nationalHelplines || [],
        pagination: {
          page: remote.page || page,
          limit: remote.limit || limit,
          total: remote.total || remote.data.length,
          totalPages: remote.totalPages || Math.ceil((remote.total || remote.data.length) / limit),
          hasNext: !!remote.hasNext,
          hasPrev: !!remote.hasPrev
        }
      };
    }

    let list = RAAHI_DATA.emergencyServices || [];
    if (city && city.toLowerCase() !== 'all') {
      const cNorm = city.toLowerCase().replace(/[^a-z]/g, '');
      list = list.filter(e => (e.city || '').toLowerCase().replace(/[^a-z]/g, '').includes(cNorm));
    }
    if (type) {
      list = list.filter(e => e.type.toLowerCase() === type.toLowerCase());
    }
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      data: paginated,
      helplines: RAAHI_DATA.nationalHelplines || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  // =========================================================================
  // 8. AI ENGINE EXTENSIONS
  // =========================================================================
  async generateItinerary(payload) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/itinerary/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          return data.itinerary || data;
        }
      } catch (e) {
        console.warn("Backend itinerary call failed, falling back:", e);
      }
    }
    return null;
  },

  async sendChat(message) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        if (res.ok) {
          const data = await res.json();
          return data.reply || data.response;
        }
      } catch (e) {}
    }
    return null;
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiAPI = RaahiAPI;
}
