import { type Problem, type Signal } from "@/data/problems";
import { motion } from "framer-motion";
import { MessageSquare, Building2 } from "lucide-react";

interface ProblemCardProps {
  problem: Problem;
  index: number;
  onClick: () => void;
}

const signalColorMap: Record<Signal, string> = {
  "UX Friction": "bg-signal-ux/15 text-signal-ux",
  "Dropoff": "bg-signal-dropoff/15 text-signal-dropoff",
  "Performance Issues": "bg-signal-performance/15 text-signal-performance",
  "Pricing Friction": "bg-signal-pricing/15 text-signal-pricing",
  "Trust Issues": "bg-signal-trust/15 text-signal-trust",
};

const severityConfig = {
  critical: { label: "Critical", className: "bg-severity-critical/15 text-severity-critical" },
  medium: { label: "Medium", className: "bg-severity-medium/15 text-severity-medium" },
  low: { label: "Low", className: "bg-severity-low/15 text-severity-low" },
};

const ProblemCard = ({ problem, index, onClick }: ProblemCardProps) => {
  const severity = severityConfig[problem.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={onClick}
      className="group border border-border rounded-lg p-4 hover:border-primary/30 hover:bg-accent/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {problem.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {problem.problem_statement}
          </p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${severity.className}`}>
          {severity.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${signalColorMap[problem.signal]}`}>
          {problem.signal}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Building2 className="w-3 h-3" />
          {problem.company}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MessageSquare className="w-3 h-3" />
          {problem.source}
        </span>
        <span className="text-[11px] text-muted-foreground/60 ml-auto">
          {problem.industry} · {problem.subIndustry}
        </span>
      </div>
    </motion.div>
  );
};

export default ProblemCard;
