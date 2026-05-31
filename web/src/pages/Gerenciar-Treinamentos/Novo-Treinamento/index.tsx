import { useState } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { BasicTrainingForm } from "./components/BasicTrainingForm";
import type { TrainingFormData } from "./types";
import { ApiRequestError, getAuthenticatedUser } from "../../../services/authService";
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
  const [fieldErrors, setFieldErrors] = useState<TrainingFieldErrors>({});

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
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const buildTrainingPayload = (trainingForm: TrainingFormData) => ({
    title: trainingForm.title,
    workload: Number(trainingForm.hours),
    initDate: trainingForm.startDate,
    endDate: trainingForm.endDate,
    description: trainingForm.description,
  });

  const saveTraining = async () => {
    const manager = getAuthenticatedUser();

    if (!manager || manager.userRole !== "MANAGER") {
      setErrorMessage("Faca login como gestor para criar treinamentos.");
      return null;
    }

    const normalizedForm = normalizeTrainingForm(form);
    const validationErrors = validateTrainingForm(normalizedForm);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("Corrija os campos destacados antes de salvar o treinamento.");
      return null;
    }

    setIsSaving(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const createdTraining = await createTrainingForManager(
        manager.id,
        buildTrainingPayload(normalizedForm),
      );

      if (trainingImage) {
        const imageDataUrl = await readFileAsDataUrl(trainingImage);
        return await updateTrainingImage(createdTraining.idTraining, imageDataUrl);
      }

      return createdTraining;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        const message = getCreateTrainingErrorMessage(error.message);
        setErrorMessage(message.global);

        const field = message.field;
        const fieldMessage = message.fieldMessage;

        if (field && fieldMessage) {
          setFieldErrors((prev) => ({ ...prev, [field]: fieldMessage }));
        }
      } else {
        setErrorMessage("Nao foi possivel criar o treinamento. Verifique a API.");
      }

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
          fieldErrors={fieldErrors}
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

type TrainingFieldErrors = Partial<Record<keyof TrainingFormData, string>>;

function normalizeTrainingForm(form: TrainingFormData): TrainingFormData {
  return {
    title: form.title.trim(),
    hours: form.hours.trim(),
    startDate: form.startDate.trim(),
    endDate: form.endDate.trim(),
    description: form.description.trim(),
  };
}

function validateTrainingForm(form: TrainingFormData) {
  const errors: TrainingFieldErrors = {};
  const workload = Number(form.hours);
  const startDate = parseDate(form.startDate);
  const endDate = parseDate(form.endDate);

  if (!form.title) {
    errors.title = "Informe o titulo do treinamento.";
  }

  if (!form.hours) {
    errors.hours = "Informe a carga horaria.";
  } else if (!Number.isFinite(workload) || workload <= 0) {
    errors.hours = "A carga horaria deve ser maior que zero.";
  } else if (!Number.isInteger(workload)) {
    errors.hours = "Informe a carga horaria em horas inteiras.";
  }

  if (!form.startDate) {
    errors.startDate = "Informe a data de inicio.";
  } else if (!startDate) {
    errors.startDate = "Informe uma data de inicio valida.";
  }

  if (!form.endDate) {
    errors.endDate = "Informe a data de termino.";
  } else if (!endDate) {
    errors.endDate = "Informe uma data de termino valida.";
  }

  if (startDate && endDate && endDate < startDate) {
    errors.endDate = "A data de termino nao pode ser anterior a data de inicio.";
  }

  if (!form.description) {
    errors.description = "Informe a descricao do treinamento.";
  }

  return errors;
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCreateTrainingErrorMessage(message: string): {
  field?: keyof TrainingFormData;
  fieldMessage?: string;
  global: string;
} {
  if (message.includes("Workload must be greater than zero")) {
    return {
      field: "hours",
      fieldMessage: "A carga horaria deve ser maior que zero.",
      global: "Corrija os campos destacados antes de salvar o treinamento.",
    };
  }

  if (message.includes("Invalid start date")) {
    return {
      field: "startDate",
      fieldMessage: "Informe uma data de inicio valida.",
      global: "Corrija os campos destacados antes de salvar o treinamento.",
    };
  }

  if (message.includes("Invalid end date") || message.includes("End date cannot be before start date")) {
    return {
      field: "endDate",
      fieldMessage: message.includes("before start date")
        ? "A data de termino nao pode ser anterior a data de inicio."
        : "Informe uma data de termino valida.",
      global: "Corrija os campos destacados antes de salvar o treinamento.",
    };
  }

  if (message.includes("Manager not found")) {
    return {
      global: "Faca login como gestor para criar treinamentos.",
    };
  }

  return {
    global: "Nao foi possivel criar o treinamento. Verifique os dados informados.",
  };
}
