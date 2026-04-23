import { type Problem } from "@/data/problems";
import ProblemCard from "./ProblemCard";
import { Search, AlertCircle } from "lucide-react";

interface ProblemListProps {
  problems: Problem[];
  hasSearched: boolean;
  isLoading: boolean;
  onSelect: (problem: Problem) => void;
}

const SkeletonCard = () => (
  <div className="border border-border rounded-lg p-4 animate-pulse">
    <div className="flex justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-full" />
      </div>
      <div className="h-5 w-16 bg-muted rounded" />
    </div>
    <div className="flex gap-2 mt-3">
      <div className="h-5 w-20 bg-muted rounded" />
      <div className="h-5 w-16 bg-muted rounded" />
    </div>
  </div>
);

const ProblemList = ({ problems, hasSearched, isLoading, onSelect }: ProblemListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-foreground">Discover product problems</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Use the filters to find real-world product challenges from Reddit, app reviews, and forums.
          </p>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="text-sm font-medium text-foreground">No problems found</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Try different filters to discover more problems.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{problems.length}</span> problems found
        </p>
      </div>
      {problems.map((problem, i) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          index={i}
          onClick={() => onSelect(problem)}
        />
      ))}
    </div>
  );
};

export default ProblemList;
