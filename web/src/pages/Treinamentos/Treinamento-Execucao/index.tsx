import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { getTrainingById, type ApiTraining } from "../../../services/trainingService";
import { getAuthenticatedUser } from "../../../services/authService";
import {
  createFormAnswer,
  getFormUserAnswers,
  getFormWithQuestions,
  type ApiFormAnswer,
  type ApiFormType,
  type ApiFormWithQuestions,
} from "../../../services/formService";

export default function TreinamentoExecucao() {
  const { id, formId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [form, setForm] = useState<ApiFormWithQuestions | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<ApiFormAnswer | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadForm() {
      if (!id || !formId) {
        setErrorMessage("Formulario nao informado.");
        setIsLoading(false);
        return;
      }

      const currentUser = getAuthenticatedUser();

      if (!currentUser) {
        setErrorMessage("Usuario nao autenticado.");
        setIsLoading(false);
        return;
      }

      try {
        const formData = await getFormWithQuestions(formId);

        let answer: ApiFormAnswer | null = null;
        let trainingData: ApiTraining | null = null;

        try {
          trainingData = await getTrainingById(id);
        } catch {
          trainingData = null;
        }

        try {
          const userAnswers = await getFormUserAnswers(formId, currentUser.id);
          answer = userAnswers.at(-1) ?? null;
        } catch {
          answer = null;
        }

        setTraining(trainingData);
        setForm(formData);
        setSubmittedAnswer(answer);

        if (answer) {
          const selectedAnswers = answer.questionAnswers.reduce<Record<string, string>>(
            (acc, questionAnswer) => {
              acc[questionAnswer.question.idQuestion] =
                questionAnswer.selectedAlternative.idAlternative;
              return acc;
            },
            {},
          );

          setAnswers(selectedAnswers);
        }
      } catch {
        setErrorMessage("Nao foi possivel carregar o formulario.");
      } finally {
        setIsLoading(false);
      }
    }

    loadForm();
  }, [formId, id]);

  const isReadOnly = Boolean(submittedAnswer);

  const allAnswered = useMemo(
    () => Boolean(form?.questions.every((question) => answers[question.idQuestion])),
    [answers, form],
  );

  const handleChange = (questionId: string, optionId: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form) return;

    const currentUser = getAuthenticatedUser();

    if (!currentUser) {
      setErrorMessage("Usuario nao autenticado.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const savedAnswer = await createFormAnswer(form.idForm, currentUser.id, {
        answers: form.questions.map((question) => ({
          questionId: question.idQuestion,
          alternativeId: answers[question.idQuestion],
        })),
      });

      setSubmittedAnswer(savedAnswer);
    } catch {
      setErrorMessage("Nao foi possivel enviar as respostas.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-neutral-600">Carregando formulario...</div>;
  if (!form) return <div className="p-8 text-red-700">{errorMessage || "Formulario nao encontrado."}</div>;

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
              {formTypeLabel(form.formType)}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-primary">
              {form.title}
            </h1>
            <p className="mt-1 text-neutral-700">
              {training?.title ?? "Treinamento"}
            </p>
          </div>

          {submittedAnswer && (
            <div
              className={`rounded-md p-4 text-right ${
                submittedAnswer.approved ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="text-sm text-neutral-600">Resultado</p>
              <p
                className={`font-bold ${
                  submittedAnswer.approved ? "text-green-700" : "text-red-700"
                }`}
              >
                {submittedAnswer.correctAnswers}/{submittedAnswer.totalQuestions} acertos
              </p>
              <p
                className={`text-sm font-semibold ${
                  submittedAnswer.approved ? "text-green-700" : "text-red-700"
                }`}
              >
                {submittedAnswer.approved ? "Aprovado" : "Reprovado"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-primary-50 p-4">
            <p className="text-sm text-neutral-600">Inicio</p>
            <p className="font-bold text-neutral-900">{form.initDate}</p>
          </div>
          <div className="rounded-md bg-primary-50 p-4">
            <p className="text-sm text-neutral-600">Prazo final</p>
            <p className="font-bold text-neutral-900">{form.endDate}</p>
          </div>
          <div className="rounded-md bg-primary-50 p-4">
            <p className="text-sm text-neutral-600">Minimo</p>
            <p className="font-bold text-neutral-900">{form.minCorrectPercentage}%</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.questions.map((question, questionIndex) => (
          <Card key={question.idQuestion} className="p-6 border border-gray-200">
            <p className="font-semibold mb-4">
              {questionIndex + 1}. {question.title}
            </p>
            <div className="grid gap-3">
              {question.alternatives.map((option) => {
                const isSelected = answers[question.idQuestion] === option.idAlternative;
                const showCorrection = isReadOnly;
                const isCorrectSelected = showCorrection && isSelected && option.correct;
                const isWrongSelected = showCorrection && isSelected && !option.correct;
                const showCorrectOption = showCorrection && option.correct && !isSelected;

                return (
                  <label
                    key={option.idAlternative}
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
                        name={`question-${question.idQuestion}`}
                        checked={isSelected}
                        disabled={isReadOnly}
                        onChange={() =>
                          handleChange(question.idQuestion, option.idAlternative)
                        }
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

        {form.questions.length === 0 && (
          <Card className="p-6 border border-dashed border-primary-200">
            <p className="font-semibold text-primary">Formulario sem perguntas</p>
            <p className="mt-1 text-sm text-neutral-600">
              O gestor ainda nao adicionou perguntas para este formulario.
            </p>
          </Card>
        )}

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            className="bg-neutral-300 text-neutral-800"
            onPress={() => navigate(`/painel/treinamentos/${id}`)}
          >
            Voltar
          </Button>

          {!isReadOnly && form.questions.length > 0 && (
            <Button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg"
              isDisabled={!allAnswered || isSaving}
            >
              {isSaving ? "Enviando..." : "Enviar Respostas"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function formTypeLabel(type: ApiFormType) {
  return type === "PRE_TEST" ? "Pre-teste" : "Pos-teste";
}
