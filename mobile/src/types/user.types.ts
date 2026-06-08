export interface UserInterface {
  nombre: string;
  apodo: string;
  cantidadPlantas?: number;
  categoriasPlantas: string[];
  racha: number;
  cumpleanos: Date;
  image: string; // URL o base64
  cantidadAmigos: number;
  privacidad: "publico" | "privado";
  descripcion: string;
  plantaFavorita: string;
}
