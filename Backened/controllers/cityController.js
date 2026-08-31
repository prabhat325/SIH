const fs = require("fs");
const path = require("path");
const City = require("../models/City");

const citiesPath = path.join(
  __dirname,
  "../data/cities/cities.json"
);


// GET /api/cities
const getCities = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 20, 1);

  const search = (req.query.search || "")
    .toLowerCase()
    .trim();

  // ==========================================
  // 1. TRY MONGODB FIRST
  // ==========================================
  try {
    const query = {
      available: true
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } }
      ];
    }

    const total = await City.countDocuments(query);

    const pages = Math.ceil(total / limit);

    const data = await City.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      page,
      limit,
      total,
      pages,
      data
    });

  } catch (mongoError) {

    console.error(
      "⚠️ MongoDB city fetch failed:",
      mongoError
    );

    // ==========================================
    // 2. FALLBACK TO cities.json
    // ==========================================
    try {
      const cities = JSON.parse(
        fs.readFileSync(citiesPath, "utf-8")
      );

      let filteredCities = cities.filter(city => {

        if (!city.available) return false;

        if (!search) return true;

        return (
          city.name.toLowerCase().includes(search) ||
          city.state.toLowerCase().includes(search)
        );
      });

      const total = filteredCities.length;
      const pages = Math.ceil(total / limit);

      const start = (page - 1) * limit;

      const data = filteredCities.slice(
        start,
        start + limit
      );

      return res.json({
        success: true,
        page,
        limit,
        total,
        pages,
        data
      });

    } catch (fallbackError) {

      console.error(
        "❌ cities.json fallback failed:",
        fallbackError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load cities"
      });
    }
  }
};


// GET /api/cities/:cityId
const getCityById = async (req, res) => {

  // ==========================================
  // 1. TRY MONGODB FIRST
  // ==========================================
  try {

    const city = await City.findOne({
      $or: [
        {
          cityId: req.params.cityId
        },
        {
          name: req.params.cityId
        }
      ]
    }).lean();

    if (city) {

      return res.json({
        success: true,
        data: city
      });
    }

  } catch (mongoError) {

    console.error(
      "⚠️ MongoDB city fetch failed:",
      mongoError
    );
  }


  // ==========================================
  // 2. FALLBACK TO cities.json
  // ==========================================
  try {

    const cities = JSON.parse(
      fs.readFileSync(citiesPath, "utf-8")
    );

    const city = cities.find(
      c =>
        c.cityId.toLowerCase() ===
          req.params.cityId.toLowerCase() ||
        c.name.toLowerCase() ===
          req.params.cityId.toLowerCase()
    );

    if (!city) {

      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    return res.json({
      success: true,
      data: city
    });

  } catch (error) {

    console.error(
      "Get city error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load city"
    });
  }
};


module.exports = {
  getCities,
  getCityById
};