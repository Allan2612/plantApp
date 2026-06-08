import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ConversationRow from "../../components/ConversationRow";
import { useMensajeriaScreen } from "../../hooks/useMensajeriaScreen";
import { createStyles } from "./styles";

export default function MensajeriaScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const {
    ready,
    error,
    status,
    reconnect,
    currentUser,
    myAvatarUri,
    groupLastMessage,
    dmPreviews,
    onlineCount,
  } = useMensajeriaScreen();

  function openThread(threadId: string, title: string) {
    // Cast por typed-routes: la ruta /chat/[threadId] se agrega a los tipos
    // generados al correr `expo start`; hasta entonces no está en la unión.
    router.push({
      pathname: "/chat/[threadId]",
      params: { threadId, title },
    } as unknown as Href);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="subheading">Mensajería</AppText>
      </View>

      {error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.textMuted} />
          <AppText variant="subheading" style={styles.centerText}>
            No se pudo conectar al chat
          </AppText>
          <AppText variant="caption" color={theme.colors.textMuted} style={styles.centerText}>
            {error}
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => reconnect?.()}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={16} color={theme.colors.textOnOverlay} />
            <AppText variant="label" color={theme.colors.textOnOverlay}>
              Reintentar
            </AppText>
          </TouchableOpacity>
          <AppText variant="caption" color={theme.colors.textMuted} style={styles.centerText}>
            El servidor puede tardar ~30s en despertar la primera vez.
          </AppText>
        </View>
      ) : !ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
          <AppText variant="caption" color={theme.colors.textMuted} style={styles.centerText}>
            Conectando al chat...
          </AppText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.identityRow}>
            {myAvatarUri ? (
              <Image source={{ uri: myAvatarUri }} style={styles.myAvatar} contentFit="cover" />
            ) : (
              <View style={[styles.myAvatar, styles.myAvatarFallback]}>
                <AppText variant="subheading" color={theme.colors.textOnOverlay}>
                  {(currentUser?.nickname ?? "?").charAt(0).toUpperCase()}
                </AppText>
              </View>
            )}
            <View style={styles.identityBody}>
              <AppText variant="subheading" numberOfLines={1}>
                {currentUser?.nickname ?? "Tú"}
              </AppText>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        status === "connected" ? theme.colors.primary : theme.colors.textMuted,
                    },
                  ]}
                />
                <AppText variant="caption" color={theme.colors.textMuted}>
                  {status === "connected" ? "Conectado" : "Reconectando..."}
                </AppText>
              </View>
            </View>
          </View>

          <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionTitle}>
            GENERAL
          </AppText>
          <ConversationRow
            title="Chat grupal"
            iconName="people"
            subtitle={
              groupLastMessage
                ? `${groupLastMessage.sender_nickname}: ${groupLastMessage.content}`
                : "Sé el primero en escribir"
            }
            onPress={() => openThread("group", "Chat grupal")}
          />

          <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionTitle}>
            EN LÍNEA ({onlineCount})
          </AppText>

          {dmPreviews.length === 0 ? (
            <AppText variant="caption" color={theme.colors.textMuted} style={styles.empty}>
              No hay nadie más conectado por ahora.
            </AppText>
          ) : (
            dmPreviews.map(({ user, lastMessage }) => (
              <ConversationRow
                key={user.id}
                title={user.nickname}
                online={user.is_online}
                subtitle={lastMessage ? lastMessage.content : "Toca para iniciar un chat"}
                onPress={() => openThread(user.id, user.nickname)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
