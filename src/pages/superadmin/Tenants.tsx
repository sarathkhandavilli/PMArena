import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Plus, Building2, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  max_users: number;
  current_users: number;
  is_active: boolean;
  created_at: string;
}

const FIELD = (label: string, child: React.ReactNode) => (
  <div className="space-y-1.5">
    <label className="text-white/60 text-xs font-medium">{label}</label>
    {child}
  </div>
);

const INPUT_STYLE = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', fontSize: '14px', outline: 'none',
};

const BTN = ({ children, onClick, style, disabled, type = 'button' }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
    style={style}
  >
    {children}
  </button>
);

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState({ name: '', max_users: 10 });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadTenants = async () => {
    setLoading(true);
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    setTenants(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadTenants(); }, []);

  const openCreate = () => {
    setEditTenant(null);
    setForm({ name: '', max_users: 10 });
    setModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditTenant(t);
    setForm({ name: t.name, max_users: t.max_users });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Tenant name is required'); return; }
    setSaving(true);
    try {
      if (editTenant) {
        const { error } = await supabase.from('tenants').update({ name: form.name, max_users: form.max_users }).eq('id', editTenant.id);
        if (error) throw error;
        toast.success('Tenant updated');
      } else {
        const { error } = await supabase.from('tenants').insert({ name: form.name, max_users: form.max_users, current_users: 0, is_active: true });
        if (error) throw error;
        toast.success('Tenant created');
      }
      setModalOpen(false);
      loadTenants();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: Tenant) => {
    const { error } = await supabase.from('tenants').update({ is_active: !t.is_active }).eq('id', t.id);
    if (error) toast.error('Update failed'); else { toast.success(`Tenant ${t.is_active ? 'deactivated' : 'activated'}`); loadTenants(); }
  };

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'name', label: 'Tenant Name', render: (row: Tenant) => <span className="font-medium text-white">{row.name}</span> },
    { key: 'current_users', label: 'Users', render: (row: Tenant) => (
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (row.current_users / row.max_users) * 100)}%`, background: '#00C29A' }} />
        </div>
        <span className="text-white/50 text-xs">{row.current_users}/{row.max_users}</span>
      </div>
    )},
    { key: 'is_active', label: 'Status', render: (row: Tenant) => (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={row.is_active
        ? { background: 'rgba(0,194,154,0.12)', color: '#00C29A', border: '1px solid rgba(0,194,154,0.2)' }
        : { background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }
      }>{row.is_active ? 'Active' : 'Inactive'}</span>
    )},
    { key: 'created_at', label: 'Created', render: (row: Tenant) => <span className="text-white/40 text-xs">{new Date(row.created_at).toLocaleDateString()}</span> },
    { key: 'actions', label: 'Actions', render: (row: Tenant) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} onMouseEnter={e => (e.currentTarget.style.color = '#60A5FA')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
          <Pencil size={14} />
        </button>
        <button onClick={() => toggleActive(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: row.is_active ? '#00C29A' : 'rgba(255,255,255,0.3)' }}>
          {row.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Tenants</h2>
          <p className="text-white/40 text-xs mt-0.5">{tenants.length} organizations registered</p>
        </div>
        <BTN onClick={openCreate} style={{ background: 'linear-gradient(90deg,#2563EB,#00C29A)', color: 'white' }}>
          <Plus size={16} /> Add Tenant
        </BTN>
      </div>

      {/* Search */}
      <input
        placeholder="Search tenants..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...INPUT_STYLE, width: '280px' }}
      />

      <DataTable columns={columns as any} data={filtered} loading={loading} rowKey="id" emptyMessage="No tenants found." />

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTenant ? 'Edit Tenant' : 'Create Tenant'}>
        <div className="space-y-4">
          {FIELD('Tenant Name', (
            <input
              placeholder="Acme Corp"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={INPUT_STYLE}
            />
          ))}
          {FIELD('Max Users', (
            <input
              type="number"
              min={1}
              value={form.max_users}
              onChange={e => setForm(f => ({ ...f, max_users: parseInt(e.target.value) || 1 }))}
              style={INPUT_STYLE}
            />
          ))}
          <div className="flex gap-3 pt-2">
            <BTN onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', color: 'white', flex: 1 }}>Cancel</BTN>
            <BTN onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(90deg,#2563EB,#00C29A)', color: 'white', flex: 1, justifyContent: 'center' }}>
              <Building2 size={15} /> {saving ? 'Saving...' : editTenant ? 'Update' : 'Create'}
            </BTN>
          </div>
        </div>
      </Modal>
    </div>
  );
}
