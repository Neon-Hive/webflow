document.addEventListener('DOMContentLoaded', function () {
document.querySelectorAll('[data-cms-calendar]').forEach((section) => {
if (section.dataset.scriptInitialized) return;
section.dataset.scriptInitialized = 'true';
const CAL = (key) => `[data-calendar="${key}"]`;
/* ---------- Settings ---------- */
const CONFIG = {
locale: 'en-US',
timeZone: 'America/Detroit',
dateOrder: 'mdy',
maxPerCell: 3,
maxOccurrences: 400,
soonDays: 14,
emptyText: 'No events match your filters.',
monthEmptyText: 'Nothing scheduled this month.',
ctaText: 'View event',
kindAttr: 'data-event',
defaultKind: 'inbound',
kinds: ['inbound', 'outbound'], // colour only: inbound = brand, outbound = blue + ↗ arrow
// Each entry is tried in order; data-calendar="…" always wins
start: CAL('start'),
end: CAL('end'),
title: [CAL('title'), '[fs-list-field="name"], [fs-list-field="title"]', 'h1, h2, h3, h4, h5, h6', '[role="heading"], [class*="title"], [class*="heading"], [class*="text-style-h"]'],
venue: [CAL('venue'), '[fs-list-field="venue"], [fs-list-data="venue"]'],
city: [CAL('location'), '[fs-list-field="location"], [fs-list-data="location"]'],
address: [CAL('address'), '[fs-list-field="address"]'],
tags: [CAL('tags'), '[fs-list-field="category"], [fs-list-field="tags"], [fs-list-data="category"]'],
description: [CAL('description'), '[fs-list-field="description"], [fs-list-field="summary"], [fs-list-field="excerpt"]'],
image: [CAL('image')],
link: `${CAL('link')}, [data-cal-link]`,
};
const ICONS = {
clock: '<circle cx="10" cy="10" r="6.5"/><path d="M10 6.5V10l2.5 2"/>',
pin: '<path d="M10 17s5.5-4.8 5.5-8.8a5.5 5.5 0 0 0-11 0C4.5 12.2 10 17 10 17z"/><circle cx="10" cy="8.2" r="2"/>',
share: '<circle cx="14.5" cy="5" r="2"/><circle cx="5.5" cy="10" r="2"/><circle cx="14.5" cy="15" r="2"/><path d="m7.3 9 5.4-3M7.3 11l5.4 3"/>',
add: '<path d="M3.5 5.5h13v11h-13z"/><path d="M3.5 8.5h13M7 3.5v3M13 3.5v3M10 10.5v4M8 12.5h4"/>',
calendar: '<path d="M3.5 5.5h13v11h-13z"/><path d="M3.5 8.5h13M7 3.5v3M13 3.5v3"/>',
close: '<path d="m5.5 5.5 9 9M14.5 5.5l-9 9"/>',
link: '<path d="M8.6 11.4a3 3 0 0 0 4.2 0l2.4-2.4a3 3 0 0 0-4.2-4.2l-.9.9"/><path d="M11.4 8.6a3 3 0 0 0-4.2 0L4.8 11a3 3 0 0 0 4.2 4.2l.9-.9"/>',
chat: '<path d="M4 16.5 5 13a6.5 6.5 0 1 1 2.6 2.5z"/>',
x: '<path d="M4 4l12 12M16 4 4 16"/>',
download: '<path d="M10 3.5v9M6.5 9l3.5 3.5L13.5 9M4 16.5h12"/>',
};
// The site's own arrow, so the calendar matches the buttons
const ARROW = '<svg viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M8.33 10.8L7.11 9.594L8.964 7.776L10.476 6.264H0V4.536H10.476L8.964 3.042L7.11 1.206L8.334 0L13.734 5.4L8.334 10.8Z" fill="currentColor"/></svg>';
const RANGE = /\s+(?:–|—|-|to|until|through|thru)\s+|\s*[–—]\s*/i;
const NOISE = /\b(?:mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|at|from|on)\b\.?|[|·•@]/gi;
const MONTH = /^(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})$/i;
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const RECUR_SELECTOR = '[fs-list-field="repeat"], [data-cal]';
/* ---------- Helpers ---------- */
const pad = (n) => String(n).padStart(2, '0');
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const plural = (n, w = 'event') => `${n} ${w}${n === 1 ? '' : 's'}`;
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfDay = (d) => addDays(d, 0);
const diffDays = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 864e5);
const monthIndex = (d) => d.getFullYear() * 12 + d.getMonth();
const sameDay = (a, b) => dayKey(a) === dayKey(b);
const isHidden = (el) => !el || !!el.closest('.w-condition-invisible');
const month = (w) => (MONTH.test(w) ? 'janfebmaraprmayjunjulaugsepoctnovdec'.indexOf(w.slice(0, 3).toLowerCase()) / 3 : -1);
// Page scroll lock shared by the day dialog and the event card (counted, so they can overlap)
let locks = 0;
const lockScroll = (on) => {
locks = Math.max(0, locks + (on ? 1 : -1));
const locked = locks > 0;
const l = typeof lenis !== 'undefined' ? lenis : window.lenis;
if (l?.stop && l?.start) locked ? l.stop() : l.start();
else {
// No Lenis: hide overflow and pad for the scrollbar so the page doesn't jump sideways
const html = document.documentElement;
const bar = locked ? innerWidth - html.clientWidth : 0;
html.style.overflow = locked ? 'hidden' : '';
html.style.paddingRight = bar > 0 ? `${bar}px` : '';
}
};
const ico = (n) => `<span class="cal1_icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg></span>`;
const arrow = (mod = '') => `<span class="cal1_arrow${mod ? ` is-${mod}` : ''}" aria-hidden="true">${ARROW}</span>`;
const sr = (t) => (t ? `<span class="cal1_sr">${esc(t)}</span>` : '');
const atTime = (d, t) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.hr, t.mi);
// First visible match, trying each selector group in priority order
const find = (item, sels) => {
for (const sel of [].concat(sels)) {
const el = [...item.querySelectorAll(sel)].find((n) => !isHidden(n));
if (el) return el;
}
return null;
};
const text = (item, sels) => clean(find(item, sels)?.textContent);
/* ---------- Date parsing ---------- */
const numericDate = (first, second, year) => {
const a = +first;
const b = +second;
const y = +year < 100 ? 2000 + +year : +year;
const dayFirst = a > 12 || (b <= 12 && CONFIG.dateOrder === 'dmy');
return dayFirst ? [y, b - 1, a] : [y, a - 1, b];
};
const parseTime = (s) => {
const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2}(?:\.\d+)?)?\s*(?:([ap])\.?\s?m\.?|z)?$/i);
if (!m || (!m[2] && !m[3])) return null;
let hr = +m[1];
const mi = +(m[2] || 0);
if (m[3]) {
if (hr > 12) return null;
hr = (hr % 12) + (/p/i.test(m[3]) ? 12 : 0);
}
return hr < 24 && mi < 60 ? { hr, mi } : null;
};
const parseTimes = (raw) => {
const s = (raw || '').replace(/^[\s,]+/, '').trim();
if (!s) return {};
const [a, b, extra] = s.split(/\s*[-–—]\s*|\s+(?:to|until)\s+/i);
if (extra !== undefined) return null;
const end = b !== undefined ? parseTime(b) : null;
if (b !== undefined && !end) return null;
const start = parseTime(a) || (end && parseTime(a + (b.match(/[ap]\.?\s?m\.?$/i)?.[0] || '')));
return start ? { ...start, endHr: end?.hr, endMi: end?.mi } : null;
};
const PATTERNS = [
[/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})T?(.*)$/i, (m) => [+m[1], m[2] - 1, +m[3], m[4]]],
[/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})(?!\d)(.*)$/, (m) => [...numericDate(m[1], m[2], m[3]), m[4]]],
[/^([a-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?(.*)$/i, (m) => [+m[3] || 0, month(m[1]), +m[2], m[4]]],
[/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,})\.?(?:,?\s+(\d{4}))?(.*)$/i, (m) => [+m[3] || 0, month(m[2]), +m[1], m[4]]],
];
const parsePart = (raw, ctx) => {
const s = clean(raw.replace(NOISE, ' '))
.replace(/^,+|,+$/g, '')
.trim();
if (ctx) {
const t = parseTime(s);
if (t) return { y: ctx.y, mo: ctx.mo, d: ctx.d, ...t };
}
const list = ctx ? [...PATTERNS, [/^(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?(.*)$/, (m) => [+m[2] || 0, ctx.mo, +m[1], m[3]]]] : PATTERNS;
for (const [re, map] of list) {
const m = s.match(re);
if (!m) continue;
const [y, mo, d, rest] = map(m);
const t = parseTimes(rest);
if (t && mo >= 0 && mo <= 11 && d >= 1 && d <= 31) return { y, mo, d, ...t };
}
return null;
};
const parseText = (raw) => {
let s = clean(raw);
if (ISO.test(s)) {
const d = new Date(s);
if (isNaN(d)) return null;
const allDay = !d.getUTCHours() && !d.getUTCMinutes();
const start = allDay ? new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) : d;
return { start, end: start, hasTime: !allDay, endTime: false };
}
s = s.replace(/\s*\b(?:GMT|UTC)\b.*$/i, '');
if (s.length < 5 || s.length > 80 || !/\d/.test(s)) return null;
const parts = s.split(RANGE);
if (parts.length > 2) return null;
const a = parsePart(parts[0]);
if (!a) return null;
const b = parts[1] !== undefined ? parsePart(parts[1], a) : null;
if (parts[1] !== undefined && !b) return null;
const y = a.y || b?.y || new Date().getFullYear();
const start = new Date(y, a.mo, a.d, a.hr || 0, a.mi || 0);
if (start.getDate() !== a.d || start.getMonth() !== a.mo) return null;
let end = b ? new Date(b.y || y, b.mo, b.d, b.hr || 0, b.mi || 0) : a.endHr != null ? new Date(y, a.mo, a.d, a.endHr, a.endMi) : start;
if (b && end < start && !a.y && b.mo < a.mo) start.setFullYear(y - 1);
if (end < start && sameDay(end, start)) end = new Date(+end + 864e5);
const endTime = b ? !!(b.hr || b.mi) : a.endHr != null;
return { start, end: end < start ? start : end, hasTime: a.hr != null && (!!(a.hr || a.mi) || endTime), endTime };
};
const rawValue = (el) => clean(el.getAttribute('fs-list-value') ?? el.getAttribute('datetime') ?? el.textContent);
const readRaw = (item, sel) => {
const el = find(item, sel);
return el ? rawValue(el) : '';
};
// End can be a full date ("Dec 31, 2026 5:00 PM") or just a time ("5:00 PM")
const parseEnd = (raw, date) => {
if (!raw || !date) return null;
const p = parseText(raw);
if (p) return { end: p.end > p.start ? p.end : p.start, hasTime: p.hasTime };
const t = parseTime(clean(raw.replace(NOISE, ' ')));
return t ? { end: atTime(date.start, t), hasTime: true } : null;
};
const withEnd = (date, end) => {
if (!date || !end) return date;
let finish = end.end;
if (end.hasTime && finish <= date.start && sameDay(finish, date.start)) finish = new Date(+finish + 864e5); // runs past midnight
if (finish <= date.start) return date;
return { ...date, end: finish, endTime: end.hasTime };
};
const findDate = (item) => {
let date = parseText(readRaw(item, CONFIG.start));
let endRaw = readRaw(item, CONFIG.end);
if (!date || !endRaw) {
for (const el of item.querySelectorAll('[fs-list-field], time[datetime]')) {
const name = (el.getAttribute('fs-list-field') || '').toLowerCase();
if (/^repeat/.test(name) || isHidden(el)) continue;
const raw = rawValue(el);
if (/end|finish|until/.test(name)) {
if (!endRaw && raw) endRaw = raw;
} else if (!date) {
date = parseText(raw);
}
}
}
let time = null;
if (!date?.hasTime) {
for (const el of item.querySelectorAll('*')) {
const t = el.textContent;
if (t.length > 120 || el.closest(`[data-cal], ${CONFIG.end}`)) continue;
if (!date && (date = parseText(t))) {
if (date.hasTime) break;
continue;
}
if (!time && t.length <= 40) {
const r = parseTimes(clean(t.replace(NOISE, ' ')));
if (r?.hr != null) time = r;
}
if (date && time) break;
}
}
if (date && !date.hasTime && time) {
const start = atTime(date.start, time);
let finish = date.end > date.start ? new Date(date.end) : new Date(start);
if (time.endHr != null) finish.setHours(time.endHr, time.endMi);
if (finish < start) finish = new Date(+finish + 864e5);
date = { start, end: finish, hasTime: true, endTime: time.endHr != null };
}
return withEnd(date, parseEnd(endRaw, date));
};
/* ---------- Recurrence ---------- */
const readField = (item, name) => {
const el = item.querySelector(`[fs-list-field="${name}"]`);
return isHidden(el) ? '' : clean(el.getAttribute('fs-list-value') ?? el.textContent);
};
const readLines = (item, names) => {
const el = item.querySelector(names.map((n) => `[data-cal="${n}"]`).join(', '));
if (isHidden(el)) return [];
const decoder = document.createElement('textarea');
decoder.innerHTML = el.innerHTML
.replace(/<br\s*\/?>/gi, '\n')
.replace(/<\/(p|div|li)>/gi, '\n')
.replace(/<[^>]+>/g, '');
return decoder.value
.split(/[\n;]+/)
.flatMap((line) => (parseText(line) ? [line] : line.split(/,\s*(?=[a-z]{3,}\.?\s+\d|\d{1,2}[-/.]\d|\d{4}[-/.])/i)))
.map(clean)
.filter(Boolean);
};
const readDays = (item) => {
const wrap = item.querySelector('[data-cal="repeat-days"]');
if (isHidden(wrap)) return [];
return [
...new Set(
[...wrap.querySelectorAll('*')]
.filter((el) => !el.children.length && !isHidden(el))
.map((el) => DAY_KEYS.indexOf(clean(el.textContent).slice(0, 3).toLowerCase()))
.filter((i) => i >= 0),
),
];
};
const warnLine = (title, line, field) => {
if (/\d/.test(line)) console.warn(`[cms-calendar] "${title}": could not read "${line}" in ${field}.`);
};
const occurrences = (item, base, title) => {
if (!item.querySelector(RECUR_SELECTOR)) return null;
const repeat = readField(item, 'repeat').toLowerCase();
const duration = Math.max(0, base.end - base.start);
const first = startOfDay(base.start);
const until = parseText(readField(item, 'repeat-until'))?.start;
const limit = until ? addDays(startOfDay(until), 1) : new Date(first.getFullYear() + 1, first.getMonth(), first.getDate() + 1);
const at = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), base.start.getHours(), base.start.getMinutes());
const make = (start, end = new Date(+start + duration), hasTime = base.hasTime, endTime = base.endTime, pattern = false) => ({
start,
end,
hasTime,
endTime,
pattern,
multiDay: !sameDay(start, end),
});
const list = [make(base.start, base.end, base.hasTime, base.endTime, true)];
const push = (d) => {
if (d >= first && d < limit && list.length < CONFIG.maxOccurrences) list.push(make(at(d), undefined, undefined, undefined, true));
};
if (/week/.test(repeat)) {
const step = /2/.test(repeat) ? 2 : 1;
const days = readDays(item);
const weekdays = days.length ? days : [base.start.getDay()];
for (let w = addDays(first, -first.getDay()); w < limit && list.length < CONFIG.maxOccurrences; w = addDays(w, 7 * step)) {
weekdays.forEach((dow) => push(addDays(w, dow)));
}
} else if (/month/.test(repeat)) {
const byWeekday = /weekday/.test(repeat);
const dow = base.start.getDay();
const nth = Math.ceil(base.start.getDate() / 7);
for (let i = 1; i < 240; i++) {
const monthStart = new Date(first.getFullYear(), first.getMonth() + i, 1);
let d;
if (!byWeekday) {
d = new Date(monthStart.getFullYear(), monthStart.getMonth(), first.getDate());
if (d.getDate() !== first.getDate()) continue;
} else if (nth === 5) {
const last = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
d = addDays(last, -((last.getDay() - dow + 7) % 7));
} else {
d = addDays(monthStart, ((dow - monthStart.getDay() + 7) % 7) + (nth - 1) * 7);
if (d.getMonth() !== monthStart.getMonth()) continue;
}
if (d >= limit) break;
push(d);
}
}
readLines(item, ['more-dates', 'more-date']).forEach((line) => {
const p = parseText(line);
if (!p) return warnLine(title, line, 'More Dates');
if (p.hasTime) {
for (let i = list.length - 1; i >= 0; i--) {
if (list[i].pattern && sameDay(list[i].start, p.start)) list.splice(i, 1);
}
list.push(make(p.start, p.endTime ? p.end : new Date(+p.start + duration), true, p.endTime || base.endTime));
} else {
list.push(make(at(p.start), sameDay(p.start, p.end) ? undefined : new Date(+at(p.end) + duration)));
}
});
const skip = new Set();
readLines(item, ['skip-dates', 'skip-date']).forEach((line) => {
const p = parseText(line);
if (p) skip.add(dayKey(p.start));
else warnLine(title, line, 'Skip Dates');
});
const seen = new Set();
const result = list.filter((o) => !skip.has(dayKey(o.start)) && !seen.has(+o.start) && seen.add(+o.start)).sort((a, b) => a.start - b.start);
return result.length > 1 || skip.size || !result.some((o) => o.pattern) ? result : null;
};
/* ---------- Item → event ---------- */
const isTitle = (t) => t.length > 1 && t.length <= 160 && !parseText(t);
const findTitle = (item) => {
for (const sel of CONFIG.title) {
for (const el of item.querySelectorAll(sel)) {
const t = clean(el.textContent);
if (!isHidden(el) && isTitle(t)) return t;
}
}
let best = '';
let size = 0;
for (const el of item.querySelectorAll('*')) {
if (el.closest('[data-cal]')) continue;
const t = el.children.length ? '' : clean(el.textContent);
const fontSize = isTitle(t) ? parseFloat(getComputedStyle(el).fontSize) : 0;
if (fontSize > size) [size, best] = [fontSize, t];
}
return best || clean(item.querySelector('img')?.alt);
};
const findLink = (item) => {
const links = [];
const explicit = [...item.querySelectorAll(CONFIG.link)];
for (const el of [...explicit, ...item.querySelectorAll('a[href]')]) {
if (isHidden(el)) continue;
const href = clean(el.dataset.calLink || el.getAttribute('href') || (explicit.includes(el) ? el.textContent : ''));
if (!href || href.startsWith('#') || /^(javascript|mailto|tel):/i.test(href)) continue;
let url;
try {
url = new URL(href, location.href);
} catch (e) {
continue;
}
if (url.origin === location.origin && url.pathname === location.pathname && !url.search) continue;
const external = url.origin !== location.origin;
const link = { url: url.href, external, newTab: external || el.getAttribute('target') === '_blank' };
if (explicit.includes(el)) return link;
links.push(link);
}
return links.find((l) => !l.external) || links[0] || { url: null, external: false, newTab: false };
};
const readKind = (item, link) => {
const attr = `[${CONFIG.kindAttr}]`;
const el = item.matches(attr) ? item : item.querySelector(attr);
const k = clean(el?.getAttribute(CONFIG.kindAttr)).toLowerCase();
if (CONFIG.kinds.includes(k)) return k;
return link.external ? 'outbound' : CONFIG.defaultKind;
};
const readTags = (item) => {
for (const sel of CONFIG.tags) {
const list = [...item.querySelectorAll(sel)]
.filter((n) => !isHidden(n))
.map((n) => clean(n.textContent))
.filter(Boolean);
if (list.length) return [...new Set(list.map((t) => t.toLowerCase()))].map((t) => list.find((l) => l.toLowerCase() === t));
}
return [];
};
// Rich text → one line per paragraph, heading or list item
const readDescription = (item, title) => {
const el = find(item, CONFIG.description);
if (el) {
const blocks = [...el.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6')].map((b) => clean(b.textContent)).filter(Boolean);
return (blocks.length ? blocks : [clean(el.textContent)]).filter(Boolean).join('\n');
}
return (
[...item.querySelectorAll('p')]
.map((p) => clean(p.textContent))
.find((t) => t.length >= 40 && t !== title && !parseText(t)) || ''
);
};
const readImage = (item) => {
const el = find(item, CONFIG.image);
const src = el ? el.getAttribute('src') || el.querySelector('img')?.getAttribute('src') || clean(el.textContent) : item.querySelector('img')?.getAttribute('src');
return src && !/placeholder/.test(src) ? src : null;
};
const cache = new WeakMap();
const toEvent = (item) => {
if (cache.has(item)) return cache.get(item);
const date = findDate(item);
const title = date && findTitle(item);
if (!title) return (cache.set(item, null), null);
const link = findLink(item);
const venue = text(item, CONFIG.venue);
const city = text(item, CONFIG.city);
const address = text(item, CONFIG.address);
const ev = {
...date,
...link,
title,
kind: readKind(item, link),
venue,
city,
address,
multiDay: !sameDay(date.start, date.end),
place: [...new Set([venue, address || city].filter(Boolean))].join(', '),
tags: readTags(item),
description: readDescription(item, title),
image: readImage(item),
occurrences: occurrences(item, date, title),
};
cache.set(item, ev);
return ev;
};
window.cmsCalendar = { parse: parseText, find: findDate, title: findTitle, link: findLink, event: toEvent };
const listEl = (section.closest('section') || document).querySelector('[fs-list-element="list"]') || document.querySelector('[fs-list-element="list"]');
const initial = listEl ? [...listEl.children] : [];
if (!initial.some((item) => toEvent(item))) {
const dated = initial.filter((item) => findDate(item)).length;
console.warn(`[cms-calendar] Calendar view disabled: ${!listEl ? 'no [fs-list-element="list"] found on this page.' : dated ? `dates were found in ${dated} item(s), but no title could be detected.` : 'no detectable dates found in the collection items.'}`);
document.querySelectorAll('input[name="view"][data-cms-view][value="calendar"]').forEach((i) => (i.dataset.cmsViewUnsupported = 'true'));
document.dispatchEvent(new CustomEvent('cmsview:refresh'));
return;
}
/* ---------- Formatting ---------- */
const fmt = (o) => new Intl.DateTimeFormat(CONFIG.locale, o);
const F = {
month: fmt({ month: 'long', year: 'numeric' }),
wd: fmt({ weekday: 'short' }),
day: fmt({ weekday: 'long', month: 'long', day: 'numeric' }),
full: fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
range: fmt({ month: 'long', day: 'numeric', year: 'numeric' }),
short: fmt({ month: 'short', day: 'numeric' }),
monShort: fmt({ month: 'short' }),
time: fmt({ hour: 'numeric', minute: '2-digit' }),
hour: fmt({ hour: 'numeric' }),
dateTime: fmt({ month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
};
const RTF = new Intl.RelativeTimeFormat(CONFIG.locale, { numeric: 'auto' });
const shortTime = (d) => (d.getMinutes() ? F.time : F.hour).format(d);
const rangeLabel = (ev) => F.short.formatRange(ev.start, ev.end);
const timeLabel = (ev) => {
if (ev.multiDay) return rangeLabel(ev) + (ev.hasTime ? `, ${shortTime(ev.start)}` : '');
if (!ev.hasTime) return 'All day';
return ev.endTime ? F.time.formatRange(ev.start, ev.end) : F.time.format(ev.start);
};
const isExternal = (ev) => ev.kind === 'outbound';
// Real start/end moments (used for "Add to calendar")
const span = (ev) => {
if (!ev.hasTime) return { allDay: true, start: startOfDay(ev.start), end: addDays(startOfDay(ev.end), 1) };
// No end time: multi-day runs to the end of its last day, single day defaults to 1 hour
const end = ev.endTime ? ev.end : ev.multiDay ? addDays(startOfDay(ev.end), 1) : new Date(+ev.start + 36e5);
return { allDay: false, start: ev.start, end };
};
/* ---------- Shell ---------- */
const today = startOfDay(new Date());
const todayIdx = monthIndex(today);
const S = { events: [], byDay: new Map(), months: [], current: null, min: todayIdx, max: todayIdx, compact: false, ready: false, dirty: true, warned: false, ev: null };
window.cmsCalendar.state = S;
const uid = Math.random().toString(36).slice(2, 8);
const root = document.createElement('div');
root.className = 'cal1_wrap';
root.innerHTML = `
<div class="cal1_head">
<h2 class="cal1_title u-text-style-h5 u-text-transform-uppercase"></h2>
<div class="cal1_nav">
<button type="button" class="cal1_btn" data-nav="-1" aria-label="Previous month">${arrow('prev')}</button>
<button type="button" class="cal1_btn" data-nav="today">Today</button>
<button type="button" class="cal1_btn" data-nav="1" aria-label="Next month">${arrow()}</button>
</div>
</div>
<p class="cal1_sr" role="status"></p>
<div class="cal1_body"><p class="cal1_empty">Loading calendar…</p></div>
<dialog class="cal1_dialog" aria-labelledby="cal1-${uid}-day" data-lenis-prevent></dialog>
<div class="cal1_pop" popover="auto" role="dialog" aria-labelledby="cal1-${uid}-ev" data-lenis-prevent></div>`;
section.append(root);
const [titleEl, statusEl, body, dialog, pop] = ['.cal1_title', '[role=status]', '.cal1_body', '.cal1_dialog', '.cal1_pop'].map((s) => root.querySelector(s));
const [prevBtn, todayBtn, nextBtn] = root.querySelectorAll('[data-nav]');
titleEl.tabIndex = -1;
/* ---------- Month in the URL (#cal-2026-03) ---------- */
const HASH = /^#cal-(\d{4})-(\d{2})$/;
const readHash = () => {
const m = location.hash.match(HASH);
return m && +m[2] >= 1 && +m[2] <= 12 ? +m[1] * 12 + (+m[2] - 1) : null;
};
const writeHash = () => {
if (S.current == null) return;
const h = `#cal-${Math.floor(S.current / 12)}-${pad((S.current % 12) + 1)}`;
if (location.hash !== h) history.replaceState(history.state, '', h);
};
const clearHash = () => {
if (HASH.test(location.hash)) history.replaceState(history.state, '', location.pathname + location.search);
};
const showCalendar = () => {
const input = document.querySelector('input[name="view"][data-cms-view][value="calendar"]');
if (input && !input.disabled && !input.checked) {
input.checked = true;
input.dispatchEvent(new Event('change', { bubbles: true }));
}
};
// A shared link opens straight into the calendar
if (readHash() != null) showCalendar();
const isPopOpen = () => pop.matches(':popover-open');
const tpl = section.querySelector('[data-cal-template="button"]') || document.querySelector('[data-cal-template="button"]');
const ctaTemplate = tpl && (tpl.matches('a, button') ? tpl : tpl.firstElementChild);
const countIn = (idx) => {
const from = new Date(Math.floor(idx / 12), idx % 12, 1);
const to = new Date(Math.floor(idx / 12), (idx % 12) + 1, 1);
return S.events.filter((e) => e.start < to && e.end >= from).length;
};
/* ---------- Add to calendar ---------- */
const stamp = (d, allDay) => dayKey(d).replace(/-/g, '') + (allDay ? '' : `T${pad(d.getHours())}${pad(d.getMinutes())}00`);
const isoLocal = (d, allDay) => dayKey(d) + (allDay ? '' : `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`);
const calLinks = (ev, url) => {
const s = span(ev);
const details = [ev.description, url].filter(Boolean).join('\n\n');
const google = new URLSearchParams({ action: 'TEMPLATE', text: ev.title, dates: `${stamp(s.start, s.allDay)}/${stamp(s.end, s.allDay)}`, details, location: ev.place });
if (!s.allDay) google.set('ctz', CONFIG.timeZone);
const outlook = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: ev.title, startdt: isoLocal(s.start, s.allDay), enddt: isoLocal(s.end, s.allDay), body: details, location: ev.place });
if (s.allDay) outlook.set('allday', 'true');
return { s, details, google: `https://calendar.google.com/calendar/render?${google}`, outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlook}` };
};
const downloadIcs = (ev) => {
const url = ev.url || location.href;
const { s, details } = calLinks(ev, url);
const e = (t) => t.replace(/[\\;,]/g, '\\$&').replace(/\r?\n/g, '\\n');
const kind = s.allDay ? ';VALUE=DATE' : `;TZID=${CONFIG.timeZone}`;
const slug =
ev.title
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-|-$/g, '') || 'event';
const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CMS Calendar//EN', 'BEGIN:VEVENT', `UID:${stamp(s.start, s.allDay)}-${slug}@${location.hostname}`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTSTART${kind}:${stamp(s.start, s.allDay)}`, `DTEND${kind}:${stamp(s.end, s.allDay)}`, `SUMMARY:${e(ev.title)}`, `DESCRIPTION:${e(details)}`, ev.place && `LOCATION:${e(ev.place)}`, `URL:${url}`, 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: `${slug}.ics` });
a.click();
setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
/* ---------- CTA from the site's button template ---------- */
const toAnchor = (el) => {
if (el.matches('a')) return el;
const a = document.createElement('a');
[...el.attributes].forEach(({ name, value }) => a.setAttribute(name, value));
a.append(...el.childNodes);
el.replaceWith(a);
return a;
};
const setLink = (a, ev) => {
['type', 'disabled', 'role', 'tabindex', 'aria-disabled'].forEach((x) => a.removeAttribute(x));
a.setAttribute('href', ev.url);
if (ev.newTab) {
a.setAttribute('target', '_blank');
a.setAttribute('rel', 'noopener');
} else {
a.removeAttribute('target');
a.removeAttribute('rel');
}
return a;
};
const cta = (ev) => {
if (!ev.url) return '';
const label = CONFIG.ctaText;
const tab = ev.newTab ? ' (opens in a new tab)' : '';
if (!ctaTemplate) {
return `<a class="cal1_cta is-${ev.kind}" data-cal-cta href="${esc(ev.url)}"${ev.newTab ? ' target="_blank" rel="noopener"' : ''}>${esc(label)}${arrow()}${sr(tab)}</a>`;
}
const holder = document.createElement('div');
holder.append(ctaTemplate.cloneNode(true));
let node = holder.firstElementChild;
[node, ...node.querySelectorAll('[id]')].forEach((n) => n.removeAttribute('id'));
// Webflow "clickable wrap" pattern: an invisible link/button covering the visible text
const overlay = node.matches('a, button') ? null : node.querySelector('a, button');
let hit = null;
if (overlay) {
hit = setLink(toAnchor(overlay), ev);
hit.innerHTML = `<span class="u-sr-only">${esc(`${label}: ${ev.title}${tab}`)}</span>`;
} else {
node = setLink(toAnchor(node), ev);
}
const visible = [...node.querySelectorAll('*')].reverse().find((n) => !n.children.length && clean(n.textContent) && !(hit && hit.contains(n)));
(visible || node).textContent = label;
if (!overlay && tab) node.insertAdjacentHTML('beforeend', sr(tab));
node.classList.add(`is-${ev.kind}`);
node.setAttribute('data-cal-cta', '');
return holder.innerHTML;
};
/* ---------- Markup ---------- */
const evRow = (ev) => `
<button type="button" class="cal1_ev is-${ev.kind}" data-ev="${ev.id}" aria-haspopup="dialog">
${ev.image ? `<img class="cal1_ev_img" src="${esc(ev.image)}" alt="" loading="lazy" width="72" height="72">` : `<span class="cal1_ev_img" aria-hidden="true"></span>`}
<span class="cal1_ev_body">
<span class="cal1_ev_meta"><span class="cal1_dot" aria-hidden="true"></span><span>${esc(timeLabel(ev))}</span>${ev.venue ? `<span>${esc(ev.venue)}</span>` : ''}</span>
<span class="cal1_ev_title"><span>${esc(ev.title)}</span>${isExternal(ev) ? arrow('ext') : ''}</span>
</span>
</button>`;
const evList = (list) => `<ul class="cal1_events" role="list">${list.map((ev) => `<li>${evRow(ev)}</li>`).join('')}</ul>`;
const card = (ev) => {
const url = ev.url || location.href;
const links = calLinks(ev, url);
const id = `cal1-${uid}`;
const ext = (href, icon, label) => `<li><a class="cal1_menu_item" href="${esc(href)}" target="_blank" rel="noopener">${ico(icon)}<span>${label}</span>${sr(' (opens in a new tab)')}</a></li>`;
const mapsQuery = ev.address || [ev.venue, ev.city].filter(Boolean).join(', ');
const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
const where = ev.address || ev.city;
// Label / value rows
const rows = [];
if (ev.venue || where) {
rows.push([
'Location',
`${ev.venue ? `<span class="cal1_field_strong">${esc(ev.venue)}</span>` : ''}${where ? `<a class="cal1_link" href="${esc(maps)}" target="_blank" rel="noopener">${esc(where)}${sr(' (opens Google Maps in a new tab)')}</a>` : ''}`,
]);
}
rows.push([ev.multiDay ? 'Start date' : 'Date', esc(F.full.format(ev.start))]);
if (ev.multiDay) rows.push(['End date', esc(F.full.format(ev.end))]);
if (ev.hasTime) {
rows.push(['Start time', esc(F.time.format(ev.start))]);
if (ev.endTime) rows.push(['End time', esc(F.time.format(ev.end))]);
} else {
rows.push(['Time', 'All day']);
}
const desc = ev.description ? ev.description.split('\n').map((line) => `<p>${esc(line)}</p>`).join('') : '';
return `
${ev.image ? `<div class="cal1_pop_media"><img class="cal1_pop_img" src="${esc(ev.image)}" alt=""></div>` : ''}
<button type="button" class="cal1_icon_btn cal1_pop_close" data-close aria-label="Close">${ico('close')}</button>
<div class="cal1_pop_body">
<h3 class="cal1_pop_title u-text-style-h6" id="${id}-ev">${esc(ev.title)}</h3>
<dl class="cal1_fields">
${rows.map(([k, v]) => `<div class="cal1_field"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
</dl>
${ev.tags.length ? `<ul class="cal1_pop_tags" role="list" aria-label="Categories">${ev.tags.map((t) => `<li class="cal1_tag">${esc(t)}</li>`).join('')}</ul>` : ''}
${desc ? `<div class="cal1_pop_desc">${desc}</div>` : ''}
</div>
<div class="cal1_pop_foot">
<div class="cal1_pop_actions">
<button type="button" class="cal1_icon_btn" data-menu="${id}-share" aria-controls="${id}-share" aria-expanded="false" aria-label="Share">${ico('share')}</button>
<button type="button" class="cal1_icon_btn" data-menu="${id}-add" aria-controls="${id}-add" aria-expanded="false" aria-label="Add to calendar">${ico('add')}</button>
</div>
${cta(ev)}
</div>
<div class="cal1_pop_menu" id="${id}-share" hidden>
<p class="cal1_pop_menu_title">Share</p>
<ul role="list">
${ext(`https://wa.me/?text=${encodeURIComponent(`${ev.title} ${url}`)}`, 'chat', 'WhatsApp')}
${ext(`https://twitter.com/intent/tweet?${new URLSearchParams({ text: ev.title, url })}`, 'x', 'X (Twitter)')}
<li><button type="button" class="cal1_menu_item" data-copy>${ico('link')}<span>Copy link</span></button></li>
</ul>
</div>
<div class="cal1_pop_menu" id="${id}-add" hidden>
<p class="cal1_pop_menu_title">Add to calendar</p>
<ul role="list">
${ext(links.google, 'calendar', 'Google Calendar')}
${ext(links.outlook, 'calendar', 'Outlook')}
<li><button type="button" class="cal1_menu_item" data-ics>${ico('download')}<span>Apple Calendar or other (.ics)</span></button></li>
</ul>
</div>
<p class="cal1_sr" role="status"></p>`;
};
const chip = (ev, c0, c1, lane, weekStart, weekEnd) => {
const contStart = startOfDay(ev.start) < weekStart;
const contEnd = startOfDay(ev.end) > weekEnd;
const whenText = ev.multiDay ? rangeLabel(ev) : `${F.day.format(ev.start)}, ${timeLabel(ev)}`;
const classes = ['cal1_chip', `is-${ev.kind}`, ev.multiDay && 'is-bar', contStart && 'is-cont-start', contEnd && 'is-cont-end'].filter(Boolean).join(' ');
const label = [ev.title, whenText].filter(Boolean).join(', ');
const time = ev.hasTime && !ev.multiDay ? `<span class="cal1_chip_time">${esc(shortTime(ev.start))}</span>` : '';
return `<li class="cal1_slot" style="grid-column:${c0 + 1} / ${c1 + 2};grid-row:${lane + 1}"><button type="button" class="${classes}" data-ev="${ev.id}" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(label)}" title="${esc([ev.title, ev.venue].filter(Boolean).join(', '))}"><span class="cal1_chip_text">${time}${esc(ev.title)}</span>${isExternal(ev) ? arrow('ext') : ''}</button></li>`;
};
const week = (weekStart, m) => {
const weekEnd = addDays(weekStart, 6);
const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
const items = [...new Set(days.flatMap((d) => S.byDay.get(dayKey(d)) || []))].sort((a, b) => b.multiDay - a.multiDay || diffDays(b.start, b.end) - diffDays(a.start, a.end) || a.start - b.start);
const lanes = [];
const hidden = Array(7).fill(0);
const slots = [];
items.forEach((ev) => {
const c0 = Math.max(0, diffDays(weekStart, ev.start));
const c1 = Math.min(6, diffDays(weekStart, ev.end));
let lane = 0;
while (lanes[lane]?.slice(c0, c1 + 1).some(Boolean)) lane++;
if (lane >= CONFIG.maxPerCell) {
for (let c = c0; c <= c1; c++) hidden[c]++;
return;
}
(lanes[lane] ||= Array(7).fill(false)).fill(true, c0, c1 + 1);
slots.push(chip(ev, c0, c1, lane, weekStart, weekEnd));
});
const cells = days
.map((d) => {
const key = dayKey(d);
const count = (S.byDay.get(key) || []).length;
const isToday = sameDay(d, today);
const num = count ? `<button type="button" class="cal1_num" data-day="${key}" aria-label="${F.day.format(d)}, ${plural(count)}">${d.getDate()}</button>` : `<span class="cal1_num" aria-hidden="true">${d.getDate()}</span>`;
return `<div class="cal1_day${d.getMonth() !== m ? ' is-out' : ''}${isToday ? ' is-today" aria-current="date' : ''}">${num}</div>`;
})
.join('');
const more = hidden.map((n, c) => (n ? `<li class="cal1_slot" style="grid-column:${c + 1};grid-row:${CONFIG.maxPerCell + 1}"><button type="button" class="cal1_more" data-day="${dayKey(days[c])}" aria-label="${plural(n)} more on ${F.day.format(days[c])}">+${n} more</button></li>` : '')).join('');
return `<div class="cal1_week" role="group" aria-label="Week of ${F.day.format(weekStart)}"><div class="cal1_week_days">${cells}</div><ul class="cal1_week_events" role="list">${slots.join('')}${more}</ul></div>`;
};
const grid = (y, m) => {
const first = new Date(y, m, 1);
const start = addDays(first, -first.getDay());
const head = Array.from({ length: 7 }, (_, i) => `<span class="cal1_wd">${F.wd.format(addDays(start, i))}</span>`).join('');
const weeks = Array.from({ length: 6 }, (_, w) => week(addDays(start, w * 7), m)).join('');
return `<div class="cal1_month" role="group" aria-label="${F.month.format(first)}"><div class="cal1_week_head" aria-hidden="true">${head}</div>${weeks}</div>`;
};
const agenda = (y, m) => {
const monthStart = new Date(y, m, 1);
let html = '';
for (let d = monthStart; d.getMonth() === m; d = addDays(d, 1)) {
const list = (S.byDay.get(dayKey(d)) || []).filter((ev) => !ev.multiDay || sameDay(ev.start, d) || (sameDay(d, monthStart) && ev.start < monthStart));
if (list.length) html += `<li class="cal1_agenda_day"><h3 class="cal1_agenda_date">${F.day.format(d)}</h3>${evList(list)}</li>`;
}
return html ? `<ol class="cal1_agenda" role="list">${html}</ol>` : `<p class="cal1_empty">${CONFIG.monthEmptyText}</p>`;
};
/* ---------- Empty month ---------- */
const fromIdx = (i) => new Date(Math.floor(i / 12), i % 12, 1);
const jumpBtn = (idx, dir) => {
if (idx == null) return '';
const name = F.month.format(fromIdx(idx));
const prev = dir === 'prev';
return `<button type="button" class="cal1_btn cal1_jump" data-nav-to="${idx}" aria-label="${prev ? 'Previous' : 'Next'} month with events: ${name}">${prev ? arrow('prev') : ''}<span>${name}</span>${prev ? '' : arrow()}</button>`;
};
const emptyMonth = (label) => {
const prev = S.months.filter((i) => i < S.current).pop();
const next = S.months.find((i) => i > S.current);
const jumps = prev != null || next != null ? `<div class="cal1_jump_wrap">${jumpBtn(prev, 'prev')}${jumpBtn(next, 'next')}</div>` : '';
return `<div class="cal1_empty_msg"><p>Nothing scheduled in ${label}.</p>${jumps}</div>`;
};
/* ---------- Render ---------- */
const render = () => {
if (!S.ready || document.documentElement.dataset.cmsView !== 'calendar') return;
S.dirty = false;
if (isPopOpen()) pop.hidePopover();
const y = Math.floor(S.current / 12);
const m = S.current % 12;
const label = F.month.format(new Date(y, m, 1));
const empty = !S.events.length;
titleEl.textContent = label;
prevBtn.setAttribute('aria-disabled', empty || S.current <= S.min);
nextBtn.setAttribute('aria-disabled', empty || S.current >= S.max);
todayBtn.setAttribute('aria-disabled', empty || S.current === todayIdx);
const count = empty ? 0 : countIn(S.current);
if (empty) {
body.innerHTML = S.compact ? `<p class="cal1_empty">${CONFIG.emptyText}</p>` : `${grid(y, m)}<div class="cal1_empty_state"><p class="cal1_empty_msg">${CONFIG.emptyText}</p></div>`;
} else if (!count) {
body.innerHTML = S.compact ? `<div class="cal1_empty_inline">${emptyMonth(label)}</div>` : `${grid(y, m)}<div class="cal1_empty_state">${emptyMonth(label)}</div>`;
} else {
body.innerHTML = S.compact ? agenda(y, m) : grid(y, m);
}
statusEl.textContent = empty ? CONFIG.emptyText : count ? `${plural(count)} in ${label}` : `Nothing scheduled in ${label}`;
writeHash();
};
const clamp = (idx) => Math.min(S.max, Math.max(S.min, idx));
const go = (idx) => {
if (!S.events.length || clamp(idx) === S.current) return;
S.current = clamp(idx);
render();
};
const setData = (els) => {
const parsed = els.map(toEvent);
const events = parsed
.filter(Boolean)
.flatMap((ev) => (ev.occurrences ? ev.occurrences.map((o) => ({ ...ev, ...o })) : [ev]))
.sort((a, b) => a.start - b.start)
.map((ev, id) => ({ ...ev, id }));
if (!S.warned) {
S.warned = true;
const skipped = parsed.filter((ev) => !ev).length;
if (skipped) console.warn(`[cms-calendar] ${skipped} of ${els.length} items have no detectable date or title and were skipped.`);
}
S.events = events;
S.byDay = new Map();
events.forEach((ev) => {
for (let d = startOfDay(ev.start), i = 0; d <= ev.end && i < 93; d = addDays(d, 1), i++) {
const key = dayKey(d);
S.byDay.has(key) ? S.byDay.get(key).push(ev) : S.byDay.set(key, [ev]);
}
});
S.byDay.forEach((list) => list.sort((a, b) => b.multiDay - a.multiDay || a.start - b.start));
const months = new Set();
events.forEach((ev) => {
const a = monthIndex(ev.start);
for (let i = a; i <= monthIndex(ev.end) && i - a < 24; i++) months.add(i);
});
S.months = [...months].sort((a, b) => a - b);
const fromHash = S.current == null ? readHash() : null;
if (events.length) {
S.min = Math.min(todayIdx, monthIndex(events[0].start), fromHash ?? Infinity);
S.max = Math.max(events.reduce((max, e) => Math.max(max, monthIndex(e.end)), todayIdx), fromHash ?? -Infinity);
if (fromHash != null) {
S.current = fromHash;
} else if (S.current == null || !countIn(S.current)) {
const next = events.find((e) => e.end >= today);
S.current = next ? Math.max(monthIndex(next.start), todayIdx) : monthIndex(events.at(-1).start);
}
S.current = clamp(S.current);
} else S.current ??= todayIdx;
S.ready = true;
S.dirty = true;
render();
};
/* ---------- Event card position ---------- */
const placePop = () => {
if (!isPopOpen()) return;
const gap = 16;
const vw = document.documentElement.clientWidth;
const vh = innerHeight;
const w = pop.offsetWidth;
const ht = pop.offsetHeight;
if (vw < 640) {
// Bottom sheet on phones
pop.style.left = '0px';
pop.style.top = `${Math.max(0, vh - ht)}px`;
return;
}
const r = pop._anchor?.isConnected ? pop._anchor.getBoundingClientRect() : null;
let left = (vw - w) / 2;
let top = (vh - ht) / 2;
if (r?.width) {
left = r.right + 8 + w > vw - gap ? r.left - 8 - w : r.right + 8;
if (left < gap) left = r.left;
top = r.top + r.height / 2 - ht / 2;
}
pop.style.left = `${Math.min(Math.max(gap, left), Math.max(gap, vw - w - gap))}px`;
pop.style.top = `${Math.min(Math.max(gap, top), Math.max(gap, vh - ht - gap))}px`;
};
const onViewport = () => requestAnimationFrame(placePop);
pop.addEventListener('toggle', (e) => {
const open = e.newState === 'open';
const method = open ? 'addEventListener' : 'removeEventListener';
window[method]('scroll', onViewport, { passive: true });
window[method]('resize', onViewport);
pop._opener?.setAttribute('aria-expanded', open);
if (open) {
lockScroll(true);
return;
}
lockScroll(false);
pop._closedAt = performance.now();
if (document.activeElement === document.body || pop.contains(document.activeElement)) pop._opener?.focus({ preventScroll: true });
});
dialog.addEventListener('close', () => {
lockScroll(false);
dialog._opener?.focus();
});
const openEvent = (ev, opener) => {
if (pop._last === opener && performance.now() - (pop._closedAt || 0) < 300) return;
let anchor = opener;
if (dialog.open) {
anchor = dialog._opener;
dialog._opener = null;
dialog.close();
}
if (isPopOpen()) pop.hidePopover();
S.ev = ev;
pop.innerHTML = card(ev);
pop.dataset.kind = ev.kind;
pop.scrollTop = 0;
Object.assign(pop, { _opener: anchor, _anchor: anchor, _last: opener });
pop.showPopover();
placePop();
pop.querySelector('[data-close]').focus({ preventScroll: true });
};
const openDay = (key, opener) => {
const [y, mo, d] = key.split('-').map(Number);
const day = new Date(y, mo - 1, d);
dialog.innerHTML = `
<div class="cal1_dialog_inner">
<div class="cal1_dialog_head">
<h3 class="cal1_dialog_title u-text-style-h6" id="cal1-${uid}-day">${F.day.format(day)}</h3>
<button type="button" class="cal1_icon_btn" data-close aria-label="Close">${ico('close')}</button>
</div>
${evList(S.byDay.get(key) || [])}
</div>`;
dialog._opener = opener;
lockScroll(true);
dialog.showModal();
};
root.addEventListener('click', (e) => {
if (e.target === dialog) return dialog.close();
const t = e.target.closest('button');
if (!t || !root.contains(t)) return;
const ds = t.dataset;
if (ds.nav) {
if (t.getAttribute('aria-disabled') !== 'true') go(ds.nav === 'today' ? todayIdx : S.current + +ds.nav);
} else if (ds.navTo) {
go(+ds.navTo);
titleEl.focus({ preventScroll: true });
} else if (ds.ev) openEvent(S.events[ds.ev], t);
else if (ds.day) openDay(ds.day, t);
else if ('close' in ds) t.closest('dialog') ? dialog.close() : pop.hidePopover();
else if ('ics' in ds) downloadIcs(S.ev);
else if (ds.menu) {
const open = t.getAttribute('aria-expanded') === 'true';
pop.querySelectorAll('[data-menu]').forEach((b) => {
b.setAttribute('aria-expanded', 'false');
document.getElementById(b.dataset.menu).hidden = true;
});
if (!open) {
t.setAttribute('aria-expanded', 'true');
document.getElementById(ds.menu).hidden = false;
}
placePop();
} else if ('copy' in ds) {
const url = S.ev.url || location.href;
const label = t.querySelector('span:last-child');
const live = pop.querySelector('p[role=status]');
navigator.clipboard.writeText(url).then(
() => {
label.textContent = live.textContent = 'Link copied';
setTimeout(() => ((label.textContent = 'Copy link'), (live.textContent = '')), 2000);
},
() => prompt('Copy this link:', url),
);
}
});
/* ---------- Finsweet sync ---------- */
const toEls = (items) => (items || []).map((i) => (i instanceof Element ? i : i?.element)).filter(Boolean);
let frame = 0;
const queue = (els) => {
cancelAnimationFrame(frame);
frame = requestAnimationFrame(() => setData(els));
};
const fallback = setTimeout(() => queue([...listEl.children]), 4000);
window.FinsweetAttributes ||= [];
window.FinsweetAttributes.push([
'list',
async (instances) => {
const list = instances?.find((i) => i.listElement === listEl) || instances?.[0];
if (!list) return;
clearTimeout(fallback);
const all = () => {
const els = toEls(list.items?.value);
return els.length ? els : [...listEl.children];
};
const use = (items) => {
const els = toEls(items);
return els.length || !items?.length ? els : all();
};
let result = null;
list.addHook?.('sort', (items) => {
result = items;
if (S.ready) queue(use(items));
return items;
});
await list.loadingPaginatedItems?.catch?.(() => {});
queue(result ? use(result) : all());
},
]);
document.addEventListener('cmsview:change', (e) => {
if (e.detail?.view !== 'calendar') return clearHash();
if (S.dirty) render();
else if (S.ready) writeHash();
});
window.addEventListener('hashchange', () => {
const idx = readHash();
if (idx == null) return;
showCalendar();
if (!S.ready) return;
S.min = Math.min(S.min, idx);
S.max = Math.max(S.max, idx);
S.current = idx;
render();
});
const observe = () =>
root.observeContainer?.('(width < 48em)', (match) => {
if (!root.offsetWidth || S.compact === match) return;
S.compact = match;
S.dirty = true;
render();
});
const startedAt = Date.now();
const waitForLib = setInterval(() => {
if (typeof window.loadMatchContainer === 'function') {
clearInterval(waitForLib);
window.loadMatchContainer().then(observe);
} else if (Date.now() - startedAt > 1e4) clearInterval(waitForLib);
}, 20);
});
});
