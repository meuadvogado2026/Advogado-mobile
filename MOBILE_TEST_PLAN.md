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
