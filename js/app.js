/**
 * RAAHI - Main Application Controller (Advanced Edition)
 * Client-side Router, Theme Manager, Soundscapes, Auth, Admin Portal, Global Toasts.
 */

const RaahiApp = {
  currentRoute: 'home',
  darkMode: false,

  init() {
    this.initTheme();
    this.initRouter();
    this.initNavLinks();
    this.initMobileMenu();
    this.initCurrencySelector();

    // Initialize Submodules
    if (typeof RaahiAPI !== 'undefined') RaahiAPI.init();
    if (typeof initRaahiHeroShader === 'function') {
      initRaahiHeroShader('hero-shader-canvas');
    }
    if (typeof RaahiAuth !== 'undefined') RaahiAuth.init();
    if (typeof RaahiPlanner !== 'undefined') RaahiPlanner.init();
    if (typeof RaahiDestinations !== 'undefined') RaahiDestinations.init();
    if (typeof RaahiExperiences !== 'undefined') RaahiExperiences.init();
    if (typeof RaahiJournal !== 'undefined') RaahiJournal.init();
    if (typeof RaahiAI !== 'undefined') RaahiAI.init();
    if (typeof RaahiAdmin !== 'undefined') RaahiAdmin.init();

    // Setup home search bar integration
    this.initHomeSearch();
  },

  initTheme() {
    const savedTheme = localStorage.getItem('raahi_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.applyTheme();

    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.darkMode = !this.darkMode;
        localStorage.setItem('raahi_theme', this.darkMode ? 'dark' : 'light');
        this.applyTheme();
      });
    }
  },

  applyTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-toggle-icon');
    if (this.darkMode) {
      html.classList.add('dark');
      if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
      html.classList.remove('dark');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
  },

  initCurrencySelector() {
    const selector = document.getElementById('currency-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        const val = e.target.value;
        if (typeof RaahiPlanner !== 'undefined') {
          RaahiPlanner.setCurrency(val);
        }
      });
    }
  },

  initRouter() {
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
    this.handleHashChange();
  },

  handleHashChange() {
    const hash = window.location.hash.replace('#', '').toLowerCase().trim();
    const validRoutes = ['home', 'destinations', 'experiences', 'planner', 'journal', 'admin'];
    const targetRoute = validRoutes.includes(hash) ? hash : 'home';
    this.navigate(targetRoute, false);
  },

  navigate(routeId, updateHash = true) {
    this.currentRoute = routeId;
    if (updateHash) {
      window.location.hash = routeId;
    }

    // Toggle view sections
    document.querySelectorAll('.view-section').forEach(view => {
      if (view.id === `view-${routeId}`) {
        view.classList.remove('hidden-view');
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
      }
    });

    // Update active nav links
    document.querySelectorAll('.nav-route-link').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      if (linkRoute === routeId) {
        link.classList.add('text-primary', 'dark:text-inverse-primary', 'font-bold', 'border-b-2', 'border-primary');
        link.classList.remove('text-on-surface-variant', 'dark:text-surface-variant');
      } else {
        link.classList.remove('text-primary', 'dark:text-inverse-primary', 'font-bold', 'border-b-2', 'border-primary');
        link.classList.add('text-on-surface-variant', 'dark:text-surface-variant');
      }
    });

    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile menu if open
    this.closeMobileMenu();
  },

  initNavLinks() {
    document.querySelectorAll('.nav-route-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        if (route) {
          this.navigate(route);
        }
      });
    });
  },

  initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    const drawer = document.getElementById('mobile-menu-drawer');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.remove('-translate-x-full');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }
  },

  closeMobileMenu() {
    const drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) {
      drawer.classList.add('-translate-x-full');
    }
  },

  initHomeSearch() {
    const searchBtn = document.getElementById('home-search-submit');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const dest = document.getElementById('home-search-dest')?.value || '';
        const dates = document.getElementById('home-search-dates')?.value || '';
        const interest = document.getElementById('home-search-interests')?.value || '';

        if (typeof RaahiPlanner !== 'undefined') {
          RaahiPlanner.prefillPlanner(dest, interest ? [interest] : []);
        }
        this.navigate('planner');
      });
    }
  },

  showToast(message, duration = 3200) {
    let toastContainer = document.getElementById('raahi-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'raahi-toast-container';
      toastContainer.className = 'fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'glass-panel px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 text-xs md:text-sm font-medium text-on-surface flex items-center gap-2 pointer-events-auto transform translate-y-4 opacity-0 transition-all duration-300';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-secondary text-base">info</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  RaahiApp.init();
});
