import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const BACKUP_DIR = path.join(process.cwd(), 'backup');
  const DATA_FILE = path.join(BACKUP_DIR, 'data-store.json');
  const LATEST_FILE = path.join(BACKUP_DIR, 'latest-data.json');

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Safe file reader with fallback
  function readCurrentData(): any {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
      if (fs.existsSync(LATEST_FILE)) {
        const raw = fs.readFileSync(LATEST_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        return parsed;
      }
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

  // Get tasks and notifications specifically (lightweight endpoint for fast polling)
  app.get('/api/tasks', (_req, res) => {
    try {
      const data = readCurrentData();
      return res.json({
        tasks: data.tasks || [],
        deletedTasks: data.deletedTasks || [],
        notifications: data.notifications || [],
        team: data.team || [],
        updatedAt: data.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get tasks' });
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

  // Atomic Task Delete
  app.post('/api/tasks/delete', (req, res) => {
    try {
      const { taskId } = req.body;
      if (!taskId) return res.status(400).json({ error: 'taskId required' });

      const current = readCurrentData();
      const tasks = current.tasks || [];
      const target = tasks.find((t: any) => t.id === taskId);

      if (target) {
        current.tasks = tasks.filter((t: any) => t.id !== taskId);
        current.deletedTasks = [target, ...(current.deletedTasks || [])];
        saveData(current);
      }

      return res.json({ success: true, taskId });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
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

      // Smart merge tasks: do not delete server tasks unless they are explicitly in incoming.deletedTasks!
      const currentTasks: any[] = currentData.tasks || [];
      const incomingTasks: any[] = Array.isArray(incoming.tasks) ? incoming.tasks : [];
      const deletedTaskIds = new Set([
        ...((currentData.deletedTasks || []).map((t: any) => t.id)),
        ...((incoming.deletedTasks || []).map((t: any) => t.id))
      ]);

      const tasksMap = new Map<string, any>();
      // First populate server tasks
      currentTasks.forEach(t => {
        if (!deletedTaskIds.has(t.id)) {
          tasksMap.set(t.id, t);
        }
      });
      // Then merge incoming tasks
      incomingTasks.forEach(t => {
        if (!deletedTaskIds.has(t.id)) {
          const existing = tasksMap.get(t.id);
          tasksMap.set(t.id, existing ? { ...existing, ...t } : t);
        }
      });
      const mergedTasks = Array.from(tasksMap.values());

      // Smart merge notifications: union by ID, newest first
      const notifMap = new Map<string, any>();
      (currentData.notifications || []).forEach((n: any) => notifMap.set(n.id, n));
      (incoming.notifications || []).forEach((n: any) => notifMap.set(n.id, n));
      const mergedNotifications = Array.from(notifMap.values()).slice(0, 150);

      // Smart merge team: union by ID
      const teamMap = new Map<string, any>();
      (currentData.team || []).forEach((m: any) => teamMap.set(m.id, m));
      (incoming.team || []).forEach((m: any) => {
        const existing = teamMap.get(m.id);
        teamMap.set(m.id, existing ? { ...existing, ...m } : m);
      });
      const mergedTeam = Array.from(teamMap.values());

      const merged = {
        ...currentData,
        ...incoming,
        tasks: mergedTasks,
        notifications: mergedNotifications,
        team: mergedTeam.length > 0 ? mergedTeam : currentData.team,
        deletedTasks: Array.from(deletedTaskIds).map(id => ({ id }))
      };

      saveData(merged);
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
