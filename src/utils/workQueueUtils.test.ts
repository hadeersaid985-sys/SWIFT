import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDemoWorkItem } from './workQueueUtils.ts';

test('isDemoWorkItem correctly detects template demo tasks', () => {
  assert.equal(isDemoWorkItem('task-102', 'مكالمة متابعة العرض مع بنك الرياض'), true);
  assert.equal(isDemoWorkItem('task-108', 'متابعة موافقة العرض الفني والمالي مع شركة بوابة الأعمال'), true);
  assert.equal(isDemoWorkItem('meet-1', 'الاجتماع الصباحي'), true);
  assert.equal(isDemoWorkItem('call-2', 'مكالمة مؤسسة الحلول الذكية'), true);
  assert.equal(isDemoWorkItem('lead-1', 'طارق عبد الرحمن'), true);
  assert.equal(isDemoWorkItem('deal-1', 'توريد وتطبيق نظام ERP كلاود'), true);
});

test('isDemoWorkItem preserves real company tasks', () => {
  assert.equal(isDemoWorkItem('task-1793483160666', '4 مقالات لسويفت', 'سويفت'), false);
  assert.equal(isDemoWorkItem('task-1793483078730', '5 مقالات تعديل بيوشار', 'بيوشار'), false);
  assert.equal(isDemoWorkItem('task-1793270501668', 'تصميم رحلات south coast', 'south coast'), false);
  assert.equal(isDemoWorkItem('task-1793270306867', 'تقفيل موقع gx', 'gx'), false);
  assert.equal(isDemoWorkItem('meet-1793500000000', 'اجتماع مع عميل جولدن', 'جولدن'), false);
  assert.equal(isDemoWorkItem('call-1793500000000', 'مكالمة مع بيوشار بخصوص الفيديوهات', 'بيوشار'), false);
});
