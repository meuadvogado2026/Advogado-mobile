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
