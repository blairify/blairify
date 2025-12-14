import { Brain, Building, Code, HelpCircle, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InterviewBadgeProps {
  type: string;
  showLabel?: boolean;
}

export function InterviewBadge({
  type,
  showLabel = true,
}: InterviewBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case "technical":
        return <Code className="h-4 w-4" />;
      case "bullet":
        return <Target className="h-4 w-4" />;
      case "system-design":
        return <Building className="h-4 w-4" />;
      case "coding":
        return <Brain className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "technical":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80";
      case "bullet":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "system-design":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "coding":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Badge
      className={`${getColor()} text-xs sm:text-sm px-3 py-1.5 flex-shrink-0 font-medium`}
    >
      {getIcon()}
      {showLabel && (
        <span className="ml-1.5 capitalize hidden sm:inline">{type}</span>
      )}
    </Badge>
  );
}
