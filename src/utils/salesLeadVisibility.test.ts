import test from 'node:test';
import assert from 'node:assert/strict';

interface Lead {
  id: string;
  name: string;
  company: string;
  assignedToId?: string;
  assignedTeamMemberIds?: string[];
  mentionedUserIds?: string[];
  createdBy?: string;
  leadType?: 'admin' | 'sales';
  isSalesLead?: boolean;
}

interface User {
  id: string;
  name: string;
  role: string;
  isSales?: boolean;
  department?: string;
}

function filterVisibleLeadsForUser(leads: Lead[], user: User, isManager: boolean): Lead[] {
  if (isManager) return leads;
  
  const isSalesUser = Boolean(
    user.isSales === true ||
    user.department === 'المبيعات' ||
    user.role?.toLowerCase().includes('sales') ||
    user.role?.toLowerCase().includes('سيلز') ||
    user.id === 'user-maibel' ||
    user.name?.toLowerCase().includes('maibel') ||
    user.name?.includes('مايبل')
  );

  if (!isSalesUser) return [];

  const currentUserId = user.id;
  const isMaibel = currentUserId === 'user-maibel' || user.name.toLowerCase().includes('maibel') || user.name.includes('مايبل');

  return leads.filter(lead => {
    // 1. Direct assignment
    if (lead.assignedToId === currentUserId) return true;
    if (lead.assignedTeamMemberIds?.includes(currentUserId)) return true;

    // 2. Mentioned
    if (lead.mentionedUserIds?.includes(currentUserId)) return true;

    // 3. Creator
    if (lead.createdBy === currentUserId) return true;

    // 4. Maibel fallback
    if (isMaibel) {
      if (lead.assignedToId === 'user-maibel') return true;
      if (lead.assignedTeamMemberIds?.some(id => id === 'user-maibel' || id.includes('maibel'))) return true;
      if (lead.mentionedUserIds?.some(id => id === 'user-maibel' || id.includes('maibel'))) return true;
    }

    return false;
  });
}

test('Admin sees all leads regardless of assignment', () => {
  const admin: User = { id: 'user-1', name: 'هدير سعيد', role: 'المدير التنفيذي', isSales: false };
  const mockLeads: Lead[] = [
    { id: '1', name: 'عميل للأدمن فقط', company: 'أدمن كو', leadType: 'admin', assignedToId: 'user-1' },
    { id: '2', name: 'عميل لمايبل', company: 'سيلز كو', leadType: 'sales', assignedToId: 'user-maibel' },
    { id: '3', name: 'عميل منشن لمايبل', company: 'منشن كو', mentionedUserIds: ['user-maibel'] }
  ];

  const visible = filterVisibleLeadsForUser(mockLeads, admin, true);
  assert.equal(visible.length, 3);
});

test('Sales user (Maibel) only sees assigned or mentioned leads', () => {
  const maibel: User = { id: 'user-maibel', name: 'Maibel Emad', role: 'مسؤولة المبيعات', isSales: true };
  const mockLeads: Lead[] = [
    { id: '1', name: 'عميل للأدمن فقط', company: 'أدمن كو', leadType: 'admin', assignedToId: 'user-1' },
    { id: '2', name: 'عميل لمايبل', company: 'سيلز كو', leadType: 'sales', assignedToId: 'user-maibel' },
    { id: '3', name: 'عميل منشن لمايبل', company: 'منشن كو', mentionedUserIds: ['user-maibel'] },
    { id: '4', name: 'عميل خاص بالأدمن 2', company: 'سرية', leadType: 'admin', assignedToId: 'user-1' }
  ];

  const visible = filterVisibleLeadsForUser(mockLeads, maibel, false);
  assert.equal(visible.length, 2);
  assert.deepEqual(visible.map(l => l.id), ['2', '3']);
  // Admin only leads must NOT be visible
  assert.ok(!visible.some(l => l.id === '1'));
  assert.ok(!visible.some(l => l.id === '4'));
});

test('Non-sales employee sees 0 leads', () => {
  const dev: User = { id: 'user-dev', name: 'أحمد المطور', role: 'مطور واجهات', isSales: false, department: 'التطوير والتقنية' };
  const mockLeads: Lead[] = [
    { id: '1', name: 'عميل للأدمن فقط', company: 'أدمن كو', leadType: 'admin', assignedToId: 'user-1' },
    { id: '2', name: 'عميل لمايبل', company: 'سيلز كو', leadType: 'sales', assignedToId: 'user-maibel' }
  ];

  const visible = filterVisibleLeadsForUser(mockLeads, dev, false);
  assert.equal(visible.length, 0);
});

test('Sales user sees leads created by herself', () => {
  const maibel: User = { id: 'user-maibel', name: 'Maibel Emad', role: 'مسؤولة المبيعات', isSales: true };
  const mockLeads: Lead[] = [
    { id: '5', name: 'عميل أضافته مايبل', company: 'جديد', createdBy: 'user-maibel' }
  ];

  const visible = filterVisibleLeadsForUser(mockLeads, maibel, false);
  assert.equal(visible.length, 1);
  assert.equal(visible[0].id, '5');
});
