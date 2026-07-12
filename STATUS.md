# Mobile Status - Advogado 2.0

## Play Store Validation Detalhada - 2026-07-04

Status: `NAO_ENVIAR_PRODUCAO_AINDA_COM_BASE_TECNICA_OK`.

Gates mobile aprovados: `npm run harness`, `npm audit --omit=dev`,
`npx expo install --check`, `npx expo-doctor@latest` 21/21 e config production
com package `com.advogado20.app`, `versionCode=3`, API 36 e
`usesCleartextTraffic=false`. `smoke:runtime` autenticou usuario real e validou
backend/areas, mas ficou `FALHOU` por nao haver Android bootado e porque o fluxo
GPS automatico retornou `empty`; para revisao Google, usar roteiro por
cidade/regiao. Validacao autenticada em producao confirmou `Taguatinga/DF` e
`Cruzeiro/DF` com `Direito Civil`.

Lacunas antes de AAB/Play: identidade/telefone Console, closed testing da conta
pessoal, AAB production EAS/remote keystore, decisao Railway vs OceanDriver,
forms Play Console, screenshots finais, e-mails definitivos, e limpeza
preventiva de copy/link externo na landing para evitar ambiguidade com pagamento.
Relatorio raiz: `../PLAYSTORE_VALIDATION_DETAILED_2026-07-04.md`.

## Copy Play Store Sem Ambiguidade De Pagamento - 2026-07-04

Status: `COPY_PLAYSTORE_OK_COM_LACUNA_BUILD_REAL_SCREENSHOTS`.

Painel mobile removeu copy publica `VIP`, `WhatsApp VIP` e `Acessar resgate`.
Beneficios seguem disponiveis para advogados aprovados como `ADVOGADO 2.0 CLUBE`
e `BENEFICIOS PARA ADVOGADOS`, sem compra ou assinatura dentro do app. Smoke
estrutural foi atualizado para exigir `Falar no WhatsApp` e
`LawyerBenefitsCard`; `npm run harness` passou com 19 testes.

Lacuna: ainda nao foi gerado APK/AAB novo depois dessa limpeza, portanto
screenshots finais da Play nao devem ser capturadas do APK preview antigo.

## Play Store Validation - 2026-07-03

Status: `APROVADO_TECNICAMENTE_COM_LACUNAS_DE_PLAY_CONSOLE`.

Linha mobile revalidada para Play Store: `targetSdkVersion=36`,
`compileSdkVersion=36`, `versionCode=3`, package `com.advogado20.app`,
`usesCleartextTraffic=false`, permissao apenas de localizacao foreground e
paginas legais publicadas em `https://advogado20.vercel.app/`.

Patches Expo SDK 56 alinhados para `expo ~56.0.14`,
`expo-build-properties ~56.0.21` e `expo-constants ~56.0.20`. Gates aprovados:
`npm run harness`, `npm audit --omit=dev`, `npx expo install --check` e
`npx expo-doctor@latest`. Backend de producao tambem passou em smoke/harness.

Lacunas antes do AAB final: Play Console precisa concluir identidade/telefone,
conta pessoal precisa de closed testing com 12 testers por 14 dias, `eas.json`
ainda aponta para Railway apesar da decisao futura por OceanDriver, falta AAB
production via EAS/remote keystore, screenshots reais, forms do Play Console e
App access. Para revisor, usar cidade/regiao `Taguatinga/DF` ou `Cruzeiro/DF`
com area `Direito Civil`; nao depender do GPS real do avaliador.

## Legal Pages Vercel + Expo Go - 2026-07-03

Status: `LEGAL_URLS_OFICIAIS_NO_APP_COM_DOMINIO_BLOQUEADO`.

Links legais do mobile foram atualizados para
`https://advogado20.vercel.app/privacidade.html`,
`https://advogado20.vercel.app/termos.html` e
`https://advogado20.vercel.app/exclusao-de-dados.html` em
`HomeScreen` e `LawyerProfileScreen`. O dominio oficial
`advogado20.vercel.app` esta ocupado em outro projeto/deploy e retornou 404
para as paginas legais em 2026-07-04. Nao gerar AAB final nem enviar para Play
ate publicar a landing limpa e validar HTTP 200 nesse dominio.

Gates: `npm run smoke`, `npm test -- --run tests/contracts.test.ts` com 19
testes e `npm run typecheck` OK. Metro/Expo Go iniciado em LAN na porta `8082`
para reload imediato.

## Lawyer Dashboard Cards - 2026-07-03

Status: `LAWYER_DASHBOARD_CARDS_SIMPLIFICADOS_EXPO_GO_OK`.

Painel do advogado simplificado no Expo Go: removidos os cards `Taxa de contato`
e `Status`, mantendo apenas `Visitas` e `WhatsApp`. Smoke estatico agora reprova
se esses cards voltarem. Gates: `npm run typecheck`, `npm run smoke` e
`npm run test` OK; Metro LAN `exp://192.168.1.3:8083` rebundlou o app.

## Lawyer Insights Production - 2026-07-03

Status: `LAWYER_INSIGHTS_PRODUCAO_OK`.

Migration `0015_lawyer_events.sql` aplicada no Supabase remoto pelo SQL Editor e
validada contra backend Railway. Eventos reais de `profile_view` e
`whatsapp_click` retornaram `201 recorded=true`, dedupe retornou
`200 duplicate=true` e o dashboard agregou visitas, WhatsApp, contatos e taxa de
contato. Eventos de verificacao foram limpos. `npm run prod:smoke` do backend OK.

## Lawyer Insights - 2026-07-03

Status: `LAWYER_INSIGHTS_EVENTS_LOCAL_OK_COM_LACUNA_MIGRATION_SUPABASE`.

O app passou a registrar eventos de insight pelo backend: `profile_view` ao
carregar `LawyerProfileScreen` com sucesso e `whatsapp_click` antes de abrir o
WhatsApp. Se o registro falhar ou demorar, o WhatsApp continua abrindo. O painel
do advogado ganhou cards de visitas, WhatsApp, taxa de contato e status do perfil.

Gates: teste focado falhou antes por ausencia de `lawyerEventService` e passou
apos o diff; `npm run typecheck`, `npm run test` (19), `npm run smoke` e
`npm run harness` OK. Lacuna operacional: producao so contabiliza apos backend
publicado e migration `0015_lawyer_events.sql` aplicada no Supabase remoto.

## Client Test Preview APK - 2026-07-02

Status: `CLIENT_TEST_PREVIEW_APK_SDK56_VC3_GERADO_COM_LACUNA_SMOKE_AVD`.

Build EAS `preview` Android gerado para teste do cliente, sem Play Store e sem
`production AAB`. Build ID `2ea104ab-6433-4310-b213-78e23b996af3`, distribution
`internal`, SDK `56.0.0`, app version `0.1.0`, versionCode `3`, package
`com.advogado20.app`. Link do build:
`https://expo.dev/accounts/advogado2.0/projects/meu-advogado-20/builds/2ea104ab-6433-4310-b213-78e23b996af3`.
APK remoto:
`https://expo.dev/artifacts/eas/jrPm4l5y8q5i1Ci-s7QVz1PL5UpUrNn-_nugrloOs1s.apk`.

Artefato local baixado em
`harness-results/client-test-preview-sdk56-vc3-2026-07-02.apk`, tamanho
`85267578` bytes, SHA-256
`CD4EC11EB2736688C3922406A02AE74B006A7DEA8BB89AAFCA64D4F871A48AC9`.

Antes do build foram alinhados patches Expo SDK 56 exigidos por `expo-doctor`:
`expo ~56.0.13`, `expo-asset ~56.0.18`, `expo-build-properties ~56.0.20`,
`expo-constants ~56.0.19` e `expo-location ~56.0.19`. Gates: `expo-doctor`
21/21, `expo install --check`, `npm audit --omit=dev`, typecheck, 18 testes,
smoke e harness OK. Auditoria do APK: `aapt dump badging` confirmou package/API/
permissoes, `zipalign -P 16` aprovado e `apksigner` v2 aprovado.

Lacuna: smoke de instalacao/abertura no AVD local nao fechou porque o `Pixel_9`
estava com `/data` 92% usado; `adb install` travou apos erro inicial
`INSTALL_FAILED_INSUFFICIENT_STORAGE`. Validar instalacao no device do cliente ou em
AVD limpo. Cota EAS apos build: Android `1/15`, total `1/30` no ciclo iniciado em
2026-07-01.

Evidencia:
`harness-results/client-test-preview-sdk56-vc3-2026-07-02.md`.

## Docs Legais Play Store - 2026-07-02

Status: `DOCS_LEGAIS_PLAYSTORE_ATUALIZADOS_COM_LACUNAS_CLIENTE`.

O DOCX `../INFORMAÇÕES-ADVOGADO 2.0.docx` foi processado sem gerar builder, APK ou
AAB. Dados incorporados: ELO PERFORMANCE PROFISSIONAL LTDA, CNPJ
`65.999.860/0001-26`, endereco em Taguatinga Norte/DF, WhatsApp de suporte
`+55 61 99357-4056`, nome final `Advogado 2.0`, categoria juridico, Brasil, publico
adulto, sem anuncios, assinatura mensal, dados coletados confirmados, advogados
iniciais autorizados e declaracao de que o app nao promete exito, preco, desconto ou
resultado.

Arquivos atualizados: `../advogado-legal/privacidade.html`,
`../advogado-legal/termos.html`, `../advogado-legal/exclusao-de-dados.html`,
`../advogado-legal/index.html`, `../DATA_SAFETY_DRAFT.md`,
`../PLAYSTORE_CLIENTE_DOCUMENTOS_CHECKLIST.md`, `../PLAYSTORE_READINESS.md`,
`MOBILE_RELEASE.md` e `../STATUS.md`.

Bloqueios antes de novo builder de loja: publicar/validar as paginas legais
atualizadas na URL publica, confirmar email/dominio oficiais, detalhar operadores e
terceiros, definir regra/prazo de exclusao, detalhar assinatura mensal e impacto de
Google Play Billing, harmonizar retencao de 5 anos informada no DOCX com rotinas
tecnicas de 90 dias para eventos sensiveis, confirmar Play Console/keystore/EAS,
maior `versionCode`, conta de teste e alinhar os patches Expo SDK 56 apontados por
`expo-doctor`.

## Geo Catalogo Independente De Area - 2026-06-25

Status: `GEO_CATALOG_INDEPENDENTE_AREA_OK`.

Home cliente ajustada em `src/screens/HomeScreen.tsx`: Estado e Cidade carregam
quando o usuario cliente esta autenticado, sem depender de area juridica selecionada
e sem recarregar o catalogo a cada troca de area. `src/services/geographyService.ts`
passou a chamar `/v1/states` e `/v1/states/:stateId/cities` sem `areaIds`.

A area juridica continua obrigatoria para executar `POST /v1/match` e
`POST /v1/match/by-city`, preservando a compatibilidade do resultado de advogados.
Regressao em `tests/contracts.test.ts` cobre catalogo sem query de area e match por
cidade ainda com `areaIds`; `scripts/smoke.ts` valida estruturalmente essa separacao.

Gates: TDD focado falhou antes e passou depois, `npm run typecheck`, teste focado,
`npm run smoke` e `npm run harness` OK. Sem alteracao de permissao, SDK, APK/AAB ou
Play Console.

## Home Orbit Layout - 2026-06-25

Status: `MOBILE_HOME_ORBIT_LAYOUT_VISUAL_ANDROID_OK`.

Home cliente ajustada em `src/screens/HomeScreen.tsx`: os cards nao selecionados
ficaram mais discretos, e a area selecionada passa a ter fundo dourado solido,
texto/icone escuros, borda clara, sombra mais forte e marcador com check. O mascote
ganhou um centro maior no orbit, com halo e linhas conectoras sutis inspiradas na
referencia visual holografica, sem alterar handlers de area, ajuda, busca por
localizacao ou busca por cidade.

Regressao em `tests/contracts.test.ts` e `scripts/smoke.ts`: o layout agora exige
`SPECIALTY_CENTER_SIZE`, `SPECIALTY_LINE_COLOR`, halo, conector e marcador de
selecao. TDD proporcional: o teste focado falhou antes por ausencia de
`SPECIALTY_CENTER_SIZE` e passou apos o diff.

Gates: teste focado OK, `npm run typecheck` OK, `npm run smoke` OK e `npm run
harness` OK. Smoke visual Android no AVD `Pixel_9` via Expo Go/tunnel confirmou a
Home autenticada com Familia selecionada bem destacada e robô com mais respiro.
Evidencia: `harness-results/layout-orbit-final-no-toast-2026-06-25.png`. Sem
backend, admin, schema, permissao, dependencia, EAS build, APK/AAB ou Play Console.

## Home Areas Palette And Generic WhatsApp - 2026-06-19

Status: `MOBILE_HOME_AREAS_GOLD_COPY_VISUAL_ANDROID_OK`.

Home cliente ajustada em `src/screens/HomeScreen.tsx`: todos os cards do hub de
areas juridicas agora compartilham a mesma paleta amarela do Civil via
`SPECIALTY_AREA_COLOR = "#FFD34D"` e `SPECIALTY_AREA_RGB = "255,211,77"`, mantendo
os icones especificos de cada area. O alerta de duvida e as mensagens de WhatsApp
foram alterados para copy generica do canal de atendimento, sem nome proprio.

Regressao em `tests/contracts.test.ts`: o teste focado passou a exigir a paleta
unica, bloquear as cores antigas por area e impedir retorno do nome no arquivo da
Home. TDD proporcional: o teste focado falhou antes da implementacao e passou depois
com 17 testes.

Gates: `npm run test -- --run tests/contracts.test.ts` OK, `npm run harness` OK
(typecheck, 17 testes e smoke estrutural) e busca global pelo nome solicitado sem
resultados. Smoke visual Android fechado no AVD `Pixel_9` via Expo Go/Metro local
na porta `8092`; evidencia em `harness-results/home-gold-auth-final.png`. Sem EAS
build, APK/AAB, Play Console, permissao, SDK, dependencia, API ou schema novo.

## Spec 003 - Production AAB Local - 2026-06-16

Veredito:
`AAB_LOCAL_GRADLE_SDK56_16KB_ESTATICO_OK_COM_LACUNA_EAS_CLOUD_PLAY_RUNTIME_16KB`.

O passo recomendado (`production AAB`) foi autorizado. `android.versionCode` foi
alterado de `2` para `3` em `app.config.ts`, preservando package
`com.advogado20.app`, version `0.1.0`, compile/target API 36 e workflow managed na
arvore principal. `scripts/smoke.ts` passou a exigir `versionCode: 3`.

Gates locais pre-build passaram: config production redigida confirmou
`usesCleartextTraffic=false`, `npx expo-doctor@latest` 21/21, `npx expo install
--check`, `npm audit --omit=dev`, typecheck, 17 testes, smoke, Harness e
`git diff --check`.

EAS Build cloud `production` foi tentado e bloqueado por cota Android Free da conta
Expo ate `2026-07-01`. EAS local Android tambem foi tentado e bloqueado porque o modo
local exige macOS ou Linux. Como alternativa nao-cloud, foi gerado AAB local via Gradle
em copia temporaria curta, sem criar pasta `android/` neste repo.

Artefato:
`harness-results/spec003-sdk56-vc3-local-gradle-release.aab`.

- Tamanho: `57509366` bytes.
- SHA-256: `08165B17F183B5695FA5B067DAB91929FEF02A187FC2627A0C987BF8BA530D5A`.
- Manifest: package `com.advogado20.app`, versionCode `3`, versionName `0.1.0`,
  minSdk `24`, targetSdk `36`.
- BundleConfig: `PAGE_ALIGNMENT_16K`.
- ZIP: `zipalign -P 16` aprovado.
- ELF: 36 bibliotecas 64-bit auditadas, 18 ARM64 + 18 x86_64, 0 falhas, menor
  `LOAD align=16384`.

Lacunas: o AAB local usa assinatura debug padrao do prebuild e nao substitui AAB EAS
com remote keystore; ainda faltam Play Console/App Bundle Explorer, runtime em page
size 16 KB, Data Safety/App access/politica/disclosures, conta de teste, crash
reporting ou adiamento formal e rollback.

Evidencia:
`../.codex/specs/changes/003-validacao-android-release-interno/build-gate-production-aab-local-2026-06-16.md`.

## Spec 003 - Build Gate Preflight - 2026-06-16

Veredito:
`BUILD_GATE_PREFLIGHT_OK_SEM_BUILD_AGUARDA_ESCOLHA_EXPLICITA_PROFILE`.

Preflight EAS executado sem iniciar build cloud. `eas-cli` disponivel, sessao
autenticada e projeto remoto confirmado como `@advogado2.0/meu-advogado-20`
com `projectId` `089e477d-8af2-4c3b-a9f6-47fe25886860`. Perfis redigidos:
`preview=apk/internal` e `production=app-bundle/store`, ambos com envs publicas.
Config publica Expo confirmou package `com.advogado20.app`, versionCode `2`,
permissoes de localizacao e plugins esperados.

Consulta aos ultimos builds Android remotos indicou apenas APKs `preview` de SDK 52,
app version `0.1.0` e appBuildVersion/versionCode `2`; nenhum AAB SDK 56 foi
encontrado. URLs temporarias/signed URLs de logs/artefatos nao foram copiadas para
docs. `eas build:version:get --platform android --profile production` retornou exit
`1` porque o projeto usa `appVersionSource=local`; o maior `versionCode` precisa ser
confirmado no Play Console antes de build de loja.

Decisao: aguardando confirmacao literal do artefato antes de build cloud:
`production AAB` para gate de loja/16 KB ou `preview APK` para validacao interna.
Sem AAB release SDK 56 novo e auditado, o veredito maximo permanece
`APROVADO_LOCALMENTE_COM_LACUNA_AAB_RELEASE_RUNTIME_16KB`.

Evidencia:
`../.codex/specs/changes/003-validacao-android-release-interno/build-gate-preflight-2026-06-16.md`.

## Home Layout Polish - 2026-06-15

Status: `MOBILE_HOME_LAYOUT_POLISH_VISUAL_ANDROID_OK`.

Refino visual aplicado somente em `HomeScreen.tsx`, com regressao em
`tests/contracts.test.ts` e reforco em `scripts/smoke.ts`. Areas de atuacao inativas
agora usam fundo/borda mais neutros e icones menos saturados; areas selecionadas usam
cor viva, sombra/elevacao maior e texto destacado. A logo da tela de login e a logo do
topo autenticado foram aumentadas de forma perceptivel. A interrogacao do mascote foi
reduzida para `30x30`, com icone controlado por `SPECIALTY_HELP_ICON_SIZE` e alvo de
toque acessivel `44x44`. Ao tocar, o usuario recebe uma orientacao em alerta
nativo e so abre o WhatsApp do canal de atendimento ao confirmar `Falar no WhatsApp`, com mensagem
padrao de duvida sobre qual area escolher.

Gates: `npm run typecheck` OK, `npm run test` OK (17 testes), `npm run smoke` OK,
`npm run harness` OK e `git diff --check` OK com avisos CRLF esperados no Windows.
`npm run smoke:runtime` contra Railway confirmou `/health` e 8 areas, mas nao fechou
login/match/perfil sem runtime completo. O smoke visual foi fechado no AVD `Pixel_9`
com Expo Go `56.0.1`: a causa das falhas anteriores era Metro em `--localhost`
ouvindo apenas em `::1`; com LAN/IPv4 e deep link `exp://10.0.2.2:8090`, o app
carregou, fez login com anon key publica carregada sem imprimir valor, exibiu a Home,
os cards de areas, o estado selecionado e o alerta da interrogacao. O botao
`Falar no WhatsApp` nao foi acionado para evitar preservar URL/telefone em screenshot.
Relatorio: `harness-results/home-layout-polish-2026-06-15.md`.

Nao houve EAS build, APK/AAB, alteracao de Android package, permissao, SDK, backend,
admin, schema ou contrato de API.

## Spec 003 - State Build Gate - 2026-06-15

Veredito:
`SPEC003_STATE_BUILD_GATE_LOCAL_OK_AGUARDA_CONFIRMACAO_HUMANA_EAS_AAB`.

A retomada da Spec 003 foi executada sem build e sem EAS cloud. Baseline mobile SDK 56:
`npx expo-doctor@latest` 21/21, `npx expo install --check`, `npm audit --omit=dev`,
`npm run typecheck`, `npm run test` 17/17, `npm run smoke`, `npm run harness` e
`git diff --check` passaram com exit `0`. `npm audit` total segue com 5 achados em
tooling dev (`vitest`/`vite`/`esbuild`), fora do gate de producao.

Config confirmada: package `com.advogado20.app`, versionCode `2`, API 36, EAS
`preview=apk/internal`, `production=app-bundle/store`, `appVersionSource=local`.
Nenhum segredo privado versionado foi identificado no mobile; as envs publicas inline
em `eas.json` seguem como risco de governanca/rotacao. Links legais publicados
respondem HTTP 200, mas a politica publica ainda nao cobre oracao, retencao de 90 dias
e localizacao precisa.

Proximo passo bloqueado por confirmacao humana: Play Console/app, EAS/keystore, conta
de teste/App access, Data Safety/Data deletion, politica atualizada, crash reporting
ou adiamento formal, versionCode maior que o console e rollback. Sem AAB release SDK 56
novo auditado, o gate 16 KB completo permanece aberto.

Evidencia:
`../.codex/specs/changes/003-validacao-android-release-interno/state-build-gate-2026-06-15.md`.

## Spec 013 - Validacao Final SDK 52 -> 56 - 2026-06-15

Veredito:
`LINHA_CERTA_CONFIRMADA_PARA_SPEC003_BUILD_GATE_COM_LACUNA_AAB_RELEASE_RUNTIME_16KB`.

A arvore mobile atual foi revalidada apos a transicao completa de Expo SDK 52 para
SDK 56. Estado instalado: Expo `56.0.12`, React Native `0.85.3`, React `19.2.3`,
TypeScript `6.0.3`, Android compile/target API 36, package `com.advogado20.app` e
versionCode 2. `app.config.ts` preserva o workflow managed, sem pasta `android/`
gerada ao final.

Gates finais repetidos: `npx expo-doctor@latest` 21/21, `npx expo install --check`,
`npm audit --omit=dev`, `npm run typecheck`, `npm run test` 17/17, `npm run smoke`,
`npm run harness`, `npm run smoke:runtime` com backend/Auth locais controlados e
`git diff --check`, todos com exit `0`. `npm audit` total conserva 5 achados apenas
no tooling dev, cuja correcao exige major de Vitest.

APKs debug SDK 56 x86_64 e ARM64 permanecem presentes com hashes esperados e ja
auditados no checkpoint em assinatura v2, ZIP 16 KB e ELF `LOAD >= 2**14`. Sem AAB
release novo, sem runtime em kernel 16 KB e sem Play Console, o gate 16 KB completo
continua aberto. Nenhum EAS cloud foi usado.

Evidencia:
`../.codex/specs/changes/013-upgrade-expo-playstore-16kb/final-validation-sdk56-2026-06-15.md`.

## Spec 013 - Checkpoint SDK 56 - 2026-06-15

Veredito:
`SDK56_APROVADO_LOCAL_COM_LACUNA_AAB_RELEASE_RUNTIME_16KB`.

Mobile atualizado para Expo `56.0.12`, React Native `0.85.3`, React `19.2.3`
e TypeScript `6.0.3`. Hermes v1 default do SDK 56 foi aceito e validado por
build/smoke. New Architecture/Fabric e edge-to-edge permanecem obrigatorios.
Android permanece em compile/target API 36. Package `com.advogado20.app` e
versionCode 2 foram preservados. `expo-status-bar` foi adicionado aos plugins
porque o CLI nao escreve automaticamente em `app.config.ts` dinamico.

Gates finais: `npm ci`, `npx expo-doctor@latest` 21/21,
`npx expo install --check`, `npm audit --omit=dev` com 0 vulnerabilidades,
typecheck, 17/17 testes, smoke, Harness, runtime local controlado e
`git diff --check` em exit `0`. O audit total conserva 5 achados somente no
tooling dev, sem aplicar update major por `--force`.

Artefatos locais:

- `harness-results/sdk56-debug-x86_64.apk`: `57155454` bytes, SHA-256
  `9DDDDA0F741F5C54E4573BAD7FDADA1CF9937A6C814C6A1BCAA6BE42FB6B790D`.
- `harness-results/sdk56-debug-arm64-v8a.apk`: `57480412` bytes, SHA-256
  `10DBD8F16D6826B3EA61A72B72EFC0426A611820784806AA5213A8E199B76F9E`.

Ambos passaram assinatura v2, package/versionCode/API 36, ZIP 16 KB e ELF
`LOAD >= 2**14` em 18/18 bibliotecas por ABI. O AVD usa page size 4096;
AAB release ARM64, runtime em kernel 16 KB e Play Console continuam pendentes.
Nenhum EAS cloud foi usado.

Smoke visual autenticado confirmou prompt nativo de localizacao, listagem por
cidade e perfil profissional. O runtime local deterministico validou Auth, 8 areas,
match `matched` e perfil publico seguro.

Evidencia:
`../.codex/specs/changes/013-upgrade-expo-playstore-16kb/checkpoint-sdk56-2026-06-15.md`.

## Spec 013 - Checkpoint SDK 55 - 2026-06-15

Veredito:
`SDK55_APROVADO_LOCAL_PRONTO_PARA_SDK56_COM_LACUNA_AAB_RELEASE_RUNTIME_16KB`.

Mobile atualizado para Expo `55.0.26`, React Native `0.83.6`, React `19.2.0`
e TypeScript `5.9.3`. New Architecture/Fabric e edge-to-edge sao obrigatorios
no SDK 55; as chaves obsoletas de opt-out foram removidas. Android permanece em
compile/target API 36. Package `com.advogado20.app` e versionCode 2 foram
preservados.

Gates finais: `npm ci`, `npx expo-doctor@latest` 19/19,
`npx expo install --check`, `npm audit --omit=dev` com 0 vulnerabilidades,
typecheck, 17/17 testes, smoke, Harness, runtime local controlado e
`git diff --check` em exit `0`. O audit total conserva 5 achados somente no
tooling dev, sem aplicar update major por `--force`.

Artefatos locais:

- `harness-results/sdk55-debug-x86_64.apk`: `52320526` bytes, SHA-256
  `6C3ACBAA26B8591AB1B1ADE66D8EFCF8107A85938D4E490162BD306EF7619892`.
- `harness-results/sdk55-debug-arm64-v8a.apk`: `52572761` bytes, SHA-256
  `6721E1A1D7F45007B6044F6B4C7E7D0BF3A3C228359EDAE650C58266B81F37DD`.

Ambos passaram assinatura v2, package/versionCode/API 36, ZIP 16 KB e ELF
`LOAD >= 2**14` em 17/17 bibliotecas por ABI. O AVD usa page size 4096;
AAB release ARM64, runtime em kernel 16 KB e Play Console continuam pendentes.
Nenhum EAS cloud foi usado.

Smoke visual autenticado confirmou Login, Home cliente e Perfil com Fabric ativa.
O runtime staging retornou match `empty`, mas o runtime local deterministico
validou Auth, 8 areas, match `matched` e perfil publico seguro.

Evidencia:
`../.codex/specs/changes/013-upgrade-expo-playstore-16kb/checkpoint-sdk55-2026-06-15.md`.

## Spec 013 - Checkpoint SDK 54 - 2026-06-15

Veredito:
`SDK54_APROVADO_LOCAL_PRONTO_PARA_SDK55_COM_LACUNA_AAB_ARM64_RUNTIME_16KB`.

Mobile atualizado para Expo `54.0.35`, React Native `0.81.5`, React `19.1.0`
e TypeScript `5.9.3`. New Architecture/Fabric permaneceu ativa. Android passou
para compile/target API 36 e `edgeToEdgeEnabled=true`. O package
`com.advogado20.app` e o versionCode 2 foram preservados.

Gates finais: `npm ci`, `npx expo-doctor` 18/18, `npx expo install --check`,
`npm audit --omit=dev` com 0 vulnerabilidades, typecheck, 17/17 testes, smoke,
Harness e runtime local controlado em exit `0`. O audit total conserva 5 achados
somente no tooling dev (`vitest`/`vite`/`esbuild`), sem `--force`.

Artefato local `harness-results/sdk54-debug-x86_64.apk`: `48736523` bytes,
SHA-256 `0F5B9B71BF89E0617B1CF814AB8768187559E164C8A4666C9EABA033155FB3A5`.
Assinatura v2, package/target 36, ZIP 16 KB e ELF `LOAD >= 2**14` em 17/17
bibliotecas x86_64 passaram. O AVD usa page size 4096; AAB release ARM64,
runtime 16 KB e Play Console continuam pendentes. Nenhum EAS cloud foi usado.

Smoke visual autenticado confirmou login, Home cliente e Perfil sem sobreposicao
edge-to-edge. O runtime staging retornou match `empty`, mas o runtime local
deterministico validou match `matched` e perfil publico seguro.

Evidencia:
`../.codex/specs/changes/013-upgrade-expo-playstore-16kb/checkpoint-sdk54-2026-06-15.md`.

## Spec 013 - Checkpoint SDK 53 - 2026-06-14

Veredito:
`SDK53_APROVADO_LOCAL_PRONTO_PARA_SDK54_COM_LACUNA_AAB_ARM64_RUNTIME_16KB`.

Mobile atualizado para Expo `53.0.27`, React Native `0.79.6`, React `19.0.0`
e TypeScript `5.8.3`. New Architecture ficou ativa pelo default do SDK 53 e o
AVD confirmou `fabric:true`. O package `com.advogado20.app`, target 35 e
versionCode 2 foram preservados. `edgeToEdgeEnabled=false` ficou explicito para
evitar mudanca visual silenciosa neste checkpoint.

Gates finais: `npm ci`, `npx expo-doctor` 18/18, `npx expo install --check`,
`npm audit --omit=dev` com 0 vulnerabilidades, typecheck, 17/17 testes, smoke,
Harness e runtime local controlado em exit `0`. O APK debug x86_64 abriu no
AVD e o login renderizou completo.

Artefato local `harness-results/sdk53-debug-x86_64.apk`: `52712727` bytes,
SHA-256 `82D4CA40ED25093E9E1A72509964BB23CDB3B844A22E352D56585CB3D9E1B971`.
Assinatura v2, package/target, ZIP 16 KB e ELF `LOAD >= 2**14` em 17/17
bibliotecas x86_64 passaram. O AVD usa page size 4096; AAB release ARM64,
runtime 16 KB e Play Console continuam pendentes. Nenhum EAS cloud foi usado.

Evidencia:
`../.codex/specs/changes/013-upgrade-expo-playstore-16kb/checkpoint-sdk53-2026-06-14.md`.

## Spec 013 - Baseline SDK 52 - 2026-06-14

Veredito: `PRONTO_PARA_UPGRADE_INCREMENTAL_COM_LACUNA_16KB_BINARIO`.

Antes de qualquer alteracao de dependencia, a arvore atual passou em
`npx expo-doctor` (18/18), `npx expo install --check`, `npm audit --omit=dev`
(0 vulnerabilidades), `npm run typecheck`, `npm run test` (17/17),
`npm run smoke`, `npm run harness` e `git diff --check`.

O primeiro `npm run smoke:runtime` falhou com exit `1` porque o backend local nao
estava iniciado, a env publica nao foi passada ao processo e nao havia device
bootado. A repeticao totalmente local com backend `NODE_ENV=test` e Auth de fixture
passou com exit `0`: health, 8 areas, Auth, match `matched` e perfil publico seguro.
Nenhuma credencial externa, Railway, Supabase de producao ou EAS foi usada.

Expo SDK 56 foi confirmado como estavel atual em fonte oficial. O plano aprovado e
subir um checkpoint por vez: `52 -> 53 -> 54 -> 55 -> 56`, com parada no primeiro
gate vermelho. O proximo ciclo deve alterar somente para SDK 53. Package
`com.advogado20.app`, `versionCode=2`, `app.config.ts` e `eas.json` permanecem
preservados. Nenhum APK/AAB novo foi gerado, portanto o gate 16 KB segue pendente.

Evidencia:
`../.codex/specs/changes/013-upgrade-expo-playstore-16kb/baseline-2026-06-14.md`.

## Spec 013 - Upgrade Expo SDK E 16 KB - 2026-06-14

Spec criada em `../.codex/specs/changes/013-upgrade-expo-playstore-16kb/` para
controlar, via SDD/Harness, o upgrade do Expo SDK 52/RN 0.76.9 ate uma base nativa
atual e apta a cumprir Google Play 16 KB page size. Escopo inicial: mobile somente,
sem backend/admin, sem build EAS cloud sem confirmacao explicita e sem marcar 16 KB
como aprovado sem APK/AAB novo auditado.

Baseline real lida: package `com.advogado20.app`, `versionCode=2`,
`compileSdkVersion=35`, `targetSdkVersion=35`, perfil `preview` APK e perfil
`production` AAB. A spec preserva Home/fluxos das Specs 011/012 e desbloqueia o
requisito tecnico pendente da Spec 003.

## Auditoria Play Store E Expo Go - 2026-06-14

Veredito: `REPROVADO_PARA_SUBMISSAO / PREVIEW_EXPO_GO_OK_COM_RESSALVAS`.

O APK release de 2026-06-10 passou no ZIP alignment de 16 KB, mas falhou no ELF:
13/14 bibliotecas ARM64 usam segmentos `LOAD` de 4 KB. Antes de qualquer AAB, migrar
Expo SDK 52/RN 0.76 ate uma base nativa atual, recompilar e exigir ELF/AAB/smoke 16 KB.

Outros bloqueios: politica publica desatualizada, Data Safety nao enviado, conta/fixture
de revisor nao deterministica, AAB final inexistente, `versionCode` nao confirmado e
artefatos existentes anteriores a UI de 2026-06-14. Plano completo em
`../PLAYSTORE_AUDIT_2026-06-14.md`.

A arvore atual abriu no Expo Go SDK 52 em
`exp://9cifmnw-advogado20-8083.exp.direct`. Evidencias:
`harness-results/expo-go-qr-2026-06-14.png` e
`harness-results/expo-go-login-clean-2026-06-14.png`. O tunnel local e temporario.

## Ajuste Visual Home/Mascote/WhatsApp - 2026-06-14

Home cliente ajustada sem backend/schema/permissao/dependencia nova: logo do login
aumentada, logo das areas autenticadas aumentada, estados/cidades movidos para cima
das areas, hub de areas sem titulo/copy antiga e com icones menores, mascote
`assets/mascot-lawyer.png` no centro do hub, botao de duvida do mascote abrindo o
WhatsApp do canal de atendimento com mensagem propria, e dois botoes finais lado a lado para busca
por localizacao e por cidade. O botao urgente usa o mesmo numero do canal de atendimento com texto
urgente distinto. O WhatsApp dos advogados agora abre com mensagem padrao cordial
vinda do perfil publico.

Gates locais: `npm run typecheck` OK, `npm run smoke` OK, `npm run harness` OK
(16 testes), `npm audit --omit=dev` OK, `npx expo install --check` OK e
`git diff --check` OK. AVD `Pixel_9` bootou e Expo Go foi acionado, mas o deep link
ficou em carregamento/retornou para a launcher antes da tela pronta; portanto o smoke
visual completo desta UI ficou como lacuna e deve ser repetido em Expo Go funcional,
APK local ou device fisico antes de fechar como visualmente aprovado.

Refino de layout no mesmo dia: cards do hub de areas padronizados em `86x86` com
gap unico de `6`, icones SVG com cores vivas por especialidade e CTA de duvida
transformado em botao circular de interrogacao posicionado a direita do mascote.
O texto longo do CTA saiu da area abaixo do mascote para liberar espaco visual.
Foi adicionado o icone `help-circle-outline` no `AppIcon` standalone e uma regressao
estatica para impedir retorno do layout desalinhado. Gates: teste focado falhou
antes do diff e passou apos a implementacao, `npm run typecheck` OK, `npm run test`
OK (17 testes), `npm run smoke` OK, `npm run harness` OK e `git diff --check` OK.
Smoke AVD autenticado foi fechado no `Pixel_9` usando Metro limpo na porta `8084`
com backend Railway e anon key publica redigida: a Home mostrou cards alinhados,
cores vivas e o botao circular `?` ao lado direito do mascote. Evidencia final:
`harness-results/home-layout-auth-final-aligned.png`. O ciclo nao capturou
senha/token/coordenada/telefone. O harness generico ainda registra a lacuna padrao
de smoke visual porque seu script nao controla AVD, mas a prova visual proporcional
foi executada separadamente neste ciclo.

Segundo refino solicitado no mesmo ciclo: a interrogacao foi reduzida para botao
compacto de `34x34` com icone `help-circle-outline` em `23`, preservando a posicao
abaixo do braco esquerdo levantado do mascote. Evidencia final atualizada:
`harness-results/home-layout-help-small-final.png`. Gates repetidos: teste focado
do orbit cliente OK, `npm run typecheck` OK, `npm run test` OK (17 testes),
`npm run smoke` OK, `npm run harness` OK e `git diff --check` OK. Diagnostico
runtime Railway confirmou `/health`, areas e Auth real com token redigido, mas o
match automatizado retornou `empty`, entao perfil runtime completo segue fora do
escopo deste ajuste visual.

## Busca Por Cidade - 2026-06-10

Home cliente ajustada para mostrar `ESTADO` no singular, campo digitavel de busca
em Estado/Cidade e catalogos filtrados pela especialidade selecionada via `areaIds`.
O modo cidade continua sem solicitar GPS e sem gerar build novo. `npm run harness`
exit `0`. Expo Go local abriu no AVD `Pixel_9` com Metro/backend local; o input
automatico via ADB nao focou os campos de login, entao a validacao autenticada foi
deixada para uso manual com o app rodando.

## Branding - 2026-06-10

Nome Android corrigido para `Advogado 2.0` em `app.json`, preservando
`com.advogado20.app` para nao criar outro aplicativo no aparelho. O slug EAS tecnico
permanece `meu-advogado-20` porque o `projectId` remoto ainda exige esse valor para
builds. A cota mensal Android do EAS free bloqueou novo build Expo ate 2026-07-01.
Como contingencia, foi gerado APK release local com bundle JS embutido:
`harness-results/advogado-20-local-release-brand.apk`, SHA-256
`AC1BDFC70A951E74A94644CDE8E7A34F2F14F3D9175D16FCB6DE81A09E411DBE`, tamanho
`66252962` bytes. `aapt` confirmou `application-label:'Advogado 2.0'` e o AVD
`Pixel_9` instalou limpo e abriu a tela de login standalone.
Link alternativo GitHub:
`https://github.com/meuadvogado2026/Advogado-mobile/releases/download/advogado-20-local-release-brand-20260610/advogado-20-local-release-brand.apk`.

## Spec 012 - 2026-06-10

Seletores de localidade refinados: `ESTADOS` abre pela seta; apos selecionar, surge
`CIDADE`, tambem recolhivel. Smoke visual no AVD `Pixel_9` confirmou estado fechado,
lista de estados, estado selecionado, cidade liberada e lista de cidades.
APK preview EAS do commit `509aa5f`: build
`9018ebcd-1295-4483-93ed-b6d3ad77eee4`, link
`https://expo.dev/artifacts/eas/E2LxdPx7Wm2LjHjTNvceWeNN1AiPwjvUo1H55qbExmE.apk`,
SHA-256 `BDC0E2FAEB2B8DEB6AC408D0749980A726AB1C67BFED2816C3B2355B6CC0B498`,
instalacao e abertura standalone no AVD OK.

Busca por cidade, seletores dependentes, listagem paginada sem distancia e perfil
existente implementados sem alterar GPS. `algorithmVersion=city-list-v1`. Smoke visual
Android e build atualizado seguem como gate.

**Ultima atualizacao:** 2026-06-10
**Veredito:** SPEC011_LOCAL_OK_COM_RESSALVAS / MOBILE_MATCH_EXIGE_LOCALIZACAO_REAL_PUBLICADO_APK_OK

- [x] Revisao ortografica e limpeza operacional local em 2026-06-10: removidos `Atualizar painel`, `Atualizar areas`, mensagem de painel atualizado e banner de sessao restaurada. Home, login, oracao, perfil profissional, conta e mensagens de erro receberam acentuacao em portugues. AVD confirmou `Olá`, `próximo`, `localização`, `área`, `Família`, `Previdência` e `Tributário`, sem banner restaurado. Gates: typecheck, 14 testes, smoke e harness exit 0.
- [x] Ajustes pos-Spec 011 locais em 2026-06-10: removido o CTA duplicado `Buscar match agora`; o unico CTA central ficou menor com area de toque preservada; hub usa 8 posicoes alinhadas `3 + 2 + 3`, badges de especialidade ganharam tratamento visual e icone tributario proprio; opcao `Atualizar perfil` removida do painel advogado. Gates: `npm run typecheck`, 14 testes, `npm run smoke`, `npm run harness`, `git diff --check` e `npm run smoke:runtime` contra Railway passaram. AVD confirmou badges/CTA central; Railway ainda retorna 6 areas ate a migration backend `0010` ser publicada.
- [x] Spec 011 implementada localmente em 2026-06-10: Home cliente recebeu saudacao por nome, logo visual interna `assets/logo-gold.png`, hub de especialidades ao redor do botao `Buscar match`, sem busca textual, sem parceiros e sem card de advogado indicado. Match bem-sucedido navega direto para `LawyerProfile`, que mostra a mensagem de proximidade/localizacao. `Advogado urgente` ganhou exemplos explicitos; pedido de oracao ficou com copy simples e segura. Painel advogado agora usa menus `Home`, `Oracao`, `Perfil`; beneficios e parceiros ficam na Home, e oracao fica no menu proprio. Gates: `npm run typecheck`, teste focado 14 testes, `npm run smoke`, `npm run harness`, `npm run smoke:runtime` contra Railway com env publica redigida e `git diff --check` passaram. Lacuna: nenhum device/emulador Android bootado para smoke visual.
- [x] APK preview instalavel gerado em 2026-06-05 para uso fora da mesma rede: EAS build Android `72c1a18f-6583-4c68-b93e-b9489b343bb2`, commit `5401d69878ba75990e922c26b909bf5fbd41fff4`, perfil `preview`/APK/internal, link `https://expo.dev/artifacts/eas/faTVgUaV3BwyMvpZE673Ef.apk`, arquivo local `harness-results/advogado-20-preview-72c1a18f.apk`, SHA-256 `62DFFA00083A30575C633D8D57470C864DFBF0D0604A0DCC8CC80EB6F24155CE`, tamanho `66163670` bytes. Gate antes do build: `npm run harness` exit 0.
- [x] Primeiro acesso do advogado enviado ao GitHub no commit `6e175c4`: `GET /v1/me` agora pode retornar `mustChangePassword` e `firstLoginCompletedAt`; quando `mustChangePassword=true`, o app mostra somente tela de troca de senha e chama `POST /v1/auth/change-password` antes de liberar dashboard/beneficios/perfil do advogado. Gate local: `npm run harness` exit 0 (14 testes e smoke). Build EAS/APK de distribuicao gerado no item acima.
- [x] Hotfix GEO publicado no commit `0e8573a`: removido fallback sintetico `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK` de codigo/config/build e removido cache de coordenada na Home. O match agora solicita localizacao real atual em toda busca e bloqueia `POST /v1/match` quando permissao for negada ou o provider nativo nao retornar coordenada. Gates: `npm run typecheck`, `npx vitest run tests/contracts.test.ts`, `npm run smoke`, `npm run harness` e `smoke:runtime` contra Railway passaram. EAS preview APK `2b975370-3e5c-4c8a-bbb1-d7e1af9016a1`, link `https://expo.dev/artifacts/eas/6ocNby5vG9adJtqKrioSTK.apk`, SHA-256 `442A89E200816A8D5E18495EDC8A87D4E90972D31AFA42946456DF3BF47219B0`; APK extraido sem strings de fallback e instalado/aberto no AVD `Pixel_9`.

**Ultima atualizacao:** 2026-06-04
**Fase:** PRODUTO MVP / UX LOGIN E CADASTRO CLIENTE
**Veredito:** MOBILE_ICONES_SVG_BOTOES_LOGO_LOCAL_OK / MOBILE_ICONS_STANDALONE_FIX_LOCAL_OK / SPEC010_PAINEL_ADVOGADO_VISUAL_ANDROID_OK / PERFIL_ADVOGADO_SOCIAIS_PRODUCAO_OK / MIGRATION_0006_APLICADA_OK / MIGRATION_0005_APLICADA_OK / CLIENT_SIGNUP_MOBILE_PREVIEW_BUILD_OK / CLIENT_SIGNUP_PRODUCAO_OK / MOBILE_UX_LOGIN_CADASTRO_LOGO_LOCAL_OK / SPEC003_DEPENDENCIAS_RELEASE_OK / QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE / SPEC008_CLIENTE_HOME_REPLICACAO_VISUAL_OK / SPEC008_PARTE1R_POLIMENTO_VISUAL_MOBILE_OK

- [x] Fix visual e release preview em 2026-06-04: o workaround de icones textuais em `src/components/AppIcon.tsx` foi substituido por icones reais componentizados em `react-native-svg`, sem depender de fonte runtime, `Ionicons`, `@expo/vector-icons`, `expo-font` ou `useFonts`. `goldGradientLayer` foi removido dos botoes primarios; botoes ativos/desabilitados usam cores solidas por tokens (`#D99A2D`, `disabledSurface`, `disabledBorder`). `app.json` agora usa `assets/logo-blue.png` como logo oficial em `icon`, `splash.image` e `android.adaptiveIcon.foregroundImage`; `assets/logo-white.png` fica preservado como asset auxiliar, mas nao como padrao Android. `scripts/smoke.ts` reprova retorno de glyphs/texto improvisado, Ionicons/fontes frageis, overlays de degrade e assets oficiais ausentes. Gates: `npm run typecheck` exit 0, `npm run test -- --run tests/contracts.test.ts` exit 0, `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`, AVD bootado), `npm audit --omit=dev` exit 0, `npx expo install --check` exit 0 e `git diff --check` exit 0. EAS preview APK `b478e26d-fc92-44b6-95bd-4128ec1d76e9`, commit `e2248a3`, link `https://expo.dev/artifacts/eas/ohym3qbnEuZkWgxkRvTqUr.apk`, arquivo local `harness-results/icons-svg-preview-e2248a3-b478e26d.apk`, SHA-256 `C6E5B88516979FA55827DF25B12A687D4CC690A8A125CA5D9AA7E290F80D16A1`. Smoke visual standalone no AVD confirmou app icon na launcher e login sem PII pre-preenchida com icone SVG no botao (`icons-svg-launcher-app-icon.png`, `icons-svg-login-safe.png`, `icons-svg-reopen.png`). Ressalva: screenshots autenticados de Home cliente/Home advogado/Beneficios/Perfil ficaram pendentes porque o AVD nao tinha ADB Keyboard e a entrada segura por coordenadas fechava o app; fluxo autenticado validado por `smoke:runtime`.
- [x] Fix publicado em 2026-06-04 para icones ausentes no APK standalone: commits `393f624` e `2f23f8a` removeram a dependencia runtime de `@expo/vector-icons`/`Ionicons` nas telas e passaram a usar `src/components/AppIcon.tsx`, com simbolos de texto nativos que renderizam sem fonte externa. `App.tsx` tambem deixou de bloquear a UI aguardando fonte. `scripts/smoke.ts` reprova retorno de `Ionicons`, `useFonts` ou `fontFallbackReady` nas telas principais. Gates: `npm run harness` exit 0, `smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`, device bootado), `git diff --check` exit 0. APK preview final EAS `5f688442-3763-4142-bb73-99a4d6ea2376`, commit `2f23f8a`, baixado em `harness-results/icons-text-preview-2f23f8a-5f688442.apk`, SHA-256 `937F0EFDBCD23E95A8BB098B609E4FC1698597C8507EBD26769893C4A13C5768`; smoke visual standalone no AVD confirmou tela de login renderizada e icones de acao visiveis em `harness-results/icons-text-login.png`.
- [x] Spec 010 publicada e validada visualmente em 2026-06-04 no commit mobile `1aa8e15`: painel advogado tem menus `Home`, `Beneficios`, `Perfil`; logo centralizada; Home com saudacao, 2 insights, oracao e parceiros; Beneficios com cartao especial inspirado no legado; Perfil readonly com foto/capa/bio/areas, logout e termos. Mobile `npm run harness` exit 0, `smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`) e smoke visual Android no AVD `Pixel_9` via Expo Go SDK 52/Metro OK no fluxo `login advogado -> Home -> Beneficios -> Perfil -> logout`, sem manter screenshot/XML com senha. Evidencias: `harness-results/spec010-lawyer-home-top.png`, `spec010-lawyer-benefits.png`, `spec010-lawyer-profile-top.png`, `spec010-lawyer-profile-account.png`, `spec010-lawyer-logout.png`. EAS preview baixado: `spec010-preview-0514463-fc296b03.apk`, SHA-256 `EB2552119455E8D5F7BAE9DE9E86D92EE0E74192E741CF15072E0D113BBA6A97`.
- [x] Ajustes do painel mobile publicados em 2026-06-04 no commit `e67df6d`: card de match na Home renderiza `avatarUrl`/`coverUrl` quando o backend retorna, CTA `Advogado urgente` ficou mais compacto, tokens amarelos foram trocados para dourado `#FF8E0A/#FF7800`, e rodape `Parceiros` consome `GET /v1/partner-logos`. Gates: `npm run harness` exit 0 e `npm run smoke:runtime` com backend local exit 0 (`OK_COM_RESSALVAS`, sem device Android bootado).
- [x] Ajuste de cor publicado em 2026-06-04: botoes, icones, bordas e textos dourados do mobile foram padronizados para `#D66A01`; `npm run harness` exit 0.
- [x] Ajuste de cor solicitado em 2026-06-04: botoes, icones, bordas e textos dourados do mobile padronizados para `#D99A2D`; aguardando versionamento/publicacao deste ciclo.

## Concluido

- [x] Documentacao inicial do ambiente mobile criada.
- [x] Perfil do advogado ajustado localmente: capa menor, foto dentro do cartao/modal de identidade e secao `Redes sociais` com icones reais para Instagram, LinkedIn, Facebook e site profissional.
- [x] Perfil do advogado com redes sociais publicado no commit `ed2b963`; `npm run harness` exit 0 e `npm run smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`) com env publica da raiz e token redigido. Lacuna: nenhum Android bootado para smoke visual Expo Go.
- [x] Escopo Android-first definido.
- [x] Regra de localizacao do cliente definida.
- [x] Regra de consumo via backend definida.
- [x] Scaffold Expo/React Native/TypeScript criado.
- [x] Navegacao inicial com Home placeholder criada.
- [x] Tema/tokens iniciais criados.
- [x] Contratos backend em codigo criados.
- [x] Harness CLI e smoke estrutural criados.
- [x] Auth mobile inicial via Supabase Auth REST com anon key publica configuravel.
- [x] Tela de login alterna entre `Entrar` e `Criar novo usuario`, usando `POST /v1/auth/signup-client` pelo backend antes do login Supabase Auth REST.
- [x] Backend Railway publicou `POST /v1/auth/signup-client`; smoke real criou usuario descartavel client, validou login e `/v1/me`, e limpou Auth/profile. Smoke runtime mobile contra Railway passou com exit code 0.
- [x] Fluxo mobile de cadastro cliente publicado no GitHub pelo commit `6b63678`; `npm run harness`, `npm run smoke:runtime` contra Railway e `git diff --check` passaram.
- [x] AVD `Pixel_9` com Expo Go/Metro local exibiu a UI `Criar novo usuario` sem sessao, com evidencia segura em `harness-results/client-signup-login-screen-2026-06-04.png`.
- [x] Rebuild preview EAS do cadastro cliente destravado: commits `ab9553d` (`Fix EAS Android prebuild tar interop`) e `eeb42c0` (`Avoid blank APK while icon font loads`) publicados em `meuadvogado2026/Advogado-mobile`.
- [x] APK preview final gerado no EAS Build `baa5caed-27fd-4e2d-be06-39ff52678b85`, commit `eeb42c0a994ec34784096f025e69a6385a190d29`, perfil `preview`, APK/internal, sem AAB e sem Play Console.
- [x] APK baixado em `harness-results/client-signup-preview-eeb42c0-baa5caed.apk`, tamanho `68163546` bytes, SHA-256 `B5A6EDFC29507652290360C29735EC0B6F489418EB4F945E172FF298E6459A30`.
- [x] Conteudo do APK validado: bundle contem `Criar novo usuario`, `/v1/auth/signup-client`, Railway `https://advogado-back-production.up.railway.app` e fallback dev nao esta `true`.
- [x] Smoke visual do APK instalado no AVD `Pixel_9` passou por `Login -> Criar novo usuario -> cadastro descartavel -> Home`; login Supabase e `GET /v1/me` retornaram `role=client`, com cleanup de Auth/profile concluido.
- [x] Sessao/JWT guardado em SecureStore.
- [x] `GET /v1/areas` consumido via backend.
- [x] Fluxo de explicacao + permissao de localizacao implementado.
- [x] `POST /v1/match` chamado com `lat`, `lng`, `accuracyM` e `areaIds`.
- [x] Estados de erro para login, API offline, token invalido, localizacao negada/indisponivel e match vazio.
- [x] Harness mobile passou com exit code 0.
- [x] Smoke runtime proporcional criado e executado contra backend local real.
- [x] Android SDK/ADB/AVD detectados; emulador `Pixel_9` bootou.
- [x] Dependencias Expo ajustadas para versoes compativeis com SDK 52 usando `expo install`.
- [x] Expo Go compativel com SDK 52 instalado no AVD `Pixel_9` a partir do APK oficial `Expo-Go-2.32.20`.
- [x] Smoke visual Android abriu o app sem crash e renderizou a tela inicial; screenshot salvo em `harness-results/android-home-sdk52.png`.
- [x] `EXPO_PUBLIC_SUPABASE_ANON_KEY` foi carregada da `.env` raiz somente como runtime local, sem imprimir ou versionar valor.
- [x] Login real do usuario `usuario@advogado20.com` validado no `npm run smoke:runtime` com token redigido.
- [x] App Android restaurou sessao visualmente e exibiu `Sessao do cliente`.
- [x] Areas juridicas carregaram pela UI Android com 6 opcoes.
- [x] Logos oficiais em `Telas/` incorporadas como assets mobile (`assets/logo-blue.png` e `assets/logo-white.png`).
- [x] Login ajustado com logo levemente menor e borda dourada; Home autenticada usa logo maior dentro do conteudo rolavel, sem header fixo.
- [x] `app.json` configurado com icon, adaptive icon e splash usando a identidade oficial.
- [x] Fluxo visual corrigido: sem sessao, app mostra somente tela de login; Home/Match aparece apenas apos login/sessao.
- [x] Fallback local dev de localizacao criado com `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK=true`, acionado somente apos permissao concedida e falha do provider.
- [x] Match via UI Android validado visualmente com fallback dev explicito: login real, areas, prompt nativo, botao habilitado e estado vazio/stub.
- [x] Permissao de localizacao negada revalidada visualmente no Android; app mostra estado claro e mantem `Buscar match` bloqueado.
- [x] Ambiente mobile passou a ser governado pela `.codex/` unica da raiz; copia local `Advogado 2.0 - mobile/.codex` removida.
- [x] `smoke:runtime` corrigido para autenticar antes do `POST /v1/match`; Railway, 6 areas, login real e match autenticado passaram com token redigido.
- [x] Novo APK preview EAS com UX corrigida gerado: build `4352f306-53b9-4989-8eed-02bd71518dd3`.
- [x] Links publicos de `Privacidade`, `Termos` e `Excluir dados` adicionados na tela de login e na Home.
- [x] Package Android definitivo fixado como `com.advogado20.app`.
- [x] Rota `LawyerProfile`, CTA `Ver perfil`, voltar, distancia efemera e WhatsApp condicional implementados.
- [x] Estados loading, erro, perfil indisponivel e WhatsApp ausente implementados sem inventar dados.
- [x] Harness passou com 9 testes e runtime Railway validou perfil seguro com token redigido.
- [x] Smoke visual Android fechou `Home -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp`.
- [x] APK preview Android do commit publicado `7d4bbdc08482c79b1feb41ceaeab158815219f26` gerado no EAS Build `11026258-edc1-4552-9b2b-9f5a8e92ab3f`, baixado e instalado no AVD `Pixel_9`.
- [x] Smoke visual do APK preview instalado fechou login real, Home com match, distancia efemera, `Ver perfil`, `LawyerProfile`, `Voltar` e `Falar no WhatsApp`.
- [x] Pacote manual sem ADB criado com APK, link EAS, checksum e checklist de validacao em `harness-results/manual-device-whatsapp-validation-2026-06-01.md`.
- [x] Validacao manual em device fisico com WhatsApp concluida pelo usuario; CTA direcionou para o WhatsApp.
- [x] Spec 005 implementada: Home autenticada ganhou shell/header e bottom navigation MVP `Inicio`, `Buscar` e `Conta`.
- [x] `Buscar` funciona como atalho para o fluxo real de areas/localizacao/match; `Conta` concentra sessao, sair e links legais.
- [x] `Mensagens`, `Agenda`, `Plantao`, favoritos, rating, avatar, bio e metricas nao foram criados.
- [x] `expo-font` instalado/configurado para suportar `@expo/vector-icons` no runtime Android.
- [x] APK preview da spec 005 gerado no EAS Build `5c9741f9-ecac-44bb-b9ae-c1e2c6f25200`, instalado e aberto no AVD `Pixel_9`.
- [x] APK preview local da spec 005 confirmado com SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`.
- [x] Rechecagem do gate fisico da spec 005 confirmou APK local com `66185270` bytes e o mesmo SHA-256; `adb` nao esta disponivel no PATH.
- [x] Rechecagem pos-admin producao em 2026-06-02 confirmou novamente o mesmo APK local, tamanho `66185270` bytes, SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`; `adb` segue indisponivel no PATH.
- [x] Rechecagem independente em 2026-06-02 do gate fisico da spec 005: `npm run harness` exit 0; `npm run smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`); APK local confirmado com `66185270` bytes e SHA-256 esperado; ADB disponivel pelo SDK local, mas sem device conectado.
- [x] Gate fisico/manual da spec 005 fechado por confirmacao textual assistida do usuario em 2026-06-02: APK preview passou em device Android fisico com GPS real e WhatsApp instalado no fluxo `Login -> Home com shell -> match -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp`.
- [x] Home autenticada do APK preview renderizou header `ADVOGADO 2.0`, areas, card `ADVOGADO INDICADO` e bottom navigation `Inicio`, `Buscar`, `Conta`.
- [x] Spec 008 Parte 1 implementada no mobile sem backend/schema novo: `GET /v1/me` passou a decidir role, shell cliente e shell advogado ficaram separados, menus usam icones e abrem views reais sem `scrollTo`, logo arredondada aparece no login e no topo autenticado.
- [x] Menu cliente agora tem views reais `Inicio`, `Buscar`, `Oracao`, `Conta`; menu advogado tem `Inicio`, `Cartao`, `Perfil`, `Conta`. `Oracao`, `Cartao` e `Perfil` do advogado ficam como views seguras sem persistencia/contrato sensivel novo ate as Partes 2/3.
- [x] Gates spec 008 Parte 1 mobile: `npm run typecheck` exit 0, `npm run test` exit 0 (10 testes), `npm run smoke` exit 0, `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 com Auth real redigido, 6 areas, match `matched` e perfil seguro.
- [x] Spec 008 Parte 2 implementada localmente: `LawyerProfile` renderiza capa, avatar, mini bio e bio completa quando o backend retorna campos opcionais seguros; sem imagem, usa fallback visual.
- [x] Gates spec 008 Parte 2 mobile: `npm run harness` exit 0; `npm run smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`) com env publica carregada da `.env` raiz sem imprimir valor, Auth real redigido, 6 areas, match `matched` e perfil seguro.
- [x] Publicacao mobile destravada: commits `0aa8ed8` (spec 005 shell), `7b7a7c3` (spec 008 Parte 2 visual) e `8c6ec19` (gate documental) publicados no GitHub.
- [x] Ressalva visual da Spec 008 Parte 2 fechada no AVD `Pixel_9`: `Login -> Home autenticada -> Buscar -> match -> Ver perfil -> LawyerProfile -> Voltar`; perfil exibiu fallback seguro de capa/avatar, OAB, cidade/UF, distancia efemera, areas, selo verificado e CTA WhatsApp. `smoke:runtime` foi alinhado aos campos publicos opcionais da Parte 2 e passou contra Railway.
- [x] Fluxo fisico/manual completo do novo APK preview fechado por confirmacao assistida do usuario: GPS real, match, `LawyerProfile`, `Voltar` e WhatsApp real.
- [x] Spec 008 Parte 3 implementada localmente no mobile: shell do advogado consome `GET /v1/lawyer/me/dashboard`, cartao exibe beneficios estaticos/seguros e aba cliente `Oracao` envia `POST /v1/prayer-requests` com anonimato e resposta sem ecoar texto.
- [x] Gates spec 008 Parte 3 mobile: `npm run harness` exit 0; typecheck, 12 testes e smoke estrutural passaram.
- [x] Spec 008 Parte 3 publicada: mobile commit `f5ed433` publicado no GitHub sem gerar APK/AAB; backend Railway validado apos migration 0003 manual. Mobile `npm run harness` exit 0 e `npm run smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`) com token redigido, 6 areas, match `matched` e perfil seguro.
- [x] Gate visual Android da Spec 008 Parte 3 tentado em 2026-06-03 no AVD `Pixel_9`: cliente `Oracao` passou com confirmacao e sem texto no XML pos-envio, mas fluxo advogado ficou `REPROVADO` porque XML bruto capturou senha de teste durante login automatizado. XML bruto removido.
- [x] Direcao visual corrigida pelo usuario em 2026-06-03: painel atual e apenas base estrutural; o proximo gate deve replicar fielmente `Telas/home_do_cliente`, limitar menu cliente a `Home` e `Perfil`, mover `Oracao` para bloco da Home com Biblia/cruz, manter areas juridicas em quadrados horizontais e abrir perfil completo do advogado em pagina propria fiel a `Telas/perfil_do_advogado`.
- [x] Spec 008 Parte 1R implementada localmente: cliente agora tem bottom nav somente `Home`/`Perfil`; Home contem busca, aviso de localizacao, areas em cards quadrados horizontais, advogado indicado, pedido de oracao com arte original `assets/prayer-bible-cross.png` e `Como funciona?`; `LawyerProfile` segue a referencia com hero/capa/avatar/chips/bio/areas/CTA WhatsApp externo.
- [x] Gates Spec 008 Parte 1R: `npm run harness` exit 0; `npm run smoke:runtime` contra Railway exit 0 com envs publicas carregadas sem imprimir valores, 6 areas, Auth real com token redigido, match `matched` e perfil seguro.
- [x] Gate visual Android da Spec 008 Parte 1R fechado no AVD `Pixel_9`: Home cliente, bottom nav somente `Home`/`Perfil`, areas quadradas horizontais, bloco de oracao com Biblia/cruz, `Buscar match`, card de advogado indicado, perfil completo premium e retorno para Home.
- [x] Polimento visual mobile da Spec 008 Parte 1R implementado localmente em 2026-06-03: `Ionicons.font` passou a ser carregada no App, topo autenticado virou logo centralizada sem textos de marca/sessao, bottom nav/areas/`Como funciona?` ganharam icones visiveis com badges dourados, cards de areas ficaram maiores e legiveis, aviso de localizacao saiu do topo e virou nota discreta no fim da Home. Gates: `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 (`OK_COM_RESSALVAS`) e `git diff --check` exit 0. Resultado: `SPEC008_PARTE1R_POLIMENTO_VISUAL_MOBILE_OK`.
- [x] Home cliente recebeu CTA vermelho `Advogado urgente` com icone de alerta e abertura externa para WhatsApp de suporte redigido, sem backend/schema novo.
- [x] UX solicitada em 2026-06-03 implementada localmente: copy `A justica ao alcance de um toque` menor e sem negrito; cadastro cliente na tela de login; logo autenticada maior e rolavel. Gates: mobile `npm run harness` exit 0; backend `npm run harness` exit 0; `npm run smoke:runtime` mobile contra Railway exit 0 (`OK_COM_RESSALVAS`) com login real redigido, 6 areas, match `matched` e perfil seguro.
- [x] Bloqueio de dependencias de producao da Spec 003 tratado: `npm audit --omit=dev` zerou apos overrides transitivos documentados para `@expo/plist/@xmldom`, `postcss`, `tar` e `uuid`, preservando Expo SDK 52 e sem `npm audit fix --force`.
- [x] Spec 011 implementada localmente em 2026-06-10: Home cliente removeu busca textual, parceiros e card de advogado indicado; novo hub de especialidades fica ao redor do botao de match; `Buscar match agora` preserva localizacao real e o runtime smoke confirmou match `matched` com perfil seguro; login/Home/painel usam `assets/logo-gold.png`; copy de boas-vindas usa nome quando disponivel; advogado ganhou menus `Home`, `Oracao`, `Perfil`, beneficios no topo e parceiros apenas no painel advogado. Gates: `npm run typecheck`, teste focado, smoke, harness, runtime e `git diff --check` passaram.
- [ ] Lacuna visual da Spec 011: no AVD `Pixel_9`, login/Home/copy/urgencia/oracao renderizaram corretamente, mas o toque ADB no CTA de match habilitado nao comprovou navegacao visual para `LawyerProfile`. Repetir em device fisico ou AVD limpo antes de fechar como visualmente aprovado.

## Em Andamento

- [x] Integrar API.
- [x] Implementar prompt real de localizacao.
- [x] Rodar smoke visual inicial em emulador Android.
- [x] Implementar navegacao `Home -> Perfil do advogado -> WhatsApp` conforme spec 004.
- [x] Demonstrar visualmente `Home -> LawyerProfile -> voltar -> WhatsApp` em Android.
- [x] Validar APK preview Android publicado da spec 004.
- [x] Validar APK preview em device fisico Android com WhatsApp instalado.
- [x] Implementar shell/header/bottom navigation MVP da spec 005.
- [x] Validar shell autenticado no AVD `Pixel_9` com Metro/Expo Go.
- [x] Implementar spec 008 Parte 1 com shell cliente/advogado por role, views reais e icones.

## Bloqueios E Lacunas

- Runtime real depende de `EXPO_PUBLIC_SUPABASE_ANON_KEY`; a key existe na `.env` raiz e deve continuar sendo carregada apenas no ambiente do comando.
- Politica, termos e canal de exclusao publicados via GitHub Pages e linkados no app.
- `npm run android` em modo nao interativo ainda para no prompt da Expo CLI porque o APK instalado a partir do release `Expo-Go-2.32.20` reporta `versionName=2.32.19`; o workaround validado foi `npx expo start --localhost --clear` + `adb reverse` + deep link `exp://127.0.0.1:8081`.
- `npm audit --omit=dev` foi corrigido para producao em 2026-06-03 (`SPEC003_DEPENDENCIAS_RELEASE_OK`); audit total sem `--omit=dev` ainda aponta tooling de desenvolvimento fora do gate atual e deve ser reavaliado em ciclo proprio se virar criterio de release.
- Localizacao real do AVD/Expo Go segue instavel; fallback dev local fecha apenas smoke Android local e nao deve ser usado em producao/release.
- Bloqueio `QUESTIONAR_REBUILD_MOBILE_EAS_CREDENTIALS` fechado em 2026-06-04: a falha rotulada pelo EAS como `Prepare credentials` era efeito colateral do prebuild quebrado por interop `@expo/cli@0.22.28` + `tar@7.5.16`; foi corrigida por patch de postinstall preservando `npm audit --omit=dev` limpo.
- Match real PostGIS implementado e validado e2e no backend contra Supabase com token de cliente real (`back/scripts/match-smoke.ts`: matched SP/civil 0km, empty, 401) e ponta-a-ponta no APK preview em device fisico com GPS real, sem fallback dev.
- Novo APK preview da spec 005 foi validado por checklist manual assistido em device fisico com GPS real/WhatsApp; ADB automatico continuou sem listar device na sessao local, entao a evidencia e textual assistida.
- Spec 008 Parte 2 visual Android foi fechada no AVD `Pixel_9` com Expo Go/Metro local e fallback dev explicito apenas para smoke. Lacuna preservada: a fixture publicada nao tem imagem real cadastrada; foi validado fallback seguro.
- CTA WhatsApp da Spec 008 Parte 2 abriu handler externo no Chrome; as capturas do handler foram removidas porque a URL do navegador continha telefone completo.
- WhatsApp app nao esta instalado no AVD; no APK preview da spec 004 o CTA abriu Chrome como handler externo de URL.
- Nenhum device Android fisico apareceu no ADB durante o gate de WhatsApp fisico; a validacao foi concluida pelo caminho manual sem depuracao USB.
- Diagnostico de release readiness da Spec 003 em 2026-06-02 fechou como `QUESTIONAR_COMPLIANCE_RELEASE`: fluxo principal/APK preview e package Android estao evidenciados, mas Data Safety, conta de teste, AAB, crash reporting/decisao de adiamento, auditoria PII/logs/secrets, credenciais/keystore e rollback ainda bloqueiam internal testing executavel.
- Package gate da Spec 003 em 2026-06-03 fechou como `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`: checklist Data Safety, conta de teste, auditoria PII/logs/secrets, decisao recomendada de adiar crash reporting, runbook de rollback e criterios para AAB foram documentados, mas falta humano confirmar Play Console/EAS/keystore e conta de teste.
- Gate assistido da Spec 003 em 2026-06-03 manteve `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`: docs/configs/APK e referencias oficiais foram reconfirmados, mas nao houve confirmacao humana explicita de Play Console/app, EAS/keystore, conta de teste ou Data Safety no console.
- Pacote final de decisao da Spec 003 em 2026-06-03 ficou `QUESTIONAR_COMPLIANCE_RELEASE`: `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0, configs Android/EAS OK e Spec 005/Spec 008 reaproveitaveis, mas `npm audit --omit=dev` retornou 17 vulnerabilidades de producao (12 altas, 5 moderadas) ainda sem triagem/aceite.
- Retomada de dependencias da Spec 003 em 2026-06-03 fechou `SPEC003_DEPENDENCIAS_RELEASE_OK`: `npm audit --omit=dev` exit 0, `npx expo install --check` exit 0, `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 e `git diff --check` exit 0. AAB segue bloqueado por `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`.
- Gate humano final da Spec 003 em 2026-06-03 manteve `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`: checklist final AAB preparado para Play Console/app, EAS/keystore, conta de teste, Data Safety/Data deletion, crash reporting, versionCode e rollback; configs Android/EAS, audit de producao, harness, runtime Railway e `git diff --check` passaram, mas nenhuma confirmacao humana foi fornecida.
- Spec 008 Parte 1R foi fechada como `SPEC008_CLIENTE_HOME_REPLICACAO_VISUAL_OK` no AVD `Pixel_9`; nao houve captura de senha, token completo, telefone completo, coordenada exata ou texto de oracao. XMLs temporarios da Home autenticada foram removidos e WhatsApp externo nao foi acionado para evitar handler com telefone completo.
- Polimento visual local da Spec 008 Parte 1R ficou `SPEC008_PARTE1R_POLIMENTO_VISUAL_MOBILE_OK`; smoke visual Android nao foi executado neste ciclo porque nenhum device estava bootado/conectado, mas harness e runtime Railway passaram.
- Cadastro cliente no backend Railway esta validado. APKs preview locais existentes nao contem a UI nova de `Criar novo usuario`; precisa rebuild/publicacao mobile separada. Tentativas EAS Build preview `08f581b1-f085-4628-9599-527609840b53` e `1770c5a0-fd4a-437a-93e2-11736c145be6` falharam na fase `Prepare credentials` das credenciais Android remotas. Build local EAS Android nao e suportado nesta sessao Windows. Nenhum APK/AAB novo foi gerado.
- Play Console/AAB/APK novo continuaram fora do ciclo; Spec 003 segue com dependencias de producao `SPEC003_DEPENDENCIAS_RELEASE_OK` e bloqueio humano `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`.
- Proximos ciclos devem ser iniciados pela raiz do projeto para carregar a governanca central `.codex/` e specs em `.codex/specs/`.

## Validacao Em Device Fisico (APK EAS)

- APK preview gerado via EAS Build (perfil `preview`, projeto `@advogado2.0/advogado-20`), apontando para o backend de producao na Railway.
- Instalado em device Android fisico: login real `usuario@advogado20.com` OK, 6 areas via backend, **permissao de localizacao concedida e GPS real** disparou `POST /v1/match`.
- **Match real retornou a fixture DF (Dra. Carla Lima) via PostGIS** com base na localizacao real (device a <=200km de Brasilia). GPS real -> match real ponta-a-ponta, sem fallback dev.
- Bug de UX corrigido: a tela mostrava copy antigo ("match fica para o proximo ciclo"); agora exibe cidade/distancia do advogado + botao "Falar no WhatsApp". Depois disso, a spec 004 foi validada no APK preview e o direcionamento ao WhatsApp foi confirmado manualmente em device fisico. A lacuna atual e gerar novo build/preview ja com o shell da spec 005.

## Validacao Do APK Preview Da Spec 004

- Build EAS Android preview: `11026258-edc1-4552-9b2b-9f5a8e92ab3f`, commit `7d4bbdc08482c79b1feb41ceaeab158815219f26`, package `com.advogado20.app`, backend Railway.
- APK baixado em `harness-results/preview-11026258-spec004.apk` e instalado no AVD `Pixel_9` (`emulator-5554`) com ADB.
- Fluxo validado visualmente no APK instalado: login real, Home com 6 areas, prompt nativo de localizacao, match com `Dra. Ana Geo (fixture)`, distancia efemera, `Ver perfil`, `LawyerProfile`, `Voltar` e `Falar no WhatsApp`.
- Evidencias em `harness-results/preview-004-*.png` e XMLs correspondentes.
- Lacuna: WhatsApp nao instalado no AVD; handler externo aberto no Chrome.

## Proximo Passo

Perna mobile do gate Spec 002 passou com conta advogado de teste ativa: login OK,
`/v1/me role=lawyer`, `mustChangePassword=false` e dashboard `200`. Falta apenas repetir
apos um convite humano novo com e-mail real valido, se for necessario fechar o fluxo de
troca de senha. Spec 003 nao deve gerar AAB sem os gates humanos de release.
