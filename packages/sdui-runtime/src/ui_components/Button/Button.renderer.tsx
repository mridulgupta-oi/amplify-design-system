import React from "react";
import type { Node } from "@one-impression/sdk-native-sdui";
import { ButtonComponentSchema } from "@one-impression/sdk-native-sdui";
import { Button as DSButton, Text, resolveColor, resolveIconSize } from "@amplify-ai/ui-native";
import { SduiNode } from "../../sdui-node/index.js";
import { useIconStore, parseSvg } from "../../icon-store/index.js";

function ButtonIconInner({ name, color, size }: { name: string; color?: string; size?: number | string }) {
  const { getIcon } = useIconStore();
  const svg = getIcon(name);
  const resolvedColor = resolveColor(color as any) ?? undefined;
  const resolvedSize = resolveIconSize(size as any) ?? 18;
  const SvgComponent = parseSvg(name, svg);
  return <SvgComponent width={resolvedSize} height={resolvedSize} color={resolvedColor} />;
}

const SIZE_MAP: Record<string, string> = { small: "sm", medium: "md", large: "lg" };
const VARIANT_MAP: Record<string, string> = { primary: "primary", secondary: "secondary", tertiary: "ghost", "no-background": "ghost" };

export function ButtonRenderer(node: Node): React.ReactElement {
  return (
    <SduiNode
      data={node.data}
      schema={ButtonComponentSchema.shape.data}
      id={node.id}
      on_click={node.on_click}
      on_load={node.on_load}
      on_view={node.on_view}
      on_dismount={node.on_dismount}
      view_events={node.view_events}
      load_events={node.load_events}
    >
      {(v) => (
        <DSButton
          variant={(VARIANT_MAP[v.variant] ?? v.variant) as any}
          size={(SIZE_MAP[v.size ?? "medium"] ?? v.size) as any}
          loading={v.loading}
          disabled={v.disabled}
          icon={v.icon_left ? <ButtonIconInner name={v.icon_left.name} color={v.icon_left.color} size={v.icon_left.size} /> : v.icon_right ? <ButtonIconInner name={v.icon_right.name} color={v.icon_right.color} size={v.icon_right.size} /> : undefined}
          iconPosition={v.icon_right && !v.icon_left ? "right" : "left"}
        >
          {v.label?.text ?? ""}
        </DSButton>
      )}
    </SduiNode>
  );
}
