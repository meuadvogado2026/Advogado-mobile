# Mobile Project - Meu Advogado 2.0

**Fase:** produto MVP / spec 005 navegacao e design shell implementada com smoke visual proporcional
**Plataforma inicial:** Android  
**Plataforma futura:** iOS  
**Stack alvo:** React Native + Expo + TypeScript

## Objetivo

Construir o app nativo do cliente e do advogado para o Meu Advogado 2.0. O cliente usa localizacao do aparelho e areas juridicas para receber um advogado indicado. O advogado acessa painel, cartao VIP e beneficios.

## Responsabilidades

- Capturar permissao de localizacao com contexto claro.
- Exibir home do cliente baseada em `Telas/home_do_cliente`.
- Selecionar areas juridicas.
- Chamar API para match do advogado mais proximo.
- Exibir card e perfil do advogado.
- Abrir WhatsApp externo quando o backend retornar numero valido.
- Exibir dashboard do advogado, cartao VIP e beneficios.

## Fora De Escopo Do Mobile

- Consultar Supabase diretamente para regra de negocio.
- Guardar segredo de backend.
- Intermediar honorarios.
- Cadastrar advogado no MVP.

## Fontes De Verdade

- `../DOCUMENTACAO_TECNICA.md`
- `../ESPECIFICACAO_FUNCIONAL_APP.md`
- `../.codex/SPEC_Specs/SPEC_MeuAdvogado20_SDD.md`
- `../Telas/home_do_cliente`
- `../Telas/perfil_do_advogado`
- `../Telas/dashboard_do_advogado`

## Metodo

Todo ciclo de implementacao deve seguir SDD, Harness CLI e smoke final.

## Scaffold Atual

- Expo + React Native + TypeScript.
- `App.tsx` com React Navigation nativo e rotas `Home` e `LawyerProfile`.
- `src/screens/HomeScreen.tsx` com login/cadastro de cliente, areas via backend, contexto de localizacao e match inicial.
- `src/screens/HomeScreen.tsx` com links publicos para politica, termos e exclusao de dados.
- `src/theme/tokens.ts` com tokens do `DESIGN.md`.
- `src/config/contracts.ts` com endpoints backend consumidos pelo app.
- `app.json`/`app.config.ts` Android-first com package definitivo `com.advogado20.app`, permissoes de localizacao declaradas e variaveis publicas `EXPO_PUBLIC_*`.
- `src/services/` com Auth Supabase REST, SecureStore, API client, areas, match e location.
- Harness CLI, smoke estrutural cobrindo Auth/API/Location/Match e smoke runtime proporcional contra backend local.
- `src/screens/LawyerProfileScreen.tsx` e `src/services/lawyerProfileService.ts` fecham `Home -> Perfil -> WhatsApp` via backend.
- `src/screens/HomeScreen.tsx` com shell autenticado, logo dentro do conteudo rolavel e bottom navigation MVP sem Mensagens/Agenda.
- `expo-font` instalado/configurado para suportar a iconografia de `@expo/vector-icons` no runtime Android.

## Scripts

- `npm run start`
- `npm run android`
- `npm run typecheck`
- `npm run test`
- `npm run smoke`
- `npm run harness`
