# Mobile Test Plan - Advogado 2.0

## Home Layout Polish - 2026-06-15

- Gate local executado: `npm run typecheck`, `npm run test`, `npm run smoke`,
  `npm run harness` e `git diff --check`.
- Regressao estatica cobre hub de areas, interrogacao menor, `Alert.alert` e CTA
  `Falar no WhatsApp`.
- Smoke runtime com Railway pode validar `/health` e areas sem segredo, mas match/perfil
  dependem de anon key publica e device/runtime completo.
- Smoke visual fechado no AVD `Pixel_9` com Expo Go `56.0.1`, Metro em LAN/IPv4 e
  deep link `exp://10.0.2.2:8090`.
- Evidencias: `layout-polish-login-env.png`, `layout-polish-home-auth.png`,
  `layout-polish-home-touchfix.png` e `layout-polish-help-alert-final.png`.
- O CTA `Falar no WhatsApp` do alerta nao foi acionado no AVD para evitar preservar
  URL/telefone em screenshot; o direcionamento segue coberto por smoke estrutural.

## Gate Play Store 16 KB - 2026-06-14

Todo candidato AAB deve passar, alem do Harness:

- `llvm-readelf -lW`: nenhum segmento `LOAD` abaixo de `2**14`.
- `zipalign -c -P 16 -v 4`: sucesso.
- `bundletool dump config`: `PAGE_ALIGNMENT_16K`.
- Smoke em Android com `adb shell getconf PAGE_SIZE` retornando `16384`.
- Login, cidade, GPS, match vazio/cheio, perfil, WhatsApp, painel advogado, exclusao,
  sessao expirada e permissao negada.

Baseline atual: reprovada no ELF ARM64 em 13/14 bibliotecas. O preview Expo Go prova
somente renderizacao da arvore atual, nao conformidade do binario de loja.

## Spec 012

- Validar visualmente o seletor recolhivel de estados.
- Validar que `CIDADE` nao aparece antes do estado e fecha depois da selecao.
- Modo cidade nao chama Expo Location nem envia coordenadas.
- Selecao dependente, vazio sem fallback, pagina de 5, listagem sem distancia e abertura do perfil existente.
- Regressao GPS e smoke visual Android/cross-stack.

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

## Resultado Da Spec 011

Em 2026-06-10, a Spec 011 alterou a Home cliente para remover busca textual e card de advogado indicado, criar hub de especialidades ao redor do botao de match, usar `assets/logo-gold.png` como logo visual interna, navegar direto para `LawyerProfile` quando o match retorna advogado e reorganizar o painel advogado com menus `Home`, `Oracao`, `Perfil`.

Evidencias:

- `npm run typecheck`: exit code 0.
- `npm run test -- --run tests/contracts.test.ts`: exit code 0, 14 testes.
- `npm run smoke`: exit code 0, validando a nova UX estrutural.
- `npm run harness`: exit code 0.
- `npm run smoke:runtime` com `EXPO_PUBLIC_API_BASE_URL=https://advogado-back-production.up.railway.app` e `EXPO_PUBLIC_*` carregadas da `.env` raiz sem imprimir segredo: exit code 0, `OK_COM_RESSALVAS`, 6 areas, login real redigido, match `matched` e perfil seguro.
- `git diff --check`: exit code 0.
- Smoke visual Android parcial no AVD `Pixel_9` com Expo Go/Metro local: login renderizou com nova logo; Home cliente renderizou saudacao, hub de especialidades, sem busca textual, sem card de advogado, sem parceiros; `Advogado urgente` mostrou exemplos curtos; pedido de oracao mostrou copy segura sem o texto antigo.

Lacuna: o CTA de match apareceu habilitado no XML do AVD, mas o toque ADB no botao central e no CTA `Buscar match agora` nao comprovou a navegacao visual para `LawyerProfile`. O runtime smoke confirmou match `matched` e perfil seguro via backend. O proximo gate visual deve repetir em device fisico ou AVD limpo: login, Home cliente, toque no match, perfil com frase de proximidade e painel advogado com `Home -> Oracao -> Perfil`, sem capturar senha/token/telefone/coordenada/texto de oracao.

## Resultado Da Fundacao

Harness local passou com typecheck, teste de contratos e smoke estrutural. Smoke em emulador/device Android nao foi executado neste ciclo e segue como lacuna explicita.

## Resultado Da Integracao Inicial

`npm run harness` em `Advogado 2.0 - mobile` passou com exit code 0. O harness executou typecheck, 5 testes de services/contratos e smoke estrutural de Auth/API/Location/Match. Lacunas: sem smoke visual em Android/emulador e sem login real em runtime porque a anon key publica deve ser fornecida por `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Resultado Do Smoke Runtime Android

`npm run smoke:runtime` em `Advogado 2.0 - mobile` passou com exit code 0 e resultado `OK_COM_RESSALVAS`. O smoke detectou ADB, AVD e device bootado, validou backend local em `/health`, `GET /v1/areas` com 6 areas e `POST /v1/match` com status `stub`. Lacunas: `EXPO_PUBLIC_SUPABASE_ANON_KEY` ausente, portanto login real nao foi executado.

## Resultado Do Smoke Visual Android

O AVD `Pixel_9` recebeu Expo Go compativel com SDK 52 a partir do APK oficial `Expo-Go-2.32.20`. Como `npm run android` em modo nao interativo parou no prompt de versao da Expo CLI, o smoke visual usou `npx expo start --localhost --clear`, `adb reverse tcp:8081 tcp:8081` e deep link `exp://127.0.0.1:8081`. Resultado: app abriu sem crash e tela inicial renderizou no Android; screenshot em `harness-results/android-home-sdk52.png`; relatorio em `harness-results/android-visual-smoke.json`. Lacunas: sem `EXPO_PUBLIC_SUPABASE_ANON_KEY` no ambiente nem na `.env` local, entao login real, restauracao de sessao, areas via UI, permissao nativa e match via UI seguem pendentes.

## Resultado Do Smoke Visual Com Auth Real

Com `EXPO_PUBLIC_SUPABASE_ANON_KEY` presente na `.env` raiz, o ciclo carregou somente variaveis `EXPO_PUBLIC_*` no processo local. `npm run smoke:runtime` passou com exit code 0, device bootado, backend OK, 6 areas, match stub e login real do `usuario@advogado20.com` com token redigido. No Android visual, o app restaurou a sessao, carregou as 6 areas pela UI e manteve a explicacao de localizacao antes da acao. Lacuna restante: ao tentar localizacao concedida no AVD/Expo Go, mesmo com `adb emu geo fix`, o app retornou estado de localizacao indisponivel; por isso o botao `Buscar match` permaneceu desabilitado e o match via UI nao foi executado. Evidencias em `harness-results/android-auth-visual-smoke.json`, `android-auth-open.png`, `android-areas-ui.png`, `android-before-match.png` e `android-location-granted.png`.

## Resultado Da Correcao Do Fluxo De Login

O seletor `@PICK` foi usado e o time efetivo foi `@C10`, `@SPEC`, `@D`, `@M`, `@S`, `@GSD` e `@V`. A tela sem sessao agora mostra somente logo oficial, subtitulo, formulario de login e status; nao mostra areas, localizacao nem match antes do login. Apos login real, a Home/Match aparece com sessao do cliente e acoes de areas/localizacao. `npm run harness` e `npm run smoke:runtime` passaram com exit code 0. Evidencias: `harness-results/android-login-only.png`, `harness-results/android-post-login-home.png` e `harness-results/login-flow-visual-smoke.json`. Lacuna remanescente: localizacao/match via UI seguem pendentes pela indisponibilidade de coordenada no AVD/Expo Go.

## Resultado Do Fallback Dev De Localizacao Android

O seletor `@PICK` foi usado e o time efetivo foi `@C10`, `@PR`, `@M`, `@GEO`, `@S`, `@GSD` e `@V`. Historicamente houve fallback local de desenvolvimento para contornar instabilidade do AVD/Expo Go, mas ele foi removido em 2026-06-05 por risco de match sem localizacao real. A regra atual e: toda busca chama o provider nativo e, se permissao ou coordenada real falharem, o match fica bloqueado. `npm run harness` e `npm run smoke:runtime` seguem obrigatorios; smoke visual Android deve validar permissao concedida, permissao negada e provider indisponivel sem retorno de advogado.

## Resultado Da Permissao Negada Android

Sem mudanca de codigo, o AVD `Pixel_9` foi bootado e o Expo Go abriu o app via `exp://127.0.0.1:8081`. A permissao de localizacao do Expo Go foi revogada/negada e o app manteve a explicacao em contexto antes da acao. Ao acionar `Usar localizacao`, a Home exibiu estado claro de localizacao negada e manteve `Buscar match` desabilitado sem coordenada. Evidencias: `harness-results/android-location-denied-visual-smoke.json`, `android-denied-ready.png`, `android-denied-location-prompt.png` e `android-denied-location-state.png`.

## Resultado Do Rebuild Preview Da UX De Match

Em 2026-05-31, `npm run harness` passou com exit code 0 (typecheck, 8 testes e smoke estrutural). O `smoke:runtime` foi corrigido para autenticar antes do `POST /v1/match` e passou contra Railway com exit code 0: health OK, 6 areas, login real com token redigido e match autenticado `matched`. O rebuild preview EAS terminou com sucesso (`4352f306-53b9-4989-8eed-02bd71518dd3`). Lacuna bloqueante: nenhum Android apareceu no ADB; instalacao e smoke fisico da UX corrigida ficaram em `QUESTIONAR`.

## Resultado Da Spec 004 Mobile

Em 2026-05-31, o TDD vermelho registrou `npm run test` exit code 1 por service ausente e `npm run smoke` exit code 1 por service/screen ausentes. Apos a implementacao de `Home -> LawyerProfile -> WhatsApp`, `npm run harness` passou com exit code 0: typecheck, 9 testes e smoke estrutural. `npm run smoke:runtime` contra Railway passou com exit code 0: 6 areas, Auth real com token redigido, match `matched` e perfil seguro `verified=true`, duas areas, `hasForbiddenField=false`. O smoke visual Android no AVD `Pixel_9` demonstrou login, Home com match, CTA `Ver perfil`, tela `LawyerProfile`, voltar e CTA `Falar no WhatsApp`; como WhatsApp nao esta instalado no AVD, o handler externo aberto foi o Chrome.

## Resultado Do APK Preview Da Spec 004

Em 2026-05-31, o commit publicado `7d4bbdc08482c79b1feb41ceaeab158815219f26` foi validado como HEAD de `main...origin/main`. `npm run harness` em `Advogado 2.0 - mobile` passou com exit code 0; `git diff --check` passou com exit code 0. A primeira tentativa de `npm run smoke:runtime` sem env/device terminou com exit code 1; a repeticao com env preview EAS e AVD bootado passou com exit code 0 contra Railway: health OK, 6 areas, Auth real com token redigido, match `matched`, perfil `verified=true`, duas areas e `hasForbiddenField=false`.

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

Sem codigo novo e sem gerar APK novo, `npm run harness` passou com exit code 0 em `Advogado 2.0 - mobile`: typecheck, 10 testes e smoke estrutural passaram. O `npm run smoke:runtime`, carregando somente `EXPO_PUBLIC_*` da `.env` raiz sem imprimir valores e usando Railway, passou com exit code 0 (`OK_COM_RESSALVAS`): backend health OK, 6 areas, login real com token redigido, match `matched` e perfil seguro.

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

## Resultado Do Smoke Visual Android Da Spec 008 Parte 3

Em 2026-06-03, o gate visual Android proporcional da Parte 3 foi executado sem
Play Console, sem AAB, sem APK novo e sem feature nova. `npm run harness`
passou com exit code 0. `npm run smoke:runtime` contra
`https://advogado-back-production.up.railway.app`, carregando somente envs
publicas necessarias sem imprimir valores, passou com exit code 0 e resultado
`OK_COM_RESSALVAS`.

No AVD `Pixel_9` com Expo Go/Metro local, o fluxo cliente chegou a `Oracao`,
enviou pedido anonimo com texto neutro de teste e confirmou sucesso sem ecoar o
texto no XML pos-envio. A screenshot segura mantida foi
`harness-results/spec008p3-client-prayer-after-crop.png`.

Resultado: `REPROVADO`. Durante a tentativa do fluxo advogado
`Dashboard/Cartao/Perfil`, a automacao registrou senha de teste em XML bruto ao
preencher credenciais. O artefato bruto foi apagado, mas o gate visual Android
nao pode ser fechado como OK por regra de compliance. Lacuna: repetir o smoke
visual com entrada manual assistida ou metodo que nao capture campos de
credencial. Evidencia:
`harness-results/spec008-part3-visual-android-2026-06-03.md`.

## Resultado Da Spec 008 Parte 1R Replicacao Visual Cliente

Em 2026-06-03, o painel cliente foi refeito para seguir `Telas/home_do_cliente`
e o perfil completo do advogado foi redesenhado com base em
`Telas/perfil_do_advogado`, sem backend/schema/migration, sem APK/AAB e sem
Play Console. A Home do cliente passou a ter somente bottom nav `Home` e
`Perfil`; busca, aviso de localizacao, areas em cards quadrados horizontais,
advogado indicado, pedido de oracao e `Como funciona?` vivem na Home. O pedido
de oracao usa arte original `assets/prayer-bible-cross.png` e nao ecoa texto
sensivel. O perfil do advogado preserva CTA WhatsApp externo e a allowlist
publica segura.

Gates:

- `npm run harness`; exit code 0; typecheck, 12 testes e smoke estrutural.
- `npm run smoke:runtime` contra Railway; exit code 0; `OK_COM_RESSALVAS`, 6
  areas, Auth real com token redigido, match `matched` e perfil seguro.

Smoke visual Android: AVD `Pixel_9` e Expo Go/Metro local abriram o app.
Screenshots seguras confirmaram Home com `Home`/`Perfil`, areas horizontais e
bloco de oracao com Biblia/cruz:
`harness-results/spec008-client-home-visual-clean2.png` e
`harness-results/spec008-client-home-prayer-block.png`.

Resultado: `QUESTIONAR_SMOKE_VISUAL_ANDROID`. O AVD exibiu alerta de
`System UI isn't responding`; depois disso renderizou a tela, mas nao processou
toques de forma confiavel para concluir `Buscar match -> LawyerProfile ->
Voltar`. O contrato desse fluxo passou no runtime Railway. Evidencia:
`harness-results/spec008-client-home-replication-visual-2026-06-03.md`.

## Resultado Do Gate Visual Android Spec 008 Parte 1R

Em 2026-06-03, o gate visual Android pendente foi repetido sem backend/schema/migration,
sem APK/AAB e sem Play Console. `npm run harness` passou com exit code 0. O
`npm run smoke:runtime`, contra Railway e carregando somente `EXPO_PUBLIC_*`
necessarias sem imprimir valores, passou com exit code 0 (`OK_COM_RESSALVAS`):
6 areas, Auth real com token redigido, match `matched` e perfil seguro.

No AVD `Pixel_9`, via Expo Go/Metro local, o fluxo visual fechou:
`Home -> Buscar match -> Perfil completo do advogado -> Voltar para Home`. A
Home exibiu bottom nav somente `Home`/`Perfil`, areas juridicas em cards
quadrados horizontais e pedido de oracao acoplado com Biblia/cruz. O perfil
exibiu visual premium com hero/fallback, avatar, selo, OAB, cidade/UF, distancia
efemera, areas, bio/fallback e CTA WhatsApp. O WhatsApp externo nao foi acionado
para evitar handler com telefone completo.

Resultado: `SPEC008_CLIENTE_HOME_REPLICACAO_VISUAL_OK`. Screenshot de login com
e-mail de teste foi descartada; nao houve captura durante senha preenchida; XMLs
temporarios da Home autenticada foram removidos; nenhum texto de oracao foi
enviado ou registrado. Evidencia:
`harness-results/spec008-client-home-replication-visual-ok-2026-06-03.md`.

## Resultado Do Pacote Final Spec 003 AAB

Em 2026-06-03, a Spec 003 foi retomada como gate final de decisao para liberar ou
bloquear o ciclo de AAB internal testing, sem alterar produto/backend/schema, sem
APK/AAB novo e sem abrir Play Console.

Gates:

- `npm run harness`; exit code 0; typecheck, 12 testes e smoke estrutural passaram.
- `npm run smoke:runtime` contra Railway; exit code 0; `OK_COM_RESSALVAS`, com
  Auth real redigido, 6 areas, match `matched` e perfil seguro.
- Config Android/EAS: package `com.advogado20.app`, `versionCode=2`, EAS
  production `app-bundle/store`, backend Railway nos perfis EAS e fallback dev
  desligado.
- APK baseline da Spec 005 reconfirmado com `66185270` bytes e SHA-256 esperado.
- URLs publicas de politica, termos e exclusao responderam HTTP 200.

Resultado: `QUESTIONAR_COMPLIANCE_RELEASE`. `npm audit --omit=dev` retornou 17
vulnerabilidades de producao, sendo 12 altas e 5 moderadas, ainda sem triagem ou
aceite formal. O AAB tambem segue bloqueado por falta de confirmacao humana de
Play Console, EAS/keystore, conta de teste e Data Safety/Data deletion no console.
Evidencia:
`harness-results/spec003-final-aab-decision-package-2026-06-03.md`.

## Resultado Do Gate De Dependencias Spec 003

Em 2026-06-03, o bloqueio de producao do `npm audit --omit=dev` foi tratado sem
backend/schema/migration, sem feature nova, sem APK/AAB e sem Play Console. A
triagem inicial confirmou que o `fixAvailable` automatico exigia `expo@56.0.8`
com `isSemVerMajor=true`, portanto a rota de `npm audit fix --force`/Expo SDK
major foi descartada. A correcao aplicada foi por overrides transitivos
documentados para `@expo/plist/@xmldom`, `postcss`, `tar` e `uuid`, preservando
Expo SDK 52.

Gates:

- `npm audit --omit=dev --json`; exit code 1 antes da correcao; 17 vulnerabilidades
  de producao.
- `npm audit fix --omit=dev --dry-run --json`; exit code 1; proposta exigia
  `expo@56.0.8`.
- `npx expo install --check`; exit code 0; dependencias SDK 52 up to date.
- `npm audit --omit=dev`; exit code 0 apos correcao; `found 0 vulnerabilities`.
- `npm ls @xmldom/xmldom postcss tar uuid --all`; exit code 0; arvore coerente.
- `npm run harness`; exit code 0; typecheck, 12 testes e smoke estrutural passaram.
- `npm run smoke:runtime` contra Railway; exit code 0; `OK_COM_RESSALVAS`, Auth
  real redigido, 6 areas, match `matched` e perfil seguro.
- `git diff --check`; exit code 0; apenas avisos CRLF esperados no Windows.

Resultado: `SPEC003_DEPENDENCIAS_RELEASE_OK`. Audit total sem `--omit=dev` ainda
aponta tooling de desenvolvimento fora do gate solicitado. AAB continua bloqueado
por `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. Evidencia:
`harness-results/spec003-dependencias-release-audit-2026-06-03.md`.

## Resultado Do Gate Humano Final Spec 003 AAB

Em 2026-06-03, a Spec 003 foi retomada para preparar a decisao humana final do
AAB de internal testing, sem backend/schema/migration, sem feature nova, sem
APK/AAB e sem Play Console. O checklist assistido cobre Play Console/app
`com.advogado20.app`, track internal testing, EAS/keystore, conta de teste,
Data Safety/Data deletion, crash reporting adiado, versionCode/versionName e
rollback.

Gates:

- Inventario redigido de `app.json`/`eas.json`; exit code 0; package
  `com.advogado20.app`, version `0.1.0`, `versionCode=2`, production EAS
  `store/app-bundle`, envs apenas `EXPO_PUBLIC_*` e fallback dev desligado.
- `npm audit --omit=dev`; exit code 0; `found 0 vulnerabilities`.
- `npm audit --omit=dev --json`; exit code 0; total `0`.
- `npm run harness`; exit code 0; typecheck, 12 testes e smoke estrutural passaram.
- `npm run smoke:runtime` contra Railway; exit code 0; `OK_COM_RESSALVAS`, Auth
  real redigido, 6 areas, match `matched` e perfil seguro.
- `git diff --check`; exit code 0; apenas avisos CRLF esperados no Windows.

Resultado: `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. A parte local esta pronta para
decisao humana, mas nenhuma confirmacao humana objetiva foi fornecida nesta
sessao. Evidencia:
`harness-results/spec003-gate-humano-final-aab-2026-06-03.md`.

## Resultado Do Gate Compliance Oracao Spec 008 Parte 3

Em 2026-06-03, o foco saiu de Play Console/AAB e voltou para compliance de
`prayer_requests`. Nao houve mudanca visual, APK ou AAB. O mobile foi revalidado
proporcionalmente porque consome `POST /v1/prayer-requests` pela Home.

Gates:

- `npm run harness`; exit code 0; typecheck, 12 testes e smoke estrutural passaram.
- Primeira tentativa de `npm run smoke:runtime`; exit code 1 por falta de
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` no processo, sem expor valor.
- Repeticao correta carregando somente `EXPO_PUBLIC_*` da `.env` raiz e Railway;
  exit code 0; `OK_COM_RESSALVAS`, Auth real com token redigido, 6 areas, match
  `matched` e perfil seguro.

Resultado: `SPEC008_PARTE3_RETENCAO_ORACAO_PUBLICADA_OK` no backend/compliance,
com mobile preservado. Lacuna visual Android da Parte 3 continua separada;
nenhum texto de oracao foi enviado pelo mobile neste ciclo.

## Resultado Do Polimento Visual Mobile Spec 008 Parte 1R

Em 2026-06-03, o feedback do APK de teste apontou que os icones nao apareciam no
menu inferior, nas areas juridicas e no `Como funciona?`, que o topo autenticado
estava pesado com logo lateral e textos de marca/sessao, que o aviso de
localizacao estava visualmente agressivo no topo e que botoes/detalhes podiam
ficar mais dourados.

Implementacao:

- `src/components/AppIcon.tsx` passou a renderizar icones reais por `react-native-svg`,
  sem `Ionicons`, `@expo/vector-icons`, `expo-font` ou `useFonts`.
- Home autenticada passou a mostrar somente a logo centralizada no topo, com
  cantos arredondados.
- Bottom nav, cards de areas juridicas e `Como funciona?` ganharam badges de
  icone em dourado de alto contraste.
- Cards de areas juridicas ficaram maiores, com labels em ate duas linhas e
  nomes mais legiveis sem o prefixo repetitivo `Direito`.
- O aviso de localizacao saiu do topo e virou nota discreta no fim da Home,
  sem negrito, borda ou card pesado.
- Botoes primarios/secundarios e detalhes passaram a usar dourado mais forte.

Gates:

- `npm run typecheck`; exit code 0.
- `npm run smoke`; exit code 0; smoke estrutural reprova retorno de glyphs
  textuais, `Ionicons`, fonte runtime fragil, `goldGradientLayer` e assets
  oficiais ausentes.
- `npm run harness`; exit code 0; typecheck, 12 testes e smoke estrutural.
- `npm run smoke:runtime` contra Railway; exit code 0; `OK_COM_RESSALVAS`, Auth
  real com token redigido, 6 areas, match `matched` e perfil seguro.
- `git diff --check`; exit code 0; apenas avisos CRLF esperados no Windows.

Resultado: `SPEC008_PARTE1R_POLIMENTO_VISUAL_MOBILE_OK`. Smoke visual Android
nao foi executado neste ciclo porque nenhum device Android estava
conectado/bootado; nenhum APK/AAB foi gerado e Play Console nao foi aberto.

## Resultado Do Padrao SVG, Botoes E Logo Oficial

Em 2026-06-04, o padrao definitivo de icones mobile foi trocado do hotfix
textual para SVG componentizado. A solucao mira APK standalone: `react-native-svg`
e compilado no bundle nativo, sem esperar carregamento de fonte externa.

Implementacao:

- `react-native-svg@15.8.0` instalado com `npx expo install react-native-svg`.
- `@expo/vector-icons` e `expo-font` removidos das dependencias diretas e
  `expo-font` removido dos plugins Expo.
- `AppIcon` cobre bottom nav, areas, passos, WhatsApp, redes sociais, metricas,
  check, alerta, localizacao, refresh, logout e beneficios.
- `goldGradientLayer` removido dos botoes; botao ativo usa `#D99A2D` solido e
  estado desabilitado usa `disabledSurface`/`disabledBorder`.
- `assets/logo-blue.png` definido como logo oficial Android para `icon`,
  `splash.image` e `android.adaptiveIcon.foregroundImage`.

Gates:

- `npm run typecheck`; exit code 0.
- `npm run test -- --run tests/contracts.test.ts`; exit code 0; 14 testes.
- `npm run smoke`; exit code 0.
- `npm run harness`; exit code 0.
- `npm run smoke:runtime` contra Railway; exit code 0; `OK_COM_RESSALVAS`,
  Auth real redigido, 6 areas, match `matched` e perfil seguro.
- `npx eas build --platform android --profile preview --non-interactive`;
  exit code 0; build `b478e26d-fc92-44b6-95bd-4128ec1d76e9`.

Artefato:

- Link direto: `https://expo.dev/artifacts/eas/ohym3qbnEuZkWgxkRvTqUr.apk`.
- Arquivo local: `harness-results/icons-svg-preview-e2248a3-b478e26d.apk`.
- SHA-256: `C6E5B88516979FA55827DF25B12A687D4CC690A8A125CA5D9AA7E290F80D16A1`.
- Evidencias standalone seguras: `icons-svg-launcher-app-icon.png`,
  `icons-svg-login-safe.png` e `icons-svg-reopen.png`.

Ressalvas:

- Screenshots autenticados de Home cliente, Home advogado, Beneficios e Perfil
  no APK ficaram pendentes porque o AVD nao tinha ADB Keyboard e a entrada
  segura por coordenadas fechava o app. O fluxo autenticado passou no
  `smoke:runtime`.
- Play Store ainda precisa de aprovacao humana de margem do icone, feature
  graphic, screenshots, icone monocromatico se adotado e Data Safety.
