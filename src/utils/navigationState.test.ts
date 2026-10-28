import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTabName, resolveActiveTab } from './navigationState';

test('normalizeTabName cleans up leading hashes, queries, and whitespace', () => {
  assert.equal(normalizeTabName('  renewals  '), 'renewals');
  assert.equal(normalizeTabName('#leads'), 'leads');
  assert.equal(normalizeTabName('#/tasks'), 'tasks');
  assert.equal(normalizeTabName('renewals?subtab=timeline'), 'renewals');
  assert.equal(normalizeTabName(null), '');
  assert.equal(normalizeTabName(undefined), '');
});

test('resolveActiveTab prioritizes URL query param if present', () => {
  const result = resolveActiveTab({
    urlTab: 'renewals',
    hashTab: 'tasks',
    storedTab: 'deals',
    isManager: true
  });
  assert.equal(result, 'renewals');
});

test('resolveActiveTab uses hash if URL param is absent', () => {
  const result = resolveActiveTab({
    urlTab: null,
    hashTab: '#/leads',
    storedTab: 'deals',
    isManager: true
  });
  assert.equal(result, 'leads');
});

test('resolveActiveTab uses localStorage storedTab on refresh when no URL params exist', () => {
  const result = resolveActiveTab({
    urlTab: null,
    hashTab: null,
    storedTab: 'suspended_contracts',
    isManager: true
  });
  assert.equal(result, 'suspended_contracts');
});

test('resolveActiveTab enforces allowedTabs for non-manager employee', () => {
  const allowedTabs = ['tasks', 'renewals', 'mail', 'meetings', 'leads'];
  
  // Non-manager allowed tab is kept
  const allowedResult = resolveActiveTab({
    urlTab: 'renewals',
    isManager: false,
    allowedTabs
  });
  assert.equal(allowedResult, 'renewals');

  // Non-manager forbidden tab defaults to 'tasks'
  const forbiddenResult = resolveActiveTab({
    urlTab: 'payroll',
    isManager: false,
    allowedTabs,
    defaultEmployeeTab: 'tasks'
  });
  assert.equal(forbiddenResult, 'tasks');
});
