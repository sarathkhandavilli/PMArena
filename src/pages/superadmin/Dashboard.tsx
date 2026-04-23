import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center bg-indigo-950 text-white p-6 rounded-xl shadow-lg border border-indigo-900">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Super Admin Observatory</h1>
          <p className="text-indigo-300 mt-1">Global Access • {profile?.name}</p>
        </div>
        <Button onClick={handleLogout} className="bg-indigo-600 hover:bg-indigo-700 font-semibold">Logout</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-600">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Global Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">Normal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
