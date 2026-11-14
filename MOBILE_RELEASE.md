# Mobile Release - Advogado 2.0

**Estado:** pronto localmente para preflight Play Console, bloqueado para AAB/build ate backend publico voltar a 200
**Canal inicial:** internal testing Android
**Ultimo diagnostico:** 2026-08-25 - `REPROVADO_BACKEND_PUBLICO_404_SEM_AAB`

## Preflight Mobile Release - 2026-08-25

Diagnostico em `../harness-results/mobile-release-2026-08-25.md`.

Baseline local aprovada: Expo SDK 57/RN 0.86.2, `expo install --check` OK,
`expo-doctor` 21/21, `npm audit --audit-level=high` sem vulnerabilidades e
`npm run harness` OK com 23 testes, typecheck e smoke estrutural. Config
production redigida confirmou package `com.advogado20.app`, `versionCode=5`,
`compileSdkVersion=36`, `targetSdkVersion=36`, permissoes foreground de
localizacao, storage/overlay/vibrate bloqueados e `usesCleartextTraffic=false`.

EAS esta autenticado na conta `@advogado2.0` e o projeto remoto confirmado e
`@advogado2.0/meu-advogado-20` (`projectId`
`089e477d-8af2-4c3b-a9f6-47fe25886860`). Nenhum build foi iniciado. O AAB
segue bloqueado porque o backend publico documentado no `eas.json`
(`https://advogado-back-production-0be1.up.railway.app`) retornou HTTP 404 em
`/health` e `/v1/areas`; a URL Railway historica
`https://advogado-back-production.up.railway.app` tambem retornou 404. O
`prod:smoke` backend falhou nas duas URLs.

Proximo passo antes de EAS build: restaurar/publicar a API publica com
`GET /health` 200 e `GET /v1/areas` 200, repetir `prod:smoke`/`smoke:runtime`,
confirmar `EXPO_PUBLIC_SUPABASE_ANON_KEY` no EAS sem expor valor, confirmar
`versionCode` livre no Play Console e entao decidir `production AAB` ou
`preview APK`.

## Validacao Play Store - 2026-07-03

Diagnostico geral em `../PLAYSTORE_VALIDATION_2026-07-03.md`.

Pontos tecnicos aprovados:

- `targetSdkVersion=36`, `compileSdkVersion=36`, package `com.advogado20.app`,
  `versionCode=3` e `usesCleartextTraffic=false` em config de producao.
- Patches Expo SDK 56 alinhados: `expo ~56.0.14`,
  `expo-build-properties ~56.0.21` e `expo-constants ~56.0.20`.
- `npm run harness`, `npm audit --omit=dev`, `npx expo install --check` e
  `npx expo-doctor@latest` OK.
- Links legais configurados para o dominio oficial
  `https://advogado20.com.br/`; home, politica, termos e exclusao respondem
  HTTPS 200 desde 2026-07-15.
- Roteiro de revisor por cidade/regiao validado em producao para
  `Taguatinga/DF` e `Cruzeiro/DF` com area `Direito Civil`.

Pendencias antes do AAB final/closed test:

- Play Console ainda depende de validacao de identidade/telefone.
- Conta pessoal nova deve passar por teste fechado com 12 testers optados por
  14 dias continuos antes da producao.
- RESOLVIDO em 2026-08-25 (ADR-014): Railway descontinuada; `eas.json` aponta para
  `https://api.advogado20.com.br` (DigitalOcean). Falta provisionar a infra, publicar o
  backend e confirmar 200 em `/health` e `/v1/areas` antes do AAB.
- Gerar AAB `production` via EAS/remote keystore, subir em track de teste e
  capturar screenshots da build real.
- Preencher Data Safety, Data deletion, App access, classificacao etaria,
  publico-alvo, anuncios, Store Listing e confirmar `versionCode` livre.

## Client Test Preview APK - 2026-07-02

APK interno para teste do cliente gerado via EAS Build `preview`, sem Play Store:

- Build ID: `2ea104ab-6433-4310-b213-78e23b996af3`
- Build page: `https://expo.dev/accounts/advogado2.0/projects/meu-advogado-20/builds/2ea104ab-6433-4310-b213-78e23b996af3`
- APK: `https://expo.dev/artifacts/eas/jrPm4l5y8q5i1Ci-s7QVz1PL5UpUrNn-_nugrloOs1s.apk`
- Local: `harness-results/client-test-preview-sdk56-vc3-2026-07-02.apk`
- SHA-256: `CD4EC11EB2736688C3922406A02AE74B006A7DEA8BB89AAFCA64D4F871A48AC9`

Pre-build alinhou patches Expo SDK 56 e passou em `expo-doctor`, install-check,
audit de producao, typecheck, testes, smoke e harness. O APK passou em manifest,
ZIP 16 KB e assinatura v2. Smoke de instalacao no AVD local ficou pendente por
espaco insuficiente/travamento do emulador.

## Atualizacao Pre-Builder - 2026-07-02

O DOCX `INFORMAÇÕES-ADVOGADO 2.0.docx` complementou as informacoes legais e de loja:
responsavel ELO PERFORMANCE PROFISSIONAL LTDA, CNPJ `65.999.860/0001-26`, endereco
em Taguatinga Norte/DF, WhatsApp de suporte `+55 61 99357-4056`, app adulto para o
Brasil, sem anuncios, com assinatura mensal, dados coletados confirmados, advogados
iniciais autorizados e declaracao de que o app nao promete exito, preco, desconto ou
resultado.

Arquivos locais atualizados: `../advogado-legal/privacidade.html`,
`../advogado-legal/termos.html`, `../advogado-legal/exclusao-de-dados.html`,
`../DATA_SAFETY_DRAFT.md`, `../PLAYSTORE_CLIENTE_DOCUMENTOS_CHECKLIST.md` e
`../PLAYSTORE_READINESS.md`.

Nao gerar novo builder antes de:

- alinhar os pacotes Expo SDK 56 apontados por `expo-doctor`/`expo install --check`;
- publicar/validar por HTTP as paginas legais atualizadas;
- decidir a retencao final entre 5 anos geral e 90 dias para eventos sensiveis;
- detalhar assinatura mensal e impactos de Google Play Billing;
- confirmar Play Console, keystore/EAS, maior `versionCode` e conta de teste.

## Auditoria 2026-06-14

- Nao gerar/submeter AAB antes de migrar a base Expo/RN.
- APK atual: ZIP 16 KB aprovado, ELF ARM64 reprovado em 13/14 bibliotecas.
- Politica publica, Data Safety, App access, store listing e `versionCode` continuam
  abertos.
- Preview Expo Go disponivel em `exp://9cifmnw-advogado20-8083.exp.direct`.
- Fonte de verdade: `../PLAYSTORE_AUDIT_2026-06-14.md`.

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
- Para desenvolvimento com Expo Go, o AVD precisa de Expo Go compativel com SDK 52. O AVD `Pixel_9` foi corrigido com o APK oficial `Expo-Go-2.32.20` e abriu a tela inicial via Metro local/deep link. Com `EXPO_PUBLIC_SUPABASE_ANON_KEY` em runtime, login real e areas via UI foram validados. O app nao possui fallback sintetico de localizacao: se o provider nativo do AVD/celular nao retornar coordenada real, o match deve permanecer bloqueado.
- Com o fallback dev ligado, o fluxo visual Android fechou prompt nativo, botao `Buscar match` habilitado e estado vazio/stub apos chamada de match via UI.
- Logos oficiais foram adicionadas em `assets/` e configuradas como icon, adaptive icon e splash. A experiencia pre-login foi corrigida para exibir somente login; Home/Match entra apenas apos sessao.
- Em 2026-05-31, o rebuild preview EAS da UX corrigida foi concluido (`4352f306-53b9-4989-8eed-02bd71518dd3`). O smoke automatizado contra Railway passou; a validacao fisica posterior foi fechada pela spec 004 via APK preview e confirmacao manual do usuario em device com WhatsApp.
- Em 2026-05-31/2026-06-01, a spec 004 adicionou e validou `Home -> LawyerProfile -> WhatsApp`. Harness, runtime Railway, smoke visual Android no AVD `Pixel_9`, APK preview e direcionamento real para WhatsApp em device fisico foram fechados.
- Em 2026-06-01, a spec 005 implementou shell/header e bottom navigation MVP `Inicio`, `Buscar`, `Conta`, com harness, runtime Railway e smoke visual proporcional. No mesmo dia foi gerado o novo APK preview `5c9741f9-ecac-44bb-b9ae-c1e2c6f25200`, instalado e aberto no AVD `Pixel_9`; a Home autenticada com shell renderizou, mas o AVD nao entregou localizacao nativa com fallback dev desligado. Na rechecagem de 2026-06-02, o APK local foi confirmado com `66185270` bytes e SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`; `npm run harness` e `npm run smoke:runtime` contra Railway passaram, mas ADB nao listou device fisico conectado. O caminho manual assistido foi usado e o usuario confirmou o fluxo completo em device fisico com GPS real/WhatsApp: `Login -> Home com shell -> match -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp`. Resultado: `SPEC005_DEVICE_FISICO_OK`.
- Politica, termos e canal de exclusao estao linkados no mobile pelo dominio oficial `https://advogado20.com.br/`. Em 2026-07-15, as quatro URLs publicas passaram no smoke HTTPS. Data Safety ainda precisa ser preenchido no Play Console com base em `../DATA_SAFETY_DRAFT.md`.
- Em 2026-06-02, a retomada da Spec 003 foi diagnosticada sem codigo/build novo. Resultado: `QUESTIONAR_COMPLIANCE_RELEASE`. Evidencias reaproveitaveis: APK preview da Spec 005, package `com.advogado20.app`, `versionCode=2`, permissoes de localizacao declaradas, links legais publicados e perfil EAS de `production` configurado como `app-bundle`. Bloqueios: Data Safety no Play Console, conta de teste, AAB assinado, crash reporting ou decisao explicita de adiamento, auditoria PII/logs/secrets, credenciais/keystore e rollback operacional.
- Em 2026-06-03, o package gate da Spec 003 gerou `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. O pacote operacional documentou checklist Data Safety, conta de teste, matriz PII/logs/secrets, recomendacao de adiar crash reporting, runbook de rollback internal testing e criterios para liberar o ciclo de AAB. O proximo passo exige humano presente para confirmar Play Console/EAS/keystore e conta de teste antes de gerar AAB.
- Em 2026-06-03, o gate assistido da Spec 003 manteve `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`. Docs/configs/APK e referencias oficiais Google Play foram reconfirmados, mas nao houve confirmacao humana explicita de Play Console/app `com.advogado20.app`, EAS/keystore, conta de teste ou Data Safety no console. AAB segue bloqueado ate essa confirmacao.
- Em 2026-06-03, como Play Console continuou sem dados humanos, a Spec 008 Parte 3 foi adiantada localmente sem build/release: mobile passou a consumir `GET /v1/lawyer/me/dashboard` e `POST /v1/prayer-requests`; backend/mobile `npm run harness` passaram. Ressalvas antes de release: aplicar migration `0003_prayer_requests.sql`, publicar backend/mobile, repetir smoke real/visual Android e revisar Data Safety para texto livre de oracao.
- Em 2026-06-03, apos a Spec 008 Parte 1R fechar `SPEC008_CLIENTE_HOME_REPLICACAO_VISUAL_OK`, o pacote final de decisao da Spec 003 revalidou configs Android/EAS e evidencias do fluxo, mas ficou `QUESTIONAR_COMPLIANCE_RELEASE`: `npm audit --omit=dev` retornou 17 vulnerabilidades de producao (12 altas, 5 moderadas), todas ainda sem triagem/aceite. AAB segue bloqueado tambem por Play Console/EAS/keystore/conta de teste/Data Safety nao confirmados por humano.
- Em 2026-06-03, o bloqueio de dependencias de producao da Spec 003 foi tratado sem `npm audit fix --force`, sem Expo SDK major, sem gerar APK/AAB e sem abrir Play Console. O audit automatico queria `expo@56.0.8` com semver major; em vez disso, foram aplicados overrides transitivos documentados para `@expo/plist/@xmldom`, `postcss`, `tar` e `uuid`. Gates: `npm audit --omit=dev` exit 0, `npx expo install --check` exit 0, `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 e `git diff --check` exit 0. Resultado: `SPEC003_DEPENDENCIAS_RELEASE_OK`; AAB segue bloqueado por `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`.
- Em 2026-06-03, o gate humano final de AAB preparou checklist objetivo para Play Console/app `com.advogado20.app`, track internal testing, EAS/keystore, conta de teste, Data Safety/Data deletion, crash reporting adiado, versionCode/versionName e rollback. A parte local foi revalidada: package `com.advogado20.app`, version `0.1.0`, `versionCode=2`, production EAS `store/app-bundle`, fallback dev desligado, `npm audit --omit=dev` exit 0, `npm run harness` exit 0, `npm run smoke:runtime` contra Railway exit 0 e `git diff --check` exit 0. Resultado: `QUESTIONAR_CREDENCIAIS_PLAY_CONSOLE`, pois nenhuma confirmacao humana foi fornecida.


## SPEC-019 - Preview DigitalOcean / 2026-11-14

0.1.1/versionCode 6; EAS preview usa HTTPS da DigitalOcean independente da propagacao DNS. Supabase publishable via ambiente preview, sem chave secreta no bundle. Build 535b758a-5c73-462b-8086-af6d03ed72a1. Distribuicao direta do APK somente apos FINISHED, assinatura/manifest/bundle verificados e API atualizada. Teste fisico adiado pelo usuario; nao equivale a homologacao Play.


## SPEC-020 - Feedback de acoes (2026-11-14)

Dialogos nativos confirmam envio de oracao e exibem busca vazia, selecao incompleta, falha de localizacao ou API. Busca encontrada segue para perfil. Busca por cidade alerta vazio/erro somente enquanto tela ativa. VersionCode 7 preparado para novo APK preview. Harness local: 33 testes, tipos e smoke estrutural OK. Teste Android fisico continua pendente; nao e liberacao Play.
