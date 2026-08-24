/**
 * RAAHI - AI Travel Concierge Module ("Raahi AI")
 * Intelligent floating conversational drawer with rich heritage travel guidance.
 */

const RaahiAI = {
  isOpen: false,
  chatHistory: [],

  knowledgeBase: {
    "temple": "When visiting Indian temples and holy shrines, dress respectfully covering shoulders and knees. Slip-on footwear is recommended as shoes are left at the entrance. In South Indian temples, traditional dhotis or modest attire are often required.",
    "kerala": "The ideal time for Kerala backwater houseboats is from September to March for pleasant sunny breezes. If you seek deep Ayurvedic rejuvenation (Panchakarma), the monsoon months (June–August) are traditionally celebrated as the most restorative season.",
    "rajasthan": "For Rajasthan, the winter months from October to March offer cool desert evenings (12°C-18°C) and warm sunny days (24°C-28°C). We recommend experiencing Udaipur's Lake Pichola at sunset, followed by a private heritage haveli stay in Jodhpur.",
    "packing": "For India luxury travel, pack breathable natural fabrics (linen, cotton), comfortable slip-on walking footwear for heritage monuments, a light pashmina/shawl for air-conditioned transit, and sun protection (SPF 50+ and polarized sunglasses).",
    "food": "Indian culinary traditions are exceptionally rich for vegetarian, vegan, and gluten-conscious travelers. Look for regional specialties like Rajasthani Dal Baati Churma, Gujarati Thali, or South Indian Keralan Sadhyas prepared with cold-pressed coconut oil.",
    "train": "For an ultra-luxury heritage railway journey, consider the Maharajas' Express or Palace on Wheels. For scenic daytime routes, the Vande Bharat Express or the UNESCO Darjeeling Toy Train offer unforgettable vistas."
  },

  init() {
    this.bindEvents();
    this.addInitialGreeting();
  },

  bindEvents() {
    const triggerBtn = document.getElementById('ai-concierge-trigger');
    const closeBtn = document.getElementById('ai-concierge-close');
    const sendBtn = document.getElementById('ai-concierge-send');
    const inputField = document.getElementById('ai-concierge-input');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.toggleDrawer());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    if (inputField) {
      inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Quick prompt chips in drawer
    const promptChips = document.querySelectorAll('.ai-prompt-chip');
    promptChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.textContent.trim();
        this.processUserInput(text);
      });
    });
  },

  toggleDrawer() {
    if (this.isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  },

  openDrawer() {
    const drawer = document.getElementById('ai-concierge-drawer');
    if (drawer) {
      drawer.classList.remove('translate-x-full');
      this.isOpen = true;
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('ai-concierge-drawer');
    if (drawer) {
      drawer.classList.add('translate-x-full');
      this.isOpen = false;
    }
  },

  openDrawerWithPrompt(promptText) {
    this.openDrawer();
    setTimeout(() => {
      this.processUserInput(promptText);
    }, 300);
  },

  addInitialGreeting() {
    const container = document.getElementById('ai-chat-messages');
    if (container && this.chatHistory.length === 0) {
      const greeting = "Namaste! I am **Raahi AI**, your Heritage Intelligence concierge. How may I assist your voyage across India today?";
      this.appendMessage('assistant', greeting);
    }
  },

  sendMessage() {
    const input = document.getElementById('ai-concierge-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    this.processUserInput(text);
  },

  processUserInput(text) {
    this.appendMessage('user', text);

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'ai-typing-indicator';
    typingIndicator.className = 'flex items-center gap-2 text-xs text-on-surface-variant p-3 bg-surface-container rounded-xl w-max';
    typingIndicator.innerHTML = `
      <span class="material-symbols-outlined text-sm animate-spin text-secondary">progress_activity</span>
      <span>Raahi AI is analyzing heritage records...</span>
    `;
    const container = document.getElementById('ai-chat-messages');
    if (container) {
      container.appendChild(typingIndicator);
      container.scrollTop = container.scrollHeight;
    }

    setTimeout(async () => {
      if (document.getElementById('ai-typing-indicator')) {
        document.getElementById('ai-typing-indicator').remove();
      }
      
      let reply = null;
      if (typeof RaahiAPI !== 'undefined') {
        reply = await RaahiAPI.sendChat(text);
      }

      const response = reply || this.generateResponse(text);
      this.appendMessage('assistant', response);
    }, 600);
  },

  generateResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('temple') || q.includes('dress') || q.includes('wear') || q.includes('etiquette')) {
      return this.knowledgeBase["temple"];
    } else if (q.includes('kerala') || q.includes('houseboat') || q.includes('ayurveda')) {
      return this.knowledgeBase["kerala"];
    } else if (q.includes('rajasthan') || q.includes('jaipur') || q.includes('jodhpur') || q.includes('udaipur')) {
      return this.knowledgeBase["rajasthan"];
    } else if (q.includes('pack') || q.includes('luggage') || q.includes('clothes')) {
      return this.knowledgeBase["packing"];
    } else if (q.includes('food') || q.includes('eat') || q.includes('vegetarian') || q.includes('culinary')) {
      return this.knowledgeBase["food"];
    } else if (q.includes('train') || q.includes('rail') || q.includes('transit')) {
      return this.knowledgeBase["train"];
    } else if (q.includes('plan') || q.includes('itinerary')) {
      return "I have tailored our **AI Trip Planner** for you! You can modify pacing, dates, and curated interests in the Planner tab, or click below to start customizing.";
    } else {
      return `Thank you for asking about "${query}". India offers extraordinary depths of culture, architectural splendor, and spiritual rejuvenation. Would you like me to recommend specific destinations, tailor your day-by-day itinerary, or suggest bespoke experiences like private houseboat charters?`;
    }
  },

  appendMessage(role, text) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    const isUser = role === 'user';

    msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`;
    msgDiv.innerHTML = `
      <div class="${isUser 
        ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm' 
        : 'bg-surface-container dark:bg-surface-container-high text-on-surface rounded-2xl rounded-tl-sm border border-outline-variant/20'} p-3.5 max-w-[85%] text-xs md:text-sm leading-relaxed shadow-sm">
        ${this.formatMarkdown(text)}
      </div>
    `;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    this.chatHistory.push({ role, text });
  },

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
};
