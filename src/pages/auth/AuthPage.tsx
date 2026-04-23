import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInUser, signUpEmployee } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
}

export default function AuthPage() {
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTenantId, setRegTenantId] = useState('');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fetchingTenants, setFetchingTenants] = useState(true);

  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  // Redirect if already logged in or handle missing profile
  useEffect(() => {
    console.log("AuthPage useEffect routing check: ", { authLoading, user: user?.id, profile: profile?.role });
    if (!authLoading) {
      if (user && profile) {
        console.log("AuthPage navigating to: ", profile.role);
        if (profile.role === 'SUPER_ADMIN') navigate('/super-admin');
        else if (profile.role === 'ADMIN') navigate('/admin');
        else if (profile.role === 'EMPLOYEE') navigate('/dashboard');
      } else if (user && !profile) {
        console.log("AuthPage user exists but no profile. Logging out.");
        // Auth session exists but no profile in DB
        toast.error('Account profile missing or inactive. Please contact support.');
        supabase.auth.signOut();
        setIsLoggingIn(false);
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Fetch active tenants for registration
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name')
          .eq('is_active', true);

        if (error) throw error;
        setTenants(data || []);
      } catch (err) {
        console.error('Failed to fetch tenants:', err);
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
      console.log(data);

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      toast.success('Login successful! Verifying profile...');
      // We do not navigate here manually. 
      // The AuthContext will fetch the profile in the background, update the state, 
      // and the useEffect above will redirect the user automatically.

    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      setIsLoggingIn(false);
    }
    // We intentionally DO NOT set isLoggingIn(false) in finally if login succeeded,
    // so the button stays "Verifying..." while AuthContext loads profile and redirects.
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTenantId) {
      toast.error('Please select an organization.');
      return;
    }

    setIsRegistering(true);
    try {
      // Validates limits, sets up Auth User, syncs DB `users` table, and updates tenant count
      await signUpEmployee(regEmail, regPassword, regName, regTenantId);

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50">

      {/* Left Screen - Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-zinc-950 p-12 text-zinc-50 border-r border-zinc-800">
        <div className="flex items-center gap-2">
          {/* Conceptual Logo */}
          <div className="w-10 h-10 bg-indigo-500 rounded-md flex items-center justify-center font-bold text-xl">
            P
          </div>
          <span className="text-2xl font-bold tracking-tight">PM Arena</span>
        </div>

        <div className="my-auto space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            LeetCode<br />
            <span className="text-indigo-400">for Product Managers</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            The standard resource for accelerating your PM career. Upskill, practice cases, and tackle real-world strategy problems structurally.
          </p>
        </div>

        <div className="text-sm text-zinc-500 font-medium tracking-wide">
          © {new Date().getFullYear()} PM Arena. All rights reserved.
        </div>
      </div>

      {/* Right Screen - Interaction Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">

        <div className="w-full max-w-sm mb-6 lg:hidden flex justify-center items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center font-bold text-white">P</div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">PM Arena</span>
        </div>

        <div className="w-full max-w-[400px]">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-lg bg-slate-100 p-1 shadow-inner">
              <TabsTrigger value="login" className="rounded-md transition-all">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md transition-all">Register</TabsTrigger>
            </TabsList>

            {/* TAB: LOGIN */}
            <TabsContent value="login">
              <Card className="border-slate-200 shadow-sm border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Sign in to your account</CardTitle>
                  <CardDescription className="text-slate-500">
                    Enter your email and password below to login.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4 px-0">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="transition-colors focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="transition-colors focus-visible:ring-indigo-500"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="px-0 pt-4 flex flex-col items-start gap-4">
                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? 'Verifying...' : 'Login'}
                    </Button>
                    <p className="text-sm text-slate-500 text-center w-full">
                      Forgot password? <a href="#" className="underline underline-offset-4 hover:text-indigo-600">Reset it</a>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* TAB: REGISTER */}
            <TabsContent value="register">
              <Card className="border-slate-200 shadow-sm border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Create an account</CardTitle>
                  <CardDescription className="text-slate-500">
                    Employees can setup their organizational access below.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4 px-0">

                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="transition-colors focus-visible:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="transition-colors focus-visible:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Select disabled={fetchingTenants} value={regTenantId} onValueChange={setRegTenantId} required>
                        <SelectTrigger className="w-full focus:ring-indigo-500">
                          <SelectValue placeholder={fetchingTenants ? 'Loading...' : 'Select your company'} />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">Admin registration is disabled. Super Admins/Admins should use Login.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="transition-colors focus-visible:ring-indigo-500"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="px-0 pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all"
                      disabled={isRegistering || fetchingTenants}
                    >
                      {isRegistering ? 'Creating Account...' : 'Register'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
