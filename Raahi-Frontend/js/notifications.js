/**
 * RAAHI — User Notifications
 *
 * Uses the existing Change Request API:
 * GET /api/change-requests/my
 *
 * Shows notifications when a user's
 * change request is Approved or Rejected.
 */

const RaahiNotifications = {

  requests: [],
  isOpen: false,
  loading: false,


  // =========================================================
  // INITIALIZE
  // =========================================================

  async init() {
    this.bindOutsideClick();
    await this.load();
  },


  // =========================================================
  // LOAD USER'S CHANGE REQUESTS
  // =========================================================

  async load() {

    if (this.loading) {
      return;
    }

    this.loading = true;

    try {

      // -----------------------------------------------------
      // Make sure the API exists
      // -----------------------------------------------------

      if (
        typeof RaahiAPI === "undefined" ||
        typeof RaahiAPI.getMyChangeRequests !== "function"
      ) {
        console.warn(
          "[RaahiNotifications] RaahiAPI is not available."
        );

        return;
      }


      // -----------------------------------------------------
      // Get only the logged-in user's requests
      // -----------------------------------------------------

      const response =
        await RaahiAPI.getMyChangeRequests();


      if (
        !response ||
        !response.success ||
        !Array.isArray(response.data)
      ) {

        this.requests = [];

        this.render();

        return;
      }


      // -----------------------------------------------------
      // Only completed requests are notifications
      //
      // Pending requests are NOT shown as notifications.
      // -----------------------------------------------------

      this.requests =
        response.data.filter(request =>
          request &&
          (
            request.status === "Approved" ||
            request.status === "Rejected"
          )
        );


      this.render();

    } catch (error) {

      console.warn(
        "[RaahiNotifications] Failed to load notifications:",
        error
      );

      this.requests = [];

      this.render();

    } finally {

      this.loading = false;
    }
  },


  // =========================================================
  // TOGGLE DROPDOWN
  // =========================================================

  async toggle() {

    const dropdown =
      document.getElementById(
        "notifications-dropdown"
      );

    if (!dropdown) {
      return;
    }


    this.isOpen =
      !this.isOpen;


    if (this.isOpen) {

      dropdown.classList.remove("hidden");

      // Refresh notifications whenever
      // the user opens the bell.
      await this.load();

    } else {

      dropdown.classList.add("hidden");
    }
  },


  // =========================================================
  // CLOSE DROPDOWN
  // =========================================================

  close() {

    const dropdown =
      document.getElementById(
        "notifications-dropdown"
      );

    if (dropdown) {
      dropdown.classList.add("hidden");
    }

    this.isOpen = false;
  },


  // =========================================================
  // OUTSIDE CLICK
  // =========================================================

  bindOutsideClick() {

    document.addEventListener(
      "click",
      event => {

        if (!this.isOpen) {
          return;
        }


        const container =
          document.getElementById(
            "notifications-container"
          );

        if (
          container &&
          !container.contains(event.target)
        ) {

          this.close();
        }
      }
    );
  },


  // =========================================================
  // RENDER
  // =========================================================

  render() {

    const list =
      document.getElementById(
        "notifications-list"
      );

    const count =
      document.getElementById(
        "notification-count"
      );

    const dot =
      document.getElementById(
        "notification-dot"
      );


    if (!list) {
      return;
    }


    // -------------------------------------------------------
    // Unread / notification indicator
    // -------------------------------------------------------

    if (dot) {

      if (this.requests.length > 0) {
        dot.classList.remove("hidden");
      } else {
        dot.classList.add("hidden");
      }
    }


    // -------------------------------------------------------
    // Count text
    // -------------------------------------------------------

    if (count) {

      if (this.requests.length === 0) {

        count.textContent =
          "No recent request updates";

      } else if (this.requests.length === 1) {

        count.textContent =
          "1 request update";

      } else {

        count.textContent =
          `${this.requests.length} request updates`;
      }
    }


    // -------------------------------------------------------
    // Empty state
    // -------------------------------------------------------

    if (this.requests.length === 0) {

      list.innerHTML = `
        <div class="px-4 py-10 text-center">

          <span
            class="material-symbols-outlined
                   text-4xl
                   text-stone-300
                   dark:text-stone-600">
            notifications_none
          </span>

          <p
            class="mt-3
                   text-sm
                   font-semibold
                   text-stone-700
                   dark:text-stone-300">
            No notifications
          </p>

          <p
            class="mt-1
                   text-xs
                   text-stone-500
                   dark:text-stone-500">
            Updates about your requests will appear here.
          </p>

        </div>
      `;

      return;
    }


    // -------------------------------------------------------
    // Notification items
    // -------------------------------------------------------

    list.innerHTML =
      this.requests
        .map(request =>
          this.createNotification(request)
        )
        .join("");
  },


  // =========================================================
  // CREATE NOTIFICATION HTML
  // =========================================================

  createNotification(request) {

    const approved =
      request.status === "Approved";


    const statusText =
      approved
        ? "Request Approved"
        : "Request Rejected";


    const icon =
      approved
        ? "check_circle"
        : "cancel";


    const resource =
      request.resourceType ||
      "resource";


    const requestType =
      request.requestType ||
      "request";


    const requestId =
      request.requestId ||
      "";


    const adminNote =
      request.adminNote ||
      "";


    const createdAt =
      request.reviewedAt ||
      request.updatedAt ||
      request.createdAt;


    const time =
      this.formatTime(createdAt);


    const title =
      approved
        ? `Your ${resource} request was approved`
        : `Your ${resource} request was rejected`;


    const message =
      adminNote ||
      (
        approved
          ? `Your ${requestType.toLowerCase()} request has been approved by the admin.`
          : `Your ${requestType.toLowerCase()} request has been rejected by the admin.`
      );


    return `
      <div
        class="
          px-4
          py-3.5
          border-b
          border-stone-100
          dark:border-stone-800
          hover:bg-stone-50
          dark:hover:bg-stone-800/60
          transition-colors
        "
      >

        <div class="flex gap-3">

          <!-- Status Icon -->

          <div
            class="
              shrink-0
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              ${
                approved
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }
            "
          >

            <span class="material-symbols-outlined text-xl">
              ${icon}
            </span>

          </div>


          <!-- Content -->

          <div class="min-w-0 flex-1">

            <div
              class="
                flex
                items-start
                justify-between
                gap-2
              "
            >

              <p
                class="
                  text-xs
                  font-bold
                  text-stone-900
                  dark:text-stone-100
                "
              >
                ${this.escapeHTML(statusText)}
              </p>

              <span
                class="
                  shrink-0
                  text-[10px]
                  text-stone-400
                  dark:text-stone-500
                "
              >
                ${this.escapeHTML(time)}
              </span>

            </div>


            <p
              class="
                mt-1
                text-xs
                font-semibold
                text-stone-700
                dark:text-stone-300
              "
            >
              ${this.escapeHTML(title)}
            </p>


            <p
              class="
                mt-1
                text-[11px]
                leading-relaxed
                text-stone-500
                dark:text-stone-400
              "
            >
              ${this.escapeHTML(message)}
            </p>


            ${
              requestId
                ? `
                  <p
                    class="
                      mt-2
                      text-[10px]
                      font-mono
                      text-stone-400
                      dark:text-stone-500
                    "
                  >
                    ${this.escapeHTML(requestId)}
                  </p>
                `
                : ""
            }

          </div>

        </div>

      </div>
    `;
  },


  // =========================================================
  // DATE / TIME FORMATTER
  // =========================================================

  formatTime(value) {

    if (!value) {
      return "";
    }

    const date =
      new Date(value);


    if (Number.isNaN(date.getTime())) {
      return "";
    }


    const now =
      new Date();


    const diff =
      now.getTime() -
      date.getTime();


    const seconds =
      Math.floor(diff / 1000);


    if (seconds < 60) {
      return "Just now";
    }


    const minutes =
      Math.floor(seconds / 60);


    if (minutes < 60) {
      return `${minutes}m ago`;
    }


    const hours =
      Math.floor(minutes / 60);


    if (hours < 24) {
      return `${hours}h ago`;
    }


    const days =
      Math.floor(hours / 24);


    if (days < 7) {
      return `${days}d ago`;
    }


    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  },


  // =========================================================
  // SAFE HTML ESCAPING
  // =========================================================

  escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

};


// ===========================================================
// GLOBAL
// ===========================================================

window.RaahiNotifications =
  RaahiNotifications;


// ===========================================================
// INITIALIZE AFTER PAGE LOAD
// ===========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    RaahiNotifications.init();

  }
);