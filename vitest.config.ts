import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Aplica-se SOMENTE aos testes (vitest). O build do app (Metro/EAS) ignora este
// arquivo. Mockamos expo-constants porque o modulo real usa sintaxe Flow que o
// parser do vitest nao entende.
export default defineConfig({
  test: {
    alias: {
      "expo-constants": fileURLToPath(new URL("./tests/mocks/expo-constants.ts", import.meta.url))
    }
  }
});
