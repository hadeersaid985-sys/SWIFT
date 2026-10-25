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

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get full synchronized data
  app.get('/api/data', (_req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return res.json(JSON.parse(raw));
      }
      if (fs.existsSync(LATEST_FILE)) {
        const raw = fs.readFileSync(LATEST_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Save initial snapshot to data-store
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        return res.json(parsed);
      }
      return res.json({});
    } catch (err: any) {
      console.error('Error reading shared data store:', err);
      return res.status(500).json({ error: 'Failed to read data' });
    }
  });

  // Save / Sync full synchronized data
  app.post('/api/data', (req, res) => {
    try {
      const incoming = req.body;
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      let currentData: any = {};
      if (fs.existsSync(DATA_FILE)) {
        try {
          currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch {}
      }

      const merged = {
        ...currentData,
        ...incoming,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
      return res.json({ success: true, timestamp: merged.updatedAt });
    } catch (err: any) {
      console.error('Error saving shared data store:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // Add or update task specifically
  app.post('/api/tasks/sync', (req, res) => {
    try {
      const { tasks, deletedTasks } = req.body;
      let currentData: any = {};
      if (fs.existsSync(DATA_FILE)) {
        try {
          currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch {}
      }

      currentData.tasks = tasks || currentData.tasks || [];
      if (deletedTasks) {
        currentData.deletedTasks = deletedTasks;
      }
      currentData.updatedAt = new Date().toISOString();

      fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2), 'utf-8');
      return res.json({ success: true, tasksCount: currentData.tasks.length });
    } catch (err: any) {
      console.error('Error syncing tasks:', err);
      return res.status(500).json({ error: 'Failed to sync tasks' });
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
