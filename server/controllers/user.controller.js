const userService = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");
const assessmentService = require('../services/assessment.service');
const RoadmapTemplate = require('../models/RoadmapTemplate.model');

const UserController = {
  
  // 1. Get User Profile
  getProfile: asyncHandler(async (req, res) => {
    // Handle both potential auth middleware structures
    const userId = req.user.id || req.user.user_id; 
    const user = await userService.getUserById(userId);
    res.status(200).json({ user });
  }),

  // 2. Update User Profile
  updateProfile: asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user.user_id;
    const updates = req.body; 

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const updatedUser = await userService.updateUser(userId, updates);
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  }),

  // 3. Get Recommended Roadmaps (LIGHTWEIGHT LIST)
  // This serves the "Cards" on the dashboard.
  // It MUST NOT return the huge 'roadmap_data' JSON.
  getRecommendedRoadmaps: asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?.user_id;
    
    // A. Fetch Skills
    const userSkills = await assessmentService.getUserSkills(userId);
    
    // B. Extract Tags
    let skillTags = [];
    if (userSkills && Array.isArray(userSkills)) {
        skillTags = userSkills
            .map(us => us.skill_name)
            .filter(name => name && name !== 'Unknown Skill');
    }

    let roadmaps = [];

    // C. Match Logic
    if (skillTags.length > 0) {
        // Calls the optimized model method (excludes roadmap_data)
        roadmaps = await RoadmapTemplate.findBestMatch(skillTags);
    }

    // D. Fallback Logic (If no skills or 0 matches)
    if (!roadmaps || roadmaps.length === 0) {
       // 1. Try 'beginner' category
       roadmaps = await RoadmapTemplate.findByCategory('beginner');
       
       // 2. If still nothing, get latest 5
       if (!roadmaps || roadmaps.length === 0) {
          roadmaps = await RoadmapTemplate.findAll({ limit: 5 }); 
       }
    }

    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps 
    });
  }),

  // 4. Get Single Roadmap Detail (HEAVY DATA)
  // This serves the "Graph/Chart" view.
  // Call this ONLY when the user clicks a specific roadmap card.
  getRoadmapDetail: asyncHandler(async (req, res) => {
    const { templateId } = req.params; 

    if (!templateId) {
        return res.status(400).json({ success: false, message: "Template ID is required" });
    }

    // Calls findById, which intentionally includes 'roadmap_data'
    const roadmap = await RoadmapTemplate.findById(templateId);

    if (!roadmap) {
        return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    res.status(200).json({
        success: true,
        data: roadmap
    });
  }),

};

module.exports = UserController;