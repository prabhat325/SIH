/**
 * RAAHI — Verified Tourist Transport & Vehicles Module
 *
 * Backend-compatible version
 *
 * Backend Vehicle fields:
 * vehicleId
 * vehicleType
 * city
 * state
 * baseFare
 * farePerKm
 * averageSpeed
 * contacts[]
 * images[]
 * available
 *
 * Features:
 * - Verified tourist transport
 * - City/category filtering
 * - Direct operator calling
 * - WhatsApp contact
 * - RTO/fare information
 * - Works from both Vehicles page AND City Hub
 */

const RaahiVehicles = {

  activeCategory: "all",
  selectedCity: "all",

  vehicles: [],

  currentPage: 1,
  totalPages: 1,
  totalVehicles: 0,
  vehiclesPerPage: 20,

  loadingPage: false,


  // =========================================================
  // NORMALIZE BACKEND VEHICLE
  // =========================================================

  normalizeVehicle(v = {}) {

    const firstContact =
      Array.isArray(v.contacts) && v.contacts.length
        ? v.contacts[0]
        : {};

    const vehicleId =
      v.vehicleId ||
      v.id ||
      v._id ||
      "";

    const vehicleType =
      v.vehicleType ||
      v.name ||
      "Tourist Vehicle";

    const city =
      v.city ||
      "";

    const state =
      v.state ||
      "";

    const image =
      v.images?.[0] ||
      v.image ||
      "";

    const phone =
      v.phone ||
      firstContact.phone ||
      "";

    const operator =
      v.operator ||
      firstContact.name ||
      "Verified Tourist Transport Operator";

    const baseFare =
      v.baseFare ?? 0;

    const farePerKm =
      v.farePerKm ?? 0;

    /*
     * Map backend vehicleType into UI categories.
     */
    const typeLower = String(vehicleType).toLowerCase();

    let category = "cab";

    if (
      typeLower.includes("electric") ||
      typeLower.includes("ev")
    ) {
      category = "ev";
    } else if (
      typeLower.includes("bike") ||
      typeLower.includes("motorcycle") ||
      typeLower.includes("scooter")
    ) {
      category = "rental";
    } else if (
      typeLower.includes("tempo") ||
      typeLower.includes("bus") ||
      typeLower.includes("coach") ||
      typeLower.includes("traveller")
    ) {
      category = "tempo";
    } else if (
      typeLower.includes("rickshaw") ||
      typeLower.includes("tuk") ||
      typeLower.includes("heritage")
    ) {
      category = "heritage";
    }

    return {

      // Original backend data
      ...v,

      // IMPORTANT ID
      id: vehicleId,
      vehicleId: vehicleId,

      // UI name
      name: vehicleType,
      vehicleType: vehicleType,

      // Category
      category: v.category || category,

      categoryLabel:
        v.categoryLabel ||
        vehicleType,

      // Location
      city: city,
      cityName:
        v.cityName ||
        city,

      state: state,

      // Image
      image: image,

      // Vehicle details
      capacity:
        v.capacity ||
        "Tourist vehicle",

      fuelType:
        v.fuelType ||
        "Fuel information unavailable",

      // Rating
      rating:
        v.rating ?? 0,

      tripsCount:
        v.tripsCount ?? 0,

      // Pricing
      baseFare: baseFare,

      farePerKm: farePerKm,

      pricePerDay:
        v.pricePerDay ||
        (
          baseFare > 0
            ? `₹${baseFare}`
            : "Fare on request"
        ),

      ratePerKm:
        v.ratePerKm ||
        (
          farePerKm > 0
            ? `₹${farePerKm}/km`
            : "Fare on request"
        ),

      // Features
      features:
        Array.isArray(v.features)
          ? v.features
          : [],

      // Operator
      operator: operator,

      // Contact
      phone: phone,

      whatsapp:
        v.whatsapp ||
        phone,

      // Verification
      rtoLicense:
        v.rtoLicense ||
        "Verified Commercial Vehicle",

      verifiedBadge:
        v.verifiedBadge ||
        "Verified Tourist Transport",

      // Pickup
      pickupLocations:
        v.pickupLocations ||
        "Airport, Railway Station & Central Tourist Areas",

      // Availability
      available:
        v.available !== false,

      // Fare rules
      fareRules:
        v.fareRules ||
        {
          basePackage:
            baseFare > 0
              ? `Base fare ₹${baseFare}`
              : "Fare available from operator",

          extraKm:
            farePerKm > 0
              ? `₹${farePerKm}/km`
              : "Additional distance as applicable",

          driverAllowance:
            "As applicable",

          tollTax:
            "Tolls, parking and applicable taxes may be charged separately"
        }
    };
  },


  // =========================================================
  // LOAD VEHICLES
  // =========================================================

  async loadPage(page = 1) {

    if (this.loadingPage) return;

    this.loadingPage = true;

    try {

      const response = await fetch(
        `/api/vehicles?page=${page}&limit=${this.vehiclesPerPage}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (
        !result.success ||
        !Array.isArray(result.data)
      ) {
        throw new Error(
          result.message ||
          "Invalid vehicles API response"
        );
      }

      this.vehicles =
        result.data.map(vehicle =>
          this.normalizeVehicle(vehicle)
        );

      if (
        typeof RAAHI_DATA !== "undefined"
      ) {
        RAAHI_DATA.vehicles = this.vehicles;
      }

      this.currentPage =
        result.page || page;

      this.totalPages =
        result.pages || 1;

      this.totalVehicles =
        result.total || this.vehicles.length;

      console.log(
        "✅ Vehicles loaded:",
        this.vehicles
      );

      this.renderVehicles();
      this.renderPagination();

    } catch (error) {

      console.error(
        "❌ Failed to load vehicles:",
        error
      );

      const container =
        document.getElementById(
          "vehicles-grid-container"
        );

      if (container) {

        container.innerHTML = `
          <div class="col-span-full p-10 text-center
            bg-white dark:bg-stone-900
            border border-red-200 dark:border-red-900
            rounded-3xl">

            <span class="material-symbols-outlined
              text-5xl text-red-500 mb-3">
              error
            </span>

            <h3 class="font-heading text-lg font-bold
              text-stone-900 dark:text-white">
              Unable to load vehicles
            </h3>

            <p class="text-xs text-stone-500 mt-2">
              Please refresh the page and try again.
            </p>

          </div>
        `;
      }

    } finally {

      this.loadingPage = false;
    }
  },


  // =========================================================
  // PAGINATION
  // =========================================================

  renderPagination() {

    const container =
      document.getElementById(
        "vehicles-pagination"
      );

    if (!container) return;

    if (this.totalPages <= 1) {

      container.innerHTML = "";

      return;
    }

    container.innerHTML = `
      <div class="flex items-center justify-center gap-2 py-6">

        <button
          type="button"
          onclick="RaahiVehicles.loadPage(${this.currentPage - 1})"
          ${this.currentPage === 1 ? "disabled" : ""}
          class="px-4 py-2 rounded-xl text-xs font-bold
          bg-stone-100 dark:bg-stone-800
          text-stone-700 dark:text-stone-200
          disabled:opacity-40
          disabled:cursor-not-allowed
          hover:bg-amber-100
          hover:text-amber-800">

          ← Previous

        </button>

        <span class="px-4 py-2 text-xs font-bold
          text-stone-600 dark:text-stone-300">

          Page ${this.currentPage}
          of ${this.totalPages}

        </span>

        <button
          type="button"
          onclick="RaahiVehicles.loadPage(${this.currentPage + 1})"
          ${this.currentPage === this.totalPages ? "disabled" : ""}
          class="px-4 py-2 rounded-xl text-xs font-bold
          bg-stone-100 dark:bg-stone-800
          text-stone-700 dark:text-stone-200
          disabled:opacity-40
          disabled:cursor-not-allowed
          hover:bg-amber-100
          hover:text-amber-800">

          Next →

        </button>

      </div>
    `;
  },


  // =========================================================
  // INIT
  // =========================================================

  async init() {

    this.bindEvents();

    await this.loadPage(1);
  },


  // =========================================================
  // CATEGORY EVENTS
  // =========================================================

  bindEvents() {

    document.addEventListener("click", (e) => {

      const catBtn =
        e.target.closest(
          ".vehicle-filter-btn"
        );

      if (!catBtn) return;

      const cat =
        catBtn.getAttribute(
          "data-cat"
        );

      if (cat) {

        this.setCategory(cat);
      }
    });
  },


  setCategory(cat) {

    this.activeCategory =
      cat || "all";

    document
      .querySelectorAll(
        ".vehicle-filter-btn"
      )
      .forEach(btn => {

        if (
          btn.getAttribute("data-cat") === cat
        ) {

          btn.className =
            "vehicle-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-md transition-all cursor-pointer";

        } else {

          btn.className =
            "vehicle-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer";
        }
      });

    this.renderVehicles();
  },


  filterByCity(city) {

    this.selectedCity =
      city || "all";

    this.renderVehicles();
  },


  // =========================================================
  // RENDER STANDALONE VEHICLES PAGE
  // =========================================================

  renderVehicles() {

    const container =
      document.getElementById(
        "vehicles-grid-container"
      );

    if (!container) return;

    let list =
      Array.isArray(this.vehicles)
        ? this.vehicles
        : [];


    // Category
    if (
      this.activeCategory !== "all"
    ) {

      list =
        list.filter(
          v =>
            v.category ===
            this.activeCategory
        );
    }


    // City
    if (
      this.selectedCity !== "all"
    ) {

      const normCity =
        String(this.selectedCity)
          .toLowerCase();

      list =
        list.filter(
          v =>
            String(v.city || "")
              .toLowerCase() ===
            normCity
        );
    }


    if (list.length === 0) {

      container.innerHTML = `
        <div class="col-span-full py-16
          text-center
          text-stone-500
          bg-white dark:bg-stone-900
          rounded-3xl
          border border-stone-200
          dark:border-stone-800
          p-8">

          <span class="material-symbols-outlined
            text-5xl text-amber-500 mb-3 block">
            directions_car
          </span>

          <h3 class="font-heading text-lg font-bold
            text-stone-800 dark:text-stone-200">

            No vehicles matching this filter

          </h3>

          <p class="text-xs text-stone-500 mt-1">

            Try switching categories or view
            all verified transport options.

          </p>

          <button
            type="button"
            onclick="RaahiVehicles.setCategory('all')"
            class="mt-4 px-4 py-2 rounded-xl
            bg-amber-600 text-white
            text-xs font-bold
            hover:bg-amber-700">

            View All Vehicles

          </button>

        </div>
      `;

      return;
    }


    container.innerHTML =
      list.map(item => {

        const phone =
          item.phone || "";

        const cleanPhone =
          phone.replace(
            /[\s\-+]/g,
            ""
          );

        return `

        <div class="bg-white dark:bg-stone-900
          border border-stone-200/90
          dark:border-stone-800
          rounded-3xl
          overflow-hidden
          shadow-sm
          hover:shadow-xl
          hover:border-amber-500/60
          dark:hover:border-amber-500/50
          transition-all duration-300
          flex flex-col
          justify-between
          group">

          <div>

            <!-- IMAGE -->

            <div class="relative h-52 overflow-hidden
              bg-stone-100 dark:bg-stone-800">

              ${
                item.image
                  ? `
                    <img
                      src="${item.image}"
                      alt="${item.name}"
                      class="w-full h-full object-cover
                      group-hover:scale-105
                      transition-transform duration-500"
                      loading="lazy"
                    >
                  `
                  : `
                    <div class="w-full h-full
                      flex items-center justify-center
                      bg-stone-900">

                      <span class="material-symbols-outlined
                        text-6xl text-stone-600">

                        directions_car

                      </span>

                    </div>
                  `
              }


              <div class="absolute top-3 left-3
                flex flex-col gap-1.5
                items-start">

                <span class="px-2.5 py-1 rounded-full
                  text-[10px] font-extrabold
                  uppercase tracking-wider
                  bg-black/75
                  backdrop-blur-md
                  text-amber-400
                  border border-amber-400/40">

                  ${item.categoryLabel}

                </span>


                <span class="px-2.5 py-0.5
                  rounded-full
                  text-[10px]
                  font-bold
                  bg-emerald-600/90
                  text-white
                  backdrop-blur-md
                  flex items-center gap-1">

                  <span class="material-symbols-outlined text-xs">
                    verified
                  </span>

                  ${item.cityName}

                </span>

              </div>


              <div class="absolute bottom-3 right-3
                px-2.5 py-1
                rounded-xl
                bg-black/80
                backdrop-blur-md
                text-white
                text-xs
                font-extrabold
                flex items-center gap-1">

                <span class="text-amber-400">
                  ★
                </span>

                <span>
                  ${item.rating || "Verified"}
                </span>

                ${
                  item.tripsCount
                    ? `
                      <span class="text-[10px]
                        text-stone-400
                        font-normal">

                        (${item.tripsCount} trips)

                      </span>
                    `
                    : ""
                }

              </div>

            </div>


            <!-- CONTENT -->

            <div class="p-6 space-y-3">

              <div class="space-y-1">

                <div class="flex items-center
                  justify-between gap-2">

                  <span class="text-[11px]
                    font-bold
                    text-stone-500
                    dark:text-stone-400
                    flex items-center gap-1
                    truncate">

                    <span class="material-symbols-outlined
                      text-xs text-amber-500">

                      storefront

                    </span>

                    <span class="truncate">

                      ${item.operator}

                    </span>

                  </span>


                  <span class="text-[10px]
                    px-2 py-0.5
                    rounded-full
                    bg-emerald-50
                    dark:bg-emerald-950/60
                    text-emerald-700
                    dark:text-emerald-300
                    font-bold
                    border border-emerald-300
                    dark:border-emerald-800
                    shrink-0">

                    RTO Verified

                  </span>

                </div>


                <h3 class="font-heading
                  text-lg
                  font-bold
                  text-stone-900
                  dark:text-white
                  group-hover:text-amber-600
                  dark:group-hover:text-amber-400
                  transition-colors">

                  ${item.name}

                </h3>

              </div>


              <div class="flex items-center
                gap-3
                text-xs
                text-stone-600
                dark:text-stone-300
                font-medium">

                <span class="flex items-center gap-1">

                  <span class="material-symbols-outlined
                    text-sm text-amber-500">

                    location_city

                  </span>

                  ${item.city}

                </span>

                ${
                  item.state
                    ? `
                      <span>•</span>

                      <span>
                        ${item.state}
                      </span>
                    `
                    : ""
                }

              </div>


              ${
                item.features.length
                  ? `
                    <div class="pt-1
                      flex flex-wrap gap-1.5">

                      ${item.features
                        .slice(0, 4)
                        .map(
                          f => `
                            <span class="px-2 py-0.5
                              rounded-lg
                              text-[10px]
                              font-medium
                              bg-stone-100
                              dark:bg-stone-800
                              text-stone-700
                              dark:text-stone-300
                              border
                              border-stone-200/60
                              dark:border-stone-700/60">

                              ✓ ${f}

                            </span>
                          `
                        )
                        .join("")}

                    </div>
                  `
                  : ""
              }

            </div>

          </div>


          <!-- FOOTER -->

          <div class="p-6 pt-0 space-y-3">

            <div class="pt-3
              border-t
              border-stone-100
              dark:border-stone-800
              flex items-center
              justify-between">

              <div>

                <span class="text-[11px]
                  text-stone-400
                  block font-medium">

                  Base Fare

                </span>

                <span class="text-base
                  font-extrabold
                  text-amber-600
                  dark:text-amber-400
                  font-mono">

                  ${item.pricePerDay}

                </span>

              </div>


              <div class="text-right">

                <span class="text-[11px]
                  text-stone-400
                  block font-medium">

                  Extra Km

                </span>

                <span class="text-xs
                  font-bold
                  text-stone-700
                  dark:text-stone-300">

                  ${item.ratePerKm}

                </span>

              </div>

            </div>


            <div class="grid grid-cols-2
              gap-2 pt-1">

              ${
                cleanPhone
                  ? `
                    <a
                      href="tel:${cleanPhone}"
                      class="py-2.5 px-3
                      rounded-xl
                      bg-emerald-600
                      hover:bg-emerald-700
                      text-white
                      text-xs
                      font-bold
                      shadow-sm
                      transition-all
                      flex items-center
                      justify-center gap-1.5">

                      <span class="material-symbols-outlined text-sm">
                        call
                      </span>

                      <span>
                        Call Desk
                      </span>

                    </a>
                  `
                  : `
                    <div
                      class="py-2.5 px-3
                      rounded-xl
                      bg-stone-100
                      dark:bg-stone-800
                      text-stone-400
                      text-xs
                      font-bold
                      flex items-center
                      justify-center">

                      No Phone

                    </div>
                  `
              }


              <button
                type="button"
                onclick="RaahiVehicles.openInfoModal('${item.vehicleId}')"
                class="py-2.5 px-3
                rounded-xl
                bg-stone-100
                dark:bg-stone-800
                hover:bg-stone-200
                dark:hover:bg-stone-700
                text-stone-800
                dark:text-stone-200
                text-xs
                font-bold
                border
                border-stone-200
                dark:border-stone-700
                transition-all
                flex items-center
                justify-center gap-1.5
                cursor-pointer">

                <span class="material-symbols-outlined
                  text-sm text-amber-500">

                  info

                </span>

                <span>
                  Tariff &amp; Info
                </span>

              </button>

            </div>

          </div>

        </div>

        `;

      }).join("");
  },


  // =========================================================
  // OPEN INFO MODAL
  //
  // IMPORTANT:
  // This works even when called from City Hub.
  // =========================================================

  async openInfoModal(vehicleId) {

    if (!vehicleId) {

      console.error(
        "[RaahiVehicles] Missing vehicleId"
      );

      return;
    }


    let item =
      this.vehicles.find(
        v =>
          v.vehicleId === vehicleId ||
          v.id === vehicleId ||
          v._id === vehicleId
      );


    // -------------------------------------------------------
    // If City Hub called this function, the vehicle may not
    // exist inside this.vehicles.
    //
    // Fetch it directly from backend.
    // -------------------------------------------------------

    if (!item) {

      try {

        console.log(
          "[RaahiVehicles] Fetching vehicle:",
          vehicleId
        );

        const response =
          await fetch(
            `/api/vehicles/${encodeURIComponent(vehicleId)}`
          );


        if (!response.ok) {

          throw new Error(
            `HTTP ${response.status}`
          );
        }


        const result =
          await response.json();


        if (
          !result.success ||
          !result.data
        ) {

          throw new Error(
            result.message ||
            "Vehicle not found"
          );
        }


        item =
          this.normalizeVehicle(
            result.data
          );


        // Keep it available for future calls
        const existingIndex =
          this.vehicles.findIndex(
            v =>
              v.vehicleId ===
              vehicleId
          );


        if (existingIndex >= 0) {

          this.vehicles[
            existingIndex
          ] = item;

        } else {

          this.vehicles.push(item);
        }


        console.log(
          "✅ Vehicle detail loaded:",
          item
        );

      } catch (error) {

        console.error(
          "[RaahiVehicles] Failed to load vehicle:",
          error
        );

        if (
          typeof RaahiApp !== "undefined" &&
          typeof RaahiApp.showToast === "function"
        ) {

          RaahiApp.showToast(
            "Unable to load vehicle details.",
            "error"
          );
        }

        return;
      }
    }


    const modal =
      document.getElementById(
        "vehicle-inquiry-modal"
      );

    const content =
      document.getElementById(
        "vehicle-inquiry-modal-content"
      );


    if (!modal || !content) {

      console.error(
        "[RaahiVehicles] Vehicle modal elements not found."
      );

      return;
    }


    const rules =
      item.fareRules || {};


    const phone =
      item.phone || "";


    const cleanPhone =
      phone.replace(
        /[\s\-+]/g,
        ""
      );


    const whatsapp =
      item.whatsapp ||
      item.phone ||
      "";


    const whatsappNum =
      whatsapp.replace(
        /[\s\-+]/g,
        ""
      );


    const whatsappMessage =
      encodeURIComponent(
        `Hello Raahi Tourism, I am inquiring about ${item.name} in ${item.cityName}.`
      );


    const whatsappUrl =
      whatsappNum
        ? `https://wa.me/${whatsappNum}?text=${whatsappMessage}`
        : "";


    content.innerHTML = `

      <div class="p-6 sm:p-8
        space-y-6
        bg-white
        dark:bg-stone-900
        rounded-3xl">


        <!-- HEADER -->

        <div class="flex items-center
          justify-between
          pb-4
          border-b
          border-stone-200
          dark:border-stone-800">

          <div class="flex items-center
            gap-3
            min-w-0">

            <div class="w-12 h-12
              rounded-2xl
              bg-amber-500/10
              text-amber-500
              flex items-center
              justify-center
              shrink-0">

              <span class="material-symbols-outlined
                text-2xl">

                directions_car

              </span>

            </div>


            <div class="min-w-0">

              <div class="flex items-center
                gap-2
                flex-wrap">

                <span class="px-2 py-0.5
                  rounded-full
                  text-[10px]
                  font-extrabold
                  bg-amber-100
                  dark:bg-amber-950/80
                  text-amber-800
                  dark:text-amber-300
                  uppercase">

                  ${item.categoryLabel}

                </span>


                <span class="text-[10px]
                  text-emerald-600
                  font-bold">

                  ✓ RTO Verified

                </span>

              </div>


              <h3 class="font-heading
                text-xl
                font-bold
                text-stone-900
                dark:text-white
                truncate
                mt-0.5">

                ${item.name}

              </h3>


              <p class="text-xs
                text-stone-500
                truncate">

                ${item.operator}
                •
                ${item.cityName}

              </p>

            </div>

          </div>


          <button
            type="button"
            onclick="RaahiVehicles.closeModal()"
            class="w-9 h-9
            rounded-full
            bg-stone-100
            dark:bg-stone-800
            text-stone-600
            dark:text-stone-300
            flex items-center
            justify-center
            hover:bg-stone-200
            dark:hover:bg-stone-700
            transition-colors
            shrink-0">

            <span class="material-symbols-outlined text-base">
              close
            </span>

          </button>

        </div>


        <!-- VEHICLE INFO -->

        <div class="grid
          grid-cols-1
          sm:grid-cols-2
          gap-3">

          <div class="p-4
            rounded-2xl
            bg-stone-50
            dark:bg-stone-800/60
            border
            border-stone-200
            dark:border-stone-700">

            <span class="text-[10px]
              font-bold
              uppercase
              text-stone-400">

              Vehicle Type

            </span>

            <p class="text-sm
              font-bold
              text-stone-900
              dark:text-white
              mt-1">

              ${item.vehicleType}

            </p>

          </div>


          <div class="p-4
            rounded-2xl
            bg-stone-50
            dark:bg-stone-800/60
            border
            border-stone-200
            dark:border-stone-700">

            <span class="text-[10px]
              font-bold
              uppercase
              text-stone-400">

              Location

            </span>

            <p class="text-sm
              font-bold
              text-stone-900
              dark:text-white
              mt-1">

              ${item.city}
              ${item.state ? `, ${item.state}` : ""}

            </p>

          </div>

        </div>


        <!-- CONTACT -->

        <div class="grid
          grid-cols-1
          sm:grid-cols-2
          gap-3">

          ${
            phone
              ? `
                <div class="p-4
                  rounded-2xl
                  bg-emerald-50/70
                  dark:bg-emerald-950/30
                  border
                  border-emerald-200
                  dark:border-emerald-800
                  flex items-center
                  justify-between
                  gap-3">

                  <div>

                    <span class="text-[10px]
                      font-extrabold
                      text-emerald-700
                      dark:text-emerald-400
                      uppercase">

                      Operator Helpline

                    </span>

                    <div class="text-base
                      font-extrabold
                      text-emerald-800
                      dark:text-emerald-300
                      font-mono
                      mt-0.5">

                      ${phone}

                    </div>

                  </div>


                  <a
                    href="tel:${cleanPhone}"
                    class="px-3.5 py-2
                    rounded-xl
                    bg-emerald-600
                    hover:bg-emerald-700
                    text-white
                    text-xs
                    font-bold
                    flex items-center
                    gap-1">

                    <span class="material-symbols-outlined text-sm">
                      call
                    </span>

                    Call

                  </a>

                </div>
              `
              : ""
          }


          ${
            whatsappUrl
              ? `
                <div class="p-4
                  rounded-2xl
                  bg-green-50/70
                  dark:bg-green-950/30
                  border
                  border-green-200
                  dark:border-green-800
                  flex items-center
                  justify-between
                  gap-3">

                  <div>

                    <span class="text-[10px]
                      font-extrabold
                      text-green-700
                      dark:text-green-400
                      uppercase">

                      WhatsApp Direct Chat

                    </span>

                    <div class="text-sm
                      font-bold
                      text-green-800
                      dark:text-green-300
                      mt-1">

                      ${whatsapp}

                    </div>

                  </div>


                  <a
                    href="${whatsappUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3.5 py-2
                    rounded-xl
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    text-xs
                    font-bold
                    flex items-center
                    gap-1">

                    <span class="material-symbols-outlined text-sm">
                      chat
                    </span>

                    Chat

                  </a>

                </div>
              `
              : ""
          }

        </div>


        <!-- TARIFF -->

        <div class="p-5
          rounded-2xl
          bg-stone-50
          dark:bg-stone-800/60
          border
          border-stone-200
          dark:border-stone-700
          space-y-3">

          <h4 class="font-heading
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-stone-800
            dark:text-stone-200
            flex items-center
            gap-1.5">

            <span class="material-symbols-outlined text-sm text-amber-500">
              receipt_long
            </span>

            Fare Structure

          </h4>


          <div class="grid
            grid-cols-1
            sm:grid-cols-2
            gap-3
            text-xs">


            <div class="p-3
              bg-white
              dark:bg-stone-900
              rounded-xl
              border
              border-stone-200/60
              dark:border-stone-700/60">

              <span class="text-[10px]
                text-stone-400
                block
                font-semibold">

                Base Fare

              </span>

              <span class="font-bold
                text-stone-900
                dark:text-white">

                ${
                  item.baseFare > 0
                    ? `₹${item.baseFare}`
                    : "On Request"
                }

              </span>

            </div>


            <div class="p-3
              bg-white
              dark:bg-stone-900
              rounded-xl
              border
              border-stone-200/60
              dark:border-stone-700/60">

              <span class="text-[10px]
                text-stone-400
                block
                font-semibold">

                Fare Per KM

              </span>

              <span class="font-bold
                text-stone-900
                dark:text-white">

                ${
                  item.farePerKm > 0
                    ? `₹${item.farePerKm}/km`
                    : "On Request"
                }

              </span>

            </div>


            <div class="p-3
              bg-white
              dark:bg-stone-900
              rounded-xl
              border
              border-stone-200/60
              dark:border-stone-700/60">

              <span class="text-[10px]
                text-stone-400
                block
                font-semibold">

                Average Speed

              </span>

              <span class="font-bold
                text-stone-900
                dark:text-white">

                ${
                  item.averageSpeed
                    ? `${item.averageSpeed} km/h`
                    : "Not specified"
                }

              </span>

            </div>


            <div class="p-3
              bg-white
              dark:bg-stone-900
              rounded-xl
              border
              border-stone-200/60
              dark:border-stone-700/60">

              <span class="text-[10px]
                text-stone-400
                block
                font-semibold">

                Availability

              </span>

              <span class="font-bold
                ${
                  item.available
                    ? "text-emerald-600"
                    : "text-red-600"
                }">

                ${
                  item.available
                    ? "Available"
                    : "Currently Unavailable"
                }

              </span>

            </div>

          </div>

        </div>


        <!-- PICKUP -->

        <div class="space-y-2">

          <span class="text-[11px]
            font-bold
            uppercase
            text-stone-500
            tracking-wider
            block">

            Pickup Information

          </span>


          <div class="p-3
            bg-stone-50
            dark:bg-stone-800/40
            rounded-xl
            border
            border-stone-200
            dark:border-stone-700
            text-stone-700
            dark:text-stone-300
            text-xs
            font-medium
            flex items-center
            gap-2">

            <span class="material-symbols-outlined
              text-base text-amber-500">

              pin_drop

            </span>

            <span>

              ${item.pickupLocations}

            </span>

          </div>

        </div>


        <!-- SAFETY -->

        <div class="p-4
          rounded-2xl
          bg-amber-500/10
          border
          border-amber-500/20
          space-y-2
          text-xs">

          <div class="flex items-center
            gap-2
            font-bold
            text-amber-700
            dark:text-amber-400">

            <span class="material-symbols-outlined text-base">
              shield
            </span>

            <span>
              Raahi Tourist Safety Advisory
            </span>

          </div>


          <ul class="space-y-1
            text-stone-600
            dark:text-stone-300
            text-[11px]
            list-disc
            list-inside">

            <li>
              Check the vehicle registration and
              operator details before travel.
            </li>

            <li>
              Confirm the fare with the operator
              before starting your journey.
            </li>

            <li>
              For emergencies, dial
              <strong>112</strong>.
            </li>

          </ul>

        </div>


        <!-- ACTIONS -->

        <div class="pt-2
          flex items-center
          justify-between
          gap-3">

          ${
            phone
              ? `
                <button
                  type="button"
                  onclick="RaahiVehicles.copyContact('${phone.replace(/'/g, "\\'")}')"
                  class="px-4 py-2.5
                  rounded-xl
                  bg-stone-100
                  dark:bg-stone-800
                  hover:bg-stone-200
                  dark:hover:bg-stone-700
                  text-stone-800
                  dark:text-stone-200
                  text-xs
                  font-bold
                  flex items-center
                  gap-1.5">

                  <span class="material-symbols-outlined text-sm">
                    content_copy
                  </span>

                  Copy Phone

                </button>
              `
              : ""
          }


          <button
            type="button"
            onclick="RaahiVehicles.closeModal()"
            class="px-6 py-2.5
            rounded-xl
            bg-amber-600
            hover:bg-amber-700
            text-white
            text-xs
            font-bold
            shadow-md">

            Close

          </button>

        </div>

      </div>
    `;


    modal.classList.remove("hidden");

    document.body.style.overflow =
      "hidden";
  },


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  closeModal() {

    const modal =
      document.getElementById(
        "vehicle-inquiry-modal"
      );

    if (modal) {

      modal.classList.add(
        "hidden"
      );

      document.body.style.overflow =
        "";
    }
  },


  // =========================================================
  // COPY PHONE
  // =========================================================

  copyContact(phone) {

    if (!phone) return;


    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {

      navigator.clipboard
        .writeText(phone)
        .then(() => {

          if (
            typeof RaahiApp !== "undefined" &&
            typeof RaahiApp.showToast === "function"
          ) {

            RaahiApp.showToast(
              `Operator hotline ${phone} copied to clipboard!`,
              "success"
            );
          }

        })
        .catch(() => {

          if (
            typeof RaahiApp !== "undefined" &&
            typeof RaahiApp.showToast === "function"
          ) {

            RaahiApp.showToast(
              `Operator phone: ${phone}`,
              "info"
            );
          }
        });

    } else {

      if (
        typeof RaahiApp !== "undefined" &&
        typeof RaahiApp.showToast === "function"
      ) {

        RaahiApp.showToast(
          `Operator phone: ${phone}`,
          "info"
        );
      }
    }
  }
};


// =========================================================
// GLOBAL EXPOSURE
// =========================================================

if (
  typeof window !== "undefined"
) {

  window.RaahiVehicles =
    RaahiVehicles;
}