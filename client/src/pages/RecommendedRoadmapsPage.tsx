import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  ArrowRight,
  LayoutPanelLeft,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Tags,
} from "lucide-react";
import { Link } from "react-router-dom";

// 1. Updated Interface matching your JSON response
interface Roadmap {
  template_id: string;
  title: string;
  description: string | null; // Handle null description
  category: string;
  tags: string[];
  matchScore: number;
}

interface SkillRow {
  skill: string;
  level: "beginner" | "intermediate" | "advanced";
}

const RecommendedRoadmapsPage = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ASSESSMENT STATE ---
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentRows, setAssessmentRows] = useState<SkillRow[]>([
    { skill: "", level: "beginner" },
    { skill: "", level: "beginner" },
  ]);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Fetch Roadmaps
  const fetchRecommendedRoadmaps = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/recommended-roadmaps");

      // LOGIC UPDATE: Access response.data.data based on your provided JSON
      const roadmapData = response.data.data || [];

      setRoadmaps(roadmapData);

      // Trigger assessment if array is empty
      if (roadmapData.length === 0) {
        setShowAssessment(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedRoadmaps();
  }, []);

  // --- ASSESSMENT HANDLERS ---
  const handleRowChange = (
    index: number,
    field: keyof SkillRow,
    value: string
  ) => {
    const newRows = [...assessmentRows];
    if (field === "level") {
      newRows[index][field] = value as SkillRow["level"];
    } else {
      newRows[index][field] = value as string;
    }
    setAssessmentRows(newRows);
  };

  const addRow = () => {
    setAssessmentRows([...assessmentRows, { skill: "", level: "beginner" }]);
  };

  const removeRow = (index: number) => {
    if (assessmentRows.length > 1) {
      const newRows = assessmentRows.filter((_, i) => i !== index);
      setAssessmentRows(newRows);
    }
  };

  const submitAssessment = async () => {
    const validSkills = assessmentRows.filter((r) => r.skill.trim() !== "");
    if (validSkills.length === 0) {
      alert("Please enter at least one skill.");
      return;
    }

    setSubmittingAssessment(true);
    try {
      const response = await api.post("/assessment/quick", {
        skills: validSkills,
      });

      if (response.data.success) {
        alert(response.data.message);
        setShowAssessment(false);
        fetchRecommendedRoadmaps();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      alert("Failed to submit assessment: " + errorMessage);
    } finally {
      setSubmittingAssessment(false);
    }
  };

  if (loading && !roadmaps.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-[#0c0c0c]">
        Loading experience...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center pt-20 bg-[#0c0c0c] min-h-screen">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="relative bg-background min-h-screen">
      {/* --- MAIN CONTENT --- */}
      <div
        className={`max-w-5xl mx-auto px-6 pt-16 text-center pb-24 transition-opacity duration-500 ${
          showAssessment
            ? "opacity-20 blur-sm pointer-events-none"
            : "opacity-100"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Recommended Roadmaps
          </h1>
          <button
            onClick={() => setShowAssessment(true)}
            className="text-xs font-bold uppercase tracking-widest text-[#47a9ff] hover:text-white border border-[#47a9ff] hover:bg-[#47a9ff] hover:border-transparent px-4 py-2 rounded-lg transition-all"
          >
            Retake Assessment
          </button>
        </div>

        {roadmaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.template_id}
                className="relative bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800 text-left hover:border-gray-500 hover:bg-[#222] transition-all group overflow-hidden block flex flex-col h-full"
              >
                {/* Decorative Corner Accent */}
                <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-3xl bg-[#47a9ff] opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Header Section */}
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#47a9ff] flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                    <LayoutPanelLeft className="text-[#181818]" size={24} />
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#47a9ff] transition-colors">
                    {roadmap.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {roadmap.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] uppercase font-bold text-[#666] bg-[#222] px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {roadmap.tags.length > 3 && (
                      <span className="text-[10px] uppercase font-bold text-[#666] bg-[#222] px-2 py-1 rounded">
                        +{roadmap.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description - Handle null safely */}
                <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow">
                  {roadmap.description ||
                    "A specialized path tailored to your skill profile."}
                </p>

                <div className="mt-auto">
                  <Link
                    to={`/learn/${roadmap.template_id}`}
                    className="inline-flex items-center gap-2 text-gray-400 text-sm font-medium group-hover:text-white transition-colors"
                  >
                    Begin Journey{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-gray-500 border border-dashed border-gray-800 rounded-3xl">
            <p>No roadmaps generated yet.</p>
            <button
              onClick={() => setShowAssessment(true)}
              className="text-[#47a9ff] mt-2 hover:underline"
            >
              Start Assessment
            </button>
          </div>
        )}
      </div>

      {/* --- QUICK ASSESSMENT MODAL --- */}
      {showAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAssessment(false)}
          />

          <div className="relative w-full max-w-2xl bg-[#181818] border border-[#333] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-[#333] flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-white mb-2">
                  Skill Calibration
                </h2>
                <p className="text-[#888] text-sm">
                  Input your current stack to generate a personalized roadmap.
                </p>
              </div>
              <button
                onClick={() => setShowAssessment(false)}
                className="text-[#666] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-4">
              {assessmentRows.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <span className="text-[#444] font-black text-sm w-6 pt-3 sm:pt-0">
                    {index + 1}.
                  </span>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="e.g. React, Python"
                      value={row.skill}
                      onChange={(e) =>
                        handleRowChange(index, "skill", e.target.value)
                      }
                      className="w-full bg-[#0c0c0c] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#47a9ff] transition-colors text-sm font-bold placeholder:text-[#444]"
                    />
                  </div>

                  <div className="w-full sm:w-48">
                    <select
                      value={row.level}
                      onChange={(e) =>
                        handleRowChange(index, "level", e.target.value)
                      }
                      className="w-full bg-[#0c0c0c] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#47a9ff] transition-colors text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {assessmentRows.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="p-3 text-[#444] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addRow}
                className="mt-2 flex items-center gap-2 text-[#47a9ff] text-xs font-black uppercase tracking-widest hover:text-white transition-colors py-2"
              >
                <Plus size={16} /> Add Another Skill
              </button>
            </div>

            <div className="p-8 border-t border-[#333] bg-[#1c1c1c] flex justify-end gap-4">
              <button
                onClick={() => setShowAssessment(false)}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#666] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAssessment}
                disabled={submittingAssessment}
                className="px-8 py-3 bg-[#47a9ff] text-[#181818] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#47a9ff]/20 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {submittingAssessment ? (
                  "Analyzing..."
                ) : (
                  <>
                    Generate Roadmap <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendedRoadmapsPage;
