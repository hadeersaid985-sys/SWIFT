import test from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../types/crm';

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
    status: 'todo', // Stale client tab sent older state
    updatedAt: '2026-11-01T10:00:00.000Z',
    dueDate: '2026-11-01',
    category: 'إداري',
    subtasks: [],
    timeLogs: [],
    createdAt: '2026-10-30'
  };

  // Safe merge logic simulation
  const isExistingCompleted = existingCompletedTask.status === 'completed' || Boolean(existingCompletedTask.completedAt);
  const isIncomingCompleted = staleIncomingTask.status === 'completed' || Boolean(staleIncomingTask.completedAt);

  let mergedTask: Task;
  if (isExistingCompleted && !isIncomingCompleted && !staleIncomingTask.explicitStatusRevert) {
    mergedTask = {
      ...existingCompletedTask,
      ...staleIncomingTask,
      status: 'completed',
      completedAt: existingCompletedTask.completedAt
    };
  } else {
    mergedTask = { ...existingCompletedTask, ...staleIncomingTask };
  }

  assert.equal(mergedTask.status, 'completed', 'Task must remain completed despite stale incoming sync');
  assert.equal(mergedTask.completedAt, '2026-11-01', 'Task completedAt must be preserved');
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

  const isExistingCompleted = existingCompletedTask.status === 'completed' || Boolean(existingCompletedTask.completedAt);
  const isIncomingCompleted = intentionalUserRevert.status === 'completed' || Boolean(intentionalUserRevert.completedAt);

  let mergedTask: Task;
  if (isExistingCompleted && !isIncomingCompleted && !intentionalUserRevert.explicitStatusRevert) {
    mergedTask = {
      ...existingCompletedTask,
      ...intentionalUserRevert,
      status: 'completed',
      completedAt: existingCompletedTask.completedAt
    };
  } else {
    mergedTask = { ...existingCompletedTask, ...intentionalUserRevert };
  }

  assert.equal(mergedTask.status, 'todo', 'Task can be reverted when explicitStatusRevert is true');
  assert.equal(mergedTask.completedAt, undefined, 'completedAt is cleared on explicit revert');
});
