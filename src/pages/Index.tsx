import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Building2 } from "lucide-react";
import { generateSlug } from "./ProblemPage";

export interface DbProblem {
  id: string;
  title: string;
  company: string;
  signal: string;
  severity: number;
  industry: string;
  sub_industry: string;
  problem_statement: string;
  department: string;
  user_comment: string;
}

function getDifficultyLabel(severity: number): "Easy" | "Medium" | "Hard" {
  if (!severity) return "Medium";
  if (severity <= 2) return "Easy";
  if (severity === 3) return "Medium";
  return "Hard";
}

// Adapter so ProblemDetail still works with its existing interface
export function dbToLegacy(p: DbProblem) {
  const diff = getDifficultyLabel(p.severity);
  const sevMap = { Easy: "low", Medium: "medium", Hard: "critical" } as const;
  return {
    id: p.id,
    title: p.title,
    company: p.company,
    signal: (p.signal ?? "UX Friction") as any,
    severity: sevMap[diff],
    industry: p.industry ?? "",
    subIndustry: p.sub_industry ?? "",
    problem_statement: p.problem_statement ?? "",
    user_comment: p.user_comment ?? "",
    source: p.department ?? "",
  };
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Hard: "#ef4444",
  Medium: "#f59e0b",
  Easy: "#22c55e",
};

const Index = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<DbProblem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [signal, setSignal] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setProblems(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  // Dynamic filter options from DB data
  const industries = useMemo(() => [...new Set(problems.map(p => p.industry).filter(Boolean))].sort(), [problems]);
  const companies = useMemo(() => [...new Set(problems.map(p => p.company).filter(Boolean))].sort(), [problems]);
  const signals = useMemo(() => [...new Set(problems.map(p => p.signal).filter(Boolean))].sort(), [problems]);

  const filtered = useMemo(() => {
    return problems.filter(p => {
      if (industry && p.industry !== industry) return false;
      if (company && p.company !== company) return false;
      if (signal && p.signal !== signal) return false;
      if (difficulty && difficulty !== "all" && getDifficultyLabel(p.severity) !== difficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.title?.toLowerCase().includes(q) &&
          !p.company?.toLowerCase().includes(q) &&
          !p.problem_statement?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [problems, industry, company, signal, difficulty, search]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Filter Bar */}
        <div className="border-b border-border bg-card/50 px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="h-8 w-56 px-3 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />

            <Select value={industry} onValueChange={(v) => setIndustry(v === "all" ? "" : v)}>
              <SelectTrigger className="w-36 h-8 bg-muted border-border">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={company} onValueChange={(v) => setCompany(v === "all" ? "" : v)}>
              <SelectTrigger className="w-36 h-8 bg-muted border-border">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={signal} onValueChange={(v) => setSignal(v === "all" ? "" : v)}>
              <SelectTrigger className="w-36 h-8 bg-muted border-border">
                <SelectValue placeholder="Signal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signals</SelectItem>
                {signals.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={difficulty || "all"} onValueChange={(v) => setDifficulty(v === "all" ? "" : v)}>
              <SelectTrigger className="w-36 h-8 bg-muted border-border">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
              </SelectContent>
            </Select>

            {(industry || company || signal || difficulty || search) && (
              <button
                onClick={() => { setIndustry(""); setCompany(""); setSignal(""); setDifficulty(""); setSearch(""); }}
                className="h-8 px-3 rounded-md text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-muted transition-colors"
              >
                Clear
              </button>
            )}

            <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-mono text-foreground">{filtered.length}</span> / {problems.length} problems
            </span>
          </div>
        </div>

        {/* Problem Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading problems...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                {problems.length === 0 ? "No problems in the database yet. Ask your admin to import problems." : "No problems match your filters."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-card border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left font-medium px-6 py-3 w-10">#</th>
                  <th className="text-left font-medium px-3 py-3">Title</th>
                  <th className="text-left font-medium px-3 py-3 w-36">Company</th>
                  <th className="text-left font-medium px-3 py-3 w-36">Industry</th>
                  <th className="text-left font-medium px-3 py-3 w-40">Signal</th>
                  <th className="text-left font-medium px-3 py-3 w-24">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((problem, i) => {
                  const diffLabel = getDifficultyLabel(problem.severity);
                  const diffColor = DIFFICULTY_COLOR[diffLabel] ?? "#f59e0b";
                  return (
                    <tr
                      key={problem.id}
                      onClick={() => navigate(`/problem/${generateSlug(problem.title)}`, { state: { problem } })}
                      className="border-b border-border/50 hover:bg-accent/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-3 text-xs text-muted-foreground font-mono">{i + 1}</td>
                      <td className="px-3 py-3">
                        <span className="text-sm text-foreground transition-colors">
                          {problem.title}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {problem.company}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{problem.industry}</td>
                      <td className="px-3 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary">
                          {problem.signal}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-medium" style={{ color: diffColor }}>{diffLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
