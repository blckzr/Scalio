import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, ChevronRight, Hash } from "lucide-react";

const LessonPage = () => {
  const { courseId } = useParams();
  
  // 1. Generate generic lessons dynamically
  const [lessons, setLessons] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Lesson ${String(i + 1).padStart(2, '0')}`,
      description: `Core concepts and practical application for module ${i + 1}`,
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

  // Calculate Progress
  const progress = Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] text-white bg-[#0a0a0a]">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-80 border-r border-zinc-800 p-6 flex flex-col gap-8 bg-[#0d0d0d]">
        <div>
          <Link 
            to={`/learn/${courseId}`} 
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Journey
          </Link>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-zinc-500">Course Progress</span>
              <span className="text-blue-500">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setActiveIndex(index)}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all text-left group ${
                activeIndex === index 
                ? "bg-zinc-900 text-white border border-zinc-800" 
                : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                activeIndex === index ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-600 group-hover:bg-zinc-700"
              }`}>
                <Hash size={14} />
              </div>
              <span className="font-medium">{lesson.name}</span>
              {lesson.completed && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 md:p-16 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <span className="px-3 py-1 bg-zinc-900 text-[10px] font-bold text-zinc-500 rounded border border-zinc-800 uppercase tracking-tighter">
            Module {currentLesson.id}
          </span>
          <div className="h-1 w-1 bg-zinc-700 rounded-full" />
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            Topic Overview
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-3 tracking-tight">{currentLesson.name}</h1>
        <p className="text-zinc-500 text-lg mb-10">{currentLesson.description}</p>

        <button 
          onClick={toggleComplete}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all mb-16 border shadow-lg ${
            currentLesson.completed 
            ? "bg-emerald-500/5 border-emerald-500/50 text-emerald-500" 
            : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-blue-600/10"
          }`}
        >
          <CheckCircle size={18} />
          {currentLesson.completed ? "Marked as Finished" : "Complete Lesson"}
        </button>

        <article className="prose prose-invert max-w-none space-y-8 text-zinc-400">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Objective</h3>
            <p className="leading-relaxed">
              In this lesson, we will cover the fundamental concepts of {currentLesson.name.toLowerCase()}. 
              The goal is to provide a comprehensive understanding of the workflow and best practices associated 
              with this specific stage of the roadmap.
            </p>
          </div>
          
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <h4 className="text-white font-bold mb-3">Key Resources</h4>
            <ul className="space-y-3">
              {['Documentation Link', 'Resource Guide', 'External Video'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 cursor-pointer text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Dynamic Footer Navigation */}
        <div className="mt-24 pt-10 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-8">
          {activeIndex < lessons.length - 1 ? (
            <>
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-2">Up Next</p>
                <p className="text-2xl font-bold text-white">{lessons[activeIndex + 1].name}</p>
              </div>
              <button 
                onClick={() => setActiveIndex(activeIndex + 1)}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all group"
              >
                Continue <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <div className="w-full p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl text-center">
              <p className="text-blue-400 font-bold italic">Congratulations! You've completed all lessons in this module.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonPage;