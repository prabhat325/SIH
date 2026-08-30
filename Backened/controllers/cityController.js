const fs = require("fs");
const path = require("path");

const citiesPath = path.join(
  __dirname,
  "../data/cities/cities.json"
);

const getCities = (req, res) => {
  try {
    const cities = JSON.parse(
      fs.readFileSync(citiesPath, "utf-8")
    );

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);

    const search = (req.query.search || "")
      .toLowerCase()
      .trim();

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
    const data = filteredCities.slice(start, start + limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      pages,
      data
    });

  } catch (error) {
    console.error("Get cities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load cities"
    });
  }
};

const getCityById = (req, res) => {
  try {
    const cities = JSON.parse(
      fs.readFileSync(citiesPath, "utf-8")
    );

    const city = cities.find(
      c =>
        c.cityId.toLowerCase() === req.params.cityId.toLowerCase() ||
        c.name.toLowerCase() === req.params.cityId.toLowerCase()
    );

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    res.json({
      success: true,
      data: city
    });

  } catch (error) {
    console.error("Get city error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load city"
    });
  }
};

module.exports = {
  getCities,
  getCityById
};
