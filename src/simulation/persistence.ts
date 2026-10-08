import { S, replaceState } from "./state.js";
import { decodeProgress, encodeProgress } from "./snapshot.js";
import { subscribe } from "./events.js";

// Retain the original storage key so ROADSHOW resumes existing local progress.
const DATABASE = "nexus-ghost-route";
const STORE = "progress";
let database: Promise<IDBDatabase> | undefined;
let writes = Promise.resolve();
let pending: ReturnType<typeof setTimeout> | undefined;
export const progressStatus = { state: "loading", savedAt: "", error: "" };

function status(state: string, error = "") {
  progressStatus.state = state;
  progressStatus.error = error;
  document.documentElement.dataset.progress = state;
}

function openDatabase() {
  return (database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    const timeout = setTimeout(
      () => reject(new Error("Local storage did not respond.")),
      1500,
    );
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => {
      clearTimeout(timeout);
      resolve(request.result);
    };
    request.onerror = () => {
      clearTimeout(timeout);
      reject(request.error ?? new Error("Local storage is unavailable."));
    };
    request.onblocked = () => {
      clearTimeout(timeout);
      reject(new Error("Close another game tab to unlock local storage."));
    };
  }));
}

export async function loadProgress() {
  try {
    const db = await openDatabase();
    const text = await new Promise<string | undefined>((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get("current");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (text) replaceState(decodeProgress(text));
    status(text ? "saved" : "new");
    return !!text;
  } catch (error) {
    status("error", (error as Error).message);
    return false;
  }
}

/** Snapshots capture call order; IndexedDB writes never run on the render loop. */
export function saveProgress() {
  clearTimeout(pending);
  pending = undefined;
  const text = encodeProgress(S);
  status("saving");
  const write = writes
    .catch(() => {})
    .then(async () => {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE, "readwrite");
        transaction.objectStore(STORE).put(text, "current");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Save was interrupted."));
      });
      progressStatus.savedAt = new Date().toISOString();
      status("saved");
    })
    .catch((error) => {
      status("error", (error as Error).message);
    });
  writes = write;
  return write;
}

export function scheduleSave() {
  status("saving");
  clearTimeout(pending);
  pending = setTimeout(() => void saveProgress(), 150);
}

export function registerPersistence() {
  subscribe(scheduleSave);
  // Checkpoint movement without serializing the world every frame.
  let position = `${S.x},${S.y}`;
  setInterval(() => {
    const next = `${S.x},${S.y}`;
    if (next !== position && S.started) {
      position = next;
      scheduleSave();
    }
  }, 2000);
  window.addEventListener("pagehide", () => {
    if (S.started) void saveProgress();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && S.started) void saveProgress();
  });
}
