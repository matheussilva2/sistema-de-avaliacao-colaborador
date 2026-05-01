import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { BasicTrainingForm } from "./components/BasicTrainingForm";
import { TestFormSection } from "./components/TestFormSection";
import type { Question, TestType, TrainingFormData } from "./types";

export default function CriarTreinamento() {
  const navigate = useNavigate();
  const [trainingImage, setTrainingImage] = useState<File | null>(null);

  // Estado das informações básicas
  const [form, setForm] = useState<TrainingFormData>({
    title: "",
    hours: "",
    startDate: "",
    endDate: "",
    testType: "pre-teste" as TestType,
    minCorrect: "70",
    description: "",
  });

  // Estado separado por tipo de avaliação
  const [testForms, setTestForms] = useState<Record<TestType, Question[]>>({
    "pre-teste": [],
    "pos-teste": [],
  });

  const questions = useMemo(() => testForms[form.testType], [form.testType, testForms]);

  const handleChange = (field: keyof TrainingFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //FUNÇÕES DO FORMULÁRIO DE PERGUNTAS

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: "",
      options: [{ id: Date.now().toString() + "-opt", text: "", isCorrect: false }],
    };
    setTestForms((prev) => ({
      ...prev,
      [form.testType]: [...prev[form.testType], newQuestion],
    }));
  };

  const handleQuestionTitleChange = (qId: string, value: string) => {
    setTestForms((prev) => ({
      ...prev,
      [form.testType]: prev[form.testType].map((q) =>
        q.id === qId ? { ...q, title: value } : q,
      ),
    }));
  };

  const handleRemoveQuestion = (qId: string) => {
    setTestForms((prev) => ({
      ...prev,
      [form.testType]: prev[form.testType].filter((q) => q.id !== qId),
    }));
  };

  const handleAddOption = (qId: string) => {
    setTestForms((prev) => ({
      ...prev,
      [form.testType]: prev[form.testType].map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: [...q.options, { id: Date.now().toString(), text: "", isCorrect: false }],
          };
        }
        return q;
      }),
    }));
  };

  const handleOptionChange = (qId: string, optId: string, value: string) => {
    setTestForms((prev) => ({
      ...prev,
      [form.testType]: prev[form.testType].map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optId ? { ...o, text: value } : o,
            ),
          };
        }
        return q;
      }),
    }));
  };

  const handleToggleCorrectOption = (qId: string, optId: string) => {
    setTestForms((prev) => ({
      ...prev,
      [form.testType]: prev[form.testType].map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o,
            ),
          };
        }
        return q;
      }),
    }));
  };

  const handleRemoveOption = (qId: string, optId: string) => {
    setTestForms((prev) => ({
      ...prev,
      [form.testType]: prev[form.testType].map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.filter((o) => o.id !== optId),
          };
        }
        return q;
      }),
    }));
  };

  //SUBMIT

  const handleSubmit = () => {
    // mock de criação
    const newTraining = {
      id: Date.now(),
      title: form.title,
      hours: Number(form.hours),
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      testType: form.testType,
      minCorrect: Number(form.minCorrect),
      progress: 0,
      daysLeft: 0,
      status: "em_andamento",
      preTestQuestions: testForms["pre-teste"],
      posTestQuestions: testForms["pos-teste"],
      coverImageName: trainingImage?.name ?? null,
    };

    console.log("NOVO TREINAMENTO:", newTraining);

    // depois tu salva num estado global ou API
    navigate("/painel/gerenciar-treinamentos");
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <BasicTrainingForm
          form={form}
          onChange={handleChange}
          selectedImageName={trainingImage?.name}
          onImageChange={setTrainingImage}
        />

        <TestFormSection
          testType={form.testType}
          questions={questions}
          onAddQuestion={handleAddQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onQuestionTitleChange={handleQuestionTitleChange}
          onAddOption={handleAddOption}
          onOptionChange={handleOptionChange}
          onToggleCorrectOption={handleToggleCorrectOption}
          onRemoveOption={handleRemoveOption}
        />

        {/* BOTÕES DE AÇÃO GERAIS */}
        <div className="flex gap-3 mt-4 justify-end">
          <Button
            className="bg-neutral-300 text-neutral-800 w-32"
            onPress={() => navigate(-1)}
          >
            Cancelar
          </Button>

          <Button
            className="bg-primary text-white w-48"
            onPress={handleSubmit}
          >
            Salvar Treinamento
          </Button>
        </div>

      </div>
    </div>
  );
}