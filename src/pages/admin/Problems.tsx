import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import DataTable from '@/components/ui/DataTable';
import { Search, Filter } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  company: string;
  signal: string;
  difficulty: string;
  department: string;
  industry: string;
}

const BADGE = (label: string, color: string) => (
  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
    background: `${color}18`, color: color, border: `1px solid ${color}30`,
  }}>{label}</span>
);

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#00C29A', Medium: '#F59E0B', Hard: '#EF4444',
};

const INPUT_STYLE = {
  padding: '9px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', fontSize: '13px', outline: 'none',
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ industry: '', company: '', signal: '', difficulty: '' });
  const [industries, setIndustries] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [signals, setSignals] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('problems').select('*').order('created_at', { ascending: false });
      const rows = data ?? [];
      setProblems(rows);
      setIndustries([...new Set(rows.map(r => r.industry).filter(Boolean))]);
      setCompanies([...new Set(rows.map(r => r.company).filter(Boolean))]);
      setSignals([...new Set(rows.map(r => r.signal).filter(Boolean))]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = problems.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q);
    const matchIndustry = !filters.industry || p.industry === filters.industry;
    const matchCompany = !filters.company || p.company === filters.company;
    const matchSignal = !filters.signal || p.signal === filters.signal;
    const matchDiff = !filters.difficulty || p.difficulty === filters.difficulty;
    return matchSearch && matchIndustry && matchCompany && matchSignal && matchDiff;
  });

  const columns = [
    { key: 'title', label: 'Title', render: (row: Problem) => <span className="font-medium text-white line-clamp-1">{row.title}</span> },
    { key: 'company', label: 'Company', render: (row: Problem) => <span className="text-white/60">{row.company || '—'}</span> },
    { key: 'signal', label: 'Signal', render: (row: Problem) => row.signal ? BADGE(row.signal, '#A78BFA') : <span className="text-white/30">—</span> },
    { key: 'difficulty', label: 'Difficulty', render: (row: Problem) => row.difficulty ? BADGE(row.difficulty, DIFFICULTY_COLOR[row.difficulty] ?? '#60A5FA') : <span className="text-white/30">—</span> },
    { key: 'department', label: 'Dept', render: (row: Problem) => <span className="text-white/50 text-xs">{row.department || '—'}</span> },
  ];

  const SELECT_STYLE = { ...INPUT_STYLE, paddingRight: '32px', appearance: 'none' as const, cursor: 'pointer' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-white font-semibold text-lg">Problems</h2>
        <p className="text-white/40 text-xs mt-0.5">{filtered.length} problems found</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...INPUT_STYLE, paddingLeft: '32px', width: '220px' }}
          />
        </div>

        <div className="flex items-center gap-2 text-white/30">
          <Filter size={14} />
        </div>

        {[
          { label: 'Industry', key: 'industry', options: industries },
          { label: 'Company', key: 'company', options: companies },
          { label: 'Signal', key: 'signal', options: signals },
          { label: 'Difficulty', key: 'difficulty', options: ['Easy', 'Medium', 'Hard'] },
        ].map(f => (
          <select
            key={f.key}
            value={filters[f.key as keyof typeof filters]}
            onChange={e => setFilters(ff => ({ ...ff, [f.key]: e.target.value }))}
            style={SELECT_STYLE}
          >
            <option value="">{f.label}</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}

        {Object.values(filters).some(Boolean) && (
          <button
            onClick={() => setFilters({ industry: '', company: '', signal: '', difficulty: '' })}
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Clear
          </button>
        )}
      </div>

      <DataTable columns={columns as any} data={filtered} loading={loading} rowKey="id" emptyMessage="No problems found. Import some using the Imports page." />
    </div>
  );
}
