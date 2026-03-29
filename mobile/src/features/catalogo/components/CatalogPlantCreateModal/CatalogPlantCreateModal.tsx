import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import InputText from "@/src/components/shared/InputText";
import SingleSelect from "@/src/components/shared/SingleSelect";
import {
  difficultyOptions,
  toxicityOptions,
  useCatalogPlantCreateModal,
} from "@/src/features/catalogo/hooks/useCatalogPlantCreateModal";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { CreateCatalogPlantPayload } from "@/src/types/plant.types";
import { Image } from "expo-image";
import { Controller } from "react-hook-form";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { createStyles } from "./styles";

interface CatalogPlantCreateModalProps {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCatalogPlantPayload) => Promise<void>;
}

export default function CatalogPlantCreateModal({
  visible,
  isSubmitting,
  onClose,
  onSubmit,
}: CatalogPlantCreateModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { control, errors, imagePreview, onFormSubmit, refs } =
    useCatalogPlantCreateModal(visible, onSubmit);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.panel} onPress={() => null}>
          <View style={styles.header}>
            <AppText variant="subheading">Nueva especie en catalogo</AppText>
            <Pressable onPress={onClose}>
              <AppText variant="caption" style={styles.closeText}>
                Cerrar
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.formBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <InputText
                  label="Nombre comun"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    refs.scientificNameRef.current?.focus()
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="scientificName"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={refs.scientificNameRef}
                  label="Nombre cientifico"
                  value={value}
                  onChangeText={onChange}
                  error={errors.scientificName?.message}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => refs.descriptionRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={refs.descriptionRef}
                  label="Descripcion"
                  value={value}
                  onChangeText={onChange}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={3}
                  returnKeyType="next"
                  onSubmitEditing={() => refs.climateRef.current?.focus()}
                />
              )}
            />

            <View style={styles.groupedField}>
              <AppText variant="label" style={styles.fieldLabel}>
                Dificultad de cuidado
              </AppText>
              <Controller
                control={control}
                name="difficulty"
                render={({ field: { value, onChange } }) => (
                  <SingleSelect
                    options={difficultyOptions}
                    value={value}
                    onChange={(selected) => onChange(selected)}
                  />
                )}
              />
              {errors.difficulty?.message ? (
                <AppText variant="caption" style={styles.errorText}>
                  {errors.difficulty.message}
                </AppText>
              ) : null}
            </View>

            <View style={styles.groupedField}>
              <AppText variant="label" style={styles.fieldLabel}>
                Toxicidad
              </AppText>
              <Controller
                control={control}
                name="toxicity"
                render={({ field: { value, onChange } }) => (
                  <SingleSelect
                    options={toxicityOptions}
                    value={value}
                    onChange={(selected) => onChange(selected)}
                  />
                )}
              />
              {errors.toxicity?.message ? (
                <AppText variant="caption" style={styles.errorText}>
                  {errors.toxicity.message}
                </AppText>
              ) : null}
            </View>

            <Controller
              control={control}
              name="climate"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={refs.climateRef}
                  label="Clima"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.climate?.message}
                  placeholder="Tropical, templado, etc."
                  returnKeyType="next"
                  onSubmitEditing={() => refs.originRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="origin"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={refs.originRef}
                  label="Origen"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.origin?.message}
                  placeholder="Region o pais"
                  returnKeyType="next"
                  onSubmitEditing={() => refs.imageUrlRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="imageUrl"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={refs.imageUrlRef}
                  label="URL de imagen"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.imageUrl?.message}
                  placeholder="https://..."
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => refs.lightNotesRef.current?.focus()}
                />
              )}
            />

            <View style={styles.previewFrame}>
              {imagePreview ? (
                <Image
                  source={{ uri: imagePreview }}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={120}
                />
              ) : (
                <AppText variant="caption" style={styles.fallbackText}>
                  Previsualizacion de imagen
                </AppText>
              )}
            </View>

            <Controller
              control={control}
              name="lightNotes"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={refs.lightNotesRef}
                  label="Notas de luz"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.lightNotes?.message}
                  multiline
                  numberOfLines={2}
                  returnKeyType="next"
                  onSubmitEditing={() => refs.careNotesRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="generalCareNotes"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={refs.careNotesRef}
                  label="Cuidados generales"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.generalCareNotes?.message}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  onSubmitEditing={onFormSubmit}
                />
              )}
            />

            <AppText variant="caption" style={styles.helperText}>
              Se crean campos base del catalogo con valores por defecto para
              datos avanzados.
            </AppText>

            <View style={styles.actions}>
              <AppButton
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                style={styles.actionButton}
                disabled={isSubmitting}
              />
              <AppButton
                title={isSubmitting ? "Guardando..." : "Guardar especie"}
                onPress={onFormSubmit}
                style={styles.actionButton}
                disabled={isSubmitting}
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
