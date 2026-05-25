/**
 * parseSvg — lazy SVG-string to React Native component conversion.
 *
 * Converts raw SVG markup into react-native-svg components. Results are
 * memoized per icon name so repeated lookups are O(1) after first parse.
 */
import React from 'react';
import { SvgXml } from 'react-native-svg';

/** Cache of already-parsed SVG components keyed by icon name. */
const svgCache = new Map<string, React.FC<SvgIconProps>>();
/** Track which SVG string is cached per name so we invalidate on change. */
const svgSourceCache = new Map<string, string>();

export interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Parse an SVG string into a React Native component.
 *
 * The returned component accepts width, height, and color props.
 * Color replaces `currentColor` in the SVG markup so stroke/fill
 * tokens resolve correctly at render time.
 *
 * @param name  - Unique icon identifier (used as cache key)
 * @param svg   - Raw SVG markup string
 * @returns A React component that renders the SVG via react-native-svg
 */
export function parseSvg(name: string, svg: string): React.FC<SvgIconProps> {
  const cached = svgCache.get(name);
  if (cached && svgSourceCache.get(name) === svg) return cached;

  const Component: React.FC<SvgIconProps> = ({ width = 24, height = 24, color }) => {
    let resolvedSvg = color ? svg.replace(/currentColor/g, color) : svg;
    // Sanitize SVG for react-native-svg's SvgXml parser:
    // 1. Strip JSX-style comments {/* ... */} (some source SVGs have them)
    resolvedSvg = resolvedSvg.replace(/\{\/\*.*?\*\/\}/g, '');
    // 2. Strip inter-tag whitespace (prevents RN "Text strings" warnings)
    resolvedSvg = resolvedSvg.replace(/>\s+</g, '><');
    // 3. Fix invalid width/height="currentColor" (should be numeric; let
    //    the component's width/height props control sizing instead)
    resolvedSvg = resolvedSvg.replace(/\b(width|height)="currentColor"/g, '');

    return React.createElement(SvgXml, {
      xml: resolvedSvg,
      width,
      height,
    });
  };

  Component.displayName = `SvgIcon(${name})`;
  svgCache.set(name, Component);
  svgSourceCache.set(name, svg);

  return Component;
}

/** Clear the SVG component cache. Useful for testing or memory pressure. */
export function clearSvgCache(): void {
  svgCache.clear();
  svgSourceCache.clear();
}
