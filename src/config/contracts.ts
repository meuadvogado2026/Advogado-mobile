export const apiContracts = {
  health: "/health",
  clientSignup: "/v1/auth/signup-client",
  changePassword: "/v1/auth/change-password",
  me: "/v1/me",
  areas: "/v1/areas",
  states: "/v1/states",
  stateCities: "/v1/states/:stateId/cities",
  match: "/v1/match",
  matchByCity: "/v1/match/by-city",
  lawyerProfile: "/v1/lawyers/:id",
  lawyerDashboard: "/v1/lawyer/me/dashboard",
  prayerRequests: "/v1/prayer-requests",
  partnerLogos: "/v1/partner-logos",
  lawyerEvents: "/v1/lawyers/:id/events",
  urgentCalls: "/v1/lawyers/:id/urgent-calls"
} as const;

export const appCopy = {
  brand: "Meu Advogado 2.0",
  subtitle: "A justiça ao alcance de um toque",
  location:
    "Sua localização é usada somente no momento da busca para indicar um advogado próximo. Você pode negar e tentar novamente depois."
} as const;
