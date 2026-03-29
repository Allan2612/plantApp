import {
  CatalogDifficulty,
  CreateCatalogPlantPayload,
} from "@/src/types/plant.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { TextInput } from "react-native";
import { z } from "zod";

const createCatalogPlantSchema = z.object({
  name: z.string().trim().min(1, "El nombre comun es requerido."),
  scientificName: z
    .string()
    .trim()
    .min(1, "El nombre cientifico es requerido."),
  description: z
    .string()
    .trim()
    .min(12, "Describe mejor la especie (minimo 12 caracteres)."),
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
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      "Usa una URL valida (https://...).",
    ),
  lightNotes: z.string().trim().optional(),
  generalCareNotes: z.string().trim().optional(),
});

type CreateCatalogPlantFormValues = z.infer<typeof createCatalogPlantSchema>;

export const difficultyOptions: { value: CatalogDifficulty; label: string }[] =
  [
    { value: "easy", label: "Facil" },
    { value: "medium", label: "Intermedia" },
    { value: "hard", label: "Dificil" },
  ];

export const toxicityOptions: { value: "yes" | "no"; label: string }[] = [
  { value: "no", label: "No toxica" },
  { value: "yes", label: "Toxica" },
];

export function useCatalogPlantCreateModal(
  visible: boolean,
  onSubmit: (payload: CreateCatalogPlantPayload) => Promise<void>,
) {
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

  return {
    control,
    errors,
    imagePreview,
    onFormSubmit,
    refs: {
      scientificNameRef,
      descriptionRef,
      climateRef,
      originRef,
      imageUrlRef,
      lightNotesRef,
      careNotesRef,
    },
  };
}
