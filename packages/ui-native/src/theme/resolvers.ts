/**
 * Token resolvers — convert token names to concrete values using
 * the sdui namespace from @amplify-ai/tokens-creator/react-native.
 *
 * Every resolver accepts either a token name OR a raw value (number/string).
 * This lets components work with both token-driven SDUI props and one-off overrides.
 *
 * Wire format uses full prefixed tokens: "sdui.color.primary", "sdui.icon-size.md".
 * The sdui namespace uses bare keys: "primary", "md".
 * Resolvers strip the prefix and convert kebab-to-camelCase automatically.
 */
import { sdui } from '@amplify-ai/tokens-creator/react-native';
import type {
  ColorToken,
  SpacingToken,
  FontSizeToken,
  FontWeightToken,
  IconSizeToken,
  RadiusToken,
  BorderWidthToken,
} from '../tokens';

/**
 * Strip sdui.{namespace}. prefix from a wire-format token string.
 * "sdui.color.primary" → "primary"
 * "sdui.color.text-neutral-strong" → "textNeutralStrong"
 * "sdui.icon-size.md" → "md"
 * Already-bare keys ("primary") pass through unchanged.
 */
function stripTokenPrefix(token: string, namespace: string): string {
  const prefix = `sdui.${namespace}.`;
  if (!token.startsWith(prefix)) return token;
  const stripped = token.slice(prefix.length);
  return stripped.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/** Look up a string value in a potentially nested record. */
function lookupColor(map: Record<string, unknown>, key: string): string | undefined {
  // Direct flat lookup: "primary" → "#7C3AED"
  const direct = map[key];
  if (typeof direct === 'string') return direct;

  // Nested lookup for compound keys: "textNeutralStrong"
  // Try splitting at known namespace boundaries: text, bg, border
  for (const ns of ['text', 'bg', 'border']) {
    if (key.startsWith(ns) && key.length > ns.length) {
      const nested = map[ns];
      if (nested && typeof nested === 'object') {
        const subKey = key.charAt(ns.length).toLowerCase() + key.slice(ns.length + 1);
        const val = (nested as Record<string, string>)[subKey];
        if (typeof val === 'string') return val;
      }
    }
  }

  return undefined;
}

/** Resolve a color token name to its hex value. Pass-through for raw strings. */
export function resolveColor(token: ColorToken | string | undefined): string | undefined {
  if (token === undefined) return undefined;
  const colorMap = sdui.color as Record<string, unknown>;

  // Try direct lookup (bare key like "primary")
  const direct = lookupColor(colorMap, token);
  if (direct) return direct;

  // Strip "sdui.color." prefix and retry
  const stripped = stripTokenPrefix(token, 'color');
  if (stripped !== token) {
    const resolved = lookupColor(colorMap, stripped);
    if (resolved) return resolved;
  }

  // Pass through raw values (hex, rgb, named colors)
  return token;
}

/** Resolve a spacing token to its numeric value. Pass-through for raw numbers. */
export function resolveSpacing(token: SpacingToken | number | undefined): number | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return token;
  const map = sdui.spacing as Record<string, number>;
  const direct = map[token];
  if (direct !== undefined) return direct;
  const stripped = stripTokenPrefix(token, 'spacing');
  if (stripped !== token) return map[stripped];
  return undefined;
}

/** Resolve a font size token to its numeric value. */
export function resolveFontSize(token: FontSizeToken | number | undefined): number | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return token;
  const map = sdui.fontSize as Record<string, number>;
  const direct = map[token];
  if (direct !== undefined) return direct;
  const stripped = stripTokenPrefix(token, 'font-size');
  if (stripped !== token) return map[stripped];
  return undefined;
}

/** Resolve a font weight token to its numeric string (for RN fontWeight). */
export function resolveFontWeight(
  token: FontWeightToken | string | undefined,
): string | undefined {
  if (token === undefined) return undefined;
  const map = sdui.fontWeight as Record<string, number>;
  const weight = map[token];
  if (weight !== undefined) return String(weight);
  const stripped = stripTokenPrefix(token, 'font-weight');
  if (stripped !== token) {
    const w = map[stripped];
    if (w !== undefined) return String(w);
  }
  return token;
}

/** Resolve an icon size token to its numeric value. */
export function resolveIconSize(token: IconSizeToken | number | undefined): number | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return token;
  const map = sdui.iconSize as Record<string, number>;
  const direct = map[token];
  if (direct !== undefined) return direct;
  const stripped = stripTokenPrefix(token, 'icon-size');
  if (stripped !== token) return map[stripped];
  return undefined;
}

/** Resolve a radius token to its numeric value. */
export function resolveRadius(token: RadiusToken | number | undefined): number | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return token;
  const map = sdui.radius as Record<string, number>;
  const direct = map[token];
  if (direct !== undefined) return direct;
  const stripped = stripTokenPrefix(token, 'radius');
  if (stripped !== token) return map[stripped];
  return undefined;
}

/** Resolve a border width token to its numeric value. */
export function resolveBorderWidth(
  token: BorderWidthToken | number | undefined,
): number | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return token;
  const map = sdui.borderWidth as Record<string, number>;
  const direct = map[token];
  if (direct !== undefined) return direct;
  const stripped = stripTokenPrefix(token, 'border-width');
  if (stripped !== token) return map[stripped];
  return undefined;
}
