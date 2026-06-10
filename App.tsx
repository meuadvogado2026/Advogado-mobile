import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LawyerProfile" component={LawyerProfileScreen} />
        <Stack.Screen name="LawyerCityResults" component={LawyerCityResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
