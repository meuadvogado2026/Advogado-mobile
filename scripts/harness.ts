import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

async function main() {
  const cwd = process.cwd();
  const stepsToRun = [
    { command: "npm run typecheck", objective: "Validar tipos TypeScript do app Expo." },
    { command: "npm run test", objective: "Executar testes de contratos/config do mobile." },
    { command: "npm run smoke", objective: "Validar fluxo estrutural Auth/API/Location/Match/LawyerProfile sem emulador." }
  ];

  const steps = stepsToRun.map((step) => {
    const result = spawnSync(step.command, { cwd, shell: true, encoding: "utf8" });
    return { ...step, exitCode: result.status, result: `${result.stdout}\n${result.stderr}`.trim() };
  });

  const exitCode = steps.some((step) => step.exitCode !== 0) ? 1 : 0;
  const report = {
    environment: "mobile",
    cwd,
    objective: "Harness mobile: tipos, testes de services e smoke estrutural Auth/API/Location/Match/LawyerProfile.",
    exitCode,
    result: exitCode === 0 ? "OK" : "FALHOU",
    gaps: [
      "Smoke visual em Android/emulador nao executado neste ciclo.",
      "Login real depende de EXPO_PUBLIC_SUPABASE_ANON_KEY em runtime; teste unitario usa Auth controlado sem expor credenciais."
    ],
    steps
  };

  await mkdir("harness-results", { recursive: true });
  await writeFile("harness-results/latest.json", JSON.stringify(report, null, 2));
  await writeFile(
    "harness-results/latest.md",
    `# Harness Mobile\n\n- cwd: ${cwd}\n- objetivo: ${report.objective}\n- exit code: ${exitCode}\n- resultado: ${report.result}\n- lacunas: ${report.gaps.join("; ")}\n`
  );

  console.log(JSON.stringify(report, null, 2));
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
