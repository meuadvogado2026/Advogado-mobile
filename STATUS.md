# Mobile Status - Meu Advogado 2.0

**Ultima atualizacao:** 2026-05-31
**Fase:** PRODUTO MVP / SPEC 004 MOBILE_VISUAL_VALIDADO
**Veredito:** OK

## Concluido

- [x] Documentacao inicial do ambiente mobile criada.
- [x] Escopo Android-first definido.
- [x] Regra de localizacao do cliente definida.
- [x] Regra de consumo via backend definida.
- [x] Scaffold Expo/React Native/TypeScript criado.
- [x] Navegacao inicial com Home placeholder criada.
- [x] Tema/tokens iniciais criados.
- [x] Contratos backend em codigo criados.
- [x] Harness CLI e smoke estrutural criados.
- [x] Auth mobile inicial via Supabase Auth REST com anon key publica configuravel.
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
- [x] `app.json` configurado com icon, adaptive icon e splash usando a identidade oficial.
- [x] Fluxo visual corrigido: sem sessao, app mostra somente tela de login; Home/Match aparece apenas apos login/sessao.
- [x] Fallback local dev de localizacao criado com `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK=true`, acionado somente apos permissao concedida e falha do provider.
- [x] Match via UI Android validado visualmente com fallback dev explicito: login real, areas, prompt nativo, botao habilitado e estado vazio/stub.
- [x] Permissao de localizacao negada revalidada visualmente no Android; app mostra estado claro e mantem `Buscar match` bloqueado.
- [x] Ambiente mobile passou a ser governado pela `.codex/` unica da raiz; copia local `Meu Advogado 2.0 - mobile/.codex` removida.
- [x] `smoke:runtime` corrigido para autenticar antes do `POST /v1/match`; Railway, 6 areas, login real e match autenticado passaram com token redigido.
- [x] Novo APK preview EAS com UX corrigida gerado: build `4352f306-53b9-4989-8eed-02bd71518dd3`.
- [x] Links publicos de `Privacidade`, `Termos` e `Excluir dados` adicionados na tela de login e na Home.
- [x] Package Android definitivo fixado como `com.advogado20.app`.
- [x] Rota `LawyerProfile`, CTA `Ver perfil`, voltar, distancia efemera e WhatsApp condicional implementados.
- [x] Estados loading, erro, perfil indisponivel e WhatsApp ausente implementados sem inventar dados.
- [x] Harness passou com 9 testes e runtime Railway validou perfil seguro com token redigido.
- [x] Smoke visual Android fechou `Home -> Ver perfil -> LawyerProfile -> Voltar -> Falar no WhatsApp`.

## Em Andamento

- [x] Integrar API.
- [x] Implementar prompt real de localizacao.
- [x] Rodar smoke visual inicial em emulador Android.
- [x] Implementar navegacao `Home -> Perfil do advogado -> WhatsApp` conforme spec 004.
- [x] Demonstrar visualmente `Home -> LawyerProfile -> voltar -> WhatsApp` em Android.

## Bloqueios E Lacunas

- Runtime real depende de `EXPO_PUBLIC_SUPABASE_ANON_KEY`; a key existe na `.env` raiz e deve continuar sendo carregada apenas no ambiente do comando.
- Politica, termos e canal de exclusao publicados via GitHub Pages e linkados no app.
- `npm run android` em modo nao interativo ainda para no prompt da Expo CLI porque o APK instalado a partir do release `Expo-Go-2.32.20` reporta `versionName=2.32.19`; o workaround validado foi `npx expo start --localhost --clear` + `adb reverse` + deep link `exp://127.0.0.1:8081`.
- `npm install` reportou vulnerabilidades transitivas do ecossistema Expo; revisar antes de release.
- Localizacao real do AVD/Expo Go segue instavel; fallback dev local fecha apenas smoke Android local e nao deve ser usado em producao/release.
- Match real PostGIS implementado e validado e2e no backend contra Supabase com token de cliente real (`back/scripts/match-smoke.ts`: matched SP/civil 0km, empty, 401) e ponta-a-ponta no APK preview em device fisico com GPS real, sem fallback dev.
- Novo APK preview da UX corrigida pronto, mas nenhum Android apareceu no ADB durante o ciclo; instalacao e smoke fisico pendentes.
- WhatsApp app nao esta instalado no AVD; o CTA abriu Chrome como handler externo de URL.
- Proximos ciclos devem ser iniciados pela raiz do projeto para carregar a governanca central `.codex/` e specs em `.codex/specs/`.

## Validacao Em Device Fisico (APK EAS)

- APK preview gerado via EAS Build (perfil `preview`, projeto `@advogado2.0/meu-advogado-20`), apontando para o backend de producao na Railway.
- Instalado em device Android fisico: login real `usuario@advogado20.com` OK, 6 areas via backend, **permissao de localizacao concedida e GPS real** disparou `POST /v1/match`.
- **Match real retornou a fixture DF (Dra. Carla Lima) via PostGIS** com base na localizacao real (device a <=200km de Brasilia). GPS real -> match real ponta-a-ponta, sem fallback dev.
- Bug de UX corrigido: a tela mostrava copy antigo ("match fica para o proximo ciclo"); agora exibe cidade/distancia do advogado + botao "Falar no WhatsApp". Rebuild gerado; smoke fisico do novo APK pendente.

## Proximo Passo

Commitar/publicar a perna mobile da spec 004 quando apropriado e planejar o proximo gate de release/preview. A spec 003 permanece `PAUSADA_COM_PENDENCIAS_RASTREADAS`.
