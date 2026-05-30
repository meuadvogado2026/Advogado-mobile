import * as Location from "expo-location";

export type DeviceLocation = {
  lat: number;
  lng: number;
  accuracyM: number;
  source: "device" | "devFallback";
};

export type LocationResult =
  | { status: "granted"; location: DeviceLocation }
  | { status: "denied" }
  | { status: "unavailable" };

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const devFallbackLocation: DeviceLocation = {
  lat: -23.55052,
  lng: -46.633308,
  accuracyM: 100,
  source: "devFallback"
};

function isDevLocationFallbackEnabled() {
  const value = typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK : undefined;
  return value === "true";
}

export async function requestDeviceLocation(): Promise<LocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return { status: "denied" };
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    return {
      status: "granted",
      location: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyM: position.coords.accuracy ?? 100,
        source: "device"
      }
    };
  } catch {
    if (isDevLocationFallbackEnabled()) {
      return {
        status: "granted",
        location: devFallbackLocation
      };
    }

    return { status: "unavailable" };
  }
}
