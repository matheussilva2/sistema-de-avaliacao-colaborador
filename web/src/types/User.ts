export type User = {
    nome: string;
    sobrenome: string;
    email: string;
    password?: string;
    foto_perfil: string;
    cargo: string;
    permissoes: string[]
}