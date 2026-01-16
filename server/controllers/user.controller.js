const userService = require("../services/user.service")
const asyncHandler = require("../utils/asyncHandler")
const assessmentService = require('../services/assessment.service');
const RoadmapTemplate = require('../models/RoadmapTemplate.model');

const UserController = {
  getProfile: asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.user.id)
    res.status(200).json({ user })
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const { 
      first_name, 
      last_name, 
      middle_name, 
      birthday, 
      contact_number 
    } = req.body

    const updates = {}
    if (first_name) updates.first_name = first_name
    if (last_name) updates.last_name = last_name
    if (middle_name) updates.middle_name = middle_name
    if (birthday) updates.birthday = birthday
    if (contact_number) updates.contact_number = contact_number

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" })
    }

    const updatedUser = await userService.updateUser(req.user.id, updates)
    
    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    })
  }),

  getRecommendedRoadmaps: asyncHandler(async (req, res) => {
    const userId = req.user?.user_id;
    const userSkills = await assessmentService.getUserSkills(userId);
    const tags = userSkills.map(skill => skill.skill_name);
    const bestMatch = await RoadmapTemplate.findBestMatch(tags);
    res.status(200).json({ recommendedRoadmaps: bestMatch ? [bestMatch] : [] });
  }),
}

module.exports = UserController