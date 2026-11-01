import { AttendanceRecord, TeamMember } from '../types/crm';

/**
 * Robust Canonical User Matching for Attendance across all devices (Mobile & Desktop)
 */
export function isMatchingAttendanceUser(
  record: AttendanceRecord,
  user: { id: string; name?: string; employeeCode?: string; [key: string]: any }
): boolean {
  if (!record || !user) return false;
  if (record.memberId === user.id) return true;

  const aliases: Record<string, string[]> = {
    'user-mariam': ['user-mariam', 'user-1793097751331', 'user-1793016396281', 'mariam', 'مريم'],
    'user-islam': ['user-islam', 'user-1793025675186', 'user-1793016178916', 'islam', 'اسلام', 'إسلام'],
    'user-roaa': ['user-roaa', 'user-1793016462810', 'roaa', 'رواء'],
    'user-eman': ['user-eman', 'eman', 'eman ashraf', 'ايمان', 'إيمان'],
    'user-aya': ['user-aya', 'user-1793016503819', 'aya', 'aya gaber', 'آية', 'ايه', 'آيه'],
    'user-yomna': ['user-yomna', 'yomna', 'يمنى', 'يمنه'],
    'user-amira': ['user-amira', 'amira', 'اميرة', 'أميرة', 'اميره'],
    'user-maibel': ['user-maibel', 'maibel', 'مايبل'],
    'user-1': ['user-1', 'user-admin', 'hadeer', 'hadeer said', 'هدير', 'هدير سعيد', 'admin']
  };

  const mid = (record.memberId || '').toLowerCase().trim();
  const uid = (user.id || '').toLowerCase().trim();
  for (const list of Object.values(aliases)) {
    if (list.includes(mid) && list.includes(uid)) return true;
  }

  // Match by employee code (e.g. SM-106)
  if (user.employeeCode && record.employeeCode && user.employeeCode.trim() === record.employeeCode.trim()) {
    return true;
  }

  // Match by name
  if (user.name && record.memberName && user.name.trim().toLowerCase() === record.memberName.trim().toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Merge two attendance lists safely (preserving updates, newest timestamp winning, preventing duplicates)
 */
export function mergeAttendanceLists(
  existingList: AttendanceRecord[],
  incomingList: AttendanceRecord[]
): AttendanceRecord[] {
  const map = new Map<string, AttendanceRecord>();

  existingList.forEach(r => {
    if (!r) return;
    const key = r.id || `${r.memberId}_${r.date}`;
    map.set(key, r);
  });

  incomingList.forEach(incoming => {
    if (!incoming) return;
    const primaryKey = incoming.id || `${incoming.memberId}_${incoming.date}`;
    let targetKey = primaryKey;

    for (const [key, existing] of map.entries()) {
      if (
        (incoming.id && existing.id === incoming.id) ||
        (existing.memberId === incoming.memberId && existing.date === incoming.date) ||
        (existing.employeeCode && incoming.employeeCode && existing.employeeCode === incoming.employeeCode && existing.date === incoming.date)
      ) {
        targetKey = key;
        break;
      }
    }

    const existing = map.get(targetKey) || {} as AttendanceRecord;
    map.set(targetKey, {
      ...existing,
      ...incoming,
      id: existing.id || incoming.id
    });
  });

  return Array.from(map.values());
}
