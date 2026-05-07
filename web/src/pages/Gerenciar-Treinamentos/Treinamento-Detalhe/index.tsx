import { Card, Button } from "@heroui/react";
import { trainingsMock } from "../../../mock";
import { useNavigate, useParams } from "react-router-dom";
import AlunoCollapsible from "../AlunoCollapsible";
import TrainingAnalyticsCharts from "./components/TrainingAnalyticsCharts";
import { getTrainingAnalyticsById } from "../mocks/trainingAnalytics";

export default function TreinamentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  // mock simples (depois tu pega pelo ID via params)
  const training = trainingsMock.find((t) => t.id === Number(id));
  const analytics = getTrainingAnalyticsById(Number(id));

  if (!training) return <div>Nenhum treinamento com esse id</div>;
  if (!analytics) return <div>Nenhuma analise para esse treinamento</div>;

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
              {analytics.students.length} pessoas
            </span>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              className="bg-primary text-white"
              onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.id}/adicionar-alunos`)}
            >
              Adicionar Alunos +
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {analytics.students.map((aluno) => (
              <AlunoCollapsible key={aluno.id} aluno={aluno} />
            ))}
          </div>
        </Card>

        <Card className="p-6 col-span-2">
          <TrainingAnalyticsCharts students={analytics.students} />
        </Card>

        {/* AVALIAÇÕES */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Avaliações
          </h2>

          <div className="flex flex-col gap-3">
            {analytics.assessments.map((av) => (
              <div
                key={av.titulo}
                className="bg-neutral-100 border-2 border-gray-300 p-4 rounded-xl"
              >
                <p className="font-semibold text-neutral-900">{av.titulo}</p>

                <p className="text-sm text-neutral-700">Tipo: {av.tipo}</p>

                <p className="text-sm text-neutral-700">
                  Numero de questoes: {av.questoes}
                </p>

                <p className="text-sm text-neutral-700">Data: {av.data}</p>
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
