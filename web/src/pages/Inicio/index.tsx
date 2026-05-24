import { Card, Skeleton } from "@heroui/react";
import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthenticatedUser, type ApiUser } from "../../services/authService";
import {
  getTrainingForms,
  getTrainingUserResults,
  type ApiFormAnswer,
} from "../../services/formService";
import { getTrashedFormIds } from "../../services/formTrashService";
import { getUserTrainings } from "../../services/userService";
import {
  sortTrainingsStable,
  type ApiTraining,
} from "../../services/trainingService";

const recentTrainingsKeyPrefix = "recentTrainings";
const hiddenStudentTrainingsKey = "hiddenStudentTrainings";

export default function Inicio() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [trainings, setTrainings] = useState<ApiTraining[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<Record<string, TrainingProgress>>({});
  const [recentTrainingIds, setRecentTrainingIds] = useState<string[]>([]);
  const [hiddenTrainingIds, setHiddenTrainingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadHome() {
      const authenticatedUser = getAuthenticatedUser();

      if (!authenticatedUser) {
        setErrorMessage("Faca login para visualizar seu resumo.");
        setIsLoading(false);
        return;
      }

      setUser(authenticatedUser);
      setRecentTrainingIds(getRecentTrainingIds(authenticatedUser.id));
      setHiddenTrainingIds(getHiddenTrainingIds());

      try {
        const userTrainings = await getUserTrainings(authenticatedUser.id);
        const sortedTrainings = sortTrainingsStable(userTrainings);
        setTrainings(sortedTrainings);

        const progressEntries = await Promise.all(
          sortedTrainings.map(async (training) => {
            const progress = await loadTrainingProgress(
              training.idTraining,
              authenticatedUser.id,
            );

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

    loadHome();
  }, []);

  const visibleTrainings = useMemo(
    () =>
      trainings.filter(
        (training) => !hiddenTrainingIds.includes(training.idTraining),
      ),
    [hiddenTrainingIds, trainings],
  );

  const inProgressTrainings = useMemo(
    () => visibleTrainings.filter((training) => !isTrainingConcluded(training.endDate)),
    [visibleTrainings],
  );

  const concludedTrainings = useMemo(
    () => visibleTrainings.filter((training) => isTrainingConcluded(training.endDate)),
    [visibleTrainings],
  );

  const recentTrainings = useMemo(() => {
    const trainingById = new Map(
      visibleTrainings.map((training) => [training.idTraining, training]),
    );

    return recentTrainingIds
      .map((trainingId) => trainingById.get(trainingId))
      .filter((training): training is ApiTraining => Boolean(training))
      .slice(0, 3);
  }, [recentTrainingIds, visibleTrainings]);

  return (
    <div className="p-8 bg-neutral-50 min-h-screen flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ola, {user?.name ?? "Colaborador"}
        </h1>
        <p className="text-gray-600 text-sm">
          Aqui esta um resumo dos seus treinamentos.
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <InicioSkeleton />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <SummaryCard
              title="Treinamentos em andamento"
              value={inProgressTrainings.length}
              onClick={() =>
                navigate("/painel/treinamentos?status=em_andamento")
              }
            />
            <SummaryCard
              title="Treinamentos concluídos"
              value={concludedTrainings.length}
              onClick={() => navigate("/painel/treinamentos?status=concluido")}
            />
          </div>

          <TrainingSection
            title="Treinamentos recentes"
            emptyMessage="Nenhum treinamento acessado recentemente."
            trainings={recentTrainings}
            trainingProgress={trainingProgress}
          />

          <TrainingSection
            title="Treinamentos em andamento"
            emptyMessage="Nenhum treinamento em andamento."
            trainings={inProgressTrainings}
            trainingProgress={trainingProgress}
          />
        </>
      )}
    </div>
  );
}

function InicioSkeleton() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((item) => (
          <Card key={item} className="overflow-hidden">
            <Skeleton className="h-14 rounded-md" />
            <div className="bg-primary-50 p-8">
              <Skeleton className="mx-auto h-9 w-16 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {[1, 2].map((section) => (
        <Card key={section} className="overflow-hidden">
          <Skeleton className="h-14 rounded-md" />

          <div className="bg-primary-50 p-6 flex flex-col gap-4">
            {[1, 2].map((item) => (
              <div key={item} className="bg-white rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <Skeleton className="h-5 w-52 rounded-md" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>

                <Skeleton className="h-4 w-36 rounded-md" />

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-36 rounded-md" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </>
  );
}

function SummaryCard({
  title,
  value,
  onClick,
}: {
  title: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="overflow-hidden transition hover:shadow-lg">
        <div className="bg-primary p-4 rounded-md">
          <span className="text-white text-sm font-semibold">
            {title}
          </span>
        </div>
        <div className="bg-primary-50 p-8 text-center">
          <span className="text-3xl font-bold">{value}</span>
        </div>
      </Card>
    </button>
  );
}

function TrainingSection({
  title,
  emptyMessage,
  trainings,
  trainingProgress,
}: {
  title: string;
  emptyMessage: string;
  trainings: ApiTraining[];
  trainingProgress: Record<string, TrainingProgress>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary p-4 rounded-md">
        <span className="text-white font-semibold">{title}</span>
      </div>

      <div className="bg-primary-50 p-6 flex flex-col gap-4">
        {trainings.map((training) => (
          <TrainingRow
            key={training.idTraining}
            training={training}
            progressInfo={
              trainingProgress[training.idTraining] ?? emptyTrainingProgress
            }
          />
        ))}

        {trainings.length === 0 && (
          <span className="text-gray-500 text-sm">{emptyMessage}</span>
        )}
      </div>
    </Card>
  );
}

function TrainingRow({
  training,
  progressInfo,
}: {
  training: ApiTraining;
  progressInfo: TrainingProgress;
}) {
  const navigate = useNavigate();
  const isConcluded = isTrainingConcluded(training.endDate);
  const daysRemaining = getDaysRemaining(training.endDate);

  return (
    <button
      type="button"
      onClick={() => navigate(`/painel/treinamentos/${training.idTraining}`)}
      className="bg-white rounded-lg p-4 flex flex-col gap-3 text-left hover:bg-primary-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-semibold">{training.title}</span>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
          {isConcluded ? "Concluído" : "Em andamento"}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
        <span className="flex items-center gap-2">
          <CalendarDays size={16} />
          {isConcluded ? "Finalizado" : `${daysRemaining} dias restantes`}
        </span>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-neutral-700">
            Progresso: {progressInfo.progress}%
          </span>
          <span className="text-xs font-semibold text-neutral-500">
            {progressInfo.answeredForms}/{progressInfo.totalForms} forms respondidos
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressInfo.progress}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function getRecentTrainingIds(userId: string) {
  const storedRecentTrainings = localStorage.getItem(`${recentTrainingsKeyPrefix}:${userId}`);

  if (!storedRecentTrainings) {
    return [];
  }

  try {
    return JSON.parse(storedRecentTrainings) as string[];
  } catch {
    return [];
  }
}

function getHiddenTrainingIds() {
  const storedHiddenTrainings = localStorage.getItem(hiddenStudentTrainingsKey);

  if (!storedHiddenTrainings) {
    return [];
  }

  try {
    return JSON.parse(storedHiddenTrainings) as string[];
  } catch {
    localStorage.removeItem(hiddenStudentTrainingsKey);
    return [];
  }
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

const emptyTrainingProgress: TrainingProgress = {
  totalForms: 0,
  answeredForms: 0,
  pendingForms: 0,
  progress: 0,
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
  const answeredForms = forms.filter((form) =>
    answeredFormIds.has(form.idForm),
  ).length;
  const pendingForms = Math.max(totalForms - answeredForms, 0);
  const progress =
    totalForms > 0 ? Math.round((answeredForms / totalForms) * 100) : 0;

  return {
    totalForms,
    answeredForms,
    pendingForms,
    progress,
  };
}

function getDaysRemaining(endDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trainingEndDate = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(trainingEndDate.getTime())) {
    return 0;
  }

  return Math.max(
    Math.ceil((trainingEndDate.getTime() - today.getTime()) / 86400000),
    0,
  );
}
