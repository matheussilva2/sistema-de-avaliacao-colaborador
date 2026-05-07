import { useState } from "react";
import { Button } from "@heroui/react";
import type { StudentTrainingAnalytics } from "./mocks/trainingAnalytics";
import StudentQuizComparison from "./Treinamento-Detalhe/components/StudentQuizComparison";

type Props = {
  aluno: StudentTrainingAnalytics;
};

export default function AlunoCollapsible({ aluno }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [comentarios, setComentarios] = useState(aluno.comentarios);

  const statusLabel = aluno.status.replace("_", " ");

  const statusClasses = {
    concluido: "bg-green-100 text-green-700",
    em_andamento: "bg-yellow-100 text-yellow-700",
    nao_iniciado: "bg-gray-200 text-gray-700",
    incompleto: "bg-red-100 text-red-700",
  } as const;

  const statusClass = statusClasses[aluno.status as keyof typeof statusClasses] || "bg-gray-200 text-gray-700";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {aluno.foto ? (
            <img
              src={aluno.foto}
              alt={aluno.nome}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary" />
          )}
          <div>
            <p className="font-semibold text-neutral-900">{aluno.nome}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
              <span className={`rounded-full px-2 py-1 ${statusClass}`}>{statusLabel}</span>
              <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">
                {aluno.progress}%
              </span>
            </div>
          </div>
        </div>

        <Button
          className="bg-primary text-white"
          size="sm"
          onPress={() => setIsOpen((current) => !current)}
        >
          {isOpen ? "Ver menos" : "Ver mais"}
        </Button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 bg-neutral-50 p-4">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">Progresso</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">{aluno.progress}%</p>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${aluno.progress}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">Nota média</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {aluno.notaMedia.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">Última atividade</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">{aluno.ultimaAtividade}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">Tarefas concluídas</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {aluno.tarefasConcluidas}/{aluno.totalTarefas}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <label className="text-sm text-neutral-500 block mb-2">
                Comentários do aluno
              </label>
              <textarea
                value={comentarios}
                onChange={(event) => setComentarios(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-neutral-50 p-3 text-sm text-neutral-900 focus:border-primary focus:outline-none"
                rows={4}
              />
            </div>
          </div>

          <div className="mt-4">
            <StudentQuizComparison aluno={aluno} />
          </div>
        </div>
      )}
    </div>
  );
}
