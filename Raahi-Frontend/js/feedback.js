/**
 * RAAHI — Active Destination Feedback Tracking System
 * Connects to: POST http://localhost:8000/api/v1/feedback
 * Actions:
 *   - Like (❤️) -> event_type: "destination_liked"
 *   - Save (🔖) -> event_type: "destination_saved"
 *   - Not for Me (✖️) -> event_type: "destination_dismissed"
 * Features:
 *   - Contextual payload: { user_id, destination_id, event_type, context: { companion_type, budget_tier } }
 *   - Local state caching in localStorage
 *   - Smooth interactive animations & toast notifications
 *   - Card dimming/hiding for "Not for Me"
 */

const RaahiFeedback = {
  likes: new Set(),
  saves: new Set(),
  dismissed: new Set(),

  init() {
    this.loadCachedFeedback();
  },

  loadCachedFeedback() {
    try {
      const storedLikes = JSON.parse(localStorage.getItem('raahi_feedback_likes') || '[]');
      const storedSaves = JSON.parse(localStorage.getItem('raahi_feedback_saves') || '[]');
      const storedDismissed = JSON.parse(localStorage.getItem('raahi_feedback_dismissed') || '[]');

      this.likes = new Set(storedLikes);
      this.saves = new Set(storedSaves);
      this.dismissed = new Set(storedDismissed);
    } catch (e) {
      console.warn("Could not load stored feedback:", e);
    }
  },

  saveCachedFeedback() {
    try {
      localStorage.setItem('raahi_feedback_likes', JSON.stringify(Array.from(this.likes)));
      localStorage.setItem('raahi_feedback_saves', JSON.stringify(Array.from(this.saves)));
      localStorage.setItem('raahi_feedback_dismissed', JSON.stringify(Array.from(this.dismissed)));
    } catch (e) {
      console.warn("Could not save feedback to localStorage:", e);
    }
  },

  isLiked(destId) {
    return this.likes.has(destId.toLowerCase());
  },

  isSaved(destId) {
    return this.saves.has(destId.toLowerCase());
  },

  isDismissed(destId) {
    return this.dismissed.has(destId.toLowerCase());
  },

  // Main Tracking Function
  async track(destId, actionType, btnElement = null) {
    const normId = (destId || 'destination').toLowerCase();
    const destName = destId.charAt(0).toUpperCase() + destId.slice(1);

    let eventType = "destination_liked";
    let toastMessage = `Preferences updated! AI will tune future recommendations.`;

    const companion = (typeof RaahiPlanner !== 'undefined' && RaahiPlanner.selectedCompanion) || 'Solo';
    const budgetTier = (typeof RaahiBudgetForecaster !== 'undefined' && RaahiBudgetForecaster.tier) || 
                       (typeof RaahiSmartMatch !== 'undefined' && RaahiSmartMatch.budgetTier) || 'Moderate';
    
    let userId = "session_user";
    if (typeof RaahiAuth !== 'undefined' && RaahiAuth.currentUser) {
      userId = RaahiAuth.currentUser.id || RaahiAuth.currentUser.email || "session_user";
    }

    if (actionType === 'like') {
      eventType = "destination_liked";
      if (this.likes.has(normId)) {
        this.likes.delete(normId);
        toastMessage = `Removed ${destName} from your favorites.`;
        if (btnElement) {
          btnElement.classList.remove('active-liked');
          btnElement.innerHTML = `<span class="material-symbols-outlined text-sm">favorite_border</span>`;
        }
      } else {
        this.likes.add(normId);
        toastMessage = `Added to favorites! AI will tune future recommendations.`;
        if (btnElement) {
          btnElement.classList.add('active-liked');
          btnElement.innerHTML = `<span class="material-symbols-outlined text-sm text-red-500 fill-current animate-bounce">favorite</span>`;
        }
      }
    } else if (actionType === 'save') {
      eventType = "destination_saved";
      if (this.saves.has(normId)) {
        this.saves.delete(normId);
        toastMessage = `Removed ${destName} from your saved bucket list.`;
        if (btnElement) {
          btnElement.classList.remove('active-saved');
          btnElement.innerHTML = `<span class="material-symbols-outlined text-sm">bookmark_border</span>`;
        }
      } else {
        this.saves.add(normId);
        toastMessage = `Saved ${destName} to bucket list! AI will tune future recommendations.`;
        if (btnElement) {
          btnElement.classList.add('active-saved');
          btnElement.innerHTML = `<span class="material-symbols-outlined text-sm text-amber-500 fill-current animate-bounce">bookmark_added</span>`;
        }
      }
    } else if (actionType === 'not_for_me' || actionType === 'dislike') {
      eventType = "destination_dismissed";
      this.dismissed.add(normId);
      toastMessage = `Preferences updated! AI will show fewer destinations like ${destName}.`;

      // Smoothly dim/fade the card
      const card = btnElement ? btnElement.closest('.group') || btnElement.closest('.card-hover') : null;
      if (card) {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '0.35';
        card.style.filter = 'grayscale(80%)';
        card.style.pointerEvents = 'none';
      }
    }

    this.saveCachedFeedback();

    // Trigger toast notification
    if (typeof RaahiApp !== 'undefined' && RaahiApp.showToast) {
      RaahiApp.showToast(toastMessage, actionType === 'not_for_me' ? 'info' : 'success');
    }

    // Backend API Payload
    const payload = {
      user_id: userId,
      destination_id: normId,
      event_type: eventType,
      context: {
        companion_type: companion,
        budget_tier: budgetTier
      }
    };

    // Background Non-blocking Dispatch
    try {
      fetch('http://localhost:8000/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {
        // Fallback gracefully without user interruption
      });
    } catch (e) {
      // Ignored for offline resilience
    }
  },

  // Helper to render feedback buttons toolbar on any destination card
  renderCardFeedbackToolbar(destId) {
    const normId = (destId || '').toLowerCase();
    const isLiked = this.isLiked(normId);
    const isSaved = this.isSaved(normId);

    return `
      <div class="feedback-toolbar flex items-center gap-1 z-20" onclick="event.stopPropagation()">
        <!-- Like Button -->
        <button onclick="RaahiFeedback.track('${normId}', 'like', this)"
                title="${isLiked ? 'Unlike' : 'Like'}"
                class="w-7 h-7 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-red-500 hover:scale-110 transition-all shadow-xs border border-white/30 ${isLiked ? 'active-liked text-red-500' : ''}">
          <span class="material-symbols-outlined text-sm ${isLiked ? 'text-red-500 fill-current' : ''}">
            ${isLiked ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        <!-- Save Button -->
        <button onclick="RaahiFeedback.track('${normId}', 'save', this)"
                title="${isSaved ? 'Unsave' : 'Save'}"
                class="w-7 h-7 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-amber-500 hover:scale-110 transition-all shadow-xs border border-white/30 ${isSaved ? 'active-saved text-amber-500' : ''}">
          <span class="material-symbols-outlined text-sm ${isSaved ? 'text-amber-500 fill-current' : ''}">
            ${isSaved ? 'bookmark_added' : 'bookmark_border'}
          </span>
        </button>

        <!-- Not for Me Button -->
        <button onclick="RaahiFeedback.track('${normId}', 'not_for_me', this)"
                title="Not for Me (Tune AI)"
                class="w-7 h-7 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-400 hover:text-stone-800 dark:hover:text-white hover:scale-110 transition-all shadow-xs border border-white/30">
          <span class="material-symbols-outlined text-xs">close</span>
        </button>
      </div>
    `;
  }
};

// Global Exposure
if (typeof window !== 'undefined') {
  window.RaahiFeedback = RaahiFeedback;
}
