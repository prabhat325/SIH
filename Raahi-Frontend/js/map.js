/**
 * RAAHI — Interactive Leaflet Map Engine
 * "Explore Your Journey on the Map"
 *
 * Layers:
 * Places, Hotels, Restaurants, Events, Guides, Emergency
 *
 * Features:
 * - Backend-powered map data
 * - Direct API fallback
 * - City-based filtering
 * - Robust coordinate normalization
 * - Popup actions
 * - Custom Leaflet markers
 */

const RaahiMap = {

  mapInstance: null,
  markersLayer: null,
  mapData: null,

  activeFilter: "all",

  currentCity: null,

  loadingCity: false,

  /* =========================================================
     INIT
     ========================================================= */

  init() {
    this.bindEvents();

    // Give the page time to create the map container.
    setTimeout(() => {
      this.initLeafletMap();
    }, 100);
  },


  /* =========================================================
     FILTER EVENTS
     ========================================================= */

  bindEvents() {

    document.querySelectorAll(".map-filter-btn").forEach(btn => {

      btn.addEventListener("click", () => {

        document
          .querySelectorAll(".map-filter-btn")
          .forEach(b => {

            b.classList.remove(
              "bg-amber-600",
              "text-white"
            );

            b.classList.add(
              "bg-white",
              "dark:bg-stone-800",
              "text-stone-700",
              "dark:text-stone-300"
            );
          });


        btn.classList.remove(
          "bg-white",
          "dark:bg-stone-800",
          "text-stone-700",
          "dark:text-stone-300"
        );

        btn.classList.add(
          "bg-amber-600",
          "text-white"
        );


        this.activeFilter =
          btn.getAttribute("data-map-layer") || "all";


        console.log(
          "[RaahiMap] Active layer:",
          this.activeFilter
        );


        this.renderMarkers();
      });
    });
  },


  /* =========================================================
     INITIALIZE LEAFLET
     ========================================================= */

  initLeafletMap() {

    const mapContainer =
      document.getElementById("raahi-interactive-map");


    if (!mapContainer) {
      console.warn(
        "[RaahiMap] Map container not found."
      );

      return;
    }


    if (this.mapInstance) {
      return;
    }


    if (typeof L === "undefined") {

      console.error(
        "[RaahiMap] Leaflet library is not loaded."
      );

      return;
    }


    try {

      this.mapInstance = L.map(
        "raahi-interactive-map",
        {
          center: [26.8467, 80.9462],
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true
        }
      );


      /*
       * OpenStreetMap tiles
       */

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            "&copy; OpenStreetMap contributors",

          maxZoom: 19
        }
      ).addTo(this.mapInstance);


      /*
       * Marker layer
       */

      this.markersLayer =
        L.layerGroup().addTo(this.mapInstance);


      console.log(
        "[RaahiMap] Leaflet initialized."
      );


      /*
       * Restore selected city.
       */

      setTimeout(() => {

        if (
          typeof RaahiCityHub !== "undefined" &&
          RaahiCityHub.currentCityId
        ) {

          this.setCity(
            RaahiCityHub.currentCityId
          );

        }

      }, 300);


    } catch (error) {

      console.error(
        "[RaahiMap] Leaflet initialization failed:",
        error
      );
    }
  },


  /* =========================================================
     CUSTOM MARKER ICON
     ========================================================= */

  createCustomIcon(category, colorHex) {

    return L.divIcon({

      className:
        "custom-leaflet-marker",

      html: `
        <div
          style="
            background-color:${colorHex};
            width:34px;
            height:34px;
            border-radius:50%;
            border:2.5px solid white;
            box-shadow:0 4px 10px rgba(0,0,0,0.3);
            display:flex;
            align-items:center;
            justify-content:center;
            color:white;
          "
        >
          <span
            class="material-symbols-outlined"
            style="font-size:18px;"
          >
            ${category}
          </span>
        </div>
      `,

      iconSize: [34, 34],

      iconAnchor: [17, 34],

      popupAnchor: [0, -34]
    });
  },


  /* =========================================================
     COORDINATE NORMALIZER
     ========================================================= */

getCoordinates(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  /*
   * ---------------------------------------------------------
   * 1. READ STANDARD COORDINATE FIELDS
   * ---------------------------------------------------------
   *
   * Your backend currently uses:
   *
   * latitude
   * longitude
   *
   * We also support:
   * lat / lng
   * location.lat / location.lng
   * location.latitude / location.longitude
   */

  let lat =
    item.lat ??
    item.latitude ??
    item.location?.lat ??
    item.location?.latitude;

  let lng =
    item.lng ??
    item.longitude ??
    item.location?.lng ??
    item.location?.longitude;


  /*
   * ---------------------------------------------------------
   * 2. SUPPORT GEOJSON
   * ---------------------------------------------------------
   *
   * GeoJSON format:
   *
   * coordinates: [longitude, latitude]
   */

  if (
    (lat == null || lng == null) &&
    Array.isArray(item.coordinates) &&
    item.coordinates.length >= 2
  ) {
    lng = item.coordinates[0];
    lat = item.coordinates[1];
  }


  /*
   * GeoJSON nested inside location
   */

  if (
    (lat == null || lng == null) &&
    Array.isArray(item.location?.coordinates) &&
    item.location.coordinates.length >= 2
  ) {
    lng = item.location.coordinates[0];
    lat = item.location.coordinates[1];
  }


  /*
   * ---------------------------------------------------------
   * 3. CONVERT STRING NUMBERS
   * ---------------------------------------------------------
   *
   * MongoDB/API may return:
   *
   * "26.8688"
   * "80.9129"
   */

  lat = Number(lat);
  lng = Number(lng);


  /*
   * ---------------------------------------------------------
   * 4. REJECT INVALID COORDINATES
   * ---------------------------------------------------------
   */

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    console.warn(
      '[RaahiMap] Invalid coordinates:',
      {
        id:
          item._id ||
          item.id ||
          item.placeId ||
          item.restaurantId ||
          item.serviceId ||
          item.hotelId,

        name: item.name,

        latitude: item.latitude,
        longitude: item.longitude,

        lat,
        lng
      }
    );

    return null;
  }


  /*
   * ---------------------------------------------------------
   * 5. REJECT 0,0
   * ---------------------------------------------------------
   *
   * Number(null) becomes 0.
   *
   * We never want a missing coordinate to become:
   *
   * [0, 0]
   *
   * which is in the Atlantic Ocean.
   */

  if (lat === 0 && lng === 0) {
    console.warn(
      '[RaahiMap] Ignoring missing 0,0 coordinates:',
      item.name || item._id || 'Unknown item'
    );

    return null;
  }


  /*
   * ---------------------------------------------------------
   * 6. INDIA SANITY CHECK
   * ---------------------------------------------------------
   *
   * This does NOT reject the marker.
   * It only warns us if something looks suspicious.
   */

  if (
    lat < 5 ||
    lat > 38 ||
    lng < 60 ||
    lng > 100
  ) {
    console.warn(
      '[RaahiMap] Coordinates outside expected India range:',
      {
        name: item.name || 'Unknown',
        lat,
        lng
      }
    );
  }


  /*
   * ---------------------------------------------------------
   * 7. RETURN NORMALIZED COORDINATES
   * ---------------------------------------------------------
   */

  return {
    lat,
    lng
  };
},

  /* =========================================================
     NORMALIZE COLLECTION
     ========================================================= */

  normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const coords = this.getCoordinates(item);

      if (!coords) {
        console.warn(
          '[RaahiMap] Item skipped - coordinates missing:',
          item.name ||
          item._id ||
          item.id ||
          item.placeId ||
          item.restaurantId ||
          item.serviceId ||
          'Unknown'
        );

        return null;
      }

      /*
       * Normalize every record so renderMarkers()
       * always receives:
       *
       * lat
       * lng
       * id
       */

      const normalizedId =
        item.id ||
        item.placeId ||
        item.restaurantId ||
        item.hotelId ||
        item.guideId ||
        item.serviceId ||
        item.eventId ||
        item._id;

      return {
        ...item,

        // Normalized coordinates
        lat: coords.lat,
        lng: coords.lng,

        // Normalized universal ID
        id: normalizedId
      };
    })
    .filter(Boolean);
},


  /* =========================================================
     LOAD CITY MAP
     ========================================================= */

  async loadCityMap(cityName) {

  if (!cityName) {
    return;
  }

  const city = String(cityName).trim();

  if (!city) {
    return;
  }

  if (this.loadingCity) {
    return;
  }

  this.loadingCity = true;

  try {

    console.log(
      `[RaahiMap] Loading direct city data for ${city}...`
    );

    /*
     * =========================================================
     * LOAD ALL CITY DATA DIRECTLY
     * =========================================================
     *
     * IMPORTANT:
     * Places and Emergency use their dedicated /city/:city
     * endpoints because those are confirmed to work.
     */

    const requests = [

      // 0 — PLACES
      RaahiAPI.get(
        `/api/places/city/${encodeURIComponent(city)}`
      ),

      // 1 — HOTELS
      RaahiAPI.get(
        `/api/hotels/city/${encodeURIComponent(city)}`
      ),

      // 2 — RESTAURANTS
      RaahiAPI.get(
        `/api/restaurants/city/${encodeURIComponent(city)}`
      ),

      // 3 — EVENTS
      RaahiAPI.get(
        `/api/events/city/${encodeURIComponent(city)}`
      ),

      // 4 — GUIDES
      RaahiAPI.get(
        `/api/guides/city/${encodeURIComponent(city)}`
      ),

      // 5 — EMERGENCY
      RaahiAPI.get(
        `/api/emergency/city/${encodeURIComponent(city)}`
      )

    ];


    /*
     * Wait for all APIs.
     *
     * Promise.allSettled means one failed API
     * will NOT stop the other layers from loading.
     */

    const results =
      await Promise.allSettled(requests);


    /*
     * =========================================================
     * HELPER
     * =========================================================
     */

    const getResponse = (index) => {

      const result = results[index];

      if (
        !result ||
        result.status !== "fulfilled"
      ) {

        console.warn(
          `[RaahiMap] API ${index} failed:`,
          result?.reason
        );

        return null;
      }

      return result.value;
    };


    /*
     * =========================================================
     * RAW RESPONSES
     * =========================================================
     */

    const placesResponse =
      getResponse(0);

    const hotelsResponse =
      getResponse(1);

    const restaurantsResponse =
      getResponse(2);

    const eventsResponse =
      getResponse(3);

    const guidesResponse =
      getResponse(4);

    const emergencyResponse =
      getResponse(5);


    /*
     * =========================================================
     * EXTRACT ARRAYS
     * =========================================================
     *
     * Places city endpoint:
     *
     * {
     *   count,
     *   places: [...]
     * }
     *
     * Emergency city endpoint:
     *
     * {
     *   success,
     *   city,
     *   count,
     *   data: [...]
     * }
     *
     * Other APIs normally use data: [].
     */


    const places =
      placesResponse?.places ||
      placesResponse?.data ||
      [];


    const hotels =
      hotelsResponse?.data ||
      hotelsResponse?.hotels ||
      [];


    const restaurants =
      restaurantsResponse?.data ||
      restaurantsResponse?.restaurants ||
      [];


    const events =
      eventsResponse?.data ||
      eventsResponse?.events ||
      [];


    const guides =
      guidesResponse?.data ||
      guidesResponse?.guides ||
      [];


    const emergency =
      emergencyResponse?.data ||
      emergencyResponse?.emergency ||
      emergencyResponse?.emergencies ||
      [];


    /*
     * =========================================================
     * NORMALIZE ALL DATA
     * =========================================================
     */

    this.mapData = {

      places:
        this.normalizeItems(places),

      hotels:
        this.normalizeItems(hotels),

      restaurants:
        this.normalizeItems(restaurants),

      events:
        this.normalizeItems(events),

      guides:
        this.normalizeItems(guides),

      emergency:
        this.normalizeItems(emergency)

    };


    /*
     * =========================================================
     * DEBUG INFORMATION
     * =========================================================
     */

    console.log(
      `[RaahiMap] Direct city APIs loaded for ${city}`,
      {

        places:
          this.mapData.places.length,

        hotels:
          this.mapData.hotels.length,

        restaurants:
          this.mapData.restaurants.length,

        events:
          this.mapData.events.length,

        guides:
          this.mapData.guides.length,

        emergency:
          this.mapData.emergency.length

      }
    );


    /*
     * =========================================================
     * SHOW MARKERS
     * =========================================================
     */

    this.renderMarkers();


  } catch (error) {

    console.error(
      `[RaahiMap] Failed to load city map for ${city}:`,
      error
    );


    /*
     * Keep the map usable even if APIs fail.
     */

    this.mapData = {

      places: [],
      hotels: [],
      restaurants: [],
      events: [],
      guides: [],
      emergency: []

    };


    this.renderMarkers();


  } finally {

    this.loadingCity = false;

  }

},


  /* =========================================================
     DIRECT CITY DATA
     ========================================================= */

  async loadDirectCityData(city) {

    console.log(
      `[RaahiMap] Loading direct APIs for ${city}...`
    );


    const requests = [

      /*
       * Places
       */

      RaahiAPI.get(
        `/api/places?city=${encodeURIComponent(city)}&limit=50`
      ),

      /*
       * Hotels
       */

      RaahiAPI.get(
        `/api/hotels?city=${encodeURIComponent(city)}&limit=50`
      ),

      /*
       * Restaurants
       */

      RaahiAPI.get(
        `/api/restaurants?city=${encodeURIComponent(city)}&limit=50`
      ),

      /*
       * Events
       */

      RaahiAPI.get(
        `/api/events?city=${encodeURIComponent(city)}&limit=50`
      ),

      /*
       * Guides
       */

      RaahiAPI.get(
        `/api/guides?city=${encodeURIComponent(city)}&limit=50`
      ),

      /*
       * Emergency
       */

      RaahiAPI.get(
        `/api/emergency?city=${encodeURIComponent(city)}&limit=50`
      )
    ];


    const results =
      await Promise.allSettled(requests);


    const getValue = index => {

      const result =
        results[index];


      if (
        !result ||
        result.status !== "fulfilled"
      ) {

        console.warn(
          `[RaahiMap] Direct API ${index} failed.`,
          result?.reason
        );

        return null;
      }


      return result.value;
    };


    const placesResponse =
      getValue(0);

    const hotelsResponse =
      getValue(1);

    const restaurantsResponse =
      getValue(2);

    const eventsResponse =
      getValue(3);

    const guidesResponse =
      getValue(4);

    const emergencyResponse =
      getValue(5);


    /*
     * Places controller returns:
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     *
     * City endpoint returns:
     *
     * {
     *   count: ...,
     *   places: [...]
     * }
     */

    const places =
      placesResponse?.data ||
      placesResponse?.places ||
      [];


    const hotels =
      hotelsResponse?.data ||
      hotelsResponse?.hotels ||
      [];


    const restaurants =
      restaurantsResponse?.data ||
      restaurantsResponse?.restaurants ||
      [];


    const events =
      eventsResponse?.data ||
      eventsResponse?.events ||
      [];


    const guides =
      guidesResponse?.data ||
      guidesResponse?.guides ||
      [];


    const emergency =
      emergencyResponse?.data ||
      emergencyResponse?.emergency ||
      emergencyResponse?.emergencies ||
      [];


    this.mapData = {

      places:
        this.normalizeItems(places),

      hotels:
        this.normalizeItems(hotels),

      restaurants:
        this.normalizeItems(restaurants),

      events:
        this.normalizeItems(events),

      guides:
        this.normalizeItems(guides),

      emergency:
        this.normalizeItems(emergency)
    };


    console.log(
      `[RaahiMap] Direct APIs loaded for ${city}:`,
      {

        places:
          this.mapData.places.length,

        hotels:
          this.mapData.hotels.length,

        restaurants:
          this.mapData.restaurants.length,

        events:
          this.mapData.events.length,

        guides:
          this.mapData.guides.length,

        emergency:
          this.mapData.emergency.length
      }
    );


    this.renderMarkers();
  },


  /* =========================================================
     CRITICAL LAYERS
     ========================================================= */

  async loadCriticalLayersDirectly(city) {

    try {

      /*
       * Places API
       */

      const placesResponse =
        await RaahiAPI.get(
          `/api/places?city=${encodeURIComponent(city)}&limit=50`
        );


      /*
       * Emergency API
       */

      const emergencyResponse =
        await RaahiAPI.get(
          `/api/emergency?city=${encodeURIComponent(city)}&limit=50`
        );


      const places =
        placesResponse?.data ||
        placesResponse?.places ||
        [];


      const emergency =
        emergencyResponse?.data ||
        emergencyResponse?.emergency ||
        emergencyResponse?.emergencies ||
        [];


      this.mapData.places =
        this.normalizeItems(places);


      this.mapData.emergency =
        this.normalizeItems(emergency);


      console.log(
        "[RaahiMap] Critical layers refreshed:",
        {
          places:
            this.mapData.places.length,

          emergency:
            this.mapData.emergency.length
        }
      );


      this.renderMarkers();


    } catch (error) {

      console.error(
        "[RaahiMap] Critical layer loading failed:",
        error
      );
    }
  },


  /* =========================================================
     RENDER MARKERS
     ========================================================= */

  renderMarkers() {

    if (!this.markersLayer) {

      console.warn(
        "[RaahiMap] markersLayer not ready."
      );

      return;
    }


    this.markersLayer.clearLayers();


    const data =
      this.mapData || {};


    let markerCount = 0;


    /*
     * =======================================================
     * PLACES
     * =======================================================
     */

    if (
      ["all", "places"].includes(
        this.activeFilter
      ) &&
      Array.isArray(data.places)
    ) {

      data.places.forEach(place => {

        const lat =
          Number(place.lat);


        const lng =
          Number(place.lng);


        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {

          console.warn(
            "[RaahiMap] Place skipped:",
            place.name
          );

          return;
        }


        const icon =
          this.createCustomIcon(
            "temple_hindu",
            "#d97706"
          );


        const marker =
          L.marker(
            [lat, lng],
            { icon }
          );


        const placeId =
          place.id ||
          place.placeId ||
          place._id ||
          "";


        marker.bindPopup(`

          <div
            style="
              font-family:inherit;
              width:220px;
              padding:4px;
            "
          >

            ${
              place.image
                ? `
                  <img
                    src="${place.image}"
                    style="
                      width:100%;
                      height:110px;
                      object-fit:cover;
                      border-radius:8px;
                      margin-bottom:6px;
                    "
                  >
                `
                : ""
            }


            <span
              style="
                font-size:10px;
                font-weight:bold;
                text-transform:uppercase;
                color:#d97706;
              "
            >
              ${place.category || "Place"}
              ${place.city ? ` • ${place.city}` : ""}
            </span>


            <h4
              style="
                font-size:13px;
                font-weight:bold;
                margin:2px 0 6px;
                color:#1c1917;
              "
            >
              ${place.name || "Tourist Place"}
            </h4>


            <button
              onclick="RaahiMap.openPlace('${placeId}')"
              style="
                width:100%;
                padding:7px;
                background:#1c1917;
                color:white;
                border:none;
                border-radius:6px;
                font-size:11px;
                font-weight:bold;
                cursor:pointer;
              "
            >
              View Place Details
            </button>

          </div>

        `);


        this.markersLayer.addLayer(
          marker
        );


        markerCount++;
      });
    }


    /*
     * =======================================================
     * HOTELS
     * =======================================================
     */

    if (
      ["all", "hotels"].includes(
        this.activeFilter
      ) &&
      Array.isArray(data.hotels)
    ) {

      data.hotels.forEach(hotel => {

        const lat =
          Number(hotel.lat);


        const lng =
          Number(hotel.lng);


        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {

          return;
        }


        const icon =
          this.createCustomIcon(
            "hotel",
            "#059669"
          );


        const marker =
          L.marker(
            [lat, lng],
            { icon }
          );


        const hotelId =
          hotel.id ||
          hotel.hotelId ||
          hotel._id ||
          "";


        marker.bindPopup(`

          <div
            style="
              font-family:inherit;
              width:220px;
              padding:4px;
            "
          >

            ${
              hotel.image
                ? `
                  <img
                    src="${hotel.image}"
                    style="
                      width:100%;
                      height:110px;
                      object-fit:cover;
                      border-radius:8px;
                      margin-bottom:6px;
                    "
                  >
                `
                : ""
            }


            <span
              style="
                font-size:10px;
                font-weight:bold;
                text-transform:uppercase;
                color:#059669;
              "
            >
              Hotel
              ${hotel.city ? ` • ${hotel.city}` : ""}
            </span>


            <h4
              style="
                font-size:13px;
                font-weight:bold;
                margin:2px 0 6px;
                color:#1c1917;
              "
            >
              ${hotel.name || "Hotel"}
            </h4>


            <button
              onclick="RaahiMap.openHotel('${hotelId}')"
              style="
                width:100%;
                padding:7px;
                background:#059669;
                color:white;
                border:none;
                border-radius:6px;
                font-size:11px;
                font-weight:bold;
                cursor:pointer;
              "
            >
              Stay Details
            </button>

          </div>

        `);


        this.markersLayer.addLayer(
          marker
        );


        markerCount++;
      });
    }


    /*
     * =======================================================
     * RESTAURANTS
     * =======================================================
     */

    if (
      [
        "all",
        "restaurants",
        "dining"
      ].includes(this.activeFilter) &&
      Array.isArray(data.restaurants)
    ) {

      data.restaurants.forEach(
        restaurant => {

          const lat =
            Number(restaurant.lat);


          const lng =
            Number(restaurant.lng);


          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {

            return;
          }


          const icon =
            this.createCustomIcon(
              "restaurant",
              "#ea580c"
            );


          const marker =
            L.marker(
              [lat, lng],
              { icon }
            );


          const restaurantId =
            restaurant.id ||
            restaurant.restaurantId ||
            restaurant._id ||
            "";


          marker.bindPopup(`

            <div
              style="
                font-family:inherit;
                width:220px;
                padding:4px;
              "
            >

              ${
                restaurant.image
                  ? `
                    <img
                      src="${restaurant.image}"
                      style="
                        width:100%;
                        height:110px;
                        object-fit:cover;
                        border-radius:8px;
                        margin-bottom:6px;
                      "
                    >
                  `
                  : ""
              }


              <span
                style="
                  font-size:10px;
                  font-weight:bold;
                  text-transform:uppercase;
                  color:#ea580c;
                "
              >
                ${
                  restaurant.cuisine ||
                  "Restaurant"
                }
              </span>


              <h4
                style="
                  font-size:13px;
                  font-weight:bold;
                  margin:2px 0 6px;
                  color:#1c1917;
                "
              >
                ${
                  restaurant.name ||
                  "Restaurant"
                }
              </h4>


              <button
                onclick="RaahiMap.openRestaurant('${restaurantId}')"
                style="
                  width:100%;
                  padding:7px;
                  background:#ea580c;
                  color:white;
                  border:none;
                  border-radius:6px;
                  font-size:11px;
                  font-weight:bold;
                  cursor:pointer;
                "
              >
                Culinary Info
              </button>

            </div>

          `);


          this.markersLayer.addLayer(
            marker
          );


          markerCount++;
        }
      );
    }


    /*
     * =======================================================
     * EMERGENCY
     * =======================================================
     */

    if (
      ["all", "emergency"].includes(
        this.activeFilter
      ) &&
      Array.isArray(data.emergency)
    ) {

      data.emergency.forEach(
        emergency => {

          const lat =
            Number(emergency.lat);


          const lng =
            Number(emergency.lng);


          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {

            console.warn(
              "[RaahiMap] Emergency skipped:",
              emergency.name
            );

            return;
          }


          const phone =
            typeof emergency.phone === "string" &&
            emergency.phone.trim()
              ? emergency.phone
                  .split("/")[0]
                  .trim()
              : "";


          const icon =
            this.createCustomIcon(
              "local_hospital",
              "#dc2626"
            );


          const marker =
            L.marker(
              [lat, lng],
              { icon }
            );


          const serviceId =
            emergency.serviceId ||
            emergency.id ||
            emergency._id ||
            "";


          marker.bindPopup(`

            <div
              style="
                font-family:inherit;
                width:210px;
                padding:4px;
              "
            >

              <span
                style="
                  font-size:10px;
                  font-weight:bold;
                  text-transform:uppercase;
                  color:#dc2626;
                "
              >
                ${
                  emergency.type ||
                  "Emergency"
                }
                • 24x7
              </span>


              <h4
                style="
                  font-size:13px;
                  font-weight:bold;
                  margin:3px 0 5px;
                  color:#1c1917;
                "
              >
                ${
                  emergency.name ||
                  "Emergency Service"
                }
              </h4>


              <p
                style="
                  font-size:11px;
                  color:#57534e;
                  margin:0 0 7px;
                "
              >
                ${
                  emergency.address ||
                  "Address unavailable"
                }
              </p>


              ${
                phone
                  ? `
                    <a
                      href="tel:${phone}"
                      style="
                        display:block;
                        width:100%;
                        box-sizing:border-box;
                        padding:7px;
                        background:#dc2626;
                        color:white;
                        border-radius:6px;
                        text-align:center;
                        font-size:11px;
                        font-weight:bold;
                        text-decoration:none;
                      "
                    >
                      Call ${phone}
                    </a>
                  `
                  : `
                    <div
                      style="
                        text-align:center;
                        padding:7px;
                        background:#f5f5f4;
                        color:#78716c;
                        border-radius:6px;
                        font-size:11px;
                        font-weight:bold;
                      "
                    >
                      Phone unavailable
                    </div>
                  `
              }

            </div>

          `);


          this.markersLayer.addLayer(
            marker
          );


          markerCount++;
        }
      );
    }


    /*
     * =======================================================
     * EVENTS
     * =======================================================
     */

    if (
      ["all", "events"].includes(
        this.activeFilter
      ) &&
      Array.isArray(data.events)
    ) {

      data.events.forEach(event => {

        const lat =
          Number(event.lat);


        const lng =
          Number(event.lng);


        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {

          return;
        }


        const icon =
          this.createCustomIcon(
            "event",
            "#7c3aed"
          );


        const marker =
          L.marker(
            [lat, lng],
            { icon }
          );


        const eventId =
          event.id ||
          event.eventId ||
          event._id ||
          "";


        marker.bindPopup(`

          <div
            style="
              font-family:inherit;
              width:220px;
              padding:4px;
            "
          >

            <span
              style="
                font-size:10px;
                font-weight:bold;
                text-transform:uppercase;
                color:#7c3aed;
              "
            >
              Cultural Event
            </span>


            <h4
              style="
                font-size:13px;
                font-weight:bold;
                margin:3px 0 6px;
                color:#1c1917;
              "
            >
              ${
                event.name ||
                "Cultural Event"
              }
            </h4>


            <button
              onclick="RaahiMap.openEvent('${eventId}')"
              style="
                width:100%;
                padding:7px;
                background:#7c3aed;
                color:white;
                border:none;
                border-radius:6px;
                font-size:11px;
                font-weight:bold;
                cursor:pointer;
              "
            >
              Event Details
            </button>

          </div>

        `);


        this.markersLayer.addLayer(
          marker
        );


        markerCount++;
      });
    }


    /*
     * =======================================================
     * GUIDES
     * =======================================================
     */

    if (
      ["all", "guides"].includes(
        this.activeFilter
      ) &&
      Array.isArray(data.guides)
    ) {

      data.guides.forEach(guide => {

        const lat =
          Number(guide.lat);


        const lng =
          Number(guide.lng);


        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {

          return;
        }


        const icon =
          this.createCustomIcon(
            "person_pin",
            "#0891b2"
          );


        const marker =
          L.marker(
            [lat, lng],
            { icon }
          );


        const guideId =
          guide.id ||
          guide.guideId ||
          guide._id ||
          "";


        marker.bindPopup(`

          <div
            style="
              font-family:inherit;
              width:220px;
              padding:4px;
            "
          >

            <span
              style="
                font-size:10px;
                font-weight:bold;
                text-transform:uppercase;
                color:#0891b2;
              "
            >
              Verified Local Guide
            </span>


            <h4
              style="
                font-size:13px;
                font-weight:bold;
                margin:3px 0 6px;
                color:#1c1917;
              "
            >
              ${
                guide.name ||
                "Local Guide"
              }
            </h4>


            <button
              onclick="RaahiMap.openGuide('${guideId}')"
              style="
                width:100%;
                padding:7px;
                background:#0891b2;
                color:white;
                border:none;
                border-radius:6px;
                font-size:11px;
                font-weight:bold;
                cursor:pointer;
              "
            >
              View Guide
            </button>

          </div>

        `);


        this.markersLayer.addLayer(
          marker
        );


        markerCount++;
      });
    }


    /*
     * Final marker count
     */

    console.log(
      `[RaahiMap] Rendered ${markerCount} markers for "${this.activeFilter}".`
    );
  },


  /* =========================================================
     PLACE ACTION
     ========================================================= */

  openPlace(id) {

    if (!id) {
      console.warn(
        "[RaahiMap] Missing place ID."
      );

      return;
    }


    if (
      typeof RaahiPlaces !== "undefined" &&
      typeof RaahiPlaces.openDetailModal === "function"
    ) {

      RaahiPlaces.openDetailModal(id);

      return;
    }


    console.warn(
      "[RaahiMap] RaahiPlaces.openDetailModal() not available."
    );
  },


  /* =========================================================
     HOTEL ACTION
     ========================================================= */

  openHotel(id) {

    if (!id) {
      return;
    }


    if (
      typeof RaahiHotels !== "undefined" &&
      typeof RaahiHotels.openHotelModal === "function"
    ) {

      RaahiHotels.openHotelModal(id);

      return;
    }


    console.warn(
      "[RaahiMap] RaahiHotels.openHotelModal() not available."
    );
  },


  /* =========================================================
     RESTAURANT ACTION
     ========================================================= */

  openRestaurant(id) {

    if (!id) {
      return;
    }


    if (
      typeof RaahiRestaurants !== "undefined" &&
      typeof RaahiRestaurants.openRestModal === "function"
    ) {

      RaahiRestaurants.openRestModal(id);

      return;
    }


    console.warn(
      "[RaahiMap] RaahiRestaurants.openRestModal() not available."
    );
  },


  /* =========================================================
     EVENT ACTION
     ========================================================= */

  openEvent(id) {

    if (!id) {
      return;
    }


    if (
      typeof RaahiEvents !== "undefined" &&
      typeof RaahiEvents.openEventModal === "function"
    ) {

      RaahiEvents.openEventModal(id);

      return;
    }


    console.warn(
      "[RaahiMap] Event modal function not available."
    );
  },


  /* =========================================================
     GUIDE ACTION
     ========================================================= */

  openGuide(id) {

    if (!id) {
      return;
    }


    if (
      typeof RaahiGuides !== "undefined" &&
      typeof RaahiGuides.openGuideModal === "function"
    ) {

      RaahiGuides.openGuideModal(id);

      return;
    }


    console.warn(
      "[RaahiMap] RaahiGuides.openGuideModal() not available."
    );
  },


  /* =========================================================
     SET CITY
     ========================================================= */

  async setCity(cityName) {

    if (!cityName) {
      return;
    }


    const normalizedCity =
      String(cityName)
        .toLowerCase()
        .trim();


    /*
     * Wait for Leaflet.
     */

    if (!this.mapInstance) {

      console.log(
        `[RaahiMap] Map not ready. Waiting for ${cityName}...`
      );


      setTimeout(() => {

        this.setCity(cityName);

      }, 500);


      return;
    }


    /*
     * Find city data.
     */

    let city = null;


    /*
     * 1. City Hub backend city
     */

    if (
      typeof RaahiCityHub !== "undefined" &&
      RaahiCityHub.cityData
    ) {

      const hubCity =
        RaahiCityHub.cityData;


      if (
        hubCity.name &&
        hubCity.name
          .toLowerCase()
          .trim() === normalizedCity
      ) {

        city = hubCity;
      }
    }


    /*
     * 2. RAAHI_DATA fallback
     */

    if (
      !city &&
      typeof RAAHI_DATA !== "undefined"
    ) {

      city =
        (RAAHI_DATA.destinations || [])
          .find(destination => {

            const name =
              String(
                destination.name || ""
              )
                .toLowerCase()
                .trim();


            const id =
              String(
                destination.id || ""
              )
                .toLowerCase()
                .trim();


            return (
              name === normalizedCity ||
              id === normalizedCity
            );
          });
    }


    /*
     * If city isn't in frontend data,
     * we can still load backend data.
     *
     * Use a known city coordinate only
     * if the selected city itself doesn't
     * provide coordinates.
     */

    if (!city) {

      console.warn(
        `[RaahiMap] City metadata not found for ${cityName}. Loading backend data anyway.`
      );


      this.currentCity =
        cityName;


      await this.loadCityMap(
        cityName
      );


      return;
    }


    /*
     * City coordinates
     */

    const lat =
      Number(
        city.lat ??
        city.latitude
      );


    const lng =
      Number(
        city.lng ??
        city.longitude
      );


    /*
     * Center map if coordinates exist.
     */

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {

      this.mapInstance.setView(
        [lat, lng],
        13,
        {
          animate: true
        }
      );

    } else {

      console.warn(
        `[RaahiMap] Coordinates missing for city ${cityName}.`
      );
    }


    /*
     * Save current city.
     */

    this.currentCity =
      city.name || cityName;


    /*
     * Load backend markers.
     */

    await this.loadCityMap(
      city.name || cityName
    );


    /*
     * Fix Leaflet rendering after
     * page/layout transitions.
     */

    setTimeout(() => {

      if (this.mapInstance) {

        this.mapInstance.invalidateSize();

      }

    }, 300);


    console.log(
      `[RaahiMap] City map ready: ${this.currentCity}`
    );
  },


  /* =========================================================
     FLY TO DESTINATION
     * ========================================================= */

  flyToDestination(destId) {

    if (
      typeof RAAHI_DATA === "undefined"
    ) {
      return;
    }


    const destination =
      (RAAHI_DATA.destinations || [])
        .find(
          destination =>
            destination.id === destId
        );


    if (
      destination &&
      this.mapInstance
    ) {

      const lat =
        Number(
          destination.lat ??
          destination.latitude
        );


      const lng =
        Number(
          destination.lng ??
          destination.longitude
        );


      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {

        this.mapInstance.flyTo(
          [lat, lng],
          13,
          {
            duration: 1.5
          }
        );
      }
    }
  },


  /* =========================================================
     DEBUG
     ========================================================= */

  debug() {

    console.table({

      mapReady:
        !!this.mapInstance,

      markerLayerReady:
        !!this.markersLayer,

      activeFilter:
        this.activeFilter,

      currentCity:
        this.currentCity,

      places:
        this.mapData?.places?.length || 0,

      hotels:
        this.mapData?.hotels?.length || 0,

      restaurants:
        this.mapData?.restaurants?.length || 0,

      events:
        this.mapData?.events?.length || 0,

      guides:
        this.mapData?.guides?.length || 0,

      emergency:
        this.mapData?.emergency?.length || 0,

      renderedMarkers:
        this.markersLayer?.getLayers()?.length || 0
    });
  }

};



/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

if (typeof window !== "undefined") {
  window.RaahiMap = RaahiMap;
}