/**
 * RAAHI - Curated Experiences Module
 * Category filtering, pricing calculator, booking inquiry modal, and specialty curations.
 */

const RaahiExperiences = {
  currentCategory: 'all',
  selectedCurrency: 'INR',

  init() {
    this.bindEvents();
    this.renderExperiences();
    this.renderSpecialtyCurations();
  },

  bindEvents() {
    // Category Filter Buttons
    const categoryButtons = document.querySelectorAll('.experience-category-btn');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => {
          b.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
          b.classList.add('bg-surface-container', 'text-on-surface');
        });
        btn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
        btn.classList.remove('bg-surface-container', 'text-on-surface');

        this.currentCategory = btn.getAttribute('data-category') || 'all';
        this.renderExperiences();
      });
    });
  },

  renderExperiences() {
    const grid = document.getElementById('experiences-grid');
    if (!grid) return;

    const filtered = RAAHI_DATA.experiences.filter(item => {
      return this.currentCategory === 'all' || item.category === this.currentCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-2 text-outline">spa</span>
          <p>No experiences found in this category.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((item, index) => {
      const isFeatureLarge = index === 0;
      return `
        <div onclick="RaahiExperiences.openExperienceModal('${item.id}')" 
             class="${isFeatureLarge ? 'md:col-span-8 min-h-[380px]' : 'md:col-span-4 min-h-[320px]'} group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.04)] bg-white dark:bg-surface-container border border-outline-variant/10 transition-all duration-500 hover:shadow-xl">
          <div class="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105" 
               style="background-image: url('${item.image}')"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
          
          <!-- Top Badges -->
          <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white uppercase tracking-wider">
              ${item.categoryName}
            </span>
            <span class="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-md text-xs font-semibold text-secondary-fixed flex items-center gap-1">
              <span class="material-symbols-outlined text-xs fill-1">star</span> ${item.rating}
            </span>
          </div>

          <!-- Bottom Content -->
          <div class="absolute bottom-0 left-0 p-6 md:p-8 w-full flex flex-col justify-end text-white">
            <h3 class="${isFeatureLarge ? 'font-headline-lg text-2xl md:text-3xl' : 'font-headline-md text-xl'} font-bold mb-2 group-hover:text-secondary-fixed transition-colors">
              ${item.title}
            </h3>
            <p class="text-xs md:text-sm text-white/80 line-clamp-2 mb-4 max-w-xl">
              ${item.shortDescription}
            </p>
            <div class="flex items-center justify-between pt-3 border-t border-white/20">
              <div class="flex items-center gap-2 text-xs text-white/90">
                <span class="material-symbols-outlined text-sm">schedule</span>
                <span>${item.duration}</span>
              </div>
              <div class="text-right">
                <span class="text-[11px] text-white/70 block">Starting from</span>
                <span class="font-bold text-base text-secondary-fixed">${item.priceINR} / ${item.priceUSD}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderSpecialtyCurations() {
    const container = document.getElementById('specialty-curations-container');
    if (!container) return;

    container.innerHTML = RAAHI_DATA.specialtyCurations.map(c => `
      <div class="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 border border-secondary-container/40 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-secondary transition-all">
        <div class="absolute top-0 right-0 w-24 h-24 bg-secondary-fixed/10 rounded-bl-full -z-0"></div>
        <div>
          <div class="w-12 h-12 rounded-xl bg-secondary-container/30 text-secondary-container-on flex items-center justify-center mb-4 text-secondary">
            <span class="material-symbols-outlined text-2xl">${c.icon}</span>
          </div>
          <span class="px-2.5 py-0.5 bg-surface-container text-xs text-on-surface-variant font-medium rounded-full mb-2 inline-block">
            ${c.season}
          </span>
          <h4 class="font-headline-md text-lg font-bold text-primary dark:text-inverse-primary mb-2">${c.title}</h4>
          <p class="text-xs text-on-surface-variant leading-relaxed mb-6">${c.description}</p>
        </div>
        <button onclick="RaahiExperiences.inquireSpecialty('${c.title}')" 
                class="text-primary dark:text-inverse-primary font-semibold text-xs flex items-center gap-1.5 hover:translate-x-1 transition-transform">
          <span>Explore Curation</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    `).join('');
  },

  openExperienceModal(expId) {
    const item = RAAHI_DATA.experiences.find(e => e.id === expId);
    if (!item) return;

    const modal = document.getElementById('experience-booking-modal');
    const content = document.getElementById('experience-modal-content');

    if (modal && content) {
      content.innerHTML = `
        <div class="relative">
          <div class="relative h-64 sm:h-80 w-full overflow-hidden">
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
            <button onclick="RaahiExperiences.closeExperienceModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
            <div class="absolute bottom-4 left-6 right-6 text-white">
              <span class="px-3 py-1 bg-secondary text-on-secondary text-xs rounded-full font-semibold uppercase tracking-wider mb-2 inline-block">
                ${item.categoryName}
              </span>
              <h2 class="font-display-lg text-2xl md:text-3xl font-bold">${item.title}</h2>
              <p class="text-xs sm:text-sm text-white/80 flex items-center gap-2 mt-1">
                <span class="material-symbols-outlined text-sm">location_on</span> ${item.location}
              </p>
            </div>
          </div>

          <div class="p-6 md:p-8 space-y-6">
            <div>
              <h4 class="font-label-sm text-xs uppercase tracking-wider text-outline mb-2">The Experience</h4>
              <p class="text-sm md:text-base text-on-surface leading-relaxed">${item.fullDescription}</p>
            </div>

            <!-- Inclusions -->
            <div>
              <h4 class="font-label-sm text-xs uppercase tracking-wider text-outline mb-3">What is Included</h4>
              <ul class="space-y-2">
                ${item.included.map(inc => `
                  <li class="flex items-start gap-2 text-xs md:text-sm text-on-surface">
                    <span class="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">check_circle</span>
                    <span>${inc}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Booking Inquiry Form -->
            <div class="bg-surface-container dark:bg-surface-container-high p-5 rounded-2xl border border-outline-variant/30">
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-headline-md text-base font-bold text-primary dark:text-inverse-primary">Reserve Experience</h4>
                <div class="text-right">
                  <span class="text-xs text-on-surface-variant">Price per person</span>
                  <span class="block font-bold text-lg text-primary dark:text-inverse-primary">${item.priceINR} / ${item.priceUSD}</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label class="block text-xs font-semibold text-on-surface mb-1">Preferred Date</label>
                  <input type="date" id="booking-date" class="w-full text-xs p-2.5 rounded-lg border border-outline-variant bg-white dark:bg-surface-container-lowest" value="2026-10-15">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-on-surface mb-1">Guests</label>
                  <select id="booking-guests" class="w-full text-xs p-2.5 rounded-lg border border-outline-variant bg-white dark:bg-surface-container-lowest">
                    <option>2 Guests</option>
                    <option>1 Guest</option>
                    <option>3 Guests</option>
                    <option>4+ Private Group</option>
                  </select>
                </div>
              </div>

              <button onclick="RaahiExperiences.confirmBooking('${item.title}')" 
                      class="w-full py-3 bg-primary text-on-primary font-semibold text-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-base">event_available</span>
                Request Reservation
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeExperienceModal() {
    const modal = document.getElementById('experience-booking-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  confirmBooking(experienceTitle) {
    this.closeExperienceModal();
    RaahiApp.showToast(`Reservation inquiry for "${experienceTitle}" sent to concierge!`);
  },

  inquireSpecialty(specialtyTitle) {
    if (window.RaahiAI) {
      RaahiAI.openDrawerWithPrompt(`I would like to know the best dates and availability for the ${specialtyTitle} curation.`);
    }
  }
};
