import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, TextInput, TouchableOpacity, View } from "react-native";

import { createStyles } from "./styles";

interface MessageComposerProps {
  onSend: (text: string) => void;
  onTyping: () => void;
  onAttach: () => void;
  uploading?: boolean;
}

export default function MessageComposer({
  onSend,
  onTyping,
  onAttach,
  uploading,
}: MessageComposerProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [text, setText] = useState("");

  function handleChange(value: string) {
    setText(value);
    if (value.trim()) onTyping();
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  const canSend = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.attachButton}
        onPress={onAttach}
        disabled={uploading}
        activeOpacity={0.7}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChange}
        placeholder="Escribe un mensaje..."
        placeholderTextColor={theme.colors.searchPlaceholder}
        multiline
        maxLength={1000}
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.8}
      >
        <Ionicons name="send" size={18} color={theme.colors.textOnOverlay} />
      </TouchableOpacity>
    </View>
  );
}
