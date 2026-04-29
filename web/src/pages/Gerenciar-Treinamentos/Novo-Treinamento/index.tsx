import { useState } from "react";
import { Card, Input, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import type { Training } from "../../../types/Training";

export default function CriarTreinamento() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    hours: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // mock de criação
    const newTraining: Training = {
      id: Date.now(),
      title: form.title,
      hours: Number(form.hours),
      startDate: form.startDate,
      endDate: form.endDate,
      progress: 0,
      daysLeft: 0,
      status: "em_andamento",
    };

    console.log("NOVO TREINAMENTO:", newTraining);

    // depois tu salva num estado global ou API
    navigate("/painel/gerenciar-treinamentos");
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <Card className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">
          Criar Novo Treinamento
        </h1>

        <div className="flex flex-col gap-4">

          {/* TÍTULO */}
          <Input
            placeholder="Título do treinamento"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="bg-white"
          />

          {/* GRID INFO */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              placeholder="Carga horária (h)"
              value={form.hours}
              onChange={(e) => handleChange("hours", e.target.value)}
              className="bg-white"
            />

            <Input
              type="text"
              placeholder="Data de início (ex: 20/05)"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="bg-white"
            />

            <Input
              type="text"
              placeholder="Data de término (ex: 30/06)"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="bg-white"
            />
          </div>

          {/* DESCRIÇÃO */}
          <textarea
            placeholder="Descrição do treinamento..."
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="bg-white border border-gray-200 rounded-md p-3 text-sm outline-none resize-none min-h-[120px]"
          />

          {/* BOTÕES */}
          <div className="flex gap-3 mt-4">
            <Button
              className="bg-neutral-300 text-neutral-800 w-full"
              onPress={() => navigate(-1)}
            >
              Cancelar
            </Button>

            <Button
              className="bg-primary text-white w-full"
              onPress={handleSubmit}
            >
              Criar Treinamento
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}