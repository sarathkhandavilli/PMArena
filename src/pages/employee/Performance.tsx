import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/ui/StatCard';
import { Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function EmployeePerformance() {
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSolved: 0, avgScore: 0, bestScore: 0, bestProblem: 'None' });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const { data: scores } = await supabase
          .from('scores')
          .select('score, created_at, problems(title)')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: true });

        if (scores && scores.length > 0) {
          // Calculate Stats
          const totalSolved = scores.length;
          const sum = scores.reduce((acc, curr) => acc + (curr.score || 0), 0);
          const avgScore = totalSolved > 0 ? (sum / totalSolved).toFixed(1) : '0';
          
          let best = 0;
          let bestProblem = 'None';
          scores.forEach(s => {
            if (s.score && s.score > best) {
              best = s.score;
              bestProblem = (s.problems as any)?.title || 'Unknown Problem';
            }
          });

          setStats({ totalSolved, avgScore: parseFloat(avgScore), bestScore: best, bestProblem });

          // Aggregate for Chart (by month)
          const monthMap: Record<string, number[]> = {};
          scores.forEach(s => {
            const date = new Date(s.created_at);
            const monthLabel = date.toLocaleString('default', { month: 'short' });
            if (!monthMap[monthLabel]) monthMap[monthLabel] = [];
            if (s.score) monthMap[monthLabel].push(s.score);
          });

          const formattedData = Object.keys(monthMap).map(month => {
            const arr = monthMap[month];
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            return { month, score: Math.round(avg) };
          });

          setChartData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching performance data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [profile?.id]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header>
        <h2 className="text-white font-semibold text-2xl mb-1">My Performance</h2>
        <p className="text-white/40 text-sm">Track your progress and identify areas for improvement.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Solved" 
          value={loading ? '-' : stats.totalSolved} 
          icon={<Target size={18} />} 
          color="blue" 
        />
        <StatCard 
          title="Average Score" 
          value={loading ? '-' : stats.avgScore} 
          icon={<TrendingUp size={18} />} 
          color="teal" 
        />
        <StatCard 
          title="Best Score" 
          value={loading ? '-' : stats.bestScore} 
          icon={<Award size={18} />} 
          color="amber" 
          subtitle={loading ? '' : stats.bestProblem} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg">Score Trend</h3>
            <p className="text-white/40 text-sm">Your average score progression over the last 7 months</p>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-white/50 animate-pulse">Loading chart data...</div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-white/50">No scores recorded yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C29A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C29A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1426', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#00C29A' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#00C29A" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="rounded-xl p-6 flex flex-col" style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg">Skill Breakdown</h3>
            <p className="text-white/40 text-sm">Based on peer & expert reviews</p>
          </div>
          
          <div className="flex-1 space-y-5 flex flex-col justify-center">
            {[
              { skill: 'Root Cause Analysis', val: 92, color: 'bg-teal-500' },
              { skill: 'Experiment Design', val: 78, color: 'bg-blue-500' },
              { skill: 'Metric Selection', val: 85, color: 'bg-purple-500' },
              { skill: 'Product Sense', val: 88, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.skill}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80 font-medium">{item.skill}</span>
                  <span className="text-white font-bold">{item.val}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
