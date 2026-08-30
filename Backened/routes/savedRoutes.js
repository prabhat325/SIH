const express = require("express");

const router = express.Router();

const {
    saveResource,
    getSavedResources,
    unsaveResource
} = require("../controllers/savedController");

const {
    verifyJWT
} = require("../middleware/authMiddleware");


// ==========================================
// GET SAVED RESOURCES
// ==========================================

router.get(
    "/",
    verifyJWT,
    getSavedResources
);


// ==========================================
// SAVE RESOURCE
// ==========================================

router.post(
    "/",
    verifyJWT,
    saveResource
);


// ==========================================
// UNSAVE RESOURCE
// ==========================================

router.delete(
    "/:resourceType/:resourceId",
    verifyJWT,
    unsaveResource
);


module.exports = router;
