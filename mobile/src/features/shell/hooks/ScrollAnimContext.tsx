import React, { createContext, useCallback, useContext, useState } from "react";

interface ScrollAnimContextValue {
  headerHeight: number;
  setHeaderHeight: (h: number) => void;
}

const ScrollAnimContext = createContext<ScrollAnimContextValue | null>(null);

export function ScrollAnimProvider({ children }: { children: React.ReactNode }) {
  const [headerHeight, setHeaderHeightState] = useState(90);

  const setHeaderHeight = useCallback((h: number) => {
    setHeaderHeightState(h);
  }, []);

  return (
    <ScrollAnimContext.Provider value={{ headerHeight, setHeaderHeight }}>
      {children}
    </ScrollAnimContext.Provider>
  );
}

export function useScrollAnim() {
  return useContext(ScrollAnimContext);
}
