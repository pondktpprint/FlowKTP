import { useState } from 'react';
import { STATUS_MAP, dueInfo, apiFetch } from '../constants.jsx';
import { Flame, AlertTriangle, MessageSquare, Printer, Palette, FileText, Sparkles, Star, Calendar, CheckCircle, Check, Send } from 'lucide-react';

export default function JobCard({ job, onClick, isProduction, onAction }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const s   = STATUS_MAP[job.status];
  const due = dueInfo(job.due_date);
  const isWaiting = job.status === 'wait_confirm';

  let lightColor = '#f59e0b'; // orange (กำลังทำ)
  let lightShadow = 'rgba(245, 158, 11, 0.4)';
  let lightTitle = 'กำลังทำ';
  if (job.status === 'received') {
    lightColor = '#94a3b8'; // gray
    lightShadow = 'rgba(148, 163, 184, 0.4)';
    lightTitle = 'ยังไม่ได้ทำ';
  } else if (job.status === 'done') {
    lightColor = '#10b981'; // green
    lightShadow = 'rgba(16, 185, 129, 0.4)';
    lightTitle = 'เสร็จแล้ว';
  }

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
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: attention ? '0 0 0 2px #ef4444' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = attention ? '0 0 0 2px #ef4444' : 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = attention ? '0 0 0 2px #ef4444' : 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: lightColor, boxShadow: `0 0 12px ${lightShadow}` }} title={lightTitle}></div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-soft)', fontFamily: 'var(--font-heading)' }}>#{job.job_no}</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{job.name}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 'var(--radius-pill)',
            background: `${s?.color}15`, color: s?.color,
            display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '0.02em'
          }}>
            <span style={{ fontSize: 16 }}>{s?.icon}</span>
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
            animation: 'pulse-red 2s infinite', display: 'flex', alignItems: 'center', gap: 4
          }}>
            {isRush ? <><Flame size={14} /> งานด่วน!</> : <><AlertTriangle size={14} /> มีข้อความใหม่</>}
          </div>
        )}
      </div>

      {/* Note Section (If any) */}
      {job.note && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--ink-soft)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <MessageSquare size={16} style={{ flexShrink: 0, marginTop: 2 }} /> 
          <div><b>หมายเหตุ:</b> {job.note}</div>
        </div>
      )}

      {/* Bottom Section: Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {job.print_system && (
          <span className="tag" style={{ background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}><Printer size={12} /> {job.print_system}</span>
        )}
        {job.print_color && (
          <span className="tag" style={{ background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}><Palette size={12} /> {job.print_color}</span>
        )}
        {job.paper && (
          <span className="tag" style={{ background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={12} /> {job.paper}</span>
        )}
        {job.colors && (
          <span className="tag" style={{ background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>{job.colors}</span>
        )}
        {job.coating && job.coating !== 'ไม่เคลือบ' && (
          <span className="tag" style={{ background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} /> {job.coating}</span>
        )}
        {st.map(tech => (
          <span key={tech} className="tag" style={{ background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} /> {tech}
            {tech === 'ปั๊มเคทอง' && job.foil_color ? ` (${job.foil_color})` : ''}
            {tech === 'พับ' && job.fold_type ? ` (${job.fold_type})` : ''}
          </span>
        ))}
        {due && (
          <span className={`tag ${due.cls}`} style={{ fontWeight: 700, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {due.label}</span>
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
                <CheckCircle size={16} /> คอนเฟิร์มแบบ
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
            <button className="btn btn-dark" style={{ height: '36px', padding: '0 12px', flexShrink: 0 }} onClick={handleComment} disabled={loading || !comment}>
              <Send size={14} /> ส่ง
            </button>
            <button className="btn btn-danger" style={{ height: '36px', padding: '0 12px', background: '#ef4444', color: '#fff', flexShrink: 0 }} onClick={e => handleComment(e, true)} disabled={loading}>
              <Flame size={14} /> เร่งด่วน
            </button>
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
            <button className="btn btn-dark" style={{ height: '36px', padding: '0 12px' }} onClick={handleComment} disabled={loading || !comment}>
              <Send size={14} /> ส่ง
            </button>
            {attention && (
              <button className="btn" style={{ height: '36px', padding: '0 16px', background: '#10b981', color: '#fff', fontWeight: 600, border: 'none' }} onClick={handleAck} disabled={loading}>
                <Check size={16} /> รับทราบ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
