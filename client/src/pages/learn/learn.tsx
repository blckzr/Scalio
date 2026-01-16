import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, ChevronRight, Hash, BookOpen, ExternalLink, Trophy } from "lucide-react";

const LessonPage = () => {
  const { courseId } = useParams();

  // 1. Lesson Data
  const [lessons, setLessons] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Module ${String(i + 1).padStart(2, '0')}: Technical Mastery`,
      description: `Deep dive into the architecture and execution of stage ${i + 1}.`,
      completed: false,
    }))
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const currentLesson = lessons[activeIndex];

  // Logic to toggle completion
  const toggleComplete = () => {
    const updated = [...lessons];
    updated[activeIndex].completed = !updated[activeIndex].completed;
    setLessons(updated);
  };

  const progress = Math.round((lessons.filter((l) => l.completed).length / lessons.length) * 100);

  return (
    // Updated Background: Deep Zinc/Black for a professional dark look
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b]">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-80 border-r border-zinc-800 bg-[#0c0c0e] sticky top-0 h-screen p-6 flex flex-col gap-6">
        <div>
          <Link
            to={`/dashboard`}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Exit Course
          </Link>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Progress</span>
              <span className="text-sm font-bold text-blue-500">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setActiveIndex(index)}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all text-left ${
                activeIndex === index
                  ? "bg-zinc-800 text-white ring-1 ring-zinc-700"
                  : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeIndex === index ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-600"}`}>
                <Hash size={14} />
              </div>
              <span className="font-semibold truncate">{lesson.name}</span>
              {lesson.completed && <CheckCircle size={14} className="text-emerald-500 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-16 max-w-5xl mx-auto w-full text-zinc-300">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded uppercase tracking-widest">
            Module {currentLesson.id}
          </span>
          <div className="h-1 w-1 bg-zinc-700 rounded-full" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {courseId?.replace('-', ' ')}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          {currentLesson.name}
        </h1>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
          {currentLesson.description}
        </p>

        <button
          onClick={toggleComplete}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all mb-12 border ${
            currentLesson.completed
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
          }`}
        >
          <CheckCircle size={18} />
          {currentLesson.completed ? "Module Completed" : "Mark as Finished"}
        </button>

        {/* Content Card */}
        <article className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" />
              Learning Objectives
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              In this session, we break down the core mechanics of {currentLesson.name.toLowerCase()}. 
              We will explore the implementation details required to meet industry standards and ensure 
              your workflow remains scalable and efficient.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <h4 className="font-bold text-zinc-200 mb-4 text-sm uppercase tracking-wider">Required Setup</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li className="flex items-center gap-2">• Terminal Configuration</li>
                <li className="flex items-center gap-2">• Dependency Management</li>
                <li className="flex items-center gap-2">• Module Integration</li>
              </ul>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <h4 className="font-bold text-zinc-200 mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <div className="space-y-3">
                {["Technical Overview", "Project Files", "Community Notes"].map((item, i) => (
                  <button key={i} className="flex items-center justify-between w-full text-sm text-blue-500 hover:text-blue-400 transition-colors">
                    {item} <ExternalLink size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* --- NAVIGATION FOOTER --- */}
        <div className="mt-16 pt-10 border-t border-zinc-800">
          {activeIndex < lessons.length - 1 ? (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-[#0c0c0e] p-8 rounded-3xl border border-zinc-800 shadow-xl">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Next Step</p>
                <p className="text-xl font-bold text-white">{lessons[activeIndex + 1].name}</p>
              </div>
              <button
                onClick={() => setActiveIndex(activeIndex + 1)}
                className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all group"
              >
                Next Module
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            // Final Completion State
            <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <Trophy size={48} className="text-blue-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-4 text-white">Course Accomplished!</h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                You have successfully navigated through all technical requirements. Your credential has been generated.
              </p>
              
              {progress === 100 ? (
                <Link
                  to={`/certificate/${courseId}`}
                  className="inline-flex items-center gap-3 bg-blue-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/40 active:scale-95"
                >
                  View Certificate
                </Link>
              ) : (
                <p className="text-sm font-bold text-amber-500 bg-amber-500/10 px-6 py-3 rounded-xl border border-amber-500/20 inline-block">
                  Please complete all modules to unlock your certificate.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonPage;