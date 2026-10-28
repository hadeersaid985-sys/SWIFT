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
import { Task, AppNotification, ClientRenewal, ChatMessage, TeamMember } from './types/crm';

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
const CLIENT_RENEWALS_COLLECTION = 'clientRenewals';

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

/**
 * Save / Update a ClientRenewal in Firestore in real-time
 */
export async function saveClientRenewalToFirestore(renewal: ClientRenewal): Promise<void> {
  if (!renewal || !renewal.id) return;
  try {
    const renRef = doc(db, CLIENT_RENEWALS_COLLECTION, renewal.id);
    const cleanPayload: any = { ...renewal };
    Object.keys(cleanPayload).forEach(key => {
      if (cleanPayload[key] === undefined) {
        delete cleanPayload[key];
      }
    });
    cleanPayload.updatedAt = new Date().toISOString();
    await setDoc(renRef, cleanPayload, { merge: true });
  } catch (error) {
    console.error('[Firebase] Error saving client renewal to Firestore:', error);
  }
}

/**
 * Delete a ClientRenewal in Firestore
 */
export async function deleteClientRenewalFromFirestore(renewalId: string): Promise<void> {
  if (!renewalId) return;
  try {
    const renRef = doc(db, CLIENT_RENEWALS_COLLECTION, renewalId);
    await deleteDoc(renRef);
  } catch (error) {
    console.error('[Firebase] Error deleting client renewal from Firestore:', error);
  }
}

/**
 * Real-time listener for ClientRenewals across all devices
 */
export function onClientRenewalsSnapshot(onUpdate: (renewals: ClientRenewal[]) => void) {
  try {
    const q = collection(db, CLIENT_RENEWALS_COLLECTION);
    return onSnapshot(
      q,
      snapshot => {
        const list: ClientRenewal[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as ClientRenewal);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      err => console.warn('[Firebase] Client renewals notice:', err)
    );
  } catch {
    return () => {};
  }
}

const CHAT_MESSAGES_COLLECTION = 'teamChatMessages';

/**
 * Save / Send a chat message to Firestore in real-time
 */
export async function saveChatMessageToFirestore(msg: ChatMessage): Promise<void> {
  if (!msg || !msg.id) return;
  try {
    const msgRef = doc(db, CHAT_MESSAGES_COLLECTION, msg.id);
    const cleanPayload: any = { ...msg };
    Object.keys(cleanPayload).forEach(key => {
      if (cleanPayload[key] === undefined) {
        delete cleanPayload[key];
      }
    });
    cleanPayload.updatedAt = new Date().toISOString();
    await setDoc(msgRef, cleanPayload, { merge: true });
  } catch (error) {
    console.error('[Firebase] Error saving chat message to Firestore:', error);
  }
}

/**
 * Delete a chat message in Firestore
 */
export async function deleteChatMessageFromFirestore(msgId: string): Promise<void> {
  if (!msgId) return;
  try {
    const msgRef = doc(db, CHAT_MESSAGES_COLLECTION, msgId);
    await deleteDoc(msgRef);
  } catch (error) {
    console.error('[Firebase] Error deleting chat message from Firestore:', error);
  }
}

/**
 * Real-time listener for Chat Messages across all team members & devices
 */
export function onChatMessagesSnapshot(onUpdate: (messages: ChatMessage[]) => void) {
  try {
    const q = collection(db, CHAT_MESSAGES_COLLECTION);
    return onSnapshot(
      q,
      snapshot => {
        const list: ChatMessage[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as ChatMessage);
        });
        // Sort chronologically
        list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        onUpdate(list);
      },
      err => console.warn('[Firebase] Chat messages notice:', err)
    );
  } catch {
    return () => {};
  }
}

/**
 * Seed initial chat messages if Firestore collection is empty
 */
export async function seedInitialChatMessagesIfEmpty(initialMsgs: ChatMessage[]): Promise<void> {
  try {
    if (!initialMsgs || initialMsgs.length === 0) return;
    const q = collection(db, CHAT_MESSAGES_COLLECTION);
    const snap = await getDocs(q);
    if (snap.empty) {
      const batch = writeBatch(db);
      initialMsgs.forEach(m => {
        const mRef = doc(db, CHAT_MESSAGES_COLLECTION, m.id);
        const clean: any = { ...m };
        Object.keys(clean).forEach(k => {
          if (clean[k] === undefined) delete clean[k];
        });
        batch.set(mRef, clean);
      });
      await batch.commit();
      console.log('[Firebase] Seeded chat messages successfully!');
    }
  } catch (err) {
    console.warn('[Firebase] Chat messages seeding check notice:', err);
  }
}

/**
 * Purge any demo chat messages (pre-seeded placeholders) from Firestore
 */
export async function purgeDemoChatMessagesFromFirestore(): Promise<void> {
  try {
    const q = collection(db, CHAT_MESSAGES_COLLECTION);
    const snap = await getDocs(q);
    if (!snap.empty) {
      const demoMsgIds = new Set([
        'msg-gen-1', 'msg-gen-2', 'msg-gen-3', 'msg-gen-4',
        'msg-sal-1', 'msg-sal-2',
        'msg-tech-1',
        'msg-ann-1',
        'dm-1', 'dm-2', 'dm-3', 'dm-4'
      ]);

      const batch = writeBatch(db);
      let count = 0;
      snap.forEach(docSnap => {
        const id = docSnap.id;
        const isDemo =
          demoMsgIds.has(id) ||
          id.startsWith('msg-gen-') ||
          id.startsWith('msg-sal-') ||
          id.startsWith('msg-tech-') ||
          id.startsWith('msg-ann-') ||
          (id.startsWith('dm-') && id.length <= 8);

        if (isDemo) {
          batch.delete(docSnap.ref);
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
        console.log(`[Firebase] Purged ${count} demo chat messages from Firestore.`);
      }
    }
  } catch (err) {
    console.warn('[Firebase] Purge demo chat messages notice:', err);
  }
}

/**
 * Clear all chat messages from Firestore (for Admin chat reset)
 */
export async function clearAllChatMessagesFromFirestore(): Promise<void> {
  try {
    const q = collection(db, CHAT_MESSAGES_COLLECTION);
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      console.log('[Firebase] Cleared all chat messages from Firestore.');
    }
  } catch (err) {
    console.warn('[Firebase] Clear all chat messages notice:', err);
  }
}

const TEAM_COLLECTION = 'teamMembers';

/**
 * Save / Update a Team Member in Firestore database in real-time
 */
export async function saveTeamMemberToFirestore(member: TeamMember): Promise<void> {
  if (!member || !member.id) return;
  try {
    const memberRef = doc(db, TEAM_COLLECTION, member.id);
    const cleanPayload: any = { ...member };
    Object.keys(cleanPayload).forEach(key => {
      if (cleanPayload[key] === undefined) {
        delete cleanPayload[key];
      }
    });
    cleanPayload.updatedAt = new Date().toISOString();
    await setDoc(memberRef, cleanPayload, { merge: true });
    console.log(`[Firebase] Team member ${member.name} (${member.id}) saved to Firestore successfully with updated password`);
  } catch (error) {
    console.error('[Firebase] Error saving team member to Firestore:', error);
  }
}

/**
 * Specifically save new password to Firestore database
 */
export async function saveTeamPasswordToFirestore(memberId: string, newPassword: string): Promise<void> {
  if (!memberId || !newPassword) return;
  try {
    const memberRef = doc(db, TEAM_COLLECTION, memberId);
    await setDoc(
      memberRef,
      {
        id: memberId,
        password: newPassword.trim(),
        passwordUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    console.log(`[Firebase] Password updated in Firestore database for member: ${memberId}`);
  } catch (error) {
    console.error('[Firebase] Error saving new password to Firestore:', error);
  }
}

/**
 * Real-time listener for Team Members and Passwords across all devices
 */
export function onTeamMembersSnapshot(onUpdate: (team: TeamMember[]) => void) {
  try {
    const q = collection(db, TEAM_COLLECTION);
    return onSnapshot(
      q,
      snapshot => {
        const list: TeamMember[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as TeamMember);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      err => console.warn('[Firebase] Team members notice:', err)
    );
  } catch {
    return () => {};
  }
}

/**
 * Seed initial team members to Firestore if collection is empty
 */
export async function seedInitialTeamIfEmpty(initialTeam: TeamMember[]): Promise<void> {
  try {
    const colRef = collection(db, TEAM_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty && Array.isArray(initialTeam) && initialTeam.length > 0) {
      console.log('[Firebase] Seeding initial team members to Firestore...');
      const batch = writeBatch(db);
      initialTeam.forEach(m => {
        const mRef = doc(db, TEAM_COLLECTION, m.id);
        const clean: any = { ...m };
        Object.keys(clean).forEach(k => {
          if (clean[k] === undefined) delete clean[k];
        });
        clean.updatedAt = new Date().toISOString();
        batch.set(mRef, clean);
      });
      await batch.commit();
      console.log('[Firebase] Seeded team members to Firestore successfully!');
    }
  } catch (err) {
    console.warn('[Firebase] Team seeding check notice:', err);
  }
}
