# Mobile Test Plan - Meu Advogado 2.0

## Harness Obrigatorio

Comando principal:

- `npm run harness`

O harness executa:

- `npm run typecheck`
- `npm run test`
- `npm run smoke`

## Smoke Final Obrigatorio

Todo ciclo mobile deve validar:

- App abre sem crash.
- Tela afetada renderiza.
- Estado de loading/erro existe.
- Navegacao principal funciona.
- Sem erro visivel no console/log.
- Auth controlado nao expõe token/senha.
- Areas e match usam backend.
- Permissao negada de localizacao mostra estado claro.

## Regressao Critica

- Permissao de localizacao concedida.
- Permissao de localizacao negada.
- Sem advogado encontrado.
- Advogado encontrado.
- Abrir perfil.
- Abrir WhatsApp.
- Confirmar/cancelar urgencia.
- Token expirado.

## Evidencias

Registrar:

- comando;
- cwd;
- exit code;
- resultado;
- lacunas;
- screenshot quando visual.

## Resultado Da Fundacao

Harness local passou com typecheck, teste de contratos e smoke estrutural. Smoke em emulador/device Android nao foi executado neste ciclo e segue como lacuna explicita.

## Resultado Da Integracao Inicial

`npm run harness` em `Meu Advogado 2.0 - mobile` passou com exit code 0. O harness executou typecheck, 5 testes de services/contratos e smoke estrutural de Auth/API/Location/Match. Lacunas: sem smoke visual em Android/emulador e sem login real em runtime porque a anon key publica deve ser fornecida por `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Resultado Do Smoke Runtime Android

`npm run smoke:runtime` em `Meu Advogado 2.0 - mobile` passou com exit code 0 e resultado `OK_COM_RESSALVAS`. O smoke detectou ADB, AVD e device bootado, validou backend local em `/health`, `GET /v1/areas` com 6 areas e `POST /v1/match` com status `stub`. Lacunas: `EXPO_PUBLIC_SUPABASE_ANON_KEY` ausente, portanto login real nao foi executado.

## Resultado Do Smoke Visual Android

O AVD `Pixel_9` recebeu Expo Go compativel com SDK 52 a partir do APK oficial `Expo-Go-2.32.20`. Como `npm run android` em modo nao interativo parou no prompt de versao da Expo CLI, o smoke visual usou `npx expo start --localhost --clear`, `adb reverse tcp:8081 tcp:8081` e deep link `exp://127.0.0.1:8081`. Resultado: app abriu sem crash e tela inicial renderizou no Android; screenshot em `harness-results/android-home-sdk52.png`; relatorio em `harness-results/android-visual-smoke.json`. Lacunas: sem `EXPO_PUBLIC_SUPABASE_ANON_KEY` no ambiente nem na `.env` local, entao login real, restauracao de sessao, areas via UI, permissao nativa e match via UI seguem pendentes.

## Resultado Do Smoke Visual Com Auth Real

Com `EXPO_PUBLIC_SUPABASE_ANON_KEY` presente na `.env` raiz, o ciclo carregou somente variaveis `EXPO_PUBLIC_*` no processo local. `npm run smoke:runtime` passou com exit code 0, device bootado, backend OK, 6 areas, match stub e login real do `usuario@advogado20.com` com token redigido. No Android visual, o app restaurou a sessao, carregou as 6 areas pela UI e manteve a explicacao de localizacao antes da acao. Lacuna restante: ao tentar localizacao concedida no AVD/Expo Go, mesmo com `adb emu geo fix`, o app retornou estado de localizacao indisponivel; por isso o botao `Buscar match` permaneceu desabilitado e o match via UI nao foi executado. Evidencias em `harness-results/android-auth-visual-smoke.json`, `android-auth-open.png`, `android-areas-ui.png`, `android-before-match.png` e `android-location-granted.png`.

## Resultado Da Correcao Do Fluxo De Login

O seletor `@PICK` foi usado e o time efetivo foi `@C10`, `@SPEC`, `@D`, `@M`, `@S`, `@GSD` e `@V`. A tela sem sessao agora mostra somente logo oficial, subtitulo, formulario de login e status; nao mostra areas, localizacao nem match antes do login. Apos login real, a Home/Match aparece com sessao do cliente e acoes de areas/localizacao. `npm run harness` e `npm run smoke:runtime` passaram com exit code 0. Evidencias: `harness-results/android-login-only.png`, `harness-results/android-post-login-home.png` e `harness-results/login-flow-visual-smoke.json`. Lacuna remanescente: localizacao/match via UI seguem pendentes pela indisponibilidade de coordenada no AVD/Expo Go.

## Resultado Do Fallback Dev De Localizacao Android

O seletor `@PICK` foi usado e o time efetivo foi `@C10`, `@PR`, `@M`, `@GEO`, `@S`, `@GSD` e `@V`. Foi criado fallback local de desenvolvimento atras de `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK=true`, acionado somente quando a permissao nativa ja foi concedida e o provider do AVD/Expo Go falha em retornar coordenada. `npm run harness` passou com exit code 0, typecheck, 8 testes e smoke estrutural. `npm run smoke:runtime` passou com exit code 0, device bootado, backend OK, 6 areas, match stub e login real com token redigido. No Android visual, o fluxo fechou login real, areas via UI, prompt nativo, fallback dev explicito, `Buscar match` habilitado e estado vazio/stub apos match via UI. Evidencias: `harness-results/dev-location-fallback-visual-smoke.json`, `android-dev-fallback-areas.png`, `android-dev-fallback-location-prompt.png`, `android-dev-fallback-location.png` e `android-dev-fallback-match.png`.

## Resultado Da Permissao Negada Android

Sem mudanca de codigo, o AVD `Pixel_9` foi bootado e o Expo Go abriu o app via `exp://127.0.0.1:8081`. A permissao de localizacao do Expo Go foi revogada/negada e o app manteve a explicacao em contexto antes da acao. Ao acionar `Usar localizacao`, a Home exibiu estado claro de localizacao negada e manteve `Buscar match` desabilitado sem coordenada. Evidencias: `harness-results/android-location-denied-visual-smoke.json`, `android-denied-ready.png`, `android-denied-location-prompt.png` e `android-denied-location-state.png`.

## Resultado Do Rebuild Preview Da UX De Match

Em 2026-05-31, `npm run harness` passou com exit code 0 (typecheck, 8 testes e smoke estrutural). O `smoke:runtime` foi corrigido para autenticar antes do `POST /v1/match` e passou contra Railway com exit code 0: health OK, 6 areas, login real com token redigido e match autenticado `matched`. O rebuild preview EAS terminou com sucesso (`4352f306-53b9-4989-8eed-02bd71518dd3`). Lacuna bloqueante: nenhum Android apareceu no ADB; instalacao e smoke fisico da UX corrigida ficaram em `QUESTIONAR`.

## Resultado Da Spec 004 Mobile

Em 2026-05-31, o TDD vermelho registrou `npm run test` exit code 1 por service ausente e `npm run smoke` exit code 1 por service/screen ausentes. Apos a implementacao de `Home -> LawyerProfile -> WhatsApp`, `npm run harness` passou com exit code 0: typecheck, 9 testes e smoke estrutural. `npm run smoke:runtime` contra Railway passou com exit code 0: 6 areas, Auth real com token redigido, match `matched` e perfil seguro `verified=true`, duas areas, `hasForbiddenField=false`. O smoke visual Android no AVD `Pixel_9` demonstrou login, Home com match, CTA `Ver perfil`, tela `LawyerProfile`, voltar e CTA `Falar no WhatsApp`; como WhatsApp nao esta instalado no AVD, o handler externo aberto foi o Chrome.

## Resultado Do APK Preview Da Spec 004

Em 2026-05-31, o commit publicado `7d4bbdc08482c79b1feb41ceaeab158815219f26` foi validado como HEAD de `main...origin/main`. `npm run harness` em `Meu Advogado 2.0 - mobile` passou com exit code 0; `git diff --check` passou com exit code 0. A primeira tentativa de `npm run smoke:runtime` sem env/device terminou com exit code 1; a repeticao com env preview EAS e AVD bootado passou com exit code 0 contra Railway: health OK, 6 areas, Auth real com token redigido, match `matched`, perfil `verified=true`, duas areas e `hasForbiddenField=false`.

O EAS Build gerou o APK preview Android `11026258-edc1-4552-9b2b-9f5a8e92ab3f`, package `com.advogado20.app`, commit `7d4bbdc08482c79b1feb41ceaeab158815219f26`. O APK foi baixado para `harness-results/preview-11026258-spec004.apk`, instalado no AVD `Pixel_9` (`emulator-5554`) e validado visualmente: login real, Home com 6 areas, prompt nativo de localizacao, match com `Dra. Ana Geo (fixture)`, distancia efemera, CTA `Ver perfil`, tela `LawyerProfile`, botao `Voltar`, retorno ao card e CTA `Falar no WhatsApp`. Evidencias: `harness-results/preview-004-open.png`, `preview-004-after-login.png`, `preview-004-home-before-match.png`, `preview-004-location-prompt-or-loading.png`, `preview-004-match-result-wait2.png`, `preview-004-lawyer-profile.png`, `preview-004-after-back-home.png`, `preview-004-whatsapp-handler.png` e XMLs correspondentes.

Lacuna: WhatsApp nao esta instalado no AVD; o CTA abriu Chrome como handler externo. Nao houve exposicao documental de senha, token, telefone completo ou coordenada.

## Resultado Da Tentativa Em Device Fisico Com WhatsApp

Em 2026-05-31, o gate fisico foi iniciado para o mesmo APK preview `11026258-edc1-4552-9b2b-9f5a8e92ab3f`, commit `7d4bbdc08482c79b1feb41ceaeab158815219f26`. O APK local `harness-results/preview-11026258-spec004.apk` existe e foi considerado valido para instalacao. `npm run harness` passou com exit code 0; `git diff --check` passou com exit code 0; `npm run smoke:runtime` com env preview passou com exit code 0 contra Railway, com Auth real redigido, match `matched` e perfil seguro.

Resultado: `QUESTIONAR`. `adb devices -l` nao listou device fisico conectado, entao nao foi possivel confirmar WhatsApp instalado, instalar o APK no aparelho fisico ou validar a abertura real do WhatsApp. Backend, admin, schema e migrations nao foram alterados.

## Resultado Do Pacote Manual Sem ADB

Em 2026-06-01, foi criado `harness-results/manual-device-whatsapp-validation-2026-06-01.md` para validar o mesmo APK preview sem depuracao USB. O pacote registra o APK local, link EAS `https://expo.dev/artifacts/eas/36PFQcLV2fa3Fzyh7nVDTD.apk`, build `11026258-edc1-4552-9b2b-9f5a8e92ab3f`, commit `7d4bbdc08482c79b1feb41ceaeab158815219f26` e SHA-256 `DC3ED9DAAB4810A9B6AD164EB42003D0069DD9F54130901FE2111664E3BFDC75`.

Gates: `npm run harness` exit code 0; `npm run smoke:runtime` com env preview exit code 0 contra Railway, com Auth real redigido, match `matched` e perfil seguro; `git diff --check` exit code 0. Resultado: `QUESTIONAR` ate o usuario devolver evidencia manual do device fisico com WhatsApp instalado.

## Resultado Da Validacao Manual Com WhatsApp

Em 2026-06-01, o usuario confirmou que a instalacao/validacao manual em device fisico com WhatsApp direcionou corretamente para o WhatsApp. A evidencia foi relato textual assistido, sem screenshot anexado e sem expor telefone completo, token, senha, coordenada ou segredo. Resultado: `OK` para o gate `Falar no WhatsApp` em device fisico.

## Resultado Da Spec 005 Navegacao E Design Shell

Em 2026-06-01, a Home autenticada recebeu shell/header e bottom navigation MVP `Inicio`, `Buscar` e `Conta`. `Buscar` e atalho para o fluxo real de areas/localizacao/match; `Conta` concentra sessao, sair e links legais. Nao foram criados `Mensagens`, `Agenda`, `Plantao`, favoritos, rating, avatar, bio ou metricas.

Gates:

- `npm run harness`; exit code 0; typecheck, 9 testes e smoke estrutural passaram.
- `npm run smoke:runtime` com `EXPO_PUBLIC_API_BASE_URL=https://advogado-back-production.up.railway.app` e anon key publica carregada da `.env` raiz somente no processo; exit code 0; ADB/AVD OK, Railway health OK, 6 areas, login real com token redigido, match `matched`, perfil `verified=true`, duas areas e `hasForbiddenField=false`.
- `git diff --check`; exit code 0, apenas avisos de CRLF esperados do Git no Windows.
- Smoke visual proporcional no AVD `Pixel_9` via Metro/Expo Go: login renderizou sem bottom navigation; apos login real por ADB, shell autenticado renderizou header `ADVOGADO 2.0`, contexto de localizacao, atalho `Buscar por area juridica` e bottom navigation `Inicio`, `Buscar`, `Conta`.

Evidencias:

- `harness-results/spec005-shell-wait.png`
- `harness-results/spec005-shell-wait.xml`
- `harness-results/spec005-shell-auth.png`
- `harness-results/spec005-shell-auth.xml`

Ressalva: o smoke visual completo de match/perfil/WhatsApp nao foi repetido nesta spec; a integracao foi preservada por smoke runtime Railway e ja havia sido demonstrada visualmente na spec 004. Antes de release, gerar build/preview novo e repetir o fluxo visual completo com o shell.

## Resultado Do APK Preview Da Spec 005

Em 2026-06-01, foi gerado o EAS Build Android preview `5c9741f9-ecac-44bb-b9ae-c1e2c6f25200`, commit mobile `0aa8ed898d6df099e9a311b879ac2afac0f88ac5`, package `com.advogado20.app`, appBuildVersion `2`, com fallback dev desligado. O APK foi baixado para `harness-results/preview-5c9741f9-spec005-shell.apk` com SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`.

Gates: `npm run harness` exit code 0; `npm run smoke:runtime` contra Railway exit code 0, com Auth real redigido, 6 areas, match `matched`, perfil `verified=true`, duas areas e `hasForbiddenField=false`; `git diff --check` exit code 0 com avisos CRLF esperados no Windows.

Smoke visual no AVD `Pixel_9`: `eas build:run --platform android --latest` baixou, instalou e iniciou o APK. A Home autenticada renderizou header `ADVOGADO 2.0`, areas juridicas, card `ADVOGADO INDICADO` e bottom navigation `Inicio`, `Buscar`, `Conta`. O fluxo completo nao fechou porque o AVD nao entregou localizacao nativa ao Expo Location com fallback dev desligado; o app exibiu `Nao foi possivel obter sua localizacao agora. Tente novamente.`. Resultado: `QUESTIONAR` ate validar em device fisico com GPS real/WhatsApp ou por checklist manual assistido.

Evidencias: `harness-results/spec005-preview-build-visual-smoke.md`, `manual-device-spec005-preview-validation-2026-06-01.md`, `spec005-preview-*.png` e `spec005-preview-*.xml`.

## Resultado Da Retomada Do Gate Fisico Da Spec 005

Em 2026-06-01, o ciclo foi retomado sem codigo novo para fechar o gate fisico do APK preview da spec 005. O arquivo `harness-results/preview-5c9741f9-spec005-shell.apk` foi confirmado com `66185270` bytes e o SHA-256 local bateu com `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`.

Resultado: `QUESTIONAR`. `adb` nao esta disponivel no PATH desta sessao, portanto nao foi possivel instalar/inspecionar device fisico de forma assistida. Sem confirmacao manual do usuario, o fluxo `Login -> Home com shell -> match -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp` ainda precisa ser validado em device Android fisico com GPS real e WhatsApp instalado. Nenhuma senha, token, telefone completo, coordenada exata ou payload sensivel foi registrado.

## Resultado Da Rechecagem Do Gate Fisico Da Spec 005 Em 2026-06-02

Sem codigo novo e sem gerar APK novo, `npm run harness` passou com exit code 0 em `Meu Advogado 2.0 - mobile`: typecheck, 10 testes e smoke estrutural passaram. O `npm run smoke:runtime`, carregando somente `EXPO_PUBLIC_*` da `.env` raiz sem imprimir valores e usando Railway, passou com exit code 0 (`OK_COM_RESSALVAS`): backend health OK, 6 areas, login real com token redigido, match `matched` e perfil seguro.

O APK `harness-results/preview-5c9741f9-spec005-shell.apk` existe, tem `66185270` bytes e SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`, igual ao esperado. ADB foi localizado pelo SDK local, mas `adb devices -l` nao listou device fisico. Resultado: `SPEC005_DEVICE_FISICO_QUESTIONAR` ate validar GPS real e WhatsApp real em device Android fisico ou checklist manual assistido. Evidencia: `harness-results/spec005-device-gate-recheck-2026-06-02.md`.

## Resultado Da Validacao Manual Assistida Da Spec 005 Em 2026-06-02

O usuario confirmou textualmente a conclusao do checklist manual assistido no APK preview da Spec 005 em device Android fisico com GPS real e WhatsApp instalado. O aceite cobre o fluxo `Login -> Home com shell -> GPS real -> match Railway/PostGIS -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp`.

Resultado: `SPEC005_DEVICE_FISICO_OK`. A evidencia e textual assistida, sem screenshot e sem registrar senha, token completo, telefone completo, coordenada exata ou payload sensivel. Nenhum codigo, APK novo, backend, admin, schema, migration ou Spec 008 Parte 3 foi alterado. Evidencia: `harness-results/spec005-device-physical-ok-2026-06-02.md`.

## Resultado Da Spec 008 Parte 2 Visual Android

Em 2026-06-02, o ciclo cirurgico fechou a ressalva visual da Parte 2 sem feature nova. `npm run harness` passou com exit code 0. A primeira execucao de `npm run smoke:runtime` falhou porque a allowlist local do script ainda nao aceitava os campos publicos opcionais da Parte 2; o script foi corrigido e a repeticao contra Railway passou com exit code 0 (`OK_COM_RESSALVAS`), Auth real redigido, 6 areas, match `matched`, perfil `verified=true`, duas areas e `hasForbiddenField=false`.

Smoke visual no AVD `Pixel_9`: Expo Go abriu via Metro local, login cliente real foi executado sem registrar senha, e o fluxo `Login -> Home autenticada -> Buscar -> match -> Ver perfil -> LawyerProfile -> Voltar` passou. O `LawyerProfile` exibiu fallback seguro de capa/avatar, selo verificado, nome, OAB, cidade/UF, distancia efemera, areas e CTA WhatsApp. A fixture publicada nao trouxe imagem real, entao imagem real fica como lacuna nao bloqueante para revalidacao futura.

Evidencias: `harness-results/spec008-part2-visual-android-2026-06-02.md`, `spec008-part2-android-client-home-clean.png`, `spec008-part2-android-client-actions-clean.png`, `spec008-part2-android-client-lawyer-profile-clean.png` e `spec008-part2-android-profile-back-to-match.png`. O CTA WhatsApp abriu handler externo no Chrome; as capturas do handler foram removidas porque a URL continha telefone completo.

## Resultado Do Diagnostico Spec 003 Release Readiness

Em 2026-06-02, a Spec 003 foi retomada apenas como diagnostico documental/operacional, sem codigo novo, sem build novo e sem gerar APK/AAB. Foram executadas checagens proporcionais de docs/configs e do APK preview da Spec 005. O APK `harness-results/preview-5c9741f9-spec005-shell.apk` existe com `66185270` bytes e SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`. `app.json` confirma package `com.advogado20.app`, `versionCode=2` e permissoes de localizacao; `eas.json` confirma preview APK/internal e production app-bundle/store.

Resultado: `QUESTIONAR_COMPLIANCE_RELEASE`. O fluxo principal em device fisico e reaproveitavel como evidencia, mas internal testing segue bloqueado por Data Safety no Play Console, conta de teste, AAB assinado, crash reporting ou decisao explicita de adiamento, auditoria PII/logs/secrets, credenciais/keystore e rollback operacional. Evidencia: `harness-results/spec003-release-readiness-diagnostic-2026-06-02.md`.

## Resultado Do Package Gate Spec 003 Play Console

Em 2026-06-03, a Spec 003 avancou para package gate sem codigo novo, sem build novo, sem gerar APK/AAB e sem Play Store. Foram confirmados docs/configs, `eas.json` sem imprimir anon key, e o APK da Spec 005 com `66185270` bytes e SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`. A auditoria textual foi feita por categorias e sem imprimir linhas/valores: nao encontrou padrao direto de chave privada/OpenAI nem coordenada em `console.*`; encontrou publishable key em `.env`/`eas.json`, referencias de service role em backend/scripts e superficies esperadas de telefone/WhatsApp/tokens que exigem redacao continua.

Resultado: `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. O pacote esta documentado, mas o ciclo de AAB depende de humano confirmar Play Console/EAS/keystore, conta de teste, Data Safety e decisao final de crash reporting. Evidencia: `harness-results/spec003-play-console-package-gate-2026-06-03.md`.

## Resultado Do Gate Assistido Spec 003 Credenciais Play Console

Em 2026-06-03, o gate assistido foi executado sem codigo novo, APK, AAB ou Play Store. Docs/configs foram reconfirmados; `app.json` manteve `com.advogado20.app`, `versionCode=2`, permissoes de localizacao e fallback dev desligado; `eas.json` manteve preview APK/internal e production app-bundle/store sem imprimir anon key; o APK da Spec 005 manteve `66185270` bytes e SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`. A auditoria redigida nao encontrou chave privada/OpenAI nem coordenada em `console.*`, preservando ressalvas para publishable key, service role e telefone/WhatsApp. Referencias oficiais Google Play Data Safety/User Data/Account Deletion foram revisadas.

Resultado: `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. Sem confirmacao humana explicita de Play Console/app, EAS/keystore, conta de teste e Data Safety no console, o AAB continua bloqueado. Evidencia: `harness-results/spec003-credenciais-play-console-assistido-2026-06-03.md`.

## Resultado Da Spec 008 Parte 3 Local

Em 2026-06-03, com Play Console ainda bloqueado por confirmacao humana, a Parte 3 da
Spec 008 foi adiantada localmente. O mobile passou a consumir `GET /v1/lawyer/me/dashboard`
no shell do advogado e `POST /v1/prayer-requests` na aba cliente `Oracao`, com formulario,
anonimato, validacao minima local e confirmacao sem ecoar o texto.

Gates:

- `npm run harness`; exit code 0; typecheck, 12 testes e smoke estrutural passaram.

Ressalvas: sem smoke visual Android neste ciclo, sem build/APK/AAB e sem validacao contra
Railway porque o backend da Parte 3 ainda depende de migration remota `0003_prayer_requests.sql`
e deploy.

## Resultado Do Gate De Publicacao Da Spec 008 Parte 3

Em 2026-06-03, o gate de publicacao/validacao da Parte 3 foi fechado sem Play Console,
sem APK novo e sem AAB. A primeira tentativa ficou bloqueada porque a migration ainda nao
estava aplicada; depois o usuario aplicou `0003_prayer_requests.sql` manualmente no
Supabase SQL Editor aprovado (`Success. No rows returned`). Backend commit `a5db016`
foi publicado no Railway e mobile commit `f5ed433` foi publicado no GitHub.

Gates:

- Backend `npm run migration:check`; exit code 0; `OK_DRY_RUN_STATIC`.
- Backend `npm run harness`; exit code 0; 45 testes, build e smoke local.
- Backend `npm run prod:smoke` contra Railway; exit code 0; dashboard advogado `401/403/200` e prayer requests `401/403/422/201`, sem ecoar texto nem `clientProfileId`.
- Mobile `npm run harness`; exit code 0; 12 testes e smoke estrutural.
- Mobile `npm run smoke:runtime` contra Railway; exit code 0; `OK_COM_RESSALVAS`, login real com token redigido, 6 areas, match `matched` e perfil seguro.

Ressalva: smoke visual Android da Parte 3 nao foi executado porque nenhum device/AVD
estava conectado/bootado. Nenhum texto sensivel de oracao, token, senha, telefone completo
ou coordenada exata foi registrado. Resultado: `SPEC008_PARTE3_PUBLICADA_OK_COM_RESSALVAS`.
Evidencia:
`harness-results/spec008-part3-published-validation-2026-06-03.md`.
