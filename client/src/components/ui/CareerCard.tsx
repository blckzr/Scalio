import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles, CheckCircle } from "lucide-react";

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: {
    skills: number;
    duration: string;
    demand: "Consistent" | "High Demand" | "Stable Growth";
  };
  isBestFit?: boolean;
  isActive?: boolean; // Added to support the 'active' check circle
}

interface CareerCardProps {
  data: CareerPath;
}

const CareerCard = ({ data }: CareerCardProps) => {
  const { title, description, icon, tags, isBestFit, isActive } = data;

  return (
    <Link
      to={`/learn/${title.toLowerCase().replace(/\s+/g, "-")}`}
      className={`group relative bg-[#242424] p-10 rounded-[2.5rem] hover:bg-[#2a2a2a] transition-all duration-500 flex flex-col text-left overflow-hidden border-2 h-full
        ${
          isBestFit
            ? "border-primary/40 shadow-2xl shadow-primary/5"
            : "border-[#333] hover:border-primary/30"
        }`}
    >
      {/* Best Fit Badge */}
      {isBestFit && (
        <div className="absolute top-6 right-6 bg-primary text-background px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 z-10 shadow-lg shadow-primary/20">
          <Sparkles className="w-3 h-3" /> Best Fit
        </div>
      )}

      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />

      {/* Icon Container */}
      <div className="mb-8 w-16 h-16 rounded-2xl bg-background border border-[#333] flex items-center justify-center text-primary group-hover:scale-110 group-hover:border-primary/30 transition-all shadow-xl z-10 relative">
        {icon}
      </div>

      {/* Title Section */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        {isActive && <CheckCircle className="w-4 h-4 text-emerald-500" />}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-8 grow leading-relaxed font-medium relative z-10">
        {description}
      </p>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10 mt-auto">
        {/* Skills Tag */}
        <span className="px-3 py-1.5 bg-background border border-[#333] text-[10px] font-black uppercase tracking-widest text-[#666] rounded-md flex items-center gap-1.5">
          {tags.skills} Skills
        </span>

        {/* Duration Tag */}
        <span className="px-3 py-1.5 bg-background border border-[#333] text-[10px] font-black uppercase tracking-widest text-[#666] rounded-md">
          {tags.duration}
        </span>

        {/* Demand Tag */}
        <span className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5 border border-primary/20">
          <TrendingUp className="w-3 h-3" /> {tags.demand}
        </span>
      </div>

      {/* Footer / CTA */}
      <div className="flex items-center justify-between pt-8 border-t border-[#333] relative z-10 w-full">
        <div
          className={`text-[11px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 
          ${isBestFit ? "text-primary" : "text-[#666] group-hover:text-white"}`}
        >
          {isActive ? "Continue Path" : "Start Roadmap"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default CareerCard;
