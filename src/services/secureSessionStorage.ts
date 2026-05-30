import * as SecureStore from "expo-secure-store";
import type { Session, SessionStorage } from "./sessionStorage";

const SESSION_KEY = "meuadvogado20.session.v1";

export const secureSessionStorage: SessionStorage = {
  async get() {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Session;
    } catch {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
  },
  async set(session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },
  async clear() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
};
