const lessonsService = require("../services/lessons.service");
const asyncHandler = require("../utils/asyncHandler");

const LessonsController = {
  getLessonsByModule: asyncHandler(async (req, res) => {
    // NOTE: 'moduleId' in route param here likely refers to 'user_roadmap_id' 
    // based on how your frontend groups things, or if you are fetching details for one specific module.
    // If fetching details for one lesson (module):
    const lesson = await lessonsService.getLessonById(req.params.moduleId);
    res.json({ lesson });
  }),

  getLessonById: asyncHandler(async (req, res) => {
    const lesson = await lessonsService.getLessonById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ lesson });
  }),

  getNextLesson: asyncHandler(async (req, res) => {
    const lesson = await lessonsService.getNextLesson(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "No next lesson found" });
    res.json({ lesson });
  }),

  markLessonComplete: asyncHandler(async (req, res) => {
    const { selfRating, notes } = req.body;
    const progress = await lessonsService.markComplete(req.params.lessonId, { selfRating, notes });
    res.json({ progress });
  })
};

module.exports = LessonsController;