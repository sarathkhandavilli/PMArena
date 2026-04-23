import { type Problem, type Signal } from "@/data/problems";
import { CheckCircle2, Circle, Building2 } from "lucide-react";

interface ProblemTableProps {
  problems: Problem[];
  onSelect: (problem: Problem) => void;
}

const signalColorMap: Record<Signal, string> = {
  "UX Friction": "bg-signal-ux/15 text-signal-ux",
  "Dropoff": "bg-signal-dropoff/15 text-signal-dropoff",
  "Performance Issues": "bg-signal-performance/15 text-signal-performance",
  "Pricing Friction": "bg-signal-pricing/15 text-signal-pricing",
  "Trust Issues": "bg-signal-trust/15 text-signal-trust",
};

const difficultyConfig = {
  critical: { label: "Hard", className: "text-severity-critical" },
  medium: { label: "Medium", className: "text-severity-medium" },
  low: { label: "Easy", className: "text-severity-low" },
};

const ProblemTable = ({ problems, onSelect }: ProblemTableProps) => {
  if (problems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No problems found. Try different filters.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-card border-b border-border">
          <tr className="text-xs text-muted-foreground uppercase tracking-wider">
            <th className="text-left font-medium px-6 py-3 w-10">#</th>
            <th className="text-left font-medium px-3 py-3">Title</th>
            <th className="text-left font-medium px-3 py-3 w-32">Company</th>
            <th className="text-left font-medium px-3 py-3 w-40">Signal</th>
            <th className="text-left font-medium px-3 py-3 w-24">Difficulty</th>
            <th className="text-left font-medium px-3 py-3 w-24">Source</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, i) => {
            const diff = difficultyConfig[problem.severity];
            return (
              <tr
                key={problem.id}
                onClick={() => onSelect(problem)}
                className="border-b border-border/50 hover:bg-accent/50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-3 text-xs text-muted-foreground font-mono">
                  {i + 1}
                </td>
                <td className="px-3 py-3">
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {problem.title}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    {problem.company}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${signalColorMap[problem.signal]}`}>
                    {problem.signal}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-medium ${diff.className}`}>
                    {diff.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  {problem.source}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemTable;
