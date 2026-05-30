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

`app.json` declara Android-first, package inicial `com.meuadvogado.app` e permissoes `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION`. O package name ainda deve ser confirmado antes de Play Store.

## Integracao Inicial

- `app.config.ts` le `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- A anon key e usada somente para Supabase Auth; regra de negocio e dados de dominio continuam via backend.
- O app explica a finalidade da localizacao antes de chamar o prompt nativo.
- Antes de release interno, validar o fluxo completo em Android com backend local/staging e credenciais de teste para revisor.
- Para desenvolvimento com Expo Go, o AVD precisa de Expo Go compativel com SDK 52. O AVD `Pixel_9` foi corrigido com o APK oficial `Expo-Go-2.32.20` e abriu a tela inicial via Metro local/deep link. Com `EXPO_PUBLIC_SUPABASE_ANON_KEY` em runtime, login real e areas via UI foram validados. Como o provider de localizacao do AVD/Expo Go seguiu instavel, o smoke local usa fallback dev explicito via `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK=true`; essa flag fica desligada por padrao e nao deve ser usada em release interno/producao.
- Com o fallback dev ligado, o fluxo visual Android fechou prompt nativo, botao `Buscar match` habilitado e estado vazio/stub apos chamada de match via UI.
- Logos oficiais foram adicionadas em `assets/` e configuradas como icon, adaptive icon e splash. A experiencia pre-login foi corrigida para exibir somente login; Home/Match entra apenas apos sessao.
