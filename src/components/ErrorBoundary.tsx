import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme/tokens";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Barreira de erro global. Evita que um erro de render derrube o app inteiro
 * (tela branca / crash), o que reprova em revisao da Play Store por
 * "funcionalidade quebrada". Nao registra a mensagem do erro em log para nao
 * vazar PII espontanea.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Sem log de PII. Ponto de integracao futura com crash reporting sem dados sensiveis.
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Algo saiu do esperado</Text>
        <Text style={styles.message}>
          Tivemos um problema para exibir esta tela. Toque em tentar novamente para continuar.
        </Text>
        <TouchableOpacity accessibilityRole="button" onPress={this.handleReset} style={styles.button}>
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center"
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: 14,
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 28
  },
  buttonText: {
    color: colors.surfaceDeep,
    fontSize: 16,
    fontWeight: "900"
  }
});
