import { Atributo } from "./atributo";
import { Valor } from "./valor";

export type Proceso = {
  id: number | null;
  usuario: string | null;
  fecha: Date | null;
  valores: Valor[];
};