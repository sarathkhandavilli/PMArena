import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import { Building2, Users, CheckCircle, ShieldCheck } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  max_users: number;
  current_users: number;
  is_active: boolean;
  created_at: string;
}

export default function SuperAdminHome() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [{ data: tenantData }, { count: userCount }, { count: adminCount }] = await Promise.all([
        supabase.from('tenants').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'ADMIN'),
      ]);
      setTenants(tenantData ?? []);
      setTotalUsers(userCount ?? 0);
      setTotalAdmins(adminCount ?? 0);
      setLoading(false);
    };
    fetch();
  }, []);

  const activeTenants = tenants.filter(t => t.is_active).length;

  const columns = [
    { key: 'name', label: 'Tenant Name', render: (row: Tenant) => (
      <span className="font-medium text-white">{row.name}</span>
    )},
    { key: 'current_users', label: 'Users', render: (row: Tenant) => (
      <span className="text-white/70">{row.current_users} / {row.max_users}</span>
    )},
    { key: 'is_active', label: 'Status', render: (row: Tenant) => (
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={row.is_active
          ? { background: 'rgba(0,194,154,0.12)', color: '#00C29A', border: '1px solid rgba(0,194,154,0.2)' }
          : { background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }
        }
      >
        {row.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'created_at', label: 'Created', render: (row: Tenant) => (
      <span className="text-white/40 text-xs">{new Date(row.created_at).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tenants" value={loading ? '—' : tenants.length} icon={<Building2 size={18} />} color="blue" />
        <StatCard title="Total Users" value={loading ? '—' : totalUsers} icon={<Users size={18} />} color="teal" />
        <StatCard title="Active Tenants" value={loading ? '—' : activeTenants} icon={<CheckCircle size={18} />} color="purple" />
        <StatCard title="Total Admins" value={loading ? '—' : totalAdmins} icon={<ShieldCheck size={18} />} color="amber" />
      </div>

      {/* Tenant Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Tenant Overview</h2>
            <p className="text-white/40 text-xs mt-0.5">All registered organizations</p>
          </div>
          <Link to="/super-admin/tenants" className="text-xs font-medium" style={{ color: '#00C29A' }}>
            Manage →
          </Link>
        </div>
        <DataTable
          columns={columns as any}
          data={tenants.slice(0, 8)}
          loading={loading}
          rowKey="id"
          emptyMessage="No tenants created yet."
        />
      </div>
    </div>
  );
}
