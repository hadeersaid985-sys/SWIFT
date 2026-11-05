import { Task, TaskStatus, TimeLogEntry } from '../types/crm';

/**
 * Maximum continuous single timer session allowed without user interaction (e.g. 10 hours).
 * Prevents run-away timers counting up to 14, 24, 48 hours overnight when an employee forgets to stop or closes the tab.
 */
export const MAX_UNATTENDED_TIMER_HOURS = 10;
export const MAX_UNATTENDED_TIMER_MS = MAX_UNATTENDED_TIMER_HOURS * 60 * 60 * 1000;

/**
 * Pure function to sanitize and enforce integrity on any task:
 * 1. ZERO-DANGLING-TIMER RULE: A completed task MUST NEVER have a running or paused timer.
 * 2. OVERNIGHT / MIDNIGHT CAP: Dangling timers started on previous days are capped and finalized.
 * 3. CONSISTENT TIME LOGS: Any finalized timer session is recorded into totalLoggedMinutes and timeLogs.
 */
export function sanitizeTaskIntegrity(task: Task): Task {
  if (!task || !task.id) return task;

  const sanitized: Task = { ...task };
  const isCompleted = sanitized.status === 'completed' || Boolean(sanitized.completedAt);

  // 1. RULE: Completed tasks MUST NEVER have an active or paused timer
  if (isCompleted) {
    // If the task was marked completed but had an active timer that wasn't finalized
    if (sanitized.isTimerRunning || sanitized.isTimerPaused || sanitized.timerStartedAt) {
      const nowMs = Date.now();
      const segmentStart = sanitized.timerLastResumedAt || sanitized.timerStartedAt || nowMs;
      const currentSegmentWorkedMs = sanitized.isTimerRunning ? Math.max(0, nowMs - segmentStart) : 0;
      const totalActiveWorkedMs = (sanitized.timerAccumulatedMs || 0) + currentSegmentWorkedMs;
      const elapsedMinutes = Math.min(
        MAX_UNATTENDED_TIMER_HOURS * 60,
        Math.max(1, Math.round(totalActiveWorkedMs / 60000))
      );

      // If no timeLog entry exists for this session yet, add one
      const todayStr = sanitized.completedAt || new Date().toISOString().split('T')[0];
      const hasRecentLog = (sanitized.timeLogs || []).some(log => log.createdAt === todayStr || log.endDate === todayStr);
      if (!hasRecentLog && elapsedMinutes > 0) {
        const autoLog: TimeLogEntry = {
          id: 'log-auto-' + Date.now(),
          memberId: sanitized.assignedToId || 'system',
          memberName: 'المكلف بالمهمة',
          startDate: todayStr,
          startTime: '09:00',
          endDate: todayStr,
          endTime: '17:00',
          durationMinutes: elapsedMinutes,
          note: 'إنجاز المهمة وتسجيل وقت العمل الفعلي الصافي',
          createdAt: todayStr
        };
        sanitized.timeLogs = [autoLog, ...(sanitized.timeLogs || [])];
        sanitized.totalLoggedMinutes = (sanitized.totalLoggedMinutes || 0) + elapsedMinutes;
      }
    }

    sanitized.status = 'completed';
    sanitized.completedAt = sanitized.completedAt || new Date().toISOString().split('T')[0];
    sanitized.isTimerRunning = false;
    sanitized.isTimerPaused = false;
    delete sanitized.timerStartedAt;
    delete sanitized.timerLastResumedAt;
    sanitized.timerAccumulatedMs = 0;
    sanitized.explicitStatusRevert = false;
    return sanitized;
  }

  // 2. RULE: Running or paused timers on ACTIVE tasks:
  // Check for runaway / dangling overnight timers (> 10 hours or from a previous calendar day without interaction)
  if (sanitized.isTimerRunning && sanitized.timerStartedAt) {
    const nowMs = Date.now();
    const sessionDurationMs = nowMs - sanitized.timerStartedAt;

    // Check if the timer started before today's 00:00:00 local time OR exceeded maximum unattended hours
    const timerDate = new Date(sanitized.timerStartedAt).toISOString().split('T')[0];
    const todayDate = new Date(nowMs).toISOString().split('T')[0];
    const isFromPreviousDay = timerDate < todayDate;

    if (isFromPreviousDay || sessionDurationMs > MAX_UNATTENDED_TIMER_MS) {
      // Auto-cap the session to a reasonable work shift (e.g. 6 hours or estimatedHours)
      const cappedMinutes = Math.round(Math.min(sessionDurationMs, MAX_UNATTENDED_TIMER_MS) / 60000);
      const cappedLog: TimeLogEntry = {
        id: 'log-cap-' + Date.now(),
        memberId: sanitized.assignedToId || 'system',
        memberName: 'المكلف بالمهمة',
        startDate: timerDate,
        startTime: '10:00',
        endDate: timerDate,
        endTime: '18:00',
        durationMinutes: cappedMinutes,
        note: 'جلسة عمل مسجلة حتى نهاية اليوم (تم إيقاف المؤقت تلقائياً عند منتصف الليل)',
        createdAt: timerDate
      };

      sanitized.timeLogs = [cappedLog, ...(sanitized.timeLogs || [])];
      sanitized.totalLoggedMinutes = (sanitized.totalLoggedMinutes || 0) + cappedMinutes;
      sanitized.isTimerRunning = false;
      sanitized.isTimerPaused = false;
      delete sanitized.timerStartedAt;
      delete sanitized.timerLastResumedAt;
      sanitized.timerAccumulatedMs = 0;
    }
  }

  return sanitized;
}

/**
 * Pure function to merge an incoming task update with an existing task cleanly,
 * preserving completion integrity and preventing accidental reverts or timer resurrection.
 */
export function mergeTaskIntegrity(existing: Task, incoming: Partial<Task>): Task {
  if (!existing && incoming) return sanitizeTaskIntegrity(incoming as Task);
  if (existing && !incoming) return sanitizeTaskIntegrity(existing);

  const isExistingCompleted = existing.status === 'completed' || Boolean(existing.completedAt);
  const isIncomingCompleted = incoming.status === 'completed' || Boolean(incoming.completedAt);
  const isExplicitRevert = Boolean(incoming.explicitStatusRevert);

  // Deep clone to avoid mutating input references
  const merged: Task = { ...existing, ...incoming };

  // 1. If incoming or existing is completed, and NOT explicitly reverted:
  if ((isIncomingCompleted || isExistingCompleted) && !isExplicitRevert) {
    merged.status = 'completed';
    merged.completedAt = incoming.completedAt || existing.completedAt || new Date().toISOString().split('T')[0];
    merged.explicitStatusRevert = false;

    // Strict invariant: Completed task has NO running timer
    merged.isTimerRunning = false;
    merged.isTimerPaused = false;
    delete merged.timerStartedAt;
    delete merged.timerLastResumedAt;
    merged.timerAccumulatedMs = 0;

    // Preserve time logs union if incoming had new logs
    if (Array.isArray(incoming.timeLogs) && Array.isArray(existing.timeLogs)) {
      const logMap = new Map<string, TimeLogEntry>();
      existing.timeLogs.forEach(l => logMap.set(l.id, l));
      incoming.timeLogs.forEach(l => logMap.set(l.id, l));
      merged.timeLogs = Array.from(logMap.values());
    }

    return sanitizeTaskIntegrity(merged);
  }

  // 2. If user explicitly clicked to un-check / revert completion
  if (isExplicitRevert) {
    merged.status = (incoming.status && incoming.status !== 'completed' ? incoming.status : 'todo') as TaskStatus;
    delete merged.completedAt;
    merged.explicitStatusRevert = true;
    merged.isTimerRunning = false;
    merged.isTimerPaused = false;
    delete merged.timerStartedAt;
    delete merged.timerLastResumedAt;
    merged.timerAccumulatedMs = 0;
    return sanitizeTaskIntegrity(merged);
  }

  // 3. Normal active task merge
  return sanitizeTaskIntegrity(merged);
}

/**
 * Merges a list of tasks with a remote / server list, guaranteeing:
 * - Completed tasks are NEVER downgraded by stale server or local items.
 * - Completed tasks NEVER carry a ghost timer.
 * - Deleted tasks are excluded.
 */
export function mergeTasksListIntegrity(
  currentTasks: Task[],
  incomingTasks: Task[],
  deletedTaskIds: Set<string> = new Set()
): Task[] {
  const taskMap = new Map<string, Task>();

  // Seed with current tasks (sanitized)
  (currentTasks || []).forEach(t => {
    if (t && t.id && !deletedTaskIds.has(t.id)) {
      taskMap.set(t.id, sanitizeTaskIntegrity(t));
    }
  });

  // Merge incoming tasks
  (incomingTasks || []).forEach(t => {
    if (!t || !t.id || deletedTaskIds.has(t.id)) return;

    const existing = taskMap.get(t.id);
    if (!existing) {
      taskMap.set(t.id, sanitizeTaskIntegrity(t));
    } else {
      taskMap.set(t.id, mergeTaskIntegrity(existing, t));
    }
  });

  return Array.from(taskMap.values());
}
