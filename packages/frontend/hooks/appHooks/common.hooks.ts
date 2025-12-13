import { useSyncExternalStore } from "react";

/* ================= GLOBAL STATE ================= */
let isOpenSidebar = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const emit = () => {
  listeners.forEach(l => l());
};

/* ================= HOOK ================= */
export const useCommonModal = () => {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => isOpenSidebar,
    () => isOpenSidebar
  );

  const setOpenSidebar = (v: boolean) => {
    isOpenSidebar = v;
    emit();
  };

  return {
    isOpenSidebar: isOpen,
    setOpenSidebar,
  };
};
