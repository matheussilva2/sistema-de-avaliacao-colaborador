import { Input, Card } from "@heroui/react";
import type { TrainingFormData, TestType } from "../types";

type BasicTrainingFormProps = {
  form: TrainingFormData;
  onChange: (field: keyof TrainingFormData, value: string) => void;
  selectedImageName?: string;
  onImageChange: (file: File | null) => void;
};

const testTypeOptions: { value: TestType; label: string }[] = [
  { value: "pre-teste", label: "Pré-teste" },
  { value: "pos-teste", label: "Pós-teste" },
];

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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-700" htmlFor="minCorrect">
            Mínimo de acertos para ser aprovado
          </label>
          <select
            id="minCorrect"
            value={form.minCorrect}
            onChange={(e) => onChange("minCorrect", e.target.value)}
            className="bg-white border-2 border-neutral-300 rounded-md p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="50">50% de acertos</option>
            <option value="60">60% de acertos</option>
            <option value="70">70% de acertos</option>
            <option value="80">80% de acertos</option>
            <option value="90">90% de acertos</option>
          </select>
        </div>

        <textarea
          placeholder="Descrição do treinamento..."
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="bg-white border-2 border-neutral-300 rounded-md p-3 text-sm outline-none resize-none min-h-[120px] focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-neutral-700">Tipo de avaliação</span>
          <div className="flex items-center gap-4">
            {testTypeOptions.map((option) => (
              <label key={option.value} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="testType"
                  value={option.value}
                  checked={form.testType === option.value}
                  onChange={(e) => onChange("testType", e.target.value)}
                  className="form-radio h-4 w-4 text-primary accent-primary"
                />
                <span className="text-sm text-neutral-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
