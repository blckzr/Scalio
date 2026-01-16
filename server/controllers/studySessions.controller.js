const studySessionService = require("../services/studySessions.service");
const asyncHandler = require("../utils/asyncHandler");

const StudySessionsController = {
  createStudySession: asyncHandler(async (req, res) => {
    const { milestoneId, resourceId, durationMinutes, selfRating, technique, notes } = req.body;
    
    if (!durationMinutes) {
      return res.status(400).json({ message: "Duration is required" });
    }

    const session = await studySessionService.logSession(req.user.id, {
      milestoneId,
      resourceId,
      duration: durationMinutes,
      rating: selfRating,
      technique,
      notes
    });

    res.status(201).json({ session });
  }),

  getUserStudySessions: asyncHandler(async (req, res) => {
    const sessions = await studySessionService.getUserHistory(req.user.id);
    res.json({ sessions });
  }),

  getStudyStats: asyncHandler(async (req, res) => {
    const stats = await studySessionService.getStats(req.user.id);
    res.json(stats);
  }),

  getLessonStudyHistory: asyncHandler(async (req, res) => {
    const { supabase } = require("../config/database");
    // Just for specific lesson history, simple enough to keep inline or move to service
    const { data } = await supabase
      .from("Study_Sessions")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("milestone_id", req.params.milestoneId)
      .order("start_time", { ascending: false });
    res.json({ sessions: data });
  })
};

module.exports = StudySessionsController;