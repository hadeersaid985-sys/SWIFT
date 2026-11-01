import test from 'node:test';
import assert from 'node:assert/strict';
import { isMatchingAttendanceUser, mergeAttendanceLists } from './attendanceSyncLogic';
import { AttendanceRecord, TeamMember } from '../types/crm';

test('isMatchingAttendanceUser correctly matches Mariam across aliases, employeeCode, and name', () => {
  const mariamUser: any = {
    id: 'user-mariam',
    name: 'Mariam',
    username: 'Mariam',
    role: 'Web Developer',
    department: 'التطوير والتقنية',
    employeeCode: 'SM-106',
    status: 'online'
  };

  // 1. Direct ID match
  const recordDirect: AttendanceRecord = {
    id: 'att-1',
    memberId: 'user-mariam',
    memberName: 'Mariam',
    employeeCode: 'SM-106',
    date: '2026-11-01',
    status: 'present',
    checkInTime: '09:00'
  };
  assert.equal(isMatchingAttendanceUser(recordDirect, mariamUser), true);

  // 2. Legacy numeric ID alias match
  const recordAlias: AttendanceRecord = {
    id: 'att-2',
    memberId: 'user-1793097751331',
    memberName: 'Mariam',
    date: '2026-11-01',
    status: 'present',
    checkInTime: '09:00'
  };
  assert.equal(isMatchingAttendanceUser(recordAlias, mariamUser), true);

  // 3. EmployeeCode match
  const recordCode: AttendanceRecord = {
    id: 'att-3',
    memberId: 'user-random-device-id',
    memberName: 'Mariam',
    employeeCode: 'SM-106',
    date: '2026-11-01',
    status: 'present'
  };
  assert.equal(isMatchingAttendanceUser(recordCode, mariamUser), true);

  // 4. Must not match a different team member
  const islamUser: any = {
    id: 'user-islam',
    name: 'Islam',
    username: 'Islam',
    role: 'Video Editor',
    department: 'التطوير والتقنية',
    employeeCode: 'SM-108',
    status: 'online'
  };
  assert.equal(isMatchingAttendanceUser(recordDirect, islamUser), false);
});

test('mergeAttendanceLists combines records from desktop and mobile without duplicates', () => {
  const desktopRecord: AttendanceRecord = {
    id: 'att-desktop-1',
    memberId: 'user-mariam',
    memberName: 'Mariam',
    employeeCode: 'SM-106',
    date: '2026-11-01',
    status: 'present',
    checkInTime: '09:15',
    checkOutTime: undefined
  };

  const mobileCheckOutUpdate: AttendanceRecord = {
    id: 'att-desktop-1',
    memberId: 'user-mariam',
    memberName: 'Mariam',
    employeeCode: 'SM-106',
    date: '2026-11-01',
    status: 'present',
    checkInTime: '09:15',
    checkOutTime: '17:30',
    notes: 'نهاية الدوام من الموبايل'
  };

  const merged = mergeAttendanceLists([desktopRecord], [mobileCheckOutUpdate]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].checkInTime, '09:15');
  assert.equal(merged[0].checkOutTime, '17:30');
  assert.equal(merged[0].notes, 'نهاية الدوام من الموبايل');
});

test('mergeAttendanceLists handles distinct employees and preserves both', () => {
  const mariamRecord: AttendanceRecord = {
    id: 'att-1',
    memberId: 'user-mariam',
    memberName: 'Mariam',
    date: '2026-11-01',
    status: 'present',
    checkInTime: '09:00'
  };

  const islamRecord: AttendanceRecord = {
    id: 'att-2',
    memberId: 'user-islam',
    memberName: 'Islam',
    date: '2026-11-01',
    status: 'present',
    checkInTime: '09:30'
  };

  const merged = mergeAttendanceLists([mariamRecord], [islamRecord]);
  assert.equal(merged.length, 2);
  const foundMariam = merged.find(r => r.memberId === 'user-mariam');
  const foundIslam = merged.find(r => r.memberId === 'user-islam');
  assert.ok(foundMariam);
  assert.ok(foundIslam);
});
