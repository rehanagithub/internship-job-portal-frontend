import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) { return twMerge(clsx(inputs)); }

export function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function timeAgo(date) {
  if (!date) return '';
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 2592000) return `${Math.floor(secs / 86400)}d ago`;
  if (secs < 31536000) return `${Math.floor(secs / 2592000)}mo ago`;
  return `${Math.floor(secs / 31536000)}y ago`;
}

export function formatSalary(min, max, currency = 'INR') {
  const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
  if (!min && !max) return 'Not disclosed';
  if (!max) return `${fmt(min)}+ ${currency}`;
  if (!min) return `Up to ${fmt(max)} ${currency}`;
  return `${fmt(min)} – ${fmt(max)} ${currency}`;
}

export function statusColor(status) {
  const map = {
    applied: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    interview: 'bg-orange-100 text-orange-700',
    offered: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-emerald-100 text-emerald-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}
