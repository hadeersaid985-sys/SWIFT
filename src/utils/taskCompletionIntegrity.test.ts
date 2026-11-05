import test from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../types/crm';
import {
  sanitizeTaskIntegrity,
  mergeTaskIntegrity,
  mergeTasksListIntegrity,
  MAX_UNATTENDED_TIMER_MS
} from './taskCompletionIntegrity';

test('Task Completion Integrity - completed tasks are preserved and never downgraded by stale sync', () => {
  const existingCompletedTask: Task = {
    id: 'task-test-1',
    title: 'تصميم بوستات السوشيال ميديا',
    description: 'تنفيذ التصاميم كاملة',
    assignedToId: 'user-aya',
    priority: 'high',
    status: 'completed',
    completedAt: '2026-11-01',
    updatedAt: '2026-11-01T23:30:00.000Z',
    dueDate: '2026-11-01',
    category: 'إداري',
    subtasks: [],
    timeLogs: [],
    createdAt: '2026-10-30'
  };

  const staleIncomingTask: Task = {
    id: 'task-test-1',
    title: 'تصميم بوستات السوشيال ميديا',
    description: 'تنفيذ التصاميم كاملة',
    assignedToId: 'user-aya',
    priority: 'high',
    status: 'in_progress', // Stale client tab sent older in_progress status with running timer!
    isTimerRunning: true,
    timerStartedAt: 1793794520797,
    updatedAt: '2026-11-01T10:00:00.000Z',
    dueDate: '2026-11-01',
    category: 'إداري',
    subtasks: [],
    timeLogs: [],
    createdAt: '2026-10-30'
  };

  const merged = mergeTaskIntegrity(existingCompletedTask, staleIncomingTask);

  assert.equal(merged.status, 'completed', 'Task must remain completed despite stale incoming in_progress sync');
  assert.equal(merged.completedAt, '2026-11-01', 'Task completedAt must be preserved');
  assert.equal(merged.isTimerRunning, false, 'Completed task MUST NOT have isTimerRunning true');
  assert.equal(merged.timerStartedAt, undefined, 'Completed task MUST NOT have timerStartedAt');
});

test('Task Completion Integrity - completed task strips running timer and records time log', () => {
  const taskMarkedDoneWhileTimerRunning: Task = {
    id: 'task-test-roaa',
    title: '3 مقالات الكشفيه',
    description: 'مهمة مضافة عبر بورد وقائمة الفريق',
    assignedToId: 'user-roaa',
    priority: 'medium',
    status: 'completed',
    completedAt: '2026-11-04',
    isTimerRunning: true,
    timerStartedAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
    timerAccumulatedMs: 30 * 60 * 1000,
    dueDate: '2026-11-04',
    category: 'إداري',
    subtasks: [],
    timeLogs: [],
    createdAt: '2026-10-31'
  };

  const sanitized = sanitizeTaskIntegrity(taskMarkedDoneWhileTimerRunning);

  assert.equal(sanitized.status, 'completed');
  assert.equal(sanitized.isTimerRunning, false);
  assert.equal(sanitized.isTimerPaused, false);
  assert.equal(sanitized.timerStartedAt, undefined);
  assert.equal(sanitized.timerAccumulatedMs, 0);
  assert.ok(sanitized.totalLoggedMinutes! >= 90, 'Total logged minutes includes accumulated and active worked time');
  assert.ok(sanitized.timeLogs && sanitized.timeLogs.length > 0, 'Auto time log created for completed session');
});

test('Task Completion Integrity - explicit user revert is permitted when user deliberately unchecks', () => {
  const existingCompletedTask: Task = {
    id: 'task-test-2',
    title: 'مراجعة التقرير المالي',
    description: 'مراجعة التدقيق المالي',
    assignedToId: 'user-amira',
    priority: 'medium',
    status: 'completed',
    completedAt: '2026-11-01',
    updatedAt: '2026-11-01T22:00:00.000Z',
    dueDate: '2026-11-01',
    category: 'إداري',
    subtasks: [],
    timeLogs: [],
    createdAt: '2026-10-30'
  };

  const intentionalUserRevert: Partial<Task> = {
    status: 'todo',
    explicitStatusRevert: true,
    completedAt: undefined,
    updatedAt: '2026-11-02T01:30:00.000Z'
  };

  const merged = mergeTaskIntegrity(existingCompletedTask, intentionalUserRevert);

  assert.equal(merged.status, 'todo', 'Task can be reverted when explicitStatusRevert is true');
  assert.equal(merged.completedAt, undefined, 'completedAt is cleared on explicit revert');
  assert.equal(merged.isTimerRunning, false, 'Reverted task does not magically start running');
});

test('Task Completion Integrity - dangling overnight timer from previous day is auto-capped', () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const taskWithOvernightTimer: Task = {
    id: 'task-test-overnight',
    title: 'مهمة من الأمس بمؤقت معلق',
    description: 'ترك اللابتوب شغال',
    assignedToId: 'user-islam',
    priority: 'urgent',
    status: 'in_progress',
    isTimerRunning: true,
    timerStartedAt: yesterday.getTime(),
    dueDate: yesterday.toISOString().split('T')[0],
    category: 'إداري',
    subtasks: [],
    timeLogs: [],
    createdAt: yesterday.toISOString().split('T')[0]
  };

  const sanitized = sanitizeTaskIntegrity(taskWithOvernightTimer);

  assert.equal(sanitized.isTimerRunning, false, 'Overnight dangling timer must be stopped');
  assert.equal(sanitized.timerStartedAt, undefined);
  assert.ok(sanitized.totalLoggedMinutes! > 0, 'Capped session recorded into totalLoggedMinutes');
  assert.ok(sanitized.timeLogs && sanitized.timeLogs.length > 0, 'Capped time log recorded');
});

test('Task Completion Integrity - mergeTasksListIntegrity protects entire list', () => {
  const current: Task[] = [
    {
      id: 't-1',
      title: 'مهمة 1',
      description: 'وصف المهمة',
      dueDate: '2026-11-04',
      assignedToId: 'user-roaa',
      priority: 'high',
      status: 'completed',
      completedAt: '2026-11-04',
      category: 'إداري',
      subtasks: [],
      timeLogs: [],
      createdAt: '2026-11-04'
    }
  ];

  const incomingFromStaleServer: Task[] = [
    {
      id: 't-1',
      title: 'مهمة 1',
      description: 'وصف المهمة',
      dueDate: '2026-11-04',
      assignedToId: 'user-roaa',
      priority: 'high',
      status: 'in_progress',
      isTimerRunning: true,
      timerStartedAt: 1793794520797,
      category: 'إداري',
      subtasks: [],
      timeLogs: [],
      createdAt: '2026-11-04'
    }
  ];

  const result = mergeTasksListIntegrity(current, incomingFromStaleServer);
  assert.equal(result.length, 1);
  assert.equal(result[0].status, 'completed');
  assert.equal(result[0].isTimerRunning, false);
});
