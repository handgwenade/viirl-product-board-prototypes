/* global document, window, URLSearchParams, matchMedia, setInterval, clearInterval */
import { items, workstreams, referenceDate } from './data.mjs';
import { statuses, dueState, dateLabel, dayIndex, hours, step, intervalSeconds, boardPages, timelinePages, spotlightPages } from './logic.mjs';

const params = new URLSearchParams(window.location.search);
const version = ['board', 'timeline', 'spotlight'].includes(params.get('view')) ? params.get('view') : null;
const tv = params.get('mode') === 'tv';
const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
document.documentElement.dataset.theme = theme;
const themeParams = new URLSearchParams(params);
themeParams.set('theme', theme === 'dark' ? 'light' : 'dark');
const themeToggle = `<a class="theme-toggle" href="?${themeParams}" aria-label="Switch to ${theme === 'dark' ? 'light' : 'dark'} mode">${theme === 'dark' ? 'Light' : 'Dark'} mode</a>`;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = motion.matches;
let seconds = intervalSeconds(params.get('interval'));
let current = 0;
let timer;
const app = document.querySelector('#app');
const names = { board: 'Team status board', timeline: 'Weekly delivery timeline', spotlight: 'Rotating product spotlight' };
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const slug = status => status.toLowerCase().replaceAll(' ', '-');
const symbols = { Upcoming: '○', 'In progress': '◉', Blocked: '⚠', Done: '✓' };
const statusTag = item => `<span class="status ${slug(item.status)}">${symbols[item.status]} ${esc(item.status)}</span>`;
function facts(item) {
  return `<div class="facts"><div>Owner <strong>${esc(item.owner)}</strong></div><div class="date ${slug(dueState(item))}">Due ${dateLabel(item.due)}${item.due ? ` · <span class="due-status ${slug(dueState(item))}">${dueState(item)}</span>` : ''}</div><div class="hours">${hours(item)}</div></div>`;
}
function card(item, extra = '') {
  if (!item) return '<article class="work-card empty">No work in this stage</article>';
  return `<article class="work-card ${slug(item.status)} ${extra}" data-item="${esc(item.id)}"><div class="eyebrow">${extra === 'support-card' ? 'Work item' : esc(item.stream)} <span class="record">${esc(item.id)}</span></div>${statusTag(item)}<h3>${esc(item.title)}</h3>${facts(item)}<div class="expectation"><span>${item.status === 'Done' ? 'Accepted' : 'Next expectation'}</span><p>${esc(item.next)}</p></div></article>`;
}
function pages() {
  if (version === 'board') return boardPages(items);
  if (version === 'timeline') return timelinePages(items);
  return spotlightPages(items, workstreams);
}
function header(label, title) {
  return `<header><div class="brand">VIIRL <span>/ ${label}</span></div><div class="demo">Demo data <span>Fixed reference · ${dateLabel(referenceDate)}, 2026</span></div></header><div class="heading"><h1>${title}</h1><span class="edition">PRODUCT WORK<br>LOCAL CONCEPT / 0${Object.keys(names).indexOf(version) + 1}</span></div>`;
}
function board(page) {
  return `${header('TEAM VIEW', 'What’s moving. What needs help.')}<div class="board-grid">${statuses.map((status, i) => `<section class="lane ${slug(status)}"><div class="lane-heading"><h2>${status === 'Blocked' ? '⚠ ' : ''}${status}</h2><span>${items.filter(item => item.status === status).length}</span></div>${card(page[i])}</section>`).join('')}</div>`;
}
function timeline(page) {
  const next = items.filter(item => item.status !== 'Done' && item.due && item.due >= referenceDate).sort((a, b) => a.due.localeCompare(b.due))[0];
  const risks = items.filter(item => item.status === 'Blocked' || dueState(item) === 'Overdue');
  return `${header('DELIVERY VIEW', 'This week, at a glance.')}<div class="delivery-summary"><div><span class="eyebrow">Next delivery</span><strong>${next ? `${dateLabel(next.due)} · ${esc(next.title)}` : 'No dated delivery'}</strong></div><div class="risk"><span>⚠ ${risks.length} blocked / overdue</span><strong>${risks.length ? `${esc(risks[0].id)} · ${esc(risks[0].stream)} · ${dueState(risks[0])}${risks.length > 1 ? ` + ${risks.length - 1} more` : ''}` : 'None'}</strong></div></div><div class="week"><div class="week-head"><span>Oct 12–18, 2026</span>${['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'].map((day, i) => `<span class="${i === 2 ? 'today' : ''}">${day}</span>`).join('')}</div>${workstreams.map(stream => `<div class="week-row"><strong>${stream}</strong>${Array.from({ length: 7 }, (_, day) => `<div class="day ${day === 2 ? 'today' : ''}">${page.filter(item => item.stream === stream && dayIndex(item.due) === day).map(item => `<span class="milestone ${slug(item.status)} ${page.includes(item) ? 'selected' : ''}">${symbols[item.status]} ${esc(item.id)}</span>`).join('')}</div>`).join('')}</div>`).join('')}</div><div class="timeline-note">This page’s milestones · ${page.filter(item => dayIndex(item.due) < 0 || dayIndex(item.due) > 6).map(item => `${item.id}: ${item.due ? dateLabel(item.due) + ' · outside week' : 'Due date Not set'}`).join(' / ') || 'Numbers match the work cards below'}</div><div class="delivery-cards">${page.map(item => card(item)).join('')}</div>`;
}
function spotlight(page) {
  const [priority, ...supporting] = page.group;
  return `${header('PRODUCT SPOTLIGHT', page.stream)}<div class="spotlight-grid"><article class="hero" data-item="${esc(priority.id)}"><div class="eyebrow">Current priority · ${esc(priority.stream)} / ${esc(priority.id)}</div>${statusTag(priority)}<h2>${esc(priority.title)}</h2>${facts(priority)}<div class="expectation"><span>Next expectation</span><p>${esc(priority.next)}</p></div></article><section class="support"><h2>Also in this workstream</h2>${supporting.map(item => card(item, 'support-card')).join('') || '<p>No supporting work on this slide.</p>'}</section></div>`;
}
function review() {
  app.innerHTML = `<main class="review"><div class="review-top"><b>VIIRL / CONCEPT STUDIO</b><span>Demo data · Local exploration</span>${themeToggle}</div><p class="eyebrow">FOR GWEN + GREGG</p><h1>One team.<br>Three ways to see the work.</h1><p class="intro">Office TV concepts. Same eight fictional records, three different answers.<br>16:9 landscape · 1080p and 4K · No live connections</p><div class="concepts">${Object.entries(names).map(([key, title], i) => `<article><div class="mini ${key}" aria-hidden="true"><span>0${i + 1}</span><div></div><div></div><div></div><div></div></div><span class="eyebrow">CONCEPT 0${i + 1}</span><h2>${title}</h2><p>${['What is happening, and what needs attention?', 'What is due next, and where might delivery slip?', 'What should everyone know about this workstream?'][i]}</p><div class="links"><a href="?view=${key}&theme=${theme}">Review concept →</a><a href="?view=${key}&mode=tv&theme=${theme}">Open TV view ↗</a></div></article>`).join('')}</div><p class="review-note">TV views rotate every 20 seconds. Press Escape or Tab to return to review. Reduced motion starts paused; review controls can resume rotation. Browser fullscreen is optional.</p></main>`;
}
function render() {
  if (!version) return review();
  const all = pages();
  current = step(current, all.length, 0);
  const focusId = document.activeElement?.id;
  app.innerHTML = `${tv ? '<a class="return-link" href="?view=' + version + '&theme=' + theme + '">Return to review</a>' : `<nav class="controls" aria-label="Review controls"><a href="?theme=${theme}">← All concepts</a><strong>${names[version]}</strong><button id="previous" aria-label="Previous page">←</button><button id="pause">${paused ? 'Resume' : 'Pause'}</button><button id="next" aria-label="Next page">→</button>${themeToggle}<label>Interval <select id="interval" aria-label="Rotation interval">${[5, 10, 20, 30, 60, 120].map(value => `<option value="${value}" ${value === seconds ? 'selected' : ''}>${value}s</option>`).join('')}</select></label><a href="?view=${version}&mode=tv&interval=${seconds}&theme=${theme}">Open TV view ↗</a></nav>`}<div class="viewport"><main class="canvas ${version}">${({ board, timeline, spotlight })[version](all[current])}<footer><span>Demo data · Fictional work & owners</span><span>${version === 'spotlight' ? 'Slide' : 'Page'} ${current + 1} / ${all.length} <span class="dots">${all.length <= 7 ? all.map((_, i) => i === current ? '●' : '○').join(' ') : ''}</span> · ${paused ? 'Paused' : `${seconds}s rotation`}</span></footer></main></div>`;
  document.querySelector('#previous')?.addEventListener('click', () => advance(-1));
  document.querySelector('#next')?.addEventListener('click', () => advance(1));
  document.querySelector('#pause')?.addEventListener('click', () => { paused = !paused; render(); startTimer(); });
  document.querySelector('#interval')?.addEventListener('change', event => { seconds = intervalSeconds(event.target.value); render(); startTimer(); });
  if (focusId) document.getElementById(focusId)?.focus();
  scale();
}
function scale() {
  const viewport = document.querySelector('.viewport');
  if (!viewport) return;
  const ratio = Math.min(viewport.clientWidth / 1920, viewport.clientHeight / 1080);
  document.querySelector('.canvas').style.transform = `translate(-50%, -50%) scale(${ratio})`;
}
function advance(direction) { current = step(current, pages().length, direction); render(); startTimer(); }
function startTimer() {
  clearInterval(timer);
  if (version && !paused && !document.hidden) timer = setInterval(() => { current = step(current, pages().length); render(); }, seconds * 1000);
}
window.addEventListener('resize', scale);
window.addEventListener('keydown', event => { if (event.key === 'Escape' && tv) window.location.href = `?view=${version}&theme=${theme}`; });
motion.addEventListener('change', event => { if (event.matches) paused = true; render(); startTimer(); });
document.addEventListener('visibilitychange', startTimer);
render();
startTimer();
