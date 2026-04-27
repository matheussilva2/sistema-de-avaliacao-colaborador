import { Card } from "@heroui/react";
import { userMock, trainingsMock } from "../../mock";

export default function Inicio() {
  const user = userMock;

  const ativos = trainingsMock.filter(t => t.status === "em_andamento");
  const concluidos = trainingsMock.filter(t => t.status === "concluido");

  const progressoMedio =
    trainingsMock.reduce((acc, t) => acc + t.progress, 0) /
    trainingsMock.length;

  return (
    <div className="p-8 bg-neutral-50 min-h-screen flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user.nome}
        </h1>
        <p className="text-gray-600 text-sm">
          Aqui está um resumo do seu progresso
        </p>
      </div>

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-3 gap-6 ">
        
        <Card className="overflow-hidden">
          <div className="bg-primary p-3 rounded-md ">
            <span className="text-white text-sm font-semibold">
              Ativos
            </span>
          </div>
          <div className="bg-primary-50 p-5 text-center">
            <span className="text-2xl font-bold">{ativos.length}</span>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-primary p-3 rounded-md">
            <span className="text-white text-sm font-semibold">
              Concluídos
            </span>
          </div>
          <div className="bg-primary-50 p-5 text-center">
            <span className="text-2xl font-bold">{concluidos.length}</span>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-primary p-3 rounded-md">
            <span className="text-white text-sm font-semibold">
              Progresso médio
            </span>
          </div>
          <div className="bg-primary-50 p-5 text-center">
            <span className="text-2xl font-bold">
              {Math.round(progressoMedio)}%
            </span>
          </div>
        </Card>
      </div>

      {/* TREINAMENTOS ATIVOS */}
      <Card className="overflow-hidden">
        <div className="bg-primary p-4 rounded-md">
          <span className="text-white font-semibold">
            Treinamentos em andamento
          </span>
        </div>

        <div className="bg-primary-50 p-6 flex flex-col gap-4">
          {ativos.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <span className="font-semibold">{t.title}</span>
                <p className="text-sm text-gray-500">
                  {t.hours}h • {t.daysLeft} dias restantes
                </p>
              </div>

              <span className="text-sm font-semibold">
                {t.progress}%
              </span>
            </div>
          ))}

          {ativos.length === 0 && (
            <span className="text-gray-500 text-sm">
              Nenhum treinamento ativo
            </span>
          )}
        </div>
      </Card>

      {/* TODOS TREINAMENTOS */}
      <Card className="overflow-hidden">
        <div className="bg-primary p-4">
          <span className="text-white font-semibold">
            Todos os treinamentos
          </span>
        </div>

        <div className="bg-primary-50 p-6 flex flex-col gap-3">
          {trainingsMock.map((t) => (
            <div
              key={t.id}
              className="bg-white p-3 rounded-lg flex justify-between text-sm"
            >
              <span>{t.title}</span>
              <span className="text-gray-500">{t.progress}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}