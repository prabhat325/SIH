/**
 * RAAHI — Local Guides Directory Module
 * "Meet the People Who Know the Place"
 */

const RaahiGuides = {
  searchQuery: '',

  init() {
    this.bindEvents();
    this.renderGuides();
  },

  bindEvents() {
    const searchInput = document.getElementById('guides-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderGuides();
      });
    }
  },

  getFilteredGuides() {
    if (!RAAHI_DATA.guides) return [];
    return RAAHI_DATA.guides.filter(g => {
      if (this.searchQuery) {
        const match = g.name.toLowerCase().includes(this.searchQuery) ||
                      g.city.toLowerCase().includes(this.searchQuery) ||
                      g.specialization.toLowerCase().includes(this.searchQuery) ||
                      g.languages.some(l => l.toLowerCase().includes(this.searchQuery));
        if (!match) return false;
      }
      return true;
    });
  },

  renderGuides() {
    const container = document.getElementById('guides-grid-container');
    const homeContainer = document.getElementById('home-guides-container');
    if (!container && !homeContainer) return;

    const list = this.getFilteredGuides();

    const renderCard = (g) => `
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover p-6">
        <div class="flex items-start gap-4 mb-4">
          <img src="${g.photo}" alt="${g.name}" class="w-16 h-16 rounded-full object-cover border-2 border-amber-600 shadow-md">
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">${g.city}, ${g.state}</span>
              <span class="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <span class="material-symbols-outlined text-sm">star</span>
                ${g.rating} (${g.reviewsCount})
              </span>
            </div>
            <h3 class="font-heading text-base font-bold text-stone-900 dark:text-white mt-0.5">${g.name}</h3>
            <span class="text-xs text-stone-500 font-medium">${g.experience}</span>
          </div>
        </div>

        <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 mb-4 leading-relaxed">
          ${g.about}
        </p>

        <div class="space-y-2 mb-5 border-t border-stone-100 dark:border-stone-800 pt-3">
          <div>
            <span class="text-[10px] font-bold text-stone-400 uppercase block mb-1">Languages Spoken</span>
            <div class="flex flex-wrap gap-1">
              ${g.languages.map(l => `
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">${l}</span>
              `).join('')}
            </div>
          </div>
          <div>
            <span class="text-[10px] font-bold text-stone-400 uppercase block mb-1">Expertise</span>
            <span class="text-xs text-amber-900 dark:text-amber-300 font-semibold">${g.specialization}</span>
          </div>
        </div>

        <div class="mt-auto">
          <button onclick="RaahiGuides.openGuideModal('${g.id}')" class="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-1.5">
            <span>View Verified Profile</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    `;

    if (container) container.innerHTML = list.map(renderCard).join('');
    if (homeContainer) homeContainer.innerHTML = list.slice(0, 3).map(renderCard).join('');
  },

  openGuideModal(guideId) {
    const g = RAAHI_DATA.guides.find(item => item.id === guideId);
    if (!g) return;

    const modal = document.getElementById('guide-detail-modal');
    const content = document.getElementById('guide-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6 bg-white dark:bg-stone-900">
        <div class="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div class="flex items-center gap-4">
            <img src="${g.photo}" alt="${g.name}" class="w-20 h-20 rounded-full object-cover border-4 border-amber-600 shadow-md">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Certified Heritage Guide
              </span>
              <h3 class="font-heading text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">${g.name}</h3>
              <p class="text-xs text-stone-500">${g.city}, ${g.state} • ${g.experience}</p>
            </div>
          </div>
          <button onclick="RaahiGuides.closeGuideModal()" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div>
          <h4 class="font-heading text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2">About the Guide</h4>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${g.about}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Languages Mastered</span>
            <div class="flex flex-wrap gap-1">
              ${g.languages.map(l => `<span class="text-xs font-semibold text-stone-800 dark:text-stone-200">• ${l}</span>`).join(' ')}
            </div>
          </div>
          <div>
            <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Specialization</span>
            <span class="text-xs font-bold text-amber-700 dark:text-amber-300">${g.specialization}</span>
          </div>
        </div>

        <div class="border-t border-stone-200 dark:border-stone-800 pt-4">
          <span class="text-[11px] font-bold text-stone-400 uppercase block mb-1">Direct Contact Details</span>
          <span class="text-xs font-bold text-stone-900 dark:text-white">${g.contact}</span>
        </div>

        <div class="border-t border-stone-200 dark:border-stone-800 pt-4 flex justify-end">
          <button onclick="RaahiGuides.closeGuideModal()" class="px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeGuideModal() {
    const modal = document.getElementById('guide-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
};

if (typeof window !== 'undefined') {
  window.RaahiGuides = RaahiGuides;
}
