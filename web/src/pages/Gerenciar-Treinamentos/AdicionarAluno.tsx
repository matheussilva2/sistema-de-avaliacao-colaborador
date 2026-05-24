import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Skeleton } from "@heroui/react";
import { ApiRequestError, getAuthenticatedUser, type ApiUser } from "../../services/authService";
import { getTrainingResults } from "../../services/formService";
import { getEmployeesByManager } from "../../services/userService";
import {
  addUserToTraining,
  getTrainingById,
  getTrainingUsers,
  removeUserFromTraining,
  type ApiTraining,
} from "../../services/trainingService";

export default function AdicionarAluno() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [employees, setEmployees] = useState<ApiUser[]>([]);
  const [linkedUsers, setLinkedUsers] = useState<ApiUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startedUserIds, setStartedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setErrorMessage("Treinamento nao informado.");
        setIsLoading(false);
        return;
      }

      try {
        const trainingData = await getTrainingById(id);
        setTraining(trainingData);
      } catch {
        setErrorMessage("Treinamento nao encontrado.");
        setIsLoading(false);
        return;
      }

      const manager = getAuthenticatedUser();

      if (!manager || manager.userRole !== "MANAGER") {
        setErrorMessage("Faca login como gestor para vincular colaboradores.");
        setIsLoading(false);
        return;
      }

      try {
        const [managerEmployees, trainingUsers, trainingResults] = await Promise.all([
          getEmployeesByManager(manager.id),
          getTrainingUsers(id),
          getTrainingResults(id).catch(() => []),
        ]);

        setEmployees(managerEmployees);
        setLinkedUsers(trainingUsers);
        setStartedUserIds(
          new Set(
            trainingResults
              .map((answer) => answer.user?.id)
              .filter((userId): userId is string => Boolean(userId)),
          ),
        );
      } catch {
        setErrorMessage("Nao foi possivel carregar colaboradores ou vinculos deste treinamento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  const availableEmployees = useMemo(() => {
    const linkedUserIds = new Set(linkedUsers.map((user) => user.id));

    return employees.filter((employee) => !linkedUserIds.has(employee.id));
  }, [employees, linkedUsers]);

  const selectedUsers = useMemo(() => {
    return employees.filter((employee) => selectedIds.includes(employee.id));
  }, [employees, selectedIds]);

  const toggleSelect = (colaboradorId: string) => {
    setSelectedIds((current) =>
      current.includes(colaboradorId)
        ? current.filter((item) => item !== colaboradorId)
        : [...current, colaboradorId],
    );
  };

  const handleRemoveSelected = (colaboradorId: string) => {
    setSelectedIds((current) => current.filter((item) => item !== colaboradorId));
  };

  const handleUnlink = async (colaboradorId: string) => {
    if (!id) {
      return;
    }

    if (startedUserIds.has(colaboradorId)) {
      setErrorMessage("Colaborador ja iniciou o treinamento.");
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await removeUserFromTraining(id, colaboradorId);
      setLinkedUsers((current) => current.filter((user) => user.id !== colaboradorId));
      setSuccessMessage("Colaborador desvinculado com sucesso.");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409) {
        setErrorMessage("Colaborador ja iniciou o treinamento.");
      } else {
        setErrorMessage("Nao foi possivel desvincular o colaborador.");
      }
      setSuccessMessage("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!id) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const usersToAdd = selectedIds;

    try {
      await Promise.all(usersToAdd.map((userId) => addUserToTraining(id, userId)));

      const updatedLinkedUsers = await getTrainingUsers(id);
      setLinkedUsers(updatedLinkedUsers);
      setSelectedIds([]);
      setSuccessMessage("Colaboradores vinculados com sucesso.");
    } catch {
      setErrorMessage("Nao foi possivel salvar os vinculos.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <AddStudentsSkeleton />;
  }

  if (!training) {
    return <div className="p-8 text-red-700">{errorMessage || "Treinamento nao encontrado."}</div>;
  }

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Vincular colaboradores</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Selecione colaboradores para incluir em {training.title}.
          </p>
        </div>
        <Button
          className="bg-white text-primary border border-primary font-semibold px-6"
          onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}`)}
        >
          Voltar
        </Button>
      </div>

      {errorMessage && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-3xl bg-white shadow-sm border border-gray-200 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-primary">
              Colaboradores disponiveis
            </h2>
            <p className="text-sm text-neutral-600">
              Selecione apenas novos colaboradores para este treinamento.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {availableEmployees.map((colaborador) => {
              const isSelected = selectedIds.includes(colaborador.id);

              return (
                <div
                  key={colaborador.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSelect(colaborador.id)}
                      className="flex items-center gap-4 text-left w-full cursor-pointer"
                    >
                      {colaborador.profilePhoto ? (
                        <img
                          src={colaborador.profilePhoto}
                          alt={colaborador.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold">
                          {colaborador.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">
                          {colaborador.name} {colaborador.lastName}
                        </p>
                        <p className="text-sm text-neutral-500">{colaborador.email}</p>
                      </div>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          isSelected
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {isSelected ? "Vinculado" : "Vincular"}
                      </span>
                    </button>

                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSelected(colaborador.id)}
                        className="text-red-600 font-semibold px-2 py-1 rounded-full hover:bg-red-50"
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {availableEmployees.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-neutral-500">
                Nenhum colaborador disponivel para vincular.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary">Colaboradores vinculados</h2>
                <p className="text-sm text-neutral-600">
                  {linkedUsers.length} colaborador(es) vinculado(s)
                </p>
              </div>
              <Button
                className="bg-primary text-white"
                onPress={handleSave}
                isDisabled={isSaving || selectedIds.length === 0}
              >
                {isSaving ? "Salvando..." : "Salvar vinculos"}
              </Button>
            </div>

            {selectedUsers.length > 0 && (
              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-4">
                <p className="font-semibold text-primary">Novos selecionados</p>
                <div className="mt-3 grid gap-3">
                  {selectedUsers.map((colaborador) => (
                    <SelectedUserCard
                      key={colaborador.id}
                      user={colaborador}
                      onRemove={() => handleRemoveSelected(colaborador.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {linkedUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-neutral-500">
                Nenhum colaborador vinculado.
              </div>
            ) : (
              <div className="grid gap-3">
                {linkedUsers.map((colaborador) => (
                  <LinkedUserCard
                    key={colaborador.id}
                    user={colaborador}
                    hasStarted={startedUserIds.has(colaborador.id)}
                    onUnlink={() => handleUnlink(colaborador.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddStudentsSkeleton() {
  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-3xl bg-white shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 rounded-md" />
                      <Skeleton className="mt-2 h-4 w-56 rounded-md" />
                    </div>
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-52 rounded-md" />
              <Skeleton className="mt-2 h-4 w-40 rounded-md" />
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
          <Skeleton className="mt-4 h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function SelectedUserCard({
  user,
  onRemove,
}: {
  user: ApiUser;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-primary-200 bg-white p-4">
      <UserSummary user={user} />
      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 font-semibold px-2 py-1 rounded-full hover:bg-red-50 cursor-pointer"
      >
        x
      </button>
    </div>
  );
}

function LinkedUserCard({
  user,
  hasStarted,
  onUnlink,
}: {
  user: ApiUser;
  hasStarted: boolean;
  onUnlink: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-green-300 bg-green-50 p-4">
      <UserSummary user={user} />
      <div className="flex items-center gap-3">
        {hasStarted && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            Iniciado
          </span>
        )}
        <button
          type="button"
          onClick={onUnlink}
          className={`font-semibold px-2 py-1 rounded-full ${
            hasStarted
              ? "cursor-not-allowed text-neutral-400"
              : "text-red-600 hover:bg-red-100 cursor-pointer"
          }`}
          title={hasStarted ? "Colaborador ja iniciou o treinamento" : "Desvincular"}
        >
          x
        </button>
      </div>
    </div>
  );
}

function UserSummary({ user }: { user: ApiUser }) {
  return (
    <div className="flex items-center gap-4">
      {user.profilePhoto ? (
        <img
          src={user.profilePhoto}
          alt={user.name}
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold">
          {user.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="font-semibold text-neutral-900">
          {user.name} {user.lastName}
        </p>
        <p className="text-sm text-neutral-600">{user.email}</p>
      </div>
    </div>
  );
}
