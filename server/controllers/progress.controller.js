const progressService = require("../services/progress.service");
const lessonsService = require("../services/lessons.service");
const asyncHandler = require("../utils/asyncHandler");

const ProgressController = {
  getUserProgress: asyncHandler(async (req, res) => {
    const progress = await progressService.getUserProgress(req.user.id);
    res.json({ progress });
  }),

  getPathProgress: asyncHandler(async (req, res) => {
    const stats = await progressService.getPathProgress(req.user.id, req.params.pathId);
    res.json(stats);
  }),

  getModuleProgress: asyncHandler(async (req, res) => {
    const lesson = await lessonsService.getLessonById(req.params.moduleId);
    res.json({
      moduleId: lesson.module_id,
      status: lesson.status,
      timeSpentMinutes: lesson.time_spent_minutes || 0
    });
  })
};

module.exports = ProgressController;