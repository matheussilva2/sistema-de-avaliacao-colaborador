import { Button, Skeleton } from "@heroui/react";
import { Search, Trash2, Undo2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployeesByManager } from "../../services/userService";
import { getAuthenticatedUser, type ApiUser } from "../../services/authService";
import {
  getTrashedEmployeeIds,
  moveEmployeeToTrash,
  restoreEmployeeFromTrash,
} from "../../services/employeeTrashService";

type PendingUndo = {
  managerId: string;
  user: ApiUser;
};

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<ApiUser[]>([]);
  const [managerId, setManagerId] = useState("");
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUsers() {
      const manager = getAuthenticatedUser();

      if (!manager || manager.userRole !== "MANAGER") {
        setErrorMessage("Faca login como gestor para visualizar colaboradores.");
        setIsLoading(false);
        return;
      }

      setManagerId(manager.id);

      try {
        const users = await getEmployeesByManager(manager.id);
        const trashedIds = getTrashedEmployeeIds(manager.id);
        setColaboradores(users.filter((user) => !trashedIds.has(user.id)));
      } catch {
        setErrorMessage("Nao foi possivel carregar os colaboradores deste gestor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    if (!pendingUndo) {
      return;
    }

    const undoTimer = window.setTimeout(() => {
      setPendingUndo(null);
    }, 5000);

    return () => window.clearTimeout(undoTimer);
  }, [pendingUndo]);

  const filtrados = useMemo(() => {
    return colaboradores.filter((user) => {
      const fullName = `${user.name} ${user.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [colaboradores, searchTerm]);

  const handleRowClick = (id: string) => {
    navigate(`/painel/colaboradores/${id}`);
  };

  const handleMoveToTrash = (user: ApiUser) => {
    if (!managerId) {
      setErrorMessage("Nao foi possivel identificar o gestor logado.");
      return;
    }

    moveEmployeeToTrash(managerId, user);
    setColaboradores((prev) => prev.filter((item) => item.id !== user.id));
    setPendingUndo({ managerId, user });
  };

  const handleUndoDelete = () => {
    if (!pendingUndo) {
      return;
    }

    restoreEmployeeFromTrash(pendingUndo.managerId, pendingUndo.user.id);
    setColaboradores((prev) =>
      [...prev, pendingUndo.user].sort(compareUsersByName),
    );
    setPendingUndo(null);
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
        <Button
          className="bg-white text-primary border border-primary font-semibold px-6"
          onPress={() => navigate("/painel/colaboradores/lixeira")}
        >
          <Trash2 size={16} />
          Lixeira
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
              <th className="p-4">Foto</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Email</th>
              <th className="p-4">CPF</th>
              <th className="p-4">Cargo</th>
              <th className="p-4">Situação</th>
              <th className="p-4">Opções</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && <CollaboratorsTableSkeletonRows />}

            {!isLoading && filtrados.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-neutral-50 cursor-pointer"
                onClick={() => handleRowClick(user.id)}
              >
                <td className="p-4">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="size-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary-50 font-bold text-primary">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium">{user.name} {user.lastName}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.cpf}</td>
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
                      handleMoveToTrash(user);
                    }}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && filtrados.length === 0 && (
          <div className="p-6 text-center text-neutral-500">
            Nenhum colaborador encontrado
          </div>
        )}
      </div>

      {pendingUndo && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))] rounded-md border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-neutral-900">
                Colaborador movido para a lixeira
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {pendingUndo.user.name} {pendingUndo.user.lastName} sera mantido na
                lixeira ate a exclusao definitiva.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPendingUndo(null)}
              className="rounded-md p-1 text-neutral-500 transition hover:bg-gray-100 hover:text-neutral-900"
              aria-label="Fechar aviso"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              className="bg-primary text-white"
              onPress={handleUndoDelete}
            >
              <Undo2 size={16} />
              Desfazer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CollaboratorsTableSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((item) => (
        <tr key={item} className="border-t">
          <td className="p-4">
            <Skeleton className="size-11 rounded-full" />
          </td>
          <td className="p-4">
            <Skeleton className="h-5 w-40 rounded-md" />
          </td>
          <td className="p-4">
            <Skeleton className="h-5 w-44 rounded-md" />
          </td>
          <td className="p-4">
            <Skeleton className="h-5 w-32 rounded-md" />
          </td>
          <td className="p-4">
            <Skeleton className="h-5 w-24 rounded-md" />
          </td>
          <td className="p-4">
            <Skeleton className="h-5 w-20 rounded-md" />
          </td>
          <td className="p-4">
            <Skeleton className="h-9 w-20 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  );
}

function compareUsersByName(current: ApiUser, next: ApiUser) {
  const currentName = `${current.name} ${current.lastName}`;
  const nextName = `${next.name} ${next.lastName}`;

  return currentName.localeCompare(nextName, "pt-BR");
}
