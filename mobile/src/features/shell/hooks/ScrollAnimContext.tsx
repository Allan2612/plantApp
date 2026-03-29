import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

interface ScrollAnimContextValue {
  headerTranslateY: Animated.Value;
  tabBarTranslateY: Animated.Value;
  headerPaddingAnim: Animated.Value;
  headerHeight: number;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  setHeaderHeight: (h: number) => void;
  setTabBarHeight: (h: number) => void;
  resetScrollAnim: () => void;
}

const ScrollAnimContext = createContext<ScrollAnimContextValue | null>(null);

export function ScrollAnimProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const headerPaddingAnim = useRef(new Animated.Value(90)).current;

  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  const headerHeightRef = useRef(90);
  const tabBarHeightRef = useRef(60);

  const [headerHeight, setHeaderHeightState] = useState(90);

  const setHeaderHeight = useCallback(
    (h: number) => {
      headerHeightRef.current = h;
      setHeaderHeightState(h);
      if (!isHidden.current) {
        headerPaddingAnim.setValue(h);
      }
    },
    [headerPaddingAnim],
  );

  const setTabBarHeight = useCallback((h: number) => {
    tabBarHeightRef.current = h;
  }, []);

  const resetScrollAnim = useCallback(() => {
    lastScrollY.current = 0;
    if (isHidden.current) {
      isHidden.current = false;
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(tabBarTranslateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(headerPaddingAnim, {
          toValue: headerHeightRef.current,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [headerTranslateY, tabBarTranslateY, headerPaddingAnim]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = e.nativeEvent.contentOffset.y;
      const diff = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      if (diff > 3 && !isHidden.current) {
        isHidden.current = true;
        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: -headerHeightRef.current,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(tabBarTranslateY, {
            toValue: tabBarHeightRef.current,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(headerPaddingAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      } else if (diff < -3 && isHidden.current) {
        isHidden.current = false;
        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(tabBarTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(headerPaddingAnim, {
            toValue: headerHeightRef.current,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
    [headerTranslateY, tabBarTranslateY, headerPaddingAnim],
  );

  return (
    <ScrollAnimContext.Provider
      value={{
        headerTranslateY,
        tabBarTranslateY,
        headerPaddingAnim,
        headerHeight,
        onScroll,
        setHeaderHeight,
        setTabBarHeight,
        resetScrollAnim,
      }}
    >
      {children}
    </ScrollAnimContext.Provider>
  );
}

/** Returns null when used outside of ScrollAnimProvider (e.g. non-tab screens). */
export function useScrollAnim() {
  return useContext(ScrollAnimContext);
}
