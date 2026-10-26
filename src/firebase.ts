import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Task, AppNotification } from './types/crm';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network status.');
    }
  }
}
testConnection();

// Collection references
const TASKS_COLLECTION = 'tasks';
const DELETED_TASKS_COLLECTION = 'deletedTasks';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Save / Update a task in Firestore in real-time
 */
export async function saveTaskToFirestore(task: Task): Promise<void> {
  if (!task || !task.id) return;
  try {
    const taskRef = doc(db, TASKS_COLLECTION, task.id);
    const cleanPayload: any = { ...task };
    // Remove undefined values to avoid Firestore errors
    Object.keys(cleanPayload).forEach(key => {
      if (cleanPayload[key] === undefined) {
        delete cleanPayload[key];
      }
    });
    cleanPayload.updatedAt = new Date().toISOString();
    await setDoc(taskRef, cleanPayload, { merge: true });

    // Also remove from deletedTasks if present
    try {
      const delRef = doc(db, DELETED_TASKS_COLLECTION, task.id);
      await deleteDoc(delRef);
    } catch {}
  } catch (error) {
    console.error('[Firebase] Error saving task to Firestore:', error);
  }
}

/**
 * Delete a task in Firestore and move to deletedTasks
 */
export async function deleteTaskFromFirestore(taskId: string, taskData?: Task): Promise<void> {
  if (!taskId) return;
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);

    if (taskData) {
      const delRef = doc(db, DELETED_TASKS_COLLECTION, taskId);
      const cleanPayload: any = {
        ...taskData,
        completedAt: taskData.completedAt || new Date().toISOString(),
        deletedAt: new Date().toISOString()
      };
      Object.keys(cleanPayload).forEach(key => {
        if (cleanPayload[key] === undefined) {
          delete cleanPayload[key];
        }
      });
      await setDoc(delRef, cleanPayload, { merge: true });
    }
  } catch (error) {
    console.error('[Firebase] Error deleting task from Firestore:', error);
  }
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasksFromFirestore(taskIds: string[], tasksList: Task[]): Promise<void> {
  if (!Array.isArray(taskIds) || taskIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    taskIds.forEach(id => {
      const tRef = doc(db, TASKS_COLLECTION, id);
      batch.delete(tRef);
      const existing = tasksList.find(t => t.id === id);
      if (existing) {
        const dRef = doc(db, DELETED_TASKS_COLLECTION, id);
        batch.set(dRef, { ...existing, deletedAt: new Date().toISOString() }, { merge: true });
      }
    });
    await batch.commit();
  } catch (error) {
    console.error('[Firebase] Error bulk deleting tasks:', error);
  }
}

/**
 * Restore a task from trash
 */
export async function restoreTaskInFirestore(taskId: string, taskData: Task): Promise<void> {
  if (!taskId) return;
  try {
    const delRef = doc(db, DELETED_TASKS_COLLECTION, taskId);
    await deleteDoc(delRef);

    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await setDoc(taskRef, { ...taskData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('[Firebase] Error restoring task:', error);
  }
}

/**
 * Real-time listener for tasks across all devices
 */
export function onTasksSnapshot(onUpdate: (tasks: Task[]) => void, onError?: (err: any) => void) {
  try {
    const q = collection(db, TASKS_COLLECTION);
    return onSnapshot(
      q,
      snapshot => {
        const tasks: Task[] = [];
        snapshot.forEach(docSnap => {
          tasks.push(docSnap.data() as Task);
        });
        onUpdate(tasks);
      },
      err => {
        console.warn('[Firebase] Tasks onSnapshot listener warning:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('[Firebase] Failed to bind tasks listener:', err);
    return () => {};
  }
}

/**
 * Real-time listener for deleted tasks
 */
export function onDeletedTasksSnapshot(onUpdate: (tasks: Task[]) => void) {
  try {
    const q = collection(db, DELETED_TASKS_COLLECTION);
    return onSnapshot(
      q,
      snapshot => {
        const delTasks: Task[] = [];
        snapshot.forEach(docSnap => {
          delTasks.push(docSnap.data() as Task);
        });
        onUpdate(delTasks);
      },
      err => {
        console.warn('[Firebase] DeletedTasks onSnapshot notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Save notification to Firestore
 */
export async function saveNotificationToFirestore(notification: AppNotification): Promise<void> {
  if (!notification || !notification.id) return;
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
    const cleanPayload: any = { ...notification };
    Object.keys(cleanPayload).forEach(key => {
      if (cleanPayload[key] === undefined) delete cleanPayload[key];
    });
    await setDoc(notifRef, cleanPayload, { merge: true });
  } catch (error) {
    console.error('[Firebase] Error saving notification:', error);
  }
}

/**
 * Real-time listener for notifications
 */
export function onNotificationsSnapshot(onUpdate: (notifications: AppNotification[]) => void) {
  try {
    const q = collection(db, NOTIFICATIONS_COLLECTION);
    return onSnapshot(
      q,
      snapshot => {
        const notifs: AppNotification[] = [];
        snapshot.forEach(docSnap => {
          notifs.push(docSnap.data() as AppNotification);
        });
        onUpdate(notifs);
      },
      err => console.warn('[Firebase] Notifications notice:', err)
    );
  } catch {
    return () => {};
  }
}

/**
 * Seed initial tasks to Firestore if collection is empty
 */
export async function seedInitialTasksIfEmpty(initialTasks: Task[]): Promise<void> {
  try {
    const colRef = collection(db, TASKS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty && Array.isArray(initialTasks) && initialTasks.length > 0) {
      console.log('[Firebase] Seeding initial tasks to Firestore...');
      const batch = writeBatch(db);
      initialTasks.forEach(task => {
        const tRef = doc(db, TASKS_COLLECTION, task.id);
        const clean: any = { ...task };
        Object.keys(clean).forEach(k => {
          if (clean[k] === undefined) delete clean[k];
        });
        batch.set(tRef, clean);
      });
      await batch.commit();
      console.log('[Firebase] Seeded tasks successfully!');
    }
  } catch (err) {
    console.warn('[Firebase] Seeding check notice:', err);
  }
}
