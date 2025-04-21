import { Timestamp } from "firebase/firestore";

export interface Categoria {
  id: string;
  nome: string;
  criado_em: Timestamp;
  ativo: boolean;
}
