# Mobile Design - Meu Advogado 2.0

**Referencia principal:** `../Telas/`  
**Sistema visual:** Lex Elite  
**Estado:** spec 008 Parte 2 local implementada

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
- Estado de permissao negada.
- Estado sem advogado encontrado.

Backlog visual fora da spec 005 sem contrato proprio:

- Dashboard do advogado.
- Cartao VIP.
- Beneficios VIP.
- Modal de urgencia/plantao.
- Mensagens internas.
- Agenda interna.

## Regras De UI

- Touch targets com minimo 44x44.
- Bottom navigation fixa em mobile: `Inicio`, `Buscar` e `Conta`.
- Permissao de localizacao deve ser explicada antes do prompt nativo.
- CTA WhatsApp sempre verde.
- Urgencia sempre exige confirmacao.
- O card do advogado indicado e o elemento principal da home.
- `Buscar` e apenas atalho para o fluxo real de areas/localizacao/match, nao uma feature separada.
- `Conta` concentra sessao, sair e links legais.
- Perfil do advogado pode exibir capa, avatar, mini bio e bio completa quando o backend retornar campos HTTPS seguros.
- Quando foto/capa estiverem ausentes ou invalidas, usar fallback visual premium sem quebrar a tela.

## Validacao Visual

Antes de fechar telas:

- Comparar contra screenshots em `../Telas/`.
- Smoke em viewport Android.
- Checar texto truncado e contraste.

## Implementacao Inicial

`src/screens/HomeScreen.tsx` implementa login, estado autenticado, shell/header, bottom navigation, carregamento de areas juridicas, explicacao de localizacao antes do prompt nativo e card "Advogado Indicado" com match real. `src/screens/LawyerProfileScreen.tsx` fecha perfil, WhatsApp externo e, na spec 008 Parte 2, foto/capa/bio com fallback seguro. As specs 005/008 nao reintroduzem mensagens, agenda ou plantao como funcionalidades internas.
