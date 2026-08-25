/**
 * RAAHI — Cultural Events & Festivals Discovery Module
 * Strictly for Event Discovery & Information. NO TICKET BOOKING.
 */

const RaahiEvents = {
  searchQuery: '',

  init() {
    this.bindEvents();
    this.renderEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('events-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderEvents();
      });
    }
  },

  getFilteredEvents() {
    if (!RAAHI_DATA.events) return [];
    return RAAHI_DATA.events.filter(ev => {
      if (this.searchQuery) {
        const match = ev.name.toLowerCase().includes(this.searchQuery) ||
                      ev.city.toLowerCase().includes(this.searchQuery) ||
                      ev.category.toLowerCase().includes(this.searchQuery) ||
                      ev.description.toLowerCase().includes(this.searchQuery);
        if (!match) return false;
      }
      return true;
    });
  },

  renderEvents() {
    const container = document.getElementById('events-grid-container');
    const homeContainer = document.getElementById('home-events-container');
    if (!container && !homeContainer) return;

    const list = this.getFilteredEvents();

    const renderCard = (ev) => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
        <div class="relative h-56 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img src="${ev.image}" alt="${ev.name}" loading="lazy" class="w-full h-full object-cover img-zoom">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div class="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white">
              ${ev.category}
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
              ${ev.city}
            </span>
          </div>

          <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
            <span class="text-xs text-amber-300 font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">calendar_month</span>
              ${ev.date}
            </span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
              ${ev.name}
            </h3>
            <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
              ${ev.description}
            </p>

            <div class="mb-4">
              <span class="text-[10px] font-bold uppercase text-stone-400 tracking-wider block mb-1">Key Highlights</span>
              <div class="flex flex-wrap gap-1">
                ${ev.highlights.slice(0, 2).map(h => `
                  <span class="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                    • ${h}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <div>
            <div class="py-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 mb-3 truncate">
              <span class="material-symbols-outlined text-xs align-middle text-amber-600 mr-0.5">location_on</span>
              ${ev.location}
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="RaahiEvents.openEventModal('${ev.id}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1">
                <span>View Event</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button onclick="RaahiCommunity.openSuggestModal('${ev.id}', 'event', '${ev.name}')" class="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 transition-all flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                <span>Suggest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (container) {
      container.innerHTML = list.map(renderCard).join('');
    }

    if (homeContainer) {
      homeContainer.innerHTML = list.slice(0, 3).map(renderCard).join('');
    }
  },

  openEventModal(eventId) {
    const ev = RAAHI_DATA.events.find(e => e.id === eventId);
    if (!ev) return;

    const modal = document.getElementById('event-detail-modal');
    const content = document.getElementById('event-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="relative h-72 w-full overflow-hidden bg-stone-900">
        <img src="${ev.image}" alt="${ev.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        <button onclick="RaahiEvents.closeEventModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>

        <div class="absolute bottom-6 left-6 right-6 text-white z-10">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-600 text-white">${ev.category}</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white">${ev.city}, ${ev.state}</span>
          </div>
          <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-white">${ev.name}</h2>
        </div>
      </div>

      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900">
        <div class="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-600">event</span>
          <span>Raahi is a festival discovery platform. Public festival access schedules are verified with local tourism boards.</span>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2">Event Schedule & Overview</h4>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${ev.description}</p>
        </div>

        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2">Program Highlights</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${ev.highlights.map(h => `
              <div class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-200 dark:border-stone-700">
                <span class="material-symbols-outlined text-sm text-amber-600">star</span>
                <span>${h}</span>
              </div>
            `).join('')}
          </div>
        </div>

        ${ev.gallery && ev.gallery.length ? `
        <div>
          <h4 class="font-heading text-base font-bold text-stone-900 dark:text-white mb-2">Festival Photo Gallery</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${ev.gallery.map((img, idx) => `
              <div class="h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
                <img src="${img}" alt="${ev.name} ${idx + 1}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-800 pt-5">
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Dates & Timings</span>
            <span class="text-xs font-bold text-stone-900 dark:text-white">${ev.date} (${ev.time})</span>
          </div>
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Organizing Body</span>
            <span class="text-xs text-stone-700 dark:text-stone-300">${ev.organizer}</span>
          </div>
        </div>

        <div class="border-t border-stone-200 dark:border-stone-800 pt-5 flex items-center justify-between">
          <button onclick="RaahiEvents.closeEventModal(); RaahiCommunity.openSuggestModal('${ev.id}', 'event', '${ev.name}')" class="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold hover:bg-amber-100 hover:text-amber-800 transition-colors flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-amber-600">edit_note</span>
            <span>Suggest a Change</span>
          </button>
          <button onclick="RaahiEvents.closeEventModal()" class="px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeEventModal() {
    const modal = document.getElementById('event-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
};

if (typeof window !== 'undefined') {
  window.RaahiEvents = RaahiEvents;
}
