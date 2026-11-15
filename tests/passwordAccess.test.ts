import { describe, expect, it, vi } from "vitest";
vi.mock("../src/config/env", () => ({ publicConfig: { apiBaseUrl: "https://api.example.test" } }));
import { readPasswordLink, passwordAccessRequest } from "../src/services/passwordAccess";

describe("password access isolated from normal sessions", () => {
  it("accepts only the intended scheme/host/path/type and hash proof", () => {
    const fragment = `#token_hash=${"a".repeat(64)}&type=recovery`;
    expect(readPasswordLink(`advogado20://auth/password-reset${fragment}`)).toEqual({ tokenHash: "a".repeat(64) });
    for (const url of [`https://evil.test/password-reset${fragment}`, `advogado20://evil/password-reset${fragment}`, `advogado20://auth/callback${fragment}`, `advogado20://auth/password-reset?next=https://evil.test${fragment}`, "advogado20://auth/password-reset#access_token=jwt&type=recovery", `advogado20://auth/password-reset${fragment.replace("recovery", "invite")}`]) expect(readPasswordLink(url)).toBeNull();
  });
  it("sends only the official proof/password payload without a normal bearer session", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "password_updated" })));
    await expect(passwordAccessRequest({ tokenHash: "a".repeat(64), newPassword: "sample-only", confirmPassword: "sample-only" }, fetcher)).resolves.toContain("Senha definida");
    expect(fetcher.mock.calls[0]![0]).toBe("https://api.example.test/v1/auth/password-reset");
    expect(fetcher.mock.calls[0]![1].headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(fetcher.mock.calls[0]![1].body)).toEqual({ tokenHash: "a".repeat(64), type: "recovery", newPassword: "sample-only", confirmPassword: "sample-only" });
  });
  it("shows invalid/expired proof and network failure without reporting success", async () => {
    await expect(passwordAccessRequest({ email: "test@example.test" }, vi.fn().mockRejectedValue(new Error("network")))).rejects.toThrow("conexão");
    await expect(passwordAccessRequest({ tokenHash: "a".repeat(64), newPassword: "sample-only", confirmPassword: "sample-only" }, vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: "Link expirado" } }), { status: 401 })))).rejects.toThrow("Link expirado");
  });
});
