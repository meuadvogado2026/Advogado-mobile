# Mobile Release - Meu Advogado 2.0

**Estado:** nao pronto para release  
**Canal inicial:** internal testing Android

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
- Em 2026-06-01, a spec 005 implementou shell/header e bottom navigation MVP `Inicio`, `Buscar`, `Conta`, com harness, runtime Railway e smoke visual proporcional. No mesmo dia foi gerado o novo APK preview `5c9741f9-ecac-44bb-b9ae-c1e2c6f25200`, instalado e aberto no AVD `Pixel_9`; a Home autenticada com shell renderizou, mas o AVD nao entregou localizacao nativa com fallback dev desligado. Na retomada do gate, o APK local foi confirmado com `66185270` bytes e SHA-256 `61D2DF3D1D76D8AEB8397FCA9C5FBB2BE118CBD625BB6C048620EFCD59C249EC`, mas `adb` nao esta disponivel no PATH desta sessao. Antes de release/Play Store, validar esse APK em device fisico com GPS real/WhatsApp ou checklist manual assistido no fluxo completo `Login -> Home com shell -> match -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp`.
- Politica, termos e canal de exclusao foram publicados em `https://meuadvogado2026.github.io/meu-advogado-legal/` e linkados no mobile. Data Safety ainda precisa ser preenchido no Play Console com base em `../DATA_SAFETY_DRAFT.md`.
