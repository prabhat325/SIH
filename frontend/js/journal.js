/**
 * RAAHI - Travel Journal & Community Stories Module
 * Editorial article reader modal, audio narration simulation, and Raahi Curator.
 */

const RaahiJournal = {
  activeArticle: null,
  isPlayingAudio: false,

  init() {
    this.bindEvents();
    this.renderArticles();
  },

  bindEvents() {
    // Topic filter buttons in the sidebar
    const topicButtons = document.querySelectorAll('.journal-topic-btn');
    topicButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const topic = btn.getAttribute('data-topic');
        this.filterByTopic(topic);
      });
    });
  },

  renderArticles() {
    const listContainer = document.getElementById('journal-narratives-list');
    if (!listContainer) return;

    const standardArticles = RAAHI_DATA.articles.filter(a => !a.featured);

    listContainer.innerHTML = standardArticles.map(article => `
      <article onclick="RaahiJournal.openArticleModal('${article.id}')" 
               class="flex flex-col md:flex-row gap-6 group cursor-pointer bg-surface-container-lowest dark:bg-surface-container-low p-4 rounded-xl hover:shadow-md transition-all border border-outline-variant/10">
        <div class="w-full md:w-2/5 aspect-[4/3] rounded-lg overflow-hidden shrink-0">
          <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <div class="w-full md:w-3/5 flex flex-col justify-between">
          <div>
            <span class="text-secondary font-label-sm text-xs mb-1.5 uppercase tracking-wide inline-block font-semibold">
              ${article.category}
            </span>
            <h4 class="font-headline-md text-base md:text-lg font-bold text-on-surface mb-2 group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
              ${article.title}
            </h4>
            <p class="text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
              ${article.excerpt}
            </p>
          </div>
          <div class="flex items-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
            <span class="font-medium text-primary dark:text-inverse-primary">${article.author}</span>
            <span class="mx-2">•</span>
            <span>${article.readTime}</span>
          </div>
        </div>
      </article>
    `).join('');
  },

  filterByTopic(topicKey) {
    const listContainer = document.getElementById('journal-narratives-list');
    if (!listContainer) return;

    const filtered = RAAHI_DATA.articles.filter(a => !a.featured && (topicKey === 'all' || a.categoryTag === topicKey));
    
    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="py-12 text-center text-on-surface-variant">
          <p>No stories found for this topic yet.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(article => `
      <article onclick="RaahiJournal.openArticleModal('${article.id}')" 
               class="flex flex-col md:flex-row gap-6 group cursor-pointer bg-surface-container-lowest dark:bg-surface-container-low p-4 rounded-xl hover:shadow-md transition-all border border-outline-variant/10">
        <div class="w-full md:w-2/5 aspect-[4/3] rounded-lg overflow-hidden shrink-0">
          <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <div class="w-full md:w-3/5 flex flex-col justify-between">
          <div>
            <span class="text-secondary font-label-sm text-xs mb-1.5 uppercase tracking-wide inline-block font-semibold">
              ${article.category}
            </span>
            <h4 class="font-headline-md text-base md:text-lg font-bold text-on-surface mb-2 group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
              ${article.title}
            </h4>
            <p class="text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
              ${article.excerpt}
            </p>
          </div>
          <div class="flex items-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
            <span class="font-medium text-primary dark:text-inverse-primary">${article.author}</span>
            <span class="mx-2">•</span>
            <span>${article.readTime}</span>
          </div>
        </div>
      </article>
    `).join('');
  },

  openArticleModal(articleId) {
    const article = RAAHI_DATA.articles.find(a => a.id === articleId) || RAAHI_DATA.articles[0];
    if (!article) return;

    this.activeArticle = article;
    const modal = document.getElementById('journal-reader-modal');
    const content = document.getElementById('journal-modal-content');

    if (modal && content) {
      content.innerHTML = `
        <div class="relative">
          <div class="relative h-72 sm:h-96 w-full overflow-hidden">
            <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <button onclick="RaahiJournal.closeArticleModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors z-20">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
            <div class="absolute bottom-6 left-6 right-6 text-white max-w-2xl">
              <span class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-xs rounded-full font-bold uppercase tracking-wider mb-3 inline-block">
                ${article.category}
              </span>
              <h2 class="font-display-lg text-2xl md:text-4xl font-bold leading-tight mb-2">${article.title}</h2>
              <p class="text-xs md:text-sm text-white/80 flex items-center gap-3">
                <span>By ${article.author}</span>
                <span>•</span>
                <span>${article.date}</span>
                <span>•</span>
                <span>${article.readTime}</span>
              </p>
            </div>
          </div>

          <!-- Audio Narration Bar -->
          <div class="bg-surface-container dark:bg-surface-container-high px-6 py-3 border-y border-outline-variant/20 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button id="btn-audio-toggle" onclick="RaahiJournal.toggleAudioNarration()" 
                      class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors">
                <span class="material-symbols-outlined text-xl" id="audio-icon">play_arrow</span>
              </button>
              <div>
                <span class="block text-xs font-bold text-on-surface">Listen to this Story</span>
                <span class="text-[11px] text-on-surface-variant" id="audio-status">Audio narrated by AI Heritage Voice</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="RaahiApp.showToast('Article bookmarked to read offline!')" class="p-2 text-primary dark:text-inverse-primary hover:bg-primary/10 rounded-full">
                <span class="material-symbols-outlined text-lg">bookmark_add</span>
              </button>
              <button onclick="RaahiPlanner.prefillPlanner('India'); RaahiApp.navigate('planner'); RaahiJournal.closeArticleModal();" 
                      class="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container">
                Plan Matching Trip
              </button>
            </div>
          </div>

          <!-- Article Body -->
          <div class="p-6 md:p-10 max-w-3xl mx-auto space-y-6 text-on-surface font-body-lg text-sm md:text-base leading-relaxed">
            ${article.content}
          </div>
        </div>
      `;

      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeArticleModal() {
    const modal = document.getElementById('journal-reader-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      if (this.isPlayingAudio) {
        this.toggleAudioNarration();
      }
    }
  },

  toggleAudioNarration() {
    this.isPlayingAudio = !this.isPlayingAudio;
    const icon = document.getElementById('audio-icon');
    const status = document.getElementById('audio-status');

    if (this.isPlayingAudio) {
      if (icon) icon.textContent = 'pause';
      if (status) status.textContent = 'Playing immersive audio narration...';
      RaahiApp.showToast("Playing AI Heritage Audio Narration");
    } else {
      if (icon) icon.textContent = 'play_arrow';
      if (status) status.textContent = 'Audio narrated by AI Heritage Voice';
    }
  },

  askCurator(query) {
    if (window.RaahiAI) {
      RaahiAI.openDrawerWithPrompt(`I am interested in: "${query}". Can you curate a recommended reading list and trip ideas?`);
    }
  }
};
