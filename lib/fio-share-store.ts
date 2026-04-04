import crypto from "crypto";
import fs from "fs";
import path from "path";

export type FioShareState = {
  surname: string;
  name: string;
  patronymic?: string;
  slug: string;
  fioDisplay: string;
};

type ShareEntry = {
  fioState: FioShareState;
  createdAt: string;
  expiresAt: string;
};

type ShareStore = Record<string, ShareEntry>;

const STORE_PATH = path.join(process.cwd(), "data", "fio-share-store.json");
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function ensureStoreDir() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
}

function readStore(): ShareStore {
  ensureStoreDir();
  if (!fs.existsSync(STORE_PATH)) return {};

  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as ShareStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(data: ShareStore) {
  ensureStoreDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function cleanupExpired(store: ShareStore) {
  const now = Date.now();
  let changed = false;

  for (const [token, entry] of Object.entries(store)) {
    if (new Date(entry.expiresAt).getTime() <= now) {
      delete store[token];
      changed = true;
    }
  }

  if (changed) writeStore(store);
}

export function createFioShare(fioState: FioShareState, createdAt?: string) {
  const store = readStore();
  cleanupExpired(store);

  const token = crypto.randomUUID();
  const created = createdAt ? new Date(createdAt) : new Date();
  const expiresAt = new Date(created.getTime() + DEFAULT_TTL_MS);

  store[token] = {
    fioState,
    createdAt: created.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  writeStore(store);

  return {
    token,
    expiresAt: expiresAt.toISOString(),
  };
}

export function getFioShare(token: string) {
  const store = readStore();
  cleanupExpired(store);

  const entry = store[token];
  if (!entry) return null;

  if (new Date(entry.expiresAt).getTime() <= Date.now()) {
    delete store[token];
    writeStore(store);
    return null;
  }

  return entry;
}
