import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LawyerProfileScreen } from "./src/screens/LawyerProfileScreen";

export type RootStackParamList = {
  Home: undefined;
  LawyerProfile: {
    lawyerId: string;
    distanceKm?: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontFallbackReady, setFontFallbackReady] = useState(false);
  const [fontsLoaded] = useFonts(Ionicons.font);

  useEffect(() => {
    const timer = setTimeout(() => setFontFallbackReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontFallbackReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#071426" }}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LawyerProfile" component={LawyerProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
