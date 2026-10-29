import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ClientRenewal, TeamMember } from '../types/crm';

// Pure logic for client visibility simulation
function isClientVisibleToUser(client: ClientRenewal, user: TeamMember): boolean {
  const isAdmin = user.accessLevel === 'admin' || user.accessLevel === 'manager' || user.id === 'user-1';
  if (isAdmin) return true;

  const currentUid = (user.id || '').trim().toLowerCase();
  const currentUsername = (user.username || '').trim().toLowerCase();
  const currentCode = (user.employeeCode || '').trim().toLowerCase();

  // 1. Explicit ID in assignedTeamMemberIds
  if (Array.isArray(client.assignedTeamMemberIds)) {
    for (const mId of client.assignedTeamMemberIds) {
      const cleanM = (mId || '').trim().toLowerCase();
      if (cleanM === currentUid || cleanM === currentCode || cleanM === currentUsername) {
        return true;
      }
    }
  }

  // 2. Explicit ID in mentionedTeamMemberIds
  if (Array.isArray(client.mentionedTeamMemberIds)) {
    for (const mId of client.mentionedTeamMemberIds) {
      const cleanM = (mId || '').trim().toLowerCase();
      if (cleanM === currentUid || cleanM === currentCode || cleanM === currentUsername) {
        return true;
      }
    }
  }

  // 3. ManagedBy
  if (client.managedBy) {
    const cleanMgr = client.managedBy.trim().toLowerCase();
    if (cleanMgr === currentUid || cleanMgr === user.name.trim().toLowerCase() || cleanMgr === currentUsername) {
      return true;
    }
  }

  return false;
}

describe('Client Renewal & Files Visibility Isolation', () => {
  const employeeYomna: TeamMember = {
    id: 'user-yomna',
    name: 'يمنى عبدالحليم',
    role: 'SEO Specialist',
    department: 'التسويق',
    email: 'yomna@swiftmynd.com',
    phone: '',
    username: 'yomna',
    employeeCode: 'SM-107',
    accessLevel: 'member',
    isAccountActive: true,
    status: 'online',
    joinedDate: '2026-01-01',
    avatar: '',
    password: 'Pass123@Password'
  };

  const adminHadeer: TeamMember = {
    id: 'user-1',
    name: 'هدير سعيد',
    role: 'المدير التنفيذي',
    department: 'التطوير والتقنية',
    email: 'hadeer@swiftmynd.com',
    phone: '',
    username: 'hadeer.said',
    employeeCode: 'SM-101',
    accessLevel: 'admin',
    isAccountActive: true,
    status: 'online',
    joinedDate: '2026-01-01',
    avatar: '',
    password: 'AdminPassword123'
  };

  const sampleClient: ClientRenewal = {
    id: 'ren-test-1',
    clientName: 'شركة النور',
    company: 'النور للبرمجيات',
    phone: '0100000000',
    whatsappNumber: '0100000000',
    serviceName: 'استضافة وسيرفرات سويفت 2 دومين',
    planCycle: 'سنوي',
    amount: 3500,
    currency: 'ج.م',
    renewalDate: '2026-11-20',
    status: 'active',
    createdAt: '2026-10-01',
    assignedTeamMemberIds: ['user-1', 'user-yomna'],
    mentionedTeamMemberIds: ['user-yomna']
  };

  it('allows employee to see client when assigned and mentioned', () => {
    assert.equal(isClientVisibleToUser(sampleClient, employeeYomna), true);
  });

  it('hides client and folder immediately from employee when unmentioned and unassigned', () => {
    const unmentionedClient: ClientRenewal = {
      ...sampleClient,
      assignedTeamMemberIds: ['user-1', 'user-amira'],
      mentionedTeamMemberIds: []
    };
    assert.equal(isClientVisibleToUser(unmentionedClient, employeeYomna), false);
  });

  it('admin always sees client even when unassigned from team', () => {
    const unassignedClient: ClientRenewal = {
      ...sampleClient,
      assignedTeamMemberIds: [],
      mentionedTeamMemberIds: []
    };
    assert.equal(isClientVisibleToUser(unassignedClient, adminHadeer), true);
  });

  it('unassigned client with empty team is hidden from non-admin employees', () => {
    const unassignedClient: ClientRenewal = {
      ...sampleClient,
      assignedTeamMemberIds: [],
      mentionedTeamMemberIds: []
    };
    assert.equal(isClientVisibleToUser(unassignedClient, employeeYomna), false);
  });

  it('active clients pool strictly excludes suspended contracts', () => {
    const clients: ClientRenewal[] = [
      { ...sampleClient, id: 'c1', status: 'renewing_soon' },
      { ...sampleClient, id: 'c2', status: 'suspended' },
      { ...sampleClient, id: 'c3', status: 'renewed' },
      { ...sampleClient, id: 'c4', status: 'suspended' }
    ];

    const currentActiveOnly = clients.filter(c => c.status !== 'suspended');
    const suspendedOnly = clients.filter(c => c.status === 'suspended');

    assert.equal(currentActiveOnly.length, 2);
    assert.deepEqual(currentActiveOnly.map(c => c.id), ['c1', 'c3']);
    assert.equal(suspendedOnly.length, 2);
    assert.deepEqual(suspendedOnly.map(c => c.id), ['c2', 'c4']);
  });
});
