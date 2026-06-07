import * as Location from "expo-location";

export type DeviceLocation = {
  lat: number;
  lng: number;
  accuracyM: number;
  source: "device";
};

export type LocationResult =
  | { status: "granted"; location: DeviceLocation }
  | { status: "denied" }
  | { status: "unavailable" };

export async function requestDeviceLocation(): Promise<LocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return { status: "denied" };
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
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
    return { status: "unavailable" };
  }
}
