import { Card, Button } from "@heroui/react";
import { useParams } from "react-router-dom";
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
          { key: "satisfacao", label: "Satisfação" },
          { key: "pos", label: "Pós-Teste" },
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

/* ========================= */
/* PRE TEST */
/* ========================= */

function PreTest() {
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

      <FormPerguntas />
    </div>
  );
}

/* ========================= */
/* POS TEST */
/* ========================= */

function PosTest() {
  return (
    <div className="flex flex-col gap-6">
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

      <FormPerguntas />
    </div>
  );
}

/* ========================= */
/* FORM PERGUNTAS */
/* ========================= */

function FormPerguntas() {
  const perguntas = [1, 2, 3, 4, 5];

  return (
    <form className="flex flex-col gap-6">
      {perguntas.map((q) => (
        <div key={q}>
          <p className="font-medium mb-2">
            Pergunta {q}: Lorem ipsum dolor sit amet?
          </p>

          <div className="flex flex-col gap-1">
            {["A", "B", "C", "D"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input type="radio" name={`q${q}`} />
                Opção {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <Button className="bg-primary text-white">
        Enviar
      </Button>
    </form>
  );
}

/* ========================= */
/* SATISFAÇÃO */
/* ========================= */

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
      <p className="text-lg font-semibold text-primary">
        Resultado Final
      </p>

      <div className="bg-primary-50 p-4 rounded-md">
        <p className="text-sm text-neutral-600">Pré-Test</p>
        <p className="font-bold">3 / 5</p>
      </div>

      <div className="bg-primary-50 p-4 rounded-md">
        <p className="text-sm text-neutral-600">Pós-Teste</p>
        <p className="font-bold">4 / 5</p>
      </div>

      <div className="bg-primary-50 p-4 rounded-md">
        <p className="text-sm text-neutral-600">Status</p>
        <p className="font-bold text-green-600">Aprovado</p>
      </div>
    </div>
  );
}