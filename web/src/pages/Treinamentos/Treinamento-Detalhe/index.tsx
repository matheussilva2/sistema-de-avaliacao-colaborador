import { Card, Button } from "@heroui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { trainingsMock } from "../../../mock";

type Tab = "pre" | "satisfacao" | "pos" | "resultado";

export default function TreinamentoAluno() {
  const { id } = useParams();
  const training = trainingsMock.find((t) => t.id === Number(id));

  const [activeTab, setActiveTab] = useState<Tab>("pre");

  if (!training) return <div>Nenhum treinamento com esse id</div>;

  const renderTab = () => {
    switch (activeTab) {
      case "pre":
        return <PreTest />;
      case "satisfacao":
        return <Satisfacao />;
      case "pos":
        return <PosTest />;
      case "resultado":
        return <Resultados />;
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">

      {/* HEADER (igual ao teu) */}
      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-4">
          {training.title}
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-primary-50 p-4 rounded-md">
            <span className="text-sm text-neutral-600">Carga Horária</span>
            <p className="font-bold text-lg">{training.hours}h</p>
          </div>

          <div className="bg-primary-50 p-4 rounded-md">
            <span className="text-sm text-neutral-600">Início</span>
            <p className="font-bold text-lg">{training.startDate}</p>
          </div>

          <div className="bg-primary-50 p-4 rounded-md">
            <span className="text-sm text-neutral-600">Término</span>
            <p className="font-bold text-lg">{training.endDate}</p>
          </div>
        </div>

        <p className="text-neutral-700">
          Este treinamento tem como objetivo capacitar os colaboradores...
        </p>
      </Card>

      {/* ALUNOS (mantido) */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Alunos Inscritos
        </h2>
        <p className="text-sm text-neutral-600">5 pessoas</p>
      </Card>

      {/* TABS (material style) */}
      <div className="mb-6 border-b border-gray-200 flex gap-6">
        {[
          { key: "pre", label: "Pré-Test" },
          { key: "pos", label: "Pós-Teste" },
          { key: "satisfacao", label: "Satisfação" },
          { key: "resultado", label: "Resultados" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`pb-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      {renderTab()}
    </div>
  );
}

function PreTest() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-6">
      {/* INFO */}
      <div className="flex gap-4">
        <div className="bg-primary-50 p-4 rounded-md">
          <p className="text-sm text-neutral-600">Acertos</p>
          <p className="font-bold text-lg">0</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-md">
          <p className="text-sm text-neutral-600">Mínimo</p>
          <p className="font-bold text-lg">3</p>
        </div>
      </div>
      {/* Caixa para iniciar o treinamento */}
      <div className="bg-white border border-primary-200 rounded-lg p-6 flex flex-col items-center gap-3 shadow">
        <p className="text-primary font-semibold text-lg">Pronto para iniciar o treinamento?</p>
        <Button className="bg-primary text-white px-6 py-2 rounded" onClick={() => navigate(`/painel/treinamentos/${id}/execucao`)}>
          Ir para o treinamento
        </Button>
      </div>
    </div>
  );
}


function PosTest() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary-50 p-4 rounded-md">
          <p className="text-sm text-neutral-600">Acertos</p>
          <p className="font-bold text-lg">4</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-md">
          <p className="text-sm text-neutral-600">Mínimo</p>
          <p className="font-bold text-lg">3</p>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center gap-3 shadow">
        <p className="text-green-700 font-semibold text-lg">Pós-teste concluído! Veja seus resultados abaixo.</p>
        <Button
          className="bg-primary text-white px-5 py-2 rounded-lg"
          onClick={() => navigate(`/painel/treinamentos/${id}/resultado`)}
        >
          Ver Resultados
        </Button>
      </div>
    </div>
  );
}

function Satisfacao() {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium">Deixe seu feedback</p>

      <textarea
        placeholder="Escreva sua experiência com o treinamento..."
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
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-primary">Resultado Final</p>

      <div className="bg-primary-50 p-4 rounded-md">
        <p className="text-sm text-neutral-600">Pré-Test</p>
        <p className="font-bold">3 / 5</p>
      </div>

      <div className="bg-primary-50 p-4 rounded-md">
        <p className="text-sm text-neutral-600">Pós-Test</p>
        <p className="font-bold">4 / 5</p>
      </div>

      <div className="bg-primary-50 p-4 rounded-md">
        <p className="text-sm text-neutral-600">Status</p>
        <p className="font-bold text-green-600">Aprovado</p>
      </div>
    </div>
  );
}
