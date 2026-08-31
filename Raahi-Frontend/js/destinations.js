/**
 * RAAHI — Destinations & Explainable AI (xAI) Module
 * Features:
 *  1. "Why This Destination?" (Explainable AI Card):
 *     - Renders xAI payload from POST /api/v1/recommend
 *     - AI summary narrative
 *     - Green pills for top contributing features
 *     - Amber warnings for off-season weather or crowd cautions
 *  2. "Similar Vibes" Alternative Carousel:
 *     - Fetches from POST http://localhost:8000/api/v1/recommend/similar { destination_id: "...", top_n: 5 }
 *     - Smooth carousel slider with navigation controls and similar vibe score cards
 *     - Resilient local fallback matrix
 */

const RaahiDestinations = {
  currentFilter: 'all',
  searchQuery: '',
  bookmarkedIds: new Set(),
// Frontend fallback images.
// Backend is NOT modified. These are used only when city.images is empty.
cityImageFallbacks: {
  agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  varanasi: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
  lucknow: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=1200&q=80',
 ayodhya: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  'mathura-vrindavan': 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=1200&q=80',
  prayagraj: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',

  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  udaipur: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  jodhpur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  jaisalmer: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=80',
  pushkar: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  ajmer: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',

  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  amritsar: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80',

  srinagar: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  jammu: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',

  rishikesh: 'https://images.unsplash.com/photo-1609948543911-7f2a0f4f0f1e?auto=format&fit=crop&w=1200&q=80',
  haridwar: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1200&q=80',
  nainital: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
  mussoorie: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
  dehradun: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',

  shimla: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
  manali: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=80',
  leh: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',

  patna: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'bodh-gaya': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  nalanda: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  rajgir: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  vaishali: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  pawapuri: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',

  bhopal: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=80',
  khajuraho: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  gwalior: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  ujjain: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',

  mumbai: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1200&q=80',
  pune: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=80',
  nashik: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
  'chhatrapati-sambhajinagar': 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',

  ahmedabad: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=80',
  'kevadia-ekta-nagar': 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',

  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',

  bengaluru: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=80',
  mysuru: 'https://images.unsplash.com/photo-1600100397608-f010d5f5c9d6?auto=format&fit=crop&w=1200&q=80',
  hampi: 'https://images.unsplash.com/photo-1600100397608-f010d5f5c9d6?auto=format&fit=crop&w=1200&q=80',
  gokarna: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',

  chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  madurai: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  ooty: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
  coimbatore: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  thanjavur: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  mahabalipuram: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',

  'thiruvananthapuram': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  kochi: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  alappuzha: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  munnar: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',

  bhubaneswar: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  puri: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  konark: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',

  kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
  darjeeling: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',

  guwahati: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  shillong: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
  gangtok: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  tawang: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',

  tirupati: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  puducherry: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  'port-blair-sri-vijaya-puram': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',

  hyderabad: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=1200&q=80'
},
  // Pre-configured xAI knowledge base for all premier Indian destinations
  xaiKnowledgeBase: {
    lucknow: {
      summary: "Raahi AI identified Lucknow with 97% affinity based on your interest in historic architecture and Awadhi culinary traditions. The city offers the highest density of 18th-century acoustic labyrinths and verified street gastronomy trails in North India.",
      top_contributing_features: [
        { name: "Historic Labyrinth Architecture", weight: "+42% match", score: 5.0, icon: "account_balance" },
        { name: "Awadhi Culinary Heritage", weight: "+28% match", score: 5.0, icon: "restaurant" },
        { name: "Chikankari Craft Alleys", weight: "+18% match", score: 4.8, icon: "palette" },
        { name: "Budget Value Index", weight: "+12% match", score: 4.6, icon: "savings" }
      ],
      cautions: [
        { type: "weather", title: "Summer Heat Advisory", message: "May–June afternoon temperatures can reach 41°C. Plan outdoor monument visits for 6:00 AM – 10:30 AM or late evenings.", icon: "wb_sunny" },
        { type: "crowd", title: "Weekend Labyrinth Rush", message: "Bara Imambara Bhool Bhulaiya sees heavy Sunday footfall. Visiting on weekday mornings is strongly recommended.", icon: "group" }
      ]
    },
    varanasi: {
      summary: "Raahi AI matched Varanasi (Kashi) with 96% affinity for sacred spirituality and eternal river ghat traditions. Sunrise rowing boat tours and evening brass lamp Maha Aartis match your cultural exploration profile.",
      top_contributing_features: [
        { name: "Sacred Ganga Ghats & Aarti", weight: "+45% match", score: 5.0, icon: "temple_hindu" },
        { name: "Ancient Silk Handloom Weaving", weight: "+25% match", score: 4.9, icon: "texture" },
        { name: "Spiritual Energy & Ashrams", weight: "+18% match", score: 5.0, icon: "self_improvement" },
        { name: "Street Chaat Heritage", weight: "+12% match", score: 4.7, icon: "soup_kitchen" }
      ],
      cautions: [
        { type: "weather", title: "Monsoon Water Levels", message: "July–August brings high Ganges river currents; boat rides may have temporary safety restrictions during peak monsoon.", icon: "water" },
        { type: "crowd", title: "Aarti Vantage Points", message: "Dashashwamedh Ghat fills rapidly by 5:45 PM. Secure wooden boat seats 45 minutes before 6:30 PM ritual.", icon: "access_time" }
      ]
    },
    jaipur: {
      summary: "Raahi AI scored Jaipur at 95% affinity for royal Rajputana heritage, hilltop fortresses, and vibrant bazaars. Ideal for photography, astronomical heritage, and authentic Rajasthani hospitality.",
      top_contributing_features: [
        { name: "Royal Hilltop Fortresses", weight: "+40% match", score: 5.0, icon: "fort" },
        { name: "Textile Block Printing & Gems", weight: "+26% match", score: 4.8, icon: "diamond" },
        { name: "Palace Architecture & Havelis", weight: "+20% match", score: 5.0, icon: "castle" },
        { name: "Rajasthani Culinary Thalis", weight: "+14% match", score: 4.6, icon: "dinner_dining" }
      ],
      cautions: [
        { type: "weather", title: "Arid Daytime Sun", message: "Afternoons in Amber Fort can be intensely sunny; carry UV protection and comfortable walking shoes.", icon: "wb_sunny" },
        { type: "crowd", title: "Elephant & Jeep Queues", message: "Amber Fort ascent queues peak between 9:00 AM – 11:30 AM. Early morning entry opens at 8:00 AM.", icon: "directions_car" }
      ]
    },
    kerala: {
      summary: "Raahi AI computed 98% affinity for tranquil tropical nature, Alleppey backwaters houseboats, and classical Ayurvedic rejuvenation matching your relaxed travel pacing.",
      top_contributing_features: [
        { name: "Backwaters & Houseboat Cruises", weight: "+44% match", score: 5.0, icon: "directions_boat" },
        { name: "Munnar Tea Mist Estates", weight: "+26% match", score: 4.9, icon: "forest" },
        { name: "Ayurvedic Wellness & Spa", weight: "+18% match", score: 5.0, icon: "spa" },
        { name: "Coastal Seafood Gastronomy", weight: "+12% match", score: 4.7, icon: "set_meal" }
      ],
      cautions: [
        { type: "weather", title: "Tropical Monsoon Showers", message: "June–August experiences heavy southwest monsoon rains. Perfect for Ayurveda retreats, but outdoor hill treks may be slippery.", icon: "rainy" },
        { type: "crowd", title: "Peak Houseboat Season", message: "December–January boat dock rates increase by ~30%; book certified DTPC houseboats in advance.", icon: "payments" }
      ]
    },
    goa: {
      summary: "Raahi AI evaluated Goa with 94% affinity for coastal relaxation, UNESCO Portuguese churches, and sunset beach cafes matching your leisure and social vibe.",
      top_contributing_features: [
        { name: "Golden Sand Coastlines", weight: "+38% match", score: 5.0, icon: "beach_access" },
        { name: "Portuguese Baroque Cathedrals", weight: "+28% match", score: 4.8, icon: "church" },
        { name: "Vibrant Nightlife & Cafes", weight: "+22% match", score: 4.9, icon: "nightlife" },
        { name: "Coastal Spice Plantations", weight: "+12% match", score: 4.5, icon: "grass" }
      ],
      cautions: [
        { type: "weather", title: "Off-Season Rough Seas", message: "June–September sea conditions are turbulent with red flag swimming bans across coastal beaches.", icon: "waves" },
        { type: "crowd", title: "New Year Traffic", message: "December 25–Jan 2 experiences peak vehicular congestion in North Goa. South Goa offers calmer alternative coves.", icon: "traffic" }
      ]
    },
    agra: {
      summary: "Raahi AI identified Agra with 93% match for iconic Mughal monuments, marble inlay craftsmanship, and world-heritage discovery centered around the Taj Mahal.",
      top_contributing_features: [
        { name: "UNESCO World Wonder Heritage", weight: "+48% match", score: 5.0, icon: "stars" },
        { name: "Pietra Dura Marble Craft", weight: "+24% match", score: 4.7, icon: "brush" },
        { name: "Mughal Forts & Sunset Gardens", weight: "+18% match", score: 4.8, icon: "nature_people" },
        { name: "Mughlai Petha & Street Sweets", weight: "+10% match", score: 4.4, icon: "bakery_dining" }
      ],
      cautions: [
        { type: "weather", title: "Winter Morning Fog", message: "Late December–January mornings often have dense fog until 9:30 AM. Midday or sunset visits offer clearer vistas.", icon: "foggy" },
        { type: "crowd", title: "Friday Monument Closure", message: "The Taj Mahal is strictly closed for tourists every Friday for afternoon prayers.", icon: "event_busy" }
      ]
    },
    delhi: {
      summary: "Raahi AI scored Delhi at 92% affinity for imperial monuments, historic bazaars, and multi-era culinary heritage spanning Mughal, Colonial, and Modern India.",
      top_contributing_features: [
        { name: "Centuries of Living History", weight: "+38% match", score: 5.0, icon: "history" },
        { name: "Chandni Chowk Food Heritage", weight: "+30% match", score: 5.0, icon: "restaurant_menu" },
        { name: "Monumental Green Corridors", weight: "+18% match", score: 4.7, icon: "park" },
        { name: "Metro Transit Accessibility", weight: "+14% match", score: 4.9, icon: "subway" }
      ],
      cautions: [
        { type: "weather", title: "Peak Summer & AQI", message: "May–June afternoons are hot, and late November–December requires checking AQI forecasts for outdoor heritage walks.", icon: "air" },
        { type: "crowd", title: "Metro Peak Rush", message: "Chandni Chowk and Rajiv Chowk interchange stations get very crowded from 5:00 PM – 8:00 PM on weekdays.", icon: "commute" }
      ]
    },
    kashmir: {
      summary: "Raahi AI identified Kashmir with 96% affinity for snow-capped alpine peaks, serene Dal Lake Shikara stays, and high-altitude Mughal terraced gardens.",
      top_contributing_features: [
        { name: "Alpine Lakes & Snow Peaks", weight: "+44% match", score: 5.0, icon: "landscape" },
        { name: "Dal Lake Shikara & Houseboats", weight: "+26% match", score: 5.0, icon: "houseboat" },
        { name: "Mughal Terraced Gardens", weight: "+18% match", score: 4.8, icon: "yard" },
        { name: "Wazwan Feast & Saffron Arts", weight: "+12% match", score: 4.7, icon: "local_florist" }
      ],
      cautions: [
        { type: "weather", title: "Sub-Zero Winter Nights", message: "December–February requires specialized heavy thermal layers and insulated stay arrangements.", icon: "ac_unit" },
        { type: "crowd", title: "Gondola Advance Booking", message: "Gulmarg Gondola Phase 2 slots sell out weeks in advance during peak ski and spring blossom seasons.", icon: "confirmation_number" }
      ]
    }
  },

  // Similar vibes lookup table
  similarityMatrix: {
    lucknow: [
      { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', similarity: 94, tags: ['Royal Architecture', 'Culinary Feasts', 'Historic Bazaars'], image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80' },
      { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', similarity: 91, tags: ['Sacred Culture', 'Silk Weaving', 'Ancient Heritage'], image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
      { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', similarity: 89, tags: ['Mughal Marvels', 'Marble Inlay', 'River Yamuna'], image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80' },
      { id: 'delhi', name: 'Delhi', state: 'National Capital Territory', similarity: 88, tags: ['Old Bazaars', 'Mughlai Cuisine', 'Historic Forts'], image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
      { id: 'kashmir', name: 'Kashmir Valley', state: 'Jammu & Kashmir', similarity: 82, tags: ['Mughal Gardens', 'Handicrafts', 'Serene Pacing'], image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80' }
    ],
    varanasi: [
      { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', similarity: 91, tags: ['Awadhi Heritage', 'Cultural Courtesy', 'Historic Alleys'], image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=600&q=80' },
      { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', similarity: 88, tags: ['Heritage Temples', 'Handlooms', 'Royal Grandeur'], image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80' },
      { id: 'kerala', name: 'Kerala Backwaters', state: 'Kerala', similarity: 86, tags: ['Sacred Rituals', 'Serene Waters', 'Ayurveda'], image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' },
      { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', similarity: 85, tags: ['Holy Rivers', 'Ancient Monuments', 'Artisans'], image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80' },
      { id: 'delhi', name: 'Delhi', state: 'National Capital Territory', similarity: 84, tags: ['Spiritual Shrines', 'Street Food', 'Ancient Ruins'], image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' }
    ],
    jaipur: [
      { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', similarity: 94, tags: ['Royal Palaces', 'Gastronomy', 'Handmade Crafts'], image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=600&q=80' },
      { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', similarity: 92, tags: ['Golden Triangle', 'Mughal Architecture', 'Royal Forts'], image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80' },
      { id: 'delhi', name: 'Delhi', state: 'National Capital Territory', similarity: 90, tags: ['Fortresses', 'Bazaars', 'Heritage Food'], image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
      { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', similarity: 88, tags: ['Cultural Richness', 'Textiles', 'Sacred Shrines'], image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
      { id: 'goa', name: 'Goa', state: 'Goa', similarity: 82, tags: ['Fort Aguada', 'Portuguese Heritage', 'Music'], image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' }
    ],
    kerala: [
      { id: 'goa', name: 'Goa', state: 'Goa', similarity: 93, tags: ['Coastal Breezes', 'Tropical Palms', 'Seafood Gastronomy'], image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
      { id: 'kashmir', name: 'Kashmir Valley', state: 'Jammu & Kashmir', similarity: 90, tags: ['Serene Waterways', 'Lush Landscapes', 'Houseboat Stays'], image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80' },
      { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', similarity: 86, tags: ['Water Spirituality', 'Slow Travel', 'Ayurveda'], image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
      { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', similarity: 78, tags: ['Rich Traditions', 'Handicrafts', 'Warm Hospitality'], image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80' },
      { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', similarity: 76, tags: ['Cultural Courtesy', 'Artisanal Heritage', 'Food'], image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=600&q=80' }
    ],
    goa: [
      { id: 'kerala', name: 'Kerala', state: 'Kerala', similarity: 93, tags: ['Coastal Tropics', 'Tranquil Waters', 'Ayurvedic Spas'], image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' },
      { id: 'kashmir', name: 'Kashmir Valley', state: 'Jammu & Kashmir', similarity: 84, tags: ['Scenic Escapes', 'Relaxed Pacing', 'Photogenic Vistas'], image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80' },
      { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', similarity: 82, tags: ['Portuguese/Rajput Forts', 'Bazaars', 'Nightlife'], image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80' },
      { id: 'delhi', name: 'Delhi', state: 'National Capital Territory', similarity: 80, tags: ['Eclectic Dining', 'Historic Quarters', 'Evening Life'], image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
      { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', similarity: 77, tags: ['Culinary Exploration', 'Architecture', 'Culture'], image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=600&q=80' }
    ]

  },

 async init() {
  this.bindEvents();

  try {
    const response = await RaahiAPI.getCities(1, 100);

    if (response && Array.isArray(response.data)) {
      RAAHI_DATA.destinations = response.data.map(city => {

        const imageKey = String(city.name || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

  const backendImages = Array.isArray(city.images)
    ? city.images.filter(Boolean)
    : [];

  const fallbackImage = this.cityImageFallbacks[imageKey] || '';

  return {
    id: city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    cityId: city.cityId,
    name: city.name,
    state: city.state,
    country: city.country || 'India',
    description: city.description || '',
    tagline: `${city.tourismPriority || 'Popular'} Tourism Destination`,

    // Use backend image first.
    // If backend has no image, use frontend fallback.
    image: backendImages[0] || fallbackImage,

    // Keep backend images when available.
    // Otherwise provide the fallback image.
    images: backendImages.length > 0
      ? backendImages
      : (fallbackImage ? [fallbackImage] : []),

    latitude: city.latitude,
    longitude: city.longitude,
    bestTimeToVisit: city.bestTimeToVisit || '',
    famousFor: city.famousFor || [],
    tourismPriority: city.tourismPriority || '',
    officialWebsite: city.officialWebsite || null,
    available: city.available !== false
  };
});

      console.log(
        `✅ [Raahi Cities]: Loaded ${RAAHI_DATA.destinations.length} cities from backend`
      );
    }
  } catch (error) {
    console.warn(
      '⚠️ [Raahi Cities]: Backend unavailable, using local city data.',
      error
    );
  }

  this.renderExploreList();
},



  bindEvents() {
    // Listen for ESC key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDetailModal();
      }
    });
  },

  // Open Destination Details with Explainable AI Card & Similar Vibes Carousel
  async openDetailModal(destIdentifier, customXai = null) {
    const normId = destIdentifier.toLowerCase().replace(/[^a-z]/g, '');
    let dest = (RAAHI_DATA.destinations || []).find(d =>
      d.id.toLowerCase() === normId ||
      d.name.toLowerCase().includes(normId) ||
      normId.includes(d.id.toLowerCase())
    );

    if (!dest) {
      dest = {
        id: normId || 'lucknow',
        name: destIdentifier,
        state: 'India',
        tagline: 'Rich Cultural & Historic Destination',
        description: 'Explore verified monuments, authentic culinary lanes, and regional heritage.',
        image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
        attractionsCount: 20,
        hotelsCount: 35,
        restaurantsCount: 50
      };
    }

    const modal = document.getElementById('destination-detail-modal');
    const content = document.getElementById('destination-modal-content');
    if (!modal || !content) return;

    // Resolve or generate Explainable AI (xAI) Payload
    const key = normId.includes('varanasi') ? 'varanasi' :
      normId.includes('jaipur') ? 'jaipur' :
        normId.includes('kerala') ? 'kerala' :
          normId.includes('goa') ? 'goa' :
            normId.includes('agra') ? 'agra' :
              normId.includes('delhi') ? 'delhi' :
                normId.includes('kashmir') ? 'kashmir' : 'lucknow';

    const xai = customXai || this.xaiKnowledgeBase[key] || this.xaiKnowledgeBase.lucknow;

    // Render Modal Shell
    content.innerHTML = `
      <div class="relative bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl">
        
        <!-- Hero Header -->
        <div class="relative h-72 sm:h-84 w-full overflow-hidden bg-stone-900">
          <img src="${dest.image}" alt="${dest.name}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>

          <button onclick="RaahiDestinations.closeDetailModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20 shadow-md">
            <span class="material-symbols-outlined text-base">close</span>
          </button>

          <div class="absolute bottom-6 left-6 right-6 text-white z-10 space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-600 text-white shadow-sm">
                ${dest.state}
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white">
                🏛️ ${dest.attractionsCount || 20}+ Verified Attractions
              </span>
            </div>
            <h2 class="font-heading text-2xl sm:text-4xl font-extrabold text-white">
              ${dest.name}
            </h2>
            <p class="text-xs sm:text-sm text-amber-300 font-medium">
              ${dest.tagline}
            </p>
          </div>
        </div>

        <!-- Body Content -->
        <div class="p-6 sm:p-8 space-y-8">
          
          <!-- Action Buttons Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-200 dark:border-stone-800">
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <button onclick="RaahiDestinations.closeDetailModal(); RaahiCityHub.openCity('${dest.id}');" class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shadow-amber-600/20">
                <span class="material-symbols-outlined text-sm">explore</span>
                <span>Explore City Hub</span>
              </button>
              <button onclick="RaahiDestinations.planWithAI('${dest.name}')" class="px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-amber-400 dark:text-amber-600">auto_awesome</span>
                <span>Plan with AI</span>
              </button>
              <button onclick="RaahiDestinations.exploreCityPlaces('${dest.name}')" class="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-amber-600">travel_explore</span>
                <span>Monuments</span>
              </button>
              <button onclick="RaahiBudgetForecaster.openModal('${dest.name}')" class="px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-bold transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-amber-600">calculate</span>
                <span>Budget</span>
              </button>
            </div>
            <div class="flex items-center gap-3">
              ${typeof RaahiFeedback !== 'undefined' ? RaahiFeedback.renderCardFeedbackToolbar(dest.id) : ''}
              <span class="text-xs font-bold text-stone-400 hidden sm:inline">
                Verified by Raahi ASI Intelligence
              </span>
            </div>
          </div>

          <!-- =================================================================
               COMPONENT 1: "Why This Destination?" (Explainable AI / xAI Card)
               ================================================================= -->
          <div class="xai-card p-5 sm:p-7 rounded-3xl space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-base">psychology</span>
                </div>
                <div>
                  <h3 class="font-heading text-base sm:text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                    Why This Destination?
                    <span class="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full uppercase">Explainable AI</span>
                  </h3>
                  <p class="text-[11px] text-stone-500">Multidimensional algorithmic match breakdown</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-amber-500 text-xl hidden sm:block">verified</span>
            </div>

            <!-- AI Summary Narrative -->
            <div class="p-4 rounded-2xl bg-white/80 dark:bg-stone-850/90 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed italic shadow-2xs">
              "${xai.summary}"
            </div>

            <!-- Top Contributing Features (Green Pills) -->
            <div class="space-y-2">
              <span class="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                Top Contributing Affinity Features
              </span>
              <div class="flex flex-wrap items-center gap-2">
                ${xai.top_contributing_features.map(f => `
                  <span class="xai-feature-pill">
                    <span class="material-symbols-outlined text-xs text-emerald-600 dark:text-emerald-400">${f.icon || 'trending_up'}</span>
                    <span>${f.name}</span>
                    <span class="font-mono text-[10px] bg-emerald-200/60 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded-full">${f.weight}</span>
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Off-Season Weather & Crowd Cautions (Amber Warnings) -->
            <div class="space-y-2.5 pt-1">
              <span class="text-[11px] font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                Seasonal Weather &amp; Crowd Cautions
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                ${xai.cautions.map(c => `
                  <div class="xai-caution-box">
                    <span class="material-symbols-outlined text-amber-600 text-base shrink-0 mt-0.5">${c.icon || 'warning'}</span>
                    <div>
                      <strong class="font-bold text-stone-900 dark:text-white block text-[11px]">${c.title}</strong>
                      <span class="text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed">${c.message}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- =================================================================
               COMPONENT 2: "Crowd & Climate Forecaster"
               ================================================================= -->
          <div id="destination-crowd-climate-container" class="space-y-4">
            <!-- Rendered dynamically by RaahiCrowdClimate.renderForecaster() -->
          </div>

          <!-- =================================================================
               COMPONENT 3: "Similar Vibes" Alternative Carousel
               ================================================================= -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-heading text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-600 text-lg">auto_awesome_motion</span>
                  Similar Vibes
                </h3>
                <p class="text-xs text-stone-500">Alternative destinations sharing cultural, scenic, and culinary DNA</p>
              </div>

              <!-- Carousel Navigation Buttons -->
              <div class="flex items-center gap-1.5">
                <button onclick="RaahiDestinations.scrollSimilarCarousel(-1)" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors shadow-2xs" title="Scroll Left">
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button onclick="RaahiDestinations.scrollSimilarCarousel(1)" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors shadow-2xs" title="Scroll Right">
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Carousel Container -->
            <div id="similar-vibes-carousel-track" class="similar-carousel-track">
              <div class="py-6 text-center text-xs text-stone-400 w-full flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm animate-spin text-amber-600">sync</span>
                <span>Fetching similar destinations from /api/v1/recommend/similar...</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Render Crowd & Climate Forecaster
    if (typeof RaahiCrowdClimate !== 'undefined') {
      RaahiCrowdClimate.renderForecaster(dest.name, 'destination-crowd-climate-container', 'October');
    }

    // Fetch and render the Similar Vibes from POST http://localhost:8000/api/v1/recommend/similar
    this.fetchSimilarVibes(normId, key);
  },

  // Component 2 Fetcher: POST http://localhost:8000/api/v1/recommend/similar
  async fetchSimilarVibes(destinationId, fallbackKey) {
    const track = document.getElementById('similar-vibes-carousel-track');
    if (!track) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2600);

      const response = await fetch('http://localhost:8000/api/v1/recommend/similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destination_id: destinationId,
          top_n: 5
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.similar || data.destinations || []);
        if (items.length > 0) {
          this.renderSimilarVibes(items);
          return;
        }
      }
      throw new Error("Using local similarity matrix.");
    } catch (e) {
      // Local fallback similarity matrix
      setTimeout(() => {
        const fallbackList = this.similarityMatrix[fallbackKey] || this.similarityMatrix.lucknow;
        this.renderSimilarVibes(fallbackList);
      }, 400);
    }
  },

  renderSimilarVibes(items) {
    const track = document.getElementById('similar-vibes-carousel-track');
    if (!track) return;

    track.innerHTML = items.map(item => {
      const simScore = item.similarity || item.similarity_score || item.score || 92;
      const tags = item.tags || item.vibe_tags || ['Heritage', 'Culture', 'Architecture'];

      return `
        <div onclick="RaahiDestinations.openDetailModal('${item.id}')" class="similar-card bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group card-hover">
          <div class="relative h-32 w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div class="absolute top-2 left-2">
              <span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-extrabold shadow-sm flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[10px]">auto_awesome</span>
                ${simScore}% Vibe
              </span>
            </div>

            <div class="absolute bottom-2 left-2.5 right-2 text-white">
              <h4 class="font-heading text-xs sm:text-sm font-bold text-white truncate">${item.name}</h4>
              <span class="text-[10px] text-stone-300 font-medium">${item.state}</span>
            </div>
          </div>

          <div class="p-3 flex-1 flex flex-col justify-between space-y-2.5">
            <div class="flex flex-wrap gap-1">
              ${tags.slice(0, 2).map(t => `
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium truncate">
                  ${t}
                </span>
              `).join('')}
            </div>

            <button class="w-full py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold group-hover:bg-amber-600 dark:group-hover:bg-amber-400 group-hover:text-white transition-colors flex items-center justify-center gap-1">
              <span>View Details</span>
              <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  scrollSimilarCarousel(direction) {
    const track = document.getElementById('similar-vibes-carousel-track');
    if (!track) return;
    const scrollAmount = direction * 260;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  },

  closeDetailModal() {
    const modal = document.getElementById('destination-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  planWithAI(destinationName) {
    this.closeDetailModal();
    if (typeof RaahiPlanner !== 'undefined') {
      RaahiPlanner.selectQuickDest(destinationName);
    }
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate('planner');
      RaahiApp.showToast(`Starting AI Trip Planner for ${destinationName}!`, 'success');
    }
  },

  exploreCityPlaces(destinationName) {
    this.closeDetailModal();
    if (typeof RaahiPlaces !== 'undefined') {
      RaahiPlaces.stateFilter = destinationName;
      RaahiPlaces.searchQuery = '';
      RaahiPlaces.renderPlaces();
    }
    if (typeof RaahiApp !== 'undefined') {
      RaahiApp.navigate('places');
    }
  },

  createDestinationCard(d) {
  const sightsCount = d.attractionsCount || 20;
  const staysCount = d.hotelsCount || 35;
  const diningCount = d.restaurantsCount || 40;

  const imageKey = String(d.name || d.id || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  const image = d.image || this.cityImageFallbacks[imageKey] || '';

  return `
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
        <!-- Top Cover Image -->
       <div class="relative h-56 sm:h-60 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer" onclick="RaahiCityHub.openCity('${d.cityId || d.id}')">
          <img
  src="${image}"
  alt="${d.name}"
  loading="lazy"
  onerror="this.onerror=null; this.src='${this.cityImageFallbacks[imageKey] || ''}';"
  class="w-full h-full object-cover img-zoom transition-transform duration-500 group-hover:scale-105"
>
          <div class="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent"></div>

          <!-- State Tag & Rating Badge -->
          <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
              ${d.state}
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-stone-950 shadow-xs flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">star</span>
              <span>4.9</span>
            </span>
          </div>

          <!-- Bottom Title & Tagline on Image -->
          <div class="absolute bottom-3.5 left-4 right-4 text-white z-10">
            <h3 class="font-heading text-2xl font-extrabold text-white group-hover:text-amber-300 transition-colors">${d.name}</h3>
            <p class="text-xs text-amber-200/90 font-medium line-clamp-1 mt-0.5">${d.tagline}</p>
          </div>
        </div>

        <!-- Clean Card Content -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
            ${d.description}
          </p>

          <div>
            <!-- Clean Key Highlights / Stats Bar -->
            <div class="flex items-center justify-between py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-4">
              <span class="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span class="material-symbols-outlined text-sm">account_balance</span>
                ${sightsCount}+ Sights
              </span>
              <span class="text-stone-300 dark:text-stone-700">•</span>
              <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span class="material-symbols-outlined text-sm">hotel</span>
                ${staysCount}+ Stays
              </span>
              <span class="text-stone-300 dark:text-stone-700">•</span>
              <span class="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <span class="material-symbols-outlined text-sm">restaurant</span>
                ${diningCount}+ Dining
              </span>
            </div>

            <!-- Single Clean Action Row -->
            <div class="flex items-center gap-2">
            <button onclick="RaahiCityHub.openCity('${d.cityId || d.id}')" class="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20">
                <span>Explore City Hub</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button onclick="RaahiDestinations.openDetailModal('${d.id}')" title="Why ${d.name}? (AI Match Insights)" class="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 border border-stone-200 dark:border-stone-700/80 transition-colors flex items-center justify-center">
                <span class="material-symbols-outlined text-base">psychology</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update filter buttons styling
    document.querySelectorAll('.dest-filter-chip').forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if (btnFilter === filter) {
        btn.className = 'dest-filter-chip px-4 py-2 rounded-full text-xs font-bold bg-amber-600 text-white shadow-sm transition-all';
      } else {
        btn.className = 'dest-filter-chip px-4 py-2 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all';
      }
    });

    this.renderExploreList();
  },

  setSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderExploreList();
  },

  renderExploreList() {
    const container = document.getElementById('explore-destinations-container');
    if (!container || !RAAHI_DATA.destinations) return;

    let list = [...RAAHI_DATA.destinations];

    // Apply Region Filter
    if (this.currentFilter === 'up') {
      list = list.filter(d => d.state === 'Uttar Pradesh');
    } else if (this.currentFilter === 'rajasthan') {
      list = list.filter(d => d.state === 'Rajasthan');
    } else if (this.currentFilter === 'south') {
      list = list.filter(d => d.state === 'Kerala');
    } else if (this.currentFilter === 'west') {
      list = list.filter(d => d.state === 'Goa');
    } else if (this.currentFilter === 'north') {
      list = list.filter(d => d.state.includes('Delhi') || d.state.includes('Kashmir'));
    }

    // Apply Search Query
    if (this.searchQuery) {
      list = list.filter(d =>
        d.name.toLowerCase().includes(this.searchQuery) ||
        d.state.toLowerCase().includes(this.searchQuery) ||
        d.tagline.toLowerCase().includes(this.searchQuery)
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <h3 class="text-lg font-bold text-stone-800 dark:text-stone-200">No destinations found</h3>
          <p class="text-xs text-stone-500 mt-1 mb-4">Try searching for other Indian cities like Lucknow, Jaipur, Varanasi, or Goa.</p>
          <button onclick="RaahiDestinations.setFilter('all'); const input = document.getElementById('explore-search-input'); if(input) input.value='';" class="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">
            Clear Filters
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(d => this.createDestinationCard(d)).join('');
  }
};

// Global Exposure
if (typeof window !== 'undefined') {
  window.RaahiDestinations = RaahiDestinations;
}

