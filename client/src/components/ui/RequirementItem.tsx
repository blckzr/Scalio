import { Check, X } from "lucide-react";

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem = ({ met, text }: RequirementItemProps) => {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
        met ? "text-green-500 font-medium" : "text-gray-500"
      }`}
    >
      {/* Icon switches based on state */}
      {met ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
};

export default RequirementItem;
