import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateSlug } from '../ProblemPage';

export default function EmployeeSubmissions() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('solutions')
        .select('*, problems(title, company, severity)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (data) setSubmissions(data);
      setLoading(false);
    };
    
    fetchSubmissions();
  }, [profile?.id]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getDifficulty = (sev: number) => {
    if (sev <= 2) return { label: 'Easy', color: 'teal' };
    if (sev <= 3) return { label: 'Medium', color: 'amber' };
    return { label: 'Hard', color: 'red' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-8 text-white/50 animate-pulse text-center">Loading submissions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <header className="mb-8">
        <h2 className="text-white font-semibold text-2xl mb-1">Problems Solved</h2>
        <p className="text-white/40 text-sm">Review your past submissions and scores.</p>
      </header>

      {submissions.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-white/20" />
          </div>
          <h3 className="text-white font-medium mb-2">No submissions yet</h3>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-6">You haven't solved any problems yet. Head to the dashboard to find problems to solve.</p>
          <Link to="/dashboard" className="px-5 py-2 rounded-lg bg-teal-500/10 text-teal-400 font-medium hover:bg-teal-500/20 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const diff = sub.problems?.severity ? getDifficulty(sub.problems.severity) : { label: 'Unknown', color: 'slate' };
            const slug = generateSlug(sub.problems?.title || '');

            return (
              <div 
                key={sub.id} 
                className="rounded-xl overflow-hidden transition-all"
                style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Header (Clickable) */}
                <button 
                  onClick={() => toggleExpand(sub.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-white/60 bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <Building2 size={12} className="text-white/40" />
                        {sub.problems?.company || 'Unknown'}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md bg-${diff.color}-500/10 text-${diff.color}-400 border border-${diff.color}-500/20`}>
                        {diff.label}
                      </span>
                      <span className="text-xs text-white/30 flex items-center gap-1.5 ml-auto md:ml-0">
                        <Clock size={12} /> {formatDate(sub.created_at)}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg line-clamp-1">{sub.problems?.title || 'Unknown Problem'}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-white/40 mb-0.5">Score</div>
                      <div className="font-bold text-teal-400">{sub.score !== null ? `${sub.score} pts` : 'Pending'}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      {isExpanded ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-5 md:p-6 border-t border-white/5 bg-black/20 space-y-6">
                    
                    <div className="flex items-center justify-between md:hidden mb-4 pb-4 border-b border-white/5">
                      <span className="text-white/60 text-sm">Awarded Score</span>
                      <span className="font-bold text-teal-400">{sub.score !== null ? `${sub.score} pts` : 'Pending'}</span>
                    </div>

                    <div className="flex justify-end mb-4">
                      <Link 
                        to={`/problem/${slug}`}
                        className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        View Original Problem →
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">1. Root Cause</h4>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/5">
                        {sub.root_cause || <span className="text-white/30 italic">Not provided</span>}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">2. Proposed Solution</h4>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/5">
                        {sub.solution || <span className="text-white/30 italic">Not provided</span>}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">3. Success Metrics</h4>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/5">
                        {sub.metrics || <span className="text-white/30 italic">Not provided</span>}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">4. Experiment Plan</h4>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/5">
                        {sub.experiment || <span className="text-white/30 italic">Not provided</span>}
                      </p>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
