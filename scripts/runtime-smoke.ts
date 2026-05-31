import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type SmokeStep = {
  name: string;
  objective: string;
  exitCode: number;
  result: string;
};

type RuntimeReport = {
  environment: "mobile-runtime";
  cwd: string;
  objective: string;
  exitCode: number;
  result: "OK_COM_RESSALVAS" | "FALHOU";
  gaps: string[];
  steps: SmokeStep[];
};

const mobileRoot = process.cwd();
const workspaceRoot = resolve(mobileRoot, "..");
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3333";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://qpemxkiowiiklztgumqy.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const androidSdk = process.env.ANDROID_HOME ?? resolve(process.env.LOCALAPPDATA ?? "", "Android", "Sdk");
const adbPath = resolve(androidSdk, "platform-tools", "adb.exe");
const emulatorPath = resolve(androidSdk, "emulator", "emulator.exe");
const publicProfileKeys = new Set(["id", "name", "oabNumber", "oabState", "city", "state", "areaIds", "areas", "whatsapp", "verified"]);
const publicAreaKeys = new Set(["id", "name"]);

function redact(value: string) {
  return value.length > 8 ? `${value.slice(0, 4)}...redacted` : "redacted";
}

function step(name: string, objective: string, run: () => Promise<string> | string): Promise<SmokeStep> {
  return Promise.resolve()
    .then(run)
    .then((result) => ({ name, objective, exitCode: 0, result }))
    .catch((error: unknown) => ({
      name,
      objective,
      exitCode: 1,
      result: error instanceof Error ? error.message : String(error)
    }));
}

async function readCredentials() {
  const raw = await readFile(resolve(workspaceRoot, "Credenciais para testes.txt"), "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const emailIndex = lines.findIndex((line) => line === "usuario@advogado20.com");
  const password = lines[emailIndex + 1];
  if (emailIndex === -1 || !password) {
    throw new Error("Credenciais do usuario cliente nao encontradas.");
  }
  return { email: lines[emailIndex], password };
}

async function requestJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const body = (await response.json()) as T;
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return body;
}

async function main() {
  const gaps: string[] = [];
  const steps: SmokeStep[] = [];

  steps.push(
    await step("android-tools", "Detectar SDK Android, devices conectados e AVDs disponiveis.", () => {
      if (!existsSync(adbPath) || !existsSync(emulatorPath)) {
        gaps.push("Android SDK incompleto ou fora do caminho esperado; smoke visual nao executado.");
        return "Android SDK nao encontrado nos caminhos esperados.";
      }

      const devices = execFileSync(adbPath, ["devices"], { encoding: "utf8" }).trim();
      const avds = execFileSync(emulatorPath, ["-list-avds"], { encoding: "utf8" }).trim();
      const hasDevice = devices.split(/\r?\n/).slice(1).some((line) => /\tdevice$/.test(line));
      if (!hasDevice) {
        gaps.push("Nenhum device Android conectado/bootado para smoke visual do app.");
      }
      if (!avds) {
        gaps.push("Nenhum AVD encontrado para tentativa de smoke visual.");
      }
      return `adb=${existsSync(adbPath) ? "OK" : "AUSENTE"}; deviceBootado=${hasDevice}; avds=${avds ? "OK" : "AUSENTE"}`;
    })
  );

  steps.push(
    await step("backend-health", "Validar backend local/staging em /health.", async () => {
      const body = await requestJson<{ status?: string }>(`${apiBaseUrl}/health`);
      if (body.status !== "ok") {
        throw new Error("Healthcheck sem status ok.");
      }
      return "Backend respondeu /health com status ok.";
    })
  );

  let firstAreaId = "";
  steps.push(
    await step("backend-areas", "Validar GET /v1/areas via backend.", async () => {
      const body = await requestJson<{ areas?: Array<{ id: string; name: string }> }>(`${apiBaseUrl}/v1/areas`);
      if (!body.areas?.length) {
        throw new Error("Nenhuma area juridica ativa retornada.");
      }
      firstAreaId = body.areas[0]?.id ?? "";
      return `Areas retornadas: ${body.areas.length}.`;
    })
  );

  let accessToken = "";
  let matchedLawyerId = "";
  steps.push(
    await step("auth-runtime", "Validar login real se anon key publica estiver disponivel.", async () => {
      if (!supabaseAnonKey) {
        gaps.push("EXPO_PUBLIC_SUPABASE_ANON_KEY nao esta configurada; login real mobile nao foi executado.");
        return "Auth real ignorado por falta de anon key publica no runtime.";
      }

      const credential = await readCredentials();
      const body = await requestJson<{ access_token?: string; user?: { email?: string } }>(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            apikey: supabaseAnonKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credential)
        }
      );

      if (!body.access_token) {
        throw new Error("Login real nao retornou access token.");
      }
      accessToken = body.access_token;
      return `Login real OK para ${body.user?.email ?? "usuario cliente"}; token=${redact(body.access_token)}.`;
    })
  );

  steps.push(
    await step("backend-match", "Validar POST /v1/match autenticado com payload valido.", async () => {
      if (!firstAreaId) {
        throw new Error("Sem area juridica para montar payload de match.");
      }
      const body = await requestJson<{ status?: string; lawyer?: { id?: string } }>(`${apiBaseUrl}/v1/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          lat: -23.55052,
          lng: -46.633308,
          accuracyM: 50,
          areaIds: [firstAreaId]
        })
      });
      if (body.status !== "stub" && body.status !== "matched" && body.status !== "empty") {
        throw new Error("Resposta de match sem status esperado.");
      }
      matchedLawyerId = body.lawyer?.id ?? "";
      return `Match respondeu status=${body.status}; lawyer=${body.lawyer ? "presente" : "vazio"}.`;
    })
  );

  steps.push(
    await step("backend-lawyer-profile", "Validar GET /v1/lawyers/:id autenticado com allowlist publica.", async () => {
      if (!matchedLawyerId) {
        throw new Error("Match nao retornou lawyer.id para validar perfil profissional.");
      }
      const body = await requestJson<{ lawyer?: Record<string, unknown> & { areas?: Array<Record<string, unknown>>; verified?: boolean } }>(
        `${apiBaseUrl}/v1/lawyers/${encodeURIComponent(matchedLawyerId)}`,
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }
      );
      const lawyer = body.lawyer;
      const areas = Array.isArray(lawyer?.areas) ? lawyer.areas : [];
      const unexpectedProfileKeys = lawyer ? Object.keys(lawyer).filter((key) => !publicProfileKeys.has(key)) : ["lawyer"];
      const unexpectedAreaKeys = areas.flatMap((area) => Object.keys(area).filter((key) => !publicAreaKeys.has(key)));
      if (!lawyer || lawyer.verified !== true || unexpectedProfileKeys.length > 0 || unexpectedAreaKeys.length > 0) {
        throw new Error("Perfil profissional fora da allowlist publica segura.");
      }
      return `Perfil profissional respondeu verified=true; areas=${areas.length}; hasForbiddenField=false.`;
    })
  );

  steps.push(
    await step("pii-safety", "Validar que o smoke nao depende de service role nem imprime senha/JWT completo.", () => {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        gaps.push("SUPABASE_SERVICE_ROLE_KEY existe no ambiente pai, mas nao foi usada pelo smoke mobile.");
      }
      return "Sem uso de service role; relatorio redige tokens e nao imprime senha.";
    })
  );

  if (steps.some((item) => item.exitCode !== 0)) {
    gaps.push("Uma ou mais etapas automatizadas falharam; fluxo nao pode ser considerado validado integralmente.");
  }

  const exitCode = steps.some((item) => item.exitCode !== 0) ? 1 : 0;
  const report: RuntimeReport = {
    environment: "mobile-runtime",
    cwd: mobileRoot,
    objective: "Smoke proporcional do fluxo mobile real: Android tooling, Railway, areas, Auth, match e perfil profissional seguro.",
    exitCode,
    result: exitCode === 0 ? "OK_COM_RESSALVAS" : "FALHOU",
    gaps,
    steps
  };

  await mkdir(resolve(mobileRoot, "harness-results"), { recursive: true });
  await writeFile(resolve(mobileRoot, "harness-results", "runtime-smoke.json"), JSON.stringify(report, null, 2));
  await writeFile(
    resolve(mobileRoot, "harness-results", "runtime-smoke.md"),
    `# Runtime Smoke Mobile\n\n- cwd: ${report.cwd}\n- objetivo: ${report.objective}\n- exit code: ${report.exitCode}\n- resultado: ${report.result}\n- lacunas: ${report.gaps.join("; ") || "nenhuma"}\n`
  );

  console.log(JSON.stringify(report, null, 2));
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
