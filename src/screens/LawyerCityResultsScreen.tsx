import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { AppIcon } from "../components/AppIcon";
import { createApiClient } from "../services/apiClient";
import { createAuthService } from "../services/authService";
import { createMatchService, type CityMatchResponse } from "../services/matchService";
import { secureSessionStorage } from "../services/secureSessionStorage";
import { colors, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "LawyerCityResults">;

export function LawyerCityResultsScreen({ navigation, route }: Props) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<CityMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = useMemo(() => createAuthService({ storage: secureSessionStorage }), []);
  const api = useMemo(() => createApiClient({ getSession: auth.getSession }), [auth]);
  const matches = useMemo(() => createMatchService(api), [api]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    matches.requestCityMatch({ stateId: route.params.stateId, cityId: route.params.cityId, areaIds: route.params.areaIds, page, pageSize: 5 })
      .then((response) => active && setResult(response))
      .catch(() => active && setError("Nao foi possivel buscar advogados nesta cidade."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [matches, page, route.params]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><AppIcon color={colors.textPrimary} name="arrow-back" size={24} /></TouchableOpacity>
        <View style={styles.headerText}><Text style={styles.title}>Advogados em {route.params.cityName}</Text><Text style={styles.muted}>Ordenados pela proximidade ao centro da cidade</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator color={colors.gold} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && result?.lawyers.length === 0 ? <Text style={styles.muted}>Nenhum advogado foi encontrado naquela cidade e especialidade.</Text> : null}
        {result?.lawyers.map((lawyer) => (
          <TouchableOpacity key={lawyer.id} onPress={() => navigation.navigate("LawyerProfile", { lawyerId: lawyer.id })} style={styles.card}>
            {lawyer.avatarUrl ? <Image source={{ uri: lawyer.avatarUrl }} style={styles.avatar} /> : <View style={styles.avatar}><Text style={styles.initial}>{lawyer.name.slice(0, 1)}</Text></View>}
            <View style={styles.cardText}><Text style={styles.name}>{lawyer.name}</Text><Text style={styles.muted}>{lawyer.distanceFromCityCenterKm.toFixed(1)} km do centro</Text></View>
            <AppIcon color={colors.gold} name="navigate-outline" size={20} />
          </TouchableOpacity>
        ))}
        {result && result.pagination.totalPages > 1 ? (
          <View style={styles.pagination}>
            <TouchableOpacity disabled={page <= 1} onPress={() => setPage((current) => current - 1)} style={styles.button}><Text style={styles.buttonText}>Anterior</Text></TouchableOpacity>
            <Text style={styles.muted}>{page} de {result.pagination.totalPages}</Text>
            <TouchableOpacity disabled={page >= result.pagination.totalPages} onPress={() => setPage((current) => current + 1)} style={styles.button}><Text style={styles.buttonText}>Proxima</Text></TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: "center", flexDirection: "row", gap: spacing.md, padding: 20 },
  headerText: { flex: 1, gap: spacing.xs },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "900" },
  content: { gap: spacing.md, padding: 20 },
  card: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.borderSubtle, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: spacing.md, padding: spacing.md },
  avatar: { alignItems: "center", backgroundColor: colors.surfaceDeep, borderRadius: 999, height: 54, justifyContent: "center", width: 54 },
  initial: { color: colors.gold, fontSize: 24, fontWeight: "900" },
  cardText: { flex: 1, gap: spacing.xs },
  name: { color: colors.textPrimary, fontSize: 17, fontWeight: "900" },
  muted: { color: colors.textMuted, lineHeight: 20 },
  error: { color: colors.danger },
  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  button: { borderColor: colors.gold, borderRadius: 8, borderWidth: 1, padding: spacing.md },
  buttonText: { color: colors.gold, fontWeight: "900" }
});
