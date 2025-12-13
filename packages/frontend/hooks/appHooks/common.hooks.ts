import { useState, useCallback } from "react";

export const useCommonModal = () => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const setOpenSidebar = useCallback((v: boolean) => {
    setIsOpenSidebar(v);
  }, []);

  return {
    isOpenSidebar,
    setOpenSidebar,
  };
};
