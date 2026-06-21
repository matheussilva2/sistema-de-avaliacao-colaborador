import { Button, Card } from "@heroui/react";
import { ArrowLeft, Trash2, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthenticatedUser } from "../../../services/authService";
import {
  clearEmployeeTrash,
  getTrashedEmployees,
  moveEmployeeToTrash,
  removeEmployeeFromTrash,
  restoreEmployeeFromTrash,
  type TrashedEmployee,
} from "../../../services/employeeTrashService";
import { deleteUser } from "../../../services/userService";
import { useUndoableDelete } from "../../../components/UndoDeleteProvider";

export default function LixeiraColaboradores() {
  const navigate = useNavigate();
  const [managerId, setManagerId] = useState("");
  const [trashedEmployees, setTrashedEmployees] = useState<TrashedEmployee[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { scheduleUndoableDelete } = useUndoableDelete();

  useEffect(() => {
    const manager = getAuthenticatedUser();

    if (!manager || manager.userRole !== "MANAGER") {
      setErrorMessage("Faca login como gestor para acessar a lixeira.");
      return;
    }

    setManagerId(manager.id);
    setTrashedEmployees(getTrashedEmployees(manager.id));
  }, []);

  const handleRestore = (userId: string) => {
    const nextTrash = restoreEmployeeFromTrash(managerId, userId);
    setTrashedEmployees(nextTrash);
  };

  const handleDeleteOne = (userId: string) => {
    const trashedEmployee = trashedEmployees.find((item) => item.user.id === userId);

    if (!trashedEmployee) {
      return;
    }

    setErrorMessage("");

    scheduleUndoableDelete({
      id: `employee-trash:${userId}`,
      title: "Colaborador excluido",
      description: `${trashedEmployee.user.name} ${trashedEmployee.user.lastName} sera excluido definitivamente em 5 segundos.`,
      onStart: () => {
        setTrashedEmployees(removeEmployeeFromTrash(managerId, userId));
      },
      onUndo: () => {
        setTrashedEmployees(moveEmployeeToTrash(managerId, trashedEmployee.user));
      },
      onCommit: async () => {
        await deleteUser(userId);
      },
      onCommitError: () => {
        setTrashedEmployees(moveEmployeeToTrash(managerId, trashedEmployee.user));
        setErrorMessage("Nao foi possivel excluir definitivamente este colaborador.");
      },
    });
  };

  const handleEmptyTrash = () => {
    if (trashedEmployees.length === 0) {
      return;
    }

    const trashSnapshot = [...trashedEmployees];
    setErrorMessage("");

    scheduleUndoableDelete({
      id: `employee-trash:empty:${managerId}`,
      title: "Lixeira esvaziada",
      description: `${trashSnapshot.length} colaborador(es) serao excluidos definitivamente em 5 segundos.`,
      onStart: () => {
        clearEmployeeTrash(managerId);
        setTrashedEmployees([]);
      },
      onUndo: () => {
        trashSnapshot
          .slice()
          .reverse()
          .forEach((item) => moveEmployeeToTrash(managerId, item.user));
        setTrashedEmployees(trashSnapshot);
      },
      onCommit: async () => {
        await Promise.all(trashSnapshot.map((item) => deleteUser(item.user.id)));
      },
      onCommitError: () => {
        trashSnapshot
          .slice()
          .reverse()
          .forEach((item) => moveEmployeeToTrash(managerId, item.user));
        setTrashedEmployees(trashSnapshot);
        setErrorMessage("Nao foi possivel esvaziar toda a lixeira.");
      },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            Lixeira de colaboradores
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Revise colaboradores movidos para exclusao antes de apagar
            definitivamente.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-white text-primary border border-primary"
            onPress={() => navigate("/painel/colaboradores")}
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <Button
            className="bg-red-600 text-white"
            isDisabled={trashedEmployees.length === 0}
            onPress={handleEmptyTrash}
          >
            <Trash2 size={16} />
            Esvaziar lixeira
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="grid gap-4">
        {trashedEmployees.map(({ user, deletedAt }) => (
          <Card key={user.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="size-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary-50 font-bold text-primary">
                    {user.name.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-neutral-900">
                    {user.name} {user.lastName}
                  </p>
                  <p className="text-sm text-neutral-600">{user.email}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Movido em {formatTrashDate(deletedAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="bg-primary text-white"
                  onPress={() => handleRestore(user.id)}
                >
                  <Undo2 size={16} />
                  Restaurar
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onPress={() => handleDeleteOne(user.id)}
                >
                  <Trash2 size={16} />
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {trashedEmployees.length === 0 && (
          <Card className="border border-dashed border-primary-200 p-8 text-center">
            <p className="font-semibold text-primary">Lixeira vazia</p>
            <p className="mt-1 text-sm text-neutral-600">
              Colaboradores movidos para exclusao aparecerao aqui.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function formatTrashDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data indisponivel";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
