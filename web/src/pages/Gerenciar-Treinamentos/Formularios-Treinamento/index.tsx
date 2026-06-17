import { useEffect, useState } from "react";
import { Button, Card, Input, Skeleton } from "@heroui/react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TestFormSection } from "../Novo-Treinamento/components/TestFormSection";
import type { Question, TestType } from "../Novo-Treinamento/types";
import {
  createFormQuestion,
  createQuestionAlternative,
  createTrainingForm,
  deleteAlternative,
  deleteQuestion,
  deleteTrainingForm,
  getFormQuestions,
  getQuestionAlternatives,
  getTrainingResults,
  getTrainingForms,
  updateTrainingForm,
  type ApiForm,
  type ApiFormType,
} from "../../../services/formService";
import { getTrainingById, type ApiTraining } from "../../../services/trainingService";
import {
  moveFormToTrash,
  removeFormFromTrash,
  restoreFormFromTrash,
} from "../../../services/formTrashService";
import { useUndoableDelete } from "../../../components/UndoDeleteProvider";
import {
  DATE_INPUT_PLACEHOLDER,
  formatDateForDisplay,
  formatDateInput,
  isCompleteDateValue,
  parseDateValue,
} from "../../../utils/dateUtils";

type ManagedTrainingForm = {
  id: string;
  persistedId?: string;
  trainingId: string;
  title: string;
  type: TestType;
  startDeadline: string;
  endDeadline: string;
  minCorrect: string;
  questions: Question[];
};

const trainingFormTypeLabel: Record<TestType, string> = {
  "pre-teste": "Pre-teste",
  "pos-teste": "Pos-teste",
};

const createEmptyQuestion = (): Question => ({
  id: crypto.randomUUID(),
  title: "",
  options: [{ id: crypto.randomUUID(), text: "", isCorrect: false }],
});

const createEmptyForm = (
  trainingId: string,
  type: TestType = "pre-teste",
): ManagedTrainingForm => ({
  id: crypto.randomUUID(),
  trainingId,
  title: "",
  type,
  startDeadline: "",
  endDeadline: "",
  minCorrect: "70",
  questions: [],
});

type LocationState = {
  trainingDraft?: {
    id: string;
    title: string;
  };
};

export default function FormulariosTreinamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState | null;
  const trainingId = id ?? state?.trainingDraft?.id ?? "";
  const defaultType = (searchParams.get("tipo") as TestType | null) ?? "pre-teste";
  const selectedFormId = searchParams.get("formId");

  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [forms, setForms] = useState<ManagedTrainingForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLockedByAnswers, setIsLockedByAnswers] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { scheduleUndoableDelete } = useUndoableDelete();

  useEffect(() => {
    async function loadForms() {
      if (!trainingId) {
        setForms([createEmptyForm(crypto.randomUUID(), defaultType)]);
        setIsLoading(false);
        return;
      }

      try {
        const [trainingData, apiForms] = await Promise.all([
          getTrainingById(trainingId),
          getTrainingForms(trainingId),
        ]);

        setTraining(trainingData);

        const hydratedForms = await Promise.all(
          apiForms.map((form) => hydrateForm(trainingId, form)),
        );

        const selectedForm = selectedFormId
          ? hydratedForms.find((form) => form.persistedId === selectedFormId)
          : null;

        setForms([selectedForm ?? createEmptyForm(trainingId, defaultType)]);

        if (selectedForm?.persistedId) {
          const trainingResults = await getTrainingResults(trainingId).catch(() => []);
          setIsLockedByAnswers(
            trainingResults.some((answer) => answer.form.idForm === selectedForm.persistedId),
          );
        } else {
          setIsLockedByAnswers(false);
        }
      } catch {
        setErrorMessage("Nao foi possivel carregar os formularios deste treinamento.");
        setForms([createEmptyForm(trainingId || crypto.randomUUID(), defaultType)]);
      } finally {
        setIsLoading(false);
      }
    }

    loadForms();
  }, [defaultType, selectedFormId, trainingId]);

  const title = training?.title ?? state?.trainingDraft?.title ?? "Novo treinamento";

  const updateForm = (
    formId: string,
    field: keyof Omit<ManagedTrainingForm, "id" | "trainingId" | "questions">,
    value: string,
  ) => {
    if (isLockedByAnswers) {
      return;
    }

    const nextValue =
      field === "startDeadline" || field === "endDeadline"
        ? formatDateInput(value)
        : value;

    setForms((prev) =>
      prev.map((form) => (form.id === formId ? { ...form, [field]: nextValue } : form)),
    );
  };

  const removeForm = async (formId: string) => {
    const form = forms.find((item) => item.id === formId);

    if (!form?.persistedId || !trainingId) {
      return;
    }

    try {
      const trainingResults = await getTrainingResults(trainingId).catch(() => []);
      const hasAnswers = trainingResults.some(
        (answer) => answer.form.idForm === form.persistedId,
      );

      if (hasAnswers) {
        setErrorMessage("Formulario ja tem respostas cadastradas.");
        setSuccessMessage("");
        return;
      }
    } catch {
      setErrorMessage("Nao foi possivel verificar respostas cadastradas.");
      setSuccessMessage("");
      return;
    }

    const apiForm = mapManagedFormToApiForm(form);

    scheduleUndoableDelete({
      id: `form:${apiForm.idForm}`,
      title: "Formulario removido",
      description: `${apiForm.title} sera excluido definitivamente em 5 segundos.`,
      onStart: () => {
        moveFormToTrash(trainingId, apiForm);
        setForms((prev) => prev.filter((formItem) => formItem.id !== formId));
        setSuccessMessage("");
        setErrorMessage("");
      },
      onUndo: () => {
        restoreFormFromTrash(trainingId, apiForm.idForm);
        setForms((prev) =>
          [...prev, form].sort((current, next) =>
            current.title.localeCompare(next.title, "pt-BR"),
          ),
        );
      },
      onCommit: async () => {
        await deleteTrainingForm(apiForm.idForm);
        removeFormFromTrash(trainingId, apiForm.idForm);
        navigate(`/painel/gerenciar-treinamentos/${trainingId}`);
      },
      onCommitError: () => {
        restoreFormFromTrash(trainingId, apiForm.idForm);
        setForms((prev) =>
          prev.some((formItem) => formItem.id === form.id)
            ? prev
            : [...prev, form],
        );
        setErrorMessage("Nao foi possivel excluir definitivamente o formulario.");
      },
    });
  };

  const updateQuestions = (
    formId: string,
    updater: (questions: Question[]) => Question[],
  ) => {
    if (isLockedByAnswers) {
      return;
    }

    setForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, questions: updater(form.questions) } : form,
      ),
    );
  };

  const handleAddQuestion = (formId: string) => {
    updateQuestions(formId, (questions) => [...questions, createEmptyQuestion()]);
  };

  const handleQuestionTitleChange = (formId: string, qId: string, value: string) => {
    updateQuestions(formId, (questions) =>
      questions.map((question) =>
        question.id === qId ? { ...question, title: value } : question,
      ),
    );
  };

  const handleRemoveQuestion = (formId: string, qId: string) => {
    const currentForm = forms.find((form) => form.id === formId);
    const question = currentForm?.questions.find((item) => item.id === qId);

    if (!question) {
      return;
    }

    const questionIndex = currentForm?.questions.findIndex((item) => item.id === qId) ?? -1;
    const removeQuestionFromState = () => {
      updateQuestions(formId, (questions) =>
        questions.filter((item) => item.id !== qId),
      );
    };
    const restoreQuestionToState = () => {
      updateQuestions(formId, (questions) => {
        if (questions.some((item) => item.id === question.id)) {
          return questions;
        }

        const nextQuestions = [...questions];
        nextQuestions.splice(Math.max(questionIndex, 0), 0, question);
        return nextQuestions;
      });
    };

    if (!question.persistedId) {
      scheduleUndoableDelete({
        id: `draft-question:${question.id}`,
        title: "Pergunta removida",
        description: "A pergunta sera removida do formulario em 5 segundos.",
        onStart: removeQuestionFromState,
        onUndo: restoreQuestionToState,
        onCommit: () => undefined,
      });
      return;
    }

    scheduleUndoableDelete({
      id: `question:${question.persistedId}`,
      title: "Pergunta removida",
      description: `${question.title || "Pergunta"} sera excluida definitivamente em 5 segundos.`,
      onStart: removeQuestionFromState,
      onUndo: restoreQuestionToState,
      onCommit: async () => {
        await Promise.all(
          question.options
            .filter((option) => option.persistedId)
            .map((option) => deleteAlternative(option.persistedId as string)),
        );
        await deleteQuestion(question.persistedId as string);
      },
      onCommitError: () => {
        restoreQuestionToState();
        setErrorMessage("Nao foi possivel excluir definitivamente a pergunta.");
      },
    });
  };

  const handleAddOption = (formId: string, qId: string) => {
    updateQuestions(formId, (questions) =>
      questions.map((question) =>
        question.id === qId
          ? {
              ...question,
              options: [
                ...question.options,
                { id: crypto.randomUUID(), text: "", isCorrect: false },
              ],
            }
          : question,
      ),
    );
  };

  const handleOptionChange = (
    formId: string,
    qId: string,
    optId: string,
    value: string,
  ) => {
    updateQuestions(formId, (questions) =>
      questions.map((question) =>
        question.id === qId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optId ? { ...option, text: value } : option,
              ),
            }
          : question,
      ),
    );
  };

  const handleToggleCorrectOption = (formId: string, qId: string, optId: string) => {
    updateQuestions(formId, (questions) =>
      questions.map((question) =>
        question.id === qId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optId
                  ? { ...option, isCorrect: !option.isCorrect }
                  : option,
              ),
            }
          : question,
      ),
    );
  };

  const handleRemoveOption = (formId: string, qId: string, optId: string) => {
    const currentForm = forms.find((form) => form.id === formId);
    const question = currentForm?.questions.find((item) => item.id === qId);
    const option = question?.options.find((item) => item.id === optId);

    if (!question || !option) {
      return;
    }

    const optionIndex = question.options.findIndex((item) => item.id === optId);
    const removeOptionFromState = () => {
      updateQuestions(formId, (questions) =>
        questions.map((item) =>
          item.id === qId
            ? {
                ...item,
                options: item.options.filter((currentOption) => currentOption.id !== optId),
              }
            : item,
        ),
      );
    };
    const restoreOptionToState = () => {
      updateQuestions(formId, (questions) =>
        questions.map((item) => {
          if (item.id !== qId || item.options.some((currentOption) => currentOption.id === option.id)) {
            return item;
          }

          const nextOptions = [...item.options];
          nextOptions.splice(Math.max(optionIndex, 0), 0, option);
          return { ...item, options: nextOptions };
        }),
      );
    };

    scheduleUndoableDelete({
      id: option.persistedId
        ? `alternative:${option.persistedId}`
        : `draft-alternative:${option.id}`,
      title: "Alternativa removida",
      description: `${option.text || "Alternativa"} sera excluida definitivamente em 5 segundos.`,
      onStart: removeOptionFromState,
      onUndo: restoreOptionToState,
      onCommit: async () => {
        if (option.persistedId) {
          await deleteAlternative(option.persistedId);
        }
      },
      onCommitError: () => {
        restoreOptionToState();
        setErrorMessage("Nao foi possivel excluir definitivamente a alternativa.");
      },
    });
  };

  const handleSave = async () => {
    if (isLockedByAnswers) {
      setErrorMessage("Formulario ja tem respostas cadastradas e nao pode ser editado.");
      setSuccessMessage("");
      return;
    }

    if (!trainingId) {
      setErrorMessage("Salve o treinamento antes de criar formularios.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      for (const form of forms) {
        if (!form.title || !form.startDeadline || !form.endDeadline) {
          throw new Error("Campos obrigatorios ausentes.");
        }

        if (
          !isCompleteDateValue(form.startDeadline) ||
          !parseDateValue(form.startDeadline) ||
          !isCompleteDateValue(form.endDeadline) ||
          !parseDateValue(form.endDeadline)
        ) {
          throw new Error("Datas invalidas.");
        }

        const payload = {
          title: form.title,
          formType: mapTestTypeToApi(form.type),
          initDate: formatDateForDisplay(form.startDeadline),
          endDate: formatDateForDisplay(form.endDeadline),
          minCorrectPercentage: Number(form.minCorrect),
        };

        const savedForm = form.persistedId
          ? await updateTrainingForm(form.persistedId, payload)
          : await createTrainingForm(trainingId, payload);

        if (!form.persistedId) {
          for (const question of form.questions) {
            if (!question.title) continue;

            const savedQuestion = await createFormQuestion(savedForm.idForm, question.title);

            for (const option of question.options) {
              if (!option.text) continue;

              await createQuestionAlternative(
                savedQuestion.idQuestion,
                option.text,
                option.isCorrect,
              );
            }
          }
        }
      }

      setSuccessMessage("Formularios salvos com sucesso.");
      navigate(`/painel/gerenciar-treinamentos/${trainingId}`);
    } catch {
      setErrorMessage("Nao foi possivel salvar os formularios. Confira os campos.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <TrainingFormsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {selectedFormId ? "Editar formulario" : "Adicionar formulario"}
              </h1>
              <p className="mt-1 text-neutral-600">{title}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-white text-primary border border-primary"
                onPress={() => navigate(`/painel/gerenciar-treinamentos/${trainingId}`)}
              >
                Voltar ao treinamento
              </Button>
            </div>
          </div>
        </Card>

        {forms.map((form) => (
          <Card key={form.id} className="p-6">
            <div className="mb-5 flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-500">
                    Formulario do treinamento
                  </p>
                  <h2 className="text-xl font-semibold text-primary">
                    {trainingFormTypeLabel[form.type]}
                  </h2>
                </div>

                {form.persistedId && (
                  <Button
                    className="bg-red-50 text-red-700"
                    onPress={() => removeForm(form.id)}
                    isDisabled={isSaving || isLockedByAnswers}
                  >
                    Remover formulario
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Titulo do formulario
                  </label>
                  <Input
                    value={form.title}
                    onChange={(event) => updateForm(form.id, "title", event.target.value)}
                    readOnly={isLockedByAnswers}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Tipo de formulario
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      updateForm(form.id, "type", event.target.value as TestType)
                    }
                    disabled={isLockedByAnswers}
                    className="rounded-md border-2 border-neutral-300 bg-white p-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="pre-teste">Pre-teste</option>
                    <option value="pos-teste">Pos-teste</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Prazo de inicio
                  </label>
                  <Input
                    value={form.startDeadline}
                    onChange={(event) =>
                      updateForm(form.id, "startDeadline", event.target.value)
                    }
                    inputMode="numeric"
                    maxLength={10}
                    placeholder={DATE_INPUT_PLACEHOLDER}
                    readOnly={isLockedByAnswers}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Prazo final
                  </label>
                  <Input
                    value={form.endDeadline}
                    onChange={(event) =>
                      updateForm(form.id, "endDeadline", event.target.value)
                    }
                    inputMode="numeric"
                    maxLength={10}
                    placeholder={DATE_INPUT_PLACEHOLDER}
                    readOnly={isLockedByAnswers}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Minimo de acertos
                  </label>
                  <select
                    value={form.minCorrect}
                    onChange={(event) =>
                      updateForm(form.id, "minCorrect", event.target.value)
                    }
                    disabled={isLockedByAnswers}
                    className="rounded-md border-2 border-neutral-300 bg-white p-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="50">50% de acertos</option>
                    <option value="60">60% de acertos</option>
                    <option value="70">70% de acertos</option>
                    <option value="80">80% de acertos</option>
                    <option value="90">90% de acertos</option>
                  </select>
                </div>
              </div>
            </div>

            <TestFormSection
              testType={form.type}
              questions={form.questions}
              onAddQuestion={() => handleAddQuestion(form.id)}
              onRemoveQuestion={(qId) => handleRemoveQuestion(form.id, qId)}
              onQuestionTitleChange={(qId, value) =>
                handleQuestionTitleChange(form.id, qId, value)
              }
              onAddOption={(qId) => handleAddOption(form.id, qId)}
              onOptionChange={(qId, optId, value) =>
                handleOptionChange(form.id, qId, optId, value)
              }
              onToggleCorrectOption={(qId, optId) =>
                handleToggleCorrectOption(form.id, qId, optId)
              }
              onRemoveOption={(qId, optId) =>
                handleRemoveOption(form.id, qId, optId)
              }
              isReadOnly={isLockedByAnswers}
            />

            {isLockedByAnswers && (
              <p className="mt-4 rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Formulario ja tem respostas cadastradas e nao pode ser editado.
              </p>
            )}
          </Card>
        ))}

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            className="bg-neutral-300 text-neutral-800"
            onPress={() =>
              navigate(
                trainingId
                  ? `/painel/gerenciar-treinamentos/${trainingId}`
                  : "/painel/gerenciar-treinamentos",
              )
            }
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary text-white px-8"
            onPress={handleSave}
            isDisabled={isSaving || isLockedByAnswers}
          >
            {isSaving ? "Salvando..." : "Salvar formularios"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TrainingFormsSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Skeleton className="h-8 w-56 rounded-md" />
              <Skeleton className="mt-2 h-5 w-72 rounded-md" />
            </div>
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="mt-2 h-7 w-32 rounded-md" />
              </div>
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2].map((question) => (
              <div key={question} className="rounded-md border border-gray-200 p-4">
                <Skeleton className="h-6 w-56 rounded-md" />
                <div className="mt-4 grid gap-3">
                  {[1, 2, 3].map((option) => (
                    <Skeleton key={option} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function mapTestTypeToApi(type: TestType): ApiFormType {
  return type === "pre-teste" ? "PRE_TEST" : "POST_TEST";
}

function mapApiFormType(type: ApiFormType): TestType {
  return type === "PRE_TEST" ? "pre-teste" : "pos-teste";
}

async function hydrateForm(trainingId: string, form: ApiForm): Promise<ManagedTrainingForm> {
  const questions = await getFormQuestions(form.idForm);
  const hydratedQuestions = await Promise.all(
    questions.map(async (question) => {
      const alternatives = await getQuestionAlternatives(question.idQuestion);

      return {
        id: question.idQuestion,
        persistedId: question.idQuestion,
        title: question.title,
        options: alternatives.map((alternative) => ({
          id: alternative.idAlternative,
          persistedId: alternative.idAlternative,
          text: alternative.text,
          isCorrect: alternative.correct,
        })),
      };
    }),
  );

  return {
    id: form.idForm,
    persistedId: form.idForm,
    trainingId,
    title: form.title,
    type: mapApiFormType(form.formType),
    startDeadline: formatDateForDisplay(form.initDate),
    endDeadline: formatDateForDisplay(form.endDate),
    minCorrect: String(form.minCorrectPercentage),
    questions: hydratedQuestions,
  };
}

function mapManagedFormToApiForm(form: ManagedTrainingForm): ApiForm {
  return {
    idForm: form.persistedId ?? form.id,
    title: form.title,
    formType: mapTestTypeToApi(form.type),
    initDate: formatDateForDisplay(form.startDeadline),
    endDate: formatDateForDisplay(form.endDeadline),
    minCorrectPercentage: Number(form.minCorrect),
  };
}
