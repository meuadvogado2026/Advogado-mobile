import { useState } from "react";
import { ActivityIndicator, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { passwordAccessRequest } from "../services/passwordAccess";

export function PasswordAccessScreen({ tokenHash, invalidLink, onClose }: { tokenHash?: string; invalidLink?: boolean; onClose: () => void }) {
  const [proof, setProof] = useState(tokenHash ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState(invalidLink ? "Link inválido ou incompleto. Solicite outro link com seu e-mail." : proof ? "Defina uma senha com 8 a 72 caracteres. O link só é usado ao confirmar." : "Informe o e-mail da conta para receber um link seguro.");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit() {
    Keyboard.dismiss();
    if (proof && (password.length < 8 || password.length > 72 || password !== confirmation)) { setMessage("Use 8 a 72 caracteres e confirme a mesma senha."); return; }
    if (!proof && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessage("Informe um e-mail válido."); return; }
    setBusy(true);
    try {
      setMessage(await passwordAccessRequest(proof ? { tokenHash: proof, newPassword: password, confirmPassword: confirmation } : { email: email.trim() }));
      if (proof) { setProof(""); setPassword(""); setConfirmation(""); setDone(true); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao concluir. Solicite outro link."); }
    finally { setBusy(false); }
  }
  return <SafeAreaView style={styles.page}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Text style={styles.title}>{proof ? "Definir nova senha" : "Recuperar acesso"}</Text>
    {!done && (proof ? <>
      <Text style={styles.text}>Nova senha</Text><TextInput accessibilityLabel="Nova senha" autoFocus style={styles.input} secureTextEntry autoComplete="new-password" textContentType="newPassword" maxLength={72} value={password} onChangeText={setPassword} editable={!busy} />
      <Text style={styles.text}>Confirmar nova senha</Text><TextInput accessibilityLabel="Confirmar nova senha" style={styles.input} secureTextEntry autoComplete="new-password" textContentType="newPassword" maxLength={72} value={confirmation} onChangeText={setConfirmation} editable={!busy} />
    </> : <><Text style={styles.text}>E-mail da conta</Text><TextInput accessibilityLabel="E-mail da conta" autoFocus style={styles.input} keyboardType="email-address" autoCapitalize="none" autoComplete="email" maxLength={254} value={email} onChangeText={setEmail} editable={!busy} /></>)}
    {!done && <TouchableOpacity accessibilityRole="button" style={styles.button} disabled={busy} onPress={submit}>{busy ? <ActivityIndicator /> : <Text>{proof ? "Definir senha" : "Enviar link seguro"}</Text>}</TouchableOpacity>}
    <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>
    {proof && <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => { setProof(""); setPassword(""); setConfirmation(""); setMessage("Informe seu e-mail para receber outro link."); }}><Text style={styles.link}>Solicitar outro link</Text></TouchableOpacity>}
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={onClose}><Text style={styles.link}>Voltar ao aplicativo</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#071426" }, content: { padding: 24, gap: 18, flexGrow: 1, justifyContent: "center" }, title: { color: "#fff", fontSize: 26 }, text: { color: "#fff", fontSize: 16 }, input: { color: "#fff", borderWidth: 1, borderColor: "#9da8b8", borderRadius: 8, padding: 14, minHeight: 48 }, button: { backgroundColor: "#d8b763", padding: 16, borderRadius: 8, alignItems: "center", minHeight: 48 }, link: { color: "#d8b763", paddingVertical: 12 } });
