import { useState } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { BasicTrainingForm } from "./components/BasicTrainingForm";
import type { TrainingFormData } from "./types";
import { getAuthenticatedUser } from "../../../services/authService";
import {
  createTrainingForManager,
  type ApiTraining,
  updateTrainingImage,
} from "../../../services/trainingService";

export default function CriarTreinamento() {
  const navigate = useNavigate();
  const [trainingImage, setTrainingImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    title: form.title,
    workload: Number(form.hours),
    initDate: form.startDate,
    endDate: form.endDate,
    description: form.description,
  });

  const saveTraining = async () => {
    const manager = getAuthenticatedUser();

    if (!manager || manager.userRole !== "MANAGER") {
      setErrorMessage("Faca login como gestor para criar treinamentos.");
      return null;
    }

    if (!form.title || !form.hours || !form.startDate || !form.endDate || !form.description) {
      setErrorMessage("Preencha todos os dados do treinamento.");
      return null;
    }

    if (Number(form.hours) <= 0) {
      setErrorMessage("A carga horaria deve ser maior que zero.");
      return null;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const createdTraining = await createTrainingForManager(manager.id, buildTrainingPayload());

      if (trainingImage) {
        const imageDataUrl = await readFileAsDataUrl(trainingImage);
        return await updateTrainingImage(createdTraining.idTraining, imageDataUrl);
      }

      return createdTraining;
    } catch {
      setErrorMessage("Nao foi possivel criar o treinamento. Verifique a API.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    const newTraining = await saveTraining();

    if (!newTraining) {
      return;
    }

    navigate("/painel/gerenciar-treinamentos");
  };

  const buildFormsNavigationState = (newTraining: ApiTraining) => ({
    id: newTraining.idTraining,
    title: newTraining.title,
    hours: newTraining.workload,
    startDate: newTraining.initDate,
    endDate: newTraining.endDate,
    description: newTraining.description,
    progress: 0,
    daysLeft: 0,
    status: "em_andamento",
    coverImageName: trainingImage?.name ?? null,
  });

  const handleSubmitAndCreateForms = async () => {
    const newTraining = await saveTraining();

    if (!newTraining) {
      return;
    }

    navigate("/painel/gerenciar-treinamentos/novo-treinamento/formularios", {
      state: { trainingDraft: buildFormsNavigationState(newTraining) },
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

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-4 justify-end">
          <Button
            className="bg-neutral-300 text-neutral-800 w-32"
            onPress={() => navigate("/painel/gerenciar-treinamentos")}
          >
            Cancelar
          </Button>

          <Button
            className="bg-white text-primary border border-primary px-6"
            onPress={handleSubmitAndCreateForms}
            isDisabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar e criar formularios"}
          </Button>

          <Button
            className="bg-primary text-white px-6"
            onPress={handleSubmit}
            isDisabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Treinamento"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
