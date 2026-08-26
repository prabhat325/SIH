/**
 * RAAHI — YouTube-Style Collapsible Sidebar System
 * Primary Navigation Architecture for SIH Tourism Operating System
 *
 * Features:
 * - Desktop: Expanded (270px) & Collapsed (74px) YouTube-style layout
 * - Mobile: Full-height animated off-canvas drawer with blurred backdrop
 * - Dynamic Active Route Highlighting with Glowing Indicator
 * - Dynamic City Context Section (Preserves selected city across categories)
 * - Dynamic Auth & Role-Aware Navigation (Traveler, Guest, Curator Admin)
 * - Real-time Saved Resource Live Badge
 * - Keyboard Accessible with ARIA Attributes, Focus Rings & ESC dismiss
 * - LocalStorage state persistence
 */

const RaahiSidebar = {
  isCollapsed: false,
  isMobileOpen: false,
  currentRoute: 'home',
  cityContext: null, // { id: 'lucknow', name: 'Lucknow', cat: 'hotels' }

  init() {
    // Load collapse state from localStorage (desktop only)
    const savedCollapse = localStorage.getItem('raahi_sidebar_collapsed');
    this.isCollapsed = savedCollapse === 'true' && window.innerWidth >= 1024;

    this.bindEvents();
    this.detectCityContextFromHash();
    this.render();
    this.applyLayoutState();
  },

  bindEvents() {
    // Desktop & Mobile Sidebar Toggle Buttons
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('#sidebar-toggle-btn, .sidebar-toggle-trigger');
      if (toggleBtn) {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          this.toggleCollapse();
        } else {
          this.toggleMobile();
        }
      }

      // Mobile drawer close triggers
      const closeBtn = e.target.closest('#mobile-sidebar-close, .mobile-sidebar-backdrop');
      if (closeBtn) {
        e.preventDefault();
        this.closeMobile();
      }

      // Direct Sidebar Navigation Link clicks
      const navItem = e.target.closest('.raahi-sidebar-nav-item');
      if (navItem) {
        const route = navItem.getAttribute('data-route');
        const action = navItem.getAttribute('data-action');
        const cityId = navItem.getAttribute('data-city-id');
        const cityCat = navItem.getAttribute('data-city-cat');

        if (action) {
          e.preventDefault();
          this.handleAction(action);
          if (this.isMobileOpen) this.closeMobile();
          return;
        }

        if (cityId && cityCat) {
          e.preventDefault();
          if (typeof RaahiCityHub !== 'undefined') {
            RaahiCityHub.openCity(cityId, cityCat);
          }
          if (this.isMobileOpen) this.closeMobile();
          return;
        }

        if (route) {
          // Route mapping
          if (['saved', 'reviews', 'contributions', 'profile', 'settings'].includes(route)) {
            e.preventDefault();
            this.handleTravelerRoute(route);
            if (this.isMobileOpen) this.closeMobile();
            return;
          }

          if (route === 'weather') {
            e.preventDefault();
            this.handleWeatherRoute();
            if (this.isMobileOpen) this.closeMobile();
            return;
          }

          if (this.isMobileOpen) {
            this.closeMobile();
          }
        }
      }
    });

    // Window Resize Handler for responsive behavior
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 1024 && this.isMobileOpen) {
          this.closeMobile();
        }
        this.applyLayoutState();
      }, 100);
    });

    // Keyboard Shortcuts (Ctrl+B / Cmd+B to toggle sidebar, ESC to close mobile drawer)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          this.toggleCollapse();
        } else {
          this.toggleMobile();
        }
      }

      if (e.key === 'Escape' && this.isMobileOpen) {
        this.closeMobile();
      }
    });

    // Listen to hash changes to update active states & city context
    window.addEventListener('hashchange', () => {
      this.detectCityContextFromHash();
      this.updateActiveState();
    });
  },

  detectCityContextFromHash() {
    const fullHash = window.location.hash.replace('#', '').trim();
    if (fullHash.startsWith('city')) {
      const queryPart = fullHash.includes('?') ? fullHash.split('?')[1] : '';
      const params = new URLSearchParams(queryPart);
      const cityId = params.get('id') || 'lucknow';
      const cat = params.get('cat') || 'hotels';
      
      const cityName = (typeof RAAHI_DATA !== 'undefined' && RAAHI_DATA.destinations)
        ? (RAAHI_DATA.destinations.find(d => d.id === cityId)?.name || cityId.charAt(0).toUpperCase() + cityId.slice(1))
        : (cityId.charAt(0).toUpperCase() + cityId.slice(1));

      this.cityContext = { id: cityId, name: cityName, cat: cat };
    } else {
      this.cityContext = null;
    }
  },

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('raahi_sidebar_collapsed', this.isCollapsed);
    this.render();
    this.applyLayoutState();
  },

  toggleMobile() {
    if (this.isMobileOpen) {
      this.closeMobile();
    } else {
      this.openMobile();
    }
  },

  openMobile() {
    this.isMobileOpen = true;
    const drawer = document.getElementById('raahi-mobile-sidebar-drawer');
    const backdrop = document.getElementById('raahi-mobile-sidebar-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('-translate-x-full');
      drawer.classList.add('translate-x-0');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100');
      document.body.style.overflow = 'hidden';
    }
    this.renderMobile();
  },

  closeMobile() {
    this.isMobileOpen = false;
    const drawer = document.getElementById('raahi-mobile-sidebar-drawer');
    const backdrop = document.getElementById('raahi-mobile-sidebar-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('-translate-x-full');
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      document.body.style.overflow = '';
    }
  },

  applyLayoutState() {
    const desktopSidebar = document.getElementById('raahi-desktop-sidebar');
    const mainContent = document.getElementById('app-main-content');
    const header = document.getElementById('app-main-header');

    if (!desktopSidebar) return;

    if (window.innerWidth >= 1024) {
      desktopSidebar.classList.remove('hidden');
      if (this.isCollapsed) {
        desktopSidebar.style.width = '76px';
        desktopSidebar.setAttribute('aria-expanded', 'false');
        if (mainContent) mainContent.style.marginLeft = '76px';
        if (header) header.style.paddingLeft = '76px';
      } else {
        desktopSidebar.style.width = '272px';
        desktopSidebar.setAttribute('aria-expanded', 'true');
        if (mainContent) mainContent.style.marginLeft = '272px';
        if (header) header.style.paddingLeft = '272px';
      }
    } else {
      desktopSidebar.classList.add('hidden');
      if (mainContent) mainContent.style.marginLeft = '0px';
      if (header) header.style.paddingLeft = '0px';
    }
  },

  handleAction(action) {
    if (typeof RaahiAuth === 'undefined') return;

    switch (action) {
      case 'signin':
        RaahiAuth.openAuthModal('signin');
        break;
      case 'guest':
        RaahiAuth.loginAsGuest();
        break;
      case 'logout':
        RaahiAuth.logout();
        break;
      case 'persona-traveler':
        RaahiAuth.loginAs('traveler');
        break;
      case 'persona-admin':
        RaahiAuth.loginAs('admin');
        break;
    }
    this.render();
  },

  handleTravelerRoute(route) {
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate('dashboard', true);
    }
    if (typeof RaahiDashboard !== 'undefined') {
      const tabMap = {
        'saved': 'saved',
        'reviews': 'reviews',
        'contributions': 'contributions',
        'profile': 'personalized',
        'settings': 'personalized'
      };
      RaahiDashboard.switchTab(tabMap[route] || 'personalized');
    }
  },

  handleWeatherRoute() {
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate('weather', true);
    }
    if (typeof RaahiCrowdClimate !== 'undefined') {
      // Ensure crowd climate module renders for default or active city
      const city = this.cityContext?.id || 'lucknow';
      RaahiCrowdClimate.openClimateModal(city);
    }
  },

  // =========================================================================
  // DATA STRUCTURE & NAVIGATION SCHEMA
  // =========================================================================
  getNavigationSchema() {
    const user = (typeof RaahiAuth !== 'undefined') ? RaahiAuth.currentUser : null;
    const isLoggedIn = !!user;
    const isAdmin = user && user.role === 'admin';
    const savedCount = (typeof RaahiAuth !== 'undefined' && RaahiAuth.savedItems) ? RaahiAuth.savedItems.length : 0;
    const reviewCount = (typeof RaahiAuth !== 'undefined' && RaahiAuth.myReviews) ? RaahiAuth.myReviews.length : 0;

    const sections = [];

    // 1. MAIN SECTION
    sections.push({
      id: 'main',
      title: 'Main',
      items: [
        { id: 'home', label: 'Home', icon: 'explore', route: 'home', href: '#home' },
        { id: 'explore', label: 'Explore India', icon: 'travel_explore', route: 'explore', href: '#explore' },
        { id: 'cities', label: 'Cities & Regions', icon: 'location_city', route: 'explore', href: '#explore' },
        { id: 'map', label: 'Interactive Map', icon: 'map', route: 'map', href: '#map' },
        { id: 'weather', label: 'Crowd & Climate', icon: 'thermostat', route: 'weather', href: '#weather' }
      ]
    });

    // 2. CITY CONTEXT SECTION (Dynamically included when visiting a city)
    if (this.cityContext) {
      const cId = this.cityContext.id;
      const cName = this.cityContext.name;
      sections.push({
        id: 'city-context',
        title: `📍 ${cName.toUpperCase()}`,
        isCityContext: true,
        items: [
          { id: 'city-overview', label: `${cName} Overview`, icon: 'info', cityId: cId, cityCat: 'overview', href: `#city?id=${cId}&cat=overview`, isCityItem: true },
          { id: 'city-places', label: 'Places & Heritage', icon: 'account_balance', cityId: cId, cityCat: 'places', href: `#city?id=${cId}&cat=places`, isCityItem: true },
          { id: 'city-hotels', label: 'Hotels & Stays', icon: 'hotel', cityId: cId, cityCat: 'hotels', href: `#city?id=${cId}&cat=hotels`, isCityItem: true },
          { id: 'city-restaurants', label: 'Restaurants & Food', icon: 'restaurant', cityId: cId, cityCat: 'restaurants', href: `#city?id=${cId}&cat=restaurants`, isCityItem: true },
          { id: 'city-events', label: 'Cultural Events', icon: 'event', cityId: cId, cityCat: 'events', href: `#city?id=${cId}&cat=events`, isCityItem: true },
          { id: 'city-guides', label: 'Local Guides', icon: 'badge', cityId: cId, cityCat: 'guides', href: `#city?id=${cId}&cat=guides`, isCityItem: true },
          { id: 'city-vehicles', label: 'Tourist Vehicles', icon: 'directions_car', cityId: cId, cityCat: 'vehicles', href: `#city?id=${cId}&cat=vehicles`, isCityItem: true },
          { id: 'city-emergency', label: 'Emergency 112', icon: 'emergency', cityId: cId, cityCat: 'emergency', href: `#city?id=${cId}&cat=emergency`, isCityItem: true, badge: 'SOS', badgeColor: 'red' },
          { id: 'city-weather', label: 'Live Weather', icon: 'cloud', cityId: cId, cityCat: 'weather', href: `#city?id=${cId}&cat=weather`, isCityItem: true },
          { id: 'city-map', label: 'City Map View', icon: 'pin_drop', cityId: cId, cityCat: 'map', href: `#city?id=${cId}&cat=map`, isCityItem: true }
        ]
      });
    }

    // 3. DISCOVER SECTION
    sections.push({
      id: 'discover',
      title: 'Discover',
      items: [
        { id: 'places', label: 'Tourist Places', icon: 'museum', route: 'places', href: '#places' },
        { id: 'hotels', label: 'Hotels & Stays', icon: 'hotel', route: 'hotels', href: '#hotels' },
        { id: 'restaurants', label: 'Restaurants & Food', icon: 'restaurant', route: 'restaurants', href: '#restaurants' },
        { id: 'events', label: 'Cultural Events', icon: 'event', route: 'events', href: '#events' },
        { id: 'guides', label: 'Verified Guides', icon: 'support_agent', route: 'guides', href: '#guides' },
        { id: 'vehicles', label: 'Tourist Vehicles', icon: 'directions_car', route: 'vehicles', href: '#vehicles', badge: 'New', badgeColor: 'amber' },
        { id: 'emergency', label: 'Emergency 112', icon: 'emergency', route: 'emergency', href: '#emergency', badge: '112 SOS', badgeColor: 'red' }
      ]
    });

    // 4. YOUR TRAVEL SECTION (Only when Logged in)
    if (isLoggedIn) {
      sections.push({
        id: 'your-travel',
        title: 'Your Travel',
        items: [
          { id: 'saved', label: 'Saved Journey', icon: 'bookmark', route: 'saved', href: '#saved', badge: savedCount > 0 ? `${savedCount}` : null, badgeColor: 'amber' },
          { id: 'reviews', label: 'My Reviews', icon: 'rate_review', route: 'reviews', href: '#reviews', badge: reviewCount > 0 ? `${reviewCount}` : null, badgeColor: 'cyan' },
          { id: 'contributions', label: 'My Change Requests', icon: 'published_with_changes', route: 'contributions', href: '#contributions' },
          { id: 'planner', label: 'AI Trip Planner', icon: 'auto_awesome', route: 'planner', href: '#planner', badge: 'AI', badgeColor: 'purple' }
        ]
      });
    }

    // 5. ADMIN SECTION (Strictly user.role === 'admin')
    if (isAdmin) {
      sections.push({
        id: 'admin',
        title: '🛡️ Chief Curator Admin',
        isAdmin: true,
        items: [
          { id: 'admin-dash', label: 'Admin Dashboard', icon: 'dashboard', route: 'admin', href: '#admin', badge: 'Console', badgeColor: 'purple' },
          { id: 'admin-users', label: 'User Registry', icon: 'group', route: 'admin', href: '#admin' },
          { id: 'admin-places', label: 'Places Management', icon: 'account_balance', route: 'places', href: '#places' },
          { id: 'admin-hotels', label: 'Hotels Management', icon: 'hotel', route: 'hotels', href: '#hotels' },
          { id: 'admin-restaurants', label: 'Restaurants Mgmt', icon: 'restaurant', route: 'restaurants', href: '#restaurants' },
          { id: 'admin-events', label: 'Events Management', icon: 'event', route: 'events', href: '#events' },
          { id: 'admin-guides', label: 'Guides Management', icon: 'badge', route: 'guides', href: '#guides' },
          { id: 'admin-vehicles', label: 'Vehicles Fleet', icon: 'directions_car', route: 'vehicles', href: '#vehicles' },
          { id: 'admin-emergency', label: 'Emergency Mgmt', icon: 'emergency', route: 'emergency', href: '#emergency' },
          { id: 'admin-changes', label: 'Change Requests Queue', icon: 'assignment_turned_in', route: 'admin', href: '#admin', badge: 'Active', badgeColor: 'amber' },
          { id: 'admin-reviews', label: 'Reviews Moderation', icon: 'reviews', route: 'admin', href: '#admin' }
        ]
      });
    }

    // 6. ACCOUNT SECTION
    const accountItems = [];
    if (isLoggedIn) {
      accountItems.push(
        { id: 'profile', label: 'Traveler Profile', icon: 'account_circle', route: 'profile', href: '#profile' },
        { id: 'settings', label: 'Settings', icon: 'settings', route: 'settings', href: '#settings' },
        { id: 'logout', label: 'Sign Out', icon: 'logout', action: 'logout', isAction: true, isDanger: true }
      );
    } else {
      accountItems.push(
        { id: 'signin', label: 'Sign In / Register', icon: 'login', action: 'signin', isAction: true, badge: 'Auth', badgeColor: 'amber' },
        { id: 'guest', label: 'Explore as Guest', icon: 'travel_explore', action: 'guest', isAction: true }
      );
    }

    sections.push({
      id: 'account',
      title: 'Account',
      items: accountItems
    });

    return sections;
  },

  // =========================================================================
  // RENDERING ENGINE
  // =========================================================================
  render() {
    this.renderDesktop();
    this.renderMobile();
  },

  renderDesktop() {
    const container = document.getElementById('raahi-desktop-sidebar');
    if (!container) return;

    const sections = this.getNavigationSchema();
    const isCollapsed = this.isCollapsed;

    // Desktop Header Branding (Expanded vs Collapsed)
    const headerHtml = `
      <div class="h-18 lg:h-20 flex items-center px-4 shrink-0 border-b border-slate-800/80 dark:border-slate-800/80 ${isCollapsed ? 'justify-center' : 'justify-between'}">
        <a href="#home" class="flex items-center gap-3 group overflow-hidden cursor-pointer" title="Raahi — Safar Aapka, Planning Hamari">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all shrink-0">
            <span class="material-symbols-outlined text-2xl text-white">explore</span>
          </div>
          ${!isCollapsed ? `
            <div class="flex flex-col min-w-0 transition-opacity duration-200">
              <span class="font-heading text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-none">
                Raahi
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-400"></span>
              </span>
              <span class="text-[10px] text-amber-400 font-semibold tracking-wide mt-0.5 truncate">
                Safar Aapka, Planning Hamari
              </span>
            </div>
          ` : ''}
        </a>
      </div>
    `;

    // Render Navigation Sections
    const sectionsHtml = sections.map(sec => this.renderSection(sec, isCollapsed, false)).join('');

    // Footer Persona / Mini Profile Status
    const user = (typeof RaahiAuth !== 'undefined') ? RaahiAuth.currentUser : null;
    const footerHtml = this.renderDesktopFooter(user, isCollapsed);

    container.innerHTML = `
      <div class="h-full flex flex-col justify-between overflow-hidden bg-[#090e1a]/95 dark:bg-[#070b14]/95 backdrop-blur-2xl border-r border-slate-800/80 text-slate-200 shadow-2xl transition-all duration-300">
        ${headerHtml}
        
        <!-- Scrollable Navigation Area -->
        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-4 hide-scrollbar" role="navigation" aria-label="Main Navigation">
          ${sectionsHtml}
        </nav>

        ${footerHtml}
      </div>
    `;

    this.updateActiveState();
  },

  renderDesktopFooter(user, isCollapsed) {
    if (!user) {
      return `
        <div class="p-3 shrink-0 border-t border-slate-800/80 bg-slate-900/40">
          <button onclick="RaahiAuth.openAuthModal('signin')" class="w-full py-2.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer" title="Sign In">
            <span class="material-symbols-outlined text-base">login</span>
            ${!isCollapsed ? '<span>Sign In / Join</span>' : ''}
          </button>
        </div>
      `;
    }

    const isCurator = user.role === 'admin';
    const roleBadge = isCurator ? 'Curator Admin' : user.role === 'guest' ? 'Guest' : 'Traveler';
    const roleColor = isCurator ? 'text-purple-400 border-purple-500/40 bg-purple-950/50' : 'text-amber-400 border-amber-500/40 bg-amber-950/50';

    if (isCollapsed) {
      return `
        <div class="p-3 shrink-0 border-t border-slate-800/80 flex justify-center bg-slate-900/40">
          <button onclick="RaahiSidebar.handleTravelerRoute('profile')" class="relative group cursor-pointer" title="${user.name} (${roleBadge})">
            <img src="${user.avatar}" alt="${user.name}" class="w-9 h-9 rounded-full object-cover border-2 ${isCurator ? 'border-purple-500' : 'border-amber-500'} shadow-md">
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${isCurator ? 'bg-purple-500' : 'bg-emerald-500'} ring-2 ring-[#090e1a]"></span>
          </button>
        </div>
      `;
    }

    return `
      <div class="p-3 shrink-0 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <img src="${user.avatar}" alt="${user.name}" class="w-9 h-9 rounded-full object-cover border-2 ${isCurator ? 'border-purple-500' : 'border-amber-500'} shadow-md shrink-0">
          <div class="min-w-0 flex-1">
            <div class="font-heading text-xs font-bold text-white truncate leading-tight">${user.name}</div>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${roleColor}">
                ${roleBadge}
              </span>
            </div>
          </div>
        </div>

        <button onclick="RaahiSidebar.handleAction('logout')" class="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer shrink-0" title="Log Out">
          <span class="material-symbols-outlined text-lg">logout</span>
        </button>
      </div>
    `;
  },

  renderMobile() {
    const container = document.getElementById('raahi-mobile-sidebar-container');
    if (!container) return;

    const sections = this.getNavigationSchema();
    const sectionsHtml = sections.map(sec => this.renderSection(sec, false, true)).join('');
    const user = (typeof RaahiAuth !== 'undefined') ? RaahiAuth.currentUser : null;

    container.innerHTML = `
      <div class="h-full flex flex-col justify-between overflow-y-auto p-4 space-y-4">
        <!-- Mobile Header with Close Button -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md">
              <span class="material-symbols-outlined text-xl">explore</span>
            </div>
            <div>
              <span class="font-heading text-lg font-bold text-white block leading-tight">Raahi</span>
              <span class="text-[10px] text-amber-400 font-semibold">Safar Aapka, Planning Hamari</span>
            </div>
          </div>
          <button id="mobile-sidebar-close" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer" aria-label="Close Sidebar Navigation">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <!-- Scrollable Mobile Navigation Links -->
        <nav class="flex-1 space-y-4 overflow-y-auto pr-1" role="navigation" aria-label="Mobile Navigation">
          ${sectionsHtml}
        </nav>

        <!-- Mobile User State / Actions -->
        <div class="pt-4 border-t border-slate-800/80">
          ${user ? `
            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div class="flex items-center gap-2.5 min-w-0">
                <img src="${user.avatar}" alt="${user.name}" class="w-8 h-8 rounded-full object-cover border border-amber-500">
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white truncate">${user.name}</div>
                  <div class="text-[10px] text-amber-400 capitalize">${user.role} Mode</div>
                </div>
              </div>
              <button onclick="RaahiSidebar.handleAction('logout')" class="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg">
                <span class="material-symbols-outlined text-base">logout</span>
              </button>
            </div>
          ` : `
            <button onclick="RaahiSidebar.handleAction('signin')" class="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-base">login</span>
              <span>Sign In / Create Account</span>
            </button>
          `}
        </div>
      </div>
    `;

    this.updateActiveState();
  },

  renderSection(sec, isCollapsed, isMobile) {
    const isCity = sec.isCityContext;
    const isAdmin = sec.isAdmin;

    const titleHtml = (!isCollapsed || isMobile) ? `
      <div class="px-3 pb-1 pt-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${isAdmin ? 'text-purple-400' : isCity ? 'text-cyan-400' : 'text-slate-400'} select-none">
        <span>${sec.title}</span>
        ${isCity ? '<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>' : ''}
      </div>
    ` : `
      <div class="h-px bg-slate-800/60 my-2 mx-2"></div>
    `;

    const itemsHtml = sec.items.map(item => this.renderItem(item, isCollapsed, isMobile, isAdmin, isCity)).join('');

    return `
      <div class="sidebar-section space-y-0.5" data-section="${sec.id}">
        ${titleHtml}
        <div class="space-y-1">
          ${itemsHtml}
        </div>
      </div>
    `;
  },

  renderItem(item, isCollapsed, isMobile, isAdmin, isCity) {
    const badgeHtml = item.badge ? this.renderBadge(item.badge, item.badgeColor, isCollapsed && !isMobile) : '';
    
    // In collapsed desktop mode, we display a compact center aligned layout with floating tooltip
    if (isCollapsed && !isMobile) {
      return `
        <a href="${item.href || '#'}" 
           data-route="${item.route || ''}"
           data-action="${item.action || ''}"
           data-city-id="${item.cityId || ''}"
           data-city-cat="${item.cityCat || ''}"
           data-item-id="${item.id}"
           class="raahi-sidebar-nav-item collapsed-nav-item group relative flex flex-col items-center justify-center w-full py-2.5 px-1 rounded-2xl transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
           title="${item.label}${item.badge ? ' (' + item.badge + ')' : ''}"
           aria-label="${item.label}">
          
          <div class="relative flex items-center justify-center">
            <span class="material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:scale-110 ${item.isDanger ? 'text-red-400' : ''}">${item.icon}</span>
            ${badgeHtml}
          </div>

          <!-- YouTube Mini Label under Icon -->
          <span class="text-[9px] font-semibold mt-1 tracking-tight text-center truncate max-w-[64px] transition-colors leading-none opacity-80 group-hover:opacity-100">
            ${item.label.split(' ')[0]}
          </span>

          <!-- Left Active Indicator Bar -->
          <div class="active-indicator absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-amber-500 opacity-0 transition-opacity"></div>
        </a>
      `;
    }

    // Expanded Desktop or Mobile View
    return `
      <a href="${item.href || '#'}"
         data-route="${item.route || ''}"
         data-action="${item.action || ''}"
         data-city-id="${item.cityId || ''}"
         data-city-cat="${item.cityCat || ''}"
         data-item-id="${item.id}"
         class="raahi-sidebar-nav-item expanded-nav-item group relative flex items-center justify-between w-full px-3 py-2.5 rounded-2xl transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-800/70 hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer ${item.isDanger ? 'hover:bg-red-950/30 hover:text-red-300' : ''}"
         aria-label="${item.label}">
        
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-symbols-outlined text-[20px] shrink-0 text-slate-400 group-hover:text-amber-400 transition-colors ${item.isDanger ? 'group-hover:text-red-400' : ''}">${item.icon}</span>
          <span class="font-medium text-xs truncate group-hover:font-bold transition-all">${item.label}</span>
        </div>

        ${badgeHtml}

        <!-- Left Active Indicator Bar -->
        <div class="active-indicator absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-amber-400 to-amber-600 opacity-0 transition-opacity"></div>
      </a>
    `;
  },

  renderBadge(text, color = 'amber', isMini = false) {
    const colorStyles = {
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-500/10',
      cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs shadow-cyan-500/10',
      red: 'bg-red-600 text-white border-red-500 font-extrabold shadow-sm shadow-red-600/30 animate-pulse',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-xs shadow-purple-500/10'
    };

    const style = colorStyles[color] || colorStyles.amber;

    if (isMini) {
      return `
        <span class="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${style} shrink-0">
          ${text}
        </span>
      `;
    }

    return `
      <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border ${style} shrink-0 ml-1">
        ${text}
      </span>
    `;
  },

  // =========================================================================
  // ACTIVE ROUTE DETECTION & REAL-TIME HIGHLIGHTING
  // =========================================================================
  updateActiveState(targetRoute) {
    const fullHash = window.location.hash.replace('#', '').trim() || 'home';
    const mainRoute = targetRoute || (typeof RaahiApp !== 'undefined' ? RaahiApp.currentRoute : 'home') || 'home';

    document.querySelectorAll('.raahi-sidebar-nav-item').forEach(item => {
      const itemRoute = item.getAttribute('data-route');
      const itemCityId = item.getAttribute('data-city-id');
      const itemCityCat = item.getAttribute('data-city-cat');
      const itemHref = item.getAttribute('href');

      let isActive = false;

      // City context match
      if (itemCityId && itemCityCat && this.cityContext) {
        isActive = (this.cityContext.id === itemCityId && this.cityContext.cat === itemCityCat);
      }
      // Exact hash match or route match
      else if (itemHref && itemHref === `#${fullHash}`) {
        isActive = true;
      }
      // General route match
      else if (itemRoute && (itemRoute === mainRoute || (itemRoute === 'explore' && mainRoute === 'destinations'))) {
        isActive = true;
      }

      const indicator = item.querySelector('.active-indicator');

      if (isActive) {
        item.classList.add(
          'active-sidebar-nav-item',
          'bg-gradient-to-r',
          'from-amber-500/15',
          'to-transparent',
          'text-white',
          'font-bold',
          'border-l-2',
          'border-amber-500',
          'shadow-sm'
        );
        item.classList.remove('text-slate-300', 'text-slate-400');
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.classList.add('text-amber-400', 'scale-110');
          icon.classList.remove('text-slate-400');
        }
        if (indicator) indicator.classList.remove('opacity-0');
      } else {
        item.classList.remove(
          'active-sidebar-nav-item',
          'bg-gradient-to-r',
          'from-amber-500/15',
          'to-transparent',
          'text-white',
          'font-bold',
          'border-l-2',
          'border-amber-500',
          'shadow-sm'
        );
        item.classList.add('text-slate-300');
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.classList.remove('text-amber-400', 'scale-110');
          icon.classList.add('text-slate-400');
        }
        if (indicator) indicator.classList.add('opacity-0');
      }
    });
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RaahiSidebar = RaahiSidebar;
}
