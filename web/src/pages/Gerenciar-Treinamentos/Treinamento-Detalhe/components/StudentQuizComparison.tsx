import type { StudentTrainingAnalytics } from "../../mocks/trainingAnalytics";

type Props = {
  aluno: StudentTrainingAnalytics;
};

const getQuizRate = (
  aluno: StudentTrainingAnalytics,
  phase: "pre" | "post",
) => {
  const result = aluno.quizResults.find((quiz) => quiz.phase === phase);
  if (!result || result.totalQuestions === 0) {
    return {
      rate: 0,
      label: "0/0",
      title: phase === "pre" ? "Pre-teste" : "Pos-teste",
    };
  }

  return {
    rate: Math.round((result.correctAnswers / result.totalQuestions) * 100),
    label: `${result.correctAnswers}/${result.totalQuestions}`,
    title: result.title,
  };
};

export default function StudentQuizComparison({ aluno }: Props) {
  const pre = getQuizRate(aluno, "pre");
  const post = getQuizRate(aluno, "post");
  const gain = post.rate - pre.rate;

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="font-semibold text-neutral-900">
          Comparacao pre e pos-teste
        </h3>
        <p className="text-sm text-neutral-500">
          Ganho de conhecimento: {gain >= 0 ? "+" : ""}
          {gain} pontos percentuais
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700">{pre.title}</span>
            <span className="text-neutral-500">{pre.label}</span>
          </div>
          <div className="h-3 rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${pre.rate}%` }}
            />
          </div>
          <p className="mt-2 text-lg font-semibold text-blue-700">
            {pre.rate}%
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700">{post.title}</span>
            <span className="text-neutral-500">{post.label}</span>
          </div>
          <div className="h-3 rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${post.rate}%` }}
            />
          </div>
          <p className="mt-2 text-lg font-semibold text-green-700">
            {post.rate}%
          </p>
        </div>
      </div>
    </div>
  );
}
