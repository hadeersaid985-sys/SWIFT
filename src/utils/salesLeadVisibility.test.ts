import test from 'node:test';
import assert from 'node:assert/strict';
import { isLeadVisibleToUser, filterVisibleLeadsForUser, mergeLeadsListIntegrity } from './salesLeadVisibility';
import { Lead } from '../types/crm';

const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'عميل للأدمن فقط',
    company: 'أدمن كو',
    title: 'مسؤول المشتريات',
    leadType: 'admin',
    assignedToId: 'user-1',
    assignedTeamMemberIds: ['user-1'],
    phone: '01000000001',
    email: 'admin@test.com',
    status: 'جديد',
    source: 'موقع',
    leadScore: 80,
    estimatedValue: 100000,
    currency: 'ج.م',
    createdAt: '2026-11-01'
  },
  {
    id: 'lead-2',
    name: 'سلطان بن عبدالعزيز',
    company: 'المقاولات',
    title: 'الرئيس التنفيذي',
    leadType: 'sales',
    assignedToId: 'user-maibel',
    assignedTeamMemberIds: ['user-maibel'],
    phone: '+966567789911',
    email: 'sultan@test.com',
    status: 'تم التواصل',
    source: 'واتساب',
    leadScore: 90,
    estimatedValue: 240000,
    currency: 'ج.م',
    createdAt: '2026-11-01'
  },
  {
    id: 'lead-3',
    name: 'عميل بمنشن لمايبل في الوصف',
    company: 'عقارات مصر',
    title: 'مدير العمليات',
    leadType: 'sales',
    assignedToId: 'user-1',
    detailedDescription: 'تنبيه: برجاء المتابعة الفورية مع مسؤولة المبيعات مايبل Maibel لترتيب موعد المعاينة',
    phone: '01027552633',
    email: 'prop@test.com',
    status: 'جديد',
    source: 'إحالة',
    leadScore: 85,
    estimatedValue: 180000,
    currency: 'ج.م',
    createdAt: '2026-11-02'
  },
  {
    id: 'lead-4',
    name: 'عميل مخصص ومصرح لهدير ومايبل',
    company: 'سلاسل إمداد',
    title: 'مسؤول التعاقدات',
    leadType: 'sales',
    assignedToId: 'user-maibel',
    assignedTeamMemberIds: ['user-1', 'user-maibel'],
    mentionedUserIds: ['user-maibel'],
    phone: '01099999999',
    email: 'supply@test.com',
    status: 'مهتم',
    source: 'مباشر',
    leadScore: 95,
    estimatedValue: 5000,
    currency: 'ج.م',
    createdAt: '2026-11-03'
  }
];

test('Admin sees all leads regardless of assignment or mentions', () => {
  const admin = { id: 'user-1', name: 'هدير سعيد', role: 'المدير التنفيذي', isSales: false };
  const visible = filterVisibleLeadsForUser(mockLeads, admin, true);
  assert.equal(visible.length, 4);
});

test('Sales user (Maibel) sees leads assigned to her, mentioned in text, or authorized to her', () => {
  const maibel = { id: 'user-maibel', name: 'Maibel Emad', role: 'مسؤولة المبيعات', isSales: true };
  const visible = filterVisibleLeadsForUser(mockLeads, maibel, false);
  
  // Lead 1 is admin only -> hidden
  // Lead 2 is assigned to user-maibel -> visible
  // Lead 3 has text mention "مايبل Maibel" in detailedDescription -> visible
  // Lead 4 has user-maibel in assignedTeamMemberIds -> visible
  assert.equal(visible.length, 3);
  assert.deepEqual(visible.map(l => l.id), ['lead-2', 'lead-3', 'lead-4']);
  assert.ok(!visible.some(l => l.id === 'lead-1'));
});

test('Non-sales employee (developer/accountant) sees 0 leads', () => {
  const dev = { id: 'user-dev', name: 'أحمد المطور', role: 'مطور واجهات', isSales: false, department: 'التطوير والتقنية' };
  const visible = filterVisibleLeadsForUser(mockLeads, dev, false);
  assert.equal(visible.length, 0);
});

test('Deleted leads are never resurrected when merging lists across devices', () => {
  const currentLeads: Lead[] = [mockLeads[0], mockLeads[1]];
  const incomingLeads: Lead[] = [mockLeads[0], mockLeads[1], mockLeads[2]];
  
  // Suppose mockLeads[1] was deleted:
  const deletedSet = new Set(['lead-2']);
  const merged = mergeLeadsListIntegrity(currentLeads, incomingLeads, deletedSet);
  
  // lead-2 must be strictly removed and not resurrected
  assert.ok(!merged.some(l => l.id === 'lead-2'));
  assert.equal(merged.length, 2);
  assert.deepEqual(merged.map(l => l.id), ['lead-1', 'lead-3']);
});
