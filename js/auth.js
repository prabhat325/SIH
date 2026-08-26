/**
 * RAAHI — Comprehensive Authentication & User Session Management
 * Features:
 * - Traveler, Chief Curator Admin, and Guest Explorer roles
 * - Sign In & Sign Up (Register) modal tabs with show/hide password
 * - "Sign in with Google" simulated OAuth flow
 * - "Continue as Guest" one-click instant guest explorer
 * - Preset Demo Personas (Aakash Verma - Traveler, Vikramaditya Rathore - Chief Curator Admin)
 * - Profile Dropdown in navbar with Role Switcher & Log Out
 * - Log Out action that gracefully clears session and updates UI
 * - LocalStorage persistence for user profile, saved items, reviews, and contributions
 */

const RaahiAuth = {
  currentUser: null,
  savedItems: [],
  myReviews: [],
  myContributions: [],
  selectedSignupAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
  selectedSignupRole: "traveler",

  init() {
    this.loadState();
    this.bindGlobalEvents();
    this.renderHeaderAuth();
  },

  bindGlobalEvents() {
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('auth-profile-dropdown');
      const trigger = document.getElementById('auth-profile-btn');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && !trigger?.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeProfileDropdown();
        this.closeAuthModal();
      }
    });
  },

  loadState() {
    try {
      const savedUser = localStorage.getItem('raahi_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        // Default Traveler session for rich initial experience
        this.currentUser = {
          id: "usr-demo",
          name: "Aakash Verma",
          email: "aakash.traveler@raahi.in",
          role: "traveler", // "traveler" | "admin" | "guest"
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
          bio: "Heritage explorer, photographer & cultural enthusiast.",
          authProvider: "demo"
        };
      }

      const savedList = localStorage.getItem('raahi_saved');
      if (savedList) {
        this.savedItems = JSON.parse(savedList);
      } else {
        this.savedItems = ["bara-imambara", "kashi-vishwanath", "taj-mahal", "dashashwamedh-ghat", "amber-fort"];
      }

      const reviewsList = localStorage.getItem('raahi_reviews');
      if (reviewsList) {
        this.myReviews = JSON.parse(reviewsList);
      } else {
        this.myReviews = [
          {
            id: "rev-1",
            resourceId: "bara-imambara",
            resourceName: "Bara Imambara & Bhool Bhulaiya",
            rating: 5,
            comment: "The acoustic engineering of the central hall is unbelievable. Make sure to hire a licensed guide for the Bhool Bhulaiya labyrinth!",
            date: "2026-08-15"
          },
          {
            id: "rev-2",
            resourceId: "tunday-kababi-lucknow",
            resourceName: "Tunday Kababi",
            rating: 5,
            comment: "The Galouti kebabs melt instantly. The historical Awadhi spices make it unforgettable.",
            date: "2026-08-16"
          }
        ];
      }
    } catch (e) {
      console.error("Auth state load error", e);
    }
  },

  saveState() {
    try {
      if (this.currentUser) {
        localStorage.setItem('raahi_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('raahi_user');
      }
      localStorage.setItem('raahi_saved', JSON.stringify(this.savedItems));
      localStorage.setItem('raahi_reviews', JSON.stringify(this.myReviews));

      if (typeof RaahiSidebar !== 'undefined') {
        RaahiSidebar.render();
      }
    } catch (e) {
      console.error("Auth save error", e);
    }
  },

  // =========================================================================
  // NAVBAR HEADER RENDERING & INTERACTIVE PROFILE DROPDOWN
  // =========================================================================
  renderHeaderAuth() {
    const container = document.getElementById('header-auth-container');
    if (!container) return;

    if (this.currentUser) {
      const isCurator = this.currentUser.role === 'admin';
      const isGuest = this.currentUser.role === 'guest';
      const roleLabel = isCurator ? 'Curator Admin' : isGuest ? 'Guest' : 'Traveler';
      const roleBadgeClass = isCurator
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-300'
        : isGuest
          ? 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300'
          : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/80';

      // Build the dropdown navigation items matching exact user requirements:
      // Profile, My Trips, Saved Places, Settings, [Admin Portal if isCurator], Logout
      let dropdownItemsHtml = `
        <button onclick="RaahiAuth.navigateToDashboardTab('personalized')" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-left cursor-pointer">
          <span class="material-symbols-outlined text-sm text-amber-600">account_circle</span>
          <span>Profile</span>
        </button>
        <button onclick="RaahiAuth.navigateTo('planner')" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-left cursor-pointer">
          <span class="material-symbols-outlined text-sm text-amber-600">route</span>
          <span>My Trips</span>
        </button>
        <button onclick="RaahiAuth.navigateToDashboardTab('saved')" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-left cursor-pointer">
          <span class="material-symbols-outlined text-sm text-amber-600">bookmark</span>
          <span>Saved Places</span>
        </button>
        <button onclick="RaahiAuth.navigateToDashboardTab('personalized')" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-left cursor-pointer">
          <span class="material-symbols-outlined text-sm text-amber-600">settings</span>
          <span>Settings</span>
        </button>
      `;

      // If authorized admin/curator, dynamically add Admin Portal
      if (isCurator) {
        dropdownItemsHtml += `
          <button onclick="RaahiAuth.navigateTo('admin')" class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50/80 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-800/60 transition-colors text-left cursor-pointer my-1 shadow-2xs">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-sm text-purple-600 dark:text-purple-400">shield_person</span>
              <span>Admin Portal</span>
            </div>
            <span class="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-extrabold">Chief Curator</span>
          </button>
        `;
      }

      // Optional subtle admin button in navbar for curators only:
      const adminNavButtonHtml = isCurator ? `
        <a href="#admin" data-route="admin" onclick="RaahiApp.navigate('admin')" class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-300 dark:border-purple-700 transition-all duration-200 shadow-2xs cursor-pointer" title="Chief Curator Admin &amp; Verification Hub">
          <span class="material-symbols-outlined text-sm text-purple-600 dark:text-purple-400">shield_person</span>
          <span>Admin</span>
        </a>
      ` : '';

      container.innerHTML = `
        <div class="relative flex items-center gap-2">
          ${adminNavButtonHtml}

          <!-- Interactive Traveler Profile Trigger Button -->
          <button id="auth-profile-btn" onclick="RaahiAuth.toggleProfileDropdown(event)" class="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-stone-200/90 dark:border-stone-700 bg-white/90 dark:bg-stone-800/90 hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all shrink-0 focus:outline-none cursor-pointer" title="Traveler Profile &amp; Options" aria-haspopup="true">
            <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="w-7 h-7 rounded-full object-cover border-2 ${isCurator ? 'border-purple-500' : 'border-amber-500'} shadow-2xs">
            <span class="text-xs font-bold text-stone-800 dark:text-stone-200 hidden sm:inline-block max-w-[90px] truncate">${this.currentUser.name.split(' ')[0]}</span>
            <span class="material-symbols-outlined text-sm text-stone-400">expand_more</span>
          </button>

          <!-- Glassmorphic Traveler Profile Dropdown Menu -->
          <div id="auth-profile-dropdown" class="hidden absolute right-0 top-full mt-2 w-72 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-4 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
            
            <!-- User Info Header -->
            <div class="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <h4 class="text-xs font-bold text-stone-900 dark:text-white truncate">${this.currentUser.name}</h4>
                </div>
                <p class="text-[11px] text-stone-500 dark:text-stone-400 truncate">${this.currentUser.email}</p>
                <span class="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${roleBadgeClass} border">
                  ${roleLabel} Mode
                </span>
              </div>
            </div>

            <!-- Main Navigation Links (Profile, My Trips, Saved Places, Settings, [Admin Portal]) -->
            <div class="py-2 space-y-0.5 border-b border-stone-100 dark:border-stone-800">
              ${dropdownItemsHtml}
            </div>

            <!-- Demo Persona Switcher (For SIH Jury & Testing) -->
            <div class="py-2 border-b border-stone-100 dark:border-stone-800">
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block px-3 mb-1.5">Switch Persona (Demo)</span>
              <div class="grid grid-cols-2 gap-1.5 px-1">
                <button onclick="RaahiAuth.loginAs('traveler')" class="px-2 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${this.currentUser.role === 'traveler' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'}">
                  🎒 Traveler
                </button>
                <button onclick="RaahiAuth.loginAs('admin')" class="px-2 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${this.currentUser.role === 'admin' ? 'bg-purple-600 text-white shadow-xs' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'}">
                  🛡️ Curator Admin
                </button>
              </div>
            </div>

            <!-- Log Out Action -->
            <div class="pt-2">
              <button onclick="RaahiAuth.logout()" class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">logout</span>
                  <span>Logout</span>
                </div>
                <span class="text-[10px] font-mono opacity-60">End Session</span>
              </button>
            </div>

          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center gap-2">
          <!-- Sign In Primary Button -->
          <button onclick="RaahiAuth.openAuthModal('signin')" class="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 px-3.5 py-1.5 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer">
            <span class="material-symbols-outlined text-sm">login</span>
            <span>Sign In</span>
          </button>
          <!-- Guest Mode Quick Button -->
          <button onclick="RaahiAuth.loginAsGuest()" class="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 cursor-pointer">
            <span>Guest</span>
          </button>
        </div>
      `;
    }
  },

  navigateToDashboardTab(tabId) {
    this.closeProfileDropdown();
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate('dashboard');
    }
    if (typeof RaahiDashboard !== 'undefined' && tabId) {
      setTimeout(() => {
        RaahiDashboard.switchTab(tabId);
      }, 50);
    }
  },

  toggleProfileDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('auth-profile-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  },

  closeProfileDropdown() {
    const dropdown = document.getElementById('auth-profile-dropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  },

  navigateTo(route) {
    this.closeProfileDropdown();
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate(route);
    }
  },


  // =========================================================================
  // ROLE SWITCHING & DEMO PERSONAS
  // =========================================================================
  toggleRole() {
    if (!this.currentUser) {
      this.loginAs('traveler');
      return;
    }
    const newRole = this.currentUser.role === 'admin' ? 'traveler' : 'admin';
    this.loginAs(newRole);
  },

  loginAs(role = 'traveler') {
    this.closeProfileDropdown();
    if (role === 'admin') {
      this.currentUser = {
        id: "adm-01",
        name: "Vikramaditya Rathore",
        email: "curator@raahi.in",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
        bio: "Senior Tourism Verifier & Heritage Board Reviewer.",
        authProvider: "demo"
      };
      RaahiApp.showToast("Logged in as Chief Curator Admin", "success");
    } else {
      this.currentUser = {
        id: "usr-demo",
        name: "Aakash Verma",
        email: "aakash.traveler@raahi.in",
        role: "traveler",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        bio: "Heritage explorer, photographer & cultural enthusiast.",
        authProvider: "demo"
      };
      RaahiApp.showToast("Logged in as Traveler (Aakash Verma)", "success");
    }

    this.saveState();
    this.closeAuthModal();
    this.renderHeaderAuth();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderProfileHeader();

    if (role === 'admin') {
      RaahiApp.navigate('admin');
    } else {
      RaahiApp.navigate('dashboard');
    }
  },

  // =========================================================================
  // SIGN IN WITH GOOGLE & GUEST ACCESS
  // =========================================================================
  loginWithGoogle() {
    const btn = document.getElementById('btn-google-signin');
    if (btn) {
      btn.innerHTML = `
        <span class="inline-block animate-spin material-symbols-outlined text-sm text-amber-600">sync</span>
        <span>Connecting to Google Account...</span>
      `;
      btn.disabled = true;
    }

    setTimeout(() => {
      this.currentUser = {
        id: "usr-google-" + Math.floor(1000 + Math.random() * 9000),
        name: "Priya Sharma (Google Traveler)",
        email: "priya.sharma@gmail.com",
        role: "traveler",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        bio: "Google verified traveler exploring incredible Indian destinations.",
        authProvider: "google"
      };

      this.saveState();
      this.closeAuthModal();
      this.renderHeaderAuth();
      if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderProfileHeader();
      RaahiApp.showToast("Signed in with Google as Priya Sharma!", "success");
      RaahiApp.navigate('dashboard');
    }, 800);
  },

  loginAsGuest() {
    this.currentUser = {
      id: "usr-guest",
      name: "Guest Explorer",
      email: "guest@raahi.in",
      role: "guest",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      bio: "Browsing Raahi in guest explorer mode.",
      authProvider: "guest"
    };

    this.saveState();
    this.closeAuthModal();
    this.closeProfileDropdown();
    this.renderHeaderAuth();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderProfileHeader();
    RaahiApp.showToast("Continuing as Guest Explorer. Welcome!", "info");
  },

  // =========================================================================
  // CUSTOM EMAIL/PASSWORD SIGN IN & SIGN UP
  // =========================================================================
  handleEmailSignIn(event) {
    if (event) event.preventDefault();
    const emailInput = document.getElementById('auth-signin-email');
    const passInput = document.getElementById('auth-signin-password');

    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value : '';

    if (!email || !pass) {
      RaahiApp.showToast("Please enter your email and password", "warning");
      return;
    }

    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('curator');
    const extractedName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    this.currentUser = {
      id: "usr-" + Date.now(),
      name: isAdmin ? `${extractedName} (Admin)` : extractedName,
      email: email,
      role: isAdmin ? "admin" : "traveler",
      avatar: isAdmin
        ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80"
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      bio: isAdmin ? "Tourism Verifier & Heritage Curator." : "Travel enthusiast exploring India.",
      authProvider: "email"
    };

    this.saveState();
    this.closeAuthModal();
    this.renderHeaderAuth();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderProfileHeader();
    RaahiApp.showToast(`Welcome back, ${this.currentUser.name}!`, "success");

    if (isAdmin) {
      RaahiApp.navigate('admin');
    } else {
      RaahiApp.navigate('dashboard');
    }
  },

  handleSignUp(event) {
    if (event) event.preventDefault();
    const nameInput = document.getElementById('auth-signup-name');
    const emailInput = document.getElementById('auth-signup-email');
    const passInput = document.getElementById('auth-signup-password');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value : '';

    if (!name || !email || !pass) {
      RaahiApp.showToast("Please complete all registration fields", "warning");
      return;
    }

    this.currentUser = {
      id: "usr-" + Date.now(),
      name: name,
      email: email,
      role: this.selectedSignupRole || "traveler",
      avatar: this.selectedSignupAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      bio: "Heritage explorer & member of the Raahi community.",
      authProvider: "email"
    };

    this.saveState();
    this.closeAuthModal();
    this.renderHeaderAuth();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderProfileHeader();
    RaahiApp.showToast(`Account created! Welcome to Raahi, ${name}!`, "success");
    RaahiApp.navigate('dashboard');
  },

  selectSignupRole(role) {
    this.selectedSignupRole = role;
    const travelerBtn = document.getElementById('signup-role-traveler');
    const adminBtn = document.getElementById('signup-role-admin');
    if (travelerBtn && adminBtn) {
      if (role === 'traveler') {
        travelerBtn.className = "flex-1 p-3 rounded-xl border-2 border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs";
        adminBtn.className = "flex-1 p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all";
      } else {
        adminBtn.className = "flex-1 p-3 rounded-xl border-2 border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs";
        travelerBtn.className = "flex-1 p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all";
      }
    }
  },

  selectSignupAvatar(url, el) {
    this.selectedSignupAvatar = url;
    document.querySelectorAll('.signup-avatar-option').forEach(img => {
      img.classList.remove('ring-4', 'ring-amber-600', 'scale-105');
    });
    if (el) {
      el.classList.add('ring-4', 'ring-amber-600', 'scale-105');
    }
  },

  // =========================================================================
  // LOG OUT
  // =========================================================================
  logout() {
    this.closeProfileDropdown();
    this.currentUser = null;
    this.saveState();
    this.renderHeaderAuth();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderProfileHeader();
    RaahiApp.showToast("You have been logged out successfully", "info");

    // If currently viewing admin, redirect to home
    if (RaahiApp.currentRoute === 'admin' || RaahiApp.currentRoute === 'dashboard') {
      RaahiApp.navigate('home');
    }
  },

  // =========================================================================
  // MODAL CONTROLS & TAB SWITCHING
  // =========================================================================
  openAuthModal(tab = 'signin') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      this.switchAuthTab(tab);
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  switchAuthTab(tab = 'signin') {
    const tabSignin = document.getElementById('auth-tab-btn-signin');
    const tabSignup = document.getElementById('auth-tab-btn-signup');
    const paneSignin = document.getElementById('auth-pane-signin');
    const paneSignup = document.getElementById('auth-pane-signup');

    if (tab === 'signin') {
      if (tabSignin) {
        tabSignin.className = "flex-1 py-2.5 text-xs font-bold text-amber-600 border-b-2 border-amber-600 transition-all";
      }
      if (tabSignup) {
        tabSignup.className = "flex-1 py-2.5 text-xs font-bold text-stone-400 hover:text-stone-600 border-b-2 border-transparent transition-all";
      }
      if (paneSignin) paneSignin.classList.remove('hidden');
      if (paneSignup) paneSignup.classList.add('hidden');
    } else {
      if (tabSignup) {
        tabSignup.className = "flex-1 py-2.5 text-xs font-bold text-amber-600 border-b-2 border-amber-600 transition-all";
      }
      if (tabSignin) {
        tabSignin.className = "flex-1 py-2.5 text-xs font-bold text-stone-400 hover:text-stone-600 border-b-2 border-transparent transition-all";
      }
      if (paneSignup) paneSignup.classList.remove('hidden');
      if (paneSignin) paneSignin.classList.add('hidden');
    }
  },

  togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = 'visibility_off';
    } else {
      input.type = 'password';
      icon.textContent = 'visibility';
    }
  },

  // =========================================================================
  // SAVED COLLECTION MANAGEMENT
  // =========================================================================
  toggleSave(itemId) {
    if (!this.currentUser) {
      this.openAuthModal('signin');
      return;
    }
    const idx = this.savedItems.indexOf(itemId);
    if (idx >= 0) {
      this.savedItems.splice(idx, 1);
      RaahiApp.showToast("Removed from your Journey Collection", "info");
    } else {
      this.savedItems.push(itemId);
      RaahiApp.showToast("Saved to your Journey Collection!", "success");
    }
    this.saveState();
    if (typeof RaahiPlaces !== 'undefined') RaahiPlaces.renderPlaces();
    if (typeof RaahiHotels !== 'undefined') RaahiHotels.renderHotels();
    if (typeof RaahiRestaurants !== 'undefined') RaahiRestaurants.renderRestaurants();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderSavedCollection();
  },

  isSaved(itemId) {
    return this.savedItems.includes(itemId);
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiAuth = RaahiAuth;
}
