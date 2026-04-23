import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PAGE_TITLES: Record<string, string> = {
  '/super-admin': 'Overview',
  '/super-admin/tenants': 'Tenant Management',
  '/super-admin/admins': 'Admin Management',
  '/admin': 'Overview',
  '/admin/problems': 'Problem Management',
  '/admin/imports': 'Import Data',
};

export default function Topbar() {
  const location = useLocation();
  const { profile } = useAuth();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  const initials = (profile?.name || profile?.email || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(11,20,38,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div>
        <h1 className="text-white font-semibold text-lg">{title}</h1>
        <p className="text-white/40 text-xs">PM Arena Admin Panel</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <Bell size={18} className="text-white/50" />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none"
          style={{ background: 'linear-gradient(135deg, #2563EB, #00C29A)' }}
          title={profile?.name || profile?.email}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
