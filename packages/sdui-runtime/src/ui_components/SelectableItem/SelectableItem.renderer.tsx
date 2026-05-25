import React from "react";
import type { Node } from "@one-impression/sdk-native-sdui";
import { SelectableItemComponentSchema } from "@one-impression/sdk-native-sdui";
import { SelectableItem as DSSelectableItem, resolveColor, resolveIconSize } from "@amplify-ai/ui-native";
import { SduiNode } from "../../sdui-node/index.js";
import { useIconStore, parseSvg } from "../../icon-store/index.js";

function SelectableIconInner({ name, color, size }: { name: string; color?: string; size?: number | string }) {
  const { getIcon } = useIconStore();
  const svg = getIcon(name);
  const resolvedColor = resolveColor(color as any) ?? undefined;
  const resolvedSize = resolveIconSize(size as any) ?? 20;
  const SvgComponent = parseSvg(name, svg);
  return <SvgComponent width={resolvedSize} height={resolvedSize} color={resolvedColor} />;
}

export function SelectableItemRenderer(node: Node): React.ReactElement {
  return (
    <SduiNode
      data={node.data}
      schema={SelectableItemComponentSchema.shape.data}
      id={node.id}
      on_click={node.on_click}
      on_load={node.on_load}
      on_view={node.on_view}
      on_dismount={node.on_dismount}
      view_events={node.view_events}
      load_events={node.load_events}
    >
      {(v) => (
        <DSSelectableItem
          label={v.label?.text ?? ""}
          description={v.subtitle?.text}
          selected={v.selected}
          disabled={v.disabled}
          leading={
            v.icon ? (
              <SelectableIconInner name={v.icon.name} color={v.icon.color} size={v.icon.size} />
            ) : undefined
          }
        />
      )}
    </SduiNode>
  );
}
