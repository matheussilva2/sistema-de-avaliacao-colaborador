import { Button } from "@heroui/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUser, getUsers } from "../../services/userService";
import type { ApiUser } from "../../services/authService";

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<ApiUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await getUsers();
        setColaboradores(users);
      } catch {
        setErrorMessage("Nao foi possivel carregar os usuarios. Verifique se a API esta rodando.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filtrados = useMemo(() => {
    return colaboradores.filter((user) => {
      const fullName = `${user.name} ${user.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [colaboradores, searchTerm]);

  const handleRowClick = (id: string) => {
    navigate(`/painel/colaboradores/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setColaboradores((prev) => prev.filter((user) => user.id !== id));
    } catch {
      setErrorMessage("Nao foi possivel deletar o usuario.");
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex w-full max-w-xl bg-white pl-4 pr-3 rounded-full items-center gap-2 border border-gray-200 focus-within:border-gray-400 transition">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full py-2 outline-none text-sm placeholder:text-gray-400"
          />
        </div>

        <Button
          className="bg-primary text-white font-semibold px-6"
          onPress={() => navigate("/painel/colaboradores/adicionar")}
        >
          + Adicionar Colaborador
        </Button>
      </div>

      {errorMessage && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 ">
            <tr className="text-gray-500 uppercase text-sm">
              <th className="p-4">ID</th>
              <th className="p-4">CPF</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Email</th>
              <th className="p-4">Cargo</th>
              <th className="p-4">Situação</th>
              <th className="p-4">Opções</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-neutral-50 cursor-pointer"
                onClick={() => handleRowClick(user.id)}
              >
                <td className="p-4">{user.id.slice(0, 8)}</td>
                <td className="p-4">{user.cpf}</td>
                <td className="p-4">{user.name} {user.lastName}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {user.userRole === "MANAGER" ? "Gestor" : "Colaborador"}
                </td>
                <td className="p-4">
                  {user.active ? "Ativo" : "Inativo"}
                </td>
                <td
                  className="p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-700 text-sm rounded-md"
                    onClick={() => {
                      handleDelete(user.id);
                    }}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="p-6 text-center text-neutral-500">
            Carregando usuarios...
          </div>
        )}

        {!isLoading && filtrados.length === 0 && (
          <div className="p-6 text-center text-neutral-500">
            Nenhum colaborador encontrado
          </div>
        )}
      </div>
    </div>
  );
}
