import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProblemDetail from "@/components/ProblemDetail";
import { supabase } from "@/lib/supabase";
import { Building2 } from "lucide-react";

// DB-aligned Problem type
export interface DbProblem {
  id: string;
  title: string;
  company: string;
  signal: string;
  difficulty: string;
  industry: string;
  sub_industry: string;
  description: string;
  department: string;
}

// Adapter so ProblemDetail still works with its existing interface
export function dbToLegacy(p: DbProblem) {
  return {
    id: p.id,
    title: p.title,
    company: p.company,
    signal: (p.signal ?? "UX Friction") as any,
    severity: difficultyToSeverity(p.difficulty),
    industry: p.industry ?? "",
    subIndustry: p.sub_industry ?? "",
    problem_statement: p.description ?? "",
    user_comment: "",
    source: p.department ?? "",
  };
}

function difficultyToSeverity(d: string): "critical" | "medium" | "low" {
  const v = (d ?? "").toLowerCase();
  if (v === "hard" || v === "critical") return "critical";
  if (v === "easy" || v === "low") return "low";
  return "medium";
}

const DIFFICULTY_LABEL: Record<string, string> = {
  hard: "Hard", critical: "Hard",
  medium: "Medium",
  easy: "Easy", low: "Easy",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  hard: "#ef4444", critical: "#ef4444",
  medium: "#f59e0b",
  easy: "#22c55e", low: "#22c55e",
};

const Index = () => {
  const [problems, setProblems] = useState<DbProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<DbProblem | null>(null);

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
      if (difficulty && difficultyToSeverity(p.difficulty) !== difficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.title?.toLowerCase().includes(q) &&
          !p.company?.toLowerCase().includes(q) &&
          !p.description?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [problems, industry, company, signal, difficulty, search]);

  const selectClass = "h-8 px-3 rounded-md bg-muted border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring";

  if (selectedProblem) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navbar />
        <ProblemDetail
          problem={dbToLegacy(selectedProblem) as any}
          onBack={() => setSelectedProblem(null)}
        />
      </div>
    );
  }

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

            <select value={industry} onChange={e => setIndustry(e.target.value)} className={selectClass}>
              <option value="">Industry</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>

            <select value={company} onChange={e => setCompany(e.target.value)} className={selectClass}>
              <option value="">Company</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={signal} onChange={e => setSignal(e.target.value)} className={selectClass}>
              <option value="">Signal</option>
              {signals.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={selectClass}>
              <option value="">Difficulty</option>
              <option value="critical">Hard</option>
              <option value="medium">Medium</option>
              <option value="low">Easy</option>
            </select>

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
                  const sev = difficultyToSeverity(problem.difficulty);
                  const diffLabel = DIFFICULTY_LABEL[(problem.difficulty ?? "").toLowerCase()] ?? "Medium";
                  const diffColor = DIFFICULTY_COLOR[(problem.difficulty ?? "").toLowerCase()] ?? "#f59e0b";
                  return (
                    <tr
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className="border-b border-border/50 hover:bg-accent/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-3 text-xs text-muted-foreground font-mono">{i + 1}</td>
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
