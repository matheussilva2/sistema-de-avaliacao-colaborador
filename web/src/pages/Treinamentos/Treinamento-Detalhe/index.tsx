import { Card, Button } from "@heroui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { TestType } from "../../Gerenciar-Treinamentos/Novo-Treinamento/types";
import { getTrainingById, type ApiTraining } from "../../../services/trainingService";

type Tab = TestType | "satisfacao" | "resultado";

export default function TreinamentoAluno() {
  const { id } = useParams();
  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pre-teste");

  useEffect(() => {
    async function loadTraining() {
      if (!id) {
        return;
      }

      try {
        const trainingData = await getTrainingById(id);
        setTraining(trainingData);
      } catch {
        setErrorMessage("Nao foi possivel carregar esse treinamento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTraining();
  }, [id]);

  if (isLoading) return <div className="p-8 text-neutral-600">Carregando treinamento...</div>;
  if (!training) return <div className="p-8 text-red-700">{errorMessage || "Nenhum treinamento com esse id"}</div>;

  const renderTab = () => {
    switch (activeTab) {
      case "pre-teste":
      case "pos-teste":
        return <FormsList />;
      case "satisfacao":
        return <Satisfacao />;
      case "resultado":
        return <Resultados />;
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <Card className="overflow-hidden p-0 mb-6">
        {training.trainingImage && (
          <img
            src={training.trainingImage}
            alt={training.title}
            className="h-64 w-full object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary mb-4">
            {training.title}
          </h1>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-primary-50 p-4 rounded-md">
              <span className="text-sm text-neutral-600">Carga Horaria</span>
              <p className="font-bold text-lg">{training.workload}h</p>
            </div>

            <div className="bg-primary-50 p-4 rounded-md">
              <span className="text-sm text-neutral-600">Inicio</span>
              <p className="font-bold text-lg">{training.initDate}</p>
            </div>

            <div className="bg-primary-50 p-4 rounded-md">
              <span className="text-sm text-neutral-600">Termino</span>
              <p className="font-bold text-lg">{training.endDate}</p>
            </div>
          </div>

          <p className="text-neutral-700">{training.description}</p>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Formularios e atividades
        </h2>
        <p className="text-sm text-neutral-600">
          Acompanhe os formularios disponiveis, os prazos e seus resultados.
        </p>
      </Card>

      <div className="mb-6 border-b border-gray-200 flex gap-6 overflow-x-auto">
        {[
          { key: "pre-teste", label: "Pre-teste" },
          { key: "pos-teste", label: "Pos-teste" },
          { key: "satisfacao", label: "Satisfacao" },
          { key: "resultado", label: "Resultados" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`pb-2 text-sm font-semibold transition whitespace-nowrap ${
              activeTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}

function FormsList() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Card className="p-6 border border-dashed border-primary-200">
      <p className="font-semibold text-primary">Nenhum formulario publicado</p>
      <p className="mt-1 text-sm text-neutral-600">
        Quando o gestor liberar um formulario para esta etapa, ele aparecera aqui.
      </p>
      <Button
        className="mt-4 w-fit bg-primary text-white"
        isDisabled
        onPress={() => navigate(`/painel/treinamentos/${id}/execucao`)}
      >
        Responder formulario
      </Button>
    </Card>
  );
}

function Satisfacao() {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium">Deixe seu feedback</p>

      <textarea
        placeholder="Escreva sua experiencia com o treinamento..."
        className="bg-white border border-gray-200 rounded-md p-3 min-h-[120px]"
      />

      <Button className="bg-primary text-white">
        Enviar Feedback
      </Button>
    </div>
  );
}

function Resultados() {
  return (
    <Card className="p-6 border border-dashed border-primary-200">
      <p className="font-semibold text-primary">Nenhum resultado disponivel</p>
      <p className="mt-1 text-sm text-neutral-600">
        Os resultados aparecerao aqui depois que voce responder os formularios.
      </p>
    </Card>
  );
}
