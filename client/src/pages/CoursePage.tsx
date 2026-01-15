import { ArrowLeft, CheckCircle2, Play, Trophy, Target, Zap, Award } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const CoursePage = () => {
  const { courseId } = useParams();

  const courseTitle = courseId
    ? courseId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Course";

  const modules = [
    {
      id: "foundations",
      title: "Foundations",
      moduleNum: 1,
      level: "Beginner",
      icon: <Target size={20} className="text-blue-400" />,
      lessons: [
        { id: "1", name: "Lesson Name", desc: "Lesson Description", time: "1 hour", completed: true },
        { id: "2", name: "Lesson Name", desc: "Lesson Description", time: "1 hour", completed: false },
      ],
    },
    {
      id: "specialization",
      title: "Specialization",
      moduleNum: 2,
      level: "Intermediate",
      icon: <Zap size={20} className="text-blue-400" />,
      lessons: [
        { id: "3", name: "Lesson Name", desc: "Lesson Description", time: "1 hour", completed: false },
        { id: "4", name: "Lesson Name", desc: "Lesson Description", time: "1 hour", completed: false },
      ],
    },
    {
      id: "mastery",
      title: "Mastery",
      moduleNum: 3,
      level: "Advanced",
      icon: <Award size={20} className="text-blue-400" />,
      lessons: [
        { id: "5", name: "Lesson Name", desc: "Lesson Description", time: "1 hour", completed: false },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-24 text-white">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link to="/learn" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{courseTitle}</h1>
            <p className="text-gray-400 text-sm">5 modules</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <StatCard label="Completed" value="1" icon={<CheckCircle2 size={16} className="text-green-400" />} />
          <StatCard label="Time Spent" value="1h" icon={<Zap size={16} className="text-orange-400" />} />
          <div className="min-w-[150px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Path Mastery</span>
              <span className="text-blue-400 font-bold">20%</span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[20%]" />
            </div>
          </div>
        </div>
      </header>

      {/* --- MODULES TIMELINE --- */}
      <div className="relative space-y-16">
        <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-gray-800 -z-10" />

        {modules.map((mod) => (
          <section key={mod.id} className="relative pl-16">
            <div className="absolute left-0 top-0 w-12 h-12 bg-[#1a1a1a] border border-gray-800 rounded-full flex items-center justify-center shadow-lg">
              {mod.icon}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold">{mod.title}</h2>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                Module {mod.moduleNum} • <span className="text-blue-400">{mod.level}</span>
              </p>
            </div>

            {/* --- LESSON BUTTONS --- */}
            <div className="space-y-3">
              {mod.lessons.map((lesson) => (
                <Link 
                  to={`/learn/${courseId}/lesson/${lesson.id}`}
                  key={lesson.id}
                  className="group relative bg-[#161616] border border-gray-800 p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-[#1c1c1c] hover:border-gray-500 active:scale-[0.99] block"
                >
                  <div className="flex items-center gap-4">
                    {/* Lesson Index/Check Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      lesson.completed 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-blue-600 text-white group-hover:bg-blue-500'
                    }`}>
                      {lesson.completed ? <CheckCircle2 size={20} /> : lesson.id}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{lesson.name}</h4>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{lesson.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Estimated Time</p>
                      <p className="text-sm font-medium">{lesson.time}</p>
                    </div>
                    {/* Play Button Icon */}
                    <div className={`p-3 rounded-full transition-all shadow-lg ${
                      lesson.completed 
                      ? 'bg-gray-800/50 text-gray-500' 
                      : 'bg-blue-600 text-white group-hover:scale-110 group-hover:shadow-blue-500/20'
                    }`}>
                      <Play size={18} fill={lesson.completed ? "none" : "currentColor"} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* --- FOOTER CTA --- */}
      <div className="mt-24 text-center">
        <div className="inline-flex p-6 bg-[#1a1a1a] border border-gray-800 rounded-3xl mb-6">
          <Trophy size={48} className="text-gray-700" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Mission Completed</h2>
        <p className="text-gray-500 text-sm mb-10">Global Objective Reached</p>

        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-900/40 to-blue-600/10 border border-blue-500/30 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800">
              <Trophy className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Become a Certified {courseTitle}</h3>
              <p className="text-sm text-gray-400">Finish all modules to unlock your digital certificate.</p>
            </div>
          </div>
          <button className="whitespace-nowrap bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95">
            View Certification
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 px-4 py-2 rounded-xl">
    <div className="p-2 bg-black/40 rounded-lg">{icon}</div>
    <div>
      <p className="text-[10px] uppercase text-gray-500 leading-none mb-1">{label}</p>
      <p className="text-sm font-bold leading-none">{value}</p>
    </div>
  </div>
);

export default CoursePage;