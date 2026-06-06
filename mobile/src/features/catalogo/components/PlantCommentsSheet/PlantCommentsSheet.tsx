import AppText from "@/src/components/shared/AppText/AppText";
import { addPlantComment, deletePlantComment, fetchPlantComments } from "@/src/features/catalogo/services/socialApi.service";
import { useAuthStore } from "@/src/store/auth.store";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem, PlantComment } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createStyles } from "./styles";

interface PlantCommentsSheetProps {
  plant: PlantCatalogItem;
  onClose: () => void;
  onCountChange?: (delta: number) => void;
}

function getInitial(name: string | null | undefined): string {
  return (name ?? "?").trim().charAt(0).toUpperCase() || "?";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CR", { day: "numeric", month: "short" });
}

export default function PlantCommentsSheet({ plant, onClose, onCountChange }: PlantCommentsSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const userId = useAuthStore((state) => state.profile?.user?.id ?? null);
  const [comments, setComments] = useState<PlantComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlantComments(plant.id);
      setComments(data);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, [plant.id]);

  useEffect(() => { void load(); }, [load]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !userId || sending) return;
    setSending(true);
    try {
      const newComment = await addPlantComment(plant.id, userId, trimmed);
      setComments((prev) => [...prev, newComment]);
      onCountChange?.(+1);
      setText("");
      Keyboard.dismiss();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo enviar el comentario.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (comment: PlantComment) => {
    if (!userId) return;
    Alert.alert("Eliminar comentario", "¿Deseas eliminar este comentario?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlantComment(plant.id, comment.id, userId);
            setComments((prev) => prev.filter((c) => c.id !== comment.id));
            onCountChange?.(-1);
          } catch (err) {
            Alert.alert("Error", err instanceof Error ? err.message : "No se pudo eliminar.");
          }
        },
      },
    ]);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <AppText variant="subheading">Comentarios</AppText>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <AppText variant="caption" color={theme.colors.textMuted} style={styles.plantName}>
            {plant.name}
          </AppText>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="chatbubble-outline" size={32} color={theme.colors.textMuted} />
              <AppText variant="caption" color={theme.colors.textMuted} style={styles.emptyText}>
                Sin comentarios aún. ¡Sé el primero!
              </AppText>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isOwn = item.userId === userId;
                const authorName = item.authorDisplayName ?? item.authorUsername ?? "Usuario";
                return (
                  <View style={styles.commentRow}>
                    <View style={styles.commentAvatar}>
                      <AppText style={styles.commentAvatarText}>
                        {getInitial(authorName)}
                      </AppText>
                    </View>
                    <View style={styles.commentBody}>
                      <View style={styles.commentMeta}>
                        <AppText variant="label" numberOfLines={1} style={styles.commentAuthor}>
                          {authorName}
                        </AppText>
                        <AppText variant="caption" color={theme.colors.textMuted}>
                          {formatDate(item.createdAt)}
                        </AppText>
                      </View>
                      <AppText variant="body" style={styles.commentText}>{item.text}</AppText>
                    </View>
                    {isOwn ? (
                      <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={12}>
                        <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              }}
            />
          )}

          {userId ? (
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={setText}
                placeholder="Escribe un comentario..."
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!text.trim() || sending}
                activeOpacity={0.75}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <AppText variant="caption" color={theme.colors.textMuted} style={styles.loginHint}>
              Inicia sesión para comentar.
            </AppText>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
