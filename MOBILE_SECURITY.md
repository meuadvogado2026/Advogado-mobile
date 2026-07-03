# Mobile Security - Advogado 2.0

**Estado:** integracao inicial validada estruturalmente

## Dados No Device

Permitido:

- Token de sessao em SecureStore.
- Preferencias nao sensiveis.
- Cache de catalogo de areas juridicas.

Restrito:

- Localizacao precisa do cliente.
- Dados de urgencia.
- Telefone/WhatsApp.

Proibido:

- Service role key.
- Segredos de backend.
- Logs com token, email completo, telefone completo, payload de urgencia ou localizacao precisa.

## Permissoes

### Localizacao

Solicitar somente em contexto, apos tela explicar:

- por que e necessaria;
- como sera usada;
- que a coordenada e enviada ao backend;
- por quanto tempo pode ser retida em `match_events`, se essa persistencia continuar;
- como tentar novamente se negar.

Para uma busca transacional, avaliar coarse location e planejar Android Location Button
antes de target API 37. A permissao precisa padrao deve permanecer apenas se houver
justificativa tecnica documentada.

## Auth

- Mobile usa Supabase Auth REST apenas para login/sessao com anon key publica.
- Dados de dominio continuam via API/backend; o app nao acessa tabelas Supabase.
- Token e salvo em SecureStore e enviado como Bearer para backend quando houver sessao.
- Expiracao remove a sessao local e retorna o usuario ao login sem tela quebrada.
- `SUPABASE_SERVICE_ROLE_KEY` e proibida no mobile.

## LGPD

- Mostrar termos e politica.
- Informar finalidade da localizacao.
- Prever canal/fluxo de exclusao de conta/dados.

## Smoke De Seguranca

- Login sem token nao acessa rotas privadas.
- Cliente nao acessa rotas de advogado/admin.
- Logs locais nao exibem PII sensivel.

## Estado Atual

O mobile possui services de Auth, API, areas, match, perfil profissional, dashboard do advogado, pedido de oracao, localizacao e SecureStore. A anon key deve entrar por `EXPO_PUBLIC_SUPABASE_ANON_KEY`; ela e publica para Auth, mas nao deve ser confundida com service role. Logs/testes nao imprimem senha, JWT, WhatsApp completo nem localizacao precisa.

Spec 008 Parte 3: o bloco de pedido de oracao na Home envia texto livre para o backend com Bearer token e opcao de anonimato. Como o texto pode conter dado sensivel espontaneo, ele nao deve aparecer em logs, screenshots, harness ou docs. A tela orienta o usuario a nao incluir senha, documento, endereco completo, telefone ou detalhes juridicos sensiveis. O dashboard/cartao do advogado consome apenas dados seguros do backend e beneficios estaticos, sem pagamento, parceiro real, chat ou agenda. No backend, `prayer_requests` tem retencao operacional de 90 dias via dry-run/apply controlado; o mobile nao executa expurgo nem acessa Supabase diretamente.

Politica, termos e canal de exclusao estao publicados em `https://meuadvogado2026.github.io/meu-advogado-legal/` e acessiveis dentro do app. O canal provisiorio para solicitacoes de dados e `meuadvogado2026@gmail.com`.

Para smoke Android local, existe fallback dev de localizacao atras de `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK=true`. Ele fica desligado por padrao, nao deve ser usado em producao/release, nao bypassa permissao negada e so retorna coordenada fixa de teste apos permissao concedida e falha do provider do AVD/Expo Go.
