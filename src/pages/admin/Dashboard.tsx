import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center bg-zinc-900 text-white p-6 rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="text-zinc-400 mt-1">Tenant Administrator • {profile?.name}</p>
        </div>
        <Button onClick={handleLogout} variant="secondary" className="font-semibold">Logout</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tenant Quota Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-rose-500">0 / 0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
