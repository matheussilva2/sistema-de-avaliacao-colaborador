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
import { ApiRequestError } from "../../../services/authService";
import { getTrainingById, type ApiTraining } from "../../../services/trainingService";
import {
  moveFormToTrash,
  removeFormFromTrash,
  restoreFormFromTrash,
} from "../../../services/formTrashService";
import { useUndoableDelete } from "../../../components/UndoDeleteProvider";
import {
  DATE_INPUT_PLACEHOLDER,
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  TIME_INPUT_PLACEHOLDER,
  formatDateForDisplay,
  formatTimeForDisplay,
  formatDateInput,
  isCompleteDateValue,
  isCompleteTimeValue,
  parseDateValue,
  parseTimeValue,
} from "../../../utils/dateUtils";

type ManagedTrainingForm = {
  id: string;
  persistedId?: string;
  trainingId: string;
  title: string;
  type: TestType;
  startDeadline: string;
  endDeadline: string;
  startTime: string;
  endTime: string;
  minCorrect: string;
  questions: Question[];
};

type ManagedFormField =
  | "title"
  | "type"
  | "startDeadline"
  | "endDeadline"
  | "startTime"
  | "endTime"
  | "minCorrect";

type ManagedFormFieldErrors = Partial<Record<ManagedFormField, string>>;
type FormFieldErrorsById = Record<string, ManagedFormFieldErrors>;

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
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
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
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrorsById>({});
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
    field: ManagedFormField,
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
    setFieldErrors((prev) => clearFormFieldError(prev, formId, field));
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

    const validationErrors = validateManagedForms(forms);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("Corrija os campos destacados antes de salvar.");
      setIsSaving(false);
      return;
    }

    setFieldErrors({});

    let currentForm: ManagedTrainingForm | null = null;

    try {
      for (const form of forms) {
        currentForm = form;
        const savedForm = form.persistedId
          ? await updateTrainingForm(form.persistedId, buildFormPayload(form))
          : await createTrainingForm(trainingId, buildFormPayload(form));

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
    } catch (error) {
      if (error instanceof ApiRequestError && currentForm) {
        const apiFieldErrors = mapApiErrorsToManagedForm(error.fieldErrors);

        if (Object.keys(apiFieldErrors).length > 0) {
          const currentFormId = currentForm.id;

          setFieldErrors((prev) => ({
            ...prev,
            [currentFormId]: {
              ...prev[currentFormId],
              ...apiFieldErrors,
            },
          }));
          setErrorMessage("Corrija os campos destacados antes de salvar.");
          return;
        }
      }

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

        {forms.map((form) => {
          const currentFieldErrors = fieldErrors[form.id] ?? {};

          return (
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
                    className={getInputClassName(Boolean(currentFieldErrors.title))}
                  />
                  <FieldError message={currentFieldErrors.title} />
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
                    className={getSelectClassName(Boolean(currentFieldErrors.type))}
                  >
                    <option value="pre-teste">Pre-teste</option>
                    <option value="pos-teste">Pos-teste</option>
                  </select>
                  <FieldError message={currentFieldErrors.type} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Data de inicio
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
                    className={getInputClassName(Boolean(currentFieldErrors.startDeadline))}
                  />
                  <FieldError message={currentFieldErrors.startDeadline} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Horario de inicio
                  </label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      updateForm(form.id, "startTime", event.target.value)
                    }
                    placeholder={TIME_INPUT_PLACEHOLDER}
                    readOnly={isLockedByAnswers}
                    className={getInputClassName(Boolean(currentFieldErrors.startTime))}
                  />
                  <FieldError message={currentFieldErrors.startTime} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Data final
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
                    className={getInputClassName(Boolean(currentFieldErrors.endDeadline))}
                  />
                  <FieldError message={currentFieldErrors.endDeadline} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Horario final
                  </label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      updateForm(form.id, "endTime", event.target.value)
                    }
                    placeholder={TIME_INPUT_PLACEHOLDER}
                    readOnly={isLockedByAnswers}
                    className={getInputClassName(Boolean(currentFieldErrors.endTime))}
                  />
                  <FieldError message={currentFieldErrors.endTime} />
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
                    className={getSelectClassName(Boolean(currentFieldErrors.minCorrect))}
                  >
                    <option value="50">50% de acertos</option>
                    <option value="60">60% de acertos</option>
                    <option value="70">70% de acertos</option>
                    <option value="80">80% de acertos</option>
                    <option value="90">90% de acertos</option>
                  </select>
                  <FieldError message={currentFieldErrors.minCorrect} />
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
          );
        })}

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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-semibold text-red-600">{message}</p>;
}

function getInputClassName(hasError: boolean) {
  return hasError ? "rounded-md border-2 border-red-500" : "";
}

function getSelectClassName(hasError: boolean) {
  const borderClass = hasError
    ? "border-red-500 focus:border-red-500"
    : "border-neutral-300 focus:border-primary";

  return `rounded-md border-2 ${borderClass} bg-white p-3 text-sm outline-none`;
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
    startTime: formatTimeForDisplay(form.initTime) || DEFAULT_START_TIME,
    endTime: formatTimeForDisplay(form.endTime) || DEFAULT_END_TIME,
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
    initTime: formatTimeForDisplay(form.startTime) || DEFAULT_START_TIME,
    endTime: formatTimeForDisplay(form.endTime) || DEFAULT_END_TIME,
    minCorrectPercentage: Number(form.minCorrect),
  };
}

function buildFormPayload(form: ManagedTrainingForm) {
  return {
    title: form.title.trim(),
    formType: mapTestTypeToApi(form.type),
    initDate: formatDateForDisplay(form.startDeadline),
    endDate: formatDateForDisplay(form.endDeadline),
    initTime: formatTimeForDisplay(form.startTime),
    endTime: formatTimeForDisplay(form.endTime),
    minCorrectPercentage: Number(form.minCorrect),
  };
}

function validateManagedForms(forms: ManagedTrainingForm[]) {
  return forms.reduce<FormFieldErrorsById>((errorsByForm, form) => {
    const formErrors = validateManagedForm(form);

    if (Object.keys(formErrors).length > 0) {
      errorsByForm[form.id] = formErrors;
    }

    return errorsByForm;
  }, {});
}

function validateManagedForm(form: ManagedTrainingForm) {
  const errors: ManagedFormFieldErrors = {};
  const startDate = parseDateValue(form.startDeadline);
  const endDate = parseDateValue(form.endDeadline);
  const startTime = parseTimeValue(form.startTime);
  const endTime = parseTimeValue(form.endTime);
  const minCorrect = Number(form.minCorrect);

  if (!form.title.trim()) {
    errors.title = "Informe o titulo do formulario.";
  }

  if (!form.type) {
    errors.type = "Informe o tipo de formulario.";
  }

  if (!form.startDeadline.trim()) {
    errors.startDeadline = "Informe a data de inicio.";
  } else if (!isCompleteDateValue(form.startDeadline) || !startDate) {
    errors.startDeadline = "Informe uma data de inicio valida.";
  }

  if (!form.endDeadline.trim()) {
    errors.endDeadline = "Informe a data final.";
  } else if (!isCompleteDateValue(form.endDeadline) || !endDate) {
    errors.endDeadline = "Informe uma data final valida.";
  }

  if (!form.startTime.trim()) {
    errors.startTime = "Informe o horario de inicio.";
  } else if (!isCompleteTimeValue(form.startTime) || !startTime) {
    errors.startTime = "Informe um horario de inicio valido.";
  }

  if (!form.endTime.trim()) {
    errors.endTime = "Informe o horario final.";
  } else if (!isCompleteTimeValue(form.endTime) || !endTime) {
    errors.endTime = "Informe um horario final valido.";
  }

  if (!form.minCorrect.trim()) {
    errors.minCorrect = "Informe o minimo de acertos.";
  } else if (!Number.isFinite(minCorrect) || minCorrect < 0 || minCorrect > 100) {
    errors.minCorrect = "Informe um minimo de acertos entre 0 e 100.";
  }

  if (startDate && endDate && endDate < startDate) {
    errors.endDeadline = "A data final nao pode ser anterior a data de inicio.";
  }

  if (startDate && endDate && startTime && endTime) {
    const start = buildDateTime(startDate, startTime);
    const end = buildDateTime(endDate, endTime);

    if (end < start) {
      errors.endTime =
        "O horario final deve ser posterior ou igual ao inicio da disponibilidade.";
    }
  }

  return errors;
}

function buildDateTime(
  date: Date,
  time: NonNullable<ReturnType<typeof parseTimeValue>>,
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.hours,
    time.minutes,
  );
}

function clearFormFieldError(
  fieldErrors: FormFieldErrorsById,
  formId: string,
  field: ManagedFormField,
) {
  if (!fieldErrors[formId]?.[field]) {
    return fieldErrors;
  }

  const nextFormErrors = { ...fieldErrors[formId], [field]: "" };
  const nextErrors = { ...fieldErrors, [formId]: nextFormErrors };

  if (Object.values(nextFormErrors).every((message) => !message)) {
    delete nextErrors[formId];
  }

  return nextErrors;
}

function mapApiErrorsToManagedForm(apiErrors: Record<string, string>) {
  const fieldMap: Record<string, ManagedFormField> = {
    title: "title",
    formType: "type",
    initDate: "startDeadline",
    endDate: "endDeadline",
    initTime: "startTime",
    endTime: "endTime",
    minCorrectPercentage: "minCorrect",
  };

  return Object.entries(apiErrors).reduce<ManagedFormFieldErrors>(
    (formErrors, [apiField, message]) => {
      const formField = fieldMap[apiField];

      if (formField) {
        formErrors[formField] = normalizeApiFormErrorMessage(message);
      }

      return formErrors;
    },
    {},
  );
}

function normalizeApiFormErrorMessage(message: string) {
  if (message.includes("Data de inicio")) {
    return message.includes("obrigatoria")
      ? "Informe a data de inicio."
      : "Informe uma data de inicio valida.";
  }

  if (message.includes("Data de termino")) {
    return message.includes("posterior") || message.includes("igual")
      ? "A data final nao pode ser anterior a data de inicio."
      : message.includes("obrigatoria")
        ? "Informe a data final."
        : "Informe uma data final valida.";
  }

  if (message.includes("Horario de inicio")) {
    return message.includes("obrigatorio")
      ? "Informe o horario de inicio."
      : "Informe um horario de inicio valido.";
  }

  if (message.includes("Horario de termino")) {
    return message.includes("posterior") || message.includes("igual")
      ? "O horario final deve ser posterior ou igual ao inicio da disponibilidade."
      : message.includes("obrigatorio")
        ? "Informe o horario final."
        : "Informe um horario final valido.";
  }

  if (message.includes("Titulo")) {
    return "Informe o titulo do formulario.";
  }

  if (message.includes("Tipo de formulario")) {
    return "Informe o tipo de formulario.";
  }

  if (message.includes("Percentual minimo")) {
    return message.includes("obrigatorio")
      ? "Informe o minimo de acertos."
      : "Informe um minimo de acertos entre 0 e 100.";
  }

  return message;
}
