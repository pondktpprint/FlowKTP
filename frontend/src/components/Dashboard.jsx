import React from 'react';
import { STATUS_MAP } from '../constants.jsx';
import { BarChart2, Printer, Flame, CheckCircle, TrendingUp, Factory, Calendar } from 'lucide-react';

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
        <h2 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart2 size={28} /> สถิติภาพรวมโรงพิมพ์
        </h2>
        <span style={{ fontSize: 13, color: 'var(--ink-soft)', background: 'var(--surface-card)', padding: '6px 12px', borderRadius: '20px' }}>อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}</span>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <MetricCard title="งานกำลังผลิต" value={activeJobs.length} icon={<Printer size={18} />} accent="var(--accent)" />
        <MetricCard title="งานด่วน / ต้องดู" value={rushJobs.length} icon={<Flame size={18} color="#ef4444" />} accent="#ef4444" />
        <MetricCard title="ผลิตเสร็จแล้ว" value={doneJobs.length} icon={<CheckCircle size={18} color="var(--accent-purple)" />} accent="var(--accent-purple)" />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Sales Chart */}
        <div style={{ background: 'var(--surface-card)', padding: '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 18, color: 'var(--ink)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} /> ออเดอร์รายเซลล์
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sales.map(s => {
              const count = getSalesCount(s.id);
              const max = Math.max(...sales.map(sx => getSalesCount(sx.id))) || 1;
              const pct = (count / max) * 100;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ width: 80, fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{s.name}</span>
                  <div style={{ flex: 1, background: 'var(--surface)', height: 12, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 12, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                  </div>
                  <span style={{ width: 30, fontSize: 15, fontWeight: 800, textAlign: 'right', color: 'var(--ink)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print System Chart */}
        <div style={{ background: 'var(--surface-card)', padding: '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 18, color: 'var(--ink)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Factory size={20} /> สัดส่วนระบบพิมพ์
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {['Offset', 'Digital', 'ไม่ได้ระบุ'].map(sys => {
              const count = sys === 'ไม่ได้ระบุ' 
                ? activeJobs.filter(j => !j.print_system).length
                : activeJobs.filter(j => j.print_system === sys).length;
              
              const total = activeJobs.length || 1;
              const pct = (count / total) * 100;
              const color = sys === 'Offset' ? 'var(--accent-purple)' : sys === 'Digital' ? '#f472b6' : 'var(--ink-faint)';
              
              if (count === 0 && sys === 'ไม่ได้ระบุ') return null;

              return (
                <div key={sys} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ width: 80, fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{sys}</span>
                  <div style={{ flex: 1, background: 'var(--surface)', height: 12, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 12, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                  </div>
                  <span style={{ width: 30, fontSize: 15, fontWeight: 800, textAlign: 'right', color: 'var(--ink)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Daily Incoming Stats */}
      <div style={{ background: 'var(--surface-card)', padding: '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: 18, color: 'var(--ink)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} /> สถิติรับงานใหม่ (รายวัน)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedDates.slice(0, 14).map(dateStr => {
            const dayJobs = dailyIncoming[dateStr];
            return (
              <div key={dateStr} style={{ background: 'var(--surface)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{dateStr}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', background: 'var(--accent)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}>{dayJobs.length} งาน</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {dayJobs.map(j => (
                    <div key={j.id} style={{ fontSize: 13, background: '#fff', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-sm)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--ink)' }}>#{j.job_no}</span>
                      <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{j.company_name ? j.company_name : j.name}</span>
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

function MetricCard({ title, value, icon, accent }) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      padding: '32px 24px',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, zIndex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          {icon}
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{title}</span>
      </div>
      
      <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--ink)', lineHeight: 1, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', zIndex: 1 }}>
        {value}
      </div>
      
      <div style={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, background: accent, opacity: 0.15, borderRadius: '50%', filter: 'blur(30px)' }}></div>
    </div>
  );
}
