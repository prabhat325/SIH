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


async init() {
  this.loadState();
  this.bindGlobalEvents();



  // Backend is the source of truth for authentication.
  try {
    const response = await RaahiAPI.getCurrentUser();

   
if (response && response.success && response.data) {

  this.currentUser =
    this.normalizeBackendUser(response.data);

  console.log(
    '[RaahiAuth] Backend session restored:',
    this.currentUser
  );

  // Restore real saved resources from MongoDB.
  await this.loadSavedResources();

  await this.loadMyReviews();
  if (typeof RaahiDashboard !== 'undefined') {
  if (typeof RaahiDashboard.renderReviews === 'function') {
    RaahiDashboard.renderReviews();
  }

  if (typeof RaahiDashboard.renderSavedCollection === 'function') {
    RaahiDashboard.renderSavedCollection();
  }

  if (typeof RaahiDashboard.renderProfileHeader === 'function') {
    RaahiDashboard.renderProfileHeader();
  }
}

} else {

  this.currentUser = null;
  this.savedItems = [];

}


  } catch (error) {
    // 401 simply means there is no active backend session.
    this.currentUser = null;
    console.log('[RaahiAuth] No active backend session.');
  }

  this.renderHeaderAuth();
},
async loadMyReviews() {

  if (!this.currentUser) {
    this.myReviews = [];
    return;
  }

  try {

    const response =
      await RaahiAPI.getMyReviews();

    if (
      response &&
      response.success &&
      Array.isArray(response.data)
    ) {

      this.myReviews =
        response.data.map(review => ({
          id: review._id,
          resourceId: review.resourceId,
          resourceType: review.resourceType,
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt
            ? new Date(
                review.createdAt
              ).toISOString().split('T')[0]
            : ''
        }));

      console.log(
        '[RaahiAuth] My reviews restored:',
        this.myReviews
      );

     

    } else {

      this.myReviews = [];

    }

  } catch (error) {

    console.error(
      '[RaahiAuth] Failed to load reviews:',
      error
    );

    this.myReviews = [];

  }
},


normalizeBackendUser(user) {
  if (!user) return null;

  return {
    id: user._id || user.id,
    name: user.fullName || user.name || user.username || 'Traveler',
    email: user.email || '',
    username: user.username || '',
    role: user.role || 'traveler',
    avatar: user.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    bio: user.bio || 'Heritage explorer & member of the Raahi community.',
    authProvider: 'email',
    isEmailVerified: user.isEmailVerified
  };
},

async loadSavedResources() {

  if (!this.currentUser) {
    this.savedItems = [];
    return;
  }

  try {

    const response =
      await RaahiAPI.getSavedResources();

    if (
      response &&
      response.success &&
      Array.isArray(response.data)
    ) {

      this.savedItems =
        response.data.map(saved =>
          saved.resourceId
        );



      console.log(
        '[RaahiAuth] Saved resources restored:',
        this.savedItems
      );

    } else {

      this.savedItems = [];

    }

  } catch (error) {

    console.error(
      '[RaahiAuth] Failed to load saved resources:',
      error
    );

    // Don't destroy existing local state on a temporary
    // network failure.
  }
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
          // Authentication is controlled exclusively by the backend.
    // Do NOT restore the logged-in user from localStorage.
    this.currentUser = null;


    
// Saved resources are restored from the backend
// after authentication in init().
this.savedItems = [];

    
     


// Reviews are loaded from the backend.
// Start empty until the authenticated user's reviews
// are fetched.
this.myReviews = [];

    } catch (e) {
      console.error("Auth state load error", e);
    }
  },


  saveState() {
  try {
    // Authentication is managed by the backend.
    // Do not store the authenticated user in localStorage.


   

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
// REAL AUTHENTICATION ONLY
// =========================================================================

toggleRole() {
  RaahiApp.showToast(
    "Role changes are managed by your account permissions.",
    "info"
  );
},

loginAs() {
  RaahiApp.showToast(
    "Demo login is disabled. Please use your real account.",
    "info"
  );
},





  // =========================================================================
  // CUSTOM EMAIL/PASSWORD SIGN IN & SIGN UP
  // =========================================================================





  async handleEmailSignIn(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById('auth-signin-email');
  const passInput = document.getElementById('auth-signin-password');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passInput ? passInput.value : '';

  if (!email || !password) {
    RaahiApp.showToast(
      "Please enter your email and password",
      "warning"
    );
    return;
  }

  try {
    const response = await RaahiAPI.login({
      email,
      password
    });

    if (!response || !response.success) {
      throw new Error(
        response?.message || "Login failed"
      );
    }

    const backendUser =
      response.data?.user || response.data;



this.currentUser =
  this.normalizeBackendUser(backendUser);

// Load this user's private data from the backend.
this.savedItems = [];
this.myReviews = [];
this.myContributions = [];

await this.loadSavedResources();
await this.loadMyReviews();

if (typeof RaahiDashboard !== 'undefined') {

  if (
    typeof RaahiDashboard.renderReviews === 'function'
  ) {
    RaahiDashboard.renderReviews();
  }

  if (
    typeof RaahiDashboard.renderSavedCollection === 'function'
  ) {
    RaahiDashboard.renderSavedCollection();
  }

  if (
    typeof RaahiDashboard.renderProfileHeader === 'function'
  ) {
    RaahiDashboard.renderProfileHeader();
  }
}

// Keep only UI-related local state.
// Authentication itself lives in backend cookies.
this.saveState();


    this.closeAuthModal();
    this.renderHeaderAuth();

    if (
      typeof RaahiDashboard !== 'undefined' &&
      typeof RaahiDashboard.renderProfileHeader === 'function'
    ) {
      RaahiDashboard.renderProfileHeader();
    }

    RaahiApp.showToast(
      `Welcome back, ${this.currentUser.name}!`,
      "success"
    );

    if (this.currentUser.role === 'admin') {
      RaahiApp.navigate('admin');
    } else {
      RaahiApp.navigate('dashboard');
    }

  } catch (error) {
    console.error('[RaahiAuth] Login failed:', error);

    RaahiApp.showToast(
      error.message || "Invalid email or password",
      "error"
    );
  }
},



async handleSignUp(event) {
  if (event) event.preventDefault();

  const nameInput =
    document.getElementById('auth-signup-name');

  const emailInput =
    document.getElementById('auth-signup-email');

  const passInput =
    document.getElementById('auth-signup-password');



const name = nameInput
  ? nameInput.value.trim()
  : '';

const usernameInput =
  document.getElementById('auth-signup-username');

const username = usernameInput
  ? usernameInput.value.trim().toLowerCase()
  : '';

const email = emailInput
  ? emailInput.value.trim().toLowerCase()
  : '';

const password = passInput
  ? passInput.value
  : '';



if (!name || !username || !email || !password) {
  RaahiApp.showToast(
    "Please complete all registration fields",
    "warning"
  );
  return;
}


if (!/^[a-z0-9_]{3,30}$/.test(username)) {
  RaahiApp.showToast(
    "Username must be 3-30 characters using letters, numbers, or underscore",
    "warning"
  );
  return;
}


  if (password.length < 8) {
    RaahiApp.showToast(
      "Password must be at least 8 characters",
      "warning"
    );
    return;
  }



  try {
    const response = await RaahiAPI.register({
      username,
      email,
      fullName: name,
      password
    });

    if (!response || !response.success) {
      throw new Error(
        response?.message || "Registration failed"
      );
    }

    this.closeAuthModal();

    RaahiApp.showToast(
      response.message ||
      "Account created! Please verify your email.",
      "success"
    );

    // Registration does NOT automatically create a login
    // session in your backend.
    // User must sign in after verification.
    setTimeout(() => {
      this.openAuthModal('signin');
    }, 500);

  } catch (error) {
    console.error(
      '[RaahiAuth] Registration failed:',
      error
    );

    RaahiApp.showToast(
      error.message || "Registration failed",
      "error"
    );
  }
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


  async logout() {
  this.closeProfileDropdown();

  try {
    await RaahiAPI.logout();
  } catch (error) {
    console.warn(
      '[RaahiAuth] Backend logout failed:',
      error
    );
  }

  // Always clear frontend state.
  this.currentUser = null;
  this.savedItems = [];
this.myReviews = [];
this.myContributions = [];

if (
  typeof RaahiDashboard !== 'undefined'
) {
  if (
    typeof RaahiDashboard.renderReviews === 'function'
  ) {
    RaahiDashboard.renderReviews();
  }

  if (
    typeof RaahiDashboard.renderSavedCollection === 'function'
  ) {
    RaahiDashboard.renderSavedCollection();
  }
}


  // Authentication is managed by the backend.
  // No authenticated user is stored in localStorage.


  this.renderHeaderAuth();

  if (
    typeof RaahiDashboard !== 'undefined' &&
    typeof RaahiDashboard.renderProfileHeader === 'function'
  ) {
    RaahiDashboard.renderProfileHeader();
  }

  if (
    typeof RaahiSidebar !== 'undefined' &&
    typeof RaahiSidebar.render === 'function'
  ) {
    RaahiSidebar.render();
  }

  RaahiApp.showToast(
    "You have been logged out successfully",
    "info"
  );

  if (
    RaahiApp.currentRoute === 'admin' ||
    RaahiApp.currentRoute === 'dashboard'
  ) {
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
 




  
async toggleSave(itemId) {
  if (!this.currentUser) {
    this.openAuthModal('signin');
    return;
  }

  try {
    const isCurrentlySaved =
      this.savedItems.includes(itemId);

    if (isCurrentlySaved) {

      await RaahiAPI.unsaveResource(
        'Place',
        itemId
      );

      this.savedItems =
        this.savedItems.filter(
          id => id !== itemId
        );

      RaahiApp.showToast(
        'Removed from your Journey Collection',
        'info'
      );

    } else {

      await RaahiAPI.saveResource(
        'Place',
        itemId
      );

      this.savedItems.push(itemId);

      RaahiApp.showToast(
        'Saved to your Journey Collection!',
        'success'
      );
    }

    if (
      typeof RaahiPlaces !== 'undefined'
    ) {
      RaahiPlaces.renderPlaces();
    }

    if (
      typeof RaahiHotels !== 'undefined'
    ) {
      RaahiHotels.renderHotels();
    }

    if (
      typeof RaahiRestaurants !== 'undefined'
    ) {
      RaahiRestaurants.renderRestaurants();
    }

    if (
      typeof RaahiDashboard !== 'undefined'
    ) {
      RaahiDashboard.renderSavedCollection();
    }

    if (
      typeof RaahiSidebar !== 'undefined'
    ) {
      RaahiSidebar.render();
    }

  } catch (error) {

    console.error(
      '[RaahiAuth] Save toggle failed:',
      error
    );

    RaahiApp.showToast(
      error.message ||
      'Unable to update saved place.',
      'error'
    );
  }
},




  isSaved(itemId) {
    return this.savedItems.includes(itemId);
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiAuth = RaahiAuth;
}
