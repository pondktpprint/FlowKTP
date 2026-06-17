import { Inbox, Palette, Image, Printer, Hourglass, Edit3, Factory, CheckCircle2 } from 'lucide-react';
import React from 'react';

export const STATUSES = [
  { key: 'received',     label: 'รับงาน',                  icon: <Inbox size={16} />, color: '#64748b' },
  { key: 'artwork',      label: 'ทำอาร์ตเวิร์ค / ตรวจปรู๊ฟ', icon: <Palette size={16} />, color: '#0284c7' },
  { key: 'mockup',       label: 'ทำ Mockup',               icon: <Image size={16} />, color: '#7c3aed' },
  { key: 'proof_print',  label: 'ปริ้นท์ปรู๊ฟ',             icon: <Printer size={16} />, color: '#b45309' },
  { key: 'wait_confirm', label: 'รอคอนเฟิร์ม',              icon: <Hourglass size={16} />, color: '#dc2626' },
  { key: 'revision',     label: 'แก้ไข',                   icon: <Edit3 size={16} />, color: '#d97706' },
  { key: 'plate',        label: 'ทำเพลท / รอปริ้นท์',       icon: <Factory size={16} />, color: '#059669' },
  { key: 'done',         label: 'เสร็จแล้ว',                icon: <CheckCircle2 size={16} />, color: '#16a34a' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.key, s]));
export const STATUS_INDEX = Object.fromEntries(STATUSES.map((s, i) => [s.key, i]));

export const COATINGS = ['ไม่เคลือบ', 'PVC ใส 1 หน้า', 'PVC ใส 2 หน้า', 'PVC ด้าน 1 หน้า', 'PVC ด้าน 2 หน้า', 'UV', 'Spot UV'];
export const COLORS_OPTIONS = ['1 สี', '2 สี', '4 สี (CMYK)', '4 สี + พิเศษ'];

export const PRINT_SYSTEMS = ['Offset', 'Digital'];
export const TECHNIQUES = ['ไดคัท 50%', 'ไดคัท 100%', 'ปั๊มนูน', 'ปั๊มเคทอง', 'Spot UV', 'พับ'];

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
