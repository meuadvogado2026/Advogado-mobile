import * as SecureStore from "expo-secure-store";

const CONSENT_KEY = "advogado20.locationConsent.v1";

/**
 * Armazena o consentimento de coleta de localizacao dado pelo usuario apos a
 * divulgacao proeminente (Play Store: User Data / Location). O consentimento e
 * exigido ANTES do primeiro pedido de permissao do sistema operacional.
 */
export const locationConsentStorage = {
  async hasConsented(): Promise<boolean> {
    try {
      return (await SecureStore.getItemAsync(CONSENT_KEY)) === "granted";
    } catch {
      return false;
    }
  },
  async grant(): Promise<void> {
    await SecureStore.setItemAsync(CONSENT_KEY, "granted");
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(CONSENT_KEY);
  }
};
