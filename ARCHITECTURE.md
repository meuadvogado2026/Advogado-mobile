# Arquitetura mobile AS-IS

Fonte: analise direta do codigo; 2026-11-15. Recorte worktree .codex-auth-024, nao comprovacao de runtime do APK.

## Stack
Expo57.0.33 / React19.2.3 / RN0.86.3 / TypeScript6; navegacao ReactNavigation7; Android com package com.advogado20.app, target/compile36. SecureStore, WebBrowser, Location e SVG. Nao existem SDKResend, service role ou acesso a tabelas Supabase no app.

## Fluxo e estrutura
App.tsx compoe ErrorBoundary/NavigationContainer e telas Home/LawyerProfile/LawyerCityResults. HomeScreen organiza login/cadastro/Google e experiencias porrole; services separados emsrc/services e contratos emsrc/config. APIs HTTP passam por apiClient; autoridade negocio e backend. AuthService usa somente SupabaseAuthREST com publicanonkey e SecureStore. Nenhuma .codex neste ambiente; governanca central na raiz.

Fluxo de referencia: HomeScreen -> matchService/apiClient -> API /v1/match (localizacao transitoria) -> LawyerProfileScreen. API e contratos preservados; descricao de busca porcidade corrigida incorporada nesta branch.

## Modelo e ownership
Session accessToken/refreshToken/expiresAt/email em SecureStore. CurrentUser role/mustChangePassword e dadosdeUI em estadoReact. Catalogo/advogados/metricas/pedidos sao backend-owned, sem escrita direta em banco. App nao decide role. Nenhuma entidade ou migration de recuperacao local.

## Contratos e autenticacao
MOD-004 consome CON-004 API mobile e CON-024 POSTpassword-recovery/password-reset. Reset envia provaoficial/newPassword/confirmPassword semBearer ou userID. App nunca recebe sessao de recuperacao. Refresh renova sessao expirada e limpa token revogado; indisponibilidade de rede preserva armazenamento seguro. Logout limpa local e tenta scope-local remoto; offline nao garante revogacao.

## Navegacao e dados temporarios
App.tsx verifica Linking.getInitialURL antes de mostrar navegacao e assina eventos url para warm link. Somente advogado20://auth/password-reset com fragmento validado abre PasswordAccessScreen; entrada incompleta orienta pedirnovo. Prova emestado, removida ao concluir/sair; nao e navigationparam nem analytics. Tela desmonta Home durante reset e nao substitui sessao normal por tokenrecovery. CallbackGoogle auth/callback permanece separado.

Webfallback e /redefinir-senha no admin profissional, com gesto explicito para abrir app e opcao de concluir no navegador. Scheme custom nao e AppLink verificado; testeAPK continuaobrigatorio.

## Regras de camada e patterns
UI -> services HTTP/Auth/storage; nao SDKsecret, database ou provideremail. Backend -> SupabaseAuth/Resend. Nenhum ciclo introduzido; adapter API/service existente reaproveitado. Auth e recuperacao isolam sessao/prova por fronteira (ADR-017/AUTH_LINKS.md).

## Estado, offline e plataforma
Semfilaoffline de credenciais. Erros/retry explicitos, Keyboard.dismiss antes do reset, ScrollView e labels acessiveis/autocomplete new-password. Sessao persistida somente SecureStore; senha/hash so emmemoria. Permissoes novas:nenhuma. VersionCode continua7 ate verificar maior remoto e gerarpreview; nenhum AAB/Play neste ciclo.

## Gates e lacunas
npm run harness (typecheck/tests/smokestructural); tests/passwordAccess/sessionRefresh provam parsing/rede/refresh/logout. ExpoDoctor21/21 e expo install --check validam compatibilidade, nao runtime. Android cold/warm/semapp/Google e APKnovo ainda pendentes. APIenv/Resend/permissoes/TTL do provedor sao gates separados no backend. AUDIT mobile3moderadas transitivas registradas, sem high/critical no limiar executado; nao usar force sem avaliar compatibilidadeExpo.
