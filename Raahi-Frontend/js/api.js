/**
 * RAAHI — Unified API Service Layer
 * Communicates with the FastAPI Backend (http://localhost:8000)
 * Provides server-side pagination, live weather diagnostics, city hubs, and transparent client fallback.
 */

const RaahiAPI = {
  baseUrl: '',
  isBackendOnline: false,
  healthChecked: false,
   currentUser: null,

  async getCities(page = 1, limit = 20, search = '') {
  const response = await this.get('/api/cities', {
    page,
    limit,
    search
  });

  if (!response || !response.success) {
    throw new Error(response?.message || 'Failed to load cities');
  }

  return response;
},


async getPlaces(page = 1, limit = 20) {
  const response = await this.get('/api/places', {
    page,
    limit
  });

  if (!response || !response.success) {
    throw new Error(response?.message || 'Failed to load places');
  }

  return response;
},

  async init() {
    await this.checkHealth();
  },

    // =========================================================================
  // AUTHENTICATION
  // =========================================================================

  async register(userData) {
    return await this.post('/api/auth/register', userData);
  },

  async login(credentials) {
    const response = await this.post(
      '/api/auth/login',
      credentials
    );

    if (
      response &&
      response.success &&
      response.data &&
      response.data.user
    ) {
      this.currentUser = response.data.user;
    }

    return response;
  },

  async getCurrentUser() {
    const response = await this.get('/api/auth/current-user');

    if (response && response.success) {
      this.currentUser = response.data;
    }

    return response;
  },

  async logout() {
    try {
      const response = await this.post('/api/auth/logout');

      this.currentUser = null;

      return response;
    } catch (error) {
      // Even if the backend rejects logout,
      // clear the frontend auth state.
      this.currentUser = null;
      throw error;
    }
  },


// =========================================================================
// USER / CHANGE REQUESTS
// =========================================================================

async createChangeRequest(requestData) {
  return await this.post(
    '/api/change-requests',
    requestData
  );
},

async getMyChangeRequests(status = '') {
  const params = {};

  if (status) {
    params.status = status;
  }

  return await this.get(
    '/api/change-requests/my',
    params
  );
},

async getMyChangeRequest(id) {
  return await this.get(
    `/api/change-requests/my/${id}`
  );
},

// =========================================================
// SAVED RESOURCES
// =========================================================

async getSavedResources(resourceType = '') {
  const params = {};

  if (resourceType) {
    params.resourceType = resourceType;
  }

  return await this.get(
    '/api/saved',
    params
  );
},


async saveResource(resourceType, resourceId) {
  return await this.post(
    '/api/saved',
    {
      resourceType,
      resourceId
    }
  );
},


async unsaveResource(resourceType, resourceId, retry = true) {

  const url =
    `${this.baseUrl}/api/saved/` +
    `${encodeURIComponent(resourceType)}/` +
    `${encodeURIComponent(resourceId)}`;

  try {

    const response = await fetch(
      url,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );

    const data = await response.json();

    // -------------------------------------------------------
    // ACCESS TOKEN EXPIRED → REFRESH → RETRY ONCE
    // -------------------------------------------------------

    if (
      response.status === 401 &&
      retry
    ) {

      const refreshed =
        await this.tryRefreshToken();

      if (refreshed) {

        return await this.unsaveResource(
          resourceType,
          resourceId,
          false
        );

      }
    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        `HTTP ${response.status}`
      );

    }


    return data;

  } catch (error) {

    console.error(
      '[RaahiAPI] Unsave resource failed:',
      error
    );

    throw error;

  }
},


// =========================================================
// REVIEWS
// =========================================================

async getReviews(resourceType, resourceId) {
  return await this.get(
    `/api/reviews/${encodeURIComponent(resourceType)}/${encodeURIComponent(resourceId)}`
  );
},

async getMyReviews() {
  return await this.get(
    '/api/reviews/my'
  );
},


async createReview(resourceType, resourceId, rating, comment) {
  return await this.post(
    '/api/reviews',
    {
      resourceType,
      resourceId,
      rating,
      comment
    }
  );
},


async updateReview(id, rating, comment) {
  return await fetch(
    `${this.baseUrl}/api/reviews/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        rating,
        comment
      })
    }
  ).then(async res => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || `HTTP ${res.status}`
      );
    }

    return data;
  });
},


async deleteReview(id) {
  return await fetch(
    `${this.baseUrl}/api/reviews/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }
  ).then(async res => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || `HTTP ${res.status}`
      );
    }

    return data;
  });
},


    // =========================================================================
  // ADMIN / CHANGE REQUESTS
  // =========================================================================

  async getAdminStats() {
    return await this.get(
      '/api/admin/dashboard/stats'
    );
  },

  async getAdminChangeRequests(status = '') {
    const params = {};

    if (status) {
      params.status = status;
    }

    return await this.get(
      '/api/admin/change-requests',
      params
    );
  },

  async getAdminChangeRequest(id) {
    return await this.get(
      `/api/admin/change-requests/${id}`
    );
  },

  async approveChangeRequest(id) {
    return await fetch(
      `${this.baseUrl}/api/admin/change-requests/${id}/approve`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    ).then(async res => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || `HTTP ${res.status}`
        );
      }

      return data;
    });
  },

  async rejectChangeRequest(id, adminNote = '') {
    return await fetch(
      `${this.baseUrl}/api/admin/change-requests/${id}/reject`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          adminNote
        })
      }
    ).then(async res => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || `HTTP ${res.status}`
        );
      }

      return data;
    });
  },


  

  async refreshAccessToken() {
    return await this.post('/api/auth/refresh');
  },

  async verifyEmail(token) {
  return await this.get(
    `/api/auth/verify-email/${encodeURIComponent(token)}`
  );
},


async resendVerificationEmail(email) {
  return await this.post(
    '/api/auth/resend-verification',
    { email }
  );
},

  async forgotPassword(email) {
    return await this.post(
      '/api/auth/forgot-password',
      { email }
    );
  },

  async resetPassword(token, newPassword) {
    return await this.post(
      `/api/auth/reset-password/${encodeURIComponent(token)}`,
      { newPassword }
    );
  },

  async changePassword(currentPassword, newPassword) {
    return await this.post(
      '/api/auth/change-password',
      {
        currentPassword,
        newPassword
      }
    );
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

async tryRefreshToken() {
  try {
    const response = await fetch(
      `${this.baseUrl}/api/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    return !!(data && data.success);

  } catch (error) {
    console.warn(
      '[RaahiAPI] Access token refresh failed:',
      error
    );

    return false;
  }
},


  // Helper for generic GET with fallback
 async get(endpoint, params = {}, retry = true) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url =
    `${this.baseUrl}${endpoint}` +
    (query.toString() ? '?' + query.toString() : '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();

   if (!res.ok) {

 if (
  res.status === 401 &&
  retry
) {

    const refreshed =
      await this.tryRefreshToken();

    if (refreshed) {
      return await this.get(
        endpoint,
        params,
        false
      );
    }
  }

  throw new Error(
    data.message || `HTTP ${res.status}`
  );
}

    return data;

  } catch (e) {
    console.error(
      `[RaahiAPI] GET ${endpoint} failed:`,
      e
    );
    throw e;
  }
},


    // =========================================================================
  // Generic POST helper
  // =========================================================================

async post(endpoint, body = {}, retry = true) {
  const url = `${this.baseUrl}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {

      const publicAuthRoutes = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/forgot-password'
      ];

      if (
        res.status === 401 &&
        retry &&
        !publicAuthRoutes.includes(endpoint)
      ) {

        const refreshed =
          await this.tryRefreshToken();

        if (refreshed) {
          return await this.post(
            endpoint,
            body,
            false
          );
        }
      }

      throw new Error(
        data.message || `HTTP ${res.status}`
      );
    }

    return data;

  } catch (e) {
    console.error(
      `[RaahiAPI] POST ${endpoint} failed:`,
      e
    );
    throw e;
  }
},

  // =========================================================================
  // 1. CITY OVERVIEW & DESTINATIONS
  // =========================================================================
  // 1. DESTINATION OVERVIEW
  // =========================================================================


  async getCity(cityId) {
  const normId = (cityId || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  const cityImages = {
    lucknow: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=1200&q=80",
    varanasi: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
    agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
    delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5d?auto=format&fit=crop&w=1200&q=80",
    goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    kashmir: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80"
  };

  try {
    // ==========================================
    // Fetch cities from the actual backend API
    // ==========================================

    const response = await this.get(
      `/api/cities?page=1&limit=100`
    );

    if (
      response &&
      response.success &&
      Array.isArray(response.data)
    ) {
      const city = response.data.find(c => {
        const cityName = (c.name || '')
          .toLowerCase()
          .replace(/[^a-z]/g, '');

        const cityIdValue = (c.cityId || '')
          .toLowerCase()
          .replace(/[^a-z]/g, '');

        return (
          cityName === normId ||
          cityName.includes(normId) ||
          normId.includes(cityName) ||
          cityIdValue.includes(normId)
        );
      });

      if (city) {
        return {
          id: city.cityId || normId,
          name: city.name,
          state: city.state || 'India',
          country: city.country || 'India',

          tagline:
            city.description ||
            `Explore ${city.name}, ${city.state || 'India'}`,

          description:
            city.description ||
            `Explore verified attractions, local experiences, food, stays and travel services in ${city.name}.`,
image:
  Array.isArray(city.images) && city.images.length > 0
    ? city.images[0]
    : (city.image || city.imageUrl || null),

          latitude: city.latitude,
          longitude: city.longitude,

          attractionsCount: Array.isArray(city.famousFor)
            ? city.famousFor.length
            : 15,

          hotelsCount: 0,
          restaurantsCount: 0,

          tourismPriority:
            city.tourismPriority || 'High',

          bestTimeToVisit:
            city.bestTimeToVisit || null,

          famousFor:
            Array.isArray(city.famousFor)
              ? city.famousFor
              : [],

          safetyScore: 9.0
        };
      }
    }

  } catch (error) {
    console.warn(
      `[RaahiAPI] Failed to load city ${cityId} from backend:`,
      error
    );
  }

  // ==========================================
  // Existing local fallback
  // ==========================================

  const local =
    (typeof RAAHI_DATA !== 'undefined' &&
      Array.isArray(RAAHI_DATA.destinations))
      ? RAAHI_DATA.destinations.find(d => {
          const id = (d.id || '')
            .toLowerCase()
            .replace(/[^a-z]/g, '');

          const name = (d.name || '')
            .toLowerCase()
            .replace(/[^a-z]/g, '');

          return (
            id === normId ||
            name === normId ||
            name.includes(normId) ||
            normId.includes(id)
          );
        })
      : null;

  if (local) {
    return local;
  }

  // ==========================================
  // Final safe fallback
  // ==========================================

  return {
    id: normId || 'city',

    name:
      cityId
        ? cityId.charAt(0).toUpperCase() + cityId.slice(1)
        : 'City',

    state: 'India',
    country: 'India',

    tagline: 'Rich Cultural & Historic Travel Destination',

    description:
      'Explore verified monuments, authentic culinary experiences, certified local guides, and regional heritage.',

    image:
      cityImages[normId] ||
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",

    attractionsCount: 15,
    hotelsCount: 0,
    restaurantsCount: 0,
    safetyScore: 9.0
  };
},


  // =========================================================================
  // 2. LIVE WEATHER & CLIMATE SUITABILITY
  // =========================================================================
async getWeather(cityId) {
  if (!cityId) {
    throw new Error('City is required');
  }

  const city = String(cityId).trim();

  try {
    const response = await this.get(
      `/api/weather/${encodeURIComponent(city)}`
    );

    if (
      !response ||
      !response.success ||
      !response.data
    ) {
      throw new Error(
        response?.message || 'Weather data unavailable'
      );
    }

    return response.data;

  } catch (error) {
    console.error(
      `❌ Failed to load weather for ${city}:`,
      error
    );

    throw error;
  }
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
  // 7.6 PAGINATED TOURIST VEHICLES
  // =========================================================================
  async getVehicles({ city = 'all', page = 1, limit = 6, category = '' } = {}) {
    const remote = await this.get('/api/v1/vehicles', { city, page, limit, category });
    if (remote && remote.data) {
      return remote;
    }

    let list = RAAHI_DATA.vehicles || [];
    if (city && city.toLowerCase() !== 'all') {
      const cNorm = city.toLowerCase().replace(/[^a-z]/g, '');
      list = list.filter(v => (v.city || '').toLowerCase().replace(/[^a-z]/g, '').includes(cNorm));
    }
    if (category && category !== 'all') {
      list = list.filter(v => v.category === category);
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
