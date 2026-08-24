/**
 * RAAHI - Destinations Explorer Module (Advanced Edition)
 * Search, region filtering, interactive India map visualizer, bookmarks, and detailed modal inspector.
 */

const RaahiDestinations = {
  currentFilter: 'all',
  searchQuery: '',
  bookmarkedIds: new Set(),

  init() {
    this.loadBookmarks();
    this.bindEvents();
    this.renderDestinations();
    this.renderInteractiveMapHotspots();
  },

  loadBookmarks() {
    const saved = localStorage.getItem('raahi_bookmarked_destinations');
    if (saved) {
      try {
        this.bookmarkedIds = new Set(JSON.parse(saved));
      } catch (e) {
        this.bookmarkedIds = new Set();
      }
    }
  },

  toggleBookmark(id, event) {
    if (event) event.stopPropagation();
    if (this.bookmarkedIds.has(id)) {
      this.bookmarkedIds.delete(id);
      RaahiApp.showToast("Removed from saved destinations");
    } else {
      this.bookmarkedIds.add(id);
      RaahiApp.showToast("Saved to your travel wishlist!");
    }
    localStorage.setItem('raahi_bookmarked_destinations', JSON.stringify([...this.bookmarkedIds]));
    this.renderDestinations();
  },

  bindEvents() {
    // Region Filter Chips
    const filterButtons = document.querySelectorAll('.region-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
          b.classList.add('bg-surface-container', 'text-on-surface');
        });
        btn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
        btn.classList.remove('bg-surface-container', 'text-on-surface');

        this.currentFilter = btn.getAttribute('data-region') || 'all';
        this.renderDestinations();
      });
    });

    // Search Input
    const searchInputs = document.querySelectorAll('.destination-search-input');
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderDestinations();
      });
    });
  },

  renderInteractiveMapHotspots() {
    const container = document.getElementById('map-hotspots-container');
    if (!container) return;

    const hotspots = [
      { id: 'himalayas-north', top: '16%', left: '34%', name: 'Himalayas & Ladakh', temp: '16°C' },
      { id: 'thar-desert', top: '35%', left: '26%', name: 'Royal Rajasthan', temp: '28°C' },
      { id: 'adalaj-stepwell', top: '48%', left: '22%', name: 'Gujarat Stepwells', temp: '26°C' },
      { id: 'heritage-temples', top: '44%', left: '46%', name: 'Central Khajuraho', temp: '27°C' },
      { id: 'misty-tea-gardens', top: '34%', left: '76%', name: 'Darjeeling & Assam', temp: '18°C' },
      { id: 'goa-coastal', top: '68%', left: '27%', name: 'Goa Coastal Coves', temp: '29°C' },
      { id: 'kerala-backwaters', top: '84%', left: '33%', name: 'Kerala Backwaters', temp: '28°C' },
      { id: 'radhanagar-cove', top: '78%', left: '84%', name: 'Andaman Islands', temp: '27°C' }
    ];

    container.innerHTML = hotspots.map(spot => `
      <div onclick="RaahiDestinations.openDetailModal('${spot.id}')" 
           class="map-hotspot absolute cursor-pointer group" 
           style="top: ${spot.top}; left: ${spot.left};">
        <div class="relative flex items-center justify-center">
          <span class="w-5 h-5 rounded-full bg-secondary-fixed/50 animate-ping absolute"></span>
          <span class="w-4 h-4 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-lg border-2 border-white z-10">
            <span class="material-symbols-outlined text-[10px] font-bold">location_on</span>
          </span>
        </div>
        <div class="hidden sm:block absolute left-6 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl border border-white/20">
          <span class="font-bold block">${spot.name}</span>
          <span class="text-[10px] text-secondary-fixed">${spot.temp} • Click to Explore</span>
        </div>
      </div>
    `).join('');
  },

  renderDestinations() {
    const iconicGrid = document.getElementById('destinations-iconic-grid');
    const gemsGrid = document.getElementById('destinations-gems-grid');

    const filtered = RAAHI_DATA.destinations.filter(item => {
      const matchesFilter = this.currentFilter === 'all' || 
                            item.regionCategory === this.currentFilter || 
                            item.region.toLowerCase().includes(this.currentFilter);
      const matchesSearch = !this.searchQuery || 
                            item.name.toLowerCase().includes(this.searchQuery) || 
                            item.region.toLowerCase().includes(this.searchQuery) ||
                            item.description.toLowerCase().includes(this.searchQuery) ||
                            item.tag.toLowerCase().includes(this.searchQuery);
      return matchesFilter && matchesSearch;
    });

    if (iconicGrid) {
      const iconicItems = filtered.filter(d => d.featured);
      if (iconicItems.length === 0) {
        iconicGrid.innerHTML = `
          <div class="col-span-full py-12 text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
            <p>No destinations found matching your criteria.</p>
          </div>
        `;
      } else {
        iconicGrid.innerHTML = iconicItems.map((item, index) => {
          const isBookmarked = this.bookmarkedIds.has(item.id);
          const isLarge = index === 0;
          return `
            <div onclick="RaahiDestinations.openDetailModal('${item.id}')" 
                 class="${isLarge ? 'md:col-span-2 md:row-span-2 min-h-[360px]' : 'min-h-[260px]'} tilt-card relative group rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 transition-all duration-500 hover:shadow-xl">
              <img src="${item.image}" alt="${item.name}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              
              <!-- Bookmark icon -->
              <button onclick="RaahiDestinations.toggleBookmark('${item.id}', event)" 
                      class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all">
                <span class="material-symbols-outlined text-sm ${isBookmarked ? 'fill-1 text-secondary-container' : ''}">
                  ${isBookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>

              <!-- Tag Pill -->
              <div class="absolute top-4 left-4 z-10">
                <span class="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white uppercase tracking-wider">
                  ${item.region}
                </span>
              </div>

              <!-- Content -->
              <div class="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end text-white">
                <h3 class="${isLarge ? 'font-display-lg-mobile md:text-3xl' : 'font-headline-md text-xl'} font-bold mb-1 group-hover:text-secondary-fixed transition-colors">
                  ${item.name}
                </h3>
                <p class="text-xs md:text-sm text-white/80 line-clamp-2 mb-3">${item.description}</p>
                <div class="flex items-center text-xs font-semibold text-secondary-fixed gap-1">
                  <span>Explore Region</span>
                  <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    if (gemsGrid) {
      const gemItems = filtered.filter(d => !d.featured);
      gemsGrid.innerHTML = gemItems.map(item => {
        const isBookmarked = this.bookmarkedIds.has(item.id);
        return `
          <div class="tilt-card bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div class="relative h-48 overflow-hidden group cursor-pointer" onclick="RaahiDestinations.openDetailModal('${item.id}')">
              <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <button onclick="RaahiDestinations.toggleBookmark('${item.id}', event)" 
                      class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all">
                <span class="material-symbols-outlined text-xs ${isBookmarked ? 'fill-1 text-secondary-container' : ''}">
                  ${isBookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
              <div class="absolute bottom-2 left-2">
                <span class="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] rounded-md font-medium">
                  ${item.tag}
                </span>
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 class="font-headline-md text-base font-bold text-primary dark:text-inverse-primary mb-2">${item.name}</h4>
                <p class="text-xs text-on-surface-variant line-clamp-3 mb-4">${item.description}</p>
              </div>
              <button onclick="RaahiDestinations.openDetailModal('${item.id}')" 
                      class="w-full py-2 px-4 rounded-lg border border-outline-variant/60 hover:border-primary hover:bg-primary/5 text-primary dark:text-inverse-primary font-semibold text-xs transition-all flex items-center justify-center gap-1">
                View Details
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  openDetailModal(destId) {
    const item = RAAHI_DATA.destinations.find(d => d.id === destId);
    if (!item) return;

    const modal = document.getElementById('destination-detail-modal');
    const content = document.getElementById('destination-modal-content');

    if (modal && content) {
      content.innerHTML = `
        <div class="relative">
          <div class="relative h-72 w-full overflow-hidden">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <button onclick="RaahiDestinations.closeDetailModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
            <div class="absolute bottom-4 left-6 right-6 text-white">
              <span class="px-3 py-1 bg-secondary text-on-secondary text-xs rounded-full font-semibold uppercase tracking-wider mb-2 inline-block">
                ${item.region}
              </span>
              <h2 class="font-display-lg text-2xl md:text-3xl font-bold">${item.name}</h2>
              <p class="text-sm text-white/80">${item.tag}</p>
            </div>
          </div>

          <div class="p-6 md:p-8 space-y-6">
            <div>
              <h4 class="font-label-sm text-xs uppercase tracking-wider text-outline mb-2">Overview</h4>
              <p class="text-sm md:text-base text-on-surface leading-relaxed">${item.description}</p>
            </div>

            <!-- Fast Facts Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-surface-container dark:bg-surface-container-high p-4 rounded-xl">
              <div>
                <span class="block text-[11px] text-on-surface-variant font-medium">Best Season</span>
                <span class="font-semibold text-xs md:text-sm text-primary dark:text-inverse-primary">${item.bestTimeToVisit}</span>
              </div>
              <div>
                <span class="block text-[11px] text-on-surface-variant font-medium">Typical Weather</span>
                <span class="font-semibold text-xs md:text-sm text-on-surface">${item.temperature}</span>
              </div>
              <div>
                <span class="block text-[11px] text-on-surface-variant font-medium">Ideal Duration</span>
                <span class="font-semibold text-xs md:text-sm text-on-surface">${item.idealDuration}</span>
              </div>
            </div>

            <!-- Key Highlights -->
            <div>
              <h4 class="font-label-sm text-xs uppercase tracking-wider text-outline mb-3">Curated Highlights</h4>
              <ul class="space-y-2">
                ${item.highlights.map(h => `
                  <li class="flex items-start gap-2 text-sm text-on-surface">
                    <span class="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">check_circle</span>
                    <span>${h}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Modal Action Footer -->
            <div class="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-3 justify-end">
              <button onclick="RaahiDestinations.addToPlanner('${item.name}')" 
                      class="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-sm">
                <span class="material-symbols-outlined text-base">auto_awesome</span>
                Plan Trip to ${item.name.split(' ')[0]}
              </button>
              <button onclick="RaahiDestinations.closeDetailModal()" class="px-5 py-3 border border-outline-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeDetailModal() {
    const modal = document.getElementById('destination-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  addToPlanner(destinationName) {
    this.closeDetailModal();
    RaahiPlanner.prefillPlanner(destinationName);
    RaahiApp.navigate('planner');
    RaahiApp.showToast(`Selected ${destinationName} in AI Trip Planner!`);
  }
};
