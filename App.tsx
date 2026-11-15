import { useEffect, useState } from "react";
import { Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PasswordAccessScreen } from "./src/screens/PasswordAccessScreen";
import { readPasswordLink } from "./src/services/passwordAccess";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LawyerProfileScreen } from "./src/screens/LawyerProfileScreen";
import { LawyerCityResultsScreen } from "./src/screens/LawyerCityResultsScreen";

export type RootStackParamList = {
  Home: undefined;
  LawyerProfile: {
    lawyerId: string;
    distanceKm?: number;
  };
  LawyerCityResults: {
    stateId: string;
    cityId: string;
    cityName: string;
    areaIds: string[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [access, setAccess] = useState<{ tokenHash?: string; invalidLink?: boolean; key: number } | null>(null);
  const [initialLinkChecked, setInitialLinkChecked] = useState(false);
  useEffect(() => {
    const open = (url: string | null) => {
      if (!url) return;
      const proof = readPasswordLink(url);
      if (proof) setAccess({ ...proof, key: Date.now() });
      else if (url.startsWith("advogado20://auth/password-reset")) setAccess({ invalidLink: true, key: Date.now() });
    };
    const listener = Linking.addEventListener("url", event => open(event.url));
    Linking.getInitialURL().then(open).finally(() => setInitialLinkChecked(true));
    return () => listener.remove();
  }, []);
  if (!initialLinkChecked) return null;
  if (access) return <SafeAreaProvider><PasswordAccessScreen key={access.key} tokenHash={access.tokenHash} invalidLink={access.invalidLink} onClose={() => setAccess(null)} /></SafeAreaProvider>;
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="LawyerProfile" component={LawyerProfileScreen} />
          <Stack.Screen name="LawyerCityResults" component={LawyerCityResultsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
