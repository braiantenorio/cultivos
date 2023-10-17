import { Valor } from "./valor";

export type LoteDDJJ = {
  codigo: string;
  fecha: Date;
  variedad: string;
  cantidad: number;
  codigoPadre: string;
  categoriaPadre: string;
  valores: Valor[];
};