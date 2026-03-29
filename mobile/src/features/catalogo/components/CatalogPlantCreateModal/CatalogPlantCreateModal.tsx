import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import InputText from "@/src/components/shared/InputText";
import SingleSelect from "@/src/components/shared/SingleSelect";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { CatalogDifficulty, CreateCatalogPlantPayload } from "@/src/types/plant.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useRef } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { z } from "zod";

import { createStyles } from "./styles";

const difficultyOptions: { value: CatalogDifficulty; label: string }[] = [
  { value: "easy", label: "Facil" },
  { value: "medium", label: "Intermedia" },
  { value: "hard", label: "Dificil" },
];

const toxicityOptions: { value: "yes" | "no"; label: string }[] = [
  { value: "no", label: "No toxica" },
  { value: "yes", label: "Toxica" },
];

const createCatalogPlantSchema = z.object({
  name: z.string().trim().min(1, "El nombre comun es requerido."),
  scientificName: z.string().trim().min(1, "El nombre cientifico es requerido."),
  description: z.string().trim().min(12, "Describe mejor la especie (minimo 12 caracteres)."),
  difficulty: z.enum(["easy", "medium", "hard"], {
    message: "Selecciona una dificultad.",
  }),
  toxicity: z.enum(["yes", "no"], {
    message: "Selecciona si la especie es toxica.",
  }),
  climate: z.string().trim().optional(),
  origin: z.string().trim().optional(),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\//i.test(value), "Usa una URL valida (https://...)."),
  lightNotes: z.string().trim().optional(),
  generalCareNotes: z.string().trim().optional(),
});

type CreateCatalogPlantFormValues = z.infer<typeof createCatalogPlantSchema>;

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

  const scientificNameRef = useRef<TextInput | null>(null);
  const descriptionRef = useRef<TextInput | null>(null);
  const climateRef = useRef<TextInput | null>(null);
  const originRef = useRef<TextInput | null>(null);
  const imageUrlRef = useRef<TextInput | null>(null);
  const lightNotesRef = useRef<TextInput | null>(null);
  const careNotesRef = useRef<TextInput | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateCatalogPlantFormValues>({
    resolver: zodResolver(createCatalogPlantSchema),
    defaultValues: {
      name: "",
      scientificName: "",
      description: "",
      difficulty: "easy",
      toxicity: "no",
      climate: "",
      origin: "",
      imageUrl: "",
      lightNotes: "",
      generalCareNotes: "",
    },
  });

  useEffect(() => {
    if (!visible) return;
    reset();
  }, [reset, visible]);

  const watchedImageUrl = watch("imageUrl") ?? "";

  const imagePreview = useMemo(() => {
    const candidate = watchedImageUrl.trim();
    return /^https?:\/\//i.test(candidate) ? candidate : "";
  }, [watchedImageUrl]);

  const onFormSubmit = handleSubmit(async (values) => {
    const payload: CreateCatalogPlantPayload = {
      name: values.name.trim(),
      scientificName: values.scientificName.trim(),
      description: values.description.trim(),
      difficulty: values.difficulty,
      isToxic: values.toxicity === "yes",
      climate: values.climate?.trim() || undefined,
      origin: values.origin?.trim() || undefined,
      imageUrl: values.imageUrl?.trim() || undefined,
      lightNotes: values.lightNotes?.trim() || undefined,
      generalCareNotes: values.generalCareNotes?.trim() || undefined,
    };

    await onSubmit(payload);
    reset();
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
                  onSubmitEditing={() => scientificNameRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="scientificName"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={scientificNameRef}
                  label="Nombre cientifico"
                  value={value}
                  onChangeText={onChange}
                  error={errors.scientificName?.message}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => descriptionRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={descriptionRef}
                  label="Descripcion"
                  value={value}
                  onChangeText={onChange}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={3}
                  returnKeyType="next"
                  onSubmitEditing={() => climateRef.current?.focus()}
                />
              )}
            />

            <View style={styles.groupedField}>
              <AppText variant="label" style={styles.fieldLabel}>Dificultad de cuidado</AppText>
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
              <AppText variant="label" style={styles.fieldLabel}>Toxicidad</AppText>
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
                  ref={climateRef}
                  label="Clima"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.climate?.message}
                  placeholder="Tropical, templado, etc."
                  returnKeyType="next"
                  onSubmitEditing={() => originRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="origin"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={originRef}
                  label="Origen"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.origin?.message}
                  placeholder="Region o pais"
                  returnKeyType="next"
                  onSubmitEditing={() => imageUrlRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="imageUrl"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={imageUrlRef}
                  label="URL de imagen"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.imageUrl?.message}
                  placeholder="https://..."
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => lightNotesRef.current?.focus()}
                />
              )}
            />

            <View style={styles.previewFrame}>
              {imagePreview ? (
                <Image source={{ uri: imagePreview }} style={styles.previewImage} contentFit="cover" transition={120} />
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
                  ref={lightNotesRef}
                  label="Notas de luz"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.lightNotes?.message}
                  multiline
                  numberOfLines={2}
                  returnKeyType="next"
                  onSubmitEditing={() => careNotesRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="generalCareNotes"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={careNotesRef}
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
              Se crean campos base del catalogo con valores por defecto para datos avanzados.
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
