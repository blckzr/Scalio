const pathsService = require("../services/paths.service");
const asyncHandler = require("../utils/asyncHandler");

const PathsController = {
  getAllPaths: asyncHandler(async (req, res) => {
    const paths = await pathsService.getAllPaths();
    res.json({ paths });
  }),

  getPathById: asyncHandler(async (req, res) => {
    const { path, modules } = await pathsService.getPathById(req.params.pathId);
    if (!path) return res.status(404).json({ message: "Path not found" });
    res.json({ path, modules });
  }),

  getModulesByPath: asyncHandler(async (req, res) => {
    // Reusing the getPathById service since it fetches modules too
    const { modules } = await pathsService.getPathById(req.params.pathId);
    res.json({ modules });
  }),

  enrollPath: asyncHandler(async (req, res) => {
    try {
      const enrollment = await pathsService.enrollPath(req.user.id, req.params.pathId);
      res.status(201).json({ enrollment });
    } catch (error) {
      if (error.message.includes("Already enrolled")) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  }),

  getUserPaths: asyncHandler(async (req, res) => {
    // Reusing progress service to list paths is common, or add to paths service
    // For now, let's stick to the service pattern strictly
    // Assuming you add getUserPaths to pathsService or use progressService.getUserProgress
    const { supabase } = require("../config/supabase");
    const { data } = await supabase
      .from("user_roadmaps")
      .select("user_roadmap_id, template_id, status, progress_percentage, started_at, roadmap_templates(title, category)")
      .eq("user_id", req.user.id);
    res.json({ paths: data });
  })
};

module.exports = PathsController;