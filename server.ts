import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

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

  // Safe file reader with fallback
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
      if (Array.isArray(parsed.clientRenewals)) {
        parsed.clientRenewals = cleanClientRenewals(parsed.clientRenewals);
      }
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

  // Get tasks, renewals and notifications (lightweight endpoint for fast polling across all devices)
  app.get('/api/tasks', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        tasks: data.tasks || [],
        deletedTasks: data.deletedTasks || [],
        notifications: data.notifications || [],
        team: data.team || [],
        clientRenewals: data.clientRenewals || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get tasks' });
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

  // Atomic Team Member Deletion (Instant sync and persistence across refreshes)
  app.delete('/api/team/:id', (req, res) => {
    try {
      const memberId = req.params.id;
      if (!memberId) return res.status(400).json({ error: 'memberId required' });

      const current = readCurrentData();
      const teamList: any[] = current.team || [];
      current.team = teamList.filter((m: any) => m.id !== memberId && m.id !== 'user-1');

      const deletedSet = new Set(current.deletedTeamMemberIds || []);
      deletedSet.add(memberId);
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

      // Check if task exists to update or prepend
      const existingIndex = existingTasks.findIndex(t => t.id === task.id);
      if (existingIndex >= 0) {
        existingTasks[existingIndex] = { ...existingTasks[existingIndex], ...task };
      } else {
        existingTasks.unshift(task);
      }
      current.tasks = existingTasks;

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

  // Save / Sync full synchronized data with SMART MERGE (prevents cross-device data wiping)
  app.post('/api/data', (req, res) => {
    try {
      const incoming = req.body;
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const currentData = readCurrentData();

      // Smart merge tasks: incoming tasks from manager represent the active tasks.
      // Any server task that is missing from incoming.tasks was deleted by the user!
      const currentTasks: any[] = currentData.tasks || [];
      const incomingTasks: any[] = Array.isArray(incoming.tasks) ? incoming.tasks : [];
      const deletedTaskIds = new Set([
        ...((currentData.deletedTasks || []).map((t: any) => t.id)),
        ...((incoming.deletedTasks || []).map((t: any) => t.id))
      ]);

      if (Array.isArray(incoming.tasks)) {
        const incomingIdSet = new Set(incoming.tasks.map((t: any) => t.id));
        currentTasks.forEach((t: any) => {
          if (!incomingIdSet.has(t.id)) {
            deletedTaskIds.add(t.id);
            if (!currentData.deletedTasks?.some((d: any) => d.id === t.id)) {
              currentData.deletedTasks = [{ ...t, completedAt: t.completedAt || new Date().toISOString() }, ...(currentData.deletedTasks || [])];
            }
          }
        });
      }

      const tasksMap = new Map<string, any>();
      // Incoming tasks from the user take absolute precedence
      incomingTasks.forEach(t => {
        if (!deletedTaskIds.has(t.id)) {
          tasksMap.set(t.id, t);
        }
      });
      // Fallback only if incoming.tasks was not provided
      if (!Array.isArray(incoming.tasks)) {
        currentTasks.forEach(t => {
          if (!deletedTaskIds.has(t.id)) {
            tasksMap.set(t.id, t);
          }
        });
      }
      const mergedTasks = Array.from(tasksMap.values());

      // Smart merge notifications: union by ID, newest first
      const notifMap = new Map<string, any>();
      (currentData.notifications || []).forEach((n: any) => notifMap.set(n.id, n));
      (incoming.notifications || []).forEach((n: any) => notifMap.set(n.id, n));
      const mergedNotifications = Array.from(notifMap.values()).slice(0, 150);

      // Smart merge team: incoming team array from admin represents active team members.
      const deletedMemberIds = new Set([
        ...((currentData.deletedTeamMemberIds || [])),
        ...((incoming.deletedTeamMemberIds || []))
      ]);
      let mergedTeam = currentData.team || [];
      if (Array.isArray(incoming.team)) {
        mergedTeam = incoming.team.filter((m: any) => !deletedMemberIds.has(m.id));
      } else {
        mergedTeam = mergedTeam.filter((m: any) => !deletedMemberIds.has(m.id));
      }

      // Smart merge client renewals: incoming clientRenewals from admin take precedence
      let mergedRenewals = cleanClientRenewals(currentData.clientRenewals || []);
      if (Array.isArray(incoming.clientRenewals)) {
        mergedRenewals = cleanClientRenewals(incoming.clientRenewals);
      }

      const merged = {
        ...currentData,
        ...incoming,
        tasks: mergedTasks,
        notifications: mergedNotifications,
        team: mergedTeam,
        deletedTeamMemberIds: Array.from(deletedMemberIds),
        clientRenewals: mergedRenewals,
        deletedTasks: Array.from(deletedTaskIds).map(id => ({ id }))
      };

      saveData(merged);

      broadcastLiveSync({
        type: 'FULL_SYNC',
        tasks: mergedTasks,
        notifications: mergedNotifications,
        team: mergedTeam,
        clientRenewals: mergedRenewals,
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
