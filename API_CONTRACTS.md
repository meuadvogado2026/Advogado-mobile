# Mobile API Contracts - Meu Advogado 2.0

**Estado:** match e perfil profissional integrados pelo backend Railway
**Base path esperado:** `/v1`

## Auth

O mobile usa Supabase Auth REST apenas para login/sessao:

- `POST {SUPABASE_URL}/auth/v1/token?grant_type=password`

Dados de dominio nao acessam Supabase diretamente.

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
  "lawyer": { "id": "uuid", "name": "Dr. Nome", "whatsapp": "...", "city": "Brasilia", "state": "DF", "areaIds": ["uuid"] },
  "distanceKm": 1.2,
  "algorithmVersion": "geo-nearest-v1"
}
```

Response sem advogado:

```json
{ "status": "empty", "lawyer": null, "algorithmVersion": "geo-nearest-v1" }
```

## Advogado

- `GET /v1/lawyers/:id` - consumido pelo mobile com Bearer token pela API Railway

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
    "verified": true
  }
}
```

Nao expor CEP, endereco completo, coordenada, email ou auditoria. Distancia vem como
contexto efemero do match, nao como dado do perfil.

## Advogado Logado

- `GET /lawyer/dashboard`
- `GET /lawyer/vip-card`
- `GET /lawyer/benefits`

## Erros Padrao

- `401`: nao autenticado.
- `403`: sem permissao.
- `404`: recurso nao encontrado.
- `422`: payload invalido.
- `429`: rate limit.
- `500`: erro interno.

## Estado Atual

Os contratos vivem tambem em `src/config/contracts.ts`. O app possui chamadas HTTP para areas, match real e perfil profissional via backend. A distancia do match segue apenas como contexto efemero da navegacao.
