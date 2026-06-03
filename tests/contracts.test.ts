import { afterEach, describe, expect, it, vi } from "vitest";
import { apiContracts, appCopy } from "../src/config/contracts";
import { createApiClient } from "../src/services/apiClient";
import { createAuthService } from "../src/services/authService";
import { createAreasService } from "../src/services/areasService";
import { requestDeviceLocation } from "../src/services/locationService";
import { createLawyerDashboardService } from "../src/services/lawyerDashboardService";
import { createLawyerProfileService } from "../src/services/lawyerProfileService";
import { createMatchService } from "../src/services/matchService";
import { createMeService } from "../src/services/meService";
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
    Balanced: 3
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
  supabaseAnonKey: "anon-public-test-key",
  enableDevLocationFallback: false
};

describe("mobile foundation contracts", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("uses backend API contracts instead of Supabase direct access", () => {
    expect(apiContracts.match).toBe("/v1/match");
    expect(apiContracts.me).toBe("/v1/me");
    expect(apiContracts.lawyerDashboard).toBe("/v1/lawyer/me/dashboard");
    expect(apiContracts.prayerRequests).toBe("/v1/prayer-requests");
    expect(Object.values(apiContracts).some((path) => path.includes("supabase"))).toBe(false);
  });

  it("explains location before the native permission flow is implemented", () => {
    expect(appCopy.location).toContain("localizacao");
    expect(appCopy.location).toContain("Voce pode negar");
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
          JSON.stringify({ user: { id: "lawyer-user", email: "advogado@advogado20.com", role: "lawyer" } }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    await expect(createMeService(api).getCurrentUser()).resolves.toEqual({
      user: { id: "lawyer-user", email: "advogado@advogado20.com", role: "lawyer" }
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
        return new Response(JSON.stringify({ lawyer: null, status: "stub" }), { status: 200 });
      }) as typeof fetch
    });

    await expect(
      createMatchService(api).requestMatch({ lat: -23.55, lng: -46.63, accuracyM: 50, areaIds: ["civil"] })
    ).resolves.toEqual({ lawyer: null, status: "stub" });
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
        fullBio: null
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
  });

  it("keeps match blocked when location is unavailable and fallback is off", async () => {
    locationMock.requestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    locationMock.getCurrentPositionAsync.mockRejectedValue(new Error("provider unavailable"));

    await expect(requestDeviceLocation()).resolves.toEqual({ status: "unavailable" });
  });

  it("allows explicit local Android smoke fallback without bypassing denied permission", async () => {
    vi.stubEnv("EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK", "true");
    locationMock.requestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    locationMock.getCurrentPositionAsync.mockRejectedValue(new Error("provider unavailable"));

    const result = await requestDeviceLocation();

    expect(result.status).toBe("granted");
    if (result.status === "granted") {
      expect(result.location).toMatchObject({ accuracyM: 100, source: "devFallback" });
    }
  });
});
