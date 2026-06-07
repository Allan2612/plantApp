import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Linking, TouchableOpacity, View } from "react-native";

import type { ChatMessage } from "../../types";
import { createStyles } from "./styles";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showSender: boolean;
  seen: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({
  message,
  isMine,
  showSender,
  seen,
}: MessageBubbleProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {showSender && !isMine ? (
          <AppText variant="caption" color={theme.colors.primaryLight} style={styles.sender}>
            {message.sender_nickname}
          </AppText>
        ) : null}

        {message.media ? (
          message.media.resource_type === "image" ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => Linking.openURL(message.media!.url)}
            >
              <Image
                source={{ uri: message.media.url }}
                style={styles.media}
                contentFit="cover"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.fileChip}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(message.media!.url)}
            >
              <Ionicons
                name="document-attach-outline"
                size={20}
                color={isMine ? theme.colors.textOnOverlay : theme.colors.textPrimary}
              />
              <AppText
                variant="caption"
                color={isMine ? theme.colors.textOnOverlay : theme.colors.textPrimary}
                numberOfLines={1}
                style={styles.fileName}
              >
                {message.media.original_filename}
              </AppText>
            </TouchableOpacity>
          )
        ) : null}

        {message.content ? (
          <AppText
            variant="body"
            color={isMine ? theme.colors.textOnOverlay : theme.colors.textPrimary}
          >
            {message.content}
          </AppText>
        ) : null}

        <View style={styles.meta}>
          {message.ttl ? (
            <Ionicons
              name="timer-outline"
              size={11}
              color={isMine ? theme.colors.textOnOverlay : theme.colors.textMuted}
              style={styles.metaIcon}
            />
          ) : null}
          <AppText
            variant="caption"
            color={isMine ? theme.colors.textOnOverlay : theme.colors.textMuted}
          >
            {formatTime(message.timestamp)}
          </AppText>
          {isMine ? (
            <Ionicons
              name={seen ? "checkmark-done" : "checkmark"}
              size={13}
              color={seen ? theme.colors.primaryLight : theme.colors.textOnOverlay}
              style={styles.metaIcon}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
