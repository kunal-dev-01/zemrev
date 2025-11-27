import { create } from 'zustand';

interface CommonState {
  isOpenSidebar: boolean;
  setOpenSidebar: (v: boolean) => void;
}

export const useCommonModal = create<CommonState>(set => ({
  isOpenSidebar: false,
  setOpenSidebar: v => set({ isOpenSidebar: v }),
}));