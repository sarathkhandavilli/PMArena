interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'teal' | 'purple' | 'amber' | 'red';
  trend?: { value: number; label: string };
}

const COLOR_MAP = {
  blue:   { bg: 'rgba(37,99,235,0.12)',   icon: 'rgba(37,99,235,0.2)',   text: '#60A5FA', border: 'rgba(37,99,235,0.2)' },
  teal:   { bg: 'rgba(0,194,154,0.10)',   icon: 'rgba(0,194,154,0.18)',  text: '#00C29A', border: 'rgba(0,194,154,0.2)' },
  purple: { bg: 'rgba(139,92,246,0.10)',  icon: 'rgba(139,92,246,0.18)', text: '#A78BFA', border: 'rgba(139,92,246,0.2)' },
  amber:  { bg: 'rgba(245,158,11,0.10)',  icon: 'rgba(245,158,11,0.18)', text: '#FCD34D', border: 'rgba(245,158,11,0.2)' },
  red:    { bg: 'rgba(239,68,68,0.10)',   icon: 'rgba(239,68,68,0.18)',  text: '#F87171', border: 'rgba(239,68,68,0.2)' },
};

export default function StatCard({ title, value, subtitle, icon, color = 'blue', trend }: StatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div
      className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: '#0F1B2D',
        border: `1px solid ${c.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: c.icon }}
        >
          <span style={{ color: c.text }}>{icon}</span>
        </div>
        {trend && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trend.value >= 0 ? 'rgba(0,194,154,0.12)' : 'rgba(239,68,68,0.12)',
              color: trend.value >= 0 ? '#00C29A' : '#F87171',
            }}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>

      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
      {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}
