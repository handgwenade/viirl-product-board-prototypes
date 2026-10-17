import assert from 'node:assert/strict';
import test from 'node:test';
import { items, workstreams } from '../data.mjs';
import { dayNumber, dueState, dateLabel, dayIndex, hours, chunks, step, intervalSeconds, boardPages, timelinePages, spotlightPages } from '../logic.mjs';

test('calendar dates are UTC, missing and invalid values stay unset', () => {
  assert.equal(dayNumber('2026-02-30'), null);
  assert.equal(dayNumber(null), null);
  assert.equal(dateLabel(null), 'Not set');
  assert.equal(dateLabel('2026-10-14'), 'Oct 14');
  assert.equal(dayIndex('2026-10-12'), 0);
  assert.equal(dayIndex('2026-10-18'), 6);
  assert.equal(dayIndex(null), -1);
  assert.equal(dueState({ due: '2026-10-13', status: 'Blocked' }), 'Overdue');
  assert.equal(dueState({ due: '2026-10-14', status: 'In progress' }), 'Due today');
  assert.equal(dueState({ due: '2026-10-16', status: 'Upcoming' }), 'Due soon');
  assert.equal(dueState({ due: '2026-10-17', status: 'Upcoming' }), 'Scheduled');
  assert.equal(dueState({ due: '2026-10-12', status: 'Done' }), 'Delivered');
  assert.equal(hours({ spent: 12, estimate: 20 }), '12h spent / 20h estimated');
  assert.equal(hours({ spent: 0, estimate: null }), '0h spent / Not set estimated');
});
test('pagination preserves every record, including excess work', () => {
  const many = [...items, ...Array.from({ length: 12 }, (_, i) => ({ ...items[0], id: `extra-${i}` }))];
  assert.equal(boardPages(many).length, 15);
  assert.deepEqual(new Set(boardPages(many).flat().filter(Boolean).map(item => item.id)), new Set(many.map(item => item.id)));
  assert.deepEqual(chunks(many, 2).flat(), many);
  assert.equal(spotlightPages(many, workstreams).flatMap(page => page.group).length, many.length);
  assert.ok(spotlightPages(many, workstreams).every(page => page.group.length <= 3));
  assert.deepEqual(chunks([], 2), []);
  assert.throws(() => chunks(items, 0));
  const long = { ...items[0], title: 'Review lead assignment rules before the next demo release' };
  assert.deepEqual(timelinePages([items[0], long, items[1]]), [[items[0]], [long], [items[1]]]);
  assert.ok(spotlightPages([long, ...items], workstreams).filter(page => page.stream === long.stream).every(page => page.group.length <= 2));
});
test('rotation wraps both ways and constrains intervals', () => {
  assert.equal(step(2, 3), 0);
  assert.equal(step(0, 3, -1), 2);
  assert.equal(step(0, 0), 0);
  assert.equal(intervalSeconds(null), 20);
  assert.equal(intervalSeconds('invalid'), 20);
  assert.equal(intervalSeconds(-3), 5);
  assert.equal(intervalSeconds(500), 120);
});
