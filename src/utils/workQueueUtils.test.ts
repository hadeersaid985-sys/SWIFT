import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDemoWorkItem, extractClientFromTask, buildWaitingClientsFromTasks } from './workQueueUtils.ts';
import { Task, TeamMember } from '../types/crm.ts';

test('isDemoWorkItem correctly detects template demo tasks, leads and deals', () => {
  assert.equal(isDemoWorkItem('task-102', 'مكالمة متابعة العرض مع بنك الرياض'), true);
  assert.equal(isDemoWorkItem('task-108', 'متابعة موافقة العرض الفني والمالي مع شركة بوابة الأعمال'), true);
  assert.equal(isDemoWorkItem('meet-1', 'الاجتماع الصباحي'), true);
  assert.equal(isDemoWorkItem('call-2', 'مكالمة مؤسسة الحلول الذكية'), true);
  assert.equal(isDemoWorkItem('lead-1', 'طارق عبد الرحمن'), true);
  assert.equal(isDemoWorkItem('lead-301', 'سلطان بن عبدالعزيز', 'مجموعة المدى للاستثمار والتطوير'), true);
  assert.equal(isDemoWorkItem('lead-302', 'د. نورة الشامسي', 'مستشفيات رعاية النخبة'), true);
  assert.equal(isDemoWorkItem('deal-1', 'توريد وتطبيق نظام ERP كلاود'), true);
  assert.equal(isDemoWorkItem('deal-201', 'توريد وتطبيق نظام سحابي لمجموعة إعمار المستقبل'), true);
});

test('isDemoWorkItem preserves real company tasks', () => {
  assert.equal(isDemoWorkItem('task-1793483160666', '4 مقالات لسويفت', 'سويفت'), false);
  assert.equal(isDemoWorkItem('task-1793483078730', '5 مقالات تعديل بيوشار', 'بيوشار'), false);
  assert.equal(isDemoWorkItem('task-1793270501668', 'تصميم رحلات south coast', 'south coast'), false);
  assert.equal(isDemoWorkItem('task-1793270306867', 'تقفيل موقع gx', 'gx'), false);
  assert.equal(isDemoWorkItem('meet-1793500000000', 'اجتماع مع عميل جولدن', 'جولدن'), false);
  assert.equal(isDemoWorkItem('call-1793500000000', 'مكالمة مع بيوشار بخصوص الفيديوهات', 'بيوشار'), false);
});

test('extractClientFromTask extracts known company clients from real task titles', () => {
  assert.equal(extractClientFromTask({ title: 'رفع مقالات gx' }), 'موقع GX');
  assert.equal(extractClientFromTask({ title: 'تصميمات جولدن كفرات' }), 'جولدن (Golden)');
  assert.equal(extractClientFromTask({ title: 'ميتنج الساعه 8 مع باورتك' }), 'شركة باورتك');
  assert.equal(extractClientFromTask({ title: 'شيت العميل الكشفيه سايت اوديت' }), 'موقع الكشفية');
  assert.equal(extractClientFromTask({ title: 'كوتيشن للصيدليه بلان تسويق كامله' }), 'عميل الصيدلية');
  assert.equal(extractClientFromTask({ title: 'تعديلات موقع بيوشار' }), 'موقع بيوشار');
  assert.equal(extractClientFromTask({ title: 'رفع مقالات CAFM' }), 'موقع CAFM');
  assert.equal(extractClientFromTask({ title: 'ساوث كوست' }), 'ساوث كوست');
  assert.equal(extractClientFromTask({ title: 'تعديل صفحات الخدمات في موقع سويفت عربي وانجليزي' }), 'سويفت (Swift)');
});

test('buildWaitingClientsFromTasks groups real tasks into waiting clients and ignores demo items', () => {
  const dummyTeam: TeamMember[] = [
    { id: 'user-eman', name: 'إيمان', role: 'كاتبة محتوى', username: 'eman', employeeCode: 'SM-101', accessLevel: 'employee', avatar: '' } as any,
    { id: 'user-roaa', name: 'رؤى', role: 'كاتبة محتوى', username: 'roaa', employeeCode: 'SM-102', accessLevel: 'employee', avatar: '' } as any
  ];

  const tasks: Task[] = [
    // Demo task to be excluded
    { id: 'task-102', title: 'مكالمة متابعة بنك الرياض', status: 'todo', priority: 'high', assignedToId: 'user-1', dueDate: '2026-11-01', createdAt: '2026-10-31' } as any,
    // Real tasks
    { id: 'task-1793014838807', title: 'مقالات gx', status: 'todo', priority: 'high', assignedToId: 'user-roaa', dueDate: '2026-11-02', createdAt: '2026-10-31' } as any,
    { id: 'task-1793014816815', title: 'باك لينك gx', status: 'completed', priority: 'medium', assignedToId: 'user-eman', dueDate: '2026-10-30', createdAt: '2026-10-29' } as any
  ];

  const waitingClients = buildWaitingClientsFromTasks(tasks, dummyTeam);
  assert.equal(waitingClients.length, 1);
  assert.equal(waitingClients[0].clientName, 'موقع GX');
  assert.equal(waitingClients[0].totalTasks, 2);
  assert.equal(waitingClients[0].pendingTasksCount, 1);
  assert.equal(waitingClients[0].completedTasksCount, 1);
  assert.equal(waitingClients[0].progressPercent, 50);
});
