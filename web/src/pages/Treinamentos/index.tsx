import { useEffect, useMemo, useState } from "react";
import { Button, Input, Card, Skeleton } from "@heroui/react";
import { Clock, CalendarDays, Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthenticatedUser } from "../../services/authService";
import { getUserTrainings } from "../../services/userService";
import type { ApiTraining } from "../../services/trainingService";
import {
  readTrainingsCache,
  sortTrainingsStable,
  writeTrainingsCache,
} from "../../services/trainingService";
import {
  getTrainingForms,
  getTrainingUserResults,
  type ApiFormAnswer,
} from "../../services/formService";
import { getTrashedFormIds } from "../../services/formTrashService";

type StatusFilter = "todos" | "em_andamento" | "concluido" | "oculto";
const hiddenStudentTrainingsKey = "hiddenStudentTrainings";
const studentTrainingsCachePrefix = "studentTrainings";

export const Treinamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("todos");
  const [trainings, setTrainings] = useState<ApiTraining[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<Record<string, TrainingProgress>>({});
  const [hiddenTrainingIds, setHiddenTrainingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get("status") as StatusFilter | null;

    if (status && ["todos", "em_andamento", "concluido", "oculto"].includes(status)) {
      setSelectedStatus(status);
      return;
    }

    setSelectedStatus("todos");
  }, [searchParams]);

  useEffect(() => {
    const storedHiddenTrainings = localStorage.getItem(hiddenStudentTrainingsKey);

    if (storedHiddenTrainings) {
      setHiddenTrainingIds(JSON.parse(storedHiddenTrainings) as string[]);
    }
  }, []);

  useEffect(() => {
    async function loadTrainings() {
      const user = getAuthenticatedUser();

      if (!user) {
        setErrorMessage("Faca login para visualizar seus treinamentos.");
        setIsLoading(false);
        return;
      }

      const cacheKey = `${studentTrainingsCachePrefix}:${user.id}`;
      const cachedTrainings = readTrainingsCache(cacheKey);

      if (cachedTrainings) {
        setTrainings(sortTrainingsStable(cachedTrainings));
        setIsLoading(false);
      }

      try {
        const userTrainings = await getUserTrainings(user.id);
        const sortedTrainings = sortTrainingsStable(userTrainings);
        setTrainings(sortedTrainings);
        writeTrainingsCache(cacheKey, sortedTrainings);

        const progressEntries = await Promise.all(
          sortedTrainings.map(async (training) => {
            const progress = await loadTrainingProgress(training.idTraining, user.id);
            return [training.idTraining, progress] as const;
          }),
        );

        setTrainingProgress(Object.fromEntries(progressEntries));
      } catch {
        setErrorMessage("Nao foi possivel carregar seus treinamentos.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTrainings();
  }, []);

  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const matchesSearch = training.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const isConcluded = isTrainingConcluded(training.endDate);
      const isHidden = hiddenTrainingIds.includes(training.idTraining);

      if (!matchesSearch) {
        return false;
      }

      if (selectedStatus === "oculto") {
        return isHidden;
      }

      if (selectedStatus === "concluido") {
        return !isHidden && isConcluded;
      }

      if (selectedStatus === "em_andamento") {
        return !isHidden && !isConcluded;
      }

      return !isHidden;
    });
  }, [hiddenTrainingIds, searchTerm, selectedStatus, trainings]);

  const toggleOculto = (id: string) => {
    setHiddenTrainingIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((trainingId) => trainingId !== id)
        : [...prev, id];

      localStorage.setItem(hiddenStudentTrainingsKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex items-center gap-4 w-full">
        <Input
          type="text"
          placeholder="Procurar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white flex-1"
        />
        <div className="flex-1" />
      </div>

      <div className="flex gap-3 flex-wrap mb-8">
        {(["todos", "em_andamento", "concluido", "oculto"] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setSearchParams(status === "todos" ? {} : { status });
            }}
            className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
              selectedStatus === status
                ? "bg-primary text-white"
                : "bg-white text-primary border-2 border-primary hover:bg-primary-50"
            }`}
          >
            {status === "todos"
              ? "Todos"
              : status === "em_andamento"
                ? "Em andamento"
                : status === "concluido"
                  ? "Concluidos"
                  : "Ocultos"}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {isLoading && (
        <TrainingGridSkeleton />
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.map((training) => {
            const isConcluded = isTrainingConcluded(training.endDate);
            const isHidden = hiddenTrainingIds.includes(training.idTraining);
            const progressInfo = trainingProgress[training.idTraining] ?? {
              totalForms: 0,
              answeredForms: 0,
              pendingForms: 0,
              progress: 0,
            };
            const statusConfig = getTrainingStatusConfig({
              isConcluded,
              progress: progressInfo.progress,
              hasPendingForms: progressInfo.pendingForms > 0,
              hasAvailableForms: progressInfo.pendingForms > 0,
            });

            return (
              <Card
                key={training.idTraining}
                onClick={() => navigate(`/painel/treinamentos/${training.idTraining}`)}
                className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-md p-0 cursor-pointer"
              >
                <div className="w-full h-40 bg-primary-50 overflow-hidden relative flex items-start justify-end p-4">
                  {training.trainingImage ? (
                    <img
                      src={training.trainingImage}
                      alt={training.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 h-full w-full bg-linear-to-br from-primary-100 to-primary-400" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOculto(training.idTraining);
                    }}
                    className="relative bg-white/90 hover:bg-white text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors shadow"
                  >
                    {isHidden ? (
                      <>
                        <EyeOff size={14} /> Mostrar
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Ocultar
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">
                      {training.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-neutral-600">
                      {training.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-600">
                    <Clock size={18} />
                    <span className="font-medium">{training.workload} horas</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-neutral-900">
                        Progresso: {progressInfo.progress}%
                      </span>
                      <span className="text-xs font-semibold text-neutral-500">
                        {progressInfo.answeredForms}/{progressInfo.totalForms} forms respondidos
                      </span>
                    </div>

                    <div className="w-full bg-neutral-300 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all rounded-full"
                        style={{
                          width: `${progressInfo.progress}%`,
                          backgroundColor: statusConfig.progressColor,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-neutral-600">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <strong>Inicio:</strong> {training.initDate}
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <strong>Termino:</strong> {training.endDate}
                    </span>
                  </div>

                  <Button
                    className="w-full text-white font-semibold py-3 rounded-md"
                    style={{ backgroundColor: statusConfig.buttonColor }}
                    onPress={() => navigate(`/painel/treinamentos/${training.idTraining}`)}
                  >
                    {statusConfig.buttonText}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredTrainings.length === 0 && (
        <div className="text-center py-12 text-neutral-600">
          Nenhum treinamento encontrado.
        </div>
      )}
    </div>
  );
};

function TrainingGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Card
          key={item}
          className="overflow-hidden shadow-md rounded-md p-0"
        >
          <Skeleton className="h-40 w-full rounded-none" />

          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>

            <Skeleton className="h-5 w-28 rounded-md" />

            <div>
              <div className="mb-2 flex justify-between gap-4">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>

            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function isTrainingConcluded(endDate: string) {
  if (!endDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trainingEndDate = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(trainingEndDate.getTime())) {
    return false;
  }

  return trainingEndDate < today;
}

type TrainingProgress = {
  totalForms: number;
  answeredForms: number;
  pendingForms: number;
  progress: number;
};

async function loadTrainingProgress(
  trainingId: string,
  userId: string,
): Promise<TrainingProgress> {
  const trashedFormIds = getTrashedFormIds(trainingId);
  const forms = (await getTrainingForms(trainingId)).filter(
    (form) => !trashedFormIds.has(form.idForm),
  );
  let answers: ApiFormAnswer[] = [];

  try {
    answers = await getTrainingUserResults(trainingId, userId);
  } catch {
    answers = [];
  }

  const answeredFormIds = new Set(answers.map((answer) => answer.form.idForm));
  const totalForms = forms.length;
  const answeredForms = forms.filter((form) => answeredFormIds.has(form.idForm)).length;
  const pendingForms = Math.max(totalForms - answeredForms, 0);
  const progress = totalForms > 0 ? Math.round((answeredForms / totalForms) * 100) : 0;

  return {
    totalForms,
    answeredForms,
    pendingForms,
    progress,
  };
}

type TrainingStatusConfigParams = {
  isConcluded: boolean;
  progress: number;
  hasPendingForms: boolean;
  hasAvailableForms: boolean;
};

function getTrainingStatusConfig({
  isConcluded,
  progress,
  hasPendingForms,
  hasAvailableForms,
}: TrainingStatusConfigParams) {
  if (hasAvailableForms) {
    return {
      buttonText: "Formulario disponivel",
      buttonColor: "#17C964",
      progressColor: "#006FEE",
    };
  }

  if (hasPendingForms) {
    return {
      buttonText: "Pendente",
      buttonColor: "#F5A623",
      progressColor: "#F5A623",
    };
  }

  if (isConcluded) {
    return {
      buttonText: progress >= 100 ? "Concluido" : "Concluido com pendencias",
      buttonColor: progress >= 100 ? "#71717a" : "#F5A623",
      progressColor: progress >= 100 ? "#17C964" : "#F5A623",
    };
  }

  return {
    buttonText: "Acessar treinamento",
    buttonColor: "#006FEE",
    progressColor: "#006FEE",
  };
}
