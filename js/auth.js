/**
 * RAAHI - Authentication & User State Module
 * Supports Traveler & Curator Admin roles, demo credentials, profile dropdown, and session management.
 */

const RaahiAuth = {
  currentUser: null,

  init() {
    this.loadSession();
    this.bindEvents();
    this.updateHeaderUI();
  },

  loadSession() {
    const saved = localStorage.getItem('raahi_user_session');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  },

  bindEvents() {
    // Open auth modal buttons
    const signinButtons = document.querySelectorAll('.btn-open-auth');
    signinButtons.forEach(btn => {
      btn.addEventListener('click', () => this.openAuthModal());
    });

    // Form submit
    const authForm = document.getElementById('auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.querySelector('input[name="auth-role"]:checked')?.value || 'user';
        const email = document.getElementById('auth-email')?.value || 'traveler@raahi.ai';
        const name = role === 'admin' ? 'Chief Curator (Admin)' : (email.split('@')[0] || 'Traveler');
        this.login(role, name, email);
      });
    }
  },

  login(role = 'user', name = '', email = '') {
    if (role === 'admin') {
      this.currentUser = {
        role: 'admin',
        name: name || 'Aarav Sharma',
        title: 'Chief Heritage Curator',
        email: email || 'admin@raahi.ai',
        avatar: 'shield_person',
        loginTime: new Date().toLocaleTimeString()
      };
      RaahiApp.showToast("Welcome back, Chief Curator! Admin portal unlocked.");
    } else {
      this.currentUser = {
        role: 'user',
        name: name || 'Prabhat Dubey',
        title: 'Royal Explorer',
        email: email || 'prabhat@raahi.ai',
        avatar: 'person',
        loginTime: new Date().toLocaleTimeString()
      };
      RaahiApp.showToast(`Welcome to Raahi, ${this.currentUser.name}!`);
    }

    localStorage.setItem('raahi_user_session', JSON.stringify(this.currentUser));
    this.closeAuthModal();
    this.updateHeaderUI();

    if (role === 'admin') {
      RaahiApp.navigate('admin');
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('raahi_user_session');
    this.updateHeaderUI();
    RaahiApp.showToast("Logged out successfully.");
    if (RaahiApp.currentRoute === 'admin') {
      RaahiApp.navigate('home');
    }
  },

  openAuthModal(defaultRole = 'user') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      this.setAuthTab(defaultRole);
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  setAuthTab(role) {
    const userTabBtn = document.getElementById('auth-tab-user');
    const adminTabBtn = document.getElementById('auth-tab-admin');
    const roleRadioUser = document.getElementById('role-radio-user');
    const roleRadioAdmin = document.getElementById('role-radio-admin');
    const roleTitle = document.getElementById('auth-modal-role-title');
    const roleSubtitle = document.getElementById('auth-modal-role-subtitle');
    const emailInput = document.getElementById('auth-email');

    if (role === 'admin') {
      if (adminTabBtn) adminTabBtn.classList.add('bg-primary', 'text-on-primary');
      if (userTabBtn) userTabBtn.classList.remove('bg-primary', 'text-on-primary');
      if (roleRadioAdmin) roleRadioAdmin.checked = true;
      if (roleTitle) roleTitle.textContent = "Curator & Admin Portal";
      if (roleSubtitle) roleSubtitle.textContent = "Manage experiences, guest reservations, and AI inventory.";
      if (emailInput) emailInput.value = "admin@raahi.ai";
    } else {
      if (userTabBtn) userTabBtn.classList.add('bg-primary', 'text-on-primary');
      if (adminTabBtn) adminTabBtn.classList.remove('bg-primary', 'text-on-primary');
      if (roleRadioUser) roleRadioUser.checked = true;
      if (roleTitle) roleTitle.textContent = "Welcome, Traveler";
      if (roleSubtitle) roleSubtitle.textContent = "Sign in to access saved journeys, boarding passes & wishlist.";
      if (emailInput) emailInput.value = "traveler@raahi.ai";
    }
  },

  updateHeaderUI() {
    const authContainer = document.getElementById('header-auth-container');
    const adminNavLink = document.getElementById('nav-admin-link');

    if (adminNavLink) {
      if (this.currentUser && this.currentUser.role === 'admin') {
        adminNavLink.classList.remove('hidden');
      } else {
        adminNavLink.classList.add('hidden');
      }
    }

    if (!authContainer) return;

    if (this.currentUser) {
      const isAdmin = this.currentUser.role === 'admin';
      authContainer.innerHTML = `
        <div class="relative group">
          <button class="flex items-center gap-2 px-3 py-1.5 rounded-full ${isAdmin ? 'bg-secondary-fixed text-on-secondary-fixed font-bold border border-secondary' : 'bg-surface-container text-on-surface font-semibold'} text-xs hover:opacity-90 transition-all">
            <span class="material-symbols-outlined text-base">${this.currentUser.avatar}</span>
            <span class="hidden sm:inline">${this.currentUser.name.split(' ')[0]}</span>
            <span class="material-symbols-outlined text-xs">expand_more</span>
          </button>

          <!-- Dropdown Menu -->
          <div class="absolute right-0 mt-2 w-48 bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-2xl shadow-xl py-2 hidden group-hover:block group-focus-within:block z-50">
            <div class="px-4 py-2 border-b border-outline-variant/20">
              <span class="block text-xs font-bold text-on-surface">${this.currentUser.name}</span>
              <span class="block text-[10px] text-secondary font-semibold uppercase tracking-wider">${this.currentUser.title}</span>
            </div>

            ${isAdmin ? `
              <a href="#admin" onclick="RaahiApp.navigate('admin')" class="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary dark:text-primary-fixed hover:bg-primary/10 transition-colors">
                <span class="material-symbols-outlined text-sm">dashboard</span>
                Admin Dashboard
              </a>
            ` : `
              <a href="#planner" onclick="RaahiApp.navigate('planner')" class="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface hover:bg-primary/10 transition-colors">
                <span class="material-symbols-outlined text-sm">bookmark</span>
                Saved Journeys
              </a>
            `}

            <button onclick="RaahiAuth.logout()" class="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-outline-variant/20 mt-1">
              <span class="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <button onclick="RaahiAuth.openAuthModal()" class="btn-open-auth flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary dark:text-primary-fixed border border-primary/30 hover:bg-primary/5 transition-all">
          <span class="material-symbols-outlined text-base">login</span>
          <span>Sign In</span>
        </button>
      `;
    }
  }
};
