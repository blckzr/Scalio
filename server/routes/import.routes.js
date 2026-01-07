const express = require("express");
const router = express.Router();
const importController = require("../controllers/import.controller");
const { body } = require("express-validator");
const { requireAdmin } = require("../middleware/adminAuth");

// Validation for roadmap import
const validateRoadmapImport = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3-200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description max 1000 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["frontend", "backend", "fullstack", "devops", "data-science", "mobile", "cybersecurity", "ai-ml"])
    .withMessage("Invalid category (must be: frontend, backend, fullstack, devops, data-science, mobile, cybersecurity, or ai-ml)"),

  body("roadmap_data")
    .notEmpty()
    .withMessage("Roadmap data is required")
    .isObject()
    .withMessage("Roadmap data must be a valid JSON object")
    .custom((value) => {
      // Validate that it has nodes and edges arrays
      if (!value.nodes || !Array.isArray(value.nodes)) {
        throw new Error('roadmap_data must have a "nodes" array');
      }
      if (!value.edges || !Array.isArray(value.edges)) {
        throw new Error('roadmap_data must have an "edges" array');
      }
      return true;
    }),

  body("source_type")
    .optional()
    .isIn([
      // Level 1: Official Documentation Sources
      "roadmap.sh",
      "microsoft-learn",
      "google-developers",
      "mozilla-mdn",
      "meta-react",
      "freecodecamp",
      "tesda-digital",
      // Admin/Other
      "custom",
      "imported"
    ])
    .withMessage("Invalid source_type"),

  body("source_url")
    .optional()
    .isURL()
    .withMessage("Invalid source URL"),
];

// All import routes require admin authentication
router.post("/roadmap", requireAdmin, validateRoadmapImport, importController.importRoadmap);

router.post("/validate", requireAdmin, importController.validateRoadmap);

router.get("/history", requireAdmin, importController.getImportHistory);

module.exports = router;
