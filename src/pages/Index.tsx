import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProblemTable from "@/components/ProblemTable";
import ProblemDetail from "@/components/ProblemDetail";
import { PROBLEMS, INDUSTRIES, SIGNALS, type Problem, type Signal } from "@/data/problems";

const companies = [...new Set(PROBLEMS.map((p) => p.company))].sort();

const Index = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Filters
  const [industry, setIndustry] = useState("");
  const [subIndustry, setSubIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [signal, setSignal] = useState("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");

  const subIndustries = industry ? INDUSTRIES[industry] || [] : [];

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter((p) => {
      if (industry && p.industry !== industry) return false;
      if (subIndustry && p.subIndustry !== subIndustry) return false;
      if (company && p.company !== company) return false;
      if (signal && p.signal !== signal) return false;
      if (severity && p.severity !== severity) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.company.toLowerCase().includes(q) &&
          !p.problem_statement.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [industry, subIndustry, company, signal, severity, search]);

  if (selectedProblem) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navbar />
        <ProblemDetail
          problem={selectedProblem}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="h-8 w-56 px-3 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />

            <select
              value={industry}
              onChange={(e) => { setIndustry(e.target.value); setSubIndustry(""); }}
              className="h-8 px-3 rounded-md bg-muted border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Industry</option>
              {Object.keys(INDUSTRIES).map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            {subIndustries.length > 0 && (
              <select
                value={subIndustry}
                onChange={(e) => setSubIndustry(e.target.value)}
                className="h-8 px-3 rounded-md bg-muted border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Sub-Industry</option>
                {subIndustries.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}

            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-8 px-3 rounded-md bg-muted border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Company</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={signal}
              onChange={(e) => setSignal(e.target.value)}
              className="h-8 px-3 rounded-md bg-muted border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Signal</option>
              {SIGNALS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="h-8 px-3 rounded-md bg-muted border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Difficulty</option>
              <option value="critical">Hard</option>
              <option value="medium">Medium</option>
              <option value="low">Easy</option>
            </select>

            {(industry || company || signal || severity || search) && (
              <button
                onClick={() => { setIndustry(""); setSubIndustry(""); setCompany(""); setSignal(""); setSeverity(""); setSearch(""); }}
                className="h-8 px-3 rounded-md text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-muted transition-colors"
              >
                Clear
              </button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              <span className="font-mono text-foreground">{filteredProblems.length}</span> / {PROBLEMS.length} problems
            </span>
          </div>
        </div>

        {/* Problem Table */}
        <ProblemTable
          problems={filteredProblems}
          onSelect={setSelectedProblem}
        />
      </div>
    </div>
  );
};

export default Index;
