export const STATUSES = [
  { key: 'received',     label: 'รับงาน',                  icon: '📥', color: '#64748b' },
  { key: 'artwork',      label: 'ทำอาร์ตเวิร์ค / ตรวจปรู๊ฟ', icon: '🎨', color: '#0284c7' },
  { key: 'mockup',       label: 'ทำ Mockup',               icon: '🖼️', color: '#7c3aed' },
  { key: 'proof_print',  label: 'ปริ้นท์ปรู๊ฟ',             icon: '🖨️', color: '#b45309' },
  { key: 'wait_confirm', label: 'รอคอนเฟิร์ม',              icon: '⏳', color: '#dc2626' },
  { key: 'revision',     label: 'แก้ไข',                   icon: '✏️', color: '#d97706' },
  { key: 'plate',        label: 'ทำเพลท / รอปริ้นท์',       icon: '🏭', color: '#059669' },
  { key: 'done',         label: 'เสร็จแล้ว',                icon: '✅', color: '#16a34a' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.key, s]));
export const STATUS_INDEX = Object.fromEntries(STATUSES.map((s, i) => [s.key, i]));

export const COATINGS = ['ไม่เคลือบ', 'PVC ใส', 'PVC ด้าน', 'UV'];
export const COLORS_OPTIONS = ['1 สี', '2 สี', '4 สี (CMYK)', '4 สี + พิเศษ'];

export function dueInfo(due) {
  if (!due) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(due); d.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  const fmt = new Date(due).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  if (diff < 0)  return { label: `${fmt} (เกิน ${Math.abs(diff)} วัน)`, cls: 'due-late' };
  if (diff === 0) return { label: `${fmt} (วันนี้!)`,  cls: 'due-warn' };
  if (diff <= 3)  return { label: `${fmt} (อีก ${diff} วัน)`, cls: 'due-warn' };
  return { label: fmt, cls: 'due-ok' };
}

export const API = import.meta.env.VITE_API_URL || '';
export const apiFetch = (path, opts = {}) => {
  const token = localStorage.getItem('pf_token');
  return fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
};
