import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/ui/PageLoading';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const INPUT_STYLE = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', fontSize: '14px', outline: 'none',
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadAdmins = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').eq('role', 'ADMIN').order('created_at', { ascending: false });
    setAdmins(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleCreate = async () => {
    if (!form.email.trim() || !form.name.trim() || !form.password.trim()) {
      toast.error('All fields are required'); return;
    }
    setSaving(true);
    try {
      // Use a temporary client that doesn't persist the session
      // This avoids logging out the current super admin
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      // Create auth user
      const { data: authData, error: authErr } = await tempClient.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, role: 'ADMIN' },
        },
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error('User creation failed');

      // Insert into users table using the temp client (which is now signed in as the new admin)
      const { error: dbErr } = await tempClient.from('users').insert({
        id: authData.user.id,
        email: form.email,
        name: form.name,
        role: 'ADMIN',
        tenant_id: null,
      });
      
      // Sign out the temp client
      await tempClient.auth.signOut();
      
      if (dbErr) throw dbErr;

      toast.success('Admin created');
      setModalOpen(false);
      setForm({ email: '', name: '', password: '' });
      loadAdmins();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = admins.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name', label: 'Name', render: (row: Admin) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563EB,#00C29A)' }}>
            {(row.name || row.email || 'A')[0].toUpperCase()}
          </div>
          <span className="font-medium text-white">{row.name || '—'}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email', render: (row: Admin) => <span className="text-white/60">{row.email}</span> },
    {
      key: 'role', label: 'Role', render: (row: Admin) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.2)' }}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'is_active', label: 'Status', render: (row: Admin) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={row.is_active
            ? { background: 'rgba(0,194,154,0.12)', color: '#00C29A', border: '1px solid rgba(0,194,154,0.2)' }
            : { background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }
          }>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Joined', render: (row: Admin) => <span className="text-white/40 text-xs">{new Date(row.created_at).toLocaleDateString()}</span> },
  ];

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Admins</h2>
          <p className="text-white/40 text-xs mt-0.5">{admins.length} admin users</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(90deg,#2563EB,#00C29A)' }}
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      <input placeholder="Search admins..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...INPUT_STYLE, width: '280px' }} />

      <DataTable columns={columns as any} data={filtered} loading={loading} rowKey="id" emptyMessage="No admins found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Admin">
        <div className="space-y-4">
          {(['name', 'email', 'password'] as const).map(field => (
            <div key={field} className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium capitalize">{field}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                placeholder={field === 'name' ? 'Jane Doe' : field === 'email' ? 'jane@company.com' : '••••••••'}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                style={INPUT_STYLE}
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white/60" style={{ background: 'rgba(255,255,255,0.06)' }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(90deg,#2563EB,#00C29A)', opacity: saving ? 0.7 : 1 }}>
              <UserPlus size={15} /> {saving ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
