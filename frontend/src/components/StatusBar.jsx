import { STATUSES, STATUS_INDEX } from '../constants.js';

export default function StatusBar({ status }) {
  const current = STATUS_INDEX[status] ?? 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', padding: '12px 4px' }}>
      {STATUSES.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const pending = i > current;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '6px 4px', borderRadius: 'var(--radius)',
              background: active ? s.color + '10' : 'transparent',
              border: active ? `1px solid ${s.color}30` : '1px solid transparent',
              minWidth: 64, transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? s.color : active ? 'var(--white)' : 'var(--surface)',
                border: `2px solid ${done || active ? s.color : 'var(--rule)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, opacity: pending ? 0.4 : 1,
                boxShadow: active ? `0 0 0 4px ${s.color}20` : 'none',
                transition: 'all 0.3s ease',
                color: done ? '#fff' : 'inherit'
              }}>
                {s.icon}
              </div>
              <span style={{
                fontSize: 11, textAlign: 'center', lineHeight: 1.3,
                color: active ? s.color : done ? 'var(--ink-soft)' : 'var(--ink-faint)',
                fontWeight: active || done ? 700 : 500,
              }}>{s.label}</span>
            </div>
            {i < STATUSES.length - 1 && (
              <div style={{
                width: 24, height: 3, flexShrink: 0,
                background: i < current ? STATUSES[i].color : 'var(--rule)',
                borderRadius: 2, margin: '0 -4px', zIndex: -1,
                transition: 'background 0.3s ease'
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}
