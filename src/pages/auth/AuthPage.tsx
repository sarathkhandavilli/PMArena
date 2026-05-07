import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInUser, signUpEmployee } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Mail, Lock, Eye, EyeOff, User, Building2,
  Sparkles, Target, Zap, ArrowRight, AlertCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Tenant {
  id: string;
  name: string;
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regTenantId, setRegTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fetchingTenants, setFetchingTenants] = useState(true);

  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isFetchingProfile } = useAuth();
  console.log("this is profile", profile)

  // Redirect if already logged in
  useEffect(() => {
    // If it's performing the initial session load or fetching a profile, wait.
    if (authLoading || isFetchingProfile) return;

    if (user && profile) {
      if (profile.role === 'SUPER_ADMIN') navigate('/super-admin');
      else if (profile.role === 'ADMIN') navigate('/admin');
      else if (profile.role === 'EMPLOYEE') navigate('/dashboard');
    } else if (user && !profile) {
      toast.error('Account profile missing or inactive. Please contact support.');
      supabase.auth.signOut();
      setIsLoggingIn(false);
    }
  }, [user, profile, authLoading, isFetchingProfile, navigate]);

  // Fetch tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name')
          .eq('is_active', true);
        if (error) throw error;
        setTenants(data || []);
      } catch {
        toast.error('Failed to load organizations.');
      } finally {
        setFetchingTenants(false);
      }
    };
    fetchTenants();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const data = await signInUser(loginEmail, loginPassword);
      if (!data.user) throw new Error('Authentication failed');
      toast.success('Login successful! Verifying profile...');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regTenantId) {
      toast.error('Please select an organization.');
      return;
    }

    setIsRegistering(true);

    try {
      const data = await signUpEmployee(
        regEmail,
        regPassword,
        regName,
        regTenantId
      );

      if (!data.user) {
        throw new Error('Signup failed');
      }

      toast.success('Account created successfully!');

      // AuthContext will auto redirect
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .auth-select-trigger:focus, .auth-select-trigger[data-state="open"] {
          box-shadow: none !important;
          outline: none !important;
          border-color: #E5E7EB !important;
          ring: 0 !important;
        }
        .auth-select-trigger svg, .auth-select-content svg {
          color: #111827 !important;
          opacity: 1 !important;
        }
        .auth-select-item {
          background-color: transparent !important;
          color: #111827 !important;
          transition: background-color 0.2s ease;
        }
        .auth-select-item:hover {
          background-color: #F3F4F6 !important;
        }
        .auth-select-item[data-highlighted] {
          /* Prevent radix default highlighted background */
          background-color: transparent !important;
          color: #111827 !important;
        }
        .auth-select-item[data-highlighted]:hover {
          /* Apply hover background even when highlighted */
          background-color: #F3F4F6 !important;
        }
      `}</style>

      {/* ── LEFT PANEL: Deep Navy Branding ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1426 0%, #0d1b3e 50%, #071428 100%)' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(0,194,154,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Top badge */}
        <div className="relative z-10 flex items-center gap-2 w-fit px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <Sparkles size={14} className="text-teal-400" />
          <span className="text-xs font-medium text-white/70 tracking-wide">Product Management Excellence</span>
        </div>

        {/* Main hero text */}
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-5xl">👉</span>
            <h1 className="text-5xl font-extrabold text-white tracking-tight">PM Arena</h1>
          </div>
          <p className="text-3xl font-bold leading-snug" style={{ color: '#00C29A' }}>
            LeetCode for Product Managers
          </p>
          <p className="text-white/60 text-base max-w-sm leading-relaxed">
            Solve real-world product problems. Improve your PM thinking through hands-on practice and expert feedback.
          </p>
        </div>

        {/* Feature icons */}
        <div className="relative z-10 flex gap-6">
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
              <Target size={18} className="text-blue-400" />
            </div>
            <p className="text-white text-sm font-semibold">Real Problems</p>
            <p className="text-white/40 text-xs">Practice with actual PM scenarios</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,194,154,0.2)' }}>
              <Zap size={18} style={{ color: '#00C29A' }} />
            </div>
            <p className="text-white text-sm font-semibold">Instant Feedback</p>
            <p className="text-white/40 text-xs">Learn from detailed evaluations</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
              <Sparkles size={18} className="text-purple-400" />
            </div>
            <p className="text-white text-sm font-semibold">Level Up</p>
            <p className="text-white/40 text-xs">Track your PM skill growth</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">

        {/* Mobile logo */}
        <div className="w-full max-w-sm mb-8 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#00C29A' }}>P</div>
          <span className="text-xl font-bold text-gray-900">PM Arena</span>
        </div>

        <div className="w-full max-w-[400px]">

          {/* ── TABS ── */}
          <div className="flex border-b border-gray-200 mb-8">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 pb-3 text-sm font-semibold capitalize transition-all"
                style={{
                  color: activeTab === tab ? '#111827' : '#9CA3AF',
                  borderBottom: activeTab === tab ? '2px solid #00C29A' : '2px solid transparent',
                }}
              >
                {tab === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                    style={{
                      borderColor: loginEmail ? '#00C29A' : '#E5E7EB',
                      boxShadow: loginEmail ? '0 0 0 3px rgba(0,194,154,0.1)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-teal-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium" style={{ color: '#00C29A' }}>
                  Forgot password?
                </a>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70"
                style={{ background: 'linear-gradient(90deg, #2563EB 0%, #00C29A 100%)' }}
              >
                {isLoggingIn ? 'Verifying...' : (
                  <><span>Sign in</span><ArrowRight size={16} /></>
                )}
              </button>

              {/* Help link */}
              <p className="text-center text-sm text-gray-500">
                Need help?{' '}
                <a href="#" className="font-semibold" style={{ color: '#00C29A' }}>Contact support</a>
              </p>

              {/* Footer */}
              <p className="text-center text-xs text-gray-400 mt-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleSignup}>

              {/* Info banner */}
              <div className="flex items-start gap-3 p-3 -mt-2 rounded-lg" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Employee registration only.</strong> Admins and Super Admins are pre-created and can only login.
                </p>
              </div>

              {/* Full name */}
              <div className="space-y-1.5 mt-2">
                <label className="text-sm font-medium text-gray-700">Full name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Organization</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <Select
                    required
                    disabled={fetchingTenants}
                    value={regTenantId}
                    onValueChange={(val) => setRegTenantId(val)}
                  >
                    <SelectTrigger
                      className="auth-select-trigger w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white outline-none h-[42px]"
                      style={{ borderColor: '#E5E7EB' }}
                    >
                      <SelectValue placeholder={fetchingTenants ? 'Loading...' : 'Search organization...'} />
                    </SelectTrigger>
                    <SelectContent className="auth-select-content bg-white border border-gray-200 shadow-sm rounded-lg max-h-[200px]">
                      {tenants.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                          className="auth-select-item cursor-pointer pl-8 py-2 text-sm"
                        >
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Create account button */}
              <button
                type="submit"
                disabled={isRegistering || fetchingTenants}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70 mt-2"
                style={{ background: 'linear-gradient(90deg, #2563EB 0%, #00C29A 100%)' }}
              >
                {isRegistering ? 'Creating Account...' : (
                  <><span>Create account</span><ArrowRight size={16} /></>
                )}
              </button>

              {/* Footer */}
              <p className="text-center text-xs text-gray-400 pt-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
