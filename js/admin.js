/**
 * RAAHI - Admin & Curator Management Portal
 * Handles guest reservations, experience inventory CRUD, live analytics, and AI system metrics.
 */

const RaahiAdmin = {
  reservations: [
    {
      id: "RES-8921",
      guestName: "Lady Victoria Spencer",
      experienceTitle: "Traditional Kettuvallam Houseboat Cruise",
      location: "Alleppey, Kerala",
      date: "2026-10-15",
      guests: 2,
      total: "₹36,000",
      status: "Confirmed",
      notes: "Requested sunset flute recital and coconut toddy tasting."
    },
    {
      id: "RES-8922",
      guestName: "Dr. Siddharth Mehrotra",
      experienceTitle: "Private Sitar & Classical Music Masterclass",
      location: "Varanasi, Uttar Pradesh",
      date: "2026-10-18",
      guests: 1,
      total: "₹12,500",
      status: "Pending",
      notes: "Interested in morning Raga Bhupali exploration."
    },
    {
      id: "RES-8923",
      guestName: "Elena Rostova",
      experienceTitle: "Royal Rajasthani Thali & Palace Dinner",
      location: "Jaipur, Rajasthan",
      date: "2026-10-22",
      guests: 4,
      total: "₹34,000",
      status: "VIP Attention",
      notes: "Anniversary celebration at private terrace pavilion."
    }
  ],

  init() {
    this.loadAdminData();
    this.bindEvents();
    this.renderAll();
  },

  loadAdminData() {
    const savedRes = localStorage.getItem('raahi_admin_reservations');
    if (savedRes) {
      try {
        this.reservations = JSON.parse(savedRes);
      } catch (e) {}
    }
  },

  saveReservations() {
    localStorage.setItem('raahi_admin_reservations', JSON.stringify(this.reservations));
  },

  bindEvents() {
    const addExpForm = document.getElementById('admin-add-experience-form');
    if (addExpForm) {
      addExpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addNewExperience();
      });
    }
  },

  renderAll() {
    this.renderStats();
    this.renderReservationsTable();
    this.renderInventoryList();
  },

  renderStats() {
    const countEl = document.getElementById('admin-stat-reservations');
    const revEl = document.getElementById('admin-stat-revenue');
    
    if (countEl) countEl.textContent = this.reservations.length;
    if (revEl) {
      const sum = this.reservations.reduce((acc, curr) => {
        const num = parseInt(curr.total.replace(/[^0-9]/g, '')) || 0;
        return acc + num;
      }, 1845000);
      revEl.textContent = `₹${sum.toLocaleString()}`;
    }
  },

  renderReservationsTable() {
    const tbody = document.getElementById('admin-reservations-tbody');
    if (!tbody) return;

    if (this.reservations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-xs text-on-surface-variant">No pending guest inquiries.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.reservations.map((res, index) => {
      let statusClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      if (res.status === 'Confirmed') statusClass = "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      if (res.status === 'VIP Attention') statusClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      if (res.status === 'Declined') statusClass = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

      return `
        <tr class="border-b border-outline-variant/15 hover:bg-surface-container/40 transition-colors text-xs">
          <td class="py-3.5 px-4 font-mono font-bold text-primary dark:text-primary-fixed">${res.id}</td>
          <td class="py-3.5 px-4">
            <span class="font-bold block text-on-surface">${res.guestName}</span>
            <span class="text-[11px] text-on-surface-variant">${res.guests} Guests</span>
          </td>
          <td class="py-3.5 px-4">
            <span class="font-semibold block text-on-surface">${res.experienceTitle}</span>
            <span class="text-[11px] text-on-surface-variant">${res.location} • ${res.date}</span>
          </td>
          <td class="py-3.5 px-4 font-bold text-on-surface">${res.total}</td>
          <td class="py-3.5 px-4">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${statusClass}">${res.status}</span>
          </td>
          <td class="py-3.5 px-4 text-right">
            <div class="flex justify-end gap-1.5">
              <button onclick="RaahiAdmin.updateStatus(${index}, 'Confirmed')" class="p-1.5 rounded-lg bg-green-500/10 text-green-700 hover:bg-green-500/20 transition-colors" title="Confirm Booking">
                <span class="material-symbols-outlined text-base">check</span>
              </button>
              <button onclick="RaahiAdmin.updateStatus(${index}, 'VIP Attention')" class="p-1.5 rounded-lg bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 transition-colors" title="Mark VIP">
                <span class="material-symbols-outlined text-base">star</span>
              </button>
              <button onclick="RaahiAdmin.updateStatus(${index}, 'Declined')" class="p-1.5 rounded-lg bg-red-500/10 text-red-700 hover:bg-red-500/20 transition-colors" title="Decline">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateStatus(index, newStatus) {
    if (this.reservations[index]) {
      this.reservations[index].status = newStatus;
      this.saveReservations();
      this.renderReservationsTable();
      RaahiApp.showToast(`Updated reservation ${this.reservations[index].id} to ${newStatus}`);
    }
  },

  renderInventoryList() {
    const list = document.getElementById('admin-inventory-list');
    if (!list) return;

    list.innerHTML = RAAHI_DATA.experiences.map((exp, idx) => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container dark:bg-surface-container-high border border-outline-variant/15 text-xs">
        <div class="flex items-center gap-3">
          <img src="${exp.image}" alt="${exp.title}" class="w-12 h-12 rounded-lg object-cover">
          <div>
            <h5 class="font-bold text-on-surface">${exp.title}</h5>
            <span class="text-[11px] text-on-surface-variant">${exp.location} • ${exp.priceFormatted}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-primary-container/20 text-primary dark:text-primary-fixed text-[10px] font-bold uppercase">${exp.category}</span>
          <button onclick="RaahiAdmin.deleteExperience(${idx})" class="p-1 text-outline hover:text-red-600 transition-colors" title="Remove Experience">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </div>
    `).join('');
  },

  addNewExperience() {
    const title = document.getElementById('new-exp-title')?.value;
    const location = document.getElementById('new-exp-location')?.value;
    const category = document.getElementById('new-exp-category')?.value || 'heritage';
    const price = document.getElementById('new-exp-price')?.value || '₹15,000';
    const duration = document.getElementById('new-exp-duration')?.value || 'Half Day';
    const description = document.getElementById('new-exp-desc')?.value || 'Curated luxury experience.';
    const image = document.getElementById('new-exp-image')?.value || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq1IHEhPZ2DXEjlM6niqAcKHNIyYD95PiohA7J6-5PMoP4S4WxC2UkMGWm7xu6-ibvGnNu9DGHr6-gKsj1ircomIfs3Qcg6Bu_j85pGXHqX6OGYUKsggus9W7-WrWHhjcoPhMn9U3W7XbDj9kPMwjbRXGouoaOVPBs6O1bQlumo-trn-_jaglqQje1cNYpE_MaxAgUfdPSCseRW5WyyVJrzDfCnjD7iuqDBJU7XAohu_4X73ZY1jkd';

    if (!title || !location) {
      RaahiApp.showToast("Please fill in the title and location");
      return;
    }

    const newExp = {
      id: 'custom-exp-' + Date.now(),
      title,
      category,
      location,
      duration,
      price: parseInt(price.replace(/[^0-9]/g, '')) || 15000,
      priceFormatted: price.startsWith('₹') ? price : `₹${price}`,
      description,
      image,
      featured: true,
      tags: ["New Curation", "Bespoke", category]
    };

    RAAHI_DATA.experiences.unshift(newExp);
    this.renderInventoryList();
    if (typeof RaahiExperiences !== 'undefined') {
      RaahiExperiences.renderExperiences();
    }

    RaahiApp.showToast(`Published "${title}" to Curated Experiences!`);
    document.getElementById('admin-add-experience-form')?.reset();
  },

  deleteExperience(idx) {
    if (confirm("Remove this experience from active curations?")) {
      const removed = RAAHI_DATA.experiences.splice(idx, 1);
      this.renderInventoryList();
      if (typeof RaahiExperiences !== 'undefined') {
        RaahiExperiences.renderExperiences();
      }
      RaahiApp.showToast(`Removed "${removed[0]?.title}"`);
    }
  }
};
