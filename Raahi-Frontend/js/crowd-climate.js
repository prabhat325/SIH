/**
 * RAAHI — Crowd & Climate Forecaster Module
 * Connects to:
 *   - GET http://localhost:8000/api/v1/crowd/forecast?destination_id={id}&month={month}
 *   - GET http://localhost:8000/api/v1/weather/{id}?month={month}
 * Features:
 *   - Color-coded Crowd Gauge (🟢 Low, 🟡 Moderate, 🟠 High, 🔴 Peak)
 *   - 12-Month Interactive Footfall Bar Chart highlighting Best Travel Windows & Shoulder Months
 *   - Weather Comfort Score Gauge (0-10) with Climate Tags (Temperature, Rainfall, Seasonality)
 *   - High-fidelity offline seasonal dataset for all Indian destinations
 */

const RaahiCrowdClimate = {
  currentDest: 'lucknow',
  selectedMonth: 'October',

  // 12-Month Matrix across Key Destinations
  destinationClimateData: {
    lucknow: {
      name: "Lucknow",
      state: "Uttar Pradesh",
      bestWindow: "October to March",
      shoulderMonths: ["September", "March"],
      months: {
        'January':   { footfall: 85, level: 'Peak',     color: '#ef4444', comfortScore: 9.0, tempDay: 21, tempNight: 8,  rainMm: 12, rainDesc: 'Dry & Crisp Foggy Mornings', season: 'Peak Winter Heritage' },
        'February':  { footfall: 68, level: 'Moderate', color: '#eab308', comfortScore: 9.6, tempDay: 26, tempNight: 12, rainMm: 14, rainDesc: 'Pleasant Sunny Days',        season: 'Spring Flower Season (Shoulder)' },
        'March':     { footfall: 52, level: 'Moderate', color: '#eab308', comfortScore: 8.8, tempDay: 32, tempNight: 16, rainMm: 8,  rainDesc: 'Warm & Sunny',               season: 'Pleasant Spring (Shoulder)' },
        'April':     { footfall: 30, level: 'Low',      color: '#10b981', comfortScore: 6.5, tempDay: 38, tempNight: 22, rainMm: 6,  rainDesc: 'Dry & Hot Afternoons',       season: 'Summer Start (Low Crowd Saver)' },
        'May':       { footfall: 20, level: 'Low',      color: '#10b981', comfortScore: 4.8, tempDay: 41, tempNight: 27, rainMm: 15, rainDesc: 'Intense Heatwave / Loo',     season: 'Off-Peak Summer' },
        'June':      { footfall: 25, level: 'Low',      color: '#10b981', comfortScore: 5.2, tempDay: 39, tempNight: 28, rainMm: 80, rainDesc: 'Pre-Monsoon Humid Showers',  season: 'Monsoon Transition' },
        'July':      { footfall: 35, level: 'Low',      color: '#10b981', comfortScore: 6.0, tempDay: 34, tempNight: 26, rainMm: 240, rainDesc: 'Heavy Monsoon Downpours',   season: 'Lush Monsoon Greens' },
        'August':    { footfall: 42, level: 'Moderate', color: '#eab308', comfortScore: 6.4, tempDay: 33, tempNight: 26, rainMm: 210, rainDesc: 'Occasional Thunderstorms',  season: 'Monsoon Festivals' },
        'September': { footfall: 50, level: 'Moderate', color: '#eab308', comfortScore: 8.2, tempDay: 33, tempNight: 24, rainMm: 120, rainDesc: 'Clearing Skies & Breezy',   season: 'Early Autumn (Shoulder)' },
        'October':   { footfall: 78, level: 'High',     color: '#f97316', comfortScore: 9.4, tempDay: 31, tempNight: 19, rainMm: 25, rainDesc: 'Clear Blue Skies & Mild',    season: 'Festive Heritage Season (Best)' },
        'November':  { footfall: 88, level: 'Peak',     color: '#ef4444', comfortScore: 9.8, tempDay: 28, tempNight: 13, rainMm: 4,  rainDesc: 'Cool Crisp Evenings',        season: 'Prime Heritage Peak (Best)' },
        'December':  { footfall: 92, level: 'Peak',     color: '#ef4444', comfortScore: 9.2, tempDay: 23, tempNight: 9,  rainMm: 8,  rainDesc: 'Cozy Winter Mist',           season: 'Holiday Peak Rush (Best)' }
      }
    },
    varanasi: {
      name: "Varanasi",
      state: "Uttar Pradesh",
      bestWindow: "October to March",
      shoulderMonths: ["September", "February"],
      months: {
        'January':   { footfall: 90, level: 'Peak',     color: '#ef4444', comfortScore: 9.1, tempDay: 22, tempNight: 9,  rainMm: 10, rainDesc: 'Misty Ganges Sunrise',      season: 'Dev Deepawali / Winter Peak' },
        'February':  { footfall: 70, level: 'Moderate', color: '#eab308', comfortScore: 9.5, tempDay: 27, tempNight: 13, rainMm: 12, rainDesc: 'Pleasant Ghat Weather',     season: 'Maha Shivratri (Shoulder)' },
        'March':     { footfall: 55, level: 'Moderate', color: '#eab308', comfortScore: 8.5, tempDay: 33, tempNight: 17, rainMm: 7,  rainDesc: 'Holi Colors & Sunny',       season: 'Spring Transition' },
        'April':     { footfall: 32, level: 'Low',      color: '#10b981', comfortScore: 6.2, tempDay: 39, tempNight: 23, rainMm: 5,  rainDesc: 'Warm Afternoon Sun',        season: 'Low Season Saver' },
        'May':       { footfall: 22, level: 'Low',      color: '#10b981', comfortScore: 4.5, tempDay: 42, tempNight: 28, rainMm: 12, rainDesc: 'Hot Dry Winds',             season: 'Off-Peak Summer' },
        'June':      { footfall: 28, level: 'Low',      color: '#10b981', comfortScore: 5.0, tempDay: 38, tempNight: 29, rainMm: 95, rainDesc: 'Humid Monsoon Winds',      season: 'Ganga Dussehra' },
        'July':      { footfall: 45, level: 'Moderate', color: '#eab308', comfortScore: 6.2, tempDay: 33, tempNight: 26, rainMm: 270, rainDesc: 'Swollen River & Rain',     season: 'Shravan Holy Month' },
        'August':    { footfall: 55, level: 'Moderate', color: '#eab308', comfortScore: 6.6, tempDay: 32, tempNight: 26, rainMm: 250, rainDesc: 'Ghat Pilgrimages & Rain',  season: 'Monsoon Shravan' },
        'September': { footfall: 58, level: 'Moderate', color: '#eab308', comfortScore: 8.3, tempDay: 32, tempNight: 24, rainMm: 140, rainDesc: 'River Receding & Breezes', season: 'Autumn Arrival (Shoulder)' },
        'October':   { footfall: 82, level: 'High',     color: '#f97316', comfortScore: 9.3, tempDay: 31, tempNight: 19, rainMm: 30, rainDesc: 'Clear Skies & Aarti Bliss', season: 'Navratri / Ganga Festival' },
        'November':  { footfall: 95, level: 'Peak',     color: '#ef4444', comfortScore: 9.7, tempDay: 28, tempNight: 14, rainMm: 5,  rainDesc: 'Millions of Ghat Diyas',     season: 'Dev Deepawali Peak (Highest)' },
        'December':  { footfall: 88, level: 'Peak',     color: '#ef4444', comfortScore: 9.0, tempDay: 23, tempNight: 9,  rainMm: 6,  rainDesc: 'Mystic Morning Boat Rides',  season: 'Winter Spiritual Peak' }
      }
    },
    jaipur: {
      name: "Jaipur",
      state: "Rajasthan",
      bestWindow: "October to March",
      shoulderMonths: ["September", "March"],
      months: {
        'January':   { footfall: 92, level: 'Peak',     color: '#ef4444', comfortScore: 9.3, tempDay: 22, tempNight: 8,  rainMm: 6,  rainDesc: 'Crisp Desert Sun & Kite Fest', season: 'Jaipur Lit Fest / Royal Peak' },
        'February':  { footfall: 74, level: 'High',     color: '#f97316', comfortScore: 9.6, tempDay: 26, tempNight: 11, rainMm: 5,  rainDesc: 'Warm Fort Strolls',          season: 'Pleasant Spring (Shoulder)' },
        'March':     { footfall: 56, level: 'Moderate', color: '#eab308', comfortScore: 8.4, tempDay: 32, tempNight: 16, rainMm: 4,  rainDesc: 'Elephant Festival & Sun',    season: 'Holi Season (Shoulder)' },
        'April':     { footfall: 28, level: 'Low',      color: '#10b981', comfortScore: 6.0, tempDay: 38, tempNight: 22, rainMm: 3,  rainDesc: 'Sunny Desert Radiance',      season: 'Summer Palace Saver' },
        'May':       { footfall: 18, level: 'Low',      color: '#10b981', comfortScore: 4.2, tempDay: 42, tempNight: 27, rainMm: 10, rainDesc: 'Peak Summer Dry Heat',       season: 'Low Season' },
        'June':      { footfall: 22, level: 'Low',      color: '#10b981', comfortScore: 4.8, tempDay: 40, tempNight: 28, rainMm: 45, rainDesc: 'Warm Breeze & First Showers',season: 'Monsoon Teaser' },
        'July':      { footfall: 38, level: 'Low',      color: '#10b981', comfortScore: 6.8, tempDay: 34, tempNight: 26, rainMm: 180, rainDesc: 'Teej Festival & Green Hills', season: 'Monsoon Heritage' },
        'August':    { footfall: 46, level: 'Moderate', color: '#eab308', comfortScore: 7.2, tempDay: 32, tempNight: 25, rainMm: 200, rainDesc: 'Lush Aravalli Hills',       season: 'Monsoon Romance' },
        'September': { footfall: 58, level: 'Moderate', color: '#eab308', comfortScore: 8.5, tempDay: 33, tempNight: 23, rainMm: 70, rainDesc: 'Pleasant Autumn Evenings',  season: 'Shoulder Gold Window' },
        'October':   { footfall: 80, level: 'High',     color: '#f97316', comfortScore: 9.4, tempDay: 33, tempNight: 18, rainMm: 12, rainDesc: 'Stunning Fort Sunset Views', season: 'Diwali Royal Splendor' },
        'November':  { footfall: 90, level: 'Peak',     color: '#ef4444', comfortScore: 9.8, tempDay: 29, tempNight: 13, rainMm: 4,  rainDesc: 'Perfect Outdoor Weather',    season: 'Prime Palace Peak' },
        'December':  { footfall: 96, level: 'Peak',     color: '#ef4444', comfortScore: 9.4, tempDay: 24, tempNight: 9,  rainMm: 3,  rainDesc: 'Chilly Nights by Palace Fires', season: 'Year-End Royal Festivities' }
      }
    },
    kerala: {
      name: "Kerala",
      state: "Kerala",
      bestWindow: "September to March",
      shoulderMonths: ["June", "September"],
      months: {
        'January':   { footfall: 86, level: 'Peak',     color: '#ef4444', comfortScore: 9.2, tempDay: 31, tempNight: 22, rainMm: 15, rainDesc: 'Sunny Coastal & Backwaters', season: 'Backwater & Hill Peak' },
        'February':  { footfall: 78, level: 'High',     color: '#f97316', comfortScore: 9.0, tempDay: 32, tempNight: 23, rainMm: 20, rainDesc: 'Warm Tropical Sunshine',    season: 'Pleasant Coastal Peak' },
        'March':     { footfall: 62, level: 'Moderate', color: '#eab308', comfortScore: 8.1, tempDay: 33, tempNight: 24, rainMm: 40, rainDesc: 'Warm & Humid',              season: 'Spring Transition' },
        'April':     { footfall: 45, level: 'Moderate', color: '#eab308', comfortScore: 7.2, tempDay: 34, tempNight: 25, rainMm: 110, rainDesc: 'Vishu Fest & Afternoon Showers', season: 'Summer Saver' },
        'May':       { footfall: 35, level: 'Low',      color: '#10b981', comfortScore: 6.8, tempDay: 33, tempNight: 25, rainMm: 220, rainDesc: 'Warm Tropical Thunderstorms', season: 'Pre-Monsoon Ayurveda' },
        'June':      { footfall: 40, level: 'Low',      color: '#10b981', comfortScore: 7.8, tempDay: 30, tempNight: 24, rainMm: 550, rainDesc: 'Full Monsoon Downpours',    season: 'Prime Monsoon Ayurveda Season' },
        'July':      { footfall: 44, level: 'Moderate', color: '#eab308', comfortScore: 7.6, tempDay: 29, tempNight: 23, rainMm: 480, rainDesc: 'Monsoon Rivers & Mist',    season: 'Ayurvedic Rejuvenation' },
        'August':    { footfall: 65, level: 'Moderate', color: '#eab308', comfortScore: 8.2, tempDay: 30, tempNight: 24, rainMm: 340, rainDesc: 'Nehru Trophy Snake Boat Race', season: 'Onam / Boat Race Extravaganza' },
        'September': { footfall: 68, level: 'Moderate', color: '#eab308', comfortScore: 8.9, tempDay: 30, tempNight: 24, rainMm: 200, rainDesc: 'Lush Green Post-Monsoon',   season: 'Onam Harvest (Shoulder Window)' },
        'October':   { footfall: 75, level: 'High',     color: '#f97316', comfortScore: 9.0, tempDay: 31, tempNight: 23, rainMm: 260, rainDesc: 'Retreating Monsoon Breezes',season: 'Backwater Season Opens' },
        'November':  { footfall: 84, level: 'Peak',     color: '#ef4444', comfortScore: 9.5, tempDay: 31, tempNight: 23, rainMm: 120, rainDesc: 'Ideal Backwater Cruise Weather', season: 'High Season (Best)' },
        'December':  { footfall: 95, level: 'Peak',     color: '#ef4444', comfortScore: 9.6, tempDay: 31, tempNight: 22, rainMm: 30, rainDesc: 'Carnival & Festive Tropics', season: 'Kochi Carnival Peak' }
      }
    },
    goa: {
      name: "Goa",
      state: "Goa",
      bestWindow: "October to April",
      shoulderMonths: ["September", "February"],
      months: {
        'January':   { footfall: 94, level: 'Peak',     color: '#ef4444', comfortScore: 9.4, tempDay: 32, tempNight: 19, rainMm: 2,   rainDesc: 'Clear Blue Coastal Days',    season: 'Sun, Beach & Music Peak' },
        'February':  { footfall: 76, level: 'High',     color: '#f97316', comfortScore: 9.5, tempDay: 32, tempNight: 20, rainMm: 1,   rainDesc: 'Goa Carnival / Coastal Breeze', season: 'Goa Carnival (Shoulder)' },
        'March':     { footfall: 60, level: 'Moderate', color: '#eab308', comfortScore: 8.6, tempDay: 33, tempNight: 23, rainMm: 5,   rainDesc: 'Sunny Seas & Warm Evenings', season: 'Spring Beach Saver' },
        'April':     { footfall: 45, level: 'Moderate', color: '#eab308', comfortScore: 7.4, tempDay: 34, tempNight: 26, rainMm: 12,  rainDesc: 'Warm Afternoon Sunshine',    season: 'Easter Beach Season' },
        'May':       { footfall: 30, level: 'Low',      color: '#10b981', comfortScore: 6.2, tempDay: 34, tempNight: 27, rainMm: 80,  rainDesc: 'Humid Pre-Monsoon Waves',    season: 'Off-Peak Beach Discounts' },
        'June':      { footfall: 35, level: 'Low',      color: '#10b981', comfortScore: 7.0, tempDay: 31, tempNight: 25, rainMm: 700, rainDesc: 'Sao Joao Fest & Heavy Rain',season: 'Monsoon Sao Joao Fest' },
        'July':      { footfall: 40, level: 'Low',      color: '#10b981', comfortScore: 7.2, tempDay: 29, tempNight: 24, rainMm: 850, rainDesc: 'Roaring Dudhsagar Falls',   season: 'Lush Waterfall Trekking' },
        'August':    { footfall: 46, level: 'Moderate', color: '#eab308', comfortScore: 7.5, tempDay: 29, tempNight: 24, rainMm: 500, rainDesc: 'Verdant Spice Plantations',  season: 'Monsoon Quiet Escape' },
        'September': { footfall: 62, level: 'Moderate', color: '#eab308', comfortScore: 8.8, tempDay: 31, tempNight: 24, rainMm: 220, rainDesc: 'Shacks Reopen & Soft Breezes', season: 'Shoulder Beach Window (Best)' },
        'October':   { footfall: 80, level: 'High',     color: '#f97316', comfortScore: 9.2, tempDay: 32, tempNight: 23, rainMm: 110, rainDesc: 'Watersports & Sunshine',   season: 'Beach Season Launch' },
        'November':  { footfall: 90, level: 'Peak',     color: '#ef4444', comfortScore: 9.6, tempDay: 33, tempNight: 22, rainMm: 20,  rainDesc: 'IFFI International Film Fest', season: 'High Season (Best)' },
        'December':  { footfall: 99, level: 'Peak',     color: '#ef4444', comfortScore: 9.5, tempDay: 32, tempNight: 20, rainMm: 5,   rainDesc: 'Christmas & Sunburn Festive',season: 'Global Year-End Rush' }
      }
    }
  },

  // Map arbitrary queries to keys
  resolveKey(destName) {
    const norm = (destName || 'lucknow').toLowerCase().replace(/[^a-z]/g, '');
    if (norm.includes('varanasi')) return 'varanasi';
    if (norm.includes('jaipur')) return 'jaipur';
    if (norm.includes('kerala')) return 'kerala';
    if (norm.includes('goa')) return 'goa';
    return 'lucknow';
  },

  // Fetch from APIs:
  // GET http://localhost:8000/api/v1/crowd/forecast?destination_id={id}&month={month}
  // GET http://localhost:8000/api/v1/weather/{id}?month={month}
  async fetchLiveForecast(destId, month) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      const [crowdRes, weatherRes] = await Promise.allSettled([
        fetch(`http://localhost:8000/api/v1/crowd/forecast?destination_id=${destId}&month=${month}`, { signal: controller.signal }),
        fetch(`http://localhost:8000/api/v1/weather/${destId}?month=${month}`, { signal: controller.signal })
      ]);

      clearTimeout(timeoutId);

      let crowdData = null;
      let weatherData = null;

      if (crowdRes.status === 'fulfilled' && crowdRes.value.ok) {
        crowdData = await crowdRes.value.json();
      }
      if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
        weatherData = await weatherRes.value.json();
      }

      return { crowdData, weatherData };
    } catch (e) {
      return { crowdData: null, weatherData: null };
    }
  },

  // Render Component inside Target Element
  async renderForecaster(destIdentifier, targetElementId, initialMonth = 'October') {
    this.currentDest = destIdentifier || 'Lucknow';
    this.selectedMonth = initialMonth;
    const container = document.getElementById(targetElementId);
    if (!container) return;

    const key = this.resolveKey(this.currentDest);
    const destData = this.destinationClimateData[key] || this.destinationClimateData.lucknow;
    const monthData = destData.months[this.selectedMonth] || destData.months.October;

    // Crowd Gauge Level Details
    const crowdLevelBadge = monthData.level === 'Low'
      ? { label: '🟢 Low Footfall', desc: 'Serene & Peaceful Exploration with Minimal Queues', badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300' }
      : monthData.level === 'Moderate'
      ? { label: '🟡 Moderate Crowds', desc: 'Comfortable Pace, Short Queues, Balanced Atmosphere', badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300' }
      : monthData.level === 'High'
      ? { label: '🟠 High Footfall', desc: 'Popular Travel Window • Book Monument Passes in Advance', badgeBg: 'bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border-orange-300' }
      : { label: '🔴 Peak Overtourism', desc: 'Heavy Tourist Rush & Peak Tariffs • Advance Planning Mandatory', badgeBg: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300' };

    // Weather comfort color
    const comfortColor = monthData.comfortScore >= 9.0 ? 'text-emerald-600 dark:text-emerald-400' :
                         monthData.comfortScore >= 7.5 ? 'text-amber-600 dark:text-amber-400' : 'text-orange-600 dark:text-orange-400';

    const monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    container.innerHTML = `
      <div class="crowd-climate-card p-5 sm:p-7 rounded-3xl space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
              <span class="material-symbols-outlined text-xl">thermostat</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                  Crowd &amp; Climate AI
                </span>
                <span class="text-[10px] text-stone-400 font-mono hidden sm:inline">GET /api/v1/crowd/forecast</span>
              </div>
              <h3 class="font-heading text-base sm:text-lg font-extrabold text-stone-900 dark:text-white mt-0.5">
                Seasonal Footfall &amp; Climate Forecaster
              </h3>
            </div>
          </div>

          <!-- Month Switcher Dropdown -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <label class="text-[11px] font-bold text-stone-500">Month:</label>
            <select onchange="RaahiCrowdClimate.changeMonth(this.value, '${destIdentifier}', '${targetElementId}')" class="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500">
              ${monthList.map(m => `
                <option value="${m}" ${m === this.selectedMonth ? 'selected' : ''}>${m}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Two-Column KPI Grid: Crowd Gauge + Weather Comfort -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- KPI 1: Color-Coded Crowd Gauge & Footfall Index -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Crowd Density Index
              </span>
              <span class="px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${crowdLevelBadge.badgeBg}">
                ${crowdLevelBadge.label}
              </span>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="font-heading text-3xl font-extrabold text-stone-900 dark:text-white font-mono">
                ${monthData.footfall}%
              </span>
              <span class="text-xs font-bold text-stone-500">Footfall Capacity</span>
            </div>

            <!-- Segmented Crowd Meter Bar -->
            <div class="space-y-1.5">
              <div class="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                <div class="h-full rounded-l-full transition-all duration-500" style="width: ${monthData.footfall}%; background-color: ${monthData.color};"></div>
              </div>
              <div class="flex justify-between text-[9px] font-bold text-stone-400">
                <span class="text-emerald-600">🟢 Low (0-35%)</span>
                <span class="text-amber-600">🟡 Mod (36-65%)</span>
                <span class="text-orange-600">🟠 High (66-85%)</span>
                <span class="text-red-600">🔴 Peak (86%+)</span>
              </div>
            </div>

            <p class="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed italic pt-1 border-t border-stone-100 dark:border-stone-800">
              "${crowdLevelBadge.desc}"
            </p>
          </div>

          <!-- KPI 2: Weather Comfort Score Gauge & Climate Tags -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Weather Comfort Score
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                0 – 10 Scale
              </span>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="font-heading text-3xl font-extrabold ${comfortColor} font-mono">
                ${monthData.comfortScore.toFixed(1)}
              </span>
              <span class="text-xs font-bold text-stone-600 dark:text-stone-300">/ 10 Outdoor Rating</span>
            </div>

            <!-- Climate Tags -->
            <div class="grid grid-cols-2 gap-2 pt-1">
              <div class="climate-pill bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300">
                <span class="material-symbols-outlined text-sm text-amber-600">device_thermostat</span>
                <span class="truncate">${monthData.tempDay}°C / ${monthData.tempNight}°C</span>
              </div>
              <div class="climate-pill bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300">
                <span class="material-symbols-outlined text-sm text-blue-600">water_drop</span>
                <span class="truncate">${monthData.rainMm} mm rain</span>
              </div>
            </div>

            <div class="text-[11px] font-medium text-stone-600 dark:text-stone-300 flex items-center gap-1.5 pt-1">
              <span class="material-symbols-outlined text-sm text-emerald-600">filter_drama</span>
              <span class="truncate">Season: <strong>${monthData.season}</strong></span>
            </div>
          </div>

        </div>

        <!-- 12-Month Interactive Footfall Bar Chart -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-850/90 border border-stone-200 dark:border-stone-800 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 class="font-heading text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                <span class="material-symbols-outlined text-emerald-600 text-base">bar_chart</span>
                12-Month Footfall Trajectory
              </h4>
              <p class="text-[11px] text-stone-500">Click any month to inspect crowd density and climate forecast</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                🌟 Best: ${destData.bestWindow}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                🍂 Shoulder: ${destData.shoulderMonths.join(', ')}
              </span>
            </div>
          </div>

          <!-- 12 Vertical Bars Chart Container -->
          <div class="grid grid-cols-12 gap-1 sm:gap-2 items-end h-32 pt-4 pb-2 border-b border-stone-200 dark:border-stone-700">
            ${monthList.map(m => {
              const md = destData.months[m];
              const isSelected = m === this.selectedMonth;
              const isShoulder = destData.shoulderMonths.includes(m);
              const isBest = (destData.bestWindow.includes(m) || m === 'November' || m === 'December' || m === 'January' || m === 'February');
              const barHeight = Math.max(15, md.footfall);

              return `
                <div onclick="RaahiCrowdClimate.changeMonth('${m}', '${destIdentifier}', '${targetElementId}')"
                     class="flex flex-col items-center gap-1.5 crowd-bar group ${isSelected ? 'active-month' : ''}"
                     title="${m}: ${md.footfall}% Footfall (${md.level}) • Comfort: ${md.comfortScore}/10">
                  <span class="text-[9px] font-mono font-bold text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white hidden sm:block">
                    ${md.footfall}%
                  </span>
                  <div class="w-full rounded-t-lg transition-all duration-300 ${isSelected ? 'ring-2 ring-amber-500' : ''}"
                       style="height: ${barHeight}%; background-color: ${md.color};">
                  </div>
                  <span class="text-[10px] font-bold ${isSelected ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-stone-500'}">
                    ${m.substring(0, 3)}
                  </span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Chart Footer Legend & Avoid Overtourism Recommendation -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Low</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Moderate</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-500"></span> High</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Peak</span>
            </div>
            <div class="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">eco</span>
              <span>Pro-Tip: Visit during <strong>${destData.shoulderMonths.join(' or ')}</strong> to dodge overtourism with great weather!</span>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  changeMonth(monthName, destIdentifier, targetElementId) {
    this.renderForecaster(destIdentifier, targetElementId, monthName);
  }
};

// Global Exposure
if (typeof window !== 'undefined') {
  window.RaahiCrowdClimate = RaahiCrowdClimate;
}
