import { useState, useEffect } from 'react';
import { STATUSES, COATINGS, COLORS_OPTIONS, STATUS_MAP, apiFetch } from '../constants.js';
import StatusBar from './StatusBar.jsx';

export default function JobModal({ job, sales, isProduction, onClose, onSaved, onDeleted }) {
  const isNew = !job?.id;
  const [form, setForm] = useState({
    job_no: '', name: '', sales_id: '', due_date: '',
    paper: '', colors: '', coating: 'ไม่เคลือบ',
    status: 'received', urgency_color: 'orange', note: '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (job) setForm({
      job_no:   job.job_no   || '',
      name:     job.name     || '',
      sales_id: job.sales_id || '',
      due_date: job.due_date ? job.due_date.slice(0,10) : '',
      paper:    job.paper    || '',
      colors:   job.colors   || '',
      coating:  job.coating  || 'ไม่เคลือบ',
      status:   job.status   || 'received',
      urgency_color: job.urgency_color || 'orange',
      note:     job.note     || '',
    });
  }, [job]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.job_no || !form.name || !form.sales_id) {
      setToast('⚠️ กรุณากรอก Job No, ชื่องาน และเซลล์'); setTimeout(() => setToast(''), 2500); return;
    }
    setSaving(true);
    const res = isNew
      ? await apiFetch('/api/jobs', { method: 'POST', body: form })
      : await apiFetch(`/api/jobs/${job.id}`, { method: 'PUT', body: form });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const e = await res.json(); setToast('❌ ' + e.error); setTimeout(() => setToast(''), 2500); }
  }

  async function handleDelete() {
    await apiFetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
    onDeleted(); onClose();
  }

  const readOnly = !isProduction;

  return (
    <div className="overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{isNew ? 'เพิ่มงานใหม่' : (readOnly ? `Job #${job.job_no}` : `แก้ไข — ${job.name}`)}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Status bar */}
          <div style={{ background: 'var(--surface-card)', padding: '16px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--rule)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>สถานะการทำงาน (กดเลือกได้)</div>
            <StatusBar status={form.status} onChange={readOnly ? null : (st) => set('status', st)} />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>เลข Job *</label>
              <input className="input" value={form.job_no} onChange={e => set('job_no', e.target.value)} disabled={readOnly} placeholder="เช่น 6901970"/>
            </div>
            <div className="field">
              <label>ชื่องาน *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} disabled={readOnly} placeholder="ชื่องาน"/>
            </div>

            <div className="field">
              <label>เซลล์ *</label>
              <select className="input" value={form.sales_id} onChange={e => set('sales_id', e.target.value)} disabled={readOnly}>
                <option value="">— เลือกเซลล์ —</option>
                {sales.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>วันกำหนดส่ง</label>
              <input className="input" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} disabled={readOnly}/>
            </div>

            <div className="field">
              <label>ประเภทกระดาษ</label>
              <input className="input" value={form.paper} onChange={e => set('paper', e.target.value)} disabled={readOnly} placeholder="เช่น อาร์ตมัน 150g"/>
            </div>
            <div className="field">
              <label>จำนวนสี</label>
              <select className="input" value={form.colors} onChange={e => set('colors', e.target.value)} disabled={readOnly}>
                <option value="">— เลือก —</option>
                {COLORS_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="field">
              <label>การเคลือบ</label>
              <select className="input" value={form.coating} onChange={e => set('coating', e.target.value)} disabled={readOnly}>
                {COATINGS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field full" style={{ marginTop: 8 }}>
              <label>สีสถานะความด่วน (ป้ายเรืองแสง)</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                {[
                  { value: 'green', label: 'เสร็จแล้ว (เขียว)', color: '#10b981' },
                  { value: 'orange', label: 'กำลังทำ (ส้ม)', color: '#f59e0b' },
                  { value: 'red', label: 'ด่วน/ติดปัญหา (แดง)', color: '#ef4444' }
                ].map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set('urgency_color', c.value)}
                    disabled={readOnly}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                      background: form.urgency_color === c.value ? c.color + '20' : 'var(--surface)',
                      border: `1px solid ${form.urgency_color === c.value ? c.color : 'var(--rule)'}`,
                      color: form.urgency_color === c.value ? '#fff' : 'var(--ink-soft)',
                      fontWeight: 600, fontSize: 13, cursor: readOnly ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    <span className={`status-dot ${c.value}`} /> {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field full">
              <label>หมายเหตุ {readOnly ? '' : '/ ข้อความถึงเซลล์'}</label>
              <textarea className="input" value={form.note} onChange={e => set('note', e.target.value)} disabled={readOnly} placeholder="รายละเอียดเพิ่มเติม..."/>
            </div>
          </div>

          {/* History */}
          {!isNew && job.history?.length > 0 && (
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--rule)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>ประวัติการเปลี่ยนสถานะ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {job.history.map(h => (
                  <div key={h.id} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--ink-soft)', alignItems: 'flex-start', background: 'var(--surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontFamily: 'var(--mono)', flexShrink: 0, color: 'var(--ink)' }}>
                      {new Date(h.changed_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ flex: 1 }}>{STATUS_MAP[h.old_status]?.label} <span style={{ opacity: 0.5 }}>→</span> <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{STATUS_MAP[h.new_status]?.label}</span></span>
                    {h.note && <span style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>"{h.note}"</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isProduction && (
          <div className="modal-foot">
            {!isNew && !confirmDel && (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(true)}>ลบงาน</button>
            )}
            {confirmDel && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginRight: 'auto' }}>
                <span style={{ fontSize: 13, color: 'var(--text-danger)', fontWeight: 600 }}>ยืนยันลบ?</span>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>ลบเลย</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(false)}>ยกเลิก</button>
              </div>
            )}
            <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        )}

        {toast && <div className="toast show" style={{ position: 'sticky', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>{toast}</div>}
      </div>
    </div>
  );
}
