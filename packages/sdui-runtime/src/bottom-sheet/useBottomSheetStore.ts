import { create } from "zustand";

const MAX_STACK_DEPTH = 2;

export interface SheetEntry {
  id: string;
  title?: string;
  size: string;
  items: unknown[];
  on_dismiss?: unknown;
  on_open?: unknown;
}

interface BottomSheetState {
  registry: Record<string, SheetEntry>;
  stack: SheetEntry[];
  register: (sheet: SheetEntry) => void;
  open: (sheetOrRef: SheetEntry | { id: string }) => void;
  close: (id?: string) => void;
  closeAll: () => void;
  replace: (sheet: SheetEntry) => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set, get) => ({
  registry: {},
  stack: [],

  register: (sheet) =>
    set((state) => ({
      registry: { ...state.registry, [sheet.id]: sheet },
    })),

  open: (sheetOrRef) =>
    set((state) => {
      if (state.stack.length >= MAX_STACK_DEPTH) {
        console.warn(
          `[BottomSheetStore] Stack depth limit (${MAX_STACK_DEPTH}) reached — refusing to push "${sheetOrRef.id}"`,
        );
        return state;
      }
      // If only id was passed, look up from registry.
      const entry =
        "items" in sheetOrRef && sheetOrRef.items
          ? (sheetOrRef as SheetEntry)
          : state.registry[sheetOrRef.id];
      if (!entry) {
        console.warn(
          `[BottomSheetStore] Sheet "${sheetOrRef.id}" not found in registry`,
        );
        return state;
      }
      return { stack: [...state.stack, entry] };
    }),

  close: (id) =>
    set((state) => ({
      stack: id
        ? state.stack.filter((s) => s.id !== id)
        : state.stack.slice(0, -1),
    })),

  closeAll: () => set({ stack: [] }),

  replace: (sheet) =>
    set((state) => ({
      stack: [...state.stack.slice(0, -1), sheet],
    })),
}));
