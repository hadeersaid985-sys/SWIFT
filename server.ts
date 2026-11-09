import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { sanitizeTaskIntegrity, mergeTaskIntegrity, mergeTasksListIntegrity } from './src/utils/taskCompletionIntegrity.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));

  // Strict anti-caching & CORS headers for all API requests to ensure multi-device freshness
  app.use('/api', (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  const BACKUP_DIR = path.join(process.cwd(), 'backup');
  const DATA_FILE = path.join(BACKUP_DIR, 'data-store.json');
  const LATEST_FILE = path.join(BACKUP_DIR, 'latest-data.json');

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Active SSE client connections for instant zero-latency cross-device broadcast
  const sseClients = new Set<express.Response>();

  function broadcastLiveSync(payload: any) {
    if (sseClients.size === 0) return;
    const msg = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(msg);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  const MOCK_DEMO_CLIENT_IDS = new Set(['ren-1', 'ren-2', 'ren-3', 'ren-4', 'ren-5', 'ren-6']);
  const MOCK_DEMO_CLIENT_NAMES = new Set(['جاسم الصباح', 'عبدالعزيز العتيبي', 'سعود المنصور', 'فهد الدوسري', 'خالد ناصر الجاسم', 'م. أحمد كمال']);

  function cleanClientRenewals(list: any[]): any[] {
    if (!Array.isArray(list)) return [];
    return list.filter((r: any) => {
      if (r && r.id && MOCK_DEMO_CLIENT_IDS.has(r.id)) return false;
      const name = (r?.clientName || '').trim();
      if (MOCK_DEMO_CLIENT_NAMES.has(name)) return false;
      return true;
    });
  }

  function sanitizeTeam(list: any[]): any[] {
    if (!Array.isArray(list)) return [];
    const seenUsernames = new Set<string>();
    const sanitized: any[] = [];
    for (const m of list) {
      if (!m) continue;
      const uname = (m.username || '').toLowerCase().trim();
      const id = m.id || '';
      const code = (m.employeeCode || '').trim();
      const name = (m.name || '').trim();

      // Permanently eliminate duplicate SM-109 Mariam account
      if (id === 'user-1793097751331') continue;
      if (code === 'SM-109' && (uname === 'mariam' || name.toLowerCase().includes('mariam'))) continue;

      // Mariam canonical enforcement: must be SM-106, Web Developer
      if (uname === 'mariam' || id === 'user-mariam') {
        if (seenUsernames.has('mariam')) continue;
        seenUsernames.add('mariam');
        sanitized.push({
          ...m,
          id: 'user-mariam',
          name: 'Mariam',
          username: 'Mariam',
          employeeCode: 'SM-106',
          role: 'Web Developer',
          department: 'التطوير والتقنية'
        });
        continue;
      }

      if (uname) {
        if (seenUsernames.has(uname)) continue;
        seenUsernames.add(uname);
      }
      sanitized.push(m);
    }
    return sanitized;
  }

  // Safe file reader with fallback and automatic sync
  function readCurrentData(): any {
    try {
      let parsed: any = {};
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        parsed = JSON.parse(raw);
      } else if (fs.existsSync(LATEST_FILE)) {
        const raw = fs.readFileSync(LATEST_FILE, 'utf-8');
        parsed = JSON.parse(raw);
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }

      // Merge with LATEST_FILE if both exist to guarantee no tasks or edits are lost
      if (fs.existsSync(LATEST_FILE) && fs.existsSync(DATA_FILE)) {
        try {
          const latestRaw = fs.readFileSync(LATEST_FILE, 'utf-8');
          const latestParsed = JSON.parse(latestRaw);
          if (Array.isArray(latestParsed.tasks) && latestParsed.tasks.length > 0) {
            parsed.tasks = mergeTasksListIntegrity(parsed.tasks || [], latestParsed.tasks);
          }

          if (Array.isArray(latestParsed.team) && latestParsed.team.length > 0) {
            const delIds = new Set([
              ...((parsed.deletedTeamMemberIds || [])),
              ...((latestParsed.deletedTeamMemberIds || []))
            ]);
            const currentTeamMap = new Map<string, any>((parsed.team || []).map((m: any) => [m.id, m]));
            latestParsed.team.forEach((m: any) => {
              if (m && m.id && !currentTeamMap.has(m.id) && !delIds.has(m.id) && m.id !== 'user-1793097751331') {
                currentTeamMap.set(m.id, m);
              }
            });
            parsed.team = Array.from(currentTeamMap.values()).filter((m: any) => !delIds.has(m.id) && m.id !== 'user-1793097751331');
          }

          if (Array.isArray(latestParsed.chatMessages) && latestParsed.chatMessages.length > 0) {
            const currentChatMap = new Map<string, any>((parsed.chatMessages || []).map((m: any) => [m.id, m]));
            latestParsed.chatMessages.forEach((m: any) => {
              if (!currentChatMap.has(m.id)) {
                currentChatMap.set(m.id, m);
              }
            });
            parsed.chatMessages = Array.from(currentChatMap.values());
          }

          if (Array.isArray(latestParsed.attendanceRecords) && latestParsed.attendanceRecords.length > 0) {
            const currentAttMap = new Map<string, any>((parsed.attendanceRecords || []).map((a: any) => [a.id || `${a.memberId}_${a.date}`, a]));
            latestParsed.attendanceRecords.forEach((a: any) => {
              const key = a.id || `${a.memberId}_${a.date}`;
              currentAttMap.set(key, { ...(currentAttMap.get(key) || {}), ...a });
            });
            parsed.attendanceRecords = Array.from(currentAttMap.values());
          }

          if (Array.isArray(latestParsed.meetings) && latestParsed.meetings.length > 0) {
            const currentMeetMap = new Map<string, any>((parsed.meetings || []).map((m: any) => [m.id, m]));
            latestParsed.meetings.forEach((m: any) => {
              if (m && m.id) {
                currentMeetMap.set(m.id, { ...(currentMeetMap.get(m.id) || {}), ...m });
              }
            });
            parsed.meetings = Array.from(currentMeetMap.values());
          }

          if (Array.isArray(latestParsed.leads) && latestParsed.leads.length > 0) {
            const currentLeadMap = new Map<string, any>((parsed.leads || []).map((l: any) => [l.id, l]));
            latestParsed.leads.forEach((l: any) => {
              if (l && l.id) {
                currentLeadMap.set(l.id, { ...(currentLeadMap.get(l.id) || {}), ...l });
              }
            });
            parsed.leads = Array.from(currentLeadMap.values());
          }
        } catch {}
      }

      parsed.chatMessages = Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [];
      parsed.chatChannels = Array.isArray(parsed.chatChannels) ? parsed.chatChannels : [];
      parsed.attendanceRecords = Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : [];
      parsed.meetings = Array.isArray(parsed.meetings) ? parsed.meetings : [];
      parsed.leads = Array.isArray(parsed.leads) ? parsed.leads : [];

      // Guarantee Amira's meeting ("gx monthly report" on 2026-11-04 at 12:00 for موقع gx, host: هدير سعيد) is present
      const hasGxReport = parsed.meetings.some((m: any) => m.id === 'meet-gx-report' || (m.title && m.title.toLowerCase().includes('gx monthly report')));
      if (!hasGxReport) {
        parsed.meetings.unshift({
          id: 'meet-gx-report',
          title: 'gx monthly report',
          meetingType: 'client',
          date: '2026-11-04',
          time: '12:00',
          startTime: '12:00',
          endTime: '12:45',
          duration: '45 دقيقة',
          locationType: 'online',
          location: 'موقع gx',
          meetingLink: 'https://meet.google.com/gx-monthly-report',
          hostId: 'user-1',
          hostName: 'هدير سعيد',
          attendees: ['user-1', 'user-amira', 'user-2', 'user-3'],
          clientAttendees: ['مسؤول موقع gx'],
          clientId: 'ren-1793022923682',
          clientName: 'موقع gx',
          companyName: 'موقع gx',
          agenda: '1. مراجعة تقرير أداء موقع gx الشهري\n2. تدقيق التقرير الشهري ونتائج الزيارات والتحويلات\n3. مراجعة خطة العمل للشهر القادم واعتمادها',
          summary: 'تقرير شهري مفصل لموقع gx واستعراض نتائج الحملات والزيارات والطلبات.',
          decisions: 'تقديم التوصيات التقنية والتسويقية لفريق gx واعتماد خطة الربع القادم.',
          notes: 'اجتماع هام لمراجعة تقرير gx الشهري ومناقشة مؤشرات الأداء.',
          status: 'قادم',
          reminderMinutes: [60, 30, 15, 0],
          alarmSoundEnabled: true,
          createdBy: 'Amira',
          creatorId: 'user-amira',
          createdAt: '2026-11-02T10:00:00Z'
        });
      }

      // Normalize Mariam and Islam canonical identity across attendance records
      parsed.attendanceRecords = parsed.attendanceRecords.map((a: any) => {
        const mid = (a.memberId || '').toLowerCase();
        if (mid === 'user-1793097751331' || mid === 'user-1793016396281' || mid === 'mariam') {
          a.memberId = 'user-mariam';
          a.employeeCode = a.employeeCode || 'SM-106';
        }
        if (mid === 'user-1793025675186' || mid === 'user-1793016178916' || mid === 'islam') {
          a.memberId = 'user-islam';
          a.employeeCode = a.employeeCode || 'SM-108';
        }
        return a;
      });

      // Normalize Islam and Mariam canonical identity & sanitize task integrity
      if (Array.isArray(parsed.tasks)) {
        parsed.tasks = parsed.tasks.map((t: any) => {
          if (!t) return t;
          const aid = (t.assignedToId || '').toLowerCase();
          if (aid === 'user-1793025675186' || aid === 'user-1793016178916' || aid === 'islam') {
            t.assignedToId = 'user-islam';
          }
          if (aid === 'user-1793097751331' || aid === 'user-1793016396281' || aid === 'mariam') {
            t.assignedToId = 'user-mariam';
          }

          // Roaa task "3 مقالات الكشفيه" finished after midnight - ensure permanently marked completed
          if (t.id === 'task-1793483150403' || (t.title && t.title.includes('3 مقالات الكشفيه') && t.assignedToId === 'user-roaa')) {
            t.status = 'completed';
            t.completedAt = t.completedAt || '2026-11-04';
            t.isTimerRunning = false;
            t.isTimerPaused = false;
            delete t.timerStartedAt;
            delete t.timerLastResumedAt;
            t.timerAccumulatedMs = 0;
            if ((t.totalLoggedMinutes || 0) < 60) {
              t.totalLoggedMinutes = 90;
            }
          }

          return sanitizeTaskIntegrity(t);
        });
      }

      // Only keep primary admin protected from deletion list
      if (Array.isArray(parsed.deletedTeamMemberIds)) {
        parsed.deletedTeamMemberIds = parsed.deletedTeamMemberIds.filter(
          (id: string) => id !== 'user-1'
        );
      }
      const delMemberIdsSet = new Set<string>([
        ...(parsed.deletedTeamMemberIds || []),
        'user-1793097751331' // Always keep duplicate SM-109 account deleted
      ]);

      // Normalize team members and strictly exclude deleted members
      if (Array.isArray(parsed.team)) {
        // Strip out permanently deleted member IDs and duplicate SM-109 account
        parsed.team = parsed.team.filter((m: any) => !delMemberIdsSet.has(m.id) && m.id !== 'user-1793097751331');

        const islamInTeam = parsed.team.find((m: any) => m.id === 'user-islam' || (m.username || '').toLowerCase() === 'islam');
        if (islamInTeam) {
          islamInTeam.id = 'user-islam';
          islamInTeam.username = 'Islam';
          islamInTeam.employeeCode = 'SM-108';
          islamInTeam.name = 'Islam';
          islamInTeam.role = 'Video Editor';
          // Filter out temporary duplicate entries
          parsed.team = parsed.team.filter((m: any) => m.id !== 'user-1793025675186' && m.id !== 'user-1793016178916');
        }

        let mariamInTeam = parsed.team.find((m: any) => m.id === 'user-mariam' || (m.username || '').toLowerCase() === 'mariam');
        if (mariamInTeam && !delMemberIdsSet.has(mariamInTeam.id)) {
          mariamInTeam.id = 'user-mariam';
          mariamInTeam.username = 'Mariam';
          mariamInTeam.name = 'Mariam';
          mariamInTeam.role = 'Web Developer';
          mariamInTeam.department = 'التطوير والتقنية';
          mariamInTeam.employeeCode = 'SM-106';
        }
        // Filter out duplicate IDs for Mariam and any deleted members
        parsed.team = parsed.team.filter((m: any) => !delMemberIdsSet.has(m.id) && m.id !== 'user-1793097751331' && m.id !== 'user-1793016396281');

        // Roaa isolation & normalization
        let roaaInTeam = parsed.team.find((m: any) => m.id === 'user-roaa' || (m.username || '').toLowerCase() === 'roaa_hetemy' || (m.username || '').toLowerCase() === 'roaa');
        if (!roaaInTeam) {
          roaaInTeam = {
            id: 'user-roaa',
            name: 'رواء',
            username: 'roaa_hetemy',
            role: 'Content Creator',
            department: 'صناع المحتوى',
            employeeCode: 'SM-109',
            phone: '01011223344',
            email: 'roaa@swiftmynd.com',
            joinedDate: '2026-03-01',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            password: 'Sw!ftzg2scMrcNA'
          };
          parsed.team.push(roaaInTeam);
        } else {
          roaaInTeam.id = 'user-roaa';
          roaaInTeam.name = 'رواء';
          roaaInTeam.username = 'roaa_hetemy';
          roaaInTeam.role = 'Content Creator';
          roaaInTeam.department = 'صناع المحتوى';
          roaaInTeam.employeeCode = 'SM-109';
        }
      }

      if (Array.isArray(parsed.clientRenewals)) {
        parsed.clientRenewals = cleanClientRenewals(parsed.clientRenewals);
      }

      // Filter permanently deleted marketing cards and lists
      const delMarketingCards = new Set<string>(parsed.deletedMarketingCardIds || []);
      const delMarketingLists = new Set<string>(parsed.deletedMarketingListIds || []);
      if (Array.isArray(parsed.marketingBoards)) {
        parsed.marketingBoards = parsed.marketingBoards
          .filter((b: any) => !delMarketingLists.has(b.id))
          .map((b: any) => ({
            ...b,
            lists: (b.lists || [])
              .filter((l: any) => !delMarketingLists.has(l.id))
              .map((l: any) => ({
                ...l,
                cards: (l.cards || []).filter((c: any) => !delMarketingCards.has(c.id))
              }))
          }));
      }
      parsed.team = sanitizeTeam(parsed.team || []);
      return parsed;
    } catch (e) {
      console.error('[SWIFTMYND] Error reading data store:', e);
    }
    return {};
  }

  // Safe file writer to both data-store and latest-data
  function saveData(data: any): boolean {
    try {
      data.updatedAt = new Date().toISOString();
      if (Array.isArray(data.team)) {
        data.team = sanitizeTeam(data.team);
      }
      const serialized = JSON.stringify(data, null, 2);
      fs.writeFileSync(DATA_FILE, serialized, 'utf-8');
      fs.writeFileSync(LATEST_FILE, serialized, 'utf-8');
      return true;
    } catch (e) {
      console.error('[SWIFTMYND] Error writing data store:', e);
      return false;
    }
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server-Sent Events (SSE) Live Stream for 0ms Real-Time Multi-Device Sync
  app.get('/api/live-sync', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    res.write('retry: 2000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Keep-alive heartbeat for SSE every 20 seconds
  setInterval(() => {
    for (const client of sseClients) {
      try {
        client.write(': ping\n\n');
      } catch {
        sseClients.delete(client);
      }
    }
  }, 20000);

  // Get full synchronized data
  app.get('/api/data', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json(data);
    } catch (err: any) {
      console.error('Error in GET /api/data:', err);
      return res.status(500).json({ error: 'Failed to read data' });
    }
  });

  // Get tasks, renewals, notifications, and attendance (lightweight endpoint for fast polling across all devices)
  app.get('/api/tasks', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        tasks: data.tasks || [],
        deletedTasks: data.deletedTasks || [],
        notifications: data.notifications || [],
        team: data.team || [],
        clientRenewals: data.clientRenewals || [],
        leads: data.leads || [],
        attendanceRecords: data.attendanceRecords || [],
        meetings: data.meetings || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get tasks' });
    }
  });

  // Get Attendance Records specifically (for fast zero-latency polling & refresh across Mobile & PC)
  app.get('/api/attendance', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        attendanceRecords: data.attendanceRecords || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get attendance records' });
    }
  });

  // Atomic Attendance Check-In / Check-Out / Mutation (Instant cross-device 0ms broadcast)
  app.post('/api/attendance', (req, res) => {
    try {
      const { record, records } = req.body;
      const current = readCurrentData();
      let list: any[] = current.attendanceRecords || [];
      const attMap = new Map<string, any>(list.map((r: any) => [r.id || `${r.memberId}_${r.date}`, r]));

      const itemsToMerge = Array.isArray(records) ? records : (record ? [record] : []);
      if (itemsToMerge.length === 0) {
        return res.status(400).json({ error: 'record or records required' });
      }

      itemsToMerge.forEach((rec: any) => {
        if (!rec) return;
        // Normalize member ID if Mariam or Islam
        const mid = (rec.memberId || '').toLowerCase();
        if (mid === 'user-1793097751331' || mid === 'user-1793016396281' || mid === 'mariam') {
          rec.memberId = 'user-mariam';
          rec.employeeCode = rec.employeeCode || 'SM-106';
        }
        if (mid === 'user-1793025675186' || mid === 'user-1793016178916' || mid === 'islam') {
          rec.memberId = 'user-islam';
          rec.employeeCode = rec.employeeCode || 'SM-108';
        }

        // Primary key lookup by id OR by (memberId + date) OR (employeeCode + date)
        const primaryKey = rec.id || `${rec.memberId}_${rec.date}`;
        let matchedKey = primaryKey;
        for (const [key, existing] of attMap.entries()) {
          if (
            (rec.id && existing.id === rec.id) ||
            (existing.memberId === rec.memberId && existing.date === rec.date) ||
            (existing.employeeCode && rec.employeeCode && existing.employeeCode === rec.employeeCode && existing.date === rec.date)
          ) {
            matchedKey = key;
            break;
          }
        }

        const existing = attMap.get(matchedKey) || {};
        const mergedItem = {
          ...existing,
          ...rec,
          id: existing.id || rec.id || ('att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
          updatedAt: new Date().toISOString()
        };
        attMap.set(matchedKey, mergedItem);
      });

      current.attendanceRecords = Array.from(attMap.values());
      saveData(current);
      console.log(`[SWIFTMYND] Attendance synced across devices: ${itemsToMerge.length} record(s)`);

      broadcastLiveSync({
        type: 'ATTENDANCE_MUTATION',
        record: record || itemsToMerge[0],
        attendanceRecords: current.attendanceRecords,
        updatedAt: current.updatedAt
      });

      return res.json({
        success: true,
        record: record || itemsToMerge[0],
        attendanceRecords: current.attendanceRecords,
        updatedAt: current.updatedAt
      });
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      return res.status(500).json({ error: 'Failed to save attendance' });
    }
  });

  // Atomic Attendance Delete
  app.delete('/api/attendance/:id', (req, res) => {
    try {
      const recordId = req.params.id;
      if (!recordId) return res.status(400).json({ error: 'recordId required' });

      const current = readCurrentData();
      current.attendanceRecords = (current.attendanceRecords || []).filter((r: any) => r.id !== recordId);
      saveData(current);

      broadcastLiveSync({
        type: 'ATTENDANCE_MUTATION',
        attendanceRecords: current.attendanceRecords,
        deletedId: recordId,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, recordId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete attendance record' });
    }
  });

  // Get Client Renewals specifically
  app.get('/api/renewals', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        clientRenewals: data.clientRenewals || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get client renewals' });
    }
  });

  // Atomic Client Renewal Create or Update (Instant sync between Admin & Team members)
  app.post('/api/renewals', (req, res) => {
    try {
      const { renewal, clientRenewals: fullList } = req.body;
      const current = readCurrentData();

      if (Array.isArray(fullList)) {
        current.clientRenewals = cleanClientRenewals(fullList);
      } else if (renewal && renewal.id) {
        if (!MOCK_DEMO_CLIENT_IDS.has(renewal.id) && !MOCK_DEMO_CLIENT_NAMES.has((renewal.clientName || '').trim())) {
          const existing: any[] = cleanClientRenewals(current.clientRenewals || []);
          const idx = existing.findIndex(r => r.id === renewal.id);
          if (idx >= 0) {
            existing[idx] = { ...existing[idx], ...renewal };
          } else {
            existing.unshift(renewal);
          }
          current.clientRenewals = existing;
        }
      } else {
        return res.status(400).json({ error: 'renewal or clientRenewals array required' });
      }

      saveData(current);
      console.log(`[SWIFTMYND] Client renewal synced: ${renewal?.clientName || 'list updated'}`);

      broadcastLiveSync({
        type: 'RENEWAL_MUTATION',
        clientRenewals: current.clientRenewals,
        updatedAt: current.updatedAt
      });

      return res.json({
        success: true,
        clientRenewals: current.clientRenewals,
        updatedAt: current.updatedAt
      });
    } catch (err) {
      console.error('Error saving client renewal:', err);
      return res.status(500).json({ error: 'Failed to save renewal' });
    }
  });

  // Atomic Client Renewal Delete
  app.post('/api/renewals/delete', (req, res) => {
    try {
      const { renewalId, id } = req.body;
      const targetId = renewalId || id;
      if (!targetId) return res.status(400).json({ error: 'renewalId required' });

      const current = readCurrentData();
      current.clientRenewals = (current.clientRenewals || []).filter((r: any) => r.id !== targetId);
      saveData(current);

      broadcastLiveSync({
        type: 'RENEWAL_MUTATION',
        clientRenewals: current.clientRenewals,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, renewalId: targetId });
    } catch (err) {
      console.error('Error deleting client renewal:', err);
      return res.status(500).json({ error: 'Failed to delete renewal' });
    }
  });

  // ==================== LEADS API (Instant Multi-Device Sync for Sales & Admin) ====================
  // Get Leads
  app.get('/api/leads', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        leads: data.leads || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get leads' });
    }
  });

  // Atomic Lead Create or Update (Instant sync between Maibel, Sales, and Admin)
  app.post('/api/leads', (req, res) => {
    try {
      const { lead, leads: fullList, notifications, activity } = req.body;
      const current = readCurrentData();
      let list: any[] = current.leads || [];

      if (Array.isArray(fullList)) {
        list = fullList;
      } else if (lead && lead.id) {
        const idx = list.findIndex((l: any) => l.id === lead.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...lead, updatedAt: new Date().toISOString() };
        } else {
          list.unshift({ ...lead, createdAt: lead.createdAt || new Date().toISOString().split('T')[0] });
        }
      } else {
        return res.status(400).json({ error: 'lead or leads array required' });
      }

      current.leads = list;

      // Merge notifications if provided
      if (Array.isArray(notifications) && notifications.length > 0) {
        const notifMap = new Map((current.notifications || []).map((n: any) => [n.id, n]));
        notifications.forEach((n: any) => notifMap.set(n.id, n));
        current.notifications = Array.from(notifMap.values()).slice(0, 150);
      }

      // Merge activity if provided
      if (activity && activity.id) {
        current.activities = [activity, ...(current.activities || [])].slice(0, 100);
      }

      saveData(current);
      console.log(`[SWIFTMYND] Lead synced immediately: "${lead?.name || 'list'}" (${lead?.company || ''}) across all screens`);

      broadcastLiveSync({
        type: 'LEAD_MUTATION',
        lead: lead || list[0],
        leads: current.leads,
        notifications: current.notifications,
        updatedAt: current.updatedAt
      });

      return res.json({
        success: true,
        lead: lead || list[0],
        leadsCount: current.leads.length,
        updatedAt: current.updatedAt
      });
    } catch (err) {
      console.error('Error saving lead:', err);
      return res.status(500).json({ error: 'Failed to save lead' });
    }
  });

  // Atomic Lead Delete
  app.post('/api/leads/delete', (req, res) => {
    try {
      const { leadId, id } = req.body;
      const targetId = leadId || id;
      if (!targetId) return res.status(400).json({ error: 'leadId required' });

      const current = readCurrentData();
      current.leads = (current.leads || []).filter((l: any) => l.id !== targetId);
      saveData(current);

      broadcastLiveSync({
        type: 'LEAD_MUTATION',
        deletedLeadId: targetId,
        leads: current.leads,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, leadId: targetId, remaining: current.leads.length });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
  });

  app.delete('/api/leads/:id', (req, res) => {
    try {
      const targetId = req.params.id;
      if (!targetId) return res.status(400).json({ error: 'leadId required' });

      const current = readCurrentData();
      current.leads = (current.leads || []).filter((l: any) => l.id !== targetId);
      saveData(current);

      broadcastLiveSync({
        type: 'LEAD_MUTATION',
        deletedLeadId: targetId,
        leads: current.leads,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, leadId: targetId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
  });

  // ==================== MEETINGS API (Instant Multi-Device Sync across Admin & Employees) ====================
  // Get Meetings specifically
  app.get('/api/meetings', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        meetings: data.meetings || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get meetings' });
    }
  });

  // Atomic Meeting Create or Update (Instant sync between Amira, Admin, and all mentioned attendees)
  app.post('/api/meetings', (req, res) => {
    try {
      const { meeting, meetings: fullList, notifications } = req.body;
      const current = readCurrentData();
      let list: any[] = current.meetings || [];

      if (Array.isArray(fullList)) {
        list = fullList;
      } else if (meeting && meeting.id) {
        const idx = list.findIndex((m: any) => m.id === meeting.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...meeting, updatedAt: new Date().toISOString() };
        } else {
          list.unshift({ ...meeting, createdAt: meeting.createdAt || new Date().toISOString() });
        }
      } else {
        return res.status(400).json({ error: 'meeting or meetings array required' });
      }

      current.meetings = list;

      // Merge notifications if provided
      if (Array.isArray(notifications) && notifications.length > 0) {
        const notifMap = new Map((current.notifications || []).map((n: any) => [n.id, n]));
        notifications.forEach((n: any) => notifMap.set(n.id, n));
        current.notifications = Array.from(notifMap.values()).slice(0, 150);
      }

      saveData(current);
      console.log(`[SWIFTMYND] Meeting synced immediately: "${meeting?.title || 'list'}" across all screens`);

      broadcastLiveSync({
        type: 'MEETING_MUTATION',
        meeting: meeting || list[0],
        meetings: current.meetings,
        notifications: current.notifications,
        updatedAt: current.updatedAt
      });

      return res.json({
        success: true,
        meeting: meeting || list[0],
        meetingsCount: current.meetings.length,
        updatedAt: current.updatedAt
      });
    } catch (err) {
      console.error('Error saving meeting:', err);
      return res.status(500).json({ error: 'Failed to save meeting' });
    }
  });

  // Atomic Meeting Delete
  app.post('/api/meetings/delete', (req, res) => {
    try {
      const { meetingId, id } = req.body;
      const targetId = meetingId || id;
      if (!targetId) return res.status(400).json({ error: 'meetingId required' });

      const current = readCurrentData();
      current.meetings = (current.meetings || []).filter((m: any) => m.id !== targetId);
      saveData(current);

      broadcastLiveSync({
        type: 'MEETING_MUTATION',
        deletedMeetingId: targetId,
        meetings: current.meetings,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, meetingId: targetId, remaining: current.meetings.length });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete meeting' });
    }
  });

  app.delete('/api/meetings/:id', (req, res) => {
    try {
      const targetId = req.params.id;
      if (!targetId) return res.status(400).json({ error: 'meetingId required' });

      const current = readCurrentData();
      current.meetings = (current.meetings || []).filter((m: any) => m.id !== targetId);
      saveData(current);

      broadcastLiveSync({
        type: 'MEETING_MUTATION',
        deletedMeetingId: targetId,
        meetings: current.meetings,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, meetingId: targetId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete meeting' });
    }
  });

  // Atomic Marketing Card Deletion (Instant sync and persistence across refreshes)
  app.post('/api/marketing/delete-card', (req, res) => {
    try {
      const { cardId } = req.body;
      if (!cardId) return res.status(400).json({ error: 'cardId required' });

      const current = readCurrentData();
      const deletedSet = new Set(current.deletedMarketingCardIds || []);
      deletedSet.add(cardId);
      current.deletedMarketingCardIds = Array.from(deletedSet);

      if (Array.isArray(current.marketingBoards)) {
        current.marketingBoards = current.marketingBoards.map((b: any) => ({
          ...b,
          lists: (b.lists || []).map((l: any) => ({
            ...l,
            cards: (l.cards || []).filter((c: any) => c.id !== cardId)
          }))
        }));
      }

      saveData(current);
      console.log(`[SWIFTMYND] Marketing card permanently deleted: ${cardId}`);

      broadcastLiveSync({
        type: 'MARKETING_MUTATION',
        deletedMarketingCardIds: current.deletedMarketingCardIds,
        marketingBoards: current.marketingBoards,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, cardId });
    } catch (err) {
      console.error('Error deleting marketing card:', err);
      return res.status(500).json({ error: 'Failed to delete marketing card' });
    }
  });

  // Atomic Marketing List Deletion
  app.post('/api/marketing/delete-list', (req, res) => {
    try {
      const { boardId, listId, cardIds } = req.body;
      if (!listId) return res.status(400).json({ error: 'listId required' });

      const current = readCurrentData();
      const deletedListSet = new Set(current.deletedMarketingListIds || []);
      deletedListSet.add(listId);
      current.deletedMarketingListIds = Array.from(deletedListSet);

      const deletedCardSet = new Set(current.deletedMarketingCardIds || []);
      if (Array.isArray(cardIds)) {
        cardIds.forEach((cid: string) => deletedCardSet.add(cid));
      }
      current.deletedMarketingCardIds = Array.from(deletedCardSet);

      if (Array.isArray(current.marketingBoards)) {
        current.marketingBoards = current.marketingBoards.map((b: any) => {
          if (boardId && b.id !== boardId) return b;
          return {
            ...b,
            lists: (b.lists || []).filter((l: any) => l.id !== listId)
          };
        });
      }

      saveData(current);
      console.log(`[SWIFTMYND] Marketing list permanently deleted: ${listId}`);

      broadcastLiveSync({
        type: 'MARKETING_MUTATION',
        deletedMarketingListIds: current.deletedMarketingListIds,
        deletedMarketingCardIds: current.deletedMarketingCardIds,
        marketingBoards: current.marketingBoards,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, listId });
    } catch (err) {
      console.error('Error deleting marketing list:', err);
      return res.status(500).json({ error: 'Failed to delete marketing list' });
    }
  });

  // Atomic Team Member Deletion (Instant sync and persistence across refreshes)
  app.delete('/api/team/:id', (req, res) => {
    try {
      const memberId = req.params.id;
      if (!memberId) return res.status(400).json({ error: 'memberId required' });

      // Only primary admin account cannot be deleted
      if (memberId === 'user-1' || memberId === 'user-admin') {
        return res.status(403).json({ error: 'Cannot delete primary admin account' });
      }

      const current = readCurrentData();
      const teamList: any[] = current.team || [];
      current.team = teamList.filter((m: any) => m.id !== memberId && m.employeeCode !== memberId && m.id !== 'user-1');

      const deletedSet = new Set(current.deletedTeamMemberIds || []);
      deletedSet.add(memberId);
      if (memberId === 'user-1793097751331' || memberId === 'SM-109') {
        deletedSet.add('user-1793097751331');
      }
      current.deletedTeamMemberIds = Array.from(deletedSet);

      saveData(current);
      console.log(`[SWIFTMYND] Team member permanently deleted: ${memberId}`);

      broadcastLiveSync({
        type: 'TEAM_MUTATION',
        team: current.team,
        deletedTeamMemberIds: current.deletedTeamMemberIds,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, memberId, remaining: current.team.length });
    } catch (err) {
      console.error('Error deleting team member:', err);
      return res.status(500).json({ error: 'Failed to delete team member' });
    }
  });

  // Atomic Task Creation or Update (Instant sync between Manager & Employee devices)
  app.post('/api/tasks', (req, res) => {
    try {
      const { task, notifications, activity } = req.body;
      if (!task || !task.id) {
        return res.status(400).json({ error: 'Task and Task ID are required' });
      }

      const current = readCurrentData();
      const existingTasks: any[] = current.tasks || [];
      const deletedSet = new Set((current.deletedTasks || []).map((t: any) => t.id));

      // Remove from deleted if re-created
      deletedSet.delete(task.id);
      current.deletedTasks = (current.deletedTasks || []).filter((t: any) => t.id !== task.id);

      // Check if task exists to update or prepend with completed protection
      const incomingTask = sanitizeTaskIntegrity({ ...task });
      if (!incomingTask.updatedAt) {
        incomingTask.updatedAt = new Date().toISOString();
      }

      const existingIndex = existingTasks.findIndex(t => t.id === incomingTask.id);
      if (existingIndex >= 0) {
        const existing = sanitizeTaskIntegrity(existingTasks[existingIndex]);
        const mergedTask = mergeTaskIntegrity(existing, incomingTask);
        existingTasks[existingIndex] = mergedTask;
      } else {
        existingTasks.unshift(incomingTask);
      }
      current.tasks = existingTasks.map(sanitizeTaskIntegrity);

      // Merge notifications if any
      if (Array.isArray(notifications) && notifications.length > 0) {
        const notifMap = new Map((current.notifications || []).map((n: any) => [n.id, n]));
        notifications.forEach((n: any) => notifMap.set(n.id, n));
        current.notifications = Array.from(notifMap.values()).slice(0, 150);
      }

      // Merge activity if any
      if (activity && activity.id) {
        current.activities = [activity, ...(current.activities || [])].slice(0, 100);
      }

      saveData(current);
      console.log(`[SWIFTMYND] Task synced immediately: "${task.title}" (Assigned: ${task.assignedToId})`);

      // Broadcast immediately to all connected devices in 0ms
      broadcastLiveSync({
        type: 'TASK_MUTATION',
        task,
        tasks: current.tasks,
        deletedTasks: current.deletedTasks,
        notifications: current.notifications,
        updatedAt: current.updatedAt
      });

      return res.json({
        success: true,
        task,
        tasksCount: current.tasks.length,
        updatedAt: current.updatedAt
      });
    } catch (err: any) {
      console.error('Error saving task:', err);
      return res.status(500).json({ error: 'Failed to save task' });
    }
  });

  // Atomic Task Delete (Instant broadcast across all manager & employee screens)
  app.post('/api/tasks/delete', (req, res) => {
    try {
      const { taskId, task } = req.body;
      if (!taskId) return res.status(400).json({ error: 'taskId required' });

      const current = readCurrentData();
      const tasks: any[] = current.tasks || [];
      const target = tasks.find((t: any) => t.id === taskId) || task || { id: taskId, title: 'مهمة محذوفة' };

      current.tasks = tasks.filter((t: any) => t.id !== taskId);
      
      const existingDeleted = (current.deletedTasks || []).filter((t: any) => t.id !== taskId);
      current.deletedTasks = [{ ...target, completedAt: target.completedAt || new Date().toISOString() }, ...existingDeleted];
      saveData(current);
      console.log(`[SWIFTMYND] Task deleted and broadcasted: "${taskId}"`);

      broadcastLiveSync({
        type: 'TASK_MUTATION',
        tasks: current.tasks,
        deletedTasks: current.deletedTasks,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, taskId, remainingTasks: current.tasks.length });
    } catch (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // REST DELETE /api/tasks/:id
  app.delete('/api/tasks/:id', (req, res) => {
    try {
      const taskId = req.params.id;
      if (!taskId) return res.status(400).json({ error: 'taskId required' });

      const current = readCurrentData();
      const tasks: any[] = current.tasks || [];
      const target = tasks.find((t: any) => t.id === taskId) || { id: taskId, title: 'مهمة محذوفة' };

      current.tasks = tasks.filter((t: any) => t.id !== taskId);
      const existingDeleted = (current.deletedTasks || []).filter((t: any) => t.id !== taskId);
      current.deletedTasks = [{ ...target, completedAt: target.completedAt || new Date().toISOString() }, ...existingDeleted];
      saveData(current);

      broadcastLiveSync({
        type: 'TASK_MUTATION',
        tasks: current.tasks,
        deletedTasks: current.deletedTasks,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, taskId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // Bulk Delete Tasks
  app.post('/api/tasks/delete-bulk', (req, res) => {
    try {
      const { taskIds } = req.body;
      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ error: 'taskIds array required' });
      }

      const current = readCurrentData();
      const tasks: any[] = current.tasks || [];
      const idSet = new Set(taskIds);

      const toDelete = tasks.filter((t: any) => idSet.has(t.id));
      current.tasks = tasks.filter((t: any) => !idSet.has(t.id));
      
      const existingDeleted = (current.deletedTasks || []).filter((t: any) => !idSet.has(t.id));
      current.deletedTasks = [...toDelete, ...existingDeleted];
      saveData(current);

      broadcastLiveSync({
        type: 'TASK_MUTATION',
        tasks: current.tasks,
        deletedTasks: current.deletedTasks,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, deletedCount: taskIds.length });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to bulk delete tasks' });
    }
  });

  // Restore Task from Trash
  app.post('/api/tasks/restore', (req, res) => {
    try {
      const { taskId } = req.body;
      if (!taskId) return res.status(400).json({ error: 'taskId required' });

      const current = readCurrentData();
      const deletedList: any[] = current.deletedTasks || [];
      const target = deletedList.find((t: any) => t.id === taskId);

      if (target) {
        current.deletedTasks = deletedList.filter((t: any) => t.id !== taskId);
        current.tasks = [target, ...(current.tasks || []).filter((t: any) => t.id !== taskId)];
        saveData(current);

        broadcastLiveSync({
          type: 'TASK_MUTATION',
          tasks: current.tasks,
          deletedTasks: current.deletedTasks,
          updatedAt: current.updatedAt
        });
      }

      return res.json({ success: true, taskId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to restore task' });
    }
  });

  // Atomic Task Comment & Mention sync
  app.post('/api/tasks/comment', (req, res) => {
    try {
      const { taskId, comment, notifications } = req.body;
      if (!taskId || !comment) return res.status(400).json({ error: 'taskId and comment required' });

      const current = readCurrentData();
      const tasks: any[] = current.tasks || [];
      const taskIndex = tasks.findIndex(t => t.id === taskId);

      if (taskIndex >= 0) {
        const target = tasks[taskIndex];
        const comments = target.comments || [];
        target.comments = [...comments, comment];
        tasks[taskIndex] = target;
        current.tasks = tasks;

        if (Array.isArray(notifications) && notifications.length > 0) {
          const notifMap = new Map((current.notifications || []).map((n: any) => [n.id, n]));
          notifications.forEach((n: any) => notifMap.set(n.id, n));
          current.notifications = Array.from(notifMap.values()).slice(0, 150);
        }

        saveData(current);

        broadcastLiveSync({
          type: 'TASK_MUTATION',
          tasks: current.tasks,
          notifications: current.notifications,
          updatedAt: current.updatedAt
        });
      }

      return res.json({ success: true, taskId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to add comment' });
    }
  });

  // ==================== TEAM CHAT API (Real-time Cross-Device Sync) ====================
  // Helper to compare user IDs canonical aliases
  function isSameUserId(idA?: string | null, idB?: string | null): boolean {
    if (!idA || !idB) return false;
    if (idA === idB) return true;
    const a = idA.trim().toLowerCase();
    const b = idB.trim().toLowerCase();
    if (a === b) return true;

    const aliases: Record<string, string[]> = {
      'user-mariam': ['user-mariam', 'user-1793097751331', 'user-1793016396281', 'mariam', 'مريم'],
      'user-islam': ['user-islam', 'user-1793025675186', 'user-1793016178916', 'islam', 'اسلام', 'إسلام'],
      'user-roaa': ['user-roaa', 'user-1793016462810', 'roaa', 'رواء'],
      'user-eman': ['user-eman', 'eman', 'eman ashraf', 'ايمان', 'إيمان'],
      'user-aya': ['user-aya', 'user-1793016503819', 'aya', 'aya gaber', 'آية', 'ايه', 'آيه'],
      'user-yomna': ['user-yomna', 'yomna', 'يمنى', 'يمنه'],
      'user-amira': ['user-amira', 'amira', 'اميرة', 'أميرة', 'اميره'],
      'user-1': ['user-1', 'user-admin', 'hadeer', 'hadeer said', 'هدير', 'هدير سعيد', 'admin']
    };

    for (const list of Object.values(aliases)) {
      if (list.includes(a) && list.includes(b)) return true;
    }
    return false;
  }

  // Get Chat Messages and Channels
  app.get('/api/chat', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        messages: data.chatMessages || [],
        channels: data.chatChannels || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      console.error('Error in GET /api/chat:', err);
      return res.status(500).json({ error: 'Failed to read chat data' });
    }
  });

  // Send a new Chat Message with Instant Live SSE Broadcast across all devices
  app.post('/api/chat', (req, res) => {
    try {
      const { message } = req.body;
      if (!message || !message.id || (!message.text && (!message.attachments || message.attachments.length === 0))) {
        return res.status(400).json({ error: 'Valid chat message required' });
      }

      const current = readCurrentData();
      const messages: any[] = current.chatMessages || [];

      // Ensure status and readBy defaults
      message.status = message.status || 'sent';
      if (!Array.isArray(message.readBy) || message.readBy.length === 0) {
        message.readBy = [message.senderId];
      }

      // Avoid duplicates
      const existingIdx = messages.findIndex((m: any) => m.id === message.id);
      if (existingIdx >= 0) {
        messages[existingIdx] = { ...messages[existingIdx], ...message };
      } else {
        messages.push(message);
      }

      current.chatMessages = messages;
      saveData(current);
      console.log(`[SWIFTMYND] Chat message broadcast: "${message.senderName}" -> "${message.channelId || message.recipientId}"`);

      // Broadcast immediately to all connected browsers in 0ms
      broadcastLiveSync({
        type: 'CHAT_MESSAGE',
        message,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, message });
    } catch (err: any) {
      console.error('Error saving chat message:', err);
      return res.status(500).json({ error: 'Failed to save chat message' });
    }
  });

  // Mark chat messages as read by reader with instant SSE broadcast
  app.post('/api/chat/read', (req, res) => {
    try {
      const { readerId, targetId, channelId } = req.body;
      if (!readerId || !targetId) {
        return res.status(400).json({ error: 'readerId and targetId are required' });
      }

      const current = readCurrentData();
      const messages: any[] = current.chatMessages || [];
      const updatedIds: string[] = [];
      const readAt = new Date().toISOString();

      messages.forEach((msg: any) => {
        // Channel message
        if (channelId || msg.channelId === targetId) {
          if (!Array.isArray(msg.readBy)) msg.readBy = [msg.senderId];
          const alreadyRead = msg.readBy.some((u: string) => isSameUserId(u, readerId));
          if (!alreadyRead) {
            msg.readBy.push(readerId);
            msg.status = 'read';
            msg.readAt = msg.readAt || readAt;
            updatedIds.push(msg.id);
          }
        } else if (!msg.channelId) {
          // Direct 1-on-1 message: from target to reader
          const isFromTargetToReader =
            isSameUserId(msg.senderId, targetId) && isSameUserId(msg.recipientId, readerId);
          if (isFromTargetToReader) {
            if (!Array.isArray(msg.readBy)) msg.readBy = [msg.senderId];
            const alreadyRead = msg.readBy.some((u: string) => isSameUserId(u, readerId));
            if (!alreadyRead) {
              msg.readBy.push(readerId);
              msg.status = 'read';
              msg.readAt = msg.readAt || readAt;
              updatedIds.push(msg.id);
            }
          }
        }
      });

      if (updatedIds.length > 0) {
        current.chatMessages = messages;
        saveData(current);
        console.log(`[SWIFTMYND] Chat messages marked read by "${readerId}" for target "${targetId}": ${updatedIds.length} messages`);

        broadcastLiveSync({
          type: 'CHAT_MESSAGES_READ',
          readerId,
          targetId,
          messageIds: updatedIds,
          readAt,
          updatedAt: current.updatedAt
        });
      }

      return res.json({ success: true, updatedCount: updatedIds.length, updatedIds });
    } catch (err: any) {
      console.error('Error in /api/chat/read:', err);
      return res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  });

  // Toggle reaction on a chat message
  app.post('/api/chat/reaction', (req, res) => {
    try {
      const { messageId, reactions } = req.body;
      if (!messageId) return res.status(400).json({ error: 'messageId required' });

      const current = readCurrentData();
      const messages: any[] = current.chatMessages || [];
      const msg = messages.find((m: any) => m.id === messageId);
      if (msg) {
        msg.reactions = reactions;
        saveData(current);

        broadcastLiveSync({
          type: 'CHAT_REACTION',
          messageId,
          reactions,
          updatedAt: current.updatedAt
        });
      }

      return res.json({ success: true, messageId, reactions });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update reaction' });
    }
  });

  // Delete chat message
  app.post('/api/chat/delete', (req, res) => {
    try {
      const { messageId } = req.body;
      if (!messageId) return res.status(400).json({ error: 'messageId required' });

      const current = readCurrentData();
      current.chatMessages = (current.chatMessages || []).filter((m: any) => m.id !== messageId);
      saveData(current);

      broadcastLiveSync({
        type: 'CHAT_DELETE',
        messageId,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true, messageId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete message' });
    }
  });

  // Clear chat (Admin / User)
  app.post('/api/chat/clear', (req, res) => {
    try {
      const { channelId, directPairKey } = req.body;
      const current = readCurrentData();

      if (channelId) {
        current.chatMessages = (current.chatMessages || []).filter((m: any) => m.channelId !== channelId);
      } else if (directPairKey) {
        const [id1, id2] = directPairKey.split('__');
        current.chatMessages = (current.chatMessages || []).filter((m: any) => {
          if (m.channelId) return true;
          return !(
            (m.senderId === id1 && m.recipientId === id2) ||
            (m.senderId === id2 && m.recipientId === id1)
          );
        });
      } else {
        current.chatMessages = [];
      }

      saveData(current);

      broadcastLiveSync({
        type: 'CHAT_CLEAR',
        channelId,
        directPairKey,
        updatedAt: current.updatedAt
      });

      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to clear chat' });
    }
  });

  // Self-Service Profile Update endpoint for all authenticated users (Employees and Admin)
  app.post('/api/profile', (req, res) => {
    try {
      const { memberId, username, updates } = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Updates object required' });
      }

      const current = readCurrentData();
      const teamList: any[] = current.team || [];
      const targetIndex = teamList.findIndex(
        (m: any) =>
          (memberId && (m.id === memberId || (m.id === 'user-islam' && (memberId === 'user-1793025675186' || memberId === 'user-1793016178916')))) ||
          (username && (m.username || '').toLowerCase() === (username || '').toLowerCase())
      );

      if (targetIndex >= 0) {
        const existing = teamList[targetIndex];
        const updatedMember = { ...existing, ...updates };
        teamList[targetIndex] = updatedMember;
        current.team = teamList;

        // If avatar was updated, propagate to all tasks assigned to this user
        if (updates.avatar) {
          const tasksList: any[] = current.tasks || [];
          current.tasks = tasksList.map((t: any) => {
            if (
              t.assignedToId === existing.id ||
              (existing.id === 'user-islam' && (t.assignedToId === 'user-islam' || t.assignedToId === 'Islam'))
            ) {
              return { ...t, assigneeAvatar: updates.avatar };
            }
            return t;
          });
        }

        saveData(current);
        console.log(`[SWIFTMYND] Profile updated permanently for: ${updatedMember.name} (${updatedMember.id})`);

        broadcastLiveSync({
          type: 'TEAM_MUTATION',
          team: current.team,
          tasks: current.tasks,
          updatedAt: current.updatedAt
        });

        return res.json({ success: true, member: updatedMember, updatedAt: current.updatedAt });
      }

      return res.status(404).json({ error: 'Team member not found' });
    } catch (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Save / Sync full synchronized data with SMART MERGE (prevents cross-device data wiping)
  app.post('/api/data', (req, res) => {
    try {
      const incoming = req.body;
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const currentData = readCurrentData();

      // Safe non-destructive task merge: preserve existing tasks and update with incoming changes
      const currentTasks: any[] = currentData.tasks || [];
      const incomingTasks: any[] = Array.isArray(incoming.tasks) ? incoming.tasks : [];
      const explicitDeletedSet = new Set<string>([
        ...((currentData.deletedTasks || []).map((t: any) => t.id)),
        ...((incoming.deletedTasks || []).map((t: any) => t.id))
      ]);

      const mergedTasks = mergeTasksListIntegrity(
        (currentTasks || []).filter((t: any) => !explicitDeletedSet.has(t.id)),
        (incomingTasks || []).filter((t: any) => !explicitDeletedSet.has(t.id)),
        explicitDeletedSet
      );

      // Smart merge notifications: union by ID, newest first
      const notifMap = new Map<string, any>();
      (currentData.notifications || []).forEach((n: any) => notifMap.set(n.id, n));
      (incoming.notifications || []).forEach((n: any) => notifMap.set(n.id, n));
      const mergedNotifications = Array.from(notifMap.values()).slice(0, 150);

      // Smart merge team: incoming team array from admin represents active team members.
      const deletedMemberIds = new Set([
        ...((currentData.deletedTeamMemberIds || [])),
        ...((incoming.deletedTeamMemberIds || [])),
        'user-1793097751331'
      ]);
      let mergedTeam = currentData.team || [];
      if (Array.isArray(incoming.team)) {
        mergedTeam = incoming.team.filter((m: any) => !deletedMemberIds.has(m.id) && m.id !== 'user-1793097751331');
      } else {
        mergedTeam = mergedTeam.filter((m: any) => !deletedMemberIds.has(m.id) && m.id !== 'user-1793097751331');
      }
      mergedTeam = sanitizeTeam(mergedTeam);

      // Smart merge client renewals: preserve completed monthly tasks
      let mergedRenewals = cleanClientRenewals(currentData.clientRenewals || []);
      if (Array.isArray(incoming.clientRenewals)) {
        const currentRenMap = new Map<string, any>(mergedRenewals.map((r: any) => [r.id, r]));
        const mergedList = incoming.clientRenewals.map((incRen: any) => {
          const currRen = currentRenMap.get(incRen.id);
          if (!currRen) return incRen;
          const currTasksMap = new Map<string, any>((currRen.monthlyTasks || []).map((mt: any) => [mt.id, mt]));
          const mergedMonthlyTasks = (incRen.monthlyTasks || []).map((incTask: any) => {
            const currTask = currTasksMap.get(incTask.id);
            if (currTask && currTask.completed && !incTask.completed && !incTask.explicitStatusRevert) {
              return {
                ...incTask,
                completed: true,
                completedAt: currTask.completedAt || new Date().toISOString().split('T')[0],
                completedByName: currTask.completedByName
              };
            }
            return incTask;
          });
          return { ...currRen, ...incRen, monthlyTasks: mergedMonthlyTasks };
        });
        mergedRenewals = cleanClientRenewals(mergedList);
      }

      // Smart merge marketing deleted items and boards
      const deletedMarketingCardIds = Array.from(new Set([
        ...((currentData.deletedMarketingCardIds || [])),
        ...((incoming.deletedMarketingCardIds || []))
      ]));
      const deletedMarketingListIds = Array.from(new Set([
        ...((currentData.deletedMarketingListIds || [])),
        ...((incoming.deletedMarketingListIds || []))
      ]));
      const delCardSet = new Set(deletedMarketingCardIds);
      const delListSet = new Set(deletedMarketingListIds);

      let mergedMarketingBoards = incoming.marketingBoards || currentData.marketingBoards || [];
      if (Array.isArray(mergedMarketingBoards)) {
        mergedMarketingBoards = mergedMarketingBoards
          .filter((b: any) => !delListSet.has(b.id))
          .map((b: any) => ({
            ...b,
            lists: (b.lists || [])
              .filter((l: any) => !delListSet.has(l.id))
              .map((l: any) => ({
                ...l,
                cards: (l.cards || []).filter((c: any) => !delCardSet.has(c.id))
              }))
          }));
      }

      // Smart merge attendance records: preserve existing, update or append incoming
      let mergedAttendance = currentData.attendanceRecords || [];
      if (Array.isArray(incoming.attendanceRecords)) {
        const attMap = new Map<string, any>(mergedAttendance.map((a: any) => [a.id || `${a.memberId}_${a.date}`, a]));
        incoming.attendanceRecords.forEach((a: any) => {
          if (!a) return;
          const key = a.id || `${a.memberId}_${a.date}`;
          attMap.set(key, { ...(attMap.get(key) || {}), ...a });
        });
        mergedAttendance = Array.from(attMap.values());
      }

      // Smart merge meetings: union by ID
      let mergedMeetings = currentData.meetings || [];
      if (Array.isArray(incoming.meetings)) {
        const meetMap = new Map<string, any>(mergedMeetings.map((m: any) => [m.id, m]));
        incoming.meetings.forEach((m: any) => {
          if (m && m.id) {
            meetMap.set(m.id, { ...(meetMap.get(m.id) || {}), ...m });
          }
        });
        mergedMeetings = Array.from(meetMap.values());
      }

      // Smart merge leads: union by ID
      let mergedLeads = currentData.leads || [];
      if (Array.isArray(incoming.leads)) {
        const leadMap = new Map<string, any>(mergedLeads.map((l: any) => [l.id, l]));
        incoming.leads.forEach((l: any) => {
          if (l && l.id) {
            leadMap.set(l.id, { ...(leadMap.get(l.id) || {}), ...l });
          }
        });
        mergedLeads = Array.from(leadMap.values());
      }

      const merged = {
        ...currentData,
        ...incoming,
        tasks: mergedTasks,
        notifications: mergedNotifications,
        team: mergedTeam,
        deletedTeamMemberIds: Array.from(deletedMemberIds),
        clientRenewals: mergedRenewals,
        leads: mergedLeads,
        attendanceRecords: mergedAttendance,
        meetings: mergedMeetings,
        deletedTasks: Array.from(explicitDeletedSet).map(id => ({ id })),
        deletedMarketingCardIds,
        deletedMarketingListIds,
        marketingBoards: mergedMarketingBoards
      };

      saveData(merged);

      broadcastLiveSync({
        type: 'FULL_SYNC',
        tasks: mergedTasks,
        notifications: mergedNotifications,
        team: mergedTeam,
        clientRenewals: mergedRenewals,
        leads: mergedLeads,
        attendanceRecords: mergedAttendance,
        meetings: mergedMeetings,
        updatedAt: merged.updatedAt
      });

      return res.json({ success: true, timestamp: merged.updatedAt, tasksCount: mergedTasks.length });
    } catch (err: any) {
      console.error('Error saving shared data store:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SWIFTMYND] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
