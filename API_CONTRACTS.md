# Mobile API Contracts - Meu Advogado 2.0

**Estado:** match e perfil profissional integrados pelo backend Railway
**Base path esperado:** `/v1`

## Auth

O mobile usa o backend para cadastro de cliente e Supabase Auth REST apenas para
login/sessao:

- `POST /v1/auth/signup-client`
- `POST {SUPABASE_URL}/auth/v1/token?grant_type=password`

Dados de dominio nao acessam Supabase diretamente.

### `POST /v1/auth/signup-client`

Request:

```json
{ "name": "Cliente Nome", "email": "cliente@example.com", "password": "senha-segura" }
```

Response:

```json
{ "user": { "id": "uuid", "email": "cliente@example.com", "role": "client" }, "persistence": "supabase" }
```

O app nao recebe senha/token nessa resposta; apos criar, usa o login Supabase Auth REST
existente para iniciar sessao.

## Catalogo

- `GET /v1/areas`

## Match

### `POST /v1/match`

Request:

```json
{
  "lat": -23.55052,
  "lng": -46.633308,
  "accuracyM": 30,
  "areaIds": ["uuid"]
}
```

Response sucesso:

```json
{
  "status": "matched",
  "lawyer": {
    "id": "uuid",
    "name": "Dr. Nome",
    "whatsapp": "...",
    "city": "Brasilia",
    "state": "DF",
    "areaIds": ["uuid"],
    "avatarUrl": "https://cdn.example.com/avatar.jpg",
    "coverUrl": "https://cdn.example.com/capa.jpg"
  },
  "distanceKm": 1.2,
  "algorithmVersion": "geo-nearest-v1"
}
```

Response sem advogado:

```json
{ "status": "empty", "lawyer": null, "algorithmVersion": "geo-nearest-v1" }
```

O card de match na Home renderiza `coverUrl` e `avatarUrl` imediatamente quando a
resposta `matched` traz URLs HTTPS; sem imagem, permanece no fallback visual.

## Parceiros

- `GET /v1/partner-logos` - lista publica de parceiros ativos para o rodape da Home.

Response:

```json
{
  "partners": [
    {
      "id": "uuid",
      "name": "Parceiro",
      "logoUrl": "https://cdn.example.com/parceiro.png",
      "websiteUrl": "https://parceiro.example.com",
      "active": true,
      "createdAt": "2026-06-04T00:00:00Z",
      "updatedAt": "2026-06-04T00:00:00Z"
    }
  ],
  "persistence": "supabase"
}
```

## Advogado

- `GET /v1/lawyers/:id` - consumido pelo mobile com Bearer token pela API Railway; usado pelo cliente e pelo advogado em perfil readonly

Resposta planejada:

```json
{
  "lawyer": {
    "id": "uuid",
    "name": "Dra. Carla Lima",
    "oabNumber": "123456",
    "oabState": "DF",
    "city": "Brasilia",
    "state": "DF",
    "areaIds": ["uuid"],
    "areas": [{ "id": "uuid", "name": "Direito Civil" }],
    "whatsapp": "...",
    "verified": true,
    "avatarUrl": "https://cdn.example.com/avatar.jpg",
    "coverUrl": "https://cdn.example.com/capa.jpg",
    "miniBio": "Atendimento consultivo em direito civil.",
    "fullBio": "Texto publico do perfil profissional.",
    "yearsExperience": null,
    "planLabel": null,
    "emergencyAvailable": false
  }
}
```

Campos visuais sao opcionais. O app renderiza foto/capa apenas quando a URL HTTPS vem
do backend; ausente ou invalida usa fallback visual. Nao expor CEP, endereco completo,
coordenada, email ou auditoria. Distancia vem como contexto efemero do match, nao como
dado do perfil.

## Advogado Logado

- `GET /v1/lawyer/me/dashboard`
- Beneficios reais futuros dependem de admin/back; o cartao especial atual e renderizado no app a partir do dashboard.

Resposta do dashboard:

```json
{
  "lawyer": {
    "id": "uuid",
    "name": "Dra. Nome",
    "oabNumber": "123456",
    "oabState": "SP",
    "planLabel": "MVP interno",
    "verified": true
  },
  "metrics": { "profileViews": 0, "whatsappClicks": 0, "contacts": 0 },
  "benefits": [{ "id": "verified-profile", "title": "Perfil verificado", "description": "..." }]
}
```

Metricas sao placeholder seguro no MVP. Beneficios sao estaticos; sem pagamento,
parceiro externo, cupom real, chat ou agenda.

## Oracao

- `POST /v1/prayer-requests` - usado por cliente e advogado autenticados.

Request:

```json
{ "message": "Texto entre 20 e 500 caracteres", "anonymous": true }
```

Response:

```json
{ "request": { "id": "uuid", "status": "received", "createdAt": "2026-06-03T00:00:00Z" } }
```

O app nao deve exibir nem registrar payload sensivel em logs/smokes. A resposta nao ecoa
o texto enviado.

## Erros Padrao

- `401`: nao autenticado.
- `403`: sem permissao.
- `404`: recurso nao encontrado.
- `422`: payload invalido.
- `429`: rate limit.
- `500`: erro interno.

## Estado Atual

Os contratos vivem tambem em `src/config/contracts.ts`. O app possui chamadas HTTP para areas, match real com foto/capa, perfil profissional, parceiros publicos, dashboard do advogado e pedido de oracao via backend. A distancia do match segue apenas como contexto efemero da navegacao.
