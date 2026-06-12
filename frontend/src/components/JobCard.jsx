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
        border: `1px solid ${isWaiting ? 'rgba(239, 68, 68, 0.3)' : 'var(--rule)'}`,
        borderLeft: `4px solid ${job.sales_color}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* waiting badge */}
      {isWaiting && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-pill)',
        }}>⏳ รอคอนเฟิร์ม</div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* left: job no */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 4 }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
            color: 'var(--ink-faint)', letterSpacing: '.05em',
          }}>#{job.job_no}</span>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: job.sales_color + '15',
            border: `2px solid ${job.sales_color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: job.sales_color,
          }}>
            {job.sales_name?.[0]}
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{job.name}</span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-pill)',
              background: s?.color + '15', color: s?.color, border: `1px solid ${s?.color}40`,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              <span className={`status-dot ${dotColor}`}></span>
              {s?.label}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ opacity: 0.6 }}>👤</span> {job.sales_name}
            </span>
            <div style={{ width: 1, height: 12, background: 'var(--rule)' }} />
            {job.print_system && (
              <span className="tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>🖨️ {job.print_system}</span>
            )}
            {job.print_color && (
              <span className="tag" style={{ background: '#fce7f3', color: '#be185d' }}>🎨 {job.print_color}</span>
            )}
            {job.paper && (
              <span className="tag" style={{ background: '#f3f4f6', color: '#4b5563' }}>📄 {job.paper}</span>
            )}
            {job.colors && (
              <span className="tag" style={{ background: '#fffbeb', color: '#b45309' }}>{job.colors}</span>
            )}
            {job.coating && job.coating !== 'ไม่เคลือบ' && (
              <span className="tag" style={{ background: '#eff6ff', color: '#1d4ed8' }}>✨ {job.coating}</span>
            )}
            {st.map(tech => (
              <span key={tech} className="tag" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
                ⭐ {tech}
                {tech === 'ปั๊มเคทอง' && job.foil_color ? ` (${job.foil_color})` : ''}
                {tech === 'พับ' && job.fold_type ? ` (${job.fold_type})` : ''}
              </span>
            ))}
          </div>

          {due && (
            <span className={`tag ${due.cls}`} style={{ fontSize: 11 }}>📅 {due.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
