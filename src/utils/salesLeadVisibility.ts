import { Lead } from '../types/crm';

const TEAM_ALIASES: Record<string, string[]> = {
  'user-maibel': ['user-maibel', 'maibel', 'maibel emad', 'مايبل', 'مايبل عماد', 'sm-105', 'سيلز'],
  'user-amira': ['user-amira', 'amira', 'أميرة', 'اميرة', 'sm-101'],
  'user-mariam': ['user-mariam', 'mariam', 'مريم', 'sm-106'],
  'user-islam': ['user-islam', 'islam', 'إسلام', 'اسلام', 'sm-108'],
  'user-roaa': ['user-roaa', 'roaa', 'رؤى', 'sm-107'],
  'user-1': ['user-1', 'user-admin', 'hadeer', 'hadeer.admin', 'هدير', 'هدير سعيد', 'admin', 'المدير']
};

export function getCanonicalUserId(val?: string | null): string {
  if (!val) return '';
  const clean = val.trim().toLowerCase().replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\-_.]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return '';

  for (const canonId of Object.keys(TEAM_ALIASES)) {
    if (canonId.toLowerCase() === clean) return canonId;
  }

  for (const [canonId, aliases] of Object.entries(TEAM_ALIASES)) {
    for (const a of aliases) {
      const cleanA = a.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\-_.]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean === cleanA || clean === cleanA.replace(/\s+/g, '')) {
        return canonId;
      }
    }
  }

  for (const [canonId, aliases] of Object.entries(TEAM_ALIASES)) {
    for (const a of aliases) {
      const cleanA = a.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\-_.]/g, ' ').replace(/\s+/g, ' ').trim();
      const wordsA = cleanA.split(/\s+/);
      const wordsClean = clean.split(/\s+/);
      if (wordsClean.length === 1 && wordsA.includes(wordsClean[0]) && wordsClean[0].length >= 3) {
        return canonId;
      }
      if (wordsA.length === 1 && wordsClean.includes(wordsA[0]) && wordsClean[0].length >= 3) {
        return canonId;
      }
    }
  }

  return clean;
}

/**
 * Checks whether a given user has sales privileges.
 */
export function isUserSalesRole(user: { id?: string; name?: string; role?: string; department?: string; isSales?: boolean; username?: string; allowedTabs?: string[] } | null | undefined, isManager: boolean): boolean {
  if (isManager) return true;
  if (!user) return false;

  const uid = (user.id || '').toLowerCase();
  const uname = (user.username || '').toLowerCase();
  const name = (user.name || '').toLowerCase();
  const role = (user.role || '').toLowerCase();
  const dept = (user.department || '').toLowerCase();

  return Boolean(
    user.isSales === true ||
    dept.includes('مبيعات') ||
    dept.includes('sales') ||
    role.includes('مبيعات') ||
    role.includes('سيلز') ||
    role.includes('sales') ||
    uid === 'user-maibel' ||
    uid === 'sm-105' ||
    uname.includes('maibel') ||
    name.includes('maibel') ||
    name.includes('مايبل') ||
    user.allowedTabs?.includes('leads')
  );
}

/**
 * Pure visibility check:
 * - Admin sees all leads unconditionally.
 * - Non-sales employees see 0 leads.
 * - Sales employees (e.g. Maibel) see any lead assigned to them, mentioned in, or created by them.
 */
export function isLeadVisibleToUser(
  lead: Lead,
  user: { id?: string; name?: string; role?: string; department?: string; isSales?: boolean; username?: string; allowedTabs?: string[] } | null | undefined,
  isManager: boolean
): boolean {
  if (isManager) return true;
  if (!lead || !lead.id) return false;
  if (!user || !user.id) return false;

  if (!isUserSalesRole(user, isManager)) {
    return false;
  }

  const currentUserId = user.id;
  const userCanon = getCanonicalUserId(currentUserId);
  const isMaibel =
    currentUserId === 'user-maibel' ||
    currentUserId === 'sm-105' ||
    (user.username || '').toLowerCase().includes('maibel') ||
    (user.name || '').toLowerCase().includes('maibel') ||
    (user.name || '').includes('مايبل');

  // 1. Direct assignment
  if (lead.assignedToId === currentUserId) return true;
  if (Array.isArray(lead.assignedTeamMemberIds) && lead.assignedTeamMemberIds.includes(currentUserId)) return true;

  // 2. Mention in mentionedUserIds
  if (Array.isArray(lead.mentionedUserIds) && lead.mentionedUserIds.includes(currentUserId)) return true;

  // 3. Creator
  if (lead.createdBy === currentUserId || (lead as any).creatorId === currentUserId || (lead as any).authorId === currentUserId) return true;
  if (user.name && (lead.creatorName === user.name || lead.createdBy === user.name)) return true;

  // 4. Canonical matching
  if (userCanon) {
    if (lead.assignedToId && getCanonicalUserId(lead.assignedToId) === userCanon) return true;
    if (Array.isArray(lead.assignedTeamMemberIds) && lead.assignedTeamMemberIds.some(id => getCanonicalUserId(id) === userCanon)) return true;
    if (Array.isArray(lead.mentionedUserIds) && lead.mentionedUserIds.some(id => getCanonicalUserId(id) === userCanon)) return true;
  }

  // 5. Text mention match in description, notes, negotiation history, follow up notes
  const userTerms: string[] = [
    user.name?.toLowerCase(),
    user.username?.toLowerCase(),
    user.id?.toLowerCase(),
    ...(isMaibel ? ['maibel', 'مايبل', 'ميبيل', 'مايبيل'] : [])
  ].filter(Boolean) as string[];

  const textToScan = [
    lead.detailedDescription,
    lead.negotiationsHistory,
    lead.notes,
    lead.followUpNotes,
    lead.company,
    ...(lead.negotiationEntries || []).map(ne => `${ne.summary} ${ne.authorName || ''}`)
  ].filter(Boolean).join(' ').toLowerCase();

  if (userTerms.some(term => term && textToScan.includes(term))) {
    return true;
  }

  // 6. Maibel special aliases
  if (isMaibel) {
    if (lead.assignedToId === 'user-maibel' || lead.assignedToId === 'sm-105' || (lead.assignedToId && lead.assignedToId.toLowerCase().includes('maibel'))) return true;
    if (Array.isArray(lead.assignedTeamMemberIds) && lead.assignedTeamMemberIds.some(id => id === 'user-maibel' || id.toLowerCase().includes('maibel') || id === 'sm-105')) return true;
    if (Array.isArray(lead.mentionedUserIds) && lead.mentionedUserIds.some(id => id === 'user-maibel' || id.toLowerCase().includes('maibel') || id === 'sm-105')) return true;
  }

  return false;
}

/**
 * Filter leads visible to a specific user.
 */
export function filterVisibleLeadsForUser(
  leads: Lead[],
  user: { id?: string; name?: string; role?: string; department?: string; isSales?: boolean; username?: string; allowedTabs?: string[] } | null | undefined,
  isManager: boolean
): Lead[] {
  if (isManager) return leads || [];
  if (!user) return [];
  return (leads || []).filter(lead => isLeadVisibleToUser(lead, user, isManager));
}

/**
 * Merges two lists of leads with deleted ID enforcement to guarantee that
 * deleted leads are NEVER resurrected across multiple client devices.
 */
export function mergeLeadsListIntegrity(
  currentLeads: Lead[],
  incomingLeads: Lead[],
  deletedLeadIds: Set<string> | string[] = new Set()
): Lead[] {
  const map = new Map<string, Lead>();
  const delSet = deletedLeadIds instanceof Set ? deletedLeadIds : new Set(deletedLeadIds || []);

  // 1. Current leads (skip any deleted lead)
  (currentLeads || []).forEach(lead => {
    if (lead && lead.id && !delSet.has(lead.id)) {
      map.set(lead.id, lead);
    }
  });

  // 2. Incoming leads (skip any deleted lead)
  (incomingLeads || []).forEach(incoming => {
    if (!incoming || !incoming.id || delSet.has(incoming.id)) return;

    const existing = map.get(incoming.id);
    if (!existing) {
      map.set(incoming.id, incoming);
    } else {
      // Merge newest fields
      const existingTime = new Date((existing as any).updatedAt || existing.createdAt || 0).getTime();
      const incomingTime = new Date((incoming as any).updatedAt || incoming.createdAt || 0).getTime();

      const mergedNegotiations = [
        ...(incoming.negotiationEntries || []),
        ...(existing.negotiationEntries || [])
      ];
      const uniqueNegMap = new Map<string, any>();
      mergedNegotiations.forEach(n => {
        if (n && n.id && !uniqueNegMap.has(n.id)) uniqueNegMap.set(n.id, n);
      });

      const mergedAssignees = Array.from(new Set([
        ...(incoming.assignedTeamMemberIds || (incoming.assignedToId ? [incoming.assignedToId] : [])),
        ...(existing.assignedTeamMemberIds || (existing.assignedToId ? [existing.assignedToId] : []))
      ]));

      const mergedMentions = Array.from(new Set([
        ...(incoming.mentionedUserIds || []),
        ...(existing.mentionedUserIds || []),
        ...mergedAssignees
      ]));

      map.set(incoming.id, {
        ...(existingTime >= incomingTime ? incoming : existing),
        ...(existingTime < incomingTime ? incoming : existing),
        assignedTeamMemberIds: mergedAssignees,
        mentionedUserIds: mergedMentions,
        negotiationEntries: Array.from(uniqueNegMap.values())
      });
    }
  });

  return Array.from(map.values()).filter(l => !delSet.has(l.id));
}
