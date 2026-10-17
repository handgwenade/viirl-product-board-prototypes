import { referenceDate, weekStart } from './data.mjs';
export const statuses = ['Upcoming', 'In progress', 'Blocked', 'Done'];
export function dayNumber(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return null;
  const time = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === date ? time / 86400000 : null;
}
export function dueState(item) {
  const due = dayNumber(item.due);
  if (due === null) return 'Not set';
  if (item.status === 'Done') return 'Delivered';
  const days = due - dayNumber(referenceDate);
  return days < 0 ? 'Overdue' : days === 0 ? 'Due today' : days <= 2 ? 'Due soon' : 'Scheduled';
}
export function dateLabel(date) {
  return dayNumber(date) === null ? 'Not set' : new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
export function dayIndex(date) {
  return dayNumber(date) === null ? -1 : dayNumber(date) - dayNumber(weekStart);
}
export function hours(item) {
  return `${item.spent == null ? 'Not set' : item.spent + 'h'} spent / ${item.estimate == null ? 'Not set' : item.estimate + 'h'} estimated`;
}
export function chunks(list, size) {
  if (!Number.isInteger(size) || size < 1) throw new Error('Page size must be positive');
  return Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));
}
export function step(index, count, direction = 1) { return count ? ((index + direction) % count + count) % count : 0; }
export function intervalSeconds(value) { return Math.min(120, Math.max(5, Number(value) || 20)); }
export function boardPages(items) {
  const groups = statuses.map(status => items.filter(item => item.status === status));
  return Array.from({ length: Math.max(1, ...groups.map(group => group.length)) }, (_, page) => groups.map(group => group.length ? group[page % group.length] : null));
}
export function timelinePages(items) {
  const pages = [];
  for (const item of items) {
    const last = pages.at(-1);
    if (last?.length === 1 && last[0].title.length <= 40 && item.title.length <= 40) last.push(item);
    else pages.push([item]);
  }
  return pages;
}
export function spotlightPages(items, streams) {
  const rank = { Blocked: 0, 'In progress': 1, Upcoming: 2, Done: 3 };
  return streams.flatMap(stream => {
    const group = items.filter(item => item.stream === stream).sort((a, b) => rank[a.status] - rank[b.status]);
    return chunks(group, group.some(item => item.title.length > 40) ? 2 : 3).map(group => ({ stream, group }));
  });
}
