import { Button, Card, Skeleton } from "@heroui/react";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  FilePenLine,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAuthenticatedUser,
  isManagerOrAdmin,
  type ApiUser,
} from "../../../services/authService";
import {
  getFormResults,
  getTrainingForms,
  type ApiForm,
  type ApiFormAnswer,
} from "../../../services/formService";
import {
  getTrainingById,
  getTrainingUsers,
  type ApiTraining,
} from "../../../services/trainingService";
import { formatDateTimeForDisplay } from "../../../utils/dateUtils";

type FilterOption = "todos" | "respondidos" | "nao_respondidos" | "aprovados" | "reprovados";
type SortOption = "maior_nota" | "menor_nota" | "nome" | "data_resposta";

type PerformanceRow = {
  user: ApiUser;
  fullName: string;
  latestAnswer: ApiFormAnswer | null;
  score: number | null;
  approved: boolean | null;
  answeredAt: string | null;
};

type DashboardStats = {
  totalLinked: number;
  answeredCount: number;
  notAnsweredCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  participationRate: number;
  approvedCount: number;
  failedCount: number;
};

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "respondidos", label: "Respondidos" },
  { value: "nao_respondidos", label: "Nao respondidos" },
  { value: "aprovados", label: "Aprovados" },
  { value: "reprovados", label: "Reprovados" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "maior_nota", label: "Maior nota" },
  { value: "menor_nota", label: "Menor nota" },
  { value: "nome", label: "Nome" },
  { value: "data_resposta", label: "Data de resposta" },
];

const PARTICIPATION_COLORS = ["#16a34a", "#dc2626"];

export default function AcompanhamentoFormulario() {
  const navigate = useNavigate();
  const { id: trainingId, formId } = useParams();
  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [form, setForm] = useState<ApiForm | null>(null);
  const [linkedUsers, setLinkedUsers] = useState<ApiUser[]>([]);
  const [formAnswers, setFormAnswers] = useState<ApiFormAnswer[]>([]);
  const [filter, setFilter] = useState<FilterOption>("todos");
  const [sortOption, setSortOption] = useState<SortOption>("maior_nota");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      if (!trainingId || !formId) {
        setErrorMessage("Formulario nao encontrado.");
        setIsLoading(false);
        return;
      }

      const authenticatedUser = getAuthenticatedUser();

      if (!isManagerOrAdmin(authenticatedUser)) {
        setErrorMessage("Acesso permitido apenas para gestores e administradores.");
        setIsLoading(false);
        return;
      }

      try {
        const [trainingData, trainingUsers, trainingForms, answers] = await Promise.all([
          getTrainingById(trainingId),
          getTrainingUsers(trainingId),
          getTrainingForms(trainingId),
          getFormResults(formId).catch(() => []),
        ]);
        const selectedForm = trainingForms.find((item) => item.idForm === formId);

        if (!selectedForm) {
          if (isCurrent) {
            setTraining(trainingData);
            setErrorMessage("Formulario nao pertence a este treinamento.");
          }
          return;
        }

        if (isCurrent) {
          setTraining(trainingData);
          setLinkedUsers(trainingUsers);
          setForm(selectedForm);
          setFormAnswers(answers);
          setErrorMessage("");
        }
      } catch {
        if (isCurrent) {
          setErrorMessage("Nao foi possivel carregar o acompanhamento deste formulario.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isCurrent = false;
    };
  }, [formId, trainingId]);

  const rows = useMemo(
    () => buildPerformanceRows(linkedUsers, formAnswers),
    [formAnswers, linkedUsers],
  );
  const stats = useMemo(() => buildStats(rows), [rows]);
  const filteredRows = useMemo(
    () => sortRows(filterRows(rows, filter), sortOption),
    [filter, rows, sortOption],
  );
  const participationData = useMemo(
    () => [
      { name: "Respondidos", value: stats.answeredCount },
      { name: "Nao respondidos", value: stats.notAnsweredCount },
    ],
    [stats.answeredCount, stats.notAnsweredCount],
  );
  const scoreDistribution = useMemo(() => buildScoreDistribution(rows), [rows]);

  if (isLoading) {
    return <AcompanhamentoSkeleton />;
  }

  if (!training || !form) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <Card className="p-6">
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage || "Formulario nao encontrado."}
          </p>
          <Button
            className="mt-4 bg-white text-primary border border-primary"
            onPress={() => navigate("/painel/gerenciar-treinamentos")}
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                {getFormTypeLabel(form.formType)}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-primary">
                Acompanhamento de desempenho
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {form.title} - {training.title}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-600">
                <span className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2">
                  <CalendarClock size={16} />
                  {formatDateTimeForDisplay(form.initDate, form.initTime, "00:00")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2">
                  <CalendarClock size={16} />
                  {formatDateTimeForDisplay(form.endDate, form.endTime, "23:59")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-white text-primary border border-primary"
                onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}`)}
              >
                <ArrowLeft size={16} />
                Voltar ao treinamento
              </Button>
              <Button
                className="bg-primary text-white"
                onPress={() =>
                  navigate(
                    `/painel/gerenciar-treinamentos/${training.idTraining}/formularios?formId=${form.idForm}`,
                  )
                }
              >
                <FilePenLine size={16} />
                Editar formulario
              </Button>
            </div>
          </div>
        </Card>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Colaboradores vinculados"
            value={stats.totalLinked}
            helper="Total no treinamento"
            icon={<Users size={20} />}
            tone="blue"
          />
          <StatCard
            label="Responderam"
            value={stats.answeredCount}
            helper={`${stats.notAnsweredCount} sem resposta`}
            icon={<CheckCircle2 size={20} />}
            tone="green"
          />
          <StatCard
            label="Media geral"
            value={formatNullableScore(stats.averageScore)}
            helper="Notas de 0 a 10"
            icon={<BarChart3 size={20} />}
            tone="violet"
          />
          <StatCard
            label="Participacao"
            value={`${stats.participationRate}%`}
            helper="Respondidos / vinculados"
            icon={<Trophy size={20} />}
            tone="amber"
          />
          <StatCard
            label="Nao responderam"
            value={stats.notAnsweredCount}
            helper="Pendencias abertas"
            icon={<XCircle size={20} />}
            tone="red"
          />
          <StatCard
            label="Maior nota"
            value={formatNullableScore(stats.highestScore)}
            helper="Melhor desempenho"
            icon={<Trophy size={20} />}
            tone="green"
          />
          <StatCard
            label="Menor nota"
            value={formatNullableScore(stats.lowestScore)}
            helper="Entre respondidos"
            icon={<BarChart3 size={20} />}
            tone="red"
          />
          <StatCard
            label="Aprovados"
            value={stats.approvedCount}
            helper={`${stats.failedCount} reprovado(s)`}
            icon={<CheckCircle2 size={20} />}
            tone="green"
          />
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="min-w-0 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">Participacao</h2>
                <p className="text-sm text-neutral-500">
                  {stats.answeredCount} de {stats.totalLinked} colaboradores
                </p>
              </div>
              <span className="rounded-md bg-primary-50 px-3 py-2 text-sm font-bold text-primary">
                {stats.participationRate}%
              </span>
            </div>

            <div className="h-72 min-w-0">
              {stats.totalLinked > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={participationData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {participationData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PARTICIPATION_COLORS[index % PARTICIPATION_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${Number(value)} colaborador(es)`, ""]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartMessage message="Nenhum colaborador vinculado." />
              )}
            </div>
          </Card>

          <Card className="min-w-0 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-primary">Distribuicao de notas</h2>
              <p className="text-sm text-neutral-500">
                Faixas calculadas com as respostas mais recentes.
              </p>
            </div>

            <div className="h-72 min-w-0">
              {stats.answeredCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={scoreDistribution}
                    margin={{ top: 12, right: 12, left: -16, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) => [`${Number(value)} colaborador(es)`, ""]}
                    />
                    <Bar
                      dataKey="quantidade"
                      name="Colaboradores"
                      fill="#006FEE"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartMessage message="Nenhuma resposta registrada." />
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Colaboradores
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredRows.length} registro(s) exibido(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap rounded-md border border-neutral-200 bg-white p-1">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      filter === option.value
                        ? "bg-primary text-white"
                        : "text-neutral-600 hover:bg-primary-50 hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                Ordenar
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs uppercase text-neutral-500">
                  <th className="border-b border-neutral-200 px-4 py-3">Colaborador</th>
                  <th className="border-b border-neutral-200 px-4 py-3">Status</th>
                  <th className="border-b border-neutral-200 px-4 py-3">Nota</th>
                  <th className="border-b border-neutral-200 px-4 py-3">Resultado</th>
                  <th className="border-b border-neutral-200 px-4 py-3">Data de resposta</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.user.id} className="bg-white">
                    <td className="border-b border-neutral-100 px-4 py-4">
                      <div className="flex items-center gap-3">
                        {row.user.profilePhoto ? (
                          <img
                            src={row.user.profilePhoto}
                            alt={row.fullName}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary">
                            {getInitials(row.user)}
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-neutral-900">{row.fullName}</p>
                          <p className="text-sm text-neutral-500">{row.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-neutral-100 px-4 py-4">
                      <span className={getStatusClassName(Boolean(row.latestAnswer))}>
                        {row.latestAnswer ? "Respondido" : "Nao respondido"}
                      </span>
                    </td>
                    <td className="border-b border-neutral-100 px-4 py-4 font-semibold text-neutral-900">
                      {formatNullableScore(row.score)}
                    </td>
                    <td className="border-b border-neutral-100 px-4 py-4">
                      <span className={getResultClassName(row.approved)}>
                        {formatResult(row.approved)}
                      </span>
                    </td>
                    <td className="border-b border-neutral-100 px-4 py-4 text-sm text-neutral-600">
                      {formatAnsweredAt(row.answeredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 && (
            <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-600">
              Nenhum colaborador encontrado para este filtro.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function buildPerformanceRows(users: ApiUser[], answers: ApiFormAnswer[]): PerformanceRow[] {
  const latestAnswerByUser = answers.reduce<Record<string, ApiFormAnswer>>((acc, answer) => {
    const userId = answer.user?.id;

    if (!userId) {
      return acc;
    }

    const currentAnswer = acc[userId];

    if (!currentAnswer || getAnswerTime(answer.answeredAt) > getAnswerTime(currentAnswer.answeredAt)) {
      acc[userId] = answer;
    }

    return acc;
  }, {});

  return users.map((user) => {
    const latestAnswer = latestAnswerByUser[user.id] ?? null;
    const fullName = `${user.name} ${user.lastName}`.trim();

    return {
      user,
      fullName,
      latestAnswer,
      score: latestAnswer ? latestAnswer.scorePercentage / 10 : null,
      approved: latestAnswer ? latestAnswer.approved : null,
      answeredAt: latestAnswer?.answeredAt ?? null,
    };
  });
}

function buildStats(rows: PerformanceRow[]): DashboardStats {
  const answeredRows = rows.filter((row) => row.latestAnswer);
  const scores = answeredRows
    .map((row) => row.score)
    .filter((score): score is number => score !== null);
  const scoreSum = scores.reduce((total, score) => total + score, 0);
  const totalLinked = rows.length;
  const answeredCount = answeredRows.length;

  return {
    totalLinked,
    answeredCount,
    notAnsweredCount: totalLinked - answeredCount,
    averageScore: scores.length > 0 ? scoreSum / scores.length : null,
    highestScore: scores.length > 0 ? Math.max(...scores) : null,
    lowestScore: scores.length > 0 ? Math.min(...scores) : null,
    participationRate: totalLinked > 0 ? Math.round((answeredCount / totalLinked) * 100) : 0,
    approvedCount: rows.filter((row) => row.approved === true).length,
    failedCount: rows.filter((row) => row.approved === false).length,
  };
}

function filterRows(rows: PerformanceRow[], filter: FilterOption) {
  if (filter === "respondidos") {
    return rows.filter((row) => row.latestAnswer);
  }

  if (filter === "nao_respondidos") {
    return rows.filter((row) => !row.latestAnswer);
  }

  if (filter === "aprovados") {
    return rows.filter((row) => row.approved === true);
  }

  if (filter === "reprovados") {
    return rows.filter((row) => row.approved === false);
  }

  return rows;
}

function sortRows(rows: PerformanceRow[], sortOption: SortOption) {
  return [...rows].sort((current, next) => {
    if (sortOption === "nome") {
      return compareByName(current, next);
    }

    if (sortOption === "data_resposta") {
      return compareByAnswerDate(current, next);
    }

    if (sortOption === "menor_nota") {
      return compareByScore(current, next, "asc");
    }

    return compareByScore(current, next, "desc");
  });
}

function compareByName(current: PerformanceRow, next: PerformanceRow) {
  return current.fullName.localeCompare(next.fullName, "pt-BR");
}

function compareByAnswerDate(current: PerformanceRow, next: PerformanceRow) {
  const currentTime = getAnswerTime(current.answeredAt);
  const nextTime = getAnswerTime(next.answeredAt);

  if (currentTime === nextTime) {
    return compareByName(current, next);
  }

  if (currentTime === 0) {
    return 1;
  }

  if (nextTime === 0) {
    return -1;
  }

  return nextTime - currentTime;
}

function compareByScore(
  current: PerformanceRow,
  next: PerformanceRow,
  direction: "asc" | "desc",
) {
  if (current.score === null && next.score === null) {
    return compareByName(current, next);
  }

  if (current.score === null) {
    return 1;
  }

  if (next.score === null) {
    return -1;
  }

  const scoreDiff =
    direction === "asc" ? current.score - next.score : next.score - current.score;

  return scoreDiff || compareByName(current, next);
}

function buildScoreDistribution(rows: PerformanceRow[]) {
  const ranges = [
    { label: "0-2", min: 0, max: 2, quantidade: 0 },
    { label: "2-4", min: 2, max: 4, quantidade: 0 },
    { label: "4-6", min: 4, max: 6, quantidade: 0 },
    { label: "6-8", min: 6, max: 8, quantidade: 0 },
    { label: "8-10", min: 8, max: 10, quantidade: 0 },
  ];

  rows.forEach((row) => {
    const score = row.score;

    if (score === null) {
      return;
    }

    const range =
      ranges.find((item) =>
        score === 10
          ? item.max === 10
          : score >= item.min && score < item.max,
      ) ?? ranges[0];

    range.quantidade += 1;
  });

  return ranges.map(({ label, quantidade }) => ({ label, quantidade }));
}

function getAnswerTime(value?: string | null) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
}

function formatNullableScore(value: number | null) {
  return value === null ? "-" : value.toFixed(1);
}

function formatAnsweredAt(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getFormTypeLabel(type: ApiForm["formType"]) {
  return type === "PRE_TEST" ? "Pre-teste" : "Pos-teste";
}

function getInitials(user: ApiUser) {
  const firstInitial = user.name.trim().charAt(0);
  const lastInitial = user.lastName.trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
}

function getStatusClassName(answered: boolean) {
  return answered
    ? "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
    : "inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700";
}

function getResultClassName(approved: boolean | null) {
  if (approved === true) {
    return "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700";
  }

  if (approved === false) {
    return "inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700";
  }

  return "inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600";
}

function formatResult(approved: boolean | null) {
  if (approved === true) {
    return "Aprovado";
  }

  if (approved === false) {
    return "Reprovado";
  }

  return "-";
}

function StatCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  helper: string;
  icon: ReactNode;
  tone: "amber" | "blue" | "green" | "red" | "violet";
}) {
  const toneClassName = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    violet: "bg-violet-50 text-violet-700",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-neutral-500">{helper}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-md ${toneClassName}`}>
          {icon}
        </span>
      </div>
    </Card>
  );
}

function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-600">
      {message}
    </div>
  );
}

function AcompanhamentoSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="mt-3 h-8 w-80 rounded-md" />
              <Skeleton className="mt-2 h-4 w-96 max-w-full rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-44 rounded-md" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Skeleton key={item} className="h-32 w-full rounded-md" />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Skeleton className="h-96 w-full rounded-md" />
          <Skeleton className="h-96 w-full rounded-md" />
        </div>

        <Skeleton className="h-96 w-full rounded-md" />
      </div>
    </div>
  );
}
