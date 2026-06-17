import React from 'react';

export default function Dashboard({ jobs, sales }) {
  const activeJobs = jobs.filter(j => j.status !== 'done');
  const doneJobs = jobs.filter(j => j.status === 'done');
  const rushJobs = activeJobs.filter(j => j.is_rush || j.needs_attention || j.urgency_color === 'red');

  const getSalesCount = (salesId) => activeJobs.filter(j => j.sales_id === salesId).length;

  // Group jobs by date for "Daily Incoming Jobs"
  const dailyIncoming = {};
  jobs.forEach(j => {
    const d = new Date(j.created_at || j.updated_at || Date.now());
    const dateStr = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!dailyIncoming[dateStr]) dailyIncoming[dateStr] = [];
    dailyIncoming[dateStr].push(j);
  });

  const sortedDates = Object.keys(dailyIncoming).sort((a, b) => {
    const dateA = new Date(dailyIncoming[a][0].created_at || dailyIncoming[a][0].updated_at || Date.now());
    const dateB = new Date(dailyIncoming[b][0].created_at || dailyIncoming[b][0].updated_at || Date.now());
    return dateB - dateA;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>📊 สถิติภาพรวมโรงพิมพ์</h2>
        <span style={{ fontSize: 13, color: 'var(--ink-soft)', background: 'var(--surface-card)', padding: '6px 12px', borderRadius: '20px' }}>อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}</span>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <MetricCard title="งานที่กำลังผลิต" value={activeJobs.length} icon="🖨️" color="#3b82f6" />
        <MetricCard title="งานด่วน / ต้องดู" value={rushJobs.length} icon="🔥" color="#ef4444" />
        <MetricCard title="ผลิตเสร็จแล้ว" value={doneJobs.length} icon="✅" color="#10b981" />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Sales Chart */}
        <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 16, color: 'var(--ink)' }}>📈 ออเดอร์รายเซลล์ (เฉพาะงานกำลังทำ)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sales.map(s => {
              const count = getSalesCount(s.id);
              const max = Math.max(...sales.map(sx => getSalesCount(sx.id))) || 1;
              const pct = (count / max) * 100;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ width: 80, fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}>{s.name}</span>
                  <div style={{ flex: 1, background: 'var(--surface)', height: 16, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${s.color}dd, ${s.color})`, borderRadius: 8, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                  </div>
                  <span style={{ width: 30, fontSize: 14, fontWeight: 800, textAlign: 'right', color: 'var(--ink)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print System Chart */}
        <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 16, color: 'var(--ink)' }}>🏭 สัดส่วนระบบพิมพ์ (เฉพาะงานกำลังทำ)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Offset', 'Digital', 'ไม่ได้ระบุ'].map(sys => {
              const count = sys === 'ไม่ได้ระบุ' 
                ? activeJobs.filter(j => !j.print_system).length
                : activeJobs.filter(j => j.print_system === sys).length;
              
              const total = activeJobs.length || 1;
              const pct = (count / total) * 100;
              const color = sys === 'Offset' ? '#8b5cf6' : sys === 'Digital' ? '#ec4899' : '#64748b';
              
              if (count === 0 && sys === 'ไม่ได้ระบุ') return null;

              return (
                <div key={sys} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ width: 80, fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}>{sys}</span>
                  <div style={{ flex: 1, background: 'var(--surface)', height: 16, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${color}dd, ${color})`, borderRadius: 8, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                  </div>
                  <span style={{ width: 30, fontSize: 14, fontWeight: 800, textAlign: 'right', color: 'var(--ink)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Daily Incoming Stats */}
      <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 18, color: 'var(--ink)' }}>📅 สถิติรับงานใหม่ (รายวัน)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedDates.slice(0, 14).map(dateStr => {
            const dayJobs = dailyIncoming[dateStr];
            return (
              <div key={dateStr} style={{ border: '1px solid var(--rule)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{dateStr}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>{dayJobs.length} งาน</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {dayJobs.map(j => (
                    <div key={j.id} style={{ fontSize: 13, background: 'var(--surface)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>#{j.job_no}</span>
                      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{j.company_name ? `🏢 ${j.company_name}` : j.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', alignItems: 'center', gap: '20px',
      borderLeft: `6px solid ${color}`
    }}>
      <div style={{ width: 64, height: 64, borderRadius: '16px', background: `${color}15`, color, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}
