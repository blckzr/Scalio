import { LayoutPanelLeft, Database, Layers, Cloud, BrainCircuit, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const LearnPage = () => {
  const paths = [
    {
      title: "Frontend Developer",
      desc: "Build beautiful, interactive user interfaces and master the modern web platform.",
      icon: <LayoutPanelLeft className="text-white" size={24} />,
      color: "bg-blue-500",
      cornerColor: "bg-blue-600",
    },
    {
      title: "Backend Developer",
      desc: "Design robust APIs, manage databases, and architect scalable server-side systems.",
      icon: <Database className="text-white" size={24} />,
      color: "bg-green-500",
      cornerColor: "bg-green-600",
    },
    {
      title: "Fullstack Developer",
      desc: "The bridge between front and back. Master the entire stack from UI to DB.",
      icon: <Layers className="text-white" size={24} />,
      color: "bg-purple-500",
      cornerColor: "bg-purple-600",
    },
    {
      title: "DevOps Engineer",
      desc: "Bridge the gap between development and operations with automation and cloud scale.",
      icon: <Cloud className="text-white" size={24} />,
      color: "bg-rose-500",
      cornerColor: "bg-rose-600",
    },
    {
      title: "Fullstack Developer",
      desc: "The bridge between front and back. Master the entire stack from UI to DB.",
      icon: <Layers className="text-white" size={24} />,
      color: "bg-indigo-500",
      cornerColor: "bg-indigo-600",
    },
    {
      title: "ML Engineer",
      desc: "Master the mathematics and algorithms behind deep learning and data science.",
      icon: <BrainCircuit className="text-white" size={24} />,
      color: "bg-orange-500",
      cornerColor: "bg-orange-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-16 text-center pb-24">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Choose your Mastery</h1>
      <p className="text-gray-400 text-lg mb-16">Select a specialized path to begin your journey.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paths.map((path, index) => (
          <Link 
            key={index}
            to={`/learn/${path.title.toLowerCase().replace(/\s+/g, "-")}`}
            className="relative bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800 text-left hover:border-gray-500 hover:bg-[#222] transition-all group overflow-hidden block"
          >
            {/* Decorative Corner Accent */}
            <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-3xl ${path.cornerColor} opacity-80 group-hover:opacity-100 transition-opacity`} />

            {/* Icon Box */}
            <div className={`w-12 h-12 rounded-xl ${path.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
              {path.icon}
            </div>

            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
              {path.title}
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {path.desc}
            </p>

            <div className="inline-flex items-center gap-2 text-gray-400 text-sm font-medium group-hover:text-white transition-colors">
              Begin Journey <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LearnPage;