// Feature-flag registry. Each module can be flipped off without breaking the app.
// Consumers should read via `isModuleEnabled("...")`.
export const MODULES = {
  A_LANDING_BLOG: true,
  B_I18N_GEO: true,
  C_HIDDEN_AUTH: true,
  D_ADMIN_DASHBOARD: true,
  E_FINANCE_MCP: true,
  HEATMAP_TRACKER: true,
  ADS: true,
} as const;

export type ModuleKey = keyof typeof MODULES;

export function isModuleEnabled(key: ModuleKey): boolean {
  return MODULES[key] === true;
}
