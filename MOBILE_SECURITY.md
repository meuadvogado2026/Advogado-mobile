# Mobile Security - Meu Advogado 2.0

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
- como tentar novamente se negar.

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

O mobile possui services de Auth, API, areas, match, localizacao e SecureStore. A anon key deve entrar por `EXPO_PUBLIC_SUPABASE_ANON_KEY`; ela e publica para Auth, mas nao deve ser confundida com service role. Logs/testes nao imprimem senha, JWT nem localizacao precisa.

Para smoke Android local, existe fallback dev de localizacao atras de `EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK=true`. Ele fica desligado por padrao, nao deve ser usado em producao/release, nao bypassa permissao negada e so retorna coordenada fixa de teste apos permissao concedida e falha do provider do AVD/Expo Go.
