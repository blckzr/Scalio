const { successResponse, errorResponse } = require("../utils/responseFormatter");
const asyncHandler = require("../utils/asyncHandler");
const { supabaseAdmin } = require('../config/database');
//const { v4: uuidv4 } = require('uuid');

const LessonsController = {

  /**
   * GET /api/lessons/:lessonId
   * Fetches lesson details AND checks the 'user_progress' table for status.
   */
  getLessonById: asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id; 

    try {
      // 1. Fetch the Lesson Content
      const { data: lesson, error: lessonError } = await supabaseAdmin
        .from('learning_resources')
        .select('id, title, description, url, duration_minutes, resource_type, difficulty_level')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lesson) {
        return errorResponse(res, "Lesson resource not found", 404);
      }

      // 2. Fetch User Progress
      const { data: progress } = await supabaseAdmin
        .from('user_progress')
        .select('progress_type, completion_percentage')
        .eq('user_id', userId)
        .eq('resource_id', lessonId)
        .maybeSingle();

      // 3. Determine Status Logic
      let currentStatus = "Not_started";

      if (progress) {
        if (progress.progress_type === 'resource_completed') {
            currentStatus = "Completed";
        } else if (progress.progress_type === 'learning_session') {
            currentStatus = "Ongoing";
        }
      }

      // 4. Format Response for Frontend
      const formattedResponse = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || `Master the concepts of ${lesson.title}`,
        status: currentStatus, 
        content: lesson.url,
        duration: `${lesson.duration_minutes || 10} min`,
        difficulty: lesson.difficulty_level,
        progress_percent: progress?.completion_percentage || 0
      };

      return res.status(200).json(formattedResponse);

    } catch (error) {
      console.error("Get Lesson Error:", error);
      return errorResponse(res, error.message, 500);
    }
  }),

  /*
   * PATCH /api/lessons/:lessonId/complete
   * Marks a lesson as done using the allowed 'resource_completed' type.
   */
  /*
  markLessonComplete: asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { notes, time_spent } = req.body;

    // 1. Upsert user progress record
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .upsert({ 
        id: uuidv4(), // Generate a unique ID for the potential new row
        user_id: userId, 
        resource_id: lessonId, 
        progress_type: 'resource_completed', 
        completion_percentage: 100,
        status: 'completed',
        notes: notes || null,
        time_spent_minutes: time_spent || 15,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id, resource_id', // This matches your SQL constraint
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
        console.error("Mark Complete Error:", error);
        return errorResponse(res, "Failed to update progress", 500);
    }

    // 2. Fetch lesson details again for the UI response
    const { data: lesson } = await supabaseAdmin
        .from('learning_resources')
        .select('title, description, url')
        .eq('id', lessonId)
        .single();

    // 3. Return success response
    return res.status(200).json({
        title: lesson ? lesson.title : "Lesson Completed",
        description: lesson ? lesson.description : "",
        status: "Completed",
        content: lesson ? lesson.url : ""
    });
  })
  */
};

module.exports = LessonsController;