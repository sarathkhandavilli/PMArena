import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/ui/DataTable';
import { Upload, CloudUpload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { TableSkeleton } from '@/components/ui/PageLoading';

interface ImportLog {
  id: string;
  file_name: string;
  rows_processed: number;
  status: string;
  created_at: string;
  uploaded_by: string;
}

const STATUS_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  success: { bg: 'rgba(0,194,154,0.12)', color: '#00C29A', border: 'rgba(0,194,154,0.2)' },
  partial: { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: 'rgba(245,158,11,0.2)' },
  failed: { bg: 'rgba(239,68,68,0.1)', color: '#F87171', border: 'rgba(239,68,68,0.2)' },
};

export default function ImportsPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();

  const loadLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('imports').select('*').order('created_at', { ascending: false });
    setLogs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Only Excel (.xlsx/.xls) or CSV files are supported');
      return;
    }

    setUploading(true);
    let rowsProcessed = 0;
    let status = 'success';

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet);

      rowsProcessed = rows.length;
      if (rowsProcessed === 0) throw new Error('No data rows found in the file');

      // Map rows to problems table schema
      const problems = rows.map(row => ({
        title: row['title'] || row['Title'] || '',
        company: row['company'] || row['Company'] || '',
        signal: row['signal'] || row['Signal'] || '',
        severity: (row['severity'] || row['Severity']) ? parseInt(String(row['severity'] || row['Severity']), 10) : null,
        department: row['department'] || row['Department'] || '',
        industry: row['industry'] || row['Industry'] || '',
        sub_industry: row['sub_industry'] || row['SubIndustry'] || row['Sub Industry'] || '',
        user_comment: row['user_comment'] || row['UserComment'] || row['User Comment'] || '',
        problem_statement: row['problem_statement'] || row['ProblemStatement'] || row['Problem Statement'] || '',
      })).filter(p => p.title);

      if (problems.length === 0) {
        throw new Error('No valid problems found. Ensure your file has a "title" column.');
      }

      const { error } = await supabase.from('problems').insert(problems);
      if (error) {
        status = 'partial';
        toast.warning(`Imported with errors: ${error.message}`);
      } else {
        toast.success(`Successfully imported ${problems.length} problems!`);
      }
    } catch (e: any) {
      status = 'failed';
      toast.error(e.message || 'Import failed');
    }

    // Log the import
    await supabase.from('imports').insert({
      file_name: file.name,
      rows_processed: rowsProcessed,
      status,
      uploaded_by: profile?.id,
    });

    setUploading(false);
    loadLogs();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const columns = [
    {
      key: 'file_name', label: 'File Name', render: (row: ImportLog) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={15} style={{ color: '#00C29A' }} />
          <span className="font-medium text-white">{row.file_name}</span>
        </div>
      )
    },
    { key: 'rows_processed', label: 'Rows', render: (row: ImportLog) => <span className="text-white/70">{row.rows_processed}</span> },
    {
      key: 'status', label: 'Status', render: (row: ImportLog) => {
        const c = STATUS_COLOR[row.status] ?? STATUS_COLOR.partial;
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'created_at', label: 'Uploaded At', render: (row: ImportLog) => (
        <span className="text-white/40 text-xs">{new Date(row.created_at).toLocaleString()}</span>
      )
    },
  ];

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div>
        <h2 className="text-white font-semibold text-lg">Import Data</h2>
        <p className="text-white/40 text-xs mt-0.5">Upload Excel files to bulk-import PM problems</p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="rounded-2xl flex flex-col items-center justify-center gap-4 py-14 cursor-pointer transition-all"
        style={{
          background: dragOver ? 'rgba(0,194,154,0.07)' : 'rgba(255,255,255,0.02)',
          border: `2px dashed ${dragOver ? '#00C29A' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '16px',
        }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: uploading ? 'rgba(0,194,154,0.15)' : 'rgba(255,255,255,0.06)' }}>
          {uploading
            ? <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            : <CloudUpload size={28} className="text-white/40" />
          }
        </div>
        <div className="text-center">
          <p className="text-white/80 font-semibold text-sm">
            {uploading ? 'Processing file...' : 'Drop your file here or click to browse'}
          </p>
          <p className="text-white/30 text-xs mt-1">Supports .xlsx, .xls, .csv files</p>
        </div>
        {!uploading && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(90deg,#2563EB,#00C29A)' }}
          >
            <Upload size={15} /> Choose File
          </button>
        )}
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Format hint */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
        <p className="text-blue-300 text-xs font-semibold mb-1">📋 Expected columns</p>
        <p className="text-blue-300/60 text-xs font-mono">title, company, signal, severity, department, industry, sub_industry, user_comment, problem_statement</p>
      </div>

      {/* History */}
      <div>
        <h3 className="text-white font-semibold mb-4">Upload History</h3>
        <DataTable columns={columns as any} data={logs} loading={loading} rowKey="id" emptyMessage="No imports yet. Upload a file to get started." />
      </div>
    </div>
  );
}
