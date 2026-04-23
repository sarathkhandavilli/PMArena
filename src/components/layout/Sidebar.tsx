import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import { toast } from 'sonner';
import {
  LayoutDashboard, Building2, Users, LogOut,
  ChevronLeft, ChevronRight, Zap, BookOpen,
  Upload, Menu, X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const SUPER_ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/super-admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Tenants', href: '/super-admin/tenants', icon: <Building2 size={18} /> },
  { label: 'Admins', href: '/super-admin/admins', icon: <Users size={18} /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Problems', href: '/admin/problems', icon: <BookOpen size={18} /> },
  { label: 'Imports', href: '/admin/imports', icon: <Upload size={18} /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = profile?.role === 'SUPER_ADMIN' ? SUPER_ADMIN_NAV : ADMIN_NAV;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isActive = (href: string) => {
    if (href === '/super-admin' || href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(180deg, #0d1b3e 0%, #0B1426 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-3 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px' }}
      >
        {!collapsed && (
          <>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #00C29A)' }}
            >
              <Zap size={16} />
            </div>
            <span className="text-white font-bold text-base tracking-tight flex-1">PM Arena</span>
          </>
        )}
        <button
          className="text-white/40 hover:text-white/80 transition-all hidden lg:flex items-center justify-center w-7 h-7 rounded-md"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(0,194,154,0.12)',
              color: '#00C29A',
              border: '1px solid rgba(0,194,154,0.2)',
            }}
          >
            {profile?.role?.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                background: active ? 'rgba(37,99,235,0.18)' : 'transparent',
                borderLeft: active ? '2px solid #00C29A' : '2px solid transparent',
              }}
            >
              <span style={{ color: active ? '#00C29A' : 'inherit' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pb-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-white text-xs font-semibold truncate">{profile?.name || profile?.email}</p>
            <p className="text-white/40 text-xs truncate">{profile?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: '#0d1b3e', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300"
        style={{ width: collapsed ? '64px' : '220px' }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
