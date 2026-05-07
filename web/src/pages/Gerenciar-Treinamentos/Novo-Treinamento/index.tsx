import { useState } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { BasicTrainingForm } from "./components/BasicTrainingForm";
import type { TrainingFormData } from "./types";

export default function CriarTreinamento() {
  const navigate = useNavigate();
  const [trainingImage, setTrainingImage] = useState<File | null>(null);

  const [form, setForm] = useState<TrainingFormData>({
    title: "",
    hours: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleChange = (field: keyof TrainingFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildTrainingPayload = () => ({
    id: Date.now(),
    title: form.title,
    hours: Number(form.hours),
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description,
    progress: 0,
    daysLeft: 0,
    status: "em_andamento",
    coverImageName: trainingImage?.name ?? null,
  });

  const handleSubmit = () => {
    console.log("NOVO TREINAMENTO:", buildTrainingPayload());
    navigate("/painel/gerenciar-treinamentos");
  };

  const handleSubmitAndCreateForms = () => {
    const newTraining = buildTrainingPayload();
    console.log("NOVO TREINAMENTO:", newTraining);
    navigate("/painel/gerenciar-treinamentos/novo-treinamento/formularios", {
      state: { trainingDraft: newTraining },
    });
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

        <div className="rounded-md border border-primary-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">
            Formularios do treinamento
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Voce pode criar os formularios agora ou salvar apenas os dados
            basicos e configurar pre-teste e pos-teste depois no card do
            treinamento.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 justify-end">
          <Button
            className="bg-neutral-300 text-neutral-800 w-32"
            onPress={() => navigate(-1)}
          >
            Cancelar
          </Button>

          <Button
            className="bg-white text-primary border border-primary px-6"
            onPress={handleSubmitAndCreateForms}
          >
            Salvar e criar formularios
          </Button>

          <Button
            className="bg-primary text-white px-6"
            onPress={handleSubmit}
          >
            Salvar Treinamento
          </Button>
        </div>
      </div>
    </div>
  );
}
