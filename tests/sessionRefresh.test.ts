import { describe, expect, it, vi } from "vitest";
vi.mock("expo-web-browser", () => ({ openAuthSessionAsync: vi.fn() }));
vi.mock("../src/config/env", () => ({ publicConfig: {}, validatePublicConfig: vi.fn() }));
import { createAuthService } from "../src/services/authService";
import type { Session, SessionStorage } from "../src/services/sessionStorage";

function fixture(fetcher: typeof fetch) {
  let session: Session | null = { accessToken: "expired-test-only", refreshToken: "refresh-test-only", expiresAt: 1, email: "test@example.test" };
  const storage: SessionStorage = { get: async () => session, set: async value => { session = value; }, clear: async () => { session = null; } };
  return { storage, service: createAuthService({ config: { apiBaseUrl: "https://api.example.test", supabaseUrl: "https://auth.example.test", supabaseAnonKey: "public" }, fetchImpl: fetcher, storage }) };
}
describe("refresh and revocation", () => {
  it("rotates an expired refresh session instead of discarding a valid account", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ access_token: "new-test-only", refresh_token: "rotated-test-only", expires_in: 3600 })));
    const { service, storage } = fixture(fetcher);
    expect((await service.getSession())?.refreshToken).toBe("rotated-test-only");
    expect((await storage.get())?.accessToken).toBe("new-test-only");
    expect(fetcher.mock.calls[0]![0]).toContain("grant_type=refresh_token");
  });
  it("clears provider-revoked sessions and preserves refresh for transient offline failure", async () => {
    const revoked = fixture(vi.fn().mockResolvedValue(new Response("{}", { status: 400 })));
    expect(await revoked.service.getSession()).toBeNull();
    expect(await revoked.storage.get()).toBeNull();
    const offline = fixture(vi.fn().mockRejectedValue(new Error("network")));
    await expect(offline.service.getSession()).rejects.toThrow("REDE");
    expect((await offline.storage.get())?.refreshToken).toBe("refresh-test-only");
  });
  it("requests remote local-session revoke and clears secure storage even offline", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
    const { service, storage } = fixture(fetcher);
    await service.signOut();
    expect(await storage.get()).toBeNull();
    expect(fetcher.mock.calls[0]![0]).toContain("logout?scope=local");
  });
});
