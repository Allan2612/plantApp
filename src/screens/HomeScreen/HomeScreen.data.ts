import { Plant } from "@/src/types-dtos/plant.types";

export const TRENDING: { id: string; name: string; image: string }[] = [
  {
    id: "t1",
    name: "Camelia",
    image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400",
  },
  {
    id: "t2",
    name: "Lavanda",
    image: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=400",
  },
  {
    id: "t3",
    name: "Orquídea",
    image: "https://images.unsplash.com/photo-1566836610593-62a64888a216?w=400",
  },
];

export const PLANTS: Plant[] = [
  {
    id: "1",
    name: "Monstera Deliciosa",
    description: "Planta tropical con hojas grandes y perforadas.",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400",
    category: "Tropical",
  },
  {
    id: "2",
    name: "Suculenta Echevería",
    description: "Planta compacta en forma de roseta.",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
    category: "Suculenta",
  },
  {
    id: "3",
    name: "Cactus San Pedro",
    description: "Cactus columnar de crecimiento rápido.",
    image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400",
    category: "Cactus",
  },
  {
    id: "4",
    name: "Pothos Dorado",
    description: "Planta colgante fácil de cuidar.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400",
    category: "Tropical",
  },
];

export const ACTIONS: {
  icon: "camera-outline" | "leaf-outline" | "flower-outline";
  label: string;
}[] = [
  { icon: "camera-outline", label: "Identificar" },
  { icon: "leaf-outline", label: "Catálogo" },
  { icon: "flower-outline", label: "Mi jardín" },
];
