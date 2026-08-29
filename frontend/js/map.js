/**
 * RAAHI — Interactive Leaflet Map Engine
 * "Explore Your Journey on the Map"
 * Renders custom colored pin markers with layer toggles for Places, Hotels, Restaurants, Events, Guides, Emergency.
 */

const RaahiMap = {
  mapInstance: null,
  markersLayer: null,
  activeFilter: 'all',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.querySelectorAll('.map-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.map-filter-btn').forEach(b => {
          b.classList.remove('bg-amber-600', 'text-white');
          b.classList.add('bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        });
        btn.classList.remove('bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        btn.classList.add('bg-amber-600', 'text-white');
        this.activeFilter = btn.getAttribute('data-map-layer') || 'all';
        this.renderMarkers();
      });
    });
  },

  initLeafletMap() {
    const mapContainer = document.getElementById('raahi-interactive-map');
    if (!mapContainer || this.mapInstance) return;

    try {
      // Initialize map centered on Central/North India (23.5937, 78.9629)
      this.mapInstance = L.map('raahi-interactive-map', {
        center: [25.5941, 79.5],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Warm CartoDB Positron / OSM Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.mapInstance);

      this.markersLayer = L.layerGroup().addTo(this.mapInstance);
      this.renderMarkers();
    } catch (e) {
      console.warn("Leaflet initialization note:", e);
    }
  },

  createCustomIcon(category, colorHex) {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background-color: ${colorHex}; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <span class="material-symbols-outlined" style="font-size: 18px;">${category}</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });
  },

  renderMarkers() {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    // 1. Places (Amber Pins)
    if (['all', 'places'].includes(this.activeFilter) && RAAHI_DATA.places) {
      RAAHI_DATA.places.forEach(p => {
        if (!p.lat || !p.lng) return;
        const icon = this.createCustomIcon('temple_hindu', '#d97706');
        const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(p, p.city) : `https://maps.google.com/?q=${p.lat},${p.lng}`;
        const marker = L.marker([p.lat, p.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 220px; padding: 4px;">
            <img src="${p.image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #d97706;">${p.category} • ${p.city}</span>
            <h4 style="font-size: 13px; font-weight: bold; margin: 2px 0 4px; color: #1c1917;">${p.name}</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11px;">
              <span style="color: #f59e0b; font-weight: bold;">★ ${p.rating}</span>
              <span style="color: #059669; font-weight: bold;">${p.entryFee.split(',')[0]}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <button onclick="RaahiPlaces.openDetailModal('${p.id}')" style="padding: 6px 4px; background: #1c1917; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                Details
              </button>
              <a href="${directionsUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; padding: 6px 4px; background: #d97706; color: white; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none; text-align: center;">
                Directions ↗
              </a>
            </div>
          </div>
        `);
        this.markersLayer.addLayer(marker);
      });
    }

    // 2. Hotels (Emerald Pins)
    if (['all', 'hotels'].includes(this.activeFilter) && RAAHI_DATA.hotels) {
      RAAHI_DATA.hotels.forEach(h => {
        const dest = RAAHI_DATA.destinations.find(d => d.id === h.destinationId);
        const lat = dest ? dest.lat + 0.02 : 26.85;
        const lng = dest ? dest.lng + 0.02 : 80.95;
        const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(h, h.city) : `https://maps.google.com/?q=${lat},${lng}`;
        const icon = this.createCustomIcon('hotel', '#059669');
        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 220px; padding: 4px;">
            <img src="${h.image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #059669;">Stay Info • ${h.city}</span>
            <h4 style="font-size: 13px; font-weight: bold; margin: 2px 0 4px; color: #1c1917;">${h.name}</h4>
            <div style="margin-bottom: 8px; font-size: 11px; color: #059669; font-weight: bold;">${h.priceTier}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <button onclick="RaahiHotels.openHotelModal('${h.id}')" style="padding: 6px 4px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                Stay Details
              </button>
              <a href="${directionsUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; padding: 6px 4px; background: #d97706; color: white; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none; text-align: center;">
                Directions ↗
              </a>
            </div>
          </div>
        `);
        this.markersLayer.addLayer(marker);
      });
    }

    // 3. Restaurants (Orange Pins)
    if (['all', 'restaurants'].includes(this.activeFilter) && RAAHI_DATA.restaurants) {
      RAAHI_DATA.restaurants.forEach(r => {
        const dest = RAAHI_DATA.destinations.find(d => d.id === r.destinationId);
        const lat = dest ? dest.lat - 0.02 : 26.83;
        const lng = dest ? dest.lng - 0.02 : 80.93;
        const directionsUrl = typeof RaahiApp !== 'undefined' ? RaahiApp.getDirectionsUrl(r, r.city) : `https://maps.google.com/?q=${lat},${lng}`;
        const icon = this.createCustomIcon('restaurant', '#ea580c');
        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 220px; padding: 4px;">
            <img src="${r.image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #ea580c;">${r.cuisine} • ${r.city}</span>
            <h4 style="font-size: 13px; font-weight: bold; margin: 2px 0 4px; color: #1c1917;">${r.name}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px;">
              <button onclick="RaahiRestaurants.openRestModal('${r.id}')" style="padding: 6px 4px; background: #ea580c; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
                Culinary Info
              </button>
              <a href="${directionsUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; padding: 6px 4px; background: #d97706; color: white; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none; text-align: center;">
                Directions ↗
              </a>
            </div>
          </div>
        `);
        this.markersLayer.addLayer(marker);
      });
    }

    // 4. Emergency (Red Pins)
    if (['all', 'emergency'].includes(this.activeFilter) && RAAHI_DATA.emergencyServices) {
      RAAHI_DATA.emergencyServices.forEach(e => {
        if (!e.lat || !e.lng) return;
        const directionsUrl = `https://maps.google.com/?q=${e.lat},${e.lng}`;
        const icon = this.createCustomIcon('local_hospital', '#dc2626');
        const marker = L.marker([e.lat, e.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 210px; padding: 4px;">
            <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #dc2626;">24x7 Emergency Hub</span>
            <h4 style="font-size: 12px; font-weight: bold; margin: 2px 0 4px; color: #1c1917;">${e.name}</h4>
            <p style="font-size: 11px; color: #57534e; margin-bottom: 6px;">${e.address}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <a href="tel:${e.phone.split('/')[0].trim()}" style="display: flex; align-items: center; justify-content: center; padding: 6px 2px; background: #dc2626; color: white; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none; text-align: center;">
                Call Desk
              </a>
              <a href="${directionsUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; padding: 6px 2px; background: #d97706; color: white; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none; text-align: center;">
                Directions ↗
              </a>
            </div>
          </div>
        `);
        this.markersLayer.addLayer(marker);
      });
    }
  },

  flyToDestination(destId) {
    const dest = RAAHI_DATA.destinations.find(d => d.id === destId);
    if (dest && this.mapInstance) {
      this.mapInstance.flyTo([dest.lat, dest.lng], 12, { duration: 1.5 });
    }
  }
};

if (typeof window !== 'undefined') {
  window.RaahiMap = RaahiMap;
}
