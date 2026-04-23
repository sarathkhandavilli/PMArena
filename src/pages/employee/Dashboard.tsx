import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Employee Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {profile?.name || 'User'}</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="text-slate-600">Logout</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-600">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">0 pts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
