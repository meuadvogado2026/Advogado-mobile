import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
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
  const [fontsLoaded] = useFonts({
    Ionicons: require("./assets/fonts/Ionicons.ttf")
  });

  if (!fontsLoaded) {
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
