import { STATUS_MAP, dueInfo } from '../constants.js';

export default function JobCard({ job, onClick, isProduction }) {
  const s   = STATUS_MAP[job.status];
  const due = dueInfo(job.due_date);
  const isWaiting = job.status === 'wait_confirm';

  const dotColor = job.urgency_color || 'orange';

  let st = [];
  if (typeof job.special_techniques === 'string') {
    try { st = JSON.parse(job.special_techniques); } catch(e){}
  } else if (Array.isArray(job.special_techniques)) {
    st = job.special_techniques;
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-card)',
        borderLeft: `6px solid ${job.sales_color}`,
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>{job.name}</h3>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-faint)' }}>{job.job_no}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span style={{
            fontSize: 14, fontWeight: 700, padding: '8px 16px', borderRadius: 'var(--radius-pill)',
            background: `linear-gradient(135deg, ${s?.color}, ${s?.color}dd)`, color: '#fff',
            boxShadow: `0 4px 12px ${s?.color}40`, border: `1px solid ${s?.color}80`,
            display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '0.02em'
          }}>
            <span style={{ fontSize: 18 }}>{s?.icon}</span>
            <span style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: dotColor === 'green' ? '#10b981' : dotColor === 'red' ? '#ef4444' : '#f59e0b',
              boxShadow: `0 0 6px ${dotColor === 'green' ? '#10b981' : dotColor === 'red' ? '#ef4444' : '#f59e0b'}`
            }}></span>
            {s?.label}
          </span>
        </div>
      </div>

      {/* Middle Section */}
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
        ผู้รับงาน {job.sales_name}
      </div>

      {/* Bottom Section: Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {job.print_system && (
          <span className="tag" style={{ background: '#f8fafc', color: '#4338ca', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '11px' }}>🖨️ {job.print_system}</span>
        )}
        {job.print_color && (
          <span className="tag" style={{ background: '#f8fafc', color: '#be185d', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '11px' }}>🎨 {job.print_color}</span>
        )}
        {job.paper && (
          <span className="tag" style={{ background: '#f8fafc', color: '#475569', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '11px' }}>📄 {job.paper}</span>
        )}
        {job.colors && (
          <span className="tag" style={{ background: '#fffbeb', color: '#b45309', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '11px' }}>{job.colors}</span>
        )}
        {job.coating && job.coating !== 'ไม่เคลือบ' && (
          <span className="tag" style={{ background: '#f8fafc', color: '#2563eb', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '11px' }}>✨ {job.coating}</span>
        )}
        {st.map(tech => (
          <span key={tech} className="tag" style={{ background: '#f8fafc', color: '#7c3aed', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '11px' }}>
            ⭐ {tech}
            {tech === 'ปั๊มเคทอง' && job.foil_color ? ` (${job.foil_color})` : ''}
            {tech === 'พับ' && job.fold_type ? ` (${job.fold_type})` : ''}
          </span>
        ))}
        {due && (
          <span className={`tag ${due.cls}`} style={{ background: '#f8fafc', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '11px' }}>📅 {due.label}</span>
        )}
      </div>
    </div>
  );
}
