/**
 * RAAHI — Authentication & User State Management
 * Supports Traveler session, Chief Curator Admin, Login/Register modals, and Saved Items.
 */

const RaahiAuth = {
  currentUser: null,
  savedItems: [], // Array of item IDs saved by user
  myReviews: [],
  myContributions: [],

  init() {
    this.loadState();
    this.renderHeaderAuth();
  },

  loadState() {
    try {
      const savedUser = localStorage.getItem('raahi_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        // Default demo traveler session
        this.currentUser = {
          id: "usr-demo",
          name: "Aakash Verma",
          email: "aakash.traveler@raahi.in",
          role: "traveler", // "traveler" | "admin"
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
          bio: "Heritage explorer, photographer & cultural enthusiast."
        };
      }

      const savedList = localStorage.getItem('raahi_saved');
      if (savedList) {
        this.savedItems = JSON.parse(savedList);
      } else {
        this.savedItems = ["bara-imambara", "taj-mahal", "dashashwamedh-ghat", "tunday-kababi-lucknow"];
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
    localStorage.setItem('raahi_user', JSON.stringify(this.currentUser));
    localStorage.setItem('raahi_saved', JSON.stringify(this.savedItems));
    localStorage.setItem('raahi_reviews', JSON.stringify(this.myReviews));
  },

  renderHeaderAuth() {
    const container = document.getElementById('header-auth-container');
    if (!container) return;

    if (this.currentUser) {
      container.innerHTML = `
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Quick Role Switcher for SIH Jury Demo (Curator Admin / Traveler) -->
          <button onclick="RaahiAuth.toggleRole()" title="Switch Role (Traveler / Curator Admin)" class="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl ${this.currentUser.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-300 shadow-2xs' : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80'} transition-all">
            <span class="material-symbols-outlined text-xs">${this.currentUser.role === 'admin' ? 'verified_user' : 'person'}</span>
            <span>${this.currentUser.role === 'admin' ? 'Curator Admin' : 'Traveler'}</span>
          </button>

          <!-- User Profile Avatar Button -->
          <button onclick="RaahiApp.navigate('dashboard')" class="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-amber-500 transition-all shrink-0" title="User Profile &amp; Dashboard">
            <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="w-8 h-8 rounded-full object-cover border border-amber-500 shadow-xs">
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button onclick="RaahiAuth.openAuthModal()" class="text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors">
          Sign In
        </button>
      `;
    }
  },

  toggleRole() {
    if (!this.currentUser) return;
    this.currentUser.role = this.currentUser.role === 'admin' ? 'traveler' : 'admin';
    if (this.currentUser.role === 'admin') {
      this.currentUser.name = "Vikramaditya Rathore (Chief Curator)";
      this.currentUser.avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80";
      RaahiApp.showToast("Switched to Chief Curator Admin Mode", "success");
    } else {
      this.currentUser.name = "Aakash Verma (Traveler)";
      this.currentUser.avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";
      RaahiApp.showToast("Switched to Traveler Mode", "info");
    }
    this.saveState();
    this.renderHeaderAuth();
    if (this.currentUser.role === 'admin') {
      RaahiApp.navigate('admin');
    } else {
      RaahiApp.navigate('dashboard');
    }
  },

  toggleSave(itemId) {
    if (!this.currentUser) {
      this.openAuthModal();
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
    // Re-render UI elements that might display save status
    if (typeof RaahiPlaces !== 'undefined') RaahiPlaces.renderPlaces();
    if (typeof RaahiHotels !== 'undefined') RaahiHotels.renderHotels();
    if (typeof RaahiRestaurants !== 'undefined') RaahiRestaurants.renderRestaurants();
    if (typeof RaahiDashboard !== 'undefined') RaahiDashboard.renderSavedCollection();
  },

  isSaved(itemId) {
    return this.savedItems.includes(itemId);
  },

  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  loginAs(role = 'traveler') {
    if (role === 'admin') {
      this.currentUser = {
        id: "adm-01",
        name: "Vikramaditya Rathore (Chief Curator)",
        email: "curator@raahi.in",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
        bio: "Senior Tourism Verifier & Heritage Board Reviewer."
      };
      RaahiApp.showToast("Logged in as Chief Curator Admin", "success");
    } else {
      this.currentUser = {
        id: "usr-demo",
        name: "Aakash Verma",
        email: "aakash.traveler@raahi.in",
        role: "traveler",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        bio: "Heritage explorer, photographer & cultural enthusiast."
      };
      RaahiApp.showToast("Welcome back to Raahi!", "success");
    }
    this.saveState();
    this.closeAuthModal();
    this.renderHeaderAuth();
    if (role === 'admin') {
      RaahiApp.navigate('admin');
    } else {
      RaahiApp.navigate('dashboard');
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiAuth = RaahiAuth;
}
