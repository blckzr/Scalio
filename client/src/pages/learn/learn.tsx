import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Sparkles,
  Loader2,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

// --- MOCK SERVICE (Simulating the Gemini Service) ---
const getTopicExplanation = async (topic: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(
        `**Pro-Tip: Architectural Pattern**\nWhen implementing ${topic}, prioritize immutability in your state management to prevent race conditions.\n\nThis module focuses on the synchronous execution flow. Ensure your error handling middleware is initialized before the main execution block.`
      );
    }, 1500);
  });
};

const LessonPage = () => {
  const { courseId } = useParams();
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Lesson Data
  const [lessons, setLessons] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Module ${String(i + 1).padStart(2, "0")}: Technical Mastery`,
      description: `Deep dive into the architecture and execution of stage ${
        i + 1
      }.`,
      completed: false,
    }))
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const currentLesson = lessons[activeIndex];

  // Logic to toggle completion
  const toggleComplete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = [...lessons];
    updated[activeIndex].completed = !updated[activeIndex].completed;
    setLessons(updated);
  };

  const progress = Math.round(
    (lessons.filter((l) => l.completed).length / lessons.length) * 100
  );

  // Simulate AI Fetching when changing lessons
  useEffect(() => {
    const fetchAi = async () => {
      setLoadingAi(true);
      setAiInsight(null);
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }

      const insight = await getTopicExplanation(currentLesson.name);
      setAiInsight(insight);
      setLoadingAi(false);
    };

    fetchAi();
  }, [activeIndex, currentLesson.name]);

  const isComplete = progress === 100;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-[#888]">
      {/* --- SIDEBAR (Mission Log) --- */}
      <aside className="w-80 border-r border-[#333] flex-col bg-background hidden md:flex">
        <div className="p-8 border-b border-[#333]">
          <Link
            to="/dashboard"
            className="flex items-center text-[10px] text-[#555] hover:text-primary transition-colors mb-8 uppercase tracking-widest font-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journey
          </Link>

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">
              Mission Progress
            </span>
            <span className="text-[10px] font-black text-primary">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 shadow-[0_0_10px_rgba(71,169,255,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <nav className="grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setActiveIndex(index)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group
                ${
                  activeIndex === index
                    ? "bg-primary/5 border border-primary/30 text-primary"
                    : "hover:bg-[#222] border border-transparent text-[#555]"
                }`}
            >
              <div
                className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black
                ${
                  lesson.completed
                    ? "bg-emerald-500 text-background"
                    : activeIndex === index
                    ? "bg-primary text-background"
                    : "bg-[#222] text-[#444] group-hover:text-[#ccc]"
                }`}
              >
                {lesson.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  lesson.id
                )}
              </div>
              <span
                className={`text-xs font-bold truncate ${
                  activeIndex === index ? "text-white" : ""
                }`}
              >
                {lesson.name}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN FOCUS AREA --- */}
      <main
        ref={contentRef}
        className="grow overflow-y-auto bg-background custom-scrollbar relative"
      >
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-20">
          {/* Header Section */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <span
                className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                  currentLesson.completed
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-[#222] border-[#333] text-[#444]"
                }`}
              >
                {currentLesson.completed
                  ? "Status: Optimized"
                  : "Status: In Progress"}
              </span>
              <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">
                {courseId?.replace("-", " ")}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              {currentLesson.name}
            </h1>
            <p className="text-[#888] text-lg md:text-xl max-w-2xl leading-relaxed">
              {currentLesson.description}
            </p>

            <div className="mt-12 flex gap-4">
              <button
                onClick={toggleComplete}
                className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm uppercase tracking-wider
                  ${
                    currentLesson.completed
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "bg-primary text-background hover:bg-[#3d93e0] shadow-[0_0_20px_rgba(71,169,255,0.3)]"
                  }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {currentLesson.completed
                  ? "Protocol Verified"
                  : "Mark Complete"}
              </button>
            </div>
          </header>

          {/* AI Insight Section (Focus Mode Feature) */}
          {loadingAi ? (
            <div className="py-20 flex flex-col items-center justify-center gap-6 border-t border-[#222]">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em]">
                Consulting AI Mentor
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 mb-16">
              <div className="p-8 md:p-10 bg-[#1c1c1c] rounded-[2.5rem] border border-[#333] relative overflow-hidden group hover:border-primary/20 transition-colors">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-5 mb-8 relative z-10">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-background shadow-lg shadow-primary/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      AI Mastery Intel
                    </h3>
                    <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">
                      Contextual Analysis
                    </p>
                  </div>
                </div>

                <div className="text-[#ccc] whitespace-pre-wrap leading-loose text-base relative z-10">
                  {aiInsight?.split("\n\n").map((block, i) => {
                    if (block.toLowerCase().includes("pro-tip")) {
                      return (
                        <div
                          key={i}
                          className="my-6 bg-primary/5 p-6 rounded-2xl border border-primary/10 flex gap-4 items-start"
                        >
                          <Lightbulb className="w-6 h-6 text-primary shrink-0 mt-1" />
                          <div className="text-white font-bold leading-relaxed text-sm">
                            {block.replace(
                              "**Pro-Tip: Architectural Pattern**",
                              ""
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="mb-4">
                        {block}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-16 pt-10 border-t border-[#222]">
            {activeIndex < lessons.length - 1 ? (
              <div
                onClick={() => setActiveIndex(activeIndex + 1)}
                className="cursor-pointer group flex flex-col sm:flex-row justify-between items-center gap-6 bg-[#1c1c1c] p-8 rounded-3xl border border-[#333] hover:border-primary/50 transition-all"
              >
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-[#555] uppercase font-black tracking-widest mb-2 group-hover:text-primary transition-colors">
                    Next Objective
                  </p>
                  <p className="text-xl font-bold text-white">
                    {lessons[activeIndex + 1].name}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center text-[#444] group-hover:bg-primary group-hover:text-background transition-all">
                  <ChevronRight size={24} />
                </div>
              </div>
            ) : (
              <div className="bg-[#1c1c1c] border border-[#333] p-12 rounded-[2.5rem] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-emerald-500" />
                <Trophy size={48} className="text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-black mb-4 text-white">
                  Mission Complete
                </h2>
                <p className="text-[#666] mb-8 max-w-md mx-auto">
                  All technical requirements met. Credential generation standing
                  by.
                </p>

                {isComplete ? (
                  <button className="inline-flex items-center gap-3 bg-primary text-background px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20">
                    <ShieldCheck size={18} /> View Certificate
                  </button>
                ) : (
                  <p className="text-xs font-bold text-[#555] bg-[#222] px-6 py-3 rounded-xl border border-[#333] inline-block uppercase tracking-widest">
                    Complete all modules to unlock certificate
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
