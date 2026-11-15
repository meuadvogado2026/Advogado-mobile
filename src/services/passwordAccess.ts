import { publicConfig } from "../config/env";

export function readPasswordLink(url: string): { tokenHash: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "advogado20:" || parsed.hostname !== "auth" || parsed.pathname !== "/password-reset" || parsed.search || parsed.username || parsed.password || parsed.port) return null;
    const params = new URLSearchParams(parsed.hash.slice(1));
    const tokenHash = params.get("token_hash") ?? "";
    if (params.get("type") !== "recovery" || !/^[a-f0-9]{32,128}$/.test(tokenHash)) return null;
    return { tokenHash };
  } catch { return null; }
}

export async function passwordAccessRequest(payload: { email: string } | { tokenHash: string; newPassword: string; confirmPassword: string }, fetchImpl: typeof fetch = fetch, apiBaseUrl = publicConfig.apiBaseUrl) {
  const reset = "tokenHash" in payload;
  let response: Response;
  try {
    response = await fetchImpl(`${apiBaseUrl}/v1/auth/${reset ? "password-reset" : "password-recovery"}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(30_000),
      body: JSON.stringify(reset ? { ...payload, type: "recovery" } : payload)
    });
  } catch { throw new Error("Falha de conexão. Tente novamente ou solicite outro link."); }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "Não foi possível concluir. Tente novamente.");
  return reset ? "Senha definida. Entre com seu e-mail e a nova senha." : body.message as string;
}
