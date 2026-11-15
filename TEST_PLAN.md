
## SPEC-024
Harness + testes de prova/replay/roles/compensacao, deeplink/refresh/logout e smoke webmock. Prova Supabase real com cleanup no back/scripts/auth024-provider-smoke.ts, executada somente para conta descartavel autorizada. Roteiroreal de email, Google, Android cold/warm e APK e bloqueante; consultar AUTH_LINKS.md.

SPEC-024 TASK-245: CI quality.yml executa npmci/Harness/audit-high em Node22/Linux, com preservacao de evidencias. Excecao TDD para configuracao: prova substituta e execucao real do workflow GitHub; nao substitui Resend/Android.
