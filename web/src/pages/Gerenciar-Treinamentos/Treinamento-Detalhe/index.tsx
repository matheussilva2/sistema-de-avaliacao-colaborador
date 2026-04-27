import { Card, Button } from "@heroui/react";
import { trainingsMock } from "../../../mock";
import { useParams } from "react-router-dom";

export default function TreinamentoDetalhes() {
  const { id } = useParams();
  // mock simples (depois tu pega pelo ID via params)
  const training = trainingsMock.find((t) => t.id === Number(id));

  if (!training) return <div>Nenhum treinamento com esse id</div>;

  const alunosMock = [
    { nome: "João Silva", status: "concluido" },
    { nome: "Maria Souza", status: "em_andamento" },
    { nome: "Carlos Lima", status: "nao_iniciado" },
    { nome: "Ana Costa", status: "incompleto" },
    { nome: "Lucas Alves", status: "em_andamento" },
  ];

  const avaliacoesMock = [
    {
      titulo: "Pré-Test",
      tipo: "Múltipla escolha",
      acertos: "0/10",
      data: "10/05",
    },
    {
      titulo: "Quiz Final",
      tipo: "Múltipla escolha",
      acertos: "0/10",
      data: "30/06",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-100 text-green-700";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-700";
      case "nao_iniciado":
        return "bg-gray-200 text-gray-700";
      case "incompleto":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      {/* HEADER */}
      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-4">
          {training.title}
        </h1>

        {/* INFO BOXES */}
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

        {/* DESCRIÇÃO */}
        <p className="text-neutral-700">
          Este treinamento tem como objetivo capacitar os colaboradores nos
          principais conceitos e práticas relacionados ao tema, garantindo
          melhor desempenho e alinhamento com os processos da organização.
        </p>
      </Card>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-2 gap-6">
        {/* ALUNOS (SPAN 2) */}
        <Card className="p-6 col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">
              Alunos Inscritos
            </h2>
            <span className="text-sm text-neutral-600">
              {alunosMock.length} pessoas
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {alunosMock.map((aluno, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-neutral-50 p-3 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full" />

                  <span className="font-medium text-neutral-800">
                    {aluno.nome}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(
                      aluno.status,
                    )}`}
                  >
                    {aluno.status.replace("_", " ")}
                  </span>
                </div>

                <Button size="sm" className="bg-primary text-white">
                  Ver mais
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* AVALIAÇÕES */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Avaliações
          </h2>

          <div className="flex flex-col gap-3">
            {avaliacoesMock.map((av, index) => (
              <div key={index} className="bg-neutral-50 p-4 rounded-md">
                <p className="font-semibold text-neutral-900">{av.titulo}</p>

                <p className="text-sm text-neutral-600">Tipo: {av.tipo}</p>

                <p className="text-sm text-neutral-600">
                  Acertos necessários: {av.acertos}
                </p>

                <p className="text-sm text-neutral-600">Data: {av.data}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* (espaço futuro pra outra sessão se quiser) */}
        <div />
      </div>
    </div>
  );
}
