/**
 * RAAHI — Floating AI Heritage Concierge
 * Conversational heritage companion with knowledge about Indian monuments, food, safety, and timings.
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

  sendMessage(userQuery) {
    const messagesContainer = document.getElementById('ai-messages-container');
    if (!messagesContainer) return;

    // User Message Bubble
    messagesContainer.innerHTML += `
      <div class="flex justify-end mb-3">
        <div class="bg-amber-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%] text-xs shadow-sm">
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
        <div class="bg-stone-100 dark:bg-stone-800 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs text-stone-500 italic">
          Raahi AI is searching verified records...
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Simulated Intelligence Response
    setTimeout(() => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      let botReply = "Namaste! I can assist you with ASI monument entry rules, best times to visit across India, authentic regional dining spots, and 24x7 emergency helplines.";

      const q = userQuery.toLowerCase();
      if (q.includes('lucknow') || q.includes('imambara')) {
        botReply = "In Lucknow, don't miss the 18th-century **Bara Imambara & Bhool Bhulaiya** (open 6 AM - 5 PM). For lunch, try the 110-year-old legendary **Tunday Kababi** at Aminabad/Chowk for authentic Galouti kebabs!";
      } else if (q.includes('varanasi') || q.includes('kashi') || q.includes('aarti')) {
        botReply = "For Varanasi, the grand **Ganga Maha Aarti** at Dashashwamedh Ghat takes place daily at 06:30 PM. For morning boat rides, 5:30 AM sunrise from Assi to Manikarnika is unmatched. For chaat, visit **Kashi Chaat Bhandar**.";
      } else if (q.includes('taj') || q.includes('agra')) {
        botReply = "The **Taj Mahal** opens from sunrise to sunset and is closed on Fridays for prayers. Foreign tickets are ₹1100, and Indian tickets are ₹50 (+₹200 for main dome). Morning sunrise is the best time for photography!";
      } else if (q.includes('emergency') || q.includes('police') || q.includes('help') || q.includes('sos')) {
        botReply = "In case of any emergency anywhere in India, immediately dial **112** (All-in-one National Emergency). For tourist-specific assistance in 12 languages, dial **1363** (Incredible India Helpline).";
      } else if (q.includes('jaipur') || q.includes('rajasthan')) {
        botReply = "In Jaipur, visit **Amber Fort** early in the morning to explore Sheesh Mahal, then stop by Hawa Mahal and Jantar Mantar. For an authentic Rajasthani Thali, experience **Chokhi Dhani**!";
      }

      messagesContainer.innerHTML += `
        <div class="flex items-start gap-2 mb-3">
          <div class="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">R</div>
          <div class="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-xs shadow-sm space-y-1 leading-relaxed">
            ${botReply}
          </div>
        </div>
      `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 600);
  }
};

if (typeof window !== 'undefined') {
  window.RaahiAI = RaahiAI;
}
