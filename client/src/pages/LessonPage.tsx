import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, ChevronRight, Hash } from "lucide-react";

const LessonPage = () => {
  const { courseId } = useParams();
  const [isCompleted, setIsCompleted] = useState(false);

  const lessons = [
    { id: 1, name: "Lesson Name", active: true },
    { id: 2, name: "Lesson Name", active: false },
    { id: 3, name: "Lesson Name", active: false },
    { id: 4, name: "Lesson Name", active: false },
    { id: 5, name: "Lesson Name", active: false },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] text-white bg-[#0a0a0a]">
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-full md:w-80 border-r border-gray-800 p-6 flex flex-col gap-8 bg-[#0d0d0d]">
        <div>
          <Link 
            to={`/learn/${courseId}`} 
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Journey
          </Link>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>Progress</span>
              <span className="text-blue-400">20%</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[20%]" />
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left ${
                lesson.active 
                ? "bg-[#1a1a1a] text-white border border-gray-700 shadow-lg" 
                : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <div className={`p-1 rounded ${lesson.active ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-600"}`}>
                <Hash size={14} />
              </div>
              {lesson.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 md:p-16 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="px-3 py-1 bg-[#1a1a1a] text-[10px] font-bold text-gray-400 rounded-md border border-gray-800 uppercase">
            In Progress
          </span>
          <span className="px-3 py-1 text-[10px] font-bold text-blue-400 uppercase">
            Beginner
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-2">Lesson Name</h1>
        <p className="text-gray-500 mb-8 font-medium">Lesson Description</p>

        <button 
          onClick={() => setIsCompleted(!isCompleted)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all mb-12 border ${
            isCompleted 
            ? "bg-green-500/10 border-green-500 text-green-500" 
            : "bg-blue-500 border-blue-500 text-white hover:bg-blue-400"
          }`}
        >
          <CheckCircle size={18} />
          {isCompleted ? "Completed" : "Mark as Done"}
        </button>

        <section className="space-y-6 text-gray-300 leading-relaxed">
          <h2 className="text-xl font-bold text-white">Lesson Header</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
          </p>
        </section>

        <section className="mt-10">
          <h3 className="font-bold text-white mb-4">Video Link:</h3>
          <ul className="space-y-2">
            {['link', 'link', 'link'].map((link, i) => (
              <li key={i} className="flex items-center gap-2 text-blue-400 hover:underline cursor-pointer">
                • {link}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-20 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Next Stop</p>
            <p className="text-xl font-bold text-blue-400">Lesson Name</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group">
            Next Module <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;