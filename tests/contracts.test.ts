import { afterEach, describe, expect, it, vi } from "vitest";
import { apiContracts, appCopy } from "../src/config/contracts";
import { createApiClient } from "../src/services/apiClient";
import { createAuthService } from "../src/services/authService";
import { createAreasService } from "../src/services/areasService";
import { createClientSignupService } from "../src/services/clientSignupService";
import { createGeographyService } from "../src/services/geographyService";
import { requestDeviceLocation } from "../src/services/locationService";
import { createLawyerDashboardService } from "../src/services/lawyerDashboardService";
import { createLawyerProfileService } from "../src/services/lawyerProfileService";
import { createMatchService } from "../src/services/matchService";
import { createMeService } from "../src/services/meService";
import { createPartnerLogoService } from "../src/services/partnerLogoService";
import { createPrayerRequestService } from "../src/services/prayerRequestService";
import type { Session, SessionStorage } from "../src/services/sessionStorage";

const locationMock = vi.hoisted(() => ({
  requestForegroundPermissionsAsync: vi.fn(),
  getCurrentPositionAsync: vi.fn()
}));

vi.mock("expo-location", () => ({
  PermissionStatus: {
    GRANTED: "granted"
  },
  Accuracy: {
    Balanced: 3,
    High: 5
  },
  requestForegroundPermissionsAsync: locationMock.requestForegroundPermissionsAsync,
  getCurrentPositionAsync: locationMock.getCurrentPositionAsync
}));

function memoryStorage(): SessionStorage {
  let storedSession: Session | null = null;

  return {
    async get() {
      return storedSession;
    },
    async set(session) {
      storedSession = session;
    },
    async clear() {
      storedSession = null;
    }
  };
}

const publicTestConfig = {
  apiBaseUrl: "http://127.0.0.1:3333",
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "anon-public-test-key"
};

describe("mobile foundation contracts", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("uses backend API contracts instead of Supabase direct access", () => {
    expect(apiContracts.match).toBe("/v1/match");
    expect(apiContracts.matchByCity).toBe("/v1/match/by-city");
    expect(apiContracts.states).toBe("/v1/states");
    expect(apiContracts.clientSignup).toBe("/v1/auth/signup-client");
    expect(apiContracts.me).toBe("/v1/me");
    expect(apiContracts.lawyerDashboard).toBe("/v1/lawyer/me/dashboard");
    expect(apiContracts.prayerRequests).toBe("/v1/prayer-requests");
    expect(apiContracts.partnerLogos).toBe("/v1/partner-logos");
    expect(Object.values(apiContracts).some((path) => path.includes("supabase"))).toBe(false);
  });

  it("explains location before the native permission flow is implemented", () => {
    expect(appCopy.location).toContain("localização");
    expect(appCopy.location).toContain("Você pode negar");
  });

  it("stores only the returned session after controlled Supabase Auth login", async () => {
    const storage = memoryStorage();
    const calls: string[] = [];
    const auth = createAuthService({
      config: publicTestConfig,
      storage,
      fetchImpl: (async (url, init) => {
        calls.push(String(url));
        expect(String(init?.body)).not.toContain("service_role");
        return new Response(
          JSON.stringify({
            access_token: "jwt-redacted",
            refresh_token: "refresh-redacted",
            expires_in: 3600,
            user: { email: "usuario@advogado20.com" }
          }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    const session = await auth.signIn("usuario@advogado20.com", "senha-de-teste");

    expect(calls[0]).toBe("https://example.supabase.co/auth/v1/token?grant_type=password");
    expect(session.accessToken).toBe("jwt-redacted");
    expect(await storage.get()).toMatchObject({ email: "usuario@advogado20.com" });
  });

  it("creates a client user through the backend signup boundary", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      fetchImpl: (async (url, init) => {
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/auth/signup-client");
        expect(init?.method).toBe("POST");
        expect(String(init?.body)).not.toContain("service_role");
        expect(JSON.parse(String(init?.body))).toEqual({
          name: "Cliente Novo",
          email: "cliente-novo@example.test",
          password: "senha-segura-123"
        });
        return new Response(
          JSON.stringify({
            user: { id: "client-new", email: "cliente-novo@example.test", role: "client" },
            persistence: "memory"
          }),
          { status: 201 }
        );
      }) as typeof fetch
    });

    await expect(
      createClientSignupService(api).create({
        name: "Cliente Novo",
        email: "cliente-novo@example.test",
        password: "senha-segura-123"
      })
    ).resolves.toEqual({
      user: { id: "client-new", email: "cliente-novo@example.test", role: "client" },
      persistence: "memory"
    });
  });

  it("loads legal areas through the backend API", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      fetchImpl: (async (url) => {
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/areas");
        return new Response(JSON.stringify({ areas: [{ id: "civil", slug: "civil", name: "Civil" }] }), {
          status: 200
        });
      }) as typeof fetch
    });

    await expect(createAreasService(api).listAreas()).resolves.toEqual({
      areas: [{ id: "civil", slug: "civil", name: "Civil" }]
    });
  });

  it("loads the current user role through the authenticated backend API", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      getSession: async () => ({
        accessToken: "jwt-redacted",
        email: "advogado@advogado20.com"
      }),
      fetchImpl: (async (url, init) => {
        const headers = new Headers(init?.headers);
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/me");
        expect(headers.get("Authorization")).toBe("Bearer jwt-redacted");
        return new Response(
          JSON.stringify({
            user: { id: "lawyer-user", name: "Dra. Teste", email: "advogado@advogado20.com", role: "lawyer" }
          }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    await expect(createMeService(api).getCurrentUser()).resolves.toEqual({
      user: { id: "lawyer-user", name: "Dra. Teste", email: "advogado@advogado20.com", role: "lawyer" }
    });
  });

  it("posts match payload with bearer token when a session exists", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      getSession: async () => ({
        accessToken: "jwt-redacted",
        email: "usuario@advogado20.com"
      }),
      fetchImpl: (async (url, init) => {
        const headers = new Headers(init?.headers);
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/match");
        expect(headers.get("Authorization")).toBe("Bearer jwt-redacted");
        expect(JSON.parse(String(init?.body))).toEqual({
          lat: -23.55,
          lng: -46.63,
          accuracyM: 50,
          areaIds: ["civil"]
        });
        return new Response(
          JSON.stringify({
            lawyer: {
              id: "lawyer-123",
              name: "Dra. Ana Geo",
              whatsapp: "11988887777",
              avatarUrl: "https://cdn.example.test/ana-avatar.jpg",
              coverUrl: "https://cdn.example.test/ana-cover.jpg"
            },
            distanceReliable: false,
            distanceNotice: "Localizacao do advogado em confirmacao.",
            status: "matched"
          }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    await expect(
      createMatchService(api).requestMatch({ lat: -23.55, lng: -46.63, accuracyM: 50, areaIds: ["civil"] })
    ).resolves.toMatchObject({
      lawyer: {
        id: "lawyer-123",
        avatarUrl: "https://cdn.example.test/ana-avatar.jpg",
        coverUrl: "https://cdn.example.test/ana-cover.jpg"
      },
      distanceReliable: false,
      distanceNotice: "Localizacao do advogado em confirmacao.",
      status: "matched"
    });
  });

  it("loads dependent cities and searches by city without coordinates", async () => {
    const calls: Array<{ url: string; body?: unknown }> = [];
    const api = createApiClient({
      config: publicTestConfig,
      getSession: async () => ({ accessToken: "jwt-redacted", email: "usuario@advogado20.com" }),
      fetchImpl: (async (url, init) => {
        calls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : undefined });
        if (String(url).endsWith("/v1/states")) {
          return new Response(JSON.stringify({ states: [{ id: "state-df", code: "DF", name: "Distrito Federal", active: true }] }), { status: 200 });
        }
        if (String(url).includes("/v1/states/state-df/cities")) {
          return new Response(JSON.stringify({ cities: [{ id: "city-bsb", stateId: "state-df", name: "Brasilia", active: true }] }), { status: 200 });
        }
        return new Response(JSON.stringify({
          status: "matched",
          lawyers: [{ id: "lawyer-1", name: "Dra. Cidade", areaIds: ["civil"], distanceFromCityCenterKm: 2.1 }],
          pagination: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
          algorithmVersion: "city-nearest-v1"
        }), { status: 200 });
      }) as typeof fetch
    });

    await createGeographyService(api).listStates();
    await createGeographyService(api).listCities("state-df");
    await createMatchService(api).requestCityMatch({ stateId: "state-df", cityId: "city-bsb", areaIds: ["civil"], page: 1, pageSize: 5 });

    expect(calls[2]).toEqual({
      url: "http://127.0.0.1:3333/v1/match/by-city",
      body: { stateId: "state-df", cityId: "city-bsb", areaIds: ["civil"], page: 1, pageSize: 5 }
    });
    expect(calls[2]?.body).not.toHaveProperty("lat");
    expect(locationMock.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("loads public partner logos through the backend API", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      fetchImpl: (async (url) => {
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/partner-logos");
        return new Response(
          JSON.stringify({
            partners: [
              {
                id: "partner-123",
                name: "Parceiro Teste",
                logoUrl: "https://cdn.example.test/partner.png",
                websiteUrl: "https://partner.example.test",
                active: true,
                createdAt: "2026-06-04T00:00:00Z",
                updatedAt: "2026-06-04T00:00:00Z"
              }
            ],
            persistence: "memory"
          }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    await expect(createPartnerLogoService(api).listPublic()).resolves.toMatchObject({
      partners: [{ name: "Parceiro Teste", logoUrl: "https://cdn.example.test/partner.png" }],
      persistence: "memory"
    });
  });

  it("loads a lawyer profile through the authenticated backend API", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      getSession: async () => ({
        accessToken: "jwt-redacted",
        email: "usuario@advogado20.com"
      }),
      fetchImpl: (async (url, init) => {
        const headers = new Headers(init?.headers);
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/lawyers/lawyer-123");
        expect(headers.get("Authorization")).toBe("Bearer jwt-redacted");
        return new Response(
          JSON.stringify({
            lawyer: {
              id: "lawyer-123",
              name: "Dra. Carla Lima",
              oabNumber: "123456",
              oabState: "DF",
              city: "Brasilia",
              state: "DF",
              areaIds: ["civil"],
              areas: [{ id: "civil", name: "Direito Civil" }],
              whatsapp: "61999999999",
              verified: true,
              avatarUrl: "https://cdn.example.test/avatar.jpg",
              coverUrl: null,
              miniBio: "Atendimento civil preventivo.",
              fullBio: null,
              instagramUrl: "https://instagram.com/dracarla",
              linkedinUrl: "https://www.linkedin.com/in/dracarla",
              facebookUrl: null,
              websiteUrl: "https://carla.example.test",
              emergencyAvailable: false
            }
          }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    await expect(createLawyerProfileService(api).getById("lawyer-123")).resolves.toMatchObject({
      lawyer: {
        id: "lawyer-123",
        verified: true,
        areas: [{ id: "civil", name: "Direito Civil" }],
        avatarUrl: "https://cdn.example.test/avatar.jpg",
        coverUrl: null,
        miniBio: "Atendimento civil preventivo.",
        fullBio: null,
        instagramUrl: "https://instagram.com/dracarla",
        linkedinUrl: "https://www.linkedin.com/in/dracarla",
        facebookUrl: null,
        websiteUrl: "https://carla.example.test"
      }
    });
  });

  it("loads lawyer dashboard through the authenticated backend API", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      getSession: async () => ({
        accessToken: "jwt-redacted",
        email: "advogado@advogado20.com"
      }),
      fetchImpl: (async (url, init) => {
        const headers = new Headers(init?.headers);
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/lawyer/me/dashboard");
        expect(headers.get("Authorization")).toBe("Bearer jwt-redacted");
        return new Response(
          JSON.stringify({
            lawyer: {
              id: "lawyer-123",
              name: "Dra. Carla Lima",
              oabNumber: "123456",
              oabState: "DF",
              planLabel: "MVP interno",
              verified: true
            },
            metrics: { profileViews: 0, whatsappClicks: 0, contacts: 0 },
            benefits: [{ id: "verified-profile", title: "Perfil verificado", description: "Seguro" }]
          }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    await expect(createLawyerDashboardService(api).getDashboard()).resolves.toMatchObject({
      lawyer: { id: "lawyer-123", verified: true },
      metrics: { profileViews: 0, whatsappClicks: 0, contacts: 0 }
    });
  });

  it("sends prayer request through the authenticated backend API without echoing secrets locally", async () => {
    const api = createApiClient({
      config: publicTestConfig,
      getSession: async () => ({
        accessToken: "jwt-redacted",
        email: "usuario@advogado20.com"
      }),
      fetchImpl: (async (url, init) => {
        const headers = new Headers(init?.headers);
        const payload = JSON.parse(String(init?.body));
        expect(String(url)).toBe("http://127.0.0.1:3333/v1/prayer-requests");
        expect(init?.method).toBe("POST");
        expect(headers.get("Authorization")).toBe("Bearer jwt-redacted");
        expect(payload).toEqual({
          message: "Pedido reservado com tamanho suficiente para teste.",
          anonymous: true
        });
        return new Response(
          JSON.stringify({ request: { id: "request-123", status: "received", createdAt: "2026-06-03T00:00:00Z" } }),
          { status: 201 }
        );
      }) as typeof fetch
    });

    await expect(
      createPrayerRequestService(api).create({
        message: "Pedido reservado com tamanho suficiente para teste.",
        anonymous: true
      })
    ).resolves.toEqual({
      request: { id: "request-123", status: "received", createdAt: "2026-06-03T00:00:00Z" }
    });
  });

  it("uses the device location when Expo returns coordinates", async () => {
    locationMock.requestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    locationMock.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: -23.55,
        longitude: -46.63,
        accuracy: 50
      }
    });

    await expect(requestDeviceLocation()).resolves.toEqual({
      status: "granted",
      location: { lat: -23.55, lng: -46.63, accuracyM: 50, source: "device" }
    });
    expect(locationMock.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 5 });
  });

  it("keeps match blocked when location is unavailable and fallback is off", async () => {
    locationMock.requestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    locationMock.getCurrentPositionAsync.mockRejectedValue(new Error("provider unavailable"));

    await expect(requestDeviceLocation()).resolves.toEqual({ status: "unavailable" });
  });

  it("does not fall back to synthetic coordinates even when old dev flag is present", async () => {
    vi.stubEnv("EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK", "true");
    locationMock.requestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    locationMock.getCurrentPositionAsync.mockRejectedValue(new Error("provider unavailable"));

    await expect(requestDeviceLocation()).resolves.toEqual({ status: "unavailable" });
  });
});
