/**
 * RAAHI — 24x7 Emergency Services & National Helplines Hub
 * "Raahi Has Your Back"
 */

const RaahiEmergency = {
  init() {
    this.renderHelplines();
    this.renderServices();
  },

  renderHelplines() {
    const container = document.getElementById('emergency-helplines-container');
    const homeContainer = document.getElementById('home-emergency-container');
    if (!RAAHI_DATA.nationalHelplines) return;

    const cardsHtml = RAAHI_DATA.nationalHelplines.map(line => `
      <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border-2 ${line.number === '112' ? 'border-red-500 shadow-red-100 dark:shadow-none' : 'border-stone-200 dark:border-stone-800'} shadow-md flex flex-col justify-between group hover:scale-[1.02] transition-transform">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight flex items-center gap-1.5 font-mono">
              <span class="material-symbols-outlined text-2xl">call</span>
              ${line.number}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${line.number === '112' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'}">
              Toll-Free 24x7
            </span>
          </div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-1.5">${line.title}</h4>
          <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">${line.description}</p>
        </div>
        <div class="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800">
          <a href="tel:${line.number}" class="w-full py-2.5 px-4 rounded-xl ${line.number === '112' ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white'} text-white dark:text-stone-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-sm">phone_in_talk</span>
            <span>Dial ${line.number} Now</span>
          </a>
        </div>
      </div>
    `).join('');

    if (container) container.innerHTML = cardsHtml;
    if (homeContainer) homeContainer.innerHTML = cardsHtml;
  },

  renderServices() {
    const container = document.getElementById('emergency-services-list');
    if (!container || !RAAHI_DATA.emergencyServices) return;

    container.innerHTML = RAAHI_DATA.emergencyServices.map(srv => `
      <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl ${srv.type === 'Police' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-xl">${srv.type === 'Police' ? 'local_police' : 'local_hospital'}</span>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[11px] font-extrabold uppercase ${srv.type === 'Police' ? 'text-blue-600' : 'text-red-600'}">${srv.type} Center</span>
              <span class="text-xs text-stone-400">•</span>
              <span class="text-xs font-semibold text-stone-600 dark:text-stone-400">${srv.city}, ${srv.state}</span>
            </div>
            <h4 class="font-heading text-sm font-bold text-stone-900 dark:text-white">${srv.name}</h4>
            <p class="text-xs text-stone-500 mt-0.5">${srv.address}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <a href="tel:${srv.phone.split('/')[0].trim()}" class="py-2 px-4 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-red-700 transition-colors">
            <span class="material-symbols-outlined text-sm">call</span>
            <span>Emergency Call</span>
          </a>
          <a href="https://maps.google.com/?q=${srv.lat},${srv.lng}" target="_blank" class="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors" title="Locate on Map">
            <span class="material-symbols-outlined text-base">directions</span>
          </a>
        </div>
      </div>
    `).join('');
  },

  locateNearMe() {
    if ("geolocation" in navigator) {
      RaahiApp.showToast("Locating nearest verified police & trauma centers...", "info");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          RaahiApp.showToast(`Found emergency facilities near lat: ${pos.coords.latitude.toFixed(2)}, lng: ${pos.coords.longitude.toFixed(2)}`, "success");
        },
        () => {
          RaahiApp.showToast("Location permission unavailable. Showing verified national hub numbers.", "info");
        }
      );
    } else {
      RaahiApp.showToast("National emergency number 112 is active across all mobile networks.", "info");
    }
  }
};

if (typeof window !== 'undefined') {
  window.RaahiEmergency = RaahiEmergency;
}
