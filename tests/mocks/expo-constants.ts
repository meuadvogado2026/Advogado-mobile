// Mock de expo-constants para os testes (Node/vitest). O modulo real contem
// sintaxe Flow (import typeof) que o rollup do vitest nao parseia. Nos testes,
// `extra` vazio faz publicConfig cair nos defaults/process.env.
export default {
  expoConfig: { extra: {} }
};
