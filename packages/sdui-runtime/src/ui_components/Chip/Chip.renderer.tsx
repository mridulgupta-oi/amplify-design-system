import React from "react";
import type { Node } from "@one-impression/sdk-native-sdui";
import { ChipComponentSchema } from "@one-impression/sdk-native-sdui";
import { Chip as DSChip, Icon as DSIcon, resolveColor, resolveIconSize } from "@amplify-ai/ui-native";
import { SduiNode } from "../../sdui-node/index.js";
import { useIconStore, parseSvg } from "../../icon-store/index.js";

function ChipIconInner({ name, color, size }: { name: string; color?: string; size?: number | string }) {
  const { getIcon } = useIconStore();
  const svg = getIcon(name);
  const resolvedColor = resolveColor(color as any) ?? undefined;
  const resolvedSize = resolveIconSize(size as any) ?? 16;
  const SvgComponent = parseSvg(name, svg);
  return <SvgComponent width={resolvedSize} height={resolvedSize} color={resolvedColor} />;
}

export function ChipRenderer(node: Node): React.ReactElement {
  return (
    <SduiNode
      data={node.data}
      schema={ChipComponentSchema.shape.data}
      id={node.id}
      on_click={node.on_click}
      on_load={node.on_load}
      on_view={node.on_view}
      on_dismount={node.on_dismount}
      view_events={node.view_events}
      load_events={node.load_events}
    >
      {(v) => (
        <DSChip
          label={v.label?.text ?? ""}
          selected={v.selected}
          disabled={v.disabled}
          icon={v.icon ? <ChipIconInner name={v.icon.name} color={v.icon.color} size={v.icon.size} /> : undefined}
        />
      )}
    </SduiNode>
  );
}
