import { useState } from 'react';
import { STATUS_MAP, dueInfo, apiFetch } from '../constants.js';

export default function JobCard({ job, onClick, isProduction, onAction }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
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

  const isRush = job.is_rush === 1;
  const needsAttention = job.needs_attention === 1;
  const attention = isRush || needsAttention;

  const handleComment = async (e, forceRush) => {
    e.stopPropagation();
    if (!comment && !forceRush) return;
    setLoading(true);
    await apiFetch(`/api/jobs/${job.id}/comment`, {
      method: 'POST',
      body: { message: comment, is_rush: forceRush || isRush, sender: isProduction ? 'ฝ่ายผลิต' : job.sales_name }
    });
    setComment('');
    setLoading(false);
    if (onAction) onAction();
  };

  const handleAck = async (e) => {
    e.stopPropagation();
    setLoading(true);
    await apiFetch(`/api/jobs/${job.id}/acknowledge`, { method: 'POST' });
    setLoading(false);
    if (onAction) onAction();
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-card)',
        borderLeft: `6px solid ${job.sales_color}`,
        border: attention ? '2px solid #ef4444' : '1px solid transparent',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: attention ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
          ผู้รับงาน {job.sales_name}
        </div>
        {attention && (
          <div style={{
            background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700,
            padding: '4px 10px', borderRadius: 'var(--radius-pill)',
            animation: 'pulse-red 2s infinite'
          }}>
            {isRush ? '🔥 งานด่วน!' : '⚠️ มีข้อความใหม่'}
          </div>
        )}
      </div>

      {/* Note Section (If any) */}
      {job.note && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--ink-soft)' }}>
          📝 <b>หมายเหตุ:</b> {job.note}
        </div>
      )}

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

      {/* Follow Up & Comment Section */}
      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--rule)', paddingTop: '16px', marginTop: '4px' }} onClick={e => e.stopPropagation()}>
        {!isProduction ? (
          <>
            {job.status === 'wait_confirm' && (
              <button 
                className="btn" 
                style={{ height: '36px', padding: '0 12px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 600, flexShrink: 0 }} 
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!window.confirm('ยืนยันแบบและส่งเข้าผลิตต่อ?')) return;
                  setLoading(true);
                  await apiFetch(`/api/jobs/${job.id}/sales-confirm`, { method: 'POST' });
                  setLoading(false);
                  if (onAction) onAction();
                }}
                disabled={loading}
              >
                ✅ คอนเฟิร์มแบบ
              </button>
            )}
            <input 
              className="input" 
              style={{ flex: 1, minWidth: 0, padding: '6px 12px', fontSize: 13, height: '36px' }} 
              placeholder="พิมพ์ข้อความ / ตามงาน..." 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment(e)}
              disabled={loading}
            />
            <button className="btn btn-dark" style={{ height: '36px', padding: '0 12px', flexShrink: 0 }} onClick={handleComment} disabled={loading || !comment}>ส่ง</button>
            <button className="btn btn-danger" style={{ height: '36px', padding: '0 12px', background: '#ef4444', color: '#fff', flexShrink: 0 }} onClick={e => handleComment(e, true)} disabled={loading}>🔥 เร่งด่วน</button>
          </>
        ) : (
          <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
            <input 
              className="input" 
              style={{ flex: 1, padding: '6px 12px', fontSize: 13, height: '36px' }} 
              placeholder="พิมพ์ตอบกลับเซลล์..." 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment(e)}
              disabled={loading}
            />
            <button className="btn btn-dark" style={{ height: '36px', padding: '0 12px' }} onClick={handleComment} disabled={loading || !comment}>ส่ง</button>
            {attention && (
              <button className="btn" style={{ height: '36px', padding: '0 16px', background: '#10b981', color: '#fff', fontWeight: 600, border: 'none' }} onClick={handleAck} disabled={loading}>✅ รับทราบ</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
