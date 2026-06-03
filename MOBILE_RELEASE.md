# Mobile Release - Meu Advogado 2.0

**Estado:** nao pronto para release  
**Canal inicial:** internal testing Android
**Ultimo diagnostico:** 2026-06-03 - `SPEC003_DEPENDENCIAS_RELEASE_OK / QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`

## Configuracoes Necessarias

- `app.json` ou `app.config.ts`.
- Package name Android definitivo.
- Icone e adaptive icon.
- Splash screen.
- EAS project configurado.
- Variaveis publicas seguras.

## Play Store

- Politica de privacidade publicada.
- Data Safety Form preenchido.
- Conta de teste para revisor.
- Termos acessiveis no app.
- Justificativa de localizacao.
- Exclusao de conta/dados ou canal claro.

## Build

- EAS Build interno antes de producao.
- Smoke em device Android real ou emulador confiavel.
- Build nao pode conter dados mockados de producao.

## Rollback

- Manter versao anterior em canal interno.
- API versionada para compatibilidade.
- Feature flags para funcionalidades incompletas.

## Configuracao Inicial

`app.json` declara Android-first, package definitivo `com.advogado20.app` e permissoes `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION`.

## Integracao Inicial

- `app.config.ts` le `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- A anon key e usada somente para Supabase Auth; regra de negocio e dados de dominio continuam via backend.
- O app explica a finalidade da localizacao antes de chamar o prompt nativo.
- Antes de release interno, validar o fluxo completo em Android com backend local/staging e credenciais de teste para revisor.
- Para desenvolvimento com Expo Go, o AVD precisa de Expo Go compativel com SDK 52. O AVD `Pixel_9` foi corrigido com o APK oficial `Expo-Go-2.32.20` e abriu a tela inicial via Metro local/deep link. Com `EXPO_PUBLIC_SUPABASE_ANON_KEY` em runtime, login real e areas via UI foram validados. Como o provider de localizacao do AVD/Expo Go seguiu instavel, o smoke local usa fallback dev explicito via `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK=true`; essa flag fica desligada por padrao e nao deve ser usada em release interno/producao.
- Com o fallback dev ligado, o fluxo visual Android fechou prompt nativo, botao `Buscar match` habilitado e estado vazio/stub apos chamada de match via UI.
- Logos oficiais foram adicionadas em `assets/` e configuradas como icon, adaptive icon e splash. A experiencia pre-login foi corrigida para exibir somente login; Home/Match entra apenas apos sessao.
- Em 2026-05-31, o rebuild preview EAS da UX corrigida foi concluido (`4352f306-53b9-4989-8eed-02bd71518dd3`). O smoke automatizado contra Railway passou; a validacao fisica posterior foi fechada pela spec 004 via APK preview e confirmacao manual do usuario em device com WhatsApp.
- Em 2026-05-31/2026-06-01, a spec 004 adicionou e validou `Home -> LawyerProfile -> WhatsApp`. Harness, runtime Railway, smoke visual Android no AVD `Pixel_9`, APK preview e direcionamento real para WhatsApp em device fisico foram fechados.
- Em 2026-06-01, a spec 005 implementou shell/header e bottom navigation MVP `Inicio`, `Buscar`, `Conta`, com harness, runtime Railway e smoke visual proporcional. No mesmo dia foi gerado o novo APK preview `5c9741f9-ecac-44bb-b9ae-c1e2c6f25200`, instalado e aberto no AVD `Pixel_9`; a Home autenticada com shell renderizou, mas o AVD nao entregou localizacao nativa com fallback dev desligado. Na rechecagem de 2026-06-02, o APK local foi confirmado com `66185270` bytes e SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`; `npm run harness` e `npm run smoke:runtime` contra Railway passaram, mas ADB nao listou device fisico conectado. O caminho manual assistido foi usado e o usuario confirmou o fluxo completo em device fisico com GPS real/WhatsApp: `Login -> Home com shell -> match -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp`. Resultado: `SPEC005_DEVICE_FISICO_OK`.
- Politica, termos e canal de exclusao foram publicados em `https://meuadvogado2026.github.io/meu-advogado-legal/` e linkados no mobile. Data Safety ainda precisa ser preenchido no Play Console com base em `../DATA_SAFETY_DRAFT.md`.
- Em 2026-06-02, a retomada da Spec 003 foi diagnosticada sem codigo/build novo. Resultado: `QUESTIONAR_COMPLIANCE_RELEASE`. Evidencias reaproveitaveis: APK preview da Spec 005, package `com.advogado20.app`, `versionCode=2`, permissoes de localizacao declaradas, links legais publicados e perfil EAS de `production` configurado como `app-bundle`. Bloqueios: Data Safety no Play Console, conta de teste, AAB assinado, crash reporting ou decisao explicita de adiamento, auditoria PII/logs/secrets, credenciais/keystore e rollback operacional.
- Em 2026-06-03, o package gate da Spec 003 gerou `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. O pacote operacional documentou checklist Data Safety, conta de teste, matriz PII/logs/secrets, recomendacao de adiar crash reporting, runbook de rollback internal testing e criterios para liberar o ciclo de AAB. O proximo passo exige humano presente para confirmar Play Console/EAS/keystore e conta de teste antes de gerar AAB.
- Em 2026-06-03, o gate assistido da Spec 003 manteve `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. Docs/configs/APK e referencias oficiais Google Play foram reconfirmados, mas nao houve confirmacao humana explicita de Play Console/app `com.advogado20.app`, EAS/keystore, conta de teste ou Data Safety no console. AAB segue bloqueado ate essa confirmacao.
- Em 2026-06-03, como Play Console continuou sem dados humanos, a Spec 008 Parte 3 foi adiantada localmente sem build/release: mobile passou a consumir `GET /v1/lawyer/me/dashboard` e `POST /v1/prayer-requests`; backend/mobile `npm run harness` passaram. Ressalvas antes de release: aplicar migration `0003_prayer_requests.sql`, publicar backend/mobile, repetir smoke real/visual Android e revisar Data Safety para texto livre de oracao.
- Em 2026-06-03, apos a Spec 008 Parte 1R fechar `SPEC008_CLIENTE_HOME_REPLICACAO_VISUAL_OK`, o pacote final de decisao da Spec 003 revalidou configs Android/EAS e evidencias do fluxo, mas ficou `QUESTIONAR_COMPLIANCE_RELEASE`: `npm audit --omit=dev` retornou 17 vulnerabilidades de producao (12 altas, 5 moderadas), todas ainda sem triagem/aceite. AAB segue bloqueado tambem por Play Console/EAS/keystore/conta de teste/Data Safety nao confirmados por humano.
- Em 2026-06-03, o bloqueio de dependencias de producao da Spec 003 foi tratado sem `npm audit fix --force`, sem Expo SDK major, sem gerar APK/AAB e sem abrir Play Console. O audit automatico queria `expo@56.0.8` com semver major; em vez disso, foram aplicados overrides transitivos documentados para `@expo/plist/@xmldom`, `postcss`, `tar` e `uuid`. Gates: `npm audit --omit=dev` exit 0, `npx expo install --check` exit 0, `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 e `git diff --check` exit 0. Resultado: `SPEC003_DEPENDENCIAS_RELEASE_OK`; AAB segue bloqueado por `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`.
- Em 2026-06-03, o gate humano final de AAB preparou checklist objetivo para Play Console/app `com.advogado20.app`, track internal testing, EAS/keystore, conta de teste, Data Safety/Data deletion, crash reporting adiado, versionCode/versionName e rollback. A parte local foi revalidada: package `com.advogado20.app`, version `0.1.0`, `versionCode=2`, production EAS `store/app-bundle`, fallback dev desligado, `npm audit --omit=dev` exit 0, `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 e `git diff --check` exit 0. Resultado: `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`, pois nenhuma confirmacao humana foi fornecida.
