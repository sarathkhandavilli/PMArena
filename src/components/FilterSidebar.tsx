import { useState, useEffect, useMemo } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface FilterSidebarProps {
  onFilter: (filters: FilterState) => void;
  isLoading: boolean;
}

export interface FilterState {
  industry: string;
  subIndustry: string;
  company: string;
  department: string;
  signals: string[];
}

const FilterSidebar = ({ onFilter, isLoading }: FilterSidebarProps) => {
  const [filters, setFilters] = useState<FilterState>({
    industry: "",
    subIndustry: "",
    company: "",
    department: "",
    signals: [],
  });
  const [error, setError] = useState("");
  const [filterData, setFilterData] = useState<any[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      const { data } = await supabase.from('problems').select('industry, sub_industry, company, signal');
      if (data) {
        setFilterData(data);
      }
    };
    fetchFilters();
  }, []);

  const industries = useMemo(() => [...new Set(filterData.map(p => p.industry).filter(Boolean))].sort(), [filterData]);
  const subIndustries = useMemo(() => {
    if (!filters.industry) return [];
    return [...new Set(filterData.filter(p => p.industry === filters.industry).map(p => p.sub_industry).filter(Boolean))].sort();
  }, [filterData, filters.industry]);
  const companies = useMemo(() => [...new Set(filterData.map(p => p.company).filter(Boolean))].sort(), [filterData]);
  const departments = useMemo(() => [...new Set(filterData.map(p => p.department).filter(Boolean))].sort(), [filterData]);
  const allSignals = useMemo(() => [...new Set(filterData.map(p => p.signal).filter(Boolean))].sort(), [filterData]);



  const hasActiveFilter =
    filters.industry || filters.subIndustry || filters.company || filters.department || filters.signals.length > 0;

  const handleIndustryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, industry: value, subIndustry: "" }));
    setError("");
  };

  const toggleSignal = (signal: string) => {
    setFilters((prev) => ({
      ...prev,
      signals: prev.signals.includes(signal)
        ? prev.signals.filter((s) => s !== signal)
        : [...prev.signals, signal],
    }));
    setError("");
  };

  const handleSubmit = () => {
    if (!hasActiveFilter) {
      setError("Select at least one filter to find problems");
      return;
    }
    setError("");
    onFilter(filters);
  };

  const clearFilters = () => {
    setFilters({ industry: "", subIndustry: "", company: "", department: "", signals: [] });
    setError("");
  };

  const signalColorMap: Record<string, string> = {
    "UX Friction": "bg-signal-ux/15 text-signal-ux border-signal-ux/30",
    "Dropoff": "bg-signal-dropoff/15 text-signal-dropoff border-signal-dropoff/30",
    "Performance Issues": "bg-signal-performance/15 text-signal-performance border-signal-performance/30",
    "Pricing Friction": "bg-signal-pricing/15 text-signal-pricing border-signal-pricing/30",
    "Trust Issues": "bg-signal-trust/15 text-signal-trust border-signal-trust/30",
  };

  const getSignalColor = (signal: string) => {
    return signalColorMap[signal] || "bg-primary/15 text-primary border-primary/30";
  };

  return (
    <aside className="w-72 border-r border-border bg-card/30 flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Industry */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Industry
          </label>
          <div className="relative">
            <select
              value={filters.industry}
              onChange={(e) => handleIndustryChange(e.target.value)}
              className="w-full h-9 px-3 pr-8 rounded-md bg-muted border border-border text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Sub-Industry */}
        <AnimatePresence>
          {subIndustries.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sub-Industry
              </label>
              <div className="relative">
                <select
                  value={filters.subIndustry}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, subIndustry: e.target.value }));
                    setError("");
                  }}
                  className="w-full h-9 px-3 pr-8 rounded-md bg-muted border border-border text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="">All Sub-Industries</option>
                  {subIndustries.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Company */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Company
          </label>
          <div className="relative">
            <select
              value={filters.company}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, company: e.target.value }));
                setError("");
              }}
              className="w-full h-9 px-3 pr-8 rounded-md bg-muted border border-border text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Department
          </label>
          <div className="relative">
            <select
              value={filters.department}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, department: e.target.value }));
                setError("");
              }}
              className="w-full h-9 px-3 pr-8 rounded-md bg-muted border border-border text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Signals */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Signal
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allSignals.map((signal) => {
              const active = filters.signals.includes(signal);
              return (
                <button
                  key={signal}
                  onClick={() => toggleSignal(signal)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                    active
                      ? getSignalColor(signal)
                      : "bg-muted border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {signal}
                  {active && <X className="inline w-3 h-3 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Finding..." : "Find Problems"}
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
