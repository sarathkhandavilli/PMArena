import { useState } from "react";
import { type Problem, type Signal } from "@/data/problems";
import { ArrowLeft, MessageSquare, Building2, Target, Lightbulb, BarChart3, FlaskConical, Send, FileText, Code2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProblemDetailProps {
  problem: Problem;
  onBack: () => void;
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

const ProblemDetail = ({ problem, onBack }: ProblemDetailProps) => {
  const { toast } = useToast();
  const [activeLeftTab, setActiveLeftTab] = useState<"description" | "discussion">("description");
  const [answers, setAnswers] = useState({
    rootCause: "",
    solution: "",
    metrics: "",
    experiment: "",
  });

  console.log(problem)

  const diff = difficultyConfig[problem.severity];

  const handleSubmit = () => {
    const filled = Object.values(answers).filter((v) => v.trim()).length;
    if (filled === 0) {
      toast({
        title: "Empty submission",
        description: "Please fill in at least one section before submitting.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Solution submitted! 🎉",
      description: `You completed ${filled}/4 sections. Great work, PM!`,
    });
  };

  const tasks = [
    { key: "rootCause" as const, label: "Root Cause Analysis", icon: Target, placeholder: "What's the underlying root cause? Think beyond surface-level symptoms..." },
    { key: "solution" as const, label: "Proposed Solution", icon: Lightbulb, placeholder: "Describe your proposed solution. Consider feasibility, impact, and UX..." },
    { key: "metrics" as const, label: "Success Metrics", icon: BarChart3, placeholder: "What metrics would you track? Define your north star and supporting metrics..." },
    { key: "experiment" as const, label: "Experiment Design", icon: FlaskConical, placeholder: "How would you validate this? Describe your A/B test or rollout strategy..." },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel — Description */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        {/* Tab Bar */}
        <div className="h-10 border-b border-border flex items-center px-4 gap-1 bg-card/50 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mr-3 pr-3 border-r border-border"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={() => setActiveLeftTab("description")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeLeftTab === "description"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />
            Description
          </button>
          <button
            onClick={() => setActiveLeftTab("discussion")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeLeftTab === "discussion"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
            Discussion
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeLeftTab === "description" ? (
            <div className="max-w-2xl space-y-6">
              {/* Title & Meta */}
              <div>
                <h1 className="text-lg font-semibold text-foreground mb-2">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <span className={`font-medium ${diff.className}`}>{diff.label}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${signalColorMap[problem.signal]}`}>
                    {problem.signal}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    {problem.company}
                  </span>
                  <span className="text-muted-foreground">
                    {problem.industry} › {problem.subIndustry}
                  </span>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {problem.problem_statement}
                </p>
              </div>

              {/* User Complaint */}
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User Complaint
                </h2>
                <blockquote className="border-l-2 border-primary/40 pl-4 py-2 bg-muted/30 rounded-r-md">
                  <p className="text-sm text-foreground/80 italic leading-relaxed">
                    "{problem.user_comment}"
                  </p>
                  <cite className="text-[11px] text-muted-foreground mt-2 block not-italic">
                    — via {problem.source}
                  </cite>
                </blockquote>
              </div>

              {/* Challenge */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your PM Challenge
                </h2>
                <p className="text-sm text-foreground/70">
                  Analyze this problem and provide your solution in the editor panel →
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {tasks.map((task) => (
                    <div
                      key={task.key}
                      className="flex items-center gap-2 p-2.5 rounded-md bg-muted/40 border border-border text-xs text-foreground"
                    >
                      <task.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      {task.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Discussion coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Solution Editor (like LeetCode code editor) */}
      <div className="w-full lg:w-[480px] flex flex-col min-w-0 bg-card/30">
        {/* Editor Tab Bar */}
        <div className="h-10 border-b border-border flex items-center px-4 bg-card/50 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            Solution Editor
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tasks.map((task) => (
            <div key={task.key} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <task.icon className="w-3.5 h-3.5" />
                {task.label}
                {answers[task.key].trim() && (
                  <CheckCircle2 className="w-3 h-3 text-severity-low ml-auto" />
                )}
              </label>
              <textarea
                value={answers[task.key]}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [task.key]: e.target.value }))}
                placeholder={task.placeholder}
                rows={4}
                className="w-full rounded-md bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors font-mono text-[13px] leading-relaxed"
              />
            </div>
          ))}
        </div>

        {/* Submit Bar */}
        <div className="border-t border-border p-3 flex items-center gap-3 bg-card/50 shrink-0">
          <button
            onClick={handleSubmit}
            className="flex-1 h-9 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
          <div className="text-xs text-muted-foreground">
            {Object.values(answers).filter((v) => v.trim()).length}/4
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
