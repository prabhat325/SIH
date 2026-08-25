/**
 * RAAHI — Comprehensive Data Layer
 * "Safar Aapka, Planning Hamari"
 * Complete verified dataset for Indian destinations, places, hotels, restaurants,
 * events, local guides, emergency services, sample reviews, and community change requests.
 */

const RAAHI_DATA = {
  // 1. POPULAR DESTINATIONS (8 Indian Cities & States)
  destinations: [
    {
      id: "lucknow",
      name: "Lucknow",
      state: "Uttar Pradesh",
      tagline: "The City of Nawabs, Tehzeeb & Awadhi Flavors",
      description: "Famed for its architectural marvels like the Bara Imambara, delicate Chikankari embroidery, and legendary Awadhi culinary heritage.",
      image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 24,
      hotelsCount: 42,
      restaurantsCount: 68,
      lat: 26.8467,
      lng: 80.9462
    },
    {
      id: "agra",
      name: "Agra",
      state: "Uttar Pradesh",
      tagline: "Home of the Monument of Eternal Love",
      description: "World-renowned city on the banks of the Yamuna River housing the Taj Mahal, Agra Fort, and the abandoned Mughal capital of Fatehpur Sikri.",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 18,
      hotelsCount: 35,
      restaurantsCount: 52,
      lat: 27.1767,
      lng: 78.0081
    },
    {
      id: "varanasi",
      name: "Varanasi",
      state: "Uttar Pradesh",
      tagline: "The Spiritual Heart & Eternal Ghats of India",
      description: "One of the world's oldest continually inhabited cities, sacred for Ganga Aarti at Dashashwamedh Ghat, Kashi Vishwanath, and ancient silk weaving.",
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 32,
      hotelsCount: 48,
      restaurantsCount: 75,
      lat: 25.3176,
      lng: 82.9739
    },
    {
      id: "jaipur",
      name: "Jaipur",
      state: "Rajasthan",
      tagline: "The Royal Pink City of Forts & Havelis",
      description: "Capital of Rajasthan famous for Amber Fort, Hawa Mahal, Jantar Mantar, and timeless royal Rajputana grandeur and block printing.",
      image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 28,
      hotelsCount: 56,
      restaurantsCount: 84,
      lat: 26.9124,
      lng: 75.7873
    },
    {
      id: "delhi",
      name: "Delhi",
      state: "National Capital Territory",
      tagline: "Where Centuries of History Meet Modern Energy",
      description: "India's capital combining the labyrinthine lanes of Old Delhi with Mughal monuments like the Red Fort, Qutub Minar, and vibrant food streets.",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 45,
      hotelsCount: 90,
      restaurantsCount: 150,
      lat: 28.6139,
      lng: 77.2090
    },
    {
      id: "goa",
      name: "Goa",
      state: "Goa",
      tagline: "Sun-Kissed Beaches & Portuguese Heritage",
      description: "Tropical coastal paradise known for UNESCO World Heritage churches in Old Goa, spice plantations, tranquil backwaters, and pristine beaches.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 22,
      hotelsCount: 70,
      restaurantsCount: 95,
      lat: 15.2993,
      lng: 74.1240
    },
    {
      id: "kerala",
      name: "Kerala",
      state: "Kerala",
      tagline: "God's Own Country & Serene Backwaters",
      description: "Lush tropical haven renowned for tranquil Alleppey houseboats, Munnar tea estates, Kathakali classical dance, and ancient Ayurvedic wellness.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 30,
      hotelsCount: 65,
      restaurantsCount: 80,
      lat: 9.9312,
      lng: 76.2673
    },
    {
      id: "kashmir",
      name: "Kashmir",
      state: "Jammu & Kashmir",
      tagline: "Paradise on Earth & Alpine Meadows",
      description: "Breathtaking valley featuring Dal Lake Shikara rides, snow-capped Himalayan peaks of Gulmarg, saffron fields, and Mughal gardens.",
      image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80",
      attractionsCount: 20,
      hotelsCount: 38,
      restaurantsCount: 45,
      lat: 34.0837,
      lng: 74.7973
    }
  ],

  // 2. TOURIST PLACES (Monuments, Forts, Temples, Heritage Sites)
  places: [
    {
      id: "bara-imambara",
      name: "Bara Imambara & Bhool Bhulaiya",
      destinationId: "lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      category: "Heritage",
      rating: 4.8,
      reviewsCount: 342,
      image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Iconic 18th-century architectural masterpiece built by Nawab Asaf-ud-Daula with its unsupported arched central hall and mystical labyrinth.",
      history: "Commissioned in 1784 during a devastating famine as a major food-for-work relief project to provide employment to thousands of citizens.",
      openingHours: "06:00 AM – 05:00 PM (Closed on Mondays)",
      entryFee: "₹50 (Indian Nationals), ₹500 (Foreign Nationals), Free for children under 15",
      bestTimeToVisit: "October to March (Morning hours)",
      facilities: ["Drinking Water", "Shoe Storage", "Licensed Guides", "Restrooms", "Photography Allowed"],
      accessibility: {
        wheelchair: true,
        audioGuide: true,
        seniorFriendly: true
      },
      nearbyAttractions: ["Chhota Imambara", "Rumi Darwaza", "Clock Tower"],
      lat: 26.8692,
      lng: 80.9129,
      aiPick: true,
      aiReason: "Acoustic wonder with zero iron/beam ceiling support and the fascinating 1000-passageway Bhool Bhulaiya."
    },
    {
      id: "taj-mahal",
      name: "Taj Mahal",
      destinationId: "agra",
      city: "Agra",
      state: "Uttar Pradesh",
      category: "Heritage",
      rating: 4.9,
      reviewsCount: 1250,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
      ],
      description: "UNESCO World Heritage ivory-white marble mausoleum built by Mughal Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal.",
      history: "Constructed between 1631 and 1648 employing over 20,000 artisans and masons from across India, Persia, and Central Asia.",
      openingHours: "Sunrise to Sunset (Closed on Fridays for prayers)",
      entryFee: "₹50 (Indian Nationals) + ₹200 for main mausoleum, ₹1100 (Foreign Nationals)",
      bestTimeToVisit: "October to March (Sunrise recommended to avoid crowds)",
      facilities: ["Battery-operated Eco Carts", "Shoe Covers", "Audio Guides", "Luggage Cloakroom", "First Aid"],
      accessibility: {
        wheelchair: true,
        audioGuide: true,
        seniorFriendly: true
      },
      nearbyAttractions: ["Agra Fort", "Mehtab Bagh", "Itmad-ud-Daulah"],
      lat: 27.1751,
      lng: 78.0421,
      aiPick: true,
      aiReason: "World Wonder with symmetrical marble inlay geometry and ethereal morning light reflections over Yamuna."
    },
    {
      id: "dashashwamedh-ghat",
      name: "Dashashwamedh Ghat",
      destinationId: "varanasi",
      city: "Varanasi",
      state: "Uttar Pradesh",
      category: "Ghats",
      rating: 4.9,
      reviewsCount: 890,
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80"
      ],
      description: "The most prominent and vibrant ghat along the holy Ganges, world-famous for the grand evening Ganga Maha Aarti ceremony.",
      history: "According to Hindu mythology, Lord Brahma created this sacred ghat to welcome Lord Shiva and performed the Dasa-Ashwamedha Yajna here.",
      openingHours: "Open 24 Hours (Ganga Aarti begins around 06:30 PM daily)",
      entryFee: "Free Public Access (Boat rides available separately from ₹200 - ₹500)",
      bestTimeToVisit: "Sunrise for morning boat ride & 06:00 PM for Evening Aarti",
      facilities: ["Boat Services", "Sacred Bathing Ghats", "Temple Priests", "Flower/Diya Stalls"],
      accessibility: {
        wheelchair: false,
        audioGuide: true,
        seniorFriendly: true
      },
      nearbyAttractions: ["Kashi Vishwanath Temple", "Manikarnika Ghat", "Assi Ghat"],
      lat: 25.3076,
      lng: 83.0107,
      aiPick: true,
      aiReason: "Mesmerizing multi-tiered brass lamp ritual, sacred conch chants, and unforgettable river atmosphere."
    },
    {
      id: "amber-fort",
      name: "Amber Fort & Palace",
      destinationId: "jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      category: "Forts",
      rating: 4.8,
      reviewsCount: 620,
      image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Majestic hilltop fortress featuring Sheesh Mahal (Mirror Palace), Diwan-e-Khas, and breathtaking views over Maota Lake.",
      history: "Constructed in 1592 by Raja Man Singh I using red sandstone and marble, blending Rajput and Mughal architectural aesthetics.",
      openingHours: "08:00 AM – 05:30 PM & 06:30 PM – 09:15 PM (Night Tourism)",
      entryFee: "₹100 (Indian Nationals), ₹500 (Foreign Nationals), ₹50 for audio guide",
      bestTimeToVisit: "November to February (Early morning or illuminated evening view)",
      facilities: ["Jeep Shuttles", "Audio Guides", "Multi-lingual Guides", "Museum", "Light & Sound Show"],
      accessibility: {
        wheelchair: true,
        audioGuide: true,
        seniorFriendly: true
      },
      nearbyAttractions: ["Jaigarh Fort", "Nahargarh Fort", "Jal Mahal"],
      lat: 26.9855,
      lng: 75.8513,
      aiPick: true,
      aiReason: "Intricate Sheesh Mahal mirror geometry where a single candle illuminates the entire royal hall."
    },
    {
      id: "qutub-minar",
      name: "Qutub Minar & Complex",
      destinationId: "delhi",
      city: "Delhi",
      state: "National Capital Territory",
      category: "Heritage",
      rating: 4.7,
      reviewsCount: 540,
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
      gallery: ["https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80"],
      description: "A 72.5-meter tapering victory minaret of fluted red sandstone and marble, alongside the rust-resistant 4th-century Iron Pillar.",
      history: "Commenced in 1192 by Qutb-ud-din Aibak and completed by his successor Iltutmish as a symbol of the Delhi Sultanate.",
      openingHours: "07:00 AM – 07:00 PM (Daily)",
      entryFee: "₹40 (Indian Nationals), ₹600 (Foreign Nationals)",
      bestTimeToVisit: "October to March",
      facilities: ["Lush Gardens", "Wheelchair Access", "Information Center", "Restrooms"],
      accessibility: {
        wheelchair: true,
        audioGuide: true,
        seniorFriendly: true
      },
      nearbyAttractions: ["Mehrauli Archaeological Park", "Lotus Temple", "Hauz Khas Village"],
      lat: 28.5244,
      lng: 77.1855,
      aiPick: false
    },
    {
      id: "alleppey-backwaters",
      name: "Alleppey Backwaters & Canals",
      destinationId: "kerala",
      city: "Alleppey (Alappuzha)",
      state: "Kerala",
      category: "Nature",
      rating: 4.9,
      reviewsCount: 710,
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      gallery: ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80"],
      description: "Interconnected network of palm-fringed canals, tranquil lagoons, and paddy fields navigated on traditional thatch-roofed boats.",
      history: "Ancient trade waterways originally used for transporting grain and spices, transformed into sustainable eco-tourism marvels.",
      openingHours: "Day cruises: 09:00 AM – 05:00 PM",
      entryFee: "Public Ferry: ₹15 - ₹50; Private Shikara/Kettuvallam: Discovery rates vary",
      bestTimeToVisit: "September to March",
      facilities: ["Local Village Stops", "Traditional Keralan Onam Meals", "Life Jackets", "Eco-Guides"],
      accessibility: {
        wheelchair: false,
        audioGuide: false,
        seniorFriendly: true
      },
      nearbyAttractions: ["Marari Beach", "Alappuzha Lighthouse", "Kumarakom Bird Sanctuary"],
      lat: 9.4981,
      lng: 76.3388,
      aiPick: true,
      aiReason: "Serene aquatic sanctuary with fresh coconut groves, floating village bazaars, and migratory kingfishers."
    }
  ],

  // 3. HOTELS & HERITAGE STAYS (Strictly Discovery & Stay Info - NO BOOKING)
  hotels: [
    {
      id: "clarks-avadh-lucknow",
      name: "Hotel Clarks Avadh",
      destinationId: "lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      rating: 4.6,
      reviewsCount: 280,
      priceTier: "₹₹₹ (Heritage Premium)",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      amenities: ["River Gomti View", "Awadhi Dining", "Swimming Pool", "Heritage Architecture", "Wi-Fi", "Valet Parking"],
      location: "8 MG Marg, Hazratganj, Lucknow, UP",
      contact: "+91 522 2616500 / info@clarksavadh.com",
      description: "Pioneering luxury hotel on the banks of Gomti River offering panoramic views of Lucknow's heritage skyline with authentic Awadhi hospitality.",
      nearbyPlaces: ["Hazratganj Market (1 km)", "Bara Imambara (3.5 km)", "Residency (2 km)"]
    },
    {
      id: "itc-mughal-agra",
      name: "ITC Mughal Resort & Spa",
      destinationId: "agra",
      city: "Agra",
      state: "Uttar Pradesh",
      rating: 4.8,
      reviewsCount: 450,
      priceTier: "₹₹₹₹ (Luxury Resort)",
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
      amenities: ["35 Acres of Mughal Gardens", "Kaya Kalp Spa", "Taj Mahal Observatory", "Pool", "Multi-cuisine Dining"],
      location: "Fatehabad Road, Tajganj, Agra, UP",
      contact: "+91 562 4021700 / reservations@itchotels.in",
      description: "Sprawling luxury retreat celebrating Mughal architecture and landscaped fountains, winner of the Aga Khan Award for Architecture.",
      nearbyPlaces: ["Taj Mahal (2.5 km)", "Agra Fort (4 km)", "Sadar Bazaar (3 km)"]
    },
    {
      id: "brijrama-palace-varanasi",
      name: "BrijRama Palace Heritage",
      destinationId: "varanasi",
      city: "Varanasi",
      state: "Uttar Pradesh",
      rating: 4.9,
      reviewsCount: 310,
      priceTier: "₹₹₹₹ (Royal Haveli)",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
      amenities: ["Darbhanga Ghat Riverfront", "Private Boat Transfer", "Classical Sitar Recitals", "Pure Vegetarian Fine Dining", "Elevator"],
      location: "Darbhanga Ghat, Dashashwamedh, Varanasi, UP",
      contact: "+91 542 2452200 / stay@brijhotels.com",
      description: "210-year-old historic palace on Darbhanga Ghat, one of the oldest heritage structures standing over the holy Ganges with one of South Asia's first cable lifts.",
      nearbyPlaces: ["Dashashwamedh Ghat (300 m)", "Kashi Vishwanath (600 m)", "Manikarnika Ghat (800 m)"]
    },
    {
      id: "samode-haveli-jaipur",
      name: "Samode Haveli Royal Heritage",
      destinationId: "jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      rating: 4.7,
      reviewsCount: 290,
      priceTier: "₹₹₹ (Heritage Haveli)",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      amenities: ["Moorish Swimming Pool", "Hand-painted Fresco Suites", "Spa & Wellness", "Courtyard Dining", "Wi-Fi"],
      location: "Gangapole, Old City, Jaipur, Rajasthan",
      contact: "+91 141 2632407 / haveli@samode.com",
      description: "175-year-old royal residence nestled inside the old walled city of Jaipur with exquisite hand-painted frescoes and tranquil courtyard gardens.",
      nearbyPlaces: ["City Palace (1.5 km)", "Hawa Mahal (1.2 km)", "Amber Fort (8 km)"]
    }
  ],

  // 4. RESTAURANTS & CULINARY GUIDE (Strictly Food & Cuisine Discovery - NO BOOKING)
  restaurants: [
    {
      id: "tunday-kababi-lucknow",
      name: "Tunday Kababi (Since 1905)",
      destinationId: "lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      cuisine: "Awadhi & Mughlai",
      rating: 4.9,
      reviewsCount: 1400,
      priceRange: "₹₹ (Moderate)",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      specialties: ["Galouti Kebab", "Ulte Tawe Ka Paratha", "Mutton Biryani", "Shahi Tukda"],
      openingHours: "12:00 PM – 11:30 PM (Daily)",
      location: "Phool Wali Gali, Aminabad & Chowk, Lucknow, UP",
      contact: "+91 522 2616238",
      description: "World-legendary culinary institution famed for its melt-in-mouth Galouti kebabs infused with 160 secret herbs and spices invented for the Nawab.",
      dietaryOptions: ["Halal Certified", "Non-Veg Specialty", "Takeaway Available"]
    },
    {
      id: "peshawri-agra",
      name: "Peshawri at ITC Mughal",
      destinationId: "agra",
      city: "Agra",
      state: "Uttar Pradesh",
      cuisine: "North-West Frontier",
      rating: 4.8,
      reviewsCount: 380,
      priceRange: "₹₹₹₹ (Fine Dining)",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      specialties: ["Dal Bukhara (Slow-cooked 18 Hours)", "Sikandari Raan", "Murgh Malai Kebab", "Pudina Paratha"],
      openingHours: "12:30 PM – 02:45 PM & 07:00 PM – 11:30 PM",
      location: "ITC Mughal, Fatehabad Road, Agra, UP",
      contact: "+91 562 4021700",
      description: "Authentic tandoor cuisine crafted over clay ovens with rustic wooden ambiance, famous for the legendary Dal Bukhara simmered overnight.",
      dietaryOptions: ["Vegetarian Friendly", "Gluten-Free Options Available"]
    },
    {
      id: "kashi-chaat-bhandar-varanasi",
      name: "Kashi Chaat Bhandar",
      destinationId: "varanasi",
      city: "Varanasi",
      state: "Uttar Pradesh",
      cuisine: "Banarasi Street Food",
      rating: 4.8,
      reviewsCount: 950,
      priceRange: "₹ (Budget / Street Food)",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      specialties: ["Tamatar Chaat (Spicy Tomato Chaat)", "Palak Patta Chaat", "Dahi Puri", "Gulab Jamun"],
      openingHours: "04:00 PM – 11:00 PM (Daily)",
      location: "D.53/98, Luxa Road, Godowlia, Varanasi, UP",
      contact: "+91 94505 40386",
      description: "The most iconic street food joint in Kashi, pioneer of the famous piping-hot Banarasi Tamatar Chaat served in earthen clay kullads.",
      dietaryOptions: ["100% Pure Vegetarian", "No Onion/Garlic Options on request"]
    },
    {
      id: "chokhi-dhani-jaipur",
      name: "Chokhi Dhani Ethnic Restaurant",
      destinationId: "jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      cuisine: "Royal Rajasthani Thali",
      rating: 4.7,
      reviewsCount: 1100,
      priceRange: "₹₹₹ (Cultural Dining Experience)",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
      specialties: ["Dal Baati Churma", "Gatte Ki Sabzi", "Ker Sangri", "Bajre Ki Roti with Desi Ghee", "Malpua"],
      openingHours: "05:00 PM – 11:00 PM (Daily)",
      location: "12 Miles, Tonk Road, Jaipur, Rajasthan",
      contact: "+91 141 5165000",
      description: "Immersive Rajasthani village dining experience where guests sit on traditional chowkis and relish grand royal thalis accompanied by folk music and puppet shows.",
      dietaryOptions: ["100% Pure Vegetarian", "Traditional Rajasthani Thali"]
    }
  ],

  // 5. CULTURAL EVENTS & FESTIVALS (Cultural Happenings - NO TICKET BOOKING)
  events: [
    {
      id: "varanasi-dev-deepawali",
      name: "Dev Deepawali (Festival of Gods)",
      destinationId: "varanasi",
      city: "Varanasi",
      state: "Uttar Pradesh",
      date: "November 2026 (Kartik Purnima)",
      time: "05:00 PM – 10:00 PM",
      category: "Spiritual Festival",
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
      organizer: "Varanasi Tourism Board & Ganga Seva Nidhi",
      location: "All 84 Ghats of Varanasi (Assi to Rajghat)",
      description: "Spectacular night when millions of clay earthen lamps (diyas) illuminate all 84 ghats of the Ganges, believed to be the day gods descend to bathe.",
      highlights: ["1 Million+ Diyas Lit", "Grand Maha Aarti", "Green Fireworks Show", "Classical Music Recitals"]
    },
    {
      id: "pushkar-camel-fair",
      name: "Pushkar International Camel & Cultural Fair",
      destinationId: "jaipur",
      city: "Pushkar / Ajmer",
      state: "Rajasthan",
      date: "November 18–26, 2026",
      time: "08:00 AM – 09:00 PM Daily",
      category: "Cultural & Heritage Fair",
      image: "https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&w=800&q=80",
      organizer: "Rajasthan Tourism Development Corporation (RTDC)",
      location: "Pushkar Mela Ground, Pushkar, Rajasthan",
      description: "One of the world's largest livestock and camel fairs featuring turban tying contests, desert folk dance, hot air ballooning, and sacred lake dips.",
      highlights: ["Decorated Camel Races", "Rajasthani Folk Dance & Music", "Handicrafts Bazaar", "Hot Air Ballooning"]
    },
    {
      id: "lucknow-mahotsav",
      name: "Lucknow Mahotsav Heritage Festival",
      destinationId: "lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      date: "December 2026",
      time: "11:00 AM – 10:00 PM Daily",
      category: "Arts & Food Festival",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
      organizer: "Uttar Pradesh Department of Tourism",
      location: "Smriti Upvan, Aashiana, Lucknow, UP",
      description: "Annual cultural festival showcasing the living heritage of Awadh: classical Kathak dance, ghazal recitals, Chikankari artisan crafts, and royal cuisine stalls.",
      highlights: ["Ghazal & Sufi Nights", "Live Chikankari Weaving Demonstrations", "Awadhi Kebab Competitions"]
    },
    {
      id: "taj-mahotsav",
      name: "Taj Mahotsav Cultural Carnival",
      destinationId: "agra",
      city: "Agra",
      state: "Uttar Pradesh",
      date: "February 18–27, 2027",
      time: "10:00 AM – 10:00 PM Daily",
      category: "Crafts & Performing Arts",
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
      organizer: "Taj Mahotsav Committee & UP Tourism",
      location: "Shilpgram, Near Taj Mahal Eastern Gate, Agra, UP",
      description: "10-day celebration of Indian arts, crafts, classical dance, and cuisine against the majestic backdrop of the Taj Mahal.",
      highlights: ["400+ National Master Craftsmen", "Folk Traditions of India", "Mughal Gastronomy Trail"]
    }
  ],

  // 6. LOCAL GUIDES DIRECTORY (Certified Guides & Scholars)
  guides: [
    {
      id: "sharma-ramesh",
      name: "Pandit Ramesh Chandra Sharma",
      city: "Varanasi",
      state: "Uttar Pradesh",
      rating: 4.9,
      reviewsCount: 184,
      experience: "22 Years Experience",
      languages: ["Hindi", "English", "Sanskrit", "German"],
      specialization: "Vedic Philosophy, Ghat History, Temple Architecture",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      contact: "+91 94152 78912 / ramesh.kashiguide@gmail.com",
      about: "Certified senior guide by the Ministry of Tourism, Government of India. Born and raised on Dashashwamedh Ghat, specializing in esoteric temple symbolism and early morning acoustic walking tours."
    },
    {
      id: "mirza-asif",
      name: "Nawabzada Asif Ali Mirza",
      city: "Lucknow",
      state: "Uttar Pradesh",
      rating: 4.9,
      reviewsCount: 142,
      experience: "16 Years Experience",
      languages: ["Urdu", "Hindi", "English", "French"],
      specialization: "Awadhi Architecture, Nawabi Dynasty, Old Lucknow Culinary Walks",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      contact: "+91 98390 41250 / asif.lucknowheritage@yahoo.in",
      about: "Direct descendant of court chroniclers of Awadh. Author and heritage researcher who leads exclusive architectural walkthroughs of the Imambaras and hidden Chowk alleys."
    },
    {
      id: "rathore-digvijay",
      name: "Digvijay Singh Rathore",
      city: "Jaipur",
      state: "Rajasthan",
      rating: 4.8,
      reviewsCount: 210,
      experience: "14 Years Experience",
      languages: ["Hindi", "English", "Rajasthani", "Spanish"],
      specialization: "Rajput Fort Military Architecture, Royal Astronomy, Block Printing",
      photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
      contact: "+91 98290 63411 / digvijay.jaipurguide@gmail.com",
      about: "National Tourism Award nominee with deep expertise in the astronomical sundials of Jantar Mantar and subterranean water systems of Amber Fort."
    }
  ],

  // 7. EMERGENCY SERVICES & 24x7 SAFETY HUB
  emergencyServices: [
    {
      id: "police-varanasi-tourist",
      name: "Dashashwamedh Tourist Police Booth",
      city: "Varanasi",
      state: "Uttar Pradesh",
      type: "Police",
      phone: "+91 542 2451233 / 112",
      address: "Dashashwamedh Ghat Entrance, Godowlia, Varanasi",
      hours: "24x7 Active",
      lat: 25.3080,
      lng: 83.0090
    },
    {
      id: "hospital-bhu-trauma",
      name: "Sir Sunderlal Hospital & Trauma Centre (BHU)",
      city: "Varanasi",
      state: "Uttar Pradesh",
      type: "Hospital",
      phone: "+91 542 2307500 / 108",
      address: "Banaras Hindu University Campus, Varanasi, UP",
      hours: "24x7 Emergency Trauma Unit",
      lat: 25.2758,
      lng: 82.9984
    },
    {
      id: "police-lucknow-hazratganj",
      name: "Hazratganj Police Station & Women Helpline",
      city: "Lucknow",
      state: "Uttar Pradesh",
      type: "Police",
      phone: "+91 522 2623333 / 112",
      address: "MG Marg, Hazratganj, Lucknow, UP",
      hours: "24x7 Active",
      lat: 26.8500,
      lng: 80.9400
    },
    {
      id: "hospital-kgmu-lucknow",
      name: "King George's Medical University (KGMU)",
      city: "Lucknow",
      state: "Uttar Pradesh",
      type: "Hospital",
      phone: "+91 522 2257450 / 108",
      address: "Shah Mina Road, Chowk, Lucknow, UP",
      hours: "24x7 Tertiary Emergency Care",
      lat: 26.8680,
      lng: 80.9160
    }
  ],

  // 8. NATIONAL TOLL-FREE HELPLINES
  nationalHelplines: [
    {
      number: "112",
      title: "National Emergency SOS",
      description: "All-in-one emergency response for Police, Fire, and Medical Assistance across India.",
      color: "red"
    },
    {
      number: "1363",
      title: "Incredible India Tourist Helpline",
      description: "24x7 multi-lingual tourist assistance in 12 international languages by Ministry of Tourism.",
      color: "amber"
    },
    {
      number: "108",
      title: "National Free Ambulance Service",
      description: "Immediate emergency ambulance dispatch with GPS-tracked paramedic support.",
      color: "emerald"
    },
    {
      number: "1091",
      title: "Women's Safety Helpline",
      description: "Dedicated 24x7 toll-free safety & emergency response support for women travelers.",
      color: "blue"
    }
  ],

  // 9. COMMUNITY CHANGE REQUESTS (Sample Crowdsourced Submissions)
  communityChanges: [
    {
      id: "cr-101",
      resourceId: "bara-imambara",
      resourceName: "Bara Imambara & Bhool Bhulaiya",
      resourceType: "place",
      changeType: "Update Information",
      field: "Entry Fee",
      currentValue: "₹50 (Indian Nationals)",
      suggestedValue: "₹60 (Indian Nationals including digital ASI ticketing)",
      reason: "ASI recently revised the offline paper ticket entry fee at the ticket window starting Jan 2026.",
      evidence: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80",
      submittedBy: "Aakash Verma (Traveler)",
      date: "2026-08-22",
      status: "Pending" // Pending | Approved | Rejected
    },
    {
      id: "cr-102",
      resourceId: "tunday-kababi-lucknow",
      resourceName: "Tunday Kababi",
      resourceType: "restaurant",
      changeType: "Correct Information",
      field: "Opening Hours",
      currentValue: "11:00 AM – 11:00 PM",
      suggestedValue: "12:00 PM – 11:30 PM",
      reason: "The Chowk branch opens strictly at 12 PM after morning preparation.",
      evidence: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
      submittedBy: "Priya Nair (Local Foodie)",
      date: "2026-08-20",
      status: "Approved"
    },
    {
      id: "cr-103",
      resourceId: "amber-fort",
      resourceName: "Amber Fort & Palace",
      resourceType: "place",
      changeType: "Update Information",
      field: "Night Tourism Hours",
      currentValue: "06:30 PM – 09:15 PM",
      suggestedValue: "07:00 PM – 10:00 PM (Summer Timings)",
      reason: "Summer night light and sound show starts at 7:00 PM.",
      evidence: "",
      submittedBy: "Rajesh Soni (Jaipur Guide)",
      date: "2026-08-18",
      status: "Rejected",
      adminComment: "Official RTDC portal confirms 6:30 PM winter slot currently active."
    }
  ]
};

// Expose globally
if (typeof window !== 'undefined') {
  window.RAAHI_DATA = RAAHI_DATA;
}
