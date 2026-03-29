import AppText from "@/src/components/shared/AppText/AppText";
import InputText from "@/src/components/shared/InputText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, View } from "react-native";

import { createStyles } from "./styles";

interface CatalogExplorerSelectProps {
  items: PlantCatalogItem[];
  selectedId: string;
  onSelect: (catalogId: string) => void;
  errorText?: string;
}

export default function CatalogExplorerSelect({
  items,
  selectedId,
  onSelect,
  errorText,
}: CatalogExplorerSelectProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const name = item.name.toLowerCase();
      const scientificName = item.scientificName.toLowerCase();
      return name.includes(normalizedQuery) || scientificName.includes(normalizedQuery);
    });
  }, [items, query]);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsOpen((prev) => !prev)}
        style={[
          styles.trigger,
          isOpen && styles.triggerActive,
          errorText ? styles.triggerError : null,
        ]}
      >
        <View style={styles.triggerMain}>
          <View style={styles.thumbnailFrame}>
            {selectedItem?.imageUrl ? (
              <Image source={{ uri: selectedItem.imageUrl }} style={styles.thumbnailImage} contentFit="cover" transition={90} />
            ) : (
              <View style={styles.thumbnailFallback}>
                <Ionicons name="leaf-outline" size={theme.spacing.md} color={theme.colors.primary} />
              </View>
            )}
          </View>

          <View style={styles.triggerTextWrap}>
            <AppText variant="body" style={styles.triggerTitle} numberOfLines={1}>
              {selectedItem?.name ?? "Selecciona una especie"}
            </AppText>
          </View>
        </View>

        <Ionicons
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          size={theme.spacing.md + theme.spacing.xs}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={() => setIsOpen(false)} />

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <AppText variant="subheading">Explorar catálogo</AppText>
              <Pressable onPress={() => setIsOpen(false)}>
                <AppText variant="caption" style={styles.closeText}>Cerrar</AppText>
              </Pressable>
            </View>

            <InputText
              label="Buscar especie"
              value={query}
              onChangeText={setQuery}
              placeholder="Nombre común o científico"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppText variant="caption" style={styles.resultMeta}>
              {filteredItems.length} resultado{filteredItems.length === 1 ? "" : "s"}
            </AppText>

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.id === selectedId;
                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item.id);
                      setIsOpen(false);
                    }}
                    style={[styles.row, selected && styles.rowSelected]}
                  >
                    <View style={styles.rowHead}>
                      <View style={styles.rowMain}>
                        <View style={styles.thumbnailFrame}>
                          {item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} contentFit="cover" transition={90} />
                          ) : (
                            <View style={styles.thumbnailFallback}>
                              <Ionicons name="leaf-outline" size={theme.spacing.md} color={theme.colors.primary} />
                            </View>
                          )}
                        </View>

                        <View style={styles.rowTextWrap}>
                          <AppText
                            variant="label"
                            style={[styles.rowTitle, selected && styles.rowTitleSelected]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </AppText>
                          <AppText
                            variant="caption"
                            style={[styles.rowSubtitle, selected && styles.rowSubtitleSelected]}
                            numberOfLines={1}
                          >
                            {item.scientificName}
                          </AppText>
                        </View>
                      </View>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={theme.spacing.md + theme.spacing.xs} color={theme.colors.primary} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <AppText variant="caption" style={styles.emptyText}>
                  No se encontraron especies con ese término.
                </AppText>
              }
            />
          </View>
        </View>
      </Modal>

      {errorText ? (
        <AppText variant="caption" style={styles.errorText}>
          {errorText}
        </AppText>
      ) : null}
    </View>
  );
}
