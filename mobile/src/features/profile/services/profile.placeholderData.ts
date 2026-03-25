import { UserInterface } from "@/src/types/user.types";

export const mockUser: UserInterface = {
  nombre: "Allan Vargas",
  apodo: "allan2612",
  cantidadPlantas: 12,
  categoriasPlantas: ["Suculentas", "Cactus", "Orquídeas"],
  racha: 7,
  cumpleanos: new Date(1998, 5, 12),
  image: "https://i.imgur.com/vLgY64w.jpeg",
  cantidadAmigos: 5,
  privacidad: "publico",
  descripcion: "Amante de las plantas y la naturaleza. Siempre aprendiendo.",
  plantaFavorita: "Monstera deliciosa",
};
