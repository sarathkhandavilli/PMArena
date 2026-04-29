import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import StatCard from '@/components/ui/StatCard';
import { BookOpen, Upload, Users, CheckCircle } from 'lucide-react';

export default function AdminHome() {
  const [stats, setStats] = useState({ problems: 0, imports: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [{ count: problems }, { count: imports }, { count: users }] = await Promise.all([
        supabase.from('problems').select('*', { count: 'exact', head: true }),
        supabase.from('imports').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'EMPLOYEE'),
      ]);
      setStats({ problems: problems ?? 0, imports: imports ?? 0, users: users ?? 0 });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-white font-semibold text-lg mb-1">Welcome back 👋</h2>
        <p className="text-white/40 text-sm">Here's what's happening on PM Arena today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Problems" value={loading ? '—' : stats.problems} icon={<BookOpen size={18} />} color="blue" />
        <StatCard title="Total Imports" value={loading ? '—' : stats.imports} icon={<Upload size={18} />} color="teal" />
        <StatCard title="Employees" value={loading ? '—' : stats.users} icon={<Users size={18} />} color="purple" />
        <StatCard title="Active Problems" value={loading ? '—' : stats.problems} icon={<CheckCircle size={18} />} color="amber" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Import Problems', desc: 'Upload an Excel file to add problems in bulk', href: '/admin/imports', color: '#00C29A', icon: <Upload size={20} /> },
          { title: 'Manage Problems', desc: 'Search, filter and view all PM case problems', href: '/admin/problems', color: '#2563EB', icon: <BookOpen size={20} /> },
        ].map(card => (
          <Link
            key={card.href}
            to={card.href}
            className="group flex items-center gap-4 p-5 rounded-xl transition-all hover:translate-y-[-2px]"
            style={{ background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${card.color}18` }}>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{card.title}</p>
              <p className="text-white/40 text-xs mt-0.5">{card.desc}</p>
            </div>
            <span className="ml-auto text-white/20 group-hover:text-white/60 transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
