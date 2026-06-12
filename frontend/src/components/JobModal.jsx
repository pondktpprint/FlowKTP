import { useState, useEffect } from 'react';
import { STATUSES, COATINGS, COLORS_OPTIONS, PRINT_SYSTEMS, TECHNIQUES, STATUS_MAP, apiFetch } from '../constants.js';
import StatusBar from './StatusBar.jsx';

export default function JobModal({ job, sales, isProduction, onClose, onSaved, onDeleted }) {
  const isNew = !job?.id;
  const [form, setForm] = useState({
    job_no: '', name: '', sales_id: '', due_date: '',
    print_system: '', print_color: '',
    paper: '', colors: '', coating: 'ไม่เคลือบ',
    special_techniques: [], foil_color: '', fold_type: '',
    status: 'received', urgency_color: 'orange', note: '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (job) {
      let st = [];
      if (typeof job.special_techniques === 'string') {
        try { st = JSON.parse(job.special_techniques); } catch(e){}
      } else if (Array.isArray(job.special_techniques)) {
        st = job.special_techniques;
      }
      setForm({
        job_no:   job.job_no   || '',
        name:     job.name     || '',
        sales_id: job.sales_id || '',
        due_date: job.due_date ? job.due_date.slice(0,10) : '',
        print_system: job.print_system || '',
        print_color: job.print_color || '',
        paper:    job.paper    || '',
        colors:   job.colors   || '',
        coating:  job.coating  || 'ไม่เคลือบ',
        special_techniques: st,
        foil_color: job.foil_color || '',
        fold_type: job.fold_type || '',
        status:   job.status   || 'received',
        urgency_color: job.urgency_color || 'orange',
        note:     job.note     || '',
      });
    }
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
              <label>ระบบพิมพ์</label>
              <select className="input" value={form.print_system} onChange={e => set('print_system', e.target.value)} disabled={readOnly}>
                <option value="">— เลือก —</option>
                {PRINT_SYSTEMS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>พิมพ์สีอะไร (หน้า/หลัง)</label>
              <input className="input" value={form.print_color} onChange={e => set('print_color', e.target.value)} disabled={readOnly} placeholder="เช่น 4/4, 1/0"/>
            </div>

            <div className="field">
              <label>ประเภทกระดาษ</label>
              <input className="input" value={form.paper} onChange={e => set('paper', e.target.value)} disabled={readOnly} placeholder="เช่น อาร์ตมัน 150g"/>
            </div>

            <div className="field">
              <label>การเคลือบ</label>
              <select className="input" value={form.coating} onChange={e => set('coating', e.target.value)} disabled={readOnly}>
                {COATINGS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="field full">
              <label>เทคนิคพิเศษ</label>
              <div style={{ display: 'flex', gap: '12px 20px', flexWrap: 'wrap', marginTop: 4 }}>
                {TECHNIQUES.map(tech => (
                  <label key={tech} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink)' }}>
                    <input type="checkbox" disabled={readOnly}
                      checked={form.special_techniques.includes(tech)}
                      onChange={e => {
                        const newArr = e.target.checked 
                          ? [...form.special_techniques, tech]
                          : form.special_techniques.filter(t => t !== tech);
                        set('special_techniques', newArr);
                      }}
                    />
                    {tech}
                  </label>
                ))}
              </div>
            </div>
            {form.special_techniques.includes('ปั๊มเคทอง') && (
              <div className="field">
                <label>สีฟอยล์ (ปั๊มเคทอง)</label>
                <input className="input" value={form.foil_color} onChange={e => set('foil_color', e.target.value)} disabled={readOnly} placeholder="เช่น สีทอง, สีเงิน"/>
              </div>
            )}
            {form.special_techniques.includes('พับ') && (
              <div className="field">
                <label>รูปแบบการพับ</label>
                <input className="input" value={form.fold_type} onChange={e => set('fold_type', e.target.value)} disabled={readOnly} placeholder="เช่น 1/2, 2/3"/>
              </div>
            )}

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

          {/* Comments */}
          {!isNew && job.comments && (() => {
            let parsed = [];
            try { parsed = typeof job.comments === 'string' ? JSON.parse(job.comments) : job.comments; } catch(e){}
            if (parsed.length === 0) return null;
            return (
              <div style={{ paddingTop: 16, borderTop: '1px solid var(--rule)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>ประวัติการพูดคุย / ตามงาน</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {parsed.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--ink-soft)', alignItems: 'flex-start', background: c.is_rush ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: c.is_rush ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent' }}>
                      <span style={{ fontFamily: 'var(--mono)', flexShrink: 0, color: 'var(--ink)' }}>
                        {new Date(c.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, color: c.sender === 'ฝ่ายผลิต' ? '#10b981' : 'var(--accent)', marginRight: 8 }}>{c.sender}:</span>
                        <span style={{ color: 'var(--ink)' }}>{c.message}</span>
                        {c.is_rush && <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 600 }}>🔥 (ด่วน!)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
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
