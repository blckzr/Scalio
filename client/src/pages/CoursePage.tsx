import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Trophy,
  Target,
  Zap,
  Award,
  Clock,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const CoursePage = () => {
  const { courseId } = useParams();

  const courseTitle = courseId
    ? courseId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Course";

  // Mock Data
  const modules = [
    {
      id: "foundations",
      title: "Foundations",
      moduleNum: 1,
      level: "Beginner",
      icon: <Target className="w-8 h-8 text-[#47a9ff]" />,
      lessons: [
        {
          id: "1",
          name: "Lesson Name",
          desc: "Lesson Description",
          time: "1 hour",
          completed: true,
        },
        {
          id: "2",
          name: "Lesson Name",
          desc: "Lesson Description",
          time: "1 hour",
          completed: false,
        },
      ],
    },
    {
      id: "specialization",
      title: "Specialization",
      moduleNum: 2,
      level: "Intermediate",
      icon: <Zap className="w-8 h-8 text-[#47a9ff]" />,
      lessons: [
        {
          id: "3",
          name: "Lesson Name",
          desc: "Lesson Description",
          time: "1 hour",
          completed: false,
        },
        {
          id: "4",
          name: "Lesson Name",
          desc: "Lesson Description",
          time: "1 hour",
          completed: false,
        },
      ],
    },
    {
      id: "mastery",
      title: "Mastery",
      moduleNum: 3,
      level: "Advanced",
      icon: <Award className="w-8 h-8 text-[#47a9ff]" />,
      lessons: [
        {
          id: "5",
          name: "Lesson Name",
          desc: "Lesson Description",
          time: "1 hour",
          completed: false,
        },
      ],
    },
  ];

  // Calculate stats for the header
  const totalLessons = modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );
  const completedLessons = modules.reduce(
    (acc, mod) => acc + mod.lessons.filter((l) => l.completed).length,
    0
  );
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);
  const isComplete = progressPercent === 100;

  return (
    <div className="min-h-screen bg-[#181818] pb-40">
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 bg-[#181818]/95 backdrop-blur-xl z-30 border-b border-[#333] py-8 mb-16">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8 w-full md:w-auto">
            <Link
              to="/learn"
              className="p-4 bg-[#242424] border border-[#333] rounded-2xl text-[#555] hover:text-[#47a9ff] transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                {courseTitle}
              </h1>
              <div className="flex items-center gap-6 text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#47a9ff]" />{" "}
                  {modules.length} Modules
                </span>
                <span className="text-[#47a9ff]">{totalLessons} Lessons</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 w-full md:w-auto justify-end">
            {/* Stats Cards */}
            <div className="hidden lg:flex gap-4">
              <StatCard
                label="Completed"
                value={`${completedLessons}/${totalLessons}`}
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              />
              <StatCard
                label="Time Spent"
                value="1h 20m"
                icon={<Zap className="w-4 h-4 text-[#47a9ff]" />}
              />
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">
                Path Mastery
              </span>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-white">
                  {progressPercent}%
                </span>
                <div className="w-32 h-2 bg-[#222] rounded-full overflow-hidden border border-[#333]">
                  <div
                    className="h-full bg-[#47a9ff] transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODULES TIMELINE --- */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 relative">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[53px] md:left-[79px] top-8 bottom-32 w-[2px] bg-[#333]" />

        {modules.map((mod) => (
          <section key={mod.id} className="mb-24 relative">
            {/* Module Header */}
            <div className="flex items-center gap-6 md:gap-8 mb-12 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-3xl bg-[#181818] border-2 border-[#333] text-[#47a9ff] flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
                {mod.icon}
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {mod.title}
                </h3>
                <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">
                  Module {mod.moduleNum} •{" "}
                  <span className="text-[#47a9ff]">{mod.level}</span>
                </p>
              </div>
            </div>

            {/* Lessons List */}
            <div className="ml-[32px] md:ml-[80px] pl-10 md:pl-16 space-y-6">
              {mod.lessons.map((lesson, idx) => (
                <Link
                  to={`/learn/${courseId}/lesson/${lesson.id}`}
                  key={lesson.id}
                  className={`group bg-[#181818] p-6 md:p-8 rounded-[2rem] cursor-pointer border transition-all flex items-center gap-6 md:gap-10 relative
                    ${
                      lesson.completed
                        ? "opacity-60 border-[#333] hover:opacity-100"
                        : "border-[#333] hover:border-[#47a9ff]/50 hover:bg-[#222]"
                    }`}
                >
                  {/* Status Indicator on Line */}
                  <div
                    className={`absolute -left-[51px] md:-left-[75px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-[#181818] 
                    ${
                      lesson.completed
                        ? "bg-emerald-500"
                        : "bg-[#333] group-hover:bg-[#47a9ff]"
                    }`}
                  />

                  {/* Icon/Number Box */}
                  <div
                    className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm transition-all
                    ${
                      lesson.completed
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-[#181818] border border-[#333] text-[#444] group-hover:text-[#47a9ff]"
                    }`}
                  >
                    {lesson.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      lesson.id
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <h4 className="text-lg font-bold text-[#ddd] mb-2 group-hover:text-white transition-colors truncate">
                      {lesson.name}
                    </h4>
                    <p className="text-xs text-[#666] line-clamp-1 font-medium group-hover:text-[#888]">
                      {lesson.desc}
                    </p>
                  </div>

                  {/* Right Side Metadata/Action */}
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-1">
                        Est. Time
                      </p>
                      <p className="text-xs font-bold text-[#666]">
                        {lesson.time}
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-2xl border transition-all
                      ${
                        lesson.completed
                          ? "bg-[#181818] border-[#333] text-[#333]"
                          : "bg-[#181818] border-[#333] text-[#444] group-hover:text-[#47a9ff] group-hover:border-[#47a9ff]/30"
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* --- MISSION FOOTER --- */}
        <div className="relative z-10 flex flex-col items-center mt-32">
          {isComplete ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-700 text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#47a9ff] text-[#181818] flex items-center justify-center border-8 border-[#181818] shadow-[0_0_50px_rgba(71,169,255,0.4)] scale-110 mb-8 relative">
                <div className="absolute inset-0 bg-[#47a9ff] rounded-[2rem] animate-ping opacity-20" />
                <Trophy className="w-14 h-14" />
              </div>
              <h4 className="text-4xl font-black text-white mb-4">
                Course Protocol Complete
              </h4>
              <p className="text-[#666] text-sm mb-10 max-w-xs">
                All modules verified. Your credential is ready for extraction.
              </p>
              <button className="bg-[#47a9ff] text-[#181818] px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#47a9ff]/20">
                <ShieldCheck className="w-5 h-5" /> Claim Certification
              </button>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-8 border-[#181818] shadow-2xl transition-all duration-700 bg-[#222] text-[#333]">
                <Flag className="w-10 h-10" />
              </div>
              <div className="mt-8 text-center">
                <h4 className="text-xl font-bold text-[#333]">
                  Mission Endpoint
                </h4>
                <p className="text-[10px] font-black text-[#333] uppercase tracking-widest mt-2">
                  Complete all modules to unlock
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Small Stat Card matching the style
const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-4 bg-[#222] border border-[#333] px-5 py-3 rounded-2xl">
    <div className="p-2 bg-[#181818] rounded-xl border border-[#333]">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-[#555] tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

export default CoursePage;
