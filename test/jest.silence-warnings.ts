// Silences noisy ts-jest hybrid module warnings without changing tsconfig.
// We intentionally avoid enabling isolatedModules due to prior regression.
const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("ts-jest[ts-compiler] (WARN) Using hybrid module kind")) {
    return; // swallow
  }
  originalWarn(...args);
};
