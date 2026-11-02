import test from 'node:test';
import assert from 'node:assert/strict';
import { formatExternalUrl, isValidUrlOrDomain, detectLinkType } from './urlUtils.tsx';

test('formatExternalUrl prefixes https:// to raw domains', () => {
  assert.equal(formatExternalUrl('power-tech-eg.com'), 'https://power-tech-eg.com');
  assert.equal(formatExternalUrl('www.google.com'), 'https://www.google.com');
  assert.equal(formatExternalUrl('docs.google.com/spreadsheets/d/123'), 'https://docs.google.com/spreadsheets/d/123');
});

test('formatExternalUrl preserves existing http:// and https://', () => {
  assert.equal(formatExternalUrl('https://power-tech-eg.com'), 'https://power-tech-eg.com');
  assert.equal(formatExternalUrl('http://example.com/test'), 'http://example.com/test');
  assert.equal(formatExternalUrl('HTTPS://UPPERCASE.COM'), 'HTTPS://UPPERCASE.COM');
});

test('formatExternalUrl handles empty or falsy values', () => {
  assert.equal(formatExternalUrl(''), '');
  assert.equal(formatExternalUrl(null), '');
  assert.equal(formatExternalUrl(undefined), '');
  assert.equal(formatExternalUrl('   '), '');
});

test('isValidUrlOrDomain identifies valid domains and urls', () => {
  assert.equal(isValidUrlOrDomain('power-tech-eg.com'), true);
  assert.equal(isValidUrlOrDomain('https://power-tech-eg.com'), true);
  assert.equal(isValidUrlOrDomain('docs.google.com/spreadsheets/d/abc'), true);
  assert.equal(isValidUrlOrDomain('not a url'), false);
  assert.equal(isValidUrlOrDomain(''), false);
});

test('detectLinkType categorizes google sheets and websites', () => {
  assert.equal(detectLinkType('https://docs.google.com/spreadsheets/d/123'), 'google_sheet');
  assert.equal(detectLinkType('docs.google.com/spreadsheets/d/123'), 'google_sheet');
  assert.equal(detectLinkType('https://drive.google.com/drive/folders/xyz'), 'google_drive');
  assert.equal(detectLinkType('power-tech-eg.com'), 'website');
});
