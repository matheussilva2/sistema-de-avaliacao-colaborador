import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import { trainingsMock } from "../../../mock";
import { ConteudoTeste, type AbaTreinamento } from "../Testes";

export default function TreinamentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.state?.initialTab as
    | "pre-teste"
    | "satisfacao"
    | "pos-teste"
    | undefined;
  const [abaAtiva, setAbaAtiva] = useState<AbaTreinamento>(
    initialTab ?? "pre-teste",
  );

  const training = trainingsMock.find((t) => t.id === Number(id));

  if (!training) {
    return (
      <div className="p-8">
        <p className="text-red-500">Treinamento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      {/* Botão voltar */}
      <Button
        isIconOnly
        className="mb-4 bg-transparent"
        onClick={() => navigate("/painel/treinamentos")}
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </Button>

      {/* Header com informações do treinamento */}
      <div className="bg-blue-300 rounded-lg p-6 flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{training.title}</h1>
          <p className="text-gray-700">Compliance</p>
        </div>
        <Button className="bg-green-500 text-white" size="lg">
          Em treinamento
        </Button>
      </div>

      {/* Cards com informações do treinamento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-200 rounded-lg">
          <p className="text-xs text-gray-700 font-semibold">Tipo</p>
          <p className="text-gray-800">Presencial</p>
        </div>
        <div className="p-4 bg-blue-200 rounded-lg">
          <p className="text-xs text-gray-700 font-semibold">Carga Horária</p>
          <p className="text-gray-800">{training.hours}h</p>
        </div>
        <div className="p-4 bg-blue-200 rounded-lg">
          <p className="text-xs text-gray-700 font-semibold">Data de Início</p>
          <p className="text-gray-800">{training.startDate}</p>
        </div>
        <div className="p-4 bg-blue-200 rounded-lg">
          <p className="text-xs text-gray-700 font-semibold">Data do Fim</p>
          <p className="text-gray-800">{training.endDate}</p>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="border-b-2 border-gray-300 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setAbaAtiva("pre-teste")}
            className={`pb-3 font-semibold transition-colors ${
              abaAtiva === "pre-teste"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            PRÉ-TESTE
          </button>
          <button
            onClick={() => setAbaAtiva("satisfacao")}
            className={`pb-3 font-semibold transition-colors ${
              abaAtiva === "satisfacao"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            SATISFAÇÃO
          </button>
          <button
            onClick={() => setAbaAtiva("pos-teste")}
            className={`pb-3 font-semibold transition-colors ${
              abaAtiva === "pos-teste"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            PÓS-TESTE
          </button>
        </div>
      </div>

      {/* Conteúdo das abas */}
      <div className="mt-8">
        <ConteudoTeste abaAtiva={abaAtiva} />
      </div>
    </div>
  );
}
