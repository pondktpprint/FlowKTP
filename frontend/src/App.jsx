import { useState, useEffect, useCallback } from 'react';
import { STATUSES, apiFetch } from './constants.js';
import JobCard from './components/JobCard.jsx';
import JobModal from './components/JobModal.jsx';
import Dashboard from './components/Dashboard.jsx';
import './index.css';

export default function App() {
  const [jobs, setJobs]           = useState([]);
  const [sales, setSales]         = useState([]);
  const [filterSales, setFilter]  = useState('all');
  const [filterStatus, setFStatus]= useState('');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);  // job object or 'new'
  const [currentView, setCurrentView] = useState('jobs'); // 'jobs' or 'stats'
  const [isProduction, setIsProd] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginErr, setLoginErr]   = useState('');
  const [toast, setToast]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSales, filterStatus, search]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

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
    if (filterSales === 'done') {
      if (j.status !== 'done') return false;
    } else {
      if (j.status === 'done') return false;
      if (filterSales !== 'all' && String(j.sales_id) !== filterSales) return false;
    }
    if (filterStatus) {
      if (filterStatus === 'attention') {
        if (!j.needs_attention && !j.is_rush) return false;
      } else {
        if (j.status !== filterStatus) return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      if (![j.job_no, j.name, j.sales_name, j.note].join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const waitCount = jobs.filter(j => j.status === 'wait_confirm').length;

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <div className="splash-screen">
          <img src="/splash.png" alt="Splash Screen" className="splash-img" onError={(e) => e.target.style.display = 'none'} />
          <div className="splash-text">
            <h1>Kittiporn Printing</h1>
            <p>Production on Demand</p>
          </div>
        </div>
      )}

      <div className="layout-container">
        {/* Sidebar Desktop */}
      <aside className="sidebar-desktop">
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--rule)' }}>
          <span style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: 16, letterSpacing: '.02em', color: 'var(--accent)' }}>Kittiporn Printing Co.,Ltd</span>
        </div>
        
        <nav style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 8 }}>MENU</div>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', background: currentView === 'jobs' ? 'rgba(255,255,255,0.05)' : 'transparent', color: 'var(--ink)', border: 'none' }} onClick={() => setCurrentView('jobs')}>🖨️ แดชบอร์ดงานพิมพ์</button>
          
          {isProduction && (
            <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', background: currentView === 'stats' ? 'rgba(255,255,255,0.05)' : 'transparent', color: 'var(--ink)', border: 'none' }} onClick={() => setCurrentView('stats')}>📊 สถิติภาพรวม</button>
          )}
        </nav>

        <div style={{ padding: 24, borderTop: '1px solid var(--rule)' }}>
          {isProduction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>P</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Pond</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Production</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%', borderColor: 'rgba(255,255,255,0.1)' }}>ออกจากระบบ</button>
            </div>
          ) : (
            <button className="btn btn-dark" style={{ width: '100%' }} onClick={() => setLoginOpen(true)}>🔐 ฝ่ายผลิตล็อคอิน</button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          
          {/* Greeting Banner */}
          <div className="greeting-banner" style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 40px',
            color: '#fff',
            marginBottom: 32,
            boxShadow: 'var(--shadow-md)',
            position: 'relative', overflow: 'hidden'
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#fff' }}>👋 สวัสดี {isProduction ? 'Pond' : 'ทีมเซลล์'},</h1>
            <p style={{ opacity: 0.9, maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>ติดตามสถานะงานพิมพ์และจัดการคิวงานทั้งหมดของคุณได้ที่นี่</p>
            {isProduction && <button className="btn" style={{ background: '#fff', color: '#000', fontWeight: 600, border: 'none' }} onClick={() => setSelected('new')}>+ เพิ่มงานใหม่</button>}
          </div>

          {currentView === 'stats' && isProduction ? (
            <Dashboard jobs={jobs} sales={sales} />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>คิวงานทั้งหมด ({jobs.length})</h2>
            {waitCount > 0 && (
              <span style={{ 
                background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', 
                fontSize: 13, fontWeight: 700, padding: '6px 14px', 
                borderRadius: 'var(--radius-pill)', border: '1px solid rgba(239, 68, 68, 0.3)' 
              }}>
                ⏳ มี {waitCount} งานที่รอคอนเฟิร์ม!
              </span>
            )}
          </div>

          {/* Sales filter tabs */}
          <div className="filter-tabs" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid',
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                background: filterSales === 'all' ? 'var(--ink)' : 'var(--surface-card)',
                color:      filterSales === 'all' ? 'var(--surface)' : 'var(--ink-soft)',
                borderColor: filterSales === 'all' ? 'var(--ink)' : 'var(--rule)',
                boxShadow: filterSales === 'all' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >ทั้งหมด</button>

            <button
              onClick={() => setFilter('done')}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid',
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                background: filterSales === 'done' ? '#10b981' : 'var(--surface-card)',
                color:      filterSales === 'done' ? '#fff' : '#10b981',
                borderColor: filterSales === 'done' ? '#10b981' : 'var(--rule)',
                boxShadow: filterSales === 'done' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              เสร็จแล้ว
              <span style={{
                marginLeft: 8, fontSize: 12, fontWeight: 700,
                background: filterSales === 'done' ? 'rgba(255,255,255,.25)' : 'rgba(16,185,129,0.1)',
                color: filterSales === 'done' ? '#fff' : '#10b981',
                padding: '2px 8px', borderRadius: 'var(--radius-pill)',
              }}>
                {jobs.filter(j => j.status === 'done').length}
              </span>
            </button>

            {sales.map(s => (
              <button
                key={s.id}
                onClick={() => setFilter(String(s.id))}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid',
                  fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background:  String(s.id) === filterSales ? s.color : 'var(--surface-card)',
                  color:       String(s.id) === filterSales ? '#fff' : s.color,
                  borderColor: String(s.id) === filterSales ? s.color : 'var(--rule)',
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
                  {jobs.filter(j => j.sales_id === s.id && j.status !== 'done').length}
                </span>
              </button>
            ))}
          </div>

          {/* Search + status filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }}>🔍</span>
              <input className="input" style={{ paddingLeft: 38, height: '100%', background: 'var(--surface-card)' }} placeholder="ค้นหา Job, ชื่องาน..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="input" style={{ width: 180, background: 'var(--surface-card)' }} value={filterStatus} onChange={e => setFStatus(e.target.value)}>
              <option value="">ทุกสถานะ</option>
              <option value="attention">⚠️ งานที่ต้องรับทราบ</option>
              {STATUSES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
            </select>
            <button className="btn btn-ghost" style={{ padding: '0 16px', background: 'var(--surface-card)' }} onClick={fetchAll} title="รีเฟรช">🔄</button>
          </div>

          {/* Job list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-faint)' }}>กำลังโหลด...</div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-faint)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--rule)' }}>
              <div style={{ fontSize: 42, marginBottom: 16 }}>🖨️</div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>{jobs.length ? 'ไม่พบงานที่ตรงกัน' : 'ยังไม่มีงานในระบบ'}</p>
            </div>
          ) : (
            <>
              <div className="job-grid">
                {displayed.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage).map(j => (
                  <JobCard key={j.id} job={j} isProduction={isProduction} onClick={() => openJob(j.id)} onAction={fetchAll}/>
                ))}
              </div>
              
              {Math.ceil(displayed.length / jobsPerPage) > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32, paddingBottom: 16 }}>
                  <button className="btn btn-ghost" disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }}>← ก่อนหน้า</button>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, maxWidth: '50vw' }}>
                    {Array.from({length: Math.ceil(displayed.length / jobsPerPage)}, (_, i) => i + 1).map(p => (
                      <button 
                        key={p} 
                        className="btn" 
                        style={{ 
                          width: 36, height: 36, padding: 0, flexShrink: 0,
                          background: p === currentPage ? 'var(--accent)' : 'var(--surface-card)',
                          color: p === currentPage ? '#fff' : 'var(--ink)',
                          border: p === currentPage ? 'none' : '1px solid var(--rule)'
                        }}
                        onClick={() => { setCurrentPage(p); window.scrollTo(0,0); }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-ghost" disabled={currentPage === Math.ceil(displayed.length / jobsPerPage)} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0,0); }}>ถัดไป →</button>
                </div>
              )}
            </>
          )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="mobile-bottom-nav">
        <div className={`mobile-nav-item ${currentView === 'jobs' ? 'active' : ''}`} onClick={() => setCurrentView('jobs')}>
          <span className="icon">🖨️</span>
          <span>งานพิมพ์</span>
        </div>
        {isProduction && (
          <div className={`mobile-nav-item ${currentView === 'stats' ? 'active' : ''}`} onClick={() => setCurrentView('stats')}>
            <span className="icon">📊</span>
            <span>สถิติ</span>
          </div>
        )}
        {isProduction ? (
          <div className="mobile-nav-item" onClick={handleLogout}>
            <span className="icon">🚪</span>
            <span>ออก</span>
          </div>
        ) : (
          <div className="mobile-nav-item" onClick={() => setLoginOpen(true)}>
            <span className="icon">🔐</span>
            <span>ล็อกอิน</span>
          </div>
        )}
      </div>

      {/* Job modal */}
      {selected && (
        <JobModal
          job={selected === 'new' ? null : selected}
          sales={sales}
          isProduction={isProduction}
          companies={[...new Set(jobs.map(j => j.company_name).filter(Boolean))].sort()}
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
              {loginErr && <p style={{ color: '#ef4444', fontSize: 13 }}>{loginErr}</p>}
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
    </>
  );
}

