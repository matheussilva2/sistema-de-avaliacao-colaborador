import { useEffect, useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { Undo2, X } from "lucide-react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TestFormSection } from "../Novo-Treinamento/components/TestFormSection";
import type { Question, TestType } from "../Novo-Treinamento/types";
import {
  createFormQuestion,
  createQuestionAlternative,
  createTrainingForm,
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
  restoreFormFromTrash,
} from "../../../services/formTrashService";

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

type PendingUndo = {
  form: ApiForm;
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
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  useEffect(() => {
    if (!pendingUndo) {
      return;
    }

    const undoTimer = window.setTimeout(() => {
      navigate(`/painel/gerenciar-treinamentos/${trainingId}`);
    }, 5000);

    return () => window.clearTimeout(undoTimer);
  }, [navigate, pendingUndo, trainingId]);

  const title = training?.title ?? state?.trainingDraft?.title ?? "Novo treinamento";

  const updateForm = (
    formId: string,
    field: keyof Omit<ManagedTrainingForm, "id" | "trainingId" | "questions">,
    value: string,
  ) => {
    if (isLockedByAnswers) {
      return;
    }

    setForms((prev) =>
      prev.map((form) => (form.id === formId ? { ...form, [field]: value } : form)),
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
    moveFormToTrash(trainingId, apiForm);
    setForms((prev) => prev.filter((form) => form.id !== formId));
    setPendingUndo({ form: apiForm });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleUndoDelete = () => {
    if (!pendingUndo || !trainingId) {
      return;
    }

    restoreFormFromTrash(trainingId, pendingUndo.form.idForm);
    setForms([mapApiFormToManagedForm(trainingId, pendingUndo.form)]);
    setPendingUndo(null);
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
    updateQuestions(formId, (questions) =>
      questions.filter((question) => question.id !== qId),
    );
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
    updateQuestions(formId, (questions) =>
      questions.map((question) =>
        question.id === qId
          ? {
              ...question,
              options: question.options.filter((option) => option.id !== optId),
            }
          : question,
      ),
    );
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

        const payload = {
          title: form.title,
          formType: mapTestTypeToApi(form.type),
          initDate: form.startDeadline,
          endDate: form.endDeadline,
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
    return <div className="p-8 text-neutral-600">Carregando formularios...</div>;
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
                    type="date"
                    value={form.startDeadline}
                    onChange={(event) =>
                      updateForm(form.id, "startDeadline", event.target.value)
                    }
                    readOnly={isLockedByAnswers}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">
                    Prazo final
                  </label>
                  <Input
                    type="date"
                    value={form.endDeadline}
                    onChange={(event) =>
                      updateForm(form.id, "endDeadline", event.target.value)
                    }
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

      {pendingUndo && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))] rounded-md border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-neutral-900">
                Formulario movido para a lixeira
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {pendingUndo.form.title} sera mantido na lixeira ate a exclusao
                definitiva.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPendingUndo(null)}
              className="rounded-md p-1 text-neutral-500 transition hover:bg-gray-100 hover:text-neutral-900"
              aria-label="Fechar aviso"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <Button className="bg-primary text-white" onPress={handleUndoDelete}>
              <Undo2 size={16} />
              Desfazer
            </Button>
          </div>
        </div>
      )}
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
        title: question.title,
        options: alternatives.map((alternative) => ({
          id: alternative.idAlternative,
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
    startDeadline: form.initDate,
    endDeadline: form.endDate,
    minCorrect: String(form.minCorrectPercentage),
    questions: hydratedQuestions,
  };
}

function mapManagedFormToApiForm(form: ManagedTrainingForm): ApiForm {
  return {
    idForm: form.persistedId ?? form.id,
    title: form.title,
    formType: mapTestTypeToApi(form.type),
    initDate: form.startDeadline,
    endDate: form.endDeadline,
    minCorrectPercentage: Number(form.minCorrect),
  };
}

function mapApiFormToManagedForm(trainingId: string, form: ApiForm): ManagedTrainingForm {
  return {
    id: form.idForm,
    persistedId: form.idForm,
    trainingId,
    title: form.title,
    type: mapApiFormType(form.formType),
    startDeadline: form.initDate,
    endDeadline: form.endDate,
    minCorrect: String(form.minCorrectPercentage),
    questions: [],
  };
}
