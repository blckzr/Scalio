const express = require("express");
const router = express.Router();
const PathsController = require("../controllers/paths.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", PathsController.getAllPaths);
router.get("/:pathId", PathsController.getPathById);
router.get("/:pathId/modules", PathsController.getModulesByPath);
router.post("/:pathId/enroll", authMiddleware, PathsController.enrollPath);
router.get("/user/enrolled", authMiddleware, PathsController.getUserPaths);

module.exports = router;