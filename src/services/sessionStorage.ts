export type Session = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  email: string;
};

export interface SessionStorage {
  get(): Promise<Session | null>;
  set(session: Session): Promise<void>;
  clear(): Promise<void>;
}

export function isExpired(session: Session, nowSeconds = Math.floor(Date.now() / 1000)) {
  return typeof session.expiresAt === "number" && session.expiresAt <= nowSeconds + 30;
}
