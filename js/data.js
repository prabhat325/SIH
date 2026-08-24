/**
 * RAAHI - Heritage Intelligence Data Store
 * Comprehensive dataset for destinations, curated experiences, itineraries, and stories.
 */

const RAAHI_DATA = {
  // Destinations Dataset
  destinations: [
    {
      id: "himalayas-north",
      name: "The Majestic Himalayas",
      region: "North India",
      regionCategory: "north",
      tag: "Mountains & Serenity",
      featured: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfsPgpT6t_lcXD1Yz0MEAujnl2Y5XzSRkXKV-4aS2tSIFfF5CBc8b6UgP6wbexyPUgstQP091lKJF3m7nK8vxKYa4VjsNNGTghdLzjSedZEnuaUqscJ1Uf0zqeqmJOvSmB7deY38cTJ79FOuhgT4a-bPC73aDTFb1vgrlZ4PZzT22-WQ7EnAwc8E_N8qbWfcvG_uyKTRV_37x0fcNa1auRn96ouGUfa1UccDqTJcrs847ug_-CQXW2",
      description: "Experience the spiritual serenity and rugged beauty of the world's highest peaks. From ancient monasteries in Ladakh to cedar-scented valleys in Himachal.",
      bestTimeToVisit: "March to June & September to November",
      temperature: "14°C - 22°C (Summer) / -5°C (Winter)",
      unesco: "Great Himalayan National Park",
      highlights: [
        "Monastery trails of Spiti and Ladakh",
        "High-altitude tea estates in Kangra",
        "Private heritage homestays with panoramic mountain vistas",
        "Trekking to glacial lakes with local expert sherpas"
      ],
      idealDuration: "6-9 Days",
      budgetTier: "Luxury / Premium"
    },
    {
      id: "kerala-backwaters",
      name: "Kerala Backwaters",
      region: "South India",
      regionCategory: "south",
      tag: "Backwaters & Wellness",
      featured: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNv8d69XKaPG473nwU-TBCMFnHokFsx1X0U9FGALsqfnfITWjh13HyDpy34ifo6gnotC74GajczYca6mFGecYPHp1LKI5Ng5HeilZ1FooBjFLAfiaF8FoxRFVcldTSTMHPbyWkyTVa0oSuEJHqetd9Avl__vL76O964SVIB6yQD-eYT4G9b0hA4i13VK259hEDqKnLyorn4EBxkDKCMq6iPE7PZyKQM3_kC6-F2SWD2M-OwpA4-QGU",
      description: "Glide through emerald canals fringed by swaying coconut palms in traditional solar-assisted wooden houseboats, accompanied by master Ayurvedic practitioners.",
      bestTimeToVisit: "September to March",
      temperature: "24°C - 31°C",
      unesco: "Western Ghats Biodiversity Hotspot",
      highlights: [
        "Private luxury Kettuvallam houseboats with master chefs",
        "Authentic Panchakarma wellness programs at historic estates",
        "Kathakali and Kalaripayattu martial heritage demonstrations",
        "Spice plantation walks in Wayanad and Thekkady"
      ],
      idealDuration: "5-7 Days",
      budgetTier: "Luxury"
    },
    {
      id: "thar-desert",
      name: "Thar Desert & Royal Rajasthan",
      region: "West India",
      regionCategory: "deserts",
      tag: "Heritage & Fortresses",
      featured: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8h5x7V2pd-Kmz-cfjTD46UKBcrBtIlWIqq62d3w1yQX_0nbvTERH4XE2mmGz4SZoRtmUHy-HIhz0FW_zea8kJZkw8wEnQfBP3AdkdjD4_eP33tT7JNNiTZQ5zWD9fUknOaK30zAVpzbhyGO4BWBq4t7eDuXd849wux6ppsoVgzDGQwiyjjXKwqlrKG8Upj653iLoEf1VarycxvudY6SPvtziN1E76-C3JXtS4TTGORUWBzf2c33SY",
      description: "Golden hour light over majestic hill forts, royal palaces converted into ultra-luxury stays, and private star-gazing camps deep in the undulating dunes of Jaisalmer.",
      bestTimeToVisit: "October to March",
      temperature: "18°C - 28°C",
      unesco: "Hill Forts of Rajasthan & Jaipur Walled City",
      highlights: [
        "Private access to royal archives in City Palace Jaipur",
        "Sunset camel caravan and candlelit dune banquet",
        "Mehrangarh Fort private evening museum walkthrough",
        "Textile block printing and blue pottery artisan studios"
      ],
      idealDuration: "7-10 Days",
      budgetTier: "Bespoke Luxury"
    },
    {
      id: "heritage-temples",
      name: "Central Heritage Temples",
      region: "Central India",
      regionCategory: "central",
      tag: "Architecture & Carvings",
      featured: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq1IHEhPZ2DXEjlM6niqAcKHNIyYD95PiohA7J6-5PMoP4S4WxC2UkMGWm7xu6-ibvGnNu9DGHr6-gKsj1ircomIfs3Qcg6Bu_j85pGXHqX6OGYUKsggus9W7-WrWHhjcoPhMn9U3W7XbDj9kPMwjbRXGouoaOVPBs6O1bQlumo-trn-_jaglqQje1cNYpE_MaxAgUfdPSCseRW5WyyVJrzDfCnjD7iuqDBJU7XAohu_4X73ZY1jkd",
      description: "Mesmerizing sandstone carvings, ancient stupas at Sanchi, and the iconic temples of Khajuraho celebrating classical Indian artistry, music, and sculpture.",
      bestTimeToVisit: "October to April",
      temperature: "20°C - 30°C",
      unesco: "Khajuraho Group of Monuments & Sanchi Stupas",
      highlights: [
        "Sunrise architectural walkthrough with archaeological scholars",
        "Sound & light show at Western Group of Temples",
        "Private boat cruise on Narmada River at Bhedaghat Marble Rocks",
        "Bandhavgarh tiger safari connection"
      ],
      idealDuration: "4-6 Days",
      budgetTier: "Premium"
    },
    {
      id: "misty-tea-gardens",
      name: "Misty Tea Gardens",
      region: "Northeast India",
      regionCategory: "northeast",
      tag: "Tea Heritage & Wildlife",
      featured: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2LmUGFCbs9KkmdKTjasc-KZSr_SOTXXHmOPtfvA5xtKU6NsXVECVOr6495j7jy6PpgB0SLrzNYdzMu88QJU6WrFM-77ZJOGro0fLic8LZ_6P0Iq-sYMotOBKvYtoNipZyWKA_AiVEDChCAtwUD5rDJi8yOhX5zb_SD0B-5PBBhj4KME3z9ZqmR2rlknflHHpifOR28rJmPMXsMyEJS7SmPxdfnRbrOlJCoqVEqlkdV64wrbr4OR4y",
      description: "Rolling emerald tea slopes in Darjeeling and Assam, colonial planter bungalows, and the biodiversity of Kaziranga, home of the one-horned rhinoceros.",
      bestTimeToVisit: "October to May",
      temperature: "12°C - 24°C",
      unesco: "Kaziranga National Park & Darjeeling Himalayan Railway",
      highlights: [
        "First-flush tea tasting masterclass with certified sommelier",
        "Ride on the historic UNESCO steam Toy Train",
        "Private 4x4 safaris in Kaziranga Central and Western ranges",
        "Living root bridges expedition in Meghalaya"
      ],
      idealDuration: "6-8 Days",
      budgetTier: "Luxury"
    },
    {
      id: "goa-coastal",
      name: "Secluded Coastal Goa",
      region: "West India",
      regionCategory: "beaches",
      tag: "Beaches & Indo-Portuguese Heritage",
      featured: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwa8cmYUY11BWjy_6MrkFvRyFkUkPtQItarc5Cppyq93x4W0EK9T7x0They1sHYanh5KEzbJubUXVI-zcYU2fQRjJ_cAmrVUC4rbwdN_k7ZWdT2J4kys7Iekwc7pGLdYdHwz1Zt1viYmPrN3ICN1eiJt_osYnTsb1DoaDer7i7ecQAAAFbz4AottYYBsVKOEdj7k6YwpMFrLKh1RZMDm1t94ByUvQcEqQhipzdK40Pg9mMTH56V6nB",
      description: "Beyond party shores: private palm-fringed coves in South Goa, restored 18th-century Portuguese mansions, and avant-garde coastal cuisine.",
      bestTimeToVisit: "November to March",
      temperature: "22°C - 32°C",
      unesco: "Churches and Convents of Old Goa",
      highlights: [
        "Private catamaran sunset cruise along the Chapora river",
        "Restored heritage villa stays in Fontainhas Latin Quarter",
        "Organic feni distillery tasting and spice plantation lunch",
        "Secluded sunrise yoga sessions at Cola Beach"
      ],
      idealDuration: "4-6 Days",
      budgetTier: "Luxury"
    },
    {
      id: "radhanagar-cove",
      name: "Radhanagar Secret Cove, Andamans",
      region: "South Islands",
      regionCategory: "beaches",
      tag: "Hidden Gem",
      featured: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDZbqnNajS1mZh-_kVkITlfaNj8kZIxrOzC4sWNG0D-1T5b9LwpObFAkFcCtraat6o9v6_p7S1NvFIBtT9l13JydnX1bn41eiHtnXMJfQhvfObxpOj0Gbn9xRWVj-yJYFw5Yxjy4zArFfZOwxSKB7btAm4oIDB2041v9Bvb9v3jB5lbZp6c8PK1kmye3Jca_ykAo4Ts_g7O_ymi943g7Gortq-vtrxjKo1XMwuGcY6z4-GkgVv4v41",
      description: "Beyond the main beach lies a secluded cove accessible only at low tide. Crystal clear waters, untouched coral reefs, and solitary crimson sunsets.",
      bestTimeToVisit: "October to May",
      temperature: "23°C - 30°C",
      unesco: "Andaman Biosphere Reserve Candidate",
      highlights: [
        "Private night bioluminescence kayaking tour",
        "Scuba diving along pristine untouched outer reefs",
        "Barefoot luxury eco-resort nestled in tropical rainforests"
      ],
      idealDuration: "5-7 Days",
      budgetTier: "Ultra Luxury"
    },
    {
      id: "adalaj-stepwell",
      name: "Forgotten Stepwells of Gujarat",
      region: "West India",
      regionCategory: "west",
      tag: "Hidden Gem & Architecture",
      featured: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIQn-NWvuVhnzSjB6yjYpNS5U0WyaDwKz6Mb8sbD9ZCl3kNbGMEUKpDr3hEkU8hksBV5D8lE1DAe49qySVx7fSsk0UygHOYkT02sUSs3WLqAQJnndwH1VmgGoZu94L7lhgvR_3clEMgDEH9ubrPJWBSlT_JD2Bovs_wrVZchO6o8k9ETwHaSWLBJx0IWKexVjfg7iKLqzXh49jODwojyA51C3FqYpzafA8egGfxW6Z9ZsBpUwQrCdB",
      description: "Venture off the main corridors in Gujarat to discover 5-story subterranean architectural marvels like Adalaj and Rani ki Vav, carved with intricate mythological motifs.",
      bestTimeToVisit: "November to February",
      temperature: "16°C - 28°C",
      unesco: "Rani ki Vav (The Queen’s Stepwell)",
      highlights: [
        "Geometry & hydraulic engineering guided walkthroughs",
        "Combined excursion to the Sun Temple at Modhera",
        "Patola double-ikat silk weaving atelier visit"
      ],
      idealDuration: "3-5 Days",
      budgetTier: "Premium"
    },
    {
      id: "old-city-spice-trails",
      name: "Old City Spice Trails, Delhi & Kochi",
      region: "North & South",
      regionCategory: "central",
      tag: "Hidden Gem & Culinary",
      featured: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfDBxvYAw0VijJNqqkTe2BL05NTr8nPdRAerkslVH236mEpuJKw14xELQcavOTV-7rvHCAZzXzodVRf2PshYYgjToT4dBlia72DkrrUoLAS9iDknF42lqwrg02Pu84kCyHeW3EraAlhwjtb6CeeziMlG4pf3fBsgLwlHdrX3ly1MZ6gS3I3-YDUSHBwcMerhq3bB7C9f1h3h58iefvkBdWIHvK1kdjfHBcb-FCppX5GTslY_Ndk1sF",
      description: "An AI-curated walking trail through centuries-old spice markets connecting with 4th-generation spice merchants and hidden heritage tasting rooms.",
      bestTimeToVisit: "Year-Round",
      temperature: "20°C - 32°C",
      unesco: "Cultural Heritage Living Tradition",
      highlights: [
        "Khari Baoli rooftop vantage overlooking Asia's largest spice market",
        "Custom spice blending masterclass with heritage chefs",
        "Centuries-old family recipes tasting"
      ],
      idealDuration: "2-3 Days",
      budgetTier: "Curated"
    }
  ],

  // Curated Experiences Dataset
  experiences: [
    {
      id: "kerala-houseboat-escape",
      title: "Backwater Houseboat Escape",
      category: "heritage",
      categoryName: "Heritage & Nature",
      location: "Alleppey & Kumarakom, Kerala",
      duration: "2 Days / 1 Night",
      priceINR: "₹45,000",
      priceUSD: "$540",
      rating: "4.98",
      reviewsCount: 142,
      badge: "Featured Signature",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATTXj9MF7JHlTgWsYZqdPbjOgIU76jp-ngm1oIeG075fErYTR84x7JoZAoTl9crAqUwInZg75dh5QE0-OC2HOTyWFwPvHfupaSTev6vujAXfclO1SdDCEomxTEs165y0i3VCmckG7OAYwUPJkEE3GUQ4zaZ_bI3y_US4ShAmUaHvaGrcpbKTCl5HRQzrNgyXOACsB_ssw0YUAq769e_GAWxgDvbNvSRZvNJdzzVH8Y9-pSkLfAdJKx",
      shortDescription: "Glide through emerald canals on a private, handcrafted luxury Kettuvallam with personal chef and sunset cruise over Lake Vembanad.",
      fullDescription: "Step aboard our bespoke wooden houseboat, carved by hereditary boat-crafters from jackwood and coir ropes, retrofitted with whisper-quiet electric propulsion and five-star luxury suites. Your onboard culinary master prepares personalized Keralan delicacies while you float past palm groves, paddy fields, and timeless village life.",
      included: [
        "Private luxury houseboat with air-conditioned stateroom",
        "Personal master chef & 3 bespoke meals",
        "Evening tea with traditional banana fritters on deck",
        "Village canoe expedition through narrow canals",
        "Ayurvedic massage session onboard"
      ]
    },
    {
      id: "rishikesh-sunset-yoga",
      title: "Sunset Yoga & Meditation on the Ganges",
      category: "wellness",
      categoryName: "Wellness & Spiritual",
      location: "Rishikesh, Uttarakhand",
      duration: "Half Day (4 Hours)",
      priceINR: "₹8,500",
      priceUSD: "$105",
      rating: "4.95",
      reviewsCount: 218,
      badge: "Top Rated",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBji1LMGUSkCVSQ_uOOQ06AsKIPjOc07jsCOAJv5c0O64AHqBOZyRqIhzuHYxlDOYDMEtaVZAhoYqNStyKHumOLPRnvLTQH9QBjaMe5dqd1bUCisgBf-Ui4C-o2gPp26xwpJvegWu65YUnwfuke7IA3ybaSIAtrLerxLDR80ObSWJjXcjCQVcYruBqXHIoyO4B3_6_dVy4BF0986j3_LlU3ABuUWXDnN7BQ_885nMYoYp62mT0p6ltS",
      shortDescription: "Private guided Hatha & Pranayama session on a secluded white marble deck overlooking the turquoise Himalayan Ganges.",
      fullDescription: "Led by a certified Yogacharya from an ancient Himalayan lineage, this transformative experience combines gentle alignment postures, sacred mantra chanting, and guided mindfulness as the twilight bells of the evening Ganga Aarti echo across the valley.",
      included: [
        "Private 90-minute customized yoga & breathwork session",
        "Sound bowl vibrational therapy",
        "Herbal Himalayan tisanes & organic sattvic refreshments",
        "VIP seating at the Parmarth Niketan Evening Aarti"
      ]
    },
    {
      id: "udaipur-royal-dining",
      title: "Royal Dining in Udaipur Palaces",
      category: "culinary",
      categoryName: "Culinary & Heritage",
      location: "Udaipur, Rajasthan",
      duration: "Evening (3.5 Hours)",
      priceINR: "₹28,000",
      priceUSD: "$340",
      rating: "5.0",
      reviewsCount: 89,
      badge: "Exclusive",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW0M6zZtLwttGEVuWvqbNwCcMZtAiVWiNUVNOq7I7LYWxpRPq7tOiNd1fQSIkVF5_3-3dzV2OMa7qB3SDWKnvax0cRXbt_jUW1DaZrJ7pVLUtv0hAixzKPbRTQBMY8wgxhC2uSWQE64rSppWLEvtGgOZaJBH10bGJFcSQQOXf3aG25PoEuWNGnpXknZRR0VD9BbgKTW-MB80GGK4TzMVpOIj_-GAIPZfzP6LsbS8uAWGjQPMbxwuWg",
      shortDescription: "A multi-course Mewari royal feast served under candlelit archways overlooking Lake Pichola and the illuminated City Palace.",
      fullDescription: "Dine like royal guests with a historic 7-course tasting menu curated from the recipe archives of Mewar royalty. Each dish is paired with fine vintage spirits, accompanied by live Santoor and Sitar performances in a private lakeside pavilion.",
      included: [
        "Private arrival via royal wooden boat across Lake Pichola",
        "7-Course royal Mewari tasting menu (Veg & Non-Veg options)",
        "Sommelier-selected wine pairing",
        "Personal historian introducing royal culinary heritage"
      ]
    },
    {
      id: "varanasi-silk-looms",
      title: "Artisan Silk Weaving Masterclass",
      category: "heritage",
      categoryName: "Heritage & Craft",
      location: "Varanasi, Uttar Pradesh",
      duration: "Full Day (6 Hours)",
      priceINR: "₹12,500",
      priceUSD: "$150",
      rating: "4.92",
      reviewsCount: 94,
      badge: "Artisanal",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfDBxvYAw0VijJNqqkTe2BL05NTr8nPdRAerkslVH236mEpuJKw14xELQcavOTV-7rvHCAZzXzodVRf2PshYYgjToT4dBlia72DkrrUoLAS9iDknF42lqwrg02Pu84kCyHeW3EraAlhwjtb6CeeziMlG4pf3fBsgLwlHdrX3ly1MZ6gS3I3-YDUSHBwcMerhq3bB7C9f1h3h58iefvkBdWIHvK1kdjfHBcb-FCppX5GTslY_Ndk1sF",
      shortDescription: "Meet master weavers in historic Madanpura and try your hand at the intricate Jacquard looms creating pure gold Zari brocades.",
      fullDescription: "Go beyond retail shops into the living heritage of Banarasi silk. Learn how patterns are transcribed from mathematical graphs onto punch cards, touch pure silver and gold threads, and preserve this endangered UNESCO-recognized artform.",
      included: [
        "Private insider access to 3 generational weaving ateliers",
        "Hands-on loom weaving trial under master guidance",
        "Authentic Banarasi Thandai and local sweets tasting",
        "Certificate of heritage craft participation"
      ]
    },
    {
      id: "ranthambore-safari",
      title: "Private Tiger Safari & Conservation Trail",
      category: "adventure",
      categoryName: "Wildlife & Nature",
      location: "Ranthambore National Park, Rajasthan",
      duration: "2 Days (2 Safaris)",
      priceINR: "₹38,000",
      priceUSD: "$460",
      rating: "4.96",
      reviewsCount: 165,
      badge: "Signature Adventure",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMUYBs2pwdiLXpoIPkxjgqCZbUpDDAAs28yxzXCQFPwGmbydQHDhV4vb1HLsKZ0LDUPdLZZ2w74y3o8u8OYphNz3N4JTlFF8TDstt8IW3QB6emgCYOFQG1_ygf3qlT1j0Rd8SWA6jpjVADUymurhnaXEXdNn58FtbWgnkyAs22pb5LpXwBfCYFsYVuZxGrYyBsQkE-LSEn1a2gEznFa-R3cXPJKEWOc1vEJE0pxukWQsfyyurEoMel",
      shortDescription: "Exclusive 4x4 open-top Gypsy safaris with senior naturalists track Royal Bengal tigers against the backdrop of an ancient fort.",
      fullDescription: "Traverse the rugged deciduous forests, ancient banyan trees, and lake ruins of Ranthambore. Stay in luxury safari tented camps equipped with plunge pools and evening fireside naturalist talks.",
      included: [
        "2 Private safaris with senior park naturalists and trackers",
        "Luxury tented suite accommodation with all meals",
        "High-definition telephoto lens loaner for photography",
        "Village wildlife conservation foundation contribution"
      ]
    }
  ],

  // Specialty Seasonal Curations
  specialtyCurations: [
    {
      id: "diwali-in-jaipur",
      title: "Diwali in the Pink City",
      icon: "account_balance",
      season: "October - November",
      description: "Experience the Festival of Lights in Jaipur. An immersive curation featuring private palace celebrations, earthen diya lighting with local artisan families, and rooftop fireworks dinners.",
      badge: "Autumn Special",
      duration: "4 Days"
    },
    {
      id: "himalayan-bloom",
      title: "Himalayan Bloom & Valley of Flowers",
      icon: "filter_vintage",
      season: "July - September",
      description: "A seasonal trek through the UNESCO Valley of Flowers in Uttarakhand. Raahi aligns your journey perfectly with the brief peak blooming period of over 500 alpine flower species.",
      badge: "Seasonal Trek",
      duration: "6 Days"
    },
    {
      id: "monsoon-ayurveda",
      title: "Monsoon Ayurveda Retreat",
      icon: "spa",
      season: "June - August",
      description: "The traditional ideal season for deep physical rejuvenation. A curated selection of Kerala's finest heritage Ayurvedic estates, optimized for the cooling monsoon rains (Karkidakam).",
      badge: "Wellness Retreat",
      duration: "7-14 Days"
    }
  ],

  // Travel Journal Articles
  articles: [
    {
      id: "golden-triangle-echoes",
      title: "Echoes of Empire: Traversing the Golden Triangle",
      category: "Featured Insight",
      categoryTag: "cultural",
      author: "Priya Sengupta",
      readTime: "7 min read",
      date: "August 2026",
      featured: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdXZ4USmPjSOnzxnVLU6B-NffIkk11RHEpsErhi7-DmZptarioY9w0qZaIlCaemJGjvh-AHPuwQ8mMvcWG0bD1DnWxJIOHC-xrHTlc21L4pk66ijXuftYe2qxK_Dx5y2SVWsaOKVOdmnoYV5AxK77TnUCVOyqZRZsnKEAAXGI4SBk1SNZBMbLDX5gBAjmbPHbSEyP-0p8XRwAcapLDdcxAViGRK_aa-x_q5aSWgNo9gerZHvYZoe17",
      excerpt: "A modern exploration of Delhi, Agra, and Jaipur, where centuries of history blend seamlessly with contemporary luxury and sustainable hospitality.",
      content: `
        <p class="mb-4">The dawn mist clinging to the marble domes of the Taj Mahal has fascinated travelers for centuries. Yet to experience the Golden Triangle today is to witness a profound dialogue between past empires and forward-thinking luxury.</p>
        <h4 class="text-xl font-bold text-primary mt-6 mb-3">The Architectural Geometry of Agra</h4>
        <p class="mb-4">Beyond the iconic mausoleum, the red sandstone ramparts of Agra Fort and the abandoned utopian city of Fatehpur Sikri hold secrets written in precision stonework. Our journey avoided the midday rushes, granting private dawn entry into the Mehtab Bagh gardens as reflection pools mirrored the monument in pale peach and gold hues.</p>
        <h4 class="text-xl font-bold text-primary mt-6 mb-3">Jaipur's Pink Hues and Modern Artisans</h4>
        <p class="mb-4">In Jaipur, the pink terracotta walls are not merely museum artifacts; they are vibrant studios. Master block-printers, royal gem-cutters, and blue pottery ceramists are redefining luxury by pairing ancient Mughal motifs with contemporary minimalist silhouettes.</p>
        <p class="mb-4">Traveling through the Golden Triangle with an intelligent itinerary allows you to balance monumental scale with intimate encounters—sipping spiced chai on a private haveli terrace while listening to a classical Sarod master play the morning Raga.</p>
      `
    },
    {
      id: "varanasi-looms",
      title: "The Looms of Varanasi: A Thread to the Divine",
      category: "Cultural Insights",
      categoryTag: "architecture",
      author: "Ananya Sharma",
      readTime: "5 min read",
      date: "August 2026",
      featured: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfDBxvYAw0VijJNqqkTe2BL05NTr8nPdRAerkslVH236mEpuJKw14xELQcavOTV-7rvHCAZzXzodVRf2PshYYgjToT4dBlia72DkrrUoLAS9iDknF42lqwrg02Pu84kCyHeW3EraAlhwjtb6CeeziMlG4pf3fBsgLwlHdrX3ly1MZ6gS3I3-YDUSHBwcMerhq3bB7C9f1h3h58iefvkBdWIHvK1kdjfHBcb-FCppX5GTslY_Ndk1sF",
      excerpt: "Discover the ancient art of silk weaving along the ghats of the Ganges, where every thread tells a story of devotion and masterful craftsmanship passed down through generations.",
      content: `
        <p class="mb-4">In the labyrinthine lanes of Varanasi's Madanpura, the rhythmic click-clack of wooden looms has formed the heartbeat of the holy city for more than five hundred years.</p>
        <p class="mb-4">A single Banarasi saree can take up to six months of painstaking labor, requiring two master artisans to guide pure silk and silver-gilded Zari threads through complex Jacquard patterns. We sat down with Ustad Mohammad, whose family has woven brocades for royal courts and modern high-fashion houses alike.</p>
        <blockquote class="p-4 my-4 border-l-4 border-primary bg-surface-container rounded-r-lg italic text-on-surface-variant">"We do not simply weave cloth; we weave prayers and light into the silk."</blockquote>
        <p class="mb-4">Through conscious heritage travel, visitors can directly support weaver cooperatives, preserving an invaluable piece of global living heritage.</p>
      `
    },
    {
      id: "darjeeling-tea-roots",
      title: "Regenerative Roots: The New Wave of Tea Estates",
      category: "Sustainability Stories",
      categoryTag: "wildlife",
      author: "James Caldwell",
      readTime: "8 min read",
      date: "July 2026",
      featured: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2LmUGFCbs9KkmdKTjasc-KZSr_SOTXXHmOPtfvA5xtKU6NsXVECVOr6495j7jy6PpgB0SLrzNYdzMu88QJU6WrFM-77ZJOGro0fLic8LZ_6P0Iq-sYMotOBKvYtoNipZyWKA_AiVEDChCAtwUD5rDJi8yOhX5zb_SD0B-5PBBhj4KME3z9ZqmR2rlknflHHpifOR28rJmPMXsMyEJS7SmPxdfnRbrOlJCoqVEqlkdV64wrbr4OR4y",
      excerpt: "How heritage tea gardens in Darjeeling are pioneering biodynamic farming practices to preserve the delicate Himalayan ecosystem while producing world-class artisanal brews.",
      content: `
        <p class="mb-4">Perched at 6,000 feet with the snow-covered crown of Mount Kanchenjunga commanding the horizon, Darjeeling's high-altitude tea slopes are undergoing a quiet ecological revolution.</p>
        <p class="mb-4">Pioneering estates like Makaibari and Glenburn have transitioned entirely to biodynamic agroforestry. By planting native Himalayan oak and rhododendron alongside tea bushes, they foster natural predator habitats for pests and regenerate fragile topsoils.</p>
        <p class="mb-4">During our harvest walkthrough, estate sommeliers guided us through a sensory tasting of the prized 'Muscatel' Second Flush, exhibiting notes of ripe peach, wild honey, and mountain mist.</p>
      `
    },
    {
      id: "malabar-culinary-voyage",
      title: "A Culinary Voyage Through Malabar",
      category: "Expert Guides",
      categoryTag: "gastronomy",
      author: "Chef Rohan Menon",
      readTime: "6 min read",
      date: "July 2026",
      featured: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW0M6zZtLwttGEVuWvqbNwCcMZtAiVWiNUVNOq7I7LYWxpRPq7tOiNd1fQSIkVF5_3-3dzV2OMa7qB3SDWKnvax0cRXbt_jUW1DaZrJ7pVLUtv0hAixzKPbRTQBMY8wgxhC2uSWQE64rSppWLEvtGgOZaJBH10bGJFcSQQOXf3aG25PoEuWNGnpXknZRR0VD9BbgKTW-MB80GGK4TzMVpOIj_-GAIPZfzP6LsbS8uAWGjQPMbxwuWg",
      excerpt: "Navigate the complex and fiery flavors of Kerala's spice coast. Our local experts break down essential spices, heritage toddy shops, and sacred temple feasts.",
      content: `
        <p class="mb-4">For thousands of years, trade winds carried Arab, Roman, and European merchant vessels to the spice shores of Malabar in search of black pepper, known as 'black gold'.</p>
        <p class="mb-4">The result is a culinary tapestry unlike anywhere else on earth: fragrant Biryanis perfumed with Tellicherry peppercorns and star anise, delicately flaky Malabar Parottas, and tangy fish curries enriched with fresh coconut milk and sour Kodampuli (Malabar tamarind).</p>
        <p class="mb-4">The pinnacle experience remains the Sadhya: a lavish vegetarian feast served on a fresh banana leaf featuring up to 26 distinct dishes, representing all six tastes (Shadrasas) defined in Ayurvedic science.</p>
      `
    }
  ],

  // Sample AI Generated Itinerary Templates
  sampleItineraries: {
    "rajasthan": {
      title: "Royal Rajasthan Heritage & Desert Odyssey",
      subtitle: "7 Days • 2 Adults • Relaxed Luxury",
      destination: "Rajasthan (Jaipur, Jodhpur, Udaipur)",
      budgetEst: "Premium ($$$) / ₹1,85,000",
      days: [
        {
          dayNumber: 1,
          date: "Day 1",
          city: "Jaipur",
          weather: "28°C • Sunny",
          title: "Arrival in the Pink City & Palace Splendor",
          activities: [
            {
              time: "Morning",
              title: "Check-in at Heritage Palace Hotel",
              description: "Traditional welcome with marigold garlands and rose petal showers at Rambagh Palace.",
              tag: "Hospitality",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8h5x7V2pd-Kmz-cfjTD46UKBcrBtIlWIqq62d3w1yQX_0nbvTERH4XE2mmGz4SZoRtmUHy-HIhz0FW_zea8kJZkw8wEnQfBP3AdkdjD4_eP33tT7JNNiTZQ5zWD9fUknOaK30zAVpzbhyGO4BWBq4t7eDuXd849wux6ppsoVgzDGQwiyjjXKwqlrKG8Upj653iLoEf1VarycxvudY6SPvtziN1E76-C3JXtS4TTGORUWBzf2c33SY"
            },
            {
              time: "Afternoon",
              title: "City Palace Private Archives Tour",
              description: "Exclusive curated walkthrough of royal textile museum and armory with private royal historian.",
              tag: "Heritage",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq1IHEhPZ2DXEjlM6niqAcKHNIyYD95PiohA7J6-5PMoP4S4WxC2UkMGWm7xu6-ibvGnNu9DGHr6-gKsj1ircomIfs3Qcg6Bu_j85pGXHqX6OGYUKsggus9W7-WrWHhjcoPhMn9U3W7XbDj9kPMwjbRXGouoaOVPBs6O1bQlumo-trn-_jaglqQje1cNYpE_MaxAgUfdPSCseRW5WyyVJrzDfCnjD7iuqDBJU7XAohu_4X73ZY1jkd"
            },
            {
              time: "Evening",
              title: "Candlelit Dining at 1135 AD Amer",
              description: "Rajasthani royal thali served inside the historic ramparts of Amer Fort under crystal chandeliers.",
              tag: "Culinary",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW0M6zZtLwttGEVuWvqbNwCcMZtAiVWiNUVNOq7I7LYWxpRPq7tOiNd1fQSIkVF5_3-3dzV2OMa7qB3SDWKnvax0cRXbt_jUW1DaZrJ7pVLUtv0hAixzKPbRTQBMY8wgxhC2uSWQE64rSppWLEvtGgOZaJBH10bGJFcSQQOXf3aG25PoEuWNGnpXknZRR0VD9BbgKTW-MB80GGK4TzMVpOIj_-GAIPZfzP6LsbS8uAWGjQPMbxwuWg"
            }
          ]
        },
        {
          dayNumber: 2,
          date: "Day 2",
          city: "Jaipur",
          weather: "29°C • Clear Skies",
          title: "Amer Fort Ascent & Artisan Block Printing",
          activities: [
            {
              time: "Morning",
              title: "Amer Fort Early Access",
              description: "Beat the crowds to explore the mirror palace (Sheesh Mahal) and Maota Lake reflecting morning light.",
              tag: "Sightseeing",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8h5x7V2pd-Kmz-cfjTD46UKBcrBtIlWIqq62d3w1yQX_0nbvTERH4XE2mmGz4SZoRtmUHy-HIhz0FW_zea8kJZkw8wEnQfBP3AdkdjD4_eP33tT7JNNiTZQ5zWD9fUknOaK30zAVpzbhyGO4BWBq4t7eDuXd849wux6ppsoVgzDGQwiyjjXKwqlrKG8Upj653iLoEf1VarycxvudY6SPvtziN1E76-C3JXtS4TTGORUWBzf2c33SY"
            },
            {
              time: "Afternoon",
              title: "Bagru Natural Dyeing & Block Printing Workshop",
              description: "Create your own customized scarf using hand-carved teakwood blocks and plant dyes.",
              tag: "Artisanal",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfDBxvYAw0VijJNqqkTe2BL05NTr8nPdRAerkslVH236mEpuJKw14xELQcavOTV-7rvHCAZzXzodVRf2PshYYgjToT4dBlia72DkrrUoLAS9iDknF42lqwrg02Pu84kCyHeW3EraAlhwjtb6CeeziMlG4pf3fBsgLwlHdrX3ly1MZ6gS3I3-YDUSHBwcMerhq3bB7C9f1h3h58iefvkBdWIHvK1kdjfHBcb-FCppX5GTslY_Ndk1sF"
            },
            {
              time: "Evening",
              title: "Nahargarh Sunset Vantage",
              description: "Watch the Pink City transition into a sea of twinkling lights from the highest cliff fort point.",
              tag: "Scenic",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdXZ4USmPjSOnzxnVLU6B-NffIkk11RHEpsErhi7-DmZptarioY9w0qZaIlCaemJGjvh-AHPuwQ8mMvcWG0bD1DnWxJIOHC-xrHTlc21L4pk66ijXuftYe2qxK_Dx5y2SVWsaOKVOdmnoYV5AxK77TnUCVOyqZRZsnKEAAXGI4SBk1SNZBMbLDX5gBAjmbPHbSEyP-0p8XRwAcapLDdcxAViGRK_aa-x_q5aSWgNo9gerZHvYZoe17"
            }
          ]
        },
        {
          dayNumber: 3,
          date: "Day 3",
          city: "Jodhpur",
          weather: "31°C • Sunny",
          title: "The Blue City & Mehrangarh Ramparts",
          activities: [
            {
              time: "Morning",
              title: "Scenic Transfer to Jodhpur & Umaid Bhawan",
              description: "Luxury chauffeured transit through the desert highway with private stop at Osian stepwells.",
              tag: "Transit & Leisure",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIQn-NWvuVhnzSjB6yjYpNS5U0WyaDwKz6Mb8sbD9ZCl3kNbGMEUKpDr3hEkU8hksBV5D8lE1DAe49qySVx7fSsk0UygHOYkT02sUSs3WLqAQJnndwH1VmgGoZu94L7lhgvR_3clEMgDEH9ubrPJWBSlT_JD2Bovs_wrVZchO6o8k9ETwHaSWLBJx0IWKexVjfg7iKLqzXh49jODwojyA51C3FqYpzafA8egGfxW6Z9ZsBpUwQrCdB"
            },
            {
              time: "Afternoon",
              title: "Blue City Walking Tour with Local Historian",
              description: "Explore the cobalt-painted Brahmin quarters and hidden stepwell cafes.",
              tag: "Heritage Walk",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8h5x7V2pd-Kmz-cfjTD46UKBcrBtIlWIqq62d3w1yQX_0nbvTERH4XE2mmGz4SZoRtmUHy-HIhz0FW_zea8kJZkw8wEnQfBP3AdkdjD4_eP33tT7JNNiTZQ5zWD9fUknOaK30zAVpzbhyGO4BWBq4t7eDuXd849wux6ppsoVgzDGQwiyjjXKwqlrKG8Upj653iLoEf1VarycxvudY6SPvtziN1E76-C3JXtS4TTGORUWBzf2c33SY"
            },
            {
              time: "Evening",
              title: "Mehrangarh Fort Rooftop Dinner",
              description: "Dinner overlooking the illuminated fortress walls with live Manganiyar desert folk music.",
              tag: "Culture & Dining",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW0M6zZtLwttGEVuWvqbNwCcMZtAiVWiNUVNOq7I7LYWxpRPq7tOiNd1fQSIkVF5_3-3dzV2OMa7qB3SDWKnvax0cRXbt_jUW1DaZrJ7pVLUtv0hAixzKPbRTQBMY8wgxhC2uSWQE64rSppWLEvtGgOZaJBH10bGJFcSQQOXf3aG25PoEuWNGnpXknZRR0VD9BbgKTW-MB80GGK4TzMVpOIj_-GAIPZfzP6LsbS8uAWGjQPMbxwuWg"
            }
          ]
        },
        {
          dayNumber: 4,
          date: "Day 4",
          city: "Udaipur",
          weather: "27°C • Sunny",
          title: "City of Lakes & Private Pichola Boat Cruise",
          activities: [
            {
              time: "Morning",
              title: "Drive to Udaipur via Ranakpur Jain Temple",
              description: "Marvel at the 1,444 uniquely carved marble pillars in the serene Aravalli forest.",
              tag: "Architecture",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq1IHEhPZ2DXEjlM6niqAcKHNIyYD95PiohA7J6-5PMoP4S4WxC2UkMGWm7xu6-ibvGnNu9DGHr6-gKsj1ircomIfs3Qcg6Bu_j85pGXHqX6OGYUKsggus9W7-WrWHhjcoPhMn9U3W7XbDj9kPMwjbRXGouoaOVPBs6O1bQlumo-trn-_jaglqQje1cNYpE_MaxAgUfdPSCseRW5WyyVJrzDfCnjD7iuqDBJU7XAohu_4X73ZY1jkd"
            },
            {
              time: "Afternoon",
              title: "Check-in at Lake Palace / Private Island Resort",
              description: "Step into pure tranquility floating on Lake Pichola with views of the City Palace.",
              tag: "Luxury Stay",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDZbqnNajS1mZh-_kVkITlfaNj8kZIxrOzC4sWNG0D-1T5b9LwpObFAkFcCtraat6o9v6_p7S1NvFIBtT9l13JydnX1bn41eiHtnXMJfQhvfObxpOj0Gbn9xRWVj-yJYFw5Yxjy4zArFfZOwxSKB7btAm4oIDB2041v9Bvb9v3jB5lbZp6c8PK1kmye3Jca_ykAo4Ts_g7O_ymi943g7Gortq-vtrxjKo1XMwuGcY6z4-GkgVv4v41"
            },
            {
              time: "Evening",
              title: "Private Boat Ride to Jag Mandir Island",
              description: "Sunset cruise with champagne followed by classical Kathak dance performance.",
              tag: "Signature Experience",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATTXj9MF7JHlTgWsYZqdPbjOgIU76jp-ngm1oIeG075fErYTR84x7JoZAoTl9crAqUwInZg75dh5QE0-OC2HOTyWFwPvHfupaSTev6vujAXfclO1SdDCEomxTEs165y0i3VCmckG7OAYwUPJkEE3GUQ4zaZ_bI3y_US4ShAmUaHvaGrcpbKTCl5HRQzrNgyXOACsB_ssw0YUAq769e_GAWxgDvbNvSRZvNJdzzVH8Y9-pSkLfAdJKx"
            }
          ]
        }
      ]
    },
    "kerala": {
      title: "Kerala Backwaters & Ayurvedic Serenity",
      subtitle: "5 Days • 2 Adults • Rejuvenation & Nature",
      destination: "Kerala (Kochi, Munnar, Alleppey)",
      budgetEst: "Luxury ($$$) / ₹1,40,000",
      days: [
        {
          dayNumber: 1,
          date: "Day 1",
          city: "Fort Kochi",
          weather: "28°C • Gentle Breeze",
          title: "Colonial Charm & Chinese Fishing Nets",
          activities: [
            {
              time: "Morning",
              title: "Heritage Walk in Fort Kochi",
              description: "Stroll past Portuguese mansions, St. Francis Church, and Jewish Synagogue.",
              tag: "Heritage",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNv8d69XKaPG473nwU-TBCMFnHokFsx1X0U9FGALsqfnfITWjh13HyDpy34ifo6gnotC74GajczYca6mFGecYPHp1LKI5Ng5HeilZ1FooBjFLAfiaF8FoxRFVcldTSTMHPbyWkyTVa0oSuEJHqetd9Avl__vL76O964SVIB6yQD-eYT4G9b0hA4i13VK259hEDqKnLyorn4EBxkDKCMq6iPE7PZyKQM3_kC6-F2SWD2M-OwpA4-QGU"
            },
            {
              time: "Afternoon",
              title: "Spice Market Tasting & Cooking Class",
              description: "Select fresh Tellicherry pepper and cardamom with a local master chef.",
              tag: "Culinary",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW0M6zZtLwttGEVuWvqbNwCcMZtAiVWiNUVNOq7I7LYWxpRPq7tOiNd1fQSIkVF5_3-3dzV2OMa7qB3SDWKnvax0cRXbt_jUW1DaZrJ7pVLUtv0hAixzKPbRTQBMY8wgxhC2uSWQE64rSppWLEvtGgOZaJBH10bGJFcSQQOXf3aG25PoEuWNGnpXknZRR0VD9BbgKTW-MB80GGK4TzMVpOIj_-GAIPZfzP6LsbS8uAWGjQPMbxwuWg"
            },
            {
              time: "Evening",
              title: "Private Kathakali Makeup & Performance",
              description: "Watch the meticulous 2-hour facial paint ritual followed by the classical dance drama.",
              tag: "Art & Culture",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfDBxvYAw0VijJNqqkTe2BL05NTr8nPdRAerkslVH236mEpuJKw14xELQcavOTV-7rvHCAZzXzodVRf2PshYYgjToT4dBlia72DkrrUoLAS9iDknF42lqwrg02Pu84kCyHeW3EraAlhwjtb6CeeziMlG4pf3fBsgLwlHdrX3ly1MZ6gS3I3-YDUSHBwcMerhq3bB7C9f1h3h58iefvkBdWIHvK1kdjfHBcb-FCppX5GTslY_Ndk1sF"
            }
          ]
        },
        {
          dayNumber: 2,
          date: "Day 2",
          city: "Alleppey",
          weather: "29°C • Tropical Warmth",
          title: "Private Kettuvallam Houseboat Embarkation",
          activities: [
            {
              time: "Morning",
              title: "Drive to Alleppey Jetty & Embarkation",
              description: "Step aboard your private solar-assisted luxury houseboat on Vembanad Lake.",
              tag: "Signature Cruise",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATTXj9MF7JHlTgWsYZqdPbjOgIU76jp-ngm1oIeG075fErYTR84x7JoZAoTl9crAqUwInZg75dh5QE0-OC2HOTyWFwPvHfupaSTev6vujAXfclO1SdDCEomxTEs165y0i3VCmckG7OAYwUPJkEE3GUQ4zaZ_bI3y_US4ShAmUaHvaGrcpbKTCl5HRQzrNgyXOACsB_ssw0YUAq769e_GAWxgDvbNvSRZvNJdzzVH8Y9-pSkLfAdJKx"
            },
            {
              time: "Afternoon",
              title: "Slow Canal Cruising & Ayurvedic Lunch",
              description: "Fresh Karimeen Pollichathu served on banana leaves as you pass water lily lagoons.",
              tag: "Wellness & Dining",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW0M6zZtLwttGEVuWvqbNwCcMZtAiVWiNUVNOq7I7LYWxpRPq7tOiNd1fQSIkVF5_3-3dzV2OMa7qB3SDWKnvax0cRXbt_jUW1DaZrJ7pVLUtv0hAixzKPbRTQBMY8wgxhC2uSWQE64rSppWLEvtGgOZaJBH10bGJFcSQQOXf3aG25PoEuWNGnpXknZRR0VD9BbgKTW-MB80GGK4TzMVpOIj_-GAIPZfzP6LsbS8uAWGjQPMbxwuWg"
            },
            {
              time: "Evening",
              title: "Starlit Deck Dinner & Night Anchorage",
              description: "Quiet night mooring by a tranquil village with gentle water lap sounds.",
              tag: "Serenity",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNv8d69XKaPG473nwU-TBCMFnHokFsx1X0U9FGALsqfnfITWjh13HyDpy34ifo6gnotC74GajczYca6mFGecYPHp1LKI5Ng5HeilZ1FooBjFLAfiaF8FoxRFVcldTSTMHPbyWkyTVa0oSuEJHqetd9Avl__vL76O964SVIB6yQD-eYT4G9b0hA4i13VK259hEDqKnLyorn4EBxkDKCMq6iPE7PZyKQM3_kC6-F2SWD2M-OwpA4-QGU"
            }
          ]
        }
      ]
    }
  }
};
