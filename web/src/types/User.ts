import type { Permission } from "./Permission";

export type Cargo = "colaborador" | "gerenciador";

export type User = {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cargo: Cargo;
  permissoes: Permission[];
  foto?: string;
};
