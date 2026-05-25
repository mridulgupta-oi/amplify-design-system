import React, { useCallback, useEffect, useRef } from "react";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useBottomSheetStore, type SheetEntry } from "./useBottomSheetStore.js";
import { BottomSheetContext } from "./BottomSheetContext.js";
import { Interpreter } from "../interpreter/Interpreter.js";
import type { Node } from "@one-impression/sdk-native-sdui";

const SIZE_TO_SNAP: Record<string, string[]> = {
  small: ["25%"],
  medium: ["50%"],
  large: ["80%"],
  full: ["95%"],
};

/**
 * Individual sheet — owns a ref and calls .present() on mount.
 * @gorhom/bottom-sheet's BottomSheetModal is imperative: it starts hidden
 * and only renders after ref.present() is called.
 */
function SheetModalItem({ sheet }: { sheet: SheetEntry }): React.ReactElement {
  const modalRef = useRef<BottomSheetModal>(null);
  const close = useBottomSheetStore((s) => s.close);

  useEffect(() => {
    // Give BottomSheetModalProvider time to finish layout before presenting.
    requestAnimationFrame(() => {
      modalRef.current?.present();
    });
  }, []);

  const handleDismiss = useCallback(() => {
    close(sheet.id);
  }, [close, sheet.id]);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={SIZE_TO_SNAP[sheet.size] ?? SIZE_TO_SNAP["medium"]}
      enableDynamicSizing={sheet.size === "dynamic"}
      onDismiss={handleDismiss}
    >
      <BottomSheetScrollView>
        <BottomSheetContext.Provider value={{ insideSheet: true }}>
          {(sheet.items as Node[]).map((node, i) => (
            <Interpreter key={node.id ?? i} node={node} />
          ))}
        </BottomSheetContext.Provider>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

/**
 * Singleton host component — mount once at app root in _layout.tsx.
 * Subscribes to the Zustand bottom-sheet store and renders a SheetModalItem
 * for each entry in the stack.
 */
export function BottomSheetHost(): React.ReactElement {
  const stack = useBottomSheetStore((s) => s.stack);

  return (
    <>
      {stack.map((sheet) => (
        <SheetModalItem key={sheet.id} sheet={sheet} />
      ))}
    </>
  );
}
