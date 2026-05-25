import React from "react";
import { Icon as DSIcon, resolveColor, resolveIconSize } from "@amplify-ai/ui-native";
import { useIconStore, parseSvg } from "../../icon-store/index.js";

/**
 * Shared icon component for SDUI snippet renderers.
 *
 * Looks up the SVG from the icon store, resolves size/color tokens,
 * and renders inside a DSIcon container. Must be rendered inside
 * an IconStoreProvider.
 *
 * Note: hooks can't be called inside SduiNode's render callback,
 * so this component must be rendered as a standalone React element.
 */
export function SduiIcon({
  name,
  color,
  size,
}: {
  name: string;
  color?: string;
  size?: number | string;
}) {
  const { getIcon } = useIconStore();
  const svg = getIcon(name);
  const resolvedColor = resolveColor(color as any) ?? undefined;
  const resolvedSize = resolveIconSize(size as any) ?? 20;
  const SvgComponent = parseSvg(name, svg);

  return (
    <DSIcon name={name} color={color} size={size}>
      <SvgComponent
        width={resolvedSize}
        height={resolvedSize}
        color={resolvedColor}
      />
    </DSIcon>
  );
}
