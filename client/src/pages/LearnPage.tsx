import {
  LayoutPanelLeft,
  Database,
  Layers,
  Infinity,
  Bot,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import CareerCard, { type CareerPath } from "../components/ui/CareerCard";

const mockPaths: CareerPath[] = [
  {
    id: "1",
    title: "Frontend Developer",
    description:
      "Build beautiful, interactive user interfaces and master the modern web platform.",
    icon: <LayoutPanelLeft size={32} />, // Increased icon size slightly for the larger container
    tags: { skills: 5, duration: "~10 Weeks", demand: "Consistent" },
    isBestFit: true,
  },
  {
    id: "2",
    title: "Backend Developer",
    description:
      "Design robust APIs, manage databases, and architect scalable server-side systems.",
    icon: <Database size={32} />,
    tags: { skills: 5, duration: "~10 Weeks", demand: "Consistent" },
  },
  {
    id: "3",
    title: "Fullstack Developer",
    description:
      "The bridge between front and back. Master the entire stack from UI to DB.",
    icon: <Layers size={32} />,
    tags: { skills: 6, duration: "~12 Weeks", demand: "High Demand" },
  },
  {
    id: "4",
    title: "DevOps Engineer",
    description:
      "Bridge the gap between development and operations with automation and cloud scale.",
    icon: <Infinity size={32} />,
    tags: { skills: 4, duration: "~8 Weeks", demand: "Stable Growth" },
  },
  {
    id: "5",
    title: "AI Engineer",
    description:
      "Build intelligent systems using LLMs, neural networks and modern AI frameworks.",
    icon: <Bot size={32} />,
    tags: { skills: 7, duration: "~14 Weeks", demand: "High Demand" },
  },
  {
    id: "6",
    title: "ML Engineer",
    description:
      "Master the mathematics and algorithms behind deep learning and data science.",
    icon: <BrainCircuit size={32} />,
    tags: { skills: 8, duration: "~16 Weeks", demand: "High Demand" },
  },
];

const LearnPage = () => {
  return (
    <div className="min-h-screen text-white pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-12 mb-16">
        {/* AI Recommendation Banner */}
        <div className="bg-[#131b2c] border border-primary/20 rounded-4xl p-10 mb-20 relative overflow-hidden shadow-2xl shadow-primary/5">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2">
                <Sparkles size={12} /> AI Recommendation
              </span>
            </div>

            <div className="flex justify-between items-start gap-8">
              <p className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-4xl">
                "The user specifically wants to create 'entire systems,' which
                is the core definition of a
                <span className="text-white font-bold decoration-primary/50 underline underline-offset-4 decoration-2">
                  {" "}
                  Fullstack Developer's
                </span>{" "}
                work. They already have a strong frontend foundation with React
                and Javascript."
              </p>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Choose Specialization
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            Select a path to start building your professional expertise.
          </p>
        </div>

        {/* Cards Grid - Adjusted gap for the larger cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPaths.map((path) => (
            <CareerCard key={path.id} data={path} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
