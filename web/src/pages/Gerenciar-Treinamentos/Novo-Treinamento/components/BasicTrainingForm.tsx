import { Input, Card } from "@heroui/react";
import type { TrainingFormData } from "../types";

type BasicTrainingFormProps = {
  form: TrainingFormData;
  onChange: (field: keyof TrainingFormData, value: string) => void;
  selectedImageName?: string;
  onImageChange: (file: File | null) => void;
};

export function BasicTrainingForm({
  form,
  onChange,
  selectedImageName,
  onImageChange,
}: BasicTrainingFormProps) {
  return (
    <Card className="p-6 border-t-4 border-l-4 border-primary shadow-lg">
      <h1 className="text-2xl font-bold text-primary mb-6">Criar Novo Treinamento</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="trainingImage"
            className="text-sm font-medium text-neutral-700"
          >
            Foto do treinamento
          </label>
          <input
            id="trainingImage"
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            className="bg-white border-2 border-neutral-300 rounded-md p-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {selectedImageName && (
            <span className="text-xs text-neutral-500">
              Imagem selecionada: {selectedImageName}
            </span>
          )}
        </div>

        <Input
          placeholder="Título do treinamento"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            placeholder="Carga horária (h)"
            value={form.hours}
            onChange={(e) => onChange("hours", e.target.value)}
            className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          <Input
            type="text"
            placeholder="Data de início (ex: 20/05)"
            value={form.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
            className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          <Input
            type="text"
            placeholder="Data de término (ex: 30/06)"
            value={form.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
            className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <textarea
          placeholder="Descrição do treinamento..."
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="bg-white border-2 border-neutral-300 rounded-md p-3 text-sm outline-none resize-none min-h-[120px] focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </Card>
  );
}
