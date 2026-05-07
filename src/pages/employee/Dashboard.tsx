import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/ui/StatCard';
import { BookOpen, Trophy, Target, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '../ProblemPage';
import { DashboardSkeleton } from '@/components/ui/PageLoading';

export default function Dashboard() {
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ solved: 0, score: 0, rank: 0, avgScore: 0 });
  const [continueProblem, setContinueProblem] = useState<any>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch User's Solutions
        const { data: mySolutions } = await supabase
          .from('solutions')
          .select('*, problems(title, company, severity, signal)')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        // 2. Fetch User's Scores
        const { data: myScores } = await supabase
          .from('scores')
          .select('score')
          .eq('user_id', profile.id);

        // 3. Calculate Rank (fetch all scores grouped by user to find rank)
        const { data: allScores } = await supabase
          .from('scores')
          .select('user_id, score');

        // Stats Calculation
        const solvedCount = mySolutions?.length || 0;
        const totalScore = myScores?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
        const avgScore = solvedCount > 0 ? Math.round(totalScore / solvedCount) : 0;

        let myRank = 0;
        if (allScores) {
          const userTotals: Record<string, number> = {};
          allScores.forEach(s => {
            userTotals[s.user_id] = (userTotals[s.user_id] || 0) + (s.score || 0);
          });
          const sortedUsers = Object.entries(userTotals).sort(([,a], [,b]) => b - a);
          const rankIndex = sortedUsers.findIndex(([uid]) => uid === profile.id);
          myRank = rankIndex !== -1 ? rankIndex + 1 : sortedUsers.length + 1;
        }

        setStats({ solved: solvedCount, score: totalScore, rank: myRank, avgScore });
        setRecentActivity(mySolutions?.slice(0, 4) || []);

        // 4. Fetch Problems (for Continue Solving & Recommendations)
        const solvedProblemIds = mySolutions?.map(s => s.problem_id) || [];
        
        let query = supabase.from('problems').select('*').eq('is_active', true);
        if (solvedProblemIds.length > 0) {
          // Exclude already solved
          query = query.not('id', 'in', `(${solvedProblemIds.join(',')})`);
        }
        
        const { data: availableProblems } = await query.order('created_at', { ascending: false }).limit(4);
        
        if (availableProblems && availableProblems.length > 0) {
          setContinueProblem(availableProblems[0]);
          setRecommended(availableProblems.slice(1, 4));
        }

      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.id]);

  const getDifficulty = (sev: number) => {
    if (sev <= 2) return { label: 'Easy', color: 'teal' };
    if (sev <= 3) return { label: 'Medium', color: 'amber' };
    return { label: 'Hard', color: 'red' };
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours || 1} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header>
        <h2 className="text-white font-semibold text-2xl mb-1">Welcome back, {profile?.name?.split(' ')[0] || 'User'} 👋</h2>
        <p className="text-white/40 text-sm">Improve your product thinking by solving real-world problems</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Problems Solved" value={stats.solved} icon={<BookOpen size={18} />} color="blue" />
        <StatCard title="Current Score" value={stats.score} icon={<Trophy size={18} />} color="amber" />
        <StatCard title="Rank" value={stats.rank > 0 ? `#${stats.rank}` : '-'} icon={<Sparkles size={18} />} color="purple" />
        <StatCard title="Average Score" value={stats.avgScore} icon={<Target size={18} />} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Continue Solving & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Continue Solving */}
          {continueProblem && (
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-white/50">Next Up</h3>
              <div 
                className="rounded-xl p-6 transition-all relative overflow-hidden group"
                style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/5 text-white/60 border border-white/10">{continueProblem.company}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-${getDifficulty(continueProblem.severity).color}-500/10 text-${getDifficulty(continueProblem.severity).color}-400 border border-${getDifficulty(continueProblem.severity).color}-500/20`}>
                        {getDifficulty(continueProblem.severity).label}
                      </span>
                    </div>
                    <h4 className="text-white text-lg font-bold mb-1">{continueProblem.title}</h4>
                    <p className="text-white/40 text-sm line-clamp-1">{continueProblem.problem_statement}</p>
                  </div>
                  <Link 
                    to={`/problem/${generateSlug(continueProblem.title)}`}
                    className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(90deg, #2563EB 0%, #00C29A 100%)' }}
                  >
                    Solve <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Recommended Problems */}
          {recommended.length > 0 && (
            <section>
              <div className="mb-4">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider text-white/50">Recommended For You</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommended.map((prob) => {
                  const diff = getDifficulty(prob.severity);
                  return (
                    <Link
                      key={prob.id}
                      to={`/problem/${generateSlug(prob.title)}`}
                      className="group rounded-xl p-5 transition-all hover:-translate-y-1"
                      style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-white/50 bg-white/5 px-2 py-1 rounded-md">{prob.company}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-${diff.color}-500/10 text-${diff.color}-400 border border-${diff.color}-500/20`}>
                          {diff.label}
                        </span>
                      </div>
                      <h4 className="text-white font-medium text-sm leading-snug group-hover:text-teal-400 transition-colors line-clamp-2">{prob.title}</h4>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-6">
          <section>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-white/50">Recent Activity</h3>
            <div className="rounded-xl p-5" style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock size={14} className="text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white mb-0.5 line-clamp-1">{act.problems?.title || 'Unknown Problem'}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-teal-400">{act.score ? `+${act.score} pts` : 'Pending Score'}</span>
                          <span className="text-xs text-white/30">{formatTimeAgo(act.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-white/40 text-sm">No recent activity yet.</div>
              )}
              
              <Link to="/dashboard/performance" className="block w-full text-center py-3 mt-4 rounded-lg bg-white/5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all">
                View Full History
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
