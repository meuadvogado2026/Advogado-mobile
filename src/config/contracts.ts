export const apiContracts = {
  health: "/health",
  me: "/v1/me",
  areas: "/v1/areas",
  match: "/v1/match",
  lawyerProfile: "/v1/lawyers/:id",
  lawyerEvents: "/v1/lawyers/:id/events",
  urgentCalls: "/v1/lawyers/:id/urgent-calls"
} as const;

export const appCopy = {
  brand: "ADVOGADO 2.0",
  subtitle: "A justica ao alcance de um toque",
  location:
    "Sua localizacao e usada somente no momento da busca para indicar um advogado proximo. Voce pode negar e tentar novamente depois."
} as const;
