# Mobile Design - Meu Advogado 2.0

**Referencia principal:** `../Telas/`  
**Sistema visual:** Lex Elite  
**Estado:** spec 008 Parte 1R implementada / SPEC008_PARTE1R_POLIMENTO_VISUAL_MOBILE_OK

## Direcao Visual

App dark-first, premium juridico, com fundo azul-marinho/obsidian, acentos dourados e CTAs funcionais em cores especificas.

## Tokens Base

- Background: `#071426`
- Surface: `#0B1628`
- Surface alt: `#121414`
- Surface container: `#1a1c1c`
- Primary gold: `#f4d264`
- Bright gold: `#ffe08a`
- Gold container: `#d6b64c`
- Deep gold: `#9f7a22`
- Electric blue: `#0266ff`
- Search surface: `#e2e2e2`
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
- Bottom navigation do cliente: somente `Home` e `Perfil`.
- Busca, areas juridicas, advogado indicado, pedido de oracao e `Como funciona?` vivem dentro da Home.
- Bottom navigation, areas juridicas e `Como funciona?` devem exibir icones visiveis, com contraste dourado no fundo escuro.
- Areas juridicas devem usar cards quadrados em scroll horizontal, com icone forte e texto legivel em ate duas linhas.
- Permissao de localizacao deve ser explicada antes do prompt nativo, mas como nota discreta no fim da Home, sem card pesado, sem borda e sem negrito.
- Topo autenticado do cliente deve manter somente a logo centralizada com cantos arredondados, sem bloco de texto de marca/sessao.
- CTA WhatsApp sempre verde.
- O card do advogado indicado e o elemento principal da home.
- O pedido de oracao usa arte original de Biblia/cruz, fica acoplado a Home e nunca ecoa o texto enviado.
- `Perfil` do cliente concentra sessao, sair e links legais sem exibir e-mail completo em screenshot.
- Perfil do advogado pode exibir capa, avatar, mini bio e bio completa quando o backend retornar campos HTTPS seguros.
- Quando foto/capa estiverem ausentes ou invalidas, usar fallback visual premium sem quebrar a tela.

## Validacao Visual

Antes de fechar telas:

- Comparar contra screenshots em `../Telas/`.
- Smoke em viewport Android.
- Checar texto truncado e contraste.

## Implementacao Inicial

`App.tsx` carrega explicitamente `Ionicons.font` antes de renderizar a navegacao. `src/screens/HomeScreen.tsx` implementa login, estado autenticado, topo com logo centralizada, bottom navigation `Home`/`Perfil` com icones, busca na Home, areas juridicas horizontais com icones/labels legiveis, nota discreta de localizacao no fim da Home, card "Advogado indicado" com match real e pedido de oracao acoplado a Home com `assets/prayer-bible-cross.png`. `src/screens/LawyerProfileScreen.tsx` fecha perfil completo com hero/capa/avatar/chips/bio/areas e WhatsApp externo, preservando allowlist segura. As specs 005/008 nao reintroduzem mensagens, agenda ou plantao como funcionalidades internas.
