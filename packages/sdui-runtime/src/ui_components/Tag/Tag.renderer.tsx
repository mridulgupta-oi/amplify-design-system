import React from "react";
import type { Node } from "@one-impression/sdk-native-sdui";
import { TagComponentSchema } from "@one-impression/sdk-native-sdui";
import { Tag as DSTag, resolveColor, resolveIconSize } from "@amplify-ai/ui-native";
import { SduiNode } from "../../sdui-node/index.js";
import { useIconStore, parseSvg } from "../../icon-store/index.js";

function TagIconInner({ name, color, size }: { name: string; color?: string; size?: number | string }) {
  const { getIcon } = useIconStore();
  const svg = getIcon(name);
  const resolvedColor = resolveColor(color as any) ?? undefined;
  const resolvedSize = resolveIconSize(size as any) ?? 14;
  const SvgComponent = parseSvg(name, svg);
  return <SvgComponent width={resolvedSize} height={resolvedSize} color={resolvedColor} />;
}

export function TagRenderer(node: Node): React.ReactElement {
  return (
    <SduiNode
      data={node.data}
      schema={TagComponentSchema.shape.data}
      id={node.id}
      on_click={node.on_click}
      on_load={node.on_load}
      on_view={node.on_view}
      on_dismount={node.on_dismount}
      view_events={node.view_events}
      load_events={node.load_events}
    >
      {(v) => (
        <DSTag
          label={v.label?.text ?? ""}
          icon={v.icon ? <TagIconInner name={v.icon.name} color={v.icon.color} size={v.icon.size} /> : undefined}
        />
      )}
    </SduiNode>
  );
}
