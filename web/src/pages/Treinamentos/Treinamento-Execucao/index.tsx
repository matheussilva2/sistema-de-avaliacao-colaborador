import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { trainingsMock } from "../../../mock";
import {
  type AnsweredTrainingForm,
  getAnsweredForm,
  getFormById,
  getFormResult,
  getFormsByTrainingId,
  trainingFormTypeLabel,
} from "../../Gerenciar-Treinamentos/mocks/trainingForms";

const currentStudentId = 1;

export default function TreinamentoExecucao() {
  const { id, formId } = useParams();
  const navigate = useNavigate();
  const trainingId = Number(id);
  const training = trainingsMock.find((t) => t.id === trainingId);
  const form =
    (formId ? getFormById(formId) : undefined) ??
    getFormsByTrainingId(trainingId)[0];
  const answeredForm = form ? getAnsweredForm(form.id, currentStudentId) : undefined;
  const [mockSubmittedAnswer, setMockSubmittedAnswer] =
    useState<AnsweredTrainingForm | null>(null);
  const visibleAnswer = answeredForm ?? mockSubmittedAnswer ?? undefined;
  const isReadOnly = Boolean(visibleAnswer);
  const [answers, setAnswers] = useState<Record<string, string>>(
    visibleAnswer?.answers ?? {},
  );

  if (!training) return <div>Nenhum treinamento com esse id</div>;
  if (!form) return <div>Nenhum formulario disponivel para este treinamento</div>;

  const result = getFormResult(form, visibleAnswer);
  const allAnswered = form.questions.every((question) => answers[question.id]);

  const handleChange = (questionId: string, optionId: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedAnswer: AnsweredTrainingForm = {
      id: `answer-${form.id}-${currentStudentId}-mock`,
      trainingId,
      formId: form.id,
      studentId: currentStudentId,
      answers,
      answeredAt: new Date().toISOString().slice(0, 10),
    };

    console.log("RESPOSTAS DO FORMULARIO:", submittedAnswer);
    setMockSubmittedAnswer(submittedAnswer);
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
              {trainingFormTypeLabel[form.type]}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-primary">
              {form.title}
            </h1>
            <p className="mt-1 text-neutral-700">{training.title}</p>
          </div>

          {isReadOnly && (
            <div className="rounded-md bg-green-50 p-4 text-right">
              <p className="text-sm text-neutral-600">Resultado</p>
              <p className="font-bold text-green-700">
                {result.correctAnswers}/{result.totalQuestions} acertos
              </p>
              <p className="text-sm font-semibold text-green-700">
                {result.isApproved ? "Aprovado" : "Reprovado"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-primary-50 p-4">
            <p className="text-sm text-neutral-600">Inicio</p>
            <p className="font-bold text-neutral-900">{form.startDeadline}</p>
          </div>
          <div className="rounded-md bg-primary-50 p-4">
            <p className="text-sm text-neutral-600">Prazo final</p>
            <p className="font-bold text-neutral-900">{form.endDeadline}</p>
          </div>
          <div className="rounded-md bg-primary-50 p-4">
            <p className="text-sm text-neutral-600">Minimo</p>
            <p className="font-bold text-neutral-900">{form.minCorrect}%</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.questions.map((question, questionIndex) => (
          <Card key={question.id} className="p-6 border border-gray-200">
            <p className="font-semibold mb-4">
              {questionIndex + 1}. {question.title}
            </p>
            <div className="grid gap-3">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option.id;
                const showCorrection = isReadOnly;
                const isCorrectSelected = showCorrection && isSelected && option.isCorrect;
                const isWrongSelected = showCorrection && isSelected && !option.isCorrect;
                const showCorrectOption = showCorrection && option.isCorrect && !isSelected;

                return (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition ${
                      isCorrectSelected
                        ? "border-green-300 bg-green-50 text-green-800"
                        : isWrongSelected
                        ? "border-red-300 bg-red-50 text-red-800"
                        : showCorrectOption
                        ? "border-green-200 bg-white text-green-700"
                        : "border-gray-200 bg-white text-neutral-700 hover:border-primary"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={isSelected}
                        disabled={isReadOnly}
                        onChange={() => handleChange(question.id, option.id)}
                        className="h-4 w-4 text-primary accent-primary disabled:cursor-not-allowed"
                      />
                      <span className="text-sm">{option.text}</span>
                    </span>

                    {showCorrection && (
                      <strong className="text-xs">
                        {isCorrectSelected
                          ? "Sua resposta correta"
                          : isWrongSelected
                          ? "Sua resposta"
                          : showCorrectOption
                          ? "Alternativa correta"
                          : ""}
                      </strong>
                    )}
                  </label>
                );
              })}
            </div>
          </Card>
        ))}

        <div className="flex justify-end gap-3">
          <Button
            className="bg-neutral-300 text-neutral-800"
            onPress={() => navigate(`/painel/treinamentos/${trainingId}`)}
          >
            Voltar
          </Button>

          {!isReadOnly && (
            <Button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg"
              isDisabled={!allAnswered}
            >
              Enviar Respostas
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
