import { TeamMember, ClientRenewal, Task } from '../types/crm';

/**
 * Checks whether a user is an Account Manager
 */
export function isUserAccountManager(
  user?: TeamMember | null,
  clientRenewals: ClientRenewal[] = []
): boolean {
  if (!user) return false;

  // System admin / General Manager has full executive scope, NOT a restricted Account Manager
  if (user.accessLevel === 'admin') return false;

  if (user.isAccountManager) return true;

  const role = (user.role || '').toLowerCase();
  if (
    role.includes('account manager') ||
    role.includes('مدير حساب') ||
    role.includes('أكونت مانجر') ||
    role.includes('ادارة حسابات') ||
    role.includes('إدارة حسابات')
  ) {
    return true;
  }

  // Check if they manage any clients in clientRenewals
  const managesAnyClient = clientRenewals.some(
    c =>
      c.accountManagerId === user.id ||
      (c.accountManagerName && c.accountManagerName.toLowerCase().includes(user.name.toLowerCase())) ||
      (c.managedBy && c.managedBy.toLowerCase().includes(user.name.toLowerCase()))
  );

  return managesAnyClient;
}

/**
 * Retrieves all clients managed by the given Account Manager
 */
export function getAccountManagerClients(
  user: TeamMember,
  clientRenewals: ClientRenewal[] = []
): ClientRenewal[] {
  if (!user) return [];

  const userNameNorm = (user.name || '').trim().toLowerCase();
  const userId = user.id;

  return clientRenewals.filter(c => {
    if (c.accountManagerId && c.accountManagerId === userId) return true;
    if (c.accountManagerName && c.accountManagerName.trim().toLowerCase().includes(userNameNorm)) return true;
    if (c.managedBy && c.managedBy.trim().toLowerCase().includes(userNameNorm)) return true;
    return false;
  });
}

/**
 * Checks whether a team member is an Admin / General Manager (e.g., Hadeer Said)
 */
export function isAdminMember(member?: TeamMember | null): boolean {
  if (!member) return false;
  if (member.accessLevel === 'admin') return true;
  const id = (member.id || '').trim().toLowerCase();
  if (id === 'user-1' || id === 'user-admin' || id === 'admin') return true;
  const username = (member.username || '').trim().toLowerCase();
  if (username === 'hadeer.admin' || username === 'admin' || username.includes('hadeer')) return true;
  const name = (member.name || '').trim();
  if (name.includes('هدير')) return true;
  const role = (member.role || '').toLowerCase();
  if (role.includes('مدير عام') || role.includes('المدير')) return true;
  return false;
}

/**
 * Checks whether a task is assigned to or belongs to Admin / General Manager (Hadeer Said)
 * "تاسكات الادمن والمدير هدير سعيد متظهرش غير لالادمن بس"
 */
export function isAdminTask(task?: Task | null): boolean {
  if (!task) return false;
  const aid = (task.assignedToId || '').trim().toLowerCase();
  if (!aid) return false;
  if (
    aid === 'user-1' ||
    aid === 'user-admin' ||
    aid === 'hadeer.admin' ||
    aid === 'admin' ||
    aid === 'hadeer'
  ) {
    return true;
  }
  if (aid.includes('هدير') || aid.includes('hadeer')) {
    return true;
  }
  return false;
}

/**
 * Checks whether a specific task belongs to the Account Manager's scope.
 * 
 * "اظهر لاكونت مانجر الموظفين اللي تابعه والتاسكات اللي مع الموظفين تابعه بس اعملي فكره ليها لان مش كل شغل الموظفين معاه ولا كل تاسكاتهم معاه"
 * "تاسكات الادمن والمدير هدير سعيد متظهرش غير لالادمن بس"
 * A task is in scope ONLY if:
 * 1. Assigned directly to the Account Manager.
 * 2. Created/delegated by this Account Manager.
 * 3. Explicitly tagged with this Account Manager ID.
 * 4. Linked to a client managed by this Account Manager.
 */
export function isTaskInAccountManagerScope(
  task: Task,
  user: TeamMember,
  clientRenewals: ClientRenewal[] = []
): boolean {
  if (!task || !user) return false;

  // Admin / General Manager Hadeer Said tasks must NEVER appear to non-admin users / Account Managers
  if (user.accessLevel !== 'admin' && isAdminTask(task)) {
    return false;
  }

  // If task is private and user is not admin, do not show
  if (task.isPrivate && user.accessLevel !== 'admin') {
    return false;
  }

  // 1. Direct assignment to the account manager
  if (task.assignedToId === user.id) return true;

  // 2. Created or delegated by this account manager
  if (task.createdById && task.createdById === user.id) return true;

  // 3. Explicit account manager tag on task
  if (task.accountManagerId && task.accountManagerId === user.id) return true;

  // 4. Linked to a client of this Account Manager
  const myClients = getAccountManagerClients(user, clientRenewals);
  if (myClients.length === 0) return false;

  const myClientIds = new Set(myClients.map(c => c.id));
  const myClientNames = new Set(
    myClients.flatMap(c => [
      (c.clientName || '').trim().toLowerCase(),
      (c.company || '').trim().toLowerCase(),
      (c.sheetTitle || '').trim().toLowerCase()
    ]).filter(Boolean)
  );

  // Check task.relatedTo
  if (task.relatedTo?.type === 'client' || task.relatedTo?.id) {
    if (myClientIds.has(task.relatedTo.id)) return true;
    const relName = (task.relatedTo.name || '').trim().toLowerCase();
    if (myClientNames.has(relName)) return true;
  }

  // Check task title or description mentioning one of the account manager's clients
  const titleLower = (task.title || '').toLowerCase();
  const descLower = (task.description || '').toLowerCase();

  for (const client of myClients) {
    const cName = (client.clientName || '').trim().toLowerCase();
    const cCompany = (client.company || '').trim().toLowerCase();
    const cSheet = (client.sheetTitle || '').trim().toLowerCase();

    if (cName.length >= 3 && (titleLower.includes(cName) || descLower.includes(cName))) {
      return true;
    }
    if (cCompany.length >= 3 && (titleLower.includes(cCompany) || descLower.includes(cCompany))) {
      return true;
    }
    if (cSheet.length >= 3 && (titleLower.includes(cSheet) || descLower.includes(cSheet))) {
      return true;
    }
  }

  return false;
}

/**
 * Retrieves the team members collaborating with this Account Manager on their clients/tasks.
 * Strictly excludes any Admin / General Manager (Hadeer Said).
 */
export function getAccountManagerTeamMembers(
  user: TeamMember,
  clientRenewals: ClientRenewal[] = [],
  allTeam: TeamMember[] = [],
  allTasks: Task[] = []
): TeamMember[] {
  if (!user) return [];

  const myClients = getAccountManagerClients(user, clientRenewals);
  const collaboratingMemberIds = new Set<string>();

  // From client team assignments
  myClients.forEach(c => {
    (c.assignedTeamMemberIds || []).forEach(mid => {
      if (mid && mid !== 'all' && mid !== user.id) {
        collaboratingMemberIds.add(mid);
      }
    });
    // From client monthly tasks
    (c.monthlyTasks || []).forEach(mt => {
      if (mt.assignedToId && mt.assignedToId !== user.id) {
        collaboratingMemberIds.add(mt.assignedToId);
      }
    });
  });

  // From explicit managedTeamMemberIds on user profile
  (user.managedTeamMemberIds || []).forEach(mid => {
    if (mid && mid !== user.id) collaboratingMemberIds.add(mid);
  });

  // From tasks in this Account Manager's scope
  allTasks.forEach(task => {
    if (!isAdminTask(task) && isTaskInAccountManagerScope(task, user, clientRenewals)) {
      if (task.assignedToId && task.assignedToId !== user.id) {
        collaboratingMemberIds.add(task.assignedToId);
      }
    }
  });

  // Filter allTeam and strictly exclude user themselves and any Admin / General Manager (e.g. Hadeer Said)
  return allTeam.filter(
    m => collaboratingMemberIds.has(m.id) && m.id !== user.id && !isAdminMember(m)
  );
}

/**
 * Filters tasks list to include only those within the Account Manager's scope.
 * Strictly excludes Admin Hadeer's tasks for non-admins.
 */
export function filterTasksForAccountManager(
  tasks: Task[],
  user: TeamMember,
  clientRenewals: ClientRenewal[] = []
): Task[] {
  if (!tasks || !user) return [];

  return tasks.filter(task => {
    // If task is private and user is not admin, do not show
    if (task.isPrivate && user.accessLevel !== 'admin') return false;
    // Admin / General Manager Hadeer Said tasks must strictly appear ONLY to Admin!
    if (user.accessLevel !== 'admin' && isAdminTask(task)) return false;
    return isTaskInAccountManagerScope(task, user, clientRenewals);
  });
}
