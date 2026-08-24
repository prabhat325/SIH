/**
 * RAAHI - AI/ML Backend Client Connector
 * Communicates with the Python AI/ML REST server at http://localhost:8000/
 * Automatically detects backend availability and provides transparent client-side fallback.
 */

const RaahiAPI = {
  baseUrl: 'http://localhost:8088',
  isBackendOnline: false,

  async init() {
    await this.checkHealth();
  },

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        this.isBackendOnline = true;
        this.updateStatusBadge(true);
        console.log("✅ [Raahi AI Backend]: Connected to Python ML Engine v" + data.version);
        return true;
      }
    } catch (err) {
      this.isBackendOnline = false;
      this.updateStatusBadge(false);
      console.log("ℹ️ [Raahi AI Backend]: Python server offline. Running in fast client-side fallback mode.");
    }
    return false;
  },

  updateStatusBadge(online) {
    const badges = document.querySelectorAll('.ai-engine-status-badge');
    badges.forEach(badge => {
      if (online) {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
          <span>Python ML Backend Active</span>
        `;
        badge.className = 'ai-engine-status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20';
      } else {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
          <span>Client ML Mode (Start backend on :8000 for Python ML)</span>
        `;
        badge.className = 'ai-engine-status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/20';
      }
    });
  },

  async generateItinerary(payload) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/generate-itinerary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          return data.itinerary;
        }
      } catch (e) {
        console.warn("Backend call failed, falling back to client planner:", e);
      }
    }
    return null; // Signals planner to use client synthesis
  },

  async predictCrowd(monumentName, hour = 10, month = 10) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/predict-crowd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monument: monumentName, hour, month })
        });
        if (res.ok) {
          const data = await res.json();
          return data.forecast;
        }
      } catch (e) {}
    }
    return null;
  },

  async sendChat(message) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        if (res.ok) {
          const data = await res.json();
          return data.reply;
        }
      } catch (e) {}
    }
    return null;
  }
};
