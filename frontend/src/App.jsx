import { useState, useEffect, useCallback } from 'react';
import { STATUSES, apiFetch } from './constants.js';
import JobCard from './components/JobCard.jsx';
import JobModal from './components/JobModal.jsx';
import './index.css';

export default function App() {
  const [jobs, setJobs]           = useState([]);
  const [sales, setSales]         = useState([]);
  const [filterSales, setFilter]  = useState('all');
  const [filterStatus, setFStatus]= useState('');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);  // job object or 'new'
  const [isProduction, setIsProd] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginErr, setLoginErr]   = useState('');
  const [toast, setToast]         = useState('');
  const [loading, setLoading]     = useState(true);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // Check existing token
  useEffect(() => {
    const t = localStorage.getItem('pf_token');
    if (t) setIsProd(true);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [jRes, sRes] = await Promise.all([
      apiFetch('/api/jobs'),
      apiFetch('/api/sales'),
    ]);
    setJobs(await jRes.json());
    setSales(await sRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Poll every 30s for sales view
  useEffect(() => {
    if (isProduction) return;
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [isProduction, fetchAll]);

  async function openJob(id) {
    const res = await apiFetch(`/api/jobs/${id}`);
    const data = await res.json();
    setSelected(data);
  }

  async function handleLogin() {
    setLoginErr('');
    const res = await apiFetch('/api/login', { method: 'POST', body: loginForm });
    if (res.ok) {
      const d = await res.json();
      localStorage.setItem('pf_token', d.token);
      setIsProd(true); setLoginOpen(false);
      setLoginForm({ username: '', password: '' });
      showToast('✅ เข้าสู่ระบบแล้ว');
    } else {
      const e = await res.json();
      setLoginErr(e.error);
    }
  }

  function handleLogout() {
    localStorage.removeItem('pf_token');
    setIsProd(false);
    showToast('ออกจากระบบแล้ว');
  }

  // Filter
  const displayed = jobs.filter(j => {
    if (filterSales !== 'all' && String(j.sales_id) !== filterSales) return false;
    if (filterStatus && j.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![j.job_no, j.name, j.sales_name, j.note].join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const waitCount = jobs.filter(j => j.status === 'wait_confirm').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Header */}
      <header className="glass-header" style={{
        color: '#fff', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 15, letterSpacing: '.05em' }}>PRINTFLOW</span>
          {waitCount > 0 && (
            <span style={{ 
              background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', 
              fontSize: 12, fontWeight: 700, padding: '4px 10px', 
              borderRadius: 'var(--radius-pill)', border: '1px solid rgba(239, 68, 68, 0.3)' 
            }}>
              ⏳ {waitCount} รอคอนเฟิร์ม
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{jobs.length} งาน</span>
          {isProduction ? (
            <>
              <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#e5e7eb', borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => { setSelected('new'); }}>+ เพิ่มงาน</button>
              <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#e5e7eb', borderColor: 'rgba(255,255,255,0.1)' }} onClick={handleLogout}>ออกจากระบบ</button>
            </>
          ) : (
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#e5e7eb', borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => setLoginOpen(true)}>🔐 Production</button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px' }}>

        {/* Sales filter tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid',
              fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
              background: filterSales === 'all' ? 'var(--ink)' : 'var(--white)',
              color:      filterSales === 'all' ? '#fff' : 'var(--ink-soft)',
              borderColor: filterSales === 'all' ? 'var(--ink)' : 'var(--rule)',
              boxShadow: filterSales === 'all' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
          >ทั้งหมด</button>

          {sales.map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(String(s.id))}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid',
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                background:  String(s.id) === filterSales ? s.color : 'var(--white)',
                color:       String(s.id) === filterSales ? '#fff' : s.color,
                borderColor: String(s.id) === filterSales ? s.color : s.color + '40',
                boxShadow: String(s.id) === filterSales ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              {s.name}
              <span style={{
                marginLeft: 8, fontSize: 12, fontWeight: 700,
                background: String(s.id) === filterSales ? 'rgba(255,255,255,.25)' : s.color + '15',
                color: String(s.id) === filterSales ? '#fff' : s.color,
                padding: '2px 8px', borderRadius: 'var(--radius-pill)',
              }}>
                {jobs.filter(j => j.sales_id === s.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search + status filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }}>🔍</span>
            <input className="input" style={{ paddingLeft: 38, height: '100%' }} placeholder="ค้นหา Job, ชื่องาน..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="input" style={{ width: 180 }} value={filterStatus} onChange={e => setFStatus(e.target.value)}>
            <option value="">ทุกสถานะ</option>
            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
          </select>
          <button className="btn btn-ghost" style={{ padding: '0 16px' }} onClick={fetchAll} title="รีเฟรช">🔄</button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {sales.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }}/>
              <span style={{ color: '#6b7280' }}>{s.name}</span>
            </div>
          ))}
        </div>

        {/* Job list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-faint)' }}>กำลังโหลด...</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-faint)', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--rule)' }}>
            <div style={{ fontSize: 42, marginBottom: 16 }}>🖨️</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{jobs.length ? 'ไม่พบงานที่ตรงกัน' : 'ยังไม่มีงานในระบบ'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map(j => (
              <JobCard key={j.id} job={j} isProduction={isProduction} onClick={() => openJob(j.id)}/>
            ))}
          </div>
        )}
      </div>

      {/* Job modal */}
      {selected && (
        <JobModal
          job={selected === 'new' ? null : selected}
          sales={sales}
          isProduction={isProduction}
          onClose={() => setSelected(null)}
          onSaved={() => { fetchAll(); showToast('✅ บันทึกแล้ว'); }}
          onDeleted={() => { fetchAll(); showToast('🗑️ ลบแล้ว'); }}
        />
      )}

      {/* Login modal */}
      {loginOpen && (
        <div className="overlay open" onClick={e => e.target === e.currentTarget && setLoginOpen(false)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-head">
              <h2>Production Login</h2>
              <button className="modal-close" onClick={() => setLoginOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label>Username</label>
                <input className="input" value={loginForm.username} onChange={e => setLoginForm(f => ({...f, username: e.target.value}))} onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
              </div>
              <div className="field">
                <label>Password</label>
                <input className="input" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({...f, password: e.target.value}))} onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
              </div>
              {loginErr && <p style={{ color: '#dc2626', fontSize: 13 }}>{loginErr}</p>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setLoginOpen(false)}>ยกเลิก</button>
              <button className="btn btn-dark" onClick={handleLogin}>เข้าสู่ระบบ</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}
