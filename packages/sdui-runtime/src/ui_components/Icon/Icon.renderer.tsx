import React from "react";
import type { Node } from "@one-impression/sdk-native-sdui";
import { IconComponentSchema } from "@one-impression/sdk-native-sdui";
import { Icon as DSIcon, resolveColor, resolveIconSize } from "@amplify-ai/ui-native";
import { SduiNode } from "../../sdui-node/index.js";
import { useIconStore } from "../../icon-store/index.js";
import { parseSvg } from "../../icon-store/index.js";

/** Inner component — hooks can't be called inside SduiNode's render callback. */
function IconInner({ name, color, size }: { name: string; color?: string; size?: number | string }) {
  const { getIcon } = useIconStore();
  const svg = getIcon(name);
  const resolvedColor = resolveColor(color as any) ?? undefined;
  const resolvedSize = resolveIconSize(size as any) ?? 24;
  const SvgComponent = parseSvg(name, svg);

  return (
    <DSIcon name={name} color={color} size={size}>
      <SvgComponent width={resolvedSize} height={resolvedSize} color={resolvedColor} />
    </DSIcon>
  );
}

export function IconRenderer(node: Node): React.ReactElement {
  return (
    <SduiNode
      data={node.data}
      schema={IconComponentSchema.shape.data}
      id={node.id}
      on_click={node.on_click}
      on_load={node.on_load}
      on_view={node.on_view}
      on_dismount={node.on_dismount}
      view_events={node.view_events}
      load_events={node.load_events}
    >
      {(v) => <IconInner name={v.name} color={v.color} size={v.size} />}
    </SduiNode>
  );
}
