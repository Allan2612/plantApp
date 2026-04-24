import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { top } = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-60)).current;
  const isOffline = isConnected === false;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOffline ? top : -60,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isOffline, top, translateY]);

  if (isConnected === null) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <Ionicons name="cloud-offline-outline" size={14} color="#FFFFFF" />
      <Text style={styles.text}>Sin conexión — los cambios se sincronizarán al reconectarse</Text>
    </Animated.View>
  );
}
