import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDelayMinutes,
  getDelayRangeCategory,
  qualityRatingToScore,
  isTaskDeliveredOnTime,
  calculateEmployeeKPIs
} from './performanceLogic';
import { Task, DelayRecord, PerformanceEvaluationRecord, RuleViolationRecord } from '../types/crm';

describe('Performance & Delay Logic Tests', () => {
  test('calculateDelayMinutes calculates exact minutes difference correctly', () => {
    // 09:00 vs 09:25 -> 25 mins
    assert.equal(calculateDelayMinutes('09:00', '09:25'), 25);
    // On-time or early arrival -> 0 mins
    assert.equal(calculateDelayMinutes('09:00', '08:55'), 0);
    assert.equal(calculateDelayMinutes('09:00', '09:00'), 0);
    // Across an hour: 09:45 vs 10:15 -> 30 mins
    assert.equal(calculateDelayMinutes('09:45', '10:15'), 30);
    // Empty or malformed inputs
    assert.equal(calculateDelayMinutes('', '09:10'), 0);
  });

  test('getDelayRangeCategory assigns correct bracket', () => {
    assert.equal(getDelayRangeCategory(3), '1-5');
    assert.equal(getDelayRangeCategory(5), '1-5');
    assert.equal(getDelayRangeCategory(6), '6-15');
    assert.equal(getDelayRangeCategory(15), '6-15');
    assert.equal(getDelayRangeCategory(16), '16-30');
    assert.equal(getDelayRangeCategory(30), '16-30');
    assert.equal(getDelayRangeCategory(45), '30+');
  });

  test('qualityRatingToScore maps ratings to numerical scores', () => {
    assert.equal(qualityRatingToScore('excellent'), 5);
    assert.equal(qualityRatingToScore('very_good'), 4);
    assert.equal(qualityRatingToScore('good'), 3);
    assert.equal(qualityRatingToScore('needs_work'), 2);
    assert.equal(qualityRatingToScore('unacceptable'), 1);
  });

  test('isTaskDeliveredOnTime checks deadline vs actual delivery date', () => {
    const onTimeTask: Task = {
      id: 't-1',
      title: 'Design Task',
      description: '',
      assignedToId: 'user-aya',
      priority: 'high',
      status: 'completed',
      dueDate: '2026-10-25',
      actualCompletionDate: '2026-10-24',
      timeLogs: [],
      subtasks: [],
      category: 'تصميم',
      createdAt: '2026-10-20'
    } as any;

    const lateTask: Task = {
      ...onTimeTask,
      actualCompletionDate: '2026-10-27'
    };

    assert.equal(isTaskDeliveredOnTime(onTimeTask), true);
    assert.equal(isTaskDeliveredOnTime(lateTask), false);
  });

  test('calculateEmployeeKPIs aggregates stats and weights properly without unfair penalties', () => {
    const mockTasks: Task[] = [
      {
        id: 't-1',
        title: 'Task 1',
        description: '',
        assignedToId: 'user-amira',
        status: 'completed',
        dueDate: '2026-10-20',
        actualCompletionDate: '2026-10-20',
        qualityRating: 'excellent',
        timeLogs: [],
        subtasks: [],
        category: 'إداري',
        createdAt: '2026-10-01'
      } as any,
      {
        id: 't-2',
        title: 'Task 2',
        description: '',
        assignedToId: 'user-amira',
        status: 'completed',
        dueDate: '2026-10-25',
        actualCompletionDate: '2026-10-24',
        qualityRating: 'very_good',
        timeLogs: [],
        subtasks: [],
        category: 'إداري',
        createdAt: '2026-10-01'
      } as any
    ];

    const mockDelays: DelayRecord[] = [
      {
        id: 'd-1',
        employeeId: 'user-amira',
        employeeName: 'Amira',
        department: 'التطوير والتقنية',
        date: '2026-10-10',
        scheduledStartTime: '09:00',
        actualArrivalTime: '09:15',
        delayMinutes: 15,
        delayRange: '6-15',
        reasonCategory: 'traffic_commute',
        reasonDetails: 'ازدحام مروري',
        reviewStatus: 'excused', // معذور ومقبول
        createdAt: '2026-10-10'
      }
    ];

    const mockEvaluations: PerformanceEvaluationRecord[] = [
      {
        id: 'e-1',
        employeeId: 'user-amira',
        employeeName: 'Amira',
        department: 'التطوير والتقنية',
        date: '2026-10-15',
        type: 'positive',
        category: 'quality',
        description: 'إتقان عالي وتسليم مميز',
        createdById: 'user-1',
        createdByName: 'هدير سعيد',
        status: 'approved',
        createdAt: '2026-10-15'
      },
      {
        id: 'e-2',
        employeeId: 'user-amira',
        employeeName: 'Amira',
        department: 'التطوير والتقنية',
        date: '2026-10-22',
        type: 'extra_work',
        category: 'initiative',
        description: 'مساعدة زميل في حل مشكلة مستعجلة',
        createdById: 'user-1',
        createdByName: 'هدير سعيد',
        status: 'approved',
        createdAt: '2026-10-22'
      }
    ];

    const mockViolations: RuleViolationRecord[] = [];

    const kpis = calculateEmployeeKPIs(
      'user-amira',
      mockTasks,
      mockDelays,
      mockEvaluations,
      mockViolations,
      '2026-10'
    );

    assert.equal(kpis.totalTasks, 2);
    assert.equal(kpis.completedTasks, 2);
    assert.equal(kpis.tasksCompletionRate, 100);
    assert.equal(kpis.onTimeDeliveryRate, 100);
    assert.equal(kpis.delaysCount, 1);
    assert.equal(kpis.totalDelayMinutes, 15);
    assert.equal(kpis.excusedDelaysCount, 1);
    assert.equal(kpis.positiveNotesCount, 1);
    assert.equal(kpis.extraWorkCount, 1);
    assert.ok(kpis.overallScore >= 90, `Score should be >= 90 (actual: ${kpis.overallScore})`);
    assert.equal(kpis.ratingText, 'ممتاز');
  });
});
