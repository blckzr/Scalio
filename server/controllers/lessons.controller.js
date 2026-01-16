const { successResponse, errorResponse } = require("../utils/responseFormatter");
const asyncHandler = require("../utils/asyncHandler");
const LessonsService = require('../services/lessons.service');
const lessonsService = new LessonsService();

const LessonsController = {

  // 1. GET LIST (Table of Contents)
  // GET /api/lessons/roadmap/:roadmapId
  getRoadmapLessons: asyncHandler(async (req, res) => {
    const { roadmapId } = req.params;
    
    if (!roadmapId) {
      return errorResponse(res, "Roadmap ID is required", 400);
    }

    const lessons = await lessonsService.getLessonsByRoadmap(roadmapId);

    return res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons 
    });
  }),

  // 2. GET CONTENT (Video/Description)
  // GET /api/lessons/:lessonId
  getLessonById: asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    const lesson = await lessonsService.getLessonById(lessonId);

    if (!lesson) {
      return errorResponse(res, "Lesson not found", 404);
    }

    const nextLesson = await lessonsService.getNextLesson(lessonId);

    return res.status(200).json({
      success: true,
      data: {
          ...lesson,
          next_lesson_id: nextLesson?.module_id || null
      }
    });
  }),

};

module.exports = LessonsController;