export * from "./sidebarVisibility/types";
export { COMPRESSION_CONTEXT_GROUP, SIDEBAR_SECTIONS } from "./sidebarVisibility/sections";

import { HIDEABLE_SIDEBAR_ITEM_IDS } from "./sidebarVisibility/types";
import type {
  HideableSidebarItemId,
  SidebarSectionId,
  SidebarItemDefinition,
  SidebarSectionChild,
  SidebarSectionDefinition,
  SidebarPresetDefinition,
} from "./sidebarVisibility/types";

export const SIDEBAR_ICON_ACCENTS: Partial<Record<HideableSidebarItemId, string>> = {};

export const SIDEBAR_SUBITEM_ICON_ACCENTS: Record<string, string> = {};

function getDeterministicIconAccent(_id: string): string {
  return "var(--color-muted-foreground)";
}

export function getSidebarIconAccent(_id: string): string {
  return "var(--color-muted-foreground)";
}

export function getSectionItems(
  section: SidebarSectionDefinition | { children: readonly SidebarSectionChild[] },
): readonly SidebarItemDefinition[] {
  return section.children.flatMap((child) =>
    "type" in child && child.type === "group" ? child.items : [child as SidebarItemDefinition],
  );
}

// ─── Ordering & preset setting keys ──────────────────────────────────────────

export const HIDDEN_SIDEBAR_ITEMS_SETTING_KEY = "hiddenSidebarItems";
export const SIDEBAR_SECTION_ORDER_KEY = "sidebarSectionOrder";
export const SIDEBAR_ITEM_ORDER_KEY = "sidebarItemOrder";
export const SIDEBAR_PRESET_KEY = "sidebarActivePreset";
export const SIDEBAR_SETTINGS_UPDATED_EVENT = "omniroute:settings-updated";

const MINIMAL_SHOWN: ReadonlySet<HideableSidebarItemId> = new Set([
  "home",
  "endpoints",
  "api-manager",
  "providers",
  "combos",
  "analytics",
  "costs",
  "logs",
  "health",
  "settings-general",
  "settings-sidebar",
  "docs",
  "changelog",
]);

const DEVELOPER_SHOWN: ReadonlySet<HideableSidebarItemId> = new Set([
  "home",
  "endpoints",
  "api-manager",
  "providers",
  "combos",
  "quota",
  "context-caveman",
  "context-rtk",
  "context-combos",
  "cli-code",
  "cli-agents",
  "acp-agents",
  "api-endpoints",
  "analytics",
  "analytics-combo-health",
  "costs",
  "cache",
  "logs",
  "health",
  "runtime",
  "translator",
  "playground",
  "memory",
  "skills",
  "mcp",
  "a2a",
  "settings-general",
  "settings-routing",
  "settings-resilience",
  "settings-sidebar",
  "docs",
  "issues",
  "changelog",
]);

const ADMIN_SHOWN: ReadonlySet<HideableSidebarItemId> = new Set([
  "home",
  "endpoints",
  "api-manager",
  "providers",
  "combos",
  "quota",
  "analytics",
  "analytics-combo-health",
  "analytics-utilization",
  "costs",
  "costs-pricing",
  "costs-budget",
  "costs-quota-share",
  "cache",
  "logs",
  "activity",
  "health",
  "runtime",
  "audit",
  "audit-mcp",
  "audit-a2a",
  "settings-general",
  "settings-routing",
  "settings-resilience",
  "settings-security",
  "settings-access-tokens",
  "settings-feature-flags",
  "settings-sidebar",
  "docs",
  "changelog",
]);

function buildHiddenList(shown: ReadonlySet<HideableSidebarItemId>): HideableSidebarItemId[] {
  return HIDEABLE_SIDEBAR_ITEM_IDS.filter((id) => !shown.has(id));
}

export const SIDEBAR_PRESETS: readonly SidebarPresetDefinition[] = [
  { id: "all", icon: "select_all", hiddenItems: [] },
  { id: "minimal", icon: "minimize", hiddenItems: buildHiddenList(MINIMAL_SHOWN) },
  { id: "developer", icon: "code", hiddenItems: buildHiddenList(DEVELOPER_SHOWN) },
  { id: "admin", icon: "admin_panel_settings", hiddenItems: buildHiddenList(ADMIN_SHOWN) },
];

// ─── Ordering utilities ───────────────────────────────────────────────────────

export function applySectionOrder(
  sections: readonly SidebarSectionDefinition[],
  order: SidebarSectionId[],
): SidebarSectionDefinition[] {
  if (order.length === 0) return [...sections];
  const knownIds = new Set(sections.map((s) => s.id));
  const validOrder = order.filter((id) => knownIds.has(id));
  const orderMap = new Map(validOrder.map((id, i) => [id, i]));
  return [...sections].sort((a, b) => {
    const ai = orderMap.get(a.id) ?? validOrder.length + sections.indexOf(a);
    const bi = orderMap.get(b.id) ?? validOrder.length + sections.indexOf(b);
    return ai - bi;
  });
}

export function applyItemOrder(
  children: readonly SidebarSectionChild[],
  order: string[],
): SidebarSectionChild[] {
  if (order.length === 0) return [...children];
  const getChildId = (c: SidebarSectionChild): string =>
    "type" in c && c.type === "group" ? c.id : (c as SidebarItemDefinition).id;
  const knownIds = new Set(children.map(getChildId));
  const validOrder = order.filter((id) => knownIds.has(id));
  const orderMap = new Map(validOrder.map((id, i) => [id, i]));
  return [...children].sort((a, b) => {
    const aId = getChildId(a);
    const bId = getChildId(b);
    const ai = orderMap.get(aId) ?? validOrder.length + children.indexOf(a);
    const bi = orderMap.get(bId) ?? validOrder.length + children.indexOf(b);
    return ai - bi;
  });
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

export function normalizeHiddenSidebarItems(value: unknown): HideableSidebarItemId[] {
  if (!Array.isArray(value)) return [];

  const hiddenItems = new Set<HideableSidebarItemId>();

  for (const item of value) {
    if (
      typeof item === "string" &&
      HIDEABLE_SIDEBAR_ITEM_IDS.includes(item as HideableSidebarItemId)
    ) {
      hiddenItems.add(item as HideableSidebarItemId);
    }
  }

  return HIDEABLE_SIDEBAR_ITEM_IDS.filter((item) => hiddenItems.has(item));
}
