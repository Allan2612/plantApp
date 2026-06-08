import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MessageBubble from "../../components/MessageBubble";
import MessageComposer from "../../components/MessageComposer";
import TypingIndicator from "../../components/TypingIndicator";
import { useChatThread } from "../../hooks/useChatThread";
import type { ChatMessage } from "../../types";
import { createStyles } from "./styles";

interface ChatThreadScreenProps {
  threadId: string;
  title: string;
}

// Opciones de mensaje temporal (Grupo 6): se ciclan desde el menú ⋮.
const TTL_CYCLE: { value: number | null; label: string }[] = [
  { value: null, label: "Permanente" },
  { value: 10, label: "10 segundos" },
  { value: 60, label: "1 minuto" },
  { value: 3600, label: "1 hora" },
];

export default function ChatThreadScreen({ threadId, title }: ChatThreadScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Estado de las opciones de envío (mensaje temporal + permiso de visto).
  const [menuVisible, setMenuVisible] = useState(false);
  const [ttlIndex, setTtlIndex] = useState(0);
  const [allowReadReceipt, setAllowReadReceipt] = useState(true);
  const ttl = TTL_CYCLE[ttlIndex];

  const {
    messages,
    currentUser,
    send,
    sendImage,
    uploading,
    notifyTyping,
    typingNicknames,
    seenReceipts,
    isGroup,
    partner,
  } = useChatThread(threadId);

  const sendOpts = { ttl: ttl.value, allowReadReceipt };

  function handleSend(text: string) {
    send(text, sendOpts);
  }

  async function handleAttach() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Concede acceso a la galería para enviar imágenes.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    sendImage(
      {
        uri: asset.uri,
        name: asset.fileName ?? `image-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      },
      sendOpts,
    );
  }

  function renderItem({ item }: { item: ChatMessage }) {
    const isMine = item.sender_id === currentUser?.id;
    return (
      <MessageBubble
        message={item}
        isMine={isMine}
        showSender={isGroup}
        seen={Boolean(seenReceipts[item.id])}
      />
    );
  }

  const subtitle = isGroup
    ? typingNicknames.length > 0
      ? "escribiendo..."
      : "Chat grupal"
    : partner?.is_online
      ? "en línea"
      : "desconectado";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <AppText variant="subheading" numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>
            {subtitle}
          </AppText>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={12}>
          <Ionicons name="ellipsis-vertical" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <AppText variant="caption" color={theme.colors.textMuted} style={styles.menuTitle}>
              OPCIONES DEL MENSAJE
            </AppText>

            <Pressable
              style={styles.menuItem}
              onPress={() => setTtlIndex((i) => (i + 1) % TTL_CYCLE.length)}
            >
              <Ionicons
                name="timer-outline"
                size={20}
                color={ttl.value != null ? theme.colors.primary : theme.colors.textSecondary}
              />
              <View style={styles.menuItemBody}>
                <AppText variant="body">Mensaje temporal</AppText>
                <AppText variant="caption" color={theme.colors.textMuted}>
                  {ttl.value != null ? `Se borra en ${ttl.label}` : "Permanente"}
                </AppText>
              </View>
              <AppText
                variant="caption"
                color={ttl.value != null ? theme.colors.primary : theme.colors.textMuted}
              >
                {ttl.label}
              </AppText>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => setAllowReadReceipt((v) => !v)}
            >
              <Ionicons
                name={allowReadReceipt ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={allowReadReceipt ? theme.colors.primary : theme.colors.textSecondary}
              />
              <View style={styles.menuItemBody}>
                <AppText variant="body">Confirmación de visto</AppText>
                <AppText variant="caption" color={theme.colors.textMuted}>
                  {allowReadReceipt ? "El remitente verá el doble check" : "Nadie sabrá si lo leíste"}
                </AppText>
              </View>
              <AppText
                variant="caption"
                color={allowReadReceipt ? theme.colors.primary : theme.colors.textMuted}
              >
                {allowReadReceipt ? "Activado" : "Desactivado"}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Aún no hay mensajes. ¡Escribe el primero!
              </AppText>
            </View>
          }
        />

        <TypingIndicator nicknames={isGroup ? typingNicknames : (partner && typingNicknames.length ? [partner.nickname] : [])} />

        <MessageComposer
          onSend={handleSend}
          onTyping={notifyTyping}
          onAttach={handleAttach}
          uploading={uploading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
