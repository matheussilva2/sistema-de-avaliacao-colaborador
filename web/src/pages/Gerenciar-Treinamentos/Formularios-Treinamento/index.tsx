import { useMemo, useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { trainingsMock } from "../../../mock";
import { TestFormSection } from "../Novo-Treinamento/components/TestFormSection";
import type { Question, TestType } from "../Novo-Treinamento/types";
import {
  getFormsByTrainingId,
  trainingFormTypeLabel,
  type ManagedTrainingForm,
} from "../mocks/trainingForms";

const createEmptyQuestion = (): Question => ({
  id: crypto.randomUUID(),
  title: "",
  options: [{ id: crypto.randomUUID(), text: "", isCorrect: false }],
});

const createEmptyForm = (
  trainingId: number,
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
    id: number;
    title: string;
  };
};

export default function FormulariosTreinamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState | null;
  const trainingId = Number(id ?? state?.trainingDraft?.id ?? Date.now());
  const training = trainingsMock.find((item) => item.id === trainingId);
  const defaultType = (searchParams.get("tipo") as TestType | null) ?? "pre-teste";

  const initialForms = useMemo(() => {
    const existingForms = getFormsByTrainingId(trainingId);
    if (existingForms.length > 0) return existingForms;

    return [createEmptyForm(trainingId, defaultType)];
  }, [defaultType, trainingId]);

  const [forms, setForms] = useState<ManagedTrainingForm[]>(initialForms);

  const title = training?.title ?? state?.trainingDraft?.title ?? "Novo treinamento";

  const updateForm = (
    formId: string,
    field: keyof Omit<ManagedTrainingForm, "id" | "trainingId" | "questions">,
    value: string,
  ) => {
    setForms((prev) =>
      prev.map((form) => (form.id === formId ? { ...form, [field]: value } : form)),
    );
  };

  const addForm = (type: TestType) => {
    setForms((prev) => [...prev, createEmptyForm(trainingId, type)]);
  };

  const removeForm = (formId: string) => {
    setForms((prev) => prev.filter((form) => form.id !== formId));
  };

  const updateQuestions = (
    formId: string,
    updater: (questions: Question[]) => Question[],
  ) => {
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

  const handleSave = () => {
    console.log("FORMULARIOS DO TREINAMENTO:", forms);
    navigate(id ? `/painel/gerenciar-treinamentos/${trainingId}` : "/painel/gerenciar-treinamentos");
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Formularios do treinamento
              </h1>
              <p className="mt-1 text-neutral-600">{title}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-blue-50 text-blue-700"
                onPress={() => addForm("pre-teste")}
              >
                + Pre-teste
              </Button>
              <Button
                className="bg-green-50 text-green-700"
                onPress={() => addForm("pos-teste")}
              >
                + Pos-teste
              </Button>
            </div>
          </div>
        </Card>

        {forms.map((form, index) => (
          <Card key={form.id} className="p-6">
            <div className="mb-5 flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-500">
                    Formulario {index + 1}
                  </p>
                  <h2 className="text-xl font-semibold text-primary">
                    {trainingFormTypeLabel[form.type]}
                  </h2>
                </div>

                {forms.length > 1 && (
                  <Button
                    className="bg-red-50 text-red-700"
                    onPress={() => removeForm(form.id)}
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
            />
          </Card>
        ))}

        <div className="flex justify-end gap-3">
          <Button className="bg-neutral-300 text-neutral-800" onPress={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button className="bg-primary text-white px-8" onPress={handleSave}>
            Salvar formularios
          </Button>
        </div>
      </div>
    </div>
  );
}
