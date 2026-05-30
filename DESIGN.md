# Mobile Design - Meu Advogado 2.0

**Referencia principal:** `../Telas/`  
**Sistema visual:** Lex Elite  
**Estado:** draft inicial

## Direcao Visual

App dark-first, premium juridico, com fundo azul-marinho/obsidian, acentos dourados e CTAs funcionais em cores especificas.

## Tokens Base

- Background: `#071426`
- Surface: `#0B1628`
- Surface alt: `#121414`
- Primary gold: `#f4d264`
- Gold container: `#d6b64c`
- Electric blue: `#0266ff`
- WhatsApp green: `#25D366`
- Error/urgent: `#93000a`
- Text primary: `#e2e2e2`
- Text muted: `#cfc6b1`

## Tipografia

- Headings: Montserrat ou equivalente disponivel no Expo.
- Body: Inter ou equivalente.
- Labels: Inter, 12px, peso 700, tracking moderado.

## Telas MVP

- Home do cliente.
- Perfil do advogado.
- Dashboard do advogado.
- Cartao VIP.
- Beneficios VIP.
- Estado de permissao negada.
- Estado sem advogado encontrado.
- Modal de urgencia.

## Regras De UI

- Touch targets com minimo 44x44.
- Bottom navigation fixa em mobile.
- Permissao de localizacao deve ser explicada antes do prompt nativo.
- CTA WhatsApp sempre verde.
- Urgencia sempre exige confirmacao.
- O card do advogado indicado e o elemento principal da home.

## Validacao Visual

Antes de fechar telas:

- Comparar contra screenshots em `../Telas/`.
- Smoke em viewport Android.
- Checar texto truncado e contraste.

## Implementacao Inicial

`src/screens/HomeScreen.tsx` implementa login, estado autenticado, carregamento de areas juridicas, explicacao de localizacao antes do prompt nativo e card "Advogado Indicado" com match inicial. Ela evita mensagens/agenda internas e mantem WhatsApp como CTA externo futuro.
