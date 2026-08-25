/**
 * RAAHI — Floating AI Travel Assistant ("Ask Raahi")
 * "Safar Aapka, Planning Hamari"
 * Provides contextual answers, suggested prompts, and one-tap deep navigation to AI Planner, Places, Food, and Maps.
 */

const RaahiAI = {
  isOpen: false,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const toggleBtn = document.getElementById('ai-fab-toggle');
    const closeBtn = document.getElementById('ai-drawer-close');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleDrawer());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          this.sendMessage(text);
          input.value = '';
        }
      });
    }
  },

  toggleDrawer() {
    this.isOpen = !this.isOpen;
    const drawer = document.getElementById('ai-concierge-drawer');
    if (!drawer) return;
    if (this.isOpen) {
      drawer.classList.remove('translate-x-full');
    } else {
      drawer.classList.add('translate-x-full');
    }
  },

  closeDrawer() {
    this.isOpen = false;
    const drawer = document.getElementById('ai-concierge-drawer');
    if (drawer) drawer.classList.add('translate-x-full');
  },

  sendSuggestedPrompt(promptText) {
    this.sendMessage(promptText);
  },

  sendMessage(userQuery) {
    const messagesContainer = document.getElementById('ai-messages-container');
    if (!messagesContainer) return;

    // User Message Bubble
    messagesContainer.innerHTML += `
      <div class="flex justify-end mb-3">
        <div class="bg-amber-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%] text-xs shadow-sm font-medium">
          ${userQuery}
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Typing Indicator
    const typingId = `typing-${Date.now()}`;
    messagesContainer.innerHTML += `
      <div id="${typingId}" class="flex items-start gap-2 mb-3">
        <div class="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">R</div>
        <div class="bg-stone-100 dark:bg-stone-800 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs text-stone-500 italic flex items-center gap-1.5">
          <span class="material-symbols-outlined text-xs animate-spin">sync</span>
          <span>Raahi AI is analyzing verified travel intelligence...</span>
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Simulated Intelligence Response
    setTimeout(() => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      let botReply = "Namaste! I can assist you with ASI monument entry rules, best times to visit across India, authentic regional dining spots, custom itineraries, and 24x7 emergency helplines.";
      let actionButtons = "";

      const q = userQuery.toLowerCase();

      if (q.includes('plan my trip') || q.includes('plan a trip') || q.includes('create plan') || q.includes('itinerary')) {
        botReply = "I can build a multi-day personalized itinerary for any destination in India with day-by-day morning, afternoon, and evening slots, transit distances, and optimized routes.";
        actionButtons = `
          <div class="pt-2 flex flex-wrap gap-2">
            <button onclick="RaahiAI.closeDrawer(); RaahiApp.navigate('planner');" class="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">auto_awesome</span>
              <span>Open AI Travel Planner</span>
            </button>
          </div>
        `;
      } else if (q.includes('visit nearby') || q.includes('near me') || q.includes('nearby')) {
        botReply = "Based on your current heritage corridor, you have incredible monuments and authentic eateries within a 3 km radius:";
        actionButtons = `
          <div class="pt-2 space-y-1.5 text-[11px] text-stone-600 dark:text-stone-300">
            <div class="p-2 rounded-lg bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <span>📍 <strong>Bara Imambara</strong> (1.2 km)</span>
              <span class="text-amber-600 font-bold">Open now</span>
            </div>
            <div class="p-2 rounded-lg bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <span>🍛 <strong>Tunday Kababi</strong> (2.1 km)</span>
              <span class="text-amber-600 font-bold">Chowk</span>
            </div>
            <button onclick="RaahiAI.closeDrawer(); RaahiApp.navigate('map');" class="mt-2 w-full py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] font-bold hover:bg-amber-600 transition-colors">
              Explore Interactive Map
            </button>
          </div>
        `;
      } else if (q.includes('family') || q.includes('families')) {
        botReply = "For family travel with kids and seniors, I recommend spacious monuments with lush gardens, verified wheelchair accessibility, and evening sound & light shows:";
        actionButtons = `
          <div class="pt-2 space-y-1.5 text-[11px]">
            <p>• <strong>Lucknow:</strong> Residency Gardens & British Memorial (Easy walking, calm lawns)</p>
            <p>• <strong>Agra:</strong> Mehtab Bagh sunset garden with direct Taj Mahal view</p>
            <p>• <strong>Jaipur:</strong> City Palace & Jantar Mantar observatory</p>
            <button onclick="RaahiAI.closeDrawer(); RaahiApp.runSmartQuery('family friendly places');" class="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-colors">
              View Family-Friendly Places
            </button>
          </div>
        `;
      } else if (q.includes('today') || q.includes('what can i do')) {
        botReply = "Here is a high-yield single day recommendation: Spend your morning exploring historical architectural marvels, enjoy a slow regional lunch, and conclude your evening with scenic sunset boat rides or cultural light shows!";
        actionButtons = `
          <div class="pt-2 flex gap-2">
            <button onclick="RaahiAI.closeDrawer(); RaahiApp.navigate('planner');" class="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold">
              Generate 1-Day Plan
            </button>
          </div>
        `;
      } else if (q.includes('historical') || q.includes('monument') || q.includes('heritage') || q.includes('fort')) {
        botReply = "India is home to magnificent UNESCO World Heritage monuments, royal forts, and sacred ghats. Here are top recommended spots:";
        actionButtons = `
          <div class="pt-2 space-y-1 text-[11px]">
            <p>• <strong>Taj Mahal & Agra Fort</strong> (Agra, UP)</p>
            <p>• <strong>Bara Imambara & Rumi Darwaza</strong> (Lucknow, UP)</p>
            <p>• <strong>Kashi Vishwanath & Dashashwamedh Ghat</strong> (Varanasi, UP)</p>
            <p>• <strong>Amber Fort & Hawa Mahal</strong> (Jaipur, Rajasthan)</p>
            <button onclick="RaahiAI.closeDrawer(); RaahiApp.navigate('places');" class="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold">
              Explore All Verified Places
            </button>
          </div>
        `;
      } else if (q.includes('food') || q.includes('restaurant') || q.includes('kebab') || q.includes('eat') || q.includes('dining')) {
        botReply = "Authentic culinary heritage is the soul of Indian travel! Here are iconic spots verified by Raahi:";
        actionButtons = `
          <div class="pt-2 space-y-1 text-[11px]">
            <p>• <strong>Tunday Kababi</strong> — 110-year-old Galouti Kebabs in Lucknow</p>
            <p>• <strong>Kashi Chaat Bhandar</strong> — Famous Tamatar Chaat in Varanasi</p>
            <p>• <strong>Karim's</strong> — Mughal cuisine next to Jama Masjid, Delhi</p>
            <p>• <strong>Chokhi Dhani</strong> — Traditional Rajasthani Thali in Jaipur</p>
            <button onclick="RaahiAI.closeDrawer(); RaahiApp.navigate('restaurants');" class="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold">
              View Verified Restaurants
            </button>
          </div>
        `;
      } else if (q.includes('lucknow') || q.includes('imambara')) {
        botReply = "In Lucknow, explore the 18th-century **Bara Imambara & Bhool Bhulaiya** (open 6 AM - 5 PM) and the bullet-scarred **British Residency**. For lunch, visit Chowk for authentic Galouti kebabs and Makhan Malai!";
      } else if (q.includes('varanasi') || q.includes('kashi') || q.includes('aarti')) {
        botReply = "For Varanasi, the **Ganga Maha Aarti** at Dashashwamedh Ghat takes place daily at 06:30 PM. For morning boat rides, a 5:30 AM sunrise from Assi to Manikarnika is unmatched.";
      } else if (q.includes('taj') || q.includes('agra')) {
        botReply = "The **Taj Mahal** opens from sunrise to sunset (closed Fridays). Foreign tickets: ₹1100, Indian tickets: ₹50 (+₹200 for main dome). Morning sunrise is the best time for photography!";
      } else if (q.includes('emergency') || q.includes('police') || q.includes('help') || q.includes('sos')) {
        botReply = "In case of any emergency anywhere in India, immediately dial **112** (All-in-one Emergency). For tourist-specific assistance in 12 languages, dial **1363** (Incredible India Helpline).";
      } else if (q.includes('jaipur') || q.includes('rajasthan')) {
        botReply = "In Jaipur, visit **Amber Fort** early in the morning to explore Sheesh Mahal, then stop by Hawa Mahal and Jantar Mantar. For authentic Rajasthani food, try **Chokhi Dhani**!";
      }

      messagesContainer.innerHTML += `
        <div class="flex items-start gap-2 mb-3">
          <div class="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">R</div>
          <div class="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-xs shadow-sm space-y-2 leading-relaxed">
            <p>${botReply}</p>
            ${actionButtons}
          </div>
        </div>
      `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 450);
  }
};

if (typeof window !== 'undefined') {
  window.RaahiAI = RaahiAI;
}
