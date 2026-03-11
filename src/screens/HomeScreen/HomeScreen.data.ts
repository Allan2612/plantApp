import { Plant } from "@/src/types-dtos/plant.types";

export interface CatalogItem {
  id: string;
  name: string;
  species: string;
  image: string;
  difficulty: "Fácil" | "Media" | "Avanzada";
}

export const CATALOG: CatalogItem[] = [
  {
    id: "c1",
    name: "Aloe Vera",
    species: "Aloe barbadensis",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400",
    difficulty: "Fácil",
  },
  {
    id: "c2",
    name: "Helecho Boston",
    species: "Nephrolepis exaltata",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
    difficulty: "Media",
  },
  {
    id: "c3",
    name: "Ficus Lyrata",
    species: "Ficus lyrata",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=400",
    difficulty: "Avanzada",
  },
  {
    id: "c4",
    name: "Sansevieria",
    species: "Dracaena trifasciata",
    image: "https://images.unsplash.com/photo-1620803366004-119b57f54cd6?w=400",
    difficulty: "Fácil",
  },
  {
    id: "c5",
    name: "Calathea",
    species: "Calathea orbifolia",
    image: "https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?w=400",
    difficulty: "Avanzada",
  },
];

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
  href: string;
}[] = [
  { icon: "camera-outline", label: "Identificar", href: "/(tabs)/identificar" },
  { icon: "leaf-outline", label: "Catálogo", href: "/(tabs)/catalogo" },
  { icon: "flower-outline", label: "Mis plantas", href: "/(tabs)/misplantas" },
];
