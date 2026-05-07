import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StudentTrainingAnalytics } from "../../mocks/trainingAnalytics";

type Props = {
  students: StudentTrainingAnalytics[];
};

type QuizPhase = "pre" | "post";

const getQuizScore = (student: StudentTrainingAnalytics, phase: QuizPhase) => {
  const result = student.quizResults.find((quiz) => quiz.phase === phase);
  return result?.score ?? 0;
};

const getAverage = (values: number[]) => {
  if (values.length === 0) return 0;

  return values.reduce((total, value) => total + value, 0) / values.length;
};

const formatScore = (value: number) => value.toFixed(1);

export default function TrainingAnalyticsCharts({ students }: Props) {
  const chartData = students.map((student) => ({
    nome: student.nome.split(" ")[0],
    preTeste: getQuizScore(student, "pre"),
    posTeste: getQuizScore(student, "post"),
  }));

  const averagePreScore = getAverage(chartData.map((student) => student.preTeste));
  const averagePostScore = getAverage(chartData.map((student) => student.posTeste));
  const scoreGain = averagePostScore - averagePreScore;
  const gainPercentage = averagePreScore
    ? Math.round((scoreGain / averagePreScore) * 100)
    : 0;
  const radialValue = Math.min(Math.max((scoreGain / 10) * 100, 0), 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-primary">
            Notas gerais por avaliacao
          </h2>
          <p className="text-sm text-neutral-500">
            Comparacao das notas de pre-teste e pos-teste por aluno.
          </p>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-blue-50 p-4">
            <span className="text-sm text-neutral-500">Media pre-teste</span>
            <p className="mt-2 text-2xl font-bold text-blue-700">
              {formatScore(averagePreScore)}
            </p>
          </div>
          <div className="rounded-md bg-green-50 p-4">
            <span className="text-sm text-neutral-500">Media pos-teste</span>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {formatScore(averagePostScore)}
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nome" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)} pontos`, ""]}
                labelFormatter={(label) => `Aluno: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="preTeste"
                name="Pre-teste"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="posTeste"
                name="Pos-teste"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">
            Ganho geral de notas
          </h2>
          <p className="text-sm text-neutral-500">
            Evolucao media entre pre-teste e pos-teste.
          </p>
        </div>

        <div className="relative h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={[{ name: "Ganho", value: radialValue }]}
              innerRadius="72%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={16} background>
                <Cell fill="#006fee" />
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 top-24 text-center">
            <p className="text-sm text-neutral-500">Ganho medio</p>
            <p className="text-4xl font-bold text-primary">
              +{formatScore(scoreGain)}
            </p>
            <p className="text-sm font-medium text-green-700">
              +{gainPercentage}% sobre o pre-teste
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-md bg-neutral-50 p-4">
            <span className="text-sm font-medium text-neutral-600">Antes</span>
            <strong className="text-blue-700">{formatScore(averagePreScore)}</strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-neutral-50 p-4">
            <span className="text-sm font-medium text-neutral-600">Depois</span>
            <strong className="text-green-700">{formatScore(averagePostScore)}</strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-primary-50 p-4">
            <span className="text-sm font-medium text-neutral-600">Diferenca</span>
            <strong className="text-primary">+{formatScore(scoreGain)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
