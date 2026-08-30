const mongoose = require("mongoose");
const ChangeRequest = require("../models/ChangeRequest");

const TouristPlace = require("../models/TouristPlace");
const Hotel = require("../models/Hotel");
const Restaurant = require("../models/Restaurant");
const Event = require("../models/Event");
const Guide = require("../models/Guide");
const Emergency = require("../models/Emergency");
const Vehicle = require("../models/Vehicle");

// ==========================================
// Resource configuration
// ==========================================

const resourceConfig = {
  Place: {
    model: TouristPlace,
    idField: "placeId",
  },

  Hotel: {
    model: Hotel,
    idField: "hotelId",
  },

  Restaurant: {
    model: Restaurant,
    idField: "restaurantId",
  },

  Event: {
    model: Event,
    idField: "eventId",
  },

  Guide: {
    model: Guide,
    idField: "guideId",
  },

  Emergency: {
    model: Emergency,
    idField: "serviceId",
  },

  Vehicle: {
    model: Vehicle,
    idField: "vehicleId",
  },
};

// ==========================================
// CREATE CHANGE REQUEST
// Authenticated user submits request
// ==========================================

const createChangeRequest = async (req, res) => {
  try {
    const {
      requestType,
      resourceType,
      resourceId,
      submittedData,
      changes,
      reason,
      evidence,
    } = req.body;

    // -----------------------------
    // User must be authenticated
    // -----------------------------

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (!requestType || !resourceType || !reason) {
      return res.status(400).json({
        success: false,
        message: "requestType, resourceType and reason are required",
      });
    }

    // -----------------------------
    // Check resource type
    // -----------------------------
    if (!["CREATE", "UPDATE", "DELETE", "REPORT"].includes(requestType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request type",
      });
    }
    if (!resourceConfig[resourceType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource type",
      });
    }

    // -----------------------------
    // Existing resource requests
    // require resourceId
    // -----------------------------

    if (requestType !== "CREATE" && !resourceId) {
      return res.status(400).json({
        success: false,
        message: "resourceId is required for this request type",
      });
    }

    // -----------------------------
    // CREATE must not have resourceId
    // -----------------------------

    if (requestType === "CREATE" && resourceId) {
      return res.status(400).json({
        success: false,
        message: "resourceId should not be provided for CREATE",
      });
    }

    // -----------------------------
    // UPDATE requires changes[]
    // -----------------------------

    if (
      requestType === "UPDATE" &&
      (!Array.isArray(changes) || changes.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "changes are required for UPDATE requests",
      });
    }

    // -----------------------------
    // CREATE requires submittedData
    // -----------------------------

    if (
      requestType === "CREATE" &&
      (!submittedData || typeof submittedData !== "object")
    ) {
      return res.status(400).json({
        success: false,
        message: "submittedData is required for CREATE requests",
      });
    }

    // -----------------------------
    // Generate request ID
    // -----------------------------

    const requestId =
      "CR-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    // -----------------------------
    // Create request
    // -----------------------------

    const changeRequest = await ChangeRequest.create({
      requestId,

      // IMPORTANT:
      // Taken from JWT, NOT req.body
      submittedBy: req.user._id,

      requestType,

      resourceType,

      resourceId: resourceId || null,

      submittedData: submittedData || null,

      changes: changes || [],

      reason,

      evidence: evidence || [],
    });

    res.status(201).json({
      success: true,

      message: "Change request submitted successfully",

      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: "Failed to submit change request",

      error: error.message,
    });
  }
};

// ==========================================
// GET CHANGE REQUESTS
// Admin views requests
// ==========================================

const getChangeRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    // Optional status filter

    if (status) {
      if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      filter.status = status;
    }

    const requests = await ChangeRequest.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch change requests",

      error: error.message,
    });
  }
};

// ==========================================
// REJECT CHANGE REQUEST
// ==========================================

const rejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid change request ID",
      });
    }

    const { adminNote } = req.body;

    if (
      adminNote !== undefined &&
      adminNote !== null &&
      typeof adminNote !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "adminNote must be a string",
      });
    }

    const cleanAdminNote =
      typeof adminNote === "string" ? adminNote.trim() : "";

    const request = await ChangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    // Already reviewed

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    request.status = "Rejected";

    request.adminNote = cleanAdminNote || "Request rejected by admin";

    request.reviewedAt = new Date();

    await request.save();

    res.status(200).json({
      success: true,
      message: "Change request rejected",

      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject change request",

      error: error.message,
    });
  }
};

// ==========================================
// APPROVE CHANGE REQUEST
// ==========================================

const approveChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid change request ID",
      });
    }

    // -----------------------------
    // Find request
    // -----------------------------

    const request = await ChangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    // -----------------------------
    // Only Pending can be approved
    // -----------------------------

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    // -----------------------------
    // Get correct model
    // -----------------------------

    const config = resourceConfig[request.resourceType];

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource type",
      });
    }

    const Model = config.model;

    const idField = config.idField;

    // =====================================
    // CREATE
    // =====================================

    if (request.requestType === "CREATE") {
      if (request.resourceId) {
        return res.status(400).json({
          success: false,
          message: "CREATE request must not contain resourceId",
        });
      }

      if (!request.submittedData || typeof request.submittedData !== "object") {
        return res.status(400).json({
          success: false,
          message: "submittedData is required for CREATE",
        });
      }

      await Model.create(request.submittedData);
    }

    // =====================================
    // UPDATE
    // =====================================
    else if (request.requestType === "UPDATE") {
      if (!request.resourceId) {
        return res.status(400).json({
          success: false,
          message: "resourceId is required for UPDATE",
        });
      }

      if (!Array.isArray(request.changes) || request.changes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No changes provided",
        });
      }

      // -----------------------------
      // Find current document
      // -----------------------------

      const currentDocument = await Model.findOne({
        [idField]: request.resourceId,
      });

      if (!currentDocument) {
        return res.status(404).json({
          success: false,
          message: "Target resource not found",
        });
      }

      const updates = {};

      // -----------------------------
      // Check every change
      // -----------------------------

      for (const change of request.changes) {
        if (!change.field) {
          return res.status(400).json({
            success: false,
            message: "Change field is required",
          });
        }

        const currentValue = currentDocument[change.field];

        // Check old value
        if (JSON.stringify(currentValue) !== JSON.stringify(change.oldValue)) {
          return res.status(409).json({
            success: false,

            message: `Current value of '${change.field}' does not match oldValue`,

            field: change.field,

            currentValue: currentValue,

            requestedOldValue: change.oldValue,
          });
        }

        updates[change.field] = change.newValue;
      }

      // -----------------------------
      // Apply changes
      // -----------------------------

      const updated = await Model.findOneAndUpdate(
        {
          [idField]: request.resourceId,
        },

        {
          $set: updates,
        },

        {
          new: true,
          runValidators: true,
        },
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Target resource not found",
        });
      }
    }

    // =====================================
    // DELETE
    // =====================================
    else if (request.requestType === "DELETE") {
      if (!request.resourceId) {
        return res.status(400).json({
          success: false,
          message: "resourceId is required for DELETE",
        });
      }

      const deleted = await Model.findOneAndUpdate(
        {
          [idField]: request.resourceId,
        },

        {
          $set: {
            available: false,
          },
        },

        {
          new: true,
        },
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Target resource not found",
        });
      }
    }

    // =====================================
    // REPORT
    // =====================================
    else if (request.requestType === "REPORT") {
      // REPORT does not directly
      // modify the database.
    }

    // =====================================
    // Invalid request type
    // =====================================
    else {
      return res.status(400).json({
        success: false,
        message: "Unsupported request type",
      });
    }

    // =====================================
    // Mark as Approved
    // =====================================

    request.status = "Approved";

    request.reviewedAt = new Date();

    await request.save();

    res.status(200).json({
      success: true,

      message: "Change request approved successfully",

      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: "Failed to approve change request",

      error: error.message,
    });
  }
};

// ==========================================
// GET MY CHANGE REQUESTS
// Authenticated user views only their requests
// ==========================================

const getMyChangeRequests = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { status } = req.query;

    const filter = {
      submittedBy: req.user._id,
    };

    if (status) {
      if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      filter.status = status;
    }

    const requests = await ChangeRequest.find(filter)
      .populate("submittedBy", "username email fullName avatar")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error(
      "[ChangeRequest] Failed to fetch user's requests:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch your change requests",
      error: error.message,
    });
  }
};





// ==========================================
// GET MY CHANGE REQUEST BY ID
// Authenticated user can view only their own
// ==========================================

const getMyChangeRequestById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const request = await ChangeRequest.findOne({
      _id: req.params.id,
      submittedBy: req.user._id
    }).populate(
      "submittedBy",
      "username email fullName avatar"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Change request not found"
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error(
      "[ChangeRequest] Failed to fetch user's request:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch change request",
      error: error.message
    });
  }
};



// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createChangeRequest,
  getChangeRequests,
  getMyChangeRequests,
  getMyChangeRequestById,
  approveChangeRequest,
  rejectChangeRequest
};
