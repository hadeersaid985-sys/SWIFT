import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAccountTaskProgress,
  getDeliveryCountdown,
  filterAccountTasks,
  getAccountManagerMetrics
} from './accountTasks';
import { AccountMonthlyTask, ClientRenewal } from '../types/crm';

test('calculateAccountTaskProgress computes rates correctly', () => {
  const tasks: AccountMonthlyTask[] = [
    {
      id: 't-1',
      title: 'خطة محتوى شهر أكتوبر',
      month: '2026-10',
      category: 'محتوى وبوستات',
      completed: true,
      dueDate: '2026-10-15',
      createdAt: '2026-10-01'
    },
    {
      id: 't-2',
      title: 'تصميم 12 بوست سوشيال ميديا',
      month: '2026-10',
      category: 'تصميم جرافيك',
      completed: true,
      dueDate: '2026-10-25',
      createdAt: '2026-10-01'
    },
    {
      id: 't-3',
      title: 'مونتاج 4 ريلز انستقرام وتيك توك',
      month: '2026-10',
      category: 'ريلز ومونتاج',
      completed: false,
      dueDate: '2026-10-30',
      createdAt: '2026-10-01'
    },
    {
      id: 't-4',
      title: 'تقرير نتائج السيو وتحسين الترتيب',
      month: '2026-10',
      category: 'سيو ومقالات',
      completed: false,
      dueDate: '2026-10-31',
      createdAt: '2026-10-01'
    }
  ];

  const result = calculateAccountTaskProgress(tasks);
  assert.equal(result.total, 4);
  assert.equal(result.completed, 2);
  assert.equal(result.remaining, 2);
  assert.equal(result.progressPercent, 50);
  assert.equal(result.isAllCompleted, false);

  // All completed case
  const allDoneTasks = tasks.map(t => ({ ...t, completed: true }));
  const doneResult = calculateAccountTaskProgress(allDoneTasks);
  assert.equal(doneResult.completed, 4);
  assert.equal(doneResult.remaining, 0);
  assert.equal(doneResult.progressPercent, 100);
  assert.equal(doneResult.isAllCompleted, true);

  // Empty list
  const emptyResult = calculateAccountTaskProgress([]);
  assert.equal(emptyResult.total, 0);
  assert.equal(emptyResult.progressPercent, 0);
});

test('getDeliveryCountdown calculates remaining days and overdue states accurately', () => {
  const refDate = '2026-10-29';

  // Overdue
  const overdue = getDeliveryCountdown('2026-10-27', refDate);
  assert.equal(overdue.status, 'overdue');
  assert.equal(overdue.daysRemaining, -2);
  assert.match(overdue.label, /متأخر بمقدار 2 يوم/);

  // Due today
  const today = getDeliveryCountdown('2026-10-29', refDate);
  assert.equal(today.status, 'due_today');
  assert.equal(today.daysRemaining, 0);

  // Due tomorrow
  const tomorrow = getDeliveryCountdown('2026-10-30', refDate);
  assert.equal(tomorrow.status, 'due_tomorrow');
  assert.equal(tomorrow.daysRemaining, 1);

  // Due soon (within 4 days)
  const dueSoon = getDeliveryCountdown('2026-11-01', refDate);
  assert.equal(dueSoon.status, 'due_soon');
  assert.equal(dueSoon.daysRemaining, 3);

  // Normal
  const normal = getDeliveryCountdown('2026-11-15', refDate);
  assert.equal(normal.status, 'normal');
  assert.equal(normal.daysRemaining, 17);
});

test('filterAccountTasks filters by completion and month', () => {
  const tasks: AccountMonthlyTask[] = [
    {
      id: 't-1',
      title: 'مهمة منجزة أكتوبر',
      month: '2026-10',
      category: 'محتوى وبوستات',
      completed: true,
      dueDate: '2026-10-20',
      createdAt: '2026-10-01'
    },
    {
      id: 't-2',
      title: 'مهمة متبقية أكتوبر',
      month: '2026-10',
      category: 'تصميم جرافيك',
      completed: false,
      dueDate: '2026-10-30',
      createdAt: '2026-10-01'
    },
    {
      id: 't-3',
      title: 'مهمة نوفمبر',
      month: '2026-11',
      category: 'إعلانات ممولة',
      completed: false,
      dueDate: '2026-11-10',
      createdAt: '2026-10-28'
    }
  ];

  const completedOct = filterAccountTasks(tasks, 'completed', '2026-10');
  assert.equal(completedOct.length, 1);
  assert.equal(completedOct[0].id, 't-1');

  const pendingOct = filterAccountTasks(tasks, 'pending', '2026-10');
  assert.equal(pendingOct.length, 1);
  assert.equal(pendingOct[0].id, 't-2');

  const allNov = filterAccountTasks(tasks, 'all', '2026-11');
  assert.equal(allNov.length, 1);
  assert.equal(allNov[0].id, 't-3');
});

test('getAccountManagerMetrics aggregates accounts and warns about urgent deadlines', () => {
  const mockClients: ClientRenewal[] = [
    {
      id: 'c-1',
      clientName: 'أحمد',
      company: 'ساوث كوست',
      serviceName: 'سوشيال ميديا وسيو',
      planCycle: 'شهري',
      amount: 15000,
      currency: 'ج.م',
      renewalDate: '2026-10-30', // tomorrow
      status: 'active',
      createdAt: '2026-09-01',
      phone: '0100',
      whatsappNumber: '0100',
      accountManagerId: 'user-amira',
      accountManagerName: 'Amira',
      managedBy: 'Amira',
      monthlyTasks: [
        {
          id: 'mt-1',
          title: 'كتابة البوستات',
          month: '2026-10',
          category: 'محتوى وبوستات',
          completed: true,
          dueDate: '2026-10-25',
          createdAt: '2026-10-01'
        },
        {
          id: 'mt-2',
          title: 'نشر الريلز',
          month: '2026-10',
          category: 'ريلز ومونتاج',
          completed: false,
          dueDate: '2026-10-30',
          createdAt: '2026-10-01'
        }
      ]
    },
    {
      id: 'c-2',
      clientName: 'سارة',
      company: 'جولدن كير',
      serviceName: 'باقة سيو',
      planCycle: 'شهري',
      amount: 10000,
      currency: 'ج.م',
      renewalDate: '2026-11-20',
      status: 'active',
      createdAt: '2026-09-01',
      phone: '0101',
      whatsappNumber: '0101',
      accountManagerId: 'user-amira',
      accountManagerName: 'Amira',
      managedBy: 'Amira',
      monthlyTasks: [
        {
          id: 'mt-3',
          title: 'تقرير السيو',
          month: '2026-10',
          category: 'سيو ومقالات',
          completed: true,
          dueDate: '2026-10-28',
          createdAt: '2026-10-01'
        }
      ]
    },
    {
      id: 'c-3',
      clientName: 'خالد',
      company: 'شركة موقوفة',
      serviceName: 'سيرفر',
      planCycle: 'شهري',
      amount: 5000,
      currency: 'ج.م',
      renewalDate: '2026-10-30',
      status: 'suspended', // should be excluded
      createdAt: '2026-09-01',
      phone: '0102',
      whatsappNumber: '0102',
      accountManagerId: 'user-amira'
    }
  ];

  const metrics = getAccountManagerMetrics(mockClients, 'Amira');
  assert.equal(metrics.managedAccountsCount, 2); // c-3 excluded because suspended
  assert.equal(metrics.totalTasks, 3);
  assert.equal(metrics.completedTasks, 2);
  assert.equal(metrics.remainingTasks, 1);
  assert.equal(metrics.overallProgressPercent, 67);
  assert.equal(metrics.urgentAccountsCount, 1); // c-1 has pending task and renewal is tomorrow!
});
