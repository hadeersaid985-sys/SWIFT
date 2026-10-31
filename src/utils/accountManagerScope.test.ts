import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isUserAccountManager,
  getAccountManagerClients,
  getAccountManagerTeamMembers,
  isTaskInAccountManagerScope,
  filterTasksForAccountManager,
  isAdminMember,
  isAdminTask
} from './accountManagerScope.ts';
import { TeamMember, ClientRenewal, Task } from '../types/crm.ts';

describe('Account Manager Scope and Filtering Logic', () => {
  const amira: TeamMember = {
    id: 'user-amira',
    name: 'Amira',
    employeeCode: 'SM-104',
    role: 'Account Manager',
    department: 'خدمة العملاء',
    email: 'amira@swiftmynd.com',
    phone: '+201000000001',
    username: 'amira',
    password: '123',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'online',
    joinedDate: '2026-01-01'
  };

  const islam: TeamMember = {
    id: 'user-islam',
    name: 'Islam',
    employeeCode: 'SM-108',
    role: 'Video Editor',
    department: 'التسويق',
    email: 'islam@swiftmynd.com',
    phone: '+201000000002',
    username: 'islam',
    password: '123',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'online',
    joinedDate: '2026-01-01'
  };

  const hadeerAdmin: TeamMember = {
    id: 'user-1',
    name: 'هدير سعيد',
    employeeCode: 'SM-101',
    role: 'مدير عام النظام والعمليات (المدير)',
    department: 'المبيعات',
    email: 'hadeer.said@swiftmynd.com',
    phone: '+966 50 123 4567',
    username: 'hadeer.admin',
    password: '123',
    accessLevel: 'admin',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    status: 'online',
    joinedDate: '2023-01-15'
  };

  const clients: ClientRenewal[] = [
    {
      id: 'ren-golden',
      clientName: 'شركة جولدن للأغذية',
      company: 'جولدن',
      serviceName: 'باقة سيو وتصاميم سوشيال',
      planCycle: 'شهري',
      amount: 15000,
      currency: 'ج.م',
      renewalDate: '2026-11-20',
      status: 'active',
      phone: '01000000000',
      whatsappNumber: '01000000000',
      accountManagerId: 'user-amira',
      accountManagerName: 'Amira',
      assignedTeamMemberIds: ['user-amira', 'user-islam', 'user-1'], // Hadeer is also attached
      createdAt: '2026-01-01'
    },
    {
      id: 'ren-other',
      clientName: 'شركة النور للمقاولات',
      company: 'النور',
      serviceName: 'سيرفرات وهوست',
      planCycle: 'سنوي',
      amount: 45000,
      currency: 'ج.م',
      renewalDate: '2026-12-01',
      status: 'active',
      phone: '01100000000',
      whatsappNumber: '01100000000',
      accountManagerId: 'user-other-mgr',
      accountManagerName: 'Sameh',
      assignedTeamMemberIds: ['user-other-mgr', 'user-islam'],
      createdAt: '2026-01-01'
    }
  ];

  it('correctly identifies Amira as an Account Manager', () => {
    assert.strictEqual(isUserAccountManager(amira, clients), true);
    assert.strictEqual(isUserAccountManager(islam, clients), false);
    assert.strictEqual(isUserAccountManager(hadeerAdmin, clients), false);
  });

  it('correctly identifies Admin / Manager Hadeer Said and her tasks', () => {
    assert.strictEqual(isAdminMember(hadeerAdmin), true);
    assert.strictEqual(isAdminMember(amira), false);
    assert.strictEqual(isAdminMember(islam), false);

    assert.strictEqual(isAdminTask({ id: 't-admin', assignedToId: 'user-1', title: 'مهمة خاصة بالمدير' } as Task), true);
    assert.strictEqual(isAdminTask({ id: 't-admin2', assignedToId: 'hadeer.admin', title: 'مهمة' } as Task), true);
    assert.strictEqual(isAdminTask({ id: 't-amira', assignedToId: 'user-amira', title: 'مهمة أميرة' } as Task), false);
  });

  it('correctly retrieves clients managed by Amira', () => {
    const amiraClients = getAccountManagerClients(amira, clients);
    assert.strictEqual(amiraClients.length, 1);
    assert.strictEqual(amiraClients[0].id, 'ren-golden');
  });

  it('strictly excludes Admin Hadeer from Account Manager team members list', () => {
    // Even though 'user-1' is in client.assignedTeamMemberIds, Hadeer must NEVER be in Amira's team!
    const teamMembers = getAccountManagerTeamMembers(amira, clients, [amira, islam, hadeerAdmin]);
    assert.strictEqual(teamMembers.length, 1);
    assert.strictEqual(teamMembers[0].id, 'user-islam');
    assert.strictEqual(teamMembers.some(m => m.id === 'user-1'), false);
  });

  it('only includes tasks for Amiras clients, and strictly EXCLUDES Admin Hadeer tasks', () => {
    const taskGoldenForIslam: Task = {
      id: 'task-1',
      title: 'مونتاج فيديو ريلز لشركة جولدن',
      description: 'فيديو تسويقي للمنتج الجديد',
      assignedToId: 'user-islam',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2026-11-05',
      category: 'تسويق',
      timeLogs: [],
      subtasks: [],
      createdAt: '2026-10-30',
      relatedTo: {
        type: 'client',
        id: 'ren-golden',
        name: 'شركة جولدن للأغذية'
      }
    };

    const taskGoldenForHadeerAdmin: Task = {
      id: 'task-admin-golden',
      title: 'إرسال عرض السعر النهائي والتعاقد لشركة جولدن',
      description: 'مهمة خاصة بالإدارة العليا',
      assignedToId: 'user-1',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: '2026-11-05',
      category: 'مبيعات',
      timeLogs: [],
      subtasks: [],
      createdAt: '2026-10-30',
      relatedTo: {
        type: 'client',
        id: 'ren-golden',
        name: 'شركة جولدن للأغذية'
      }
    };

    const taskOtherClientForIslam: Task = {
      id: 'task-2',
      title: 'مونتاج فيديو وثائقي لشركة النور للمقاولات',
      description: 'فيديو مشاريع العاصمة',
      assignedToId: 'user-islam',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2026-11-06',
      category: 'تسويق',
      timeLogs: [],
      subtasks: [],
      createdAt: '2026-10-30',
      relatedTo: {
        type: 'client',
        id: 'ren-other',
        name: 'شركة النور للمقاولات'
      }
    };

    const generalCompanyTaskForIslam: Task = {
      id: 'task-3',
      title: 'تعديل انترو الشركة العام لسويفت مايند',
      description: 'فيديو انترو عام للويب سايت',
      assignedToId: 'user-islam',
      priority: 'medium',
      status: 'todo',
      dueDate: '2026-11-10',
      category: 'تسويق',
      timeLogs: [],
      subtasks: [],
      createdAt: '2026-10-30'
    };

    const taskDelegatedByAmira: Task = {
      id: 'task-4',
      title: 'كتابة بريف التصاميم الجديدة',
      description: 'مهمة فوضتها أميرة مباشرة للمصمم',
      assignedToId: 'user-islam',
      createdById: 'user-amira',
      priority: 'urgent',
      status: 'todo',
      dueDate: '2026-11-02',
      category: 'إداري',
      timeLogs: [],
      subtasks: [],
      createdAt: '2026-10-30'
    };

    // Test individual scope evaluation
    assert.strictEqual(isTaskInAccountManagerScope(taskGoldenForIslam, amira, clients), true);
    // Hadeer's task must be FALSE for Amira
    assert.strictEqual(isTaskInAccountManagerScope(taskGoldenForHadeerAdmin, amira, clients), false);
    // But TRUE for Hadeer herself
    assert.strictEqual(isTaskInAccountManagerScope(taskGoldenForHadeerAdmin, hadeerAdmin, clients), true);
    assert.strictEqual(isTaskInAccountManagerScope(taskOtherClientForIslam, amira, clients), false);
    assert.strictEqual(isTaskInAccountManagerScope(generalCompanyTaskForIslam, amira, clients), false);
    assert.strictEqual(isTaskInAccountManagerScope(taskDelegatedByAmira, amira, clients), true);

    // Test filtering list of tasks for Amira
    const allTasks = [
      taskGoldenForIslam,
      taskGoldenForHadeerAdmin,
      taskOtherClientForIslam,
      generalCompanyTaskForIslam,
      taskDelegatedByAmira
    ];
    const filteredForAmira = filterTasksForAccountManager(allTasks, amira, clients);

    // Only Islam's 2 tasks on Amira's accounts/delegated should appear, Hadeer's task MUST BE EXCLUDED!
    assert.strictEqual(filteredForAmira.length, 2);
    assert.deepStrictEqual(filteredForAmira.map(t => t.id), ['task-1', 'task-4']);
    assert.strictEqual(filteredForAmira.some(t => t.id === 'task-admin-golden'), false);
  });
});
