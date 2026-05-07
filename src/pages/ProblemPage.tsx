import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProblemDetail from "@/components/ProblemDetail";
import { supabase } from "@/lib/supabase";
import { dbToLegacy, DbProblem } from "./Index";
import { InnerProblemPageSkeleton } from "@/components/ui/PageLoading";

export const generateSlug = (title: string) => 
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ProblemPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [problem, setProblem] = useState<DbProblem | null>(location.state?.problem || null);
  const [loading, setLoading] = useState(!problem);

  useEffect(() => {
    if (!problem && slug) {
      const fetchProblem = async () => {
        setLoading(true);
        // Since we don't have a slug in the database, fetch all and find
        // In a real app, you would query by a slug column directly
        const { data } = await supabase.from('problems').select('*');
        if (data) {
          const match = data.find(p => generateSlug(p.title) === slug);
          if (match) {
            setProblem(match as DbProblem);
          }
        }
        setLoading(false);
      };
      fetchProblem();
    }
  }, [problem, slug]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navbar />
        <InnerProblemPageSkeleton />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground text-sm">Problem not found.</p>
          <button 
            onClick={() => navigate('/')} 
            className="text-sm font-medium text-primary hover:underline"
          >
            Go back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <ProblemDetail
        problem={dbToLegacy(problem) as any}
        onBack={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
      />
    </div>
  );
};

export default ProblemPage;
