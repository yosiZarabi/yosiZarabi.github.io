import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { detectLocale, isLocale } from '../src/locale.ts';
import { composeEmail, mailtoLink, validPhone } from '../src/enquiry.ts';
import { clamp, projectPoint, ribbonPoint, sectionProgress } from '../src/motionMath.ts';

test('Israeli time zones choose Hebrew without a location service', () => {
  for (const zone of ['Asia/Jerusalem', 'Asia/Tel_Aviv', 'Israel']) {
    assert.equal(detectLocale(null, zone, ['en-US']), 'he');
  }
});

test('other time zones choose English even with a Hebrew browser', () => {
  for (const zone of ['Europe/London', 'America/New_York', 'Asia/Tokyo']) {
    assert.equal(detectLocale(null, zone, ['he-IL']), 'en');
  }
});

test('explicit saved choice takes priority over location hints', () => {
  assert.equal(detectLocale('en', 'Asia/Jerusalem', ['he-IL']), 'en');
  assert.equal(detectLocale('he', 'America/New_York', ['en-US']), 'he');
  assert.equal(detectLocale('invalid', 'Asia/Jerusalem', ['en-US']), 'he');
});

test('UTC / absent time zone uses primary language; no hints defaults Hebrew', () => {
  assert.equal(detectLocale(null, 'UTC', ['he-IL']), 'he');
  assert.equal(detectLocale(null, undefined, ['en-IL']), 'he');
  assert.equal(detectLocale(null, 'Etc/UTC', ['en-GB', 'he-IL']), 'en');
  assert.equal(detectLocale(null, undefined, []), 'he');
  assert.equal(isLocale('he'), true);
  assert.equal(isLocale('ar'), false);
});

test('phone validation accepts real phone formats and rejects junk', () => {
  for (const phone of ['054-3030283', '+972 54 303 0283', '(212) 555-0123', '1234567']) {
    assert.equal(validPhone(phone), true, phone);
  }
  for (const phone of ['', '    ', '+()--...', 'abc0543030283', '1234', '1234567890123456']) {
    assert.equal(validPhone(phone), false, phone);
  }
});

test('draft preserves Hebrew and safely encodes query-string characters', () => {
  const body = composeEmail({
    name: ' ישראל ישראלי ', phone: '0543030283', email: 'test@example.test',
    company: 'A & B', subject: 'נדל״ן', message: 'Hello?\nתודה & שלום #1',
  }, { name: 'שם', phone: 'טלפון', email: 'דוא״ל', company: 'חברה', subject: 'תחום', message: 'פנייה' });
  assert.match(body, /^שם: ישראל ישראלי\n\n/);
  const link = mailtoLink('yosi@zarabi-law.com', 'פנייה & #', body);
  const parsed = new URL(link);
  assert.equal(parsed.protocol, 'mailto:');
  assert.equal(parsed.searchParams.get('subject'), 'פנייה & #');
  assert.equal(parsed.searchParams.get('body'), body);
  assert.equal([...parsed.searchParams.keys()].length, 2);
});

test('both languages include complete approved practice lists and no editorial placeholders', () => {
  const brief = JSON.parse(readFileSync(new URL('../src/brief.json', import.meta.url), 'utf8'));
  for (const language of ['he', 'en']) {
    const copy = brief[language];
    assert.equal(copy.practices.length, 7);
    assert.deepEqual(copy.practices.map((practice: { services: string[] }) => practice.services.length), [7, 6, 6, 6, 4, 4, 4]);
    assert.equal(copy.approach.length, 4);
    assert.equal(copy.founder.length, 3);
    assert.equal(copy.about.length, 3);
    assert.ok(!JSON.stringify(copy).includes('[Button:'));
    assert.ok(!JSON.stringify(copy).includes('[כפתור:'));
    assert.ok(!JSON.stringify(copy.about).includes('2022'));
  }
});

test('scroll progress is clamped and handles sections shorter than the viewport', () => {
  assert.equal(sectionProgress(100, 2000, 1000), 0);
  assert.equal(sectionProgress(-500, 2000, 1000), 0.5);
  assert.equal(sectionProgress(-1500, 2000, 1000), 1);
  assert.equal(sectionProgress(0, 500, 1000), 0);
  assert.equal(sectionProgress(-100, 500, 1000), 1);
  assert.equal(clamp(5, -1, 1), 1);
  assert.equal(clamp(-5, -1, 1), -1);
});

test('ribbon geometry is continuous and projects to finite coordinates', () => {
  const start = ribbonPoint(0, 0.3);
  const end = ribbonPoint(Math.PI * 4, 0.3);
  assert.ok(Math.abs(start.x - end.x) < 1e-10);
  assert.ok(Math.abs(start.y - end.y) < 1e-10);
  for (let step = 0; step <= 100; step++) {
    const projected = projectPoint(ribbonPoint(step / 100 * Math.PI * 4, 0.46), step / 100, 0.2, 300);
    assert.ok(Object.values(projected).every(Number.isFinite));
  }
});

test('official brand vectors and font license are included locally', () => {
  const brand = JSON.parse(readFileSync(new URL('../src/brand-mark.json', import.meta.url), 'utf8'));
  assert.equal(brand.viewBox, '188 244 129 122');
  assert.match(brand.path, /^M295.08/);
  for (const variant of ['dark', 'light', 'blue']) {
    const svg = readFileSync(new URL(`../public/brand/zarabi-${variant}.svg`, import.meta.url), 'utf8');
    assert.ok(svg.includes('viewBox="188 244 424 122"'));
    assert.ok(!/<(?:script|image|foreignObject)\b|(?:href|onload)\s*=/i.test(svg));
  }
  assert.match(readFileSync(new URL('../public/fonts/poppins/OFL.txt', import.meta.url), 'utf8'), /SIL OPEN FONT LICENSE/i);
});
