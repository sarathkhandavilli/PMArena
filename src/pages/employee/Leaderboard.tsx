import { useAuth } from '@/hooks/useAuth';
import { Trophy, Medal, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function EmployeeLeaderboard() {
  const { profile } = useAuth();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data: scores } = await supabase.from('scores').select('user_id, score');
        const { data: users } = await supabase.from('users').select('id, name, role').in('role', ['EMPLOYEE', 'ADMIN']);

        if (scores && users) {
          const userScores: Record<string, number> = {};
          scores.forEach(s => {
            userScores[s.user_id] = (userScores[s.user_id] || 0) + (s.score || 0);
          });

          const combined = users.map(u => ({
            id: u.id,
            name: u.name || 'Anonymous User',
            role: u.role === 'EMPLOYEE' ? 'Product Manager' : 'Admin',
            score: userScores[u.id] || 0,
            isCurrent: u.id === profile?.id
          })).sort((a, b) => b.score - a.score);

          const ranked = combined.map((u, i) => ({ ...u, rank: i + 1 }));
          setLeaderboard(ranked);
        }
      } catch (err) {
        console.error('Error fetching leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [profile?.id]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-amber-400" />;
    if (rank === 2) return <Medal size={20} className="text-slate-300" />;
    if (rank === 3) return <Medal size={20} className="text-amber-700" />;
    return <span className="text-white/40 font-semibold">{rank}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <header className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
          <Trophy size={32} className="text-amber-400" />
        </div>
        <h2 className="text-white font-semibold text-3xl mb-2">Global Leaderboard</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">Compete with product managers worldwide. Solve problems to climb the ranks.</p>
      </header>

      <div className="rounded-xl overflow-hidden" style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/40 w-24 text-center">Rank</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/40">Product Manager</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/40 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6 align-middle text-center"><div className="h-6 w-6 mx-auto bg-white/5 rounded-md" /></td>
                  <td className="py-4 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-white/5 rounded" />
                        <div className="h-3 w-20 bg-white/5 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 align-middle text-right"><div className="h-6 w-16 ml-auto bg-white/5 rounded" /></td>
                </tr>
              ))
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-white/50">No scores recorded yet.</td>
              </tr>
            ) : (
              leaderboard.map((user) => (
                <tr 
                  key={user.id} 
                  className={`transition-colors ${user.isCurrent ? 'bg-teal-500/10' : 'hover:bg-white/5'}`}
                >
                  <td className="py-4 px-6 align-middle text-center">
                    <div className="flex justify-center items-center">
                      {getRankIcon(user.rank)}
                    </div>
                  </td>
                  <td className="py-4 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border"
                        style={{ 
                          background: user.isCurrent ? 'rgba(0,194,154,0.2)' : 'rgba(255,255,255,0.05)',
                          borderColor: user.isCurrent ? 'rgba(0,194,154,0.3)' : 'rgba(255,255,255,0.1)',
                          color: user.isCurrent ? '#00C29A' : '#ffffff'
                        }}
                      >
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${user.isCurrent ? 'text-teal-400' : 'text-white'}`}>
                          {user.isCurrent ? profile?.name || 'You' : user.name}
                          {user.isCurrent && <span className="ml-2 text-[10px] uppercase bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">Current User</span>}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 align-middle text-right">
                    <span className={`font-bold text-lg ${user.isCurrent ? 'text-teal-400' : 'text-white'}`}>
                      {user.score.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/30 ml-1">pts</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between text-sm text-white/40">
          <span>Showing top 50 players</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors" disabled>Previous</button>
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
