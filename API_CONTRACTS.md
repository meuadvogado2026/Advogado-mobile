# Mobile API Contracts - Meu Advogado 2.0

**Estado:** alinhado ao OpenAPI inicial do backend  
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
  "lawyer": {
    "id": "uuid",
    "name": "Dr. Nome",
    "oab": "OAB/SP 123456",
    "distanceKm": 1.2,
    "mainSpecialty": "Direito Civil",
    "secondarySpecialties": ["Consumidor"],
    "avatarUrl": "https://...",
    "coverUrl": "https://...",
    "whatsappAvailable": true
  }
}
```

## Advogado

- `GET /lawyers/:id`
- `POST /lawyers/:id/events`
- `POST /lawyers/:id/urgent-calls`

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

Os contratos vivem tambem em `src/config/contracts.ts`. O app ja possui chamadas HTTP para areas e match via backend; o match ainda retorna stub/estado vazio ate o ciclo PostGIS.
