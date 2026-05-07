import { Card, Button } from "@heroui/react";
import { trainingsMock } from "../../../mock";
import { useNavigate, useParams } from "react-router-dom";
import AlunoCollapsible from "../AlunoCollapsible";
import TrainingAnalyticsCharts from "./components/TrainingAnalyticsCharts";
import { getTrainingAnalyticsById } from "../mocks/trainingAnalytics";
import { getFormsByTrainingId, trainingFormTypeLabel } from "../mocks/trainingForms";

export default function TreinamentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  // mock simples (depois tu pega pelo ID via params)
  const training = trainingsMock.find((t) => t.id === Number(id));
  const analytics = getTrainingAnalyticsById(Number(id));
  const forms = getFormsByTrainingId(Number(id));

  if (!training) return <div>Nenhum treinamento com esse id</div>;
  if (!analytics) return <div>Nenhuma analise para esse treinamento</div>;

  const preTestForms = forms.filter((form) => form.type === "pre-teste");
  const postTestForms = forms.filter((form) => form.type === "pos-teste");

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

      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Gerenciar formularios do treinamento
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Crie ou altere os formularios de pre-teste e pos-teste, incluindo
              prazos, perguntas e minimo de acertos.
            </p>
          </div>

          <Button
            className="bg-primary text-white"
            onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.id}/formularios`)}
          >
            Gerenciar formularios
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-blue-50 p-4">
            <span className="text-sm text-neutral-600">Pre-teste</span>
            <p className="text-xl font-bold text-blue-700">
              {preTestForms.length}
            </p>
          </div>
          <div className="rounded-md bg-green-50 p-4">
            <span className="text-sm text-neutral-600">Pos-teste</span>
            <p className="text-xl font-bold text-green-700">
              {postTestForms.length}
            </p>
          </div>
          <div className="rounded-md bg-primary-50 p-4">
            <span className="text-sm text-neutral-600">Total</span>
            <p className="text-xl font-bold text-primary">{forms.length}</p>
          </div>
        </div>
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
        <Card className="p-6 col-span-2">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Avaliações
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <FormListGroup
              title="Pre-teste"
              forms={preTestForms}
              onOpen={() => navigate(`/painel/gerenciar-treinamentos/${training.id}/formularios?tipo=pre-teste`)}
            />
            <FormListGroup
              title="Pos-teste"
              forms={postTestForms}
              onOpen={() => navigate(`/painel/gerenciar-treinamentos/${training.id}/formularios?tipo=pos-teste`)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

type FormListGroupProps = {
  title: string;
  forms: ReturnType<typeof getFormsByTrainingId>;
  onOpen: () => void;
};

function FormListGroup({ title, forms, onOpen }: FormListGroupProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-600">
          {forms.length} formulario(s)
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {forms.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={onOpen}
            className="rounded-md bg-white p-4 text-left shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {trainingFormTypeLabel[form.type]}
                </p>
                <h4 className="font-semibold text-neutral-900">{form.title}</h4>
              </div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                {form.questions.length} perguntas
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm text-neutral-600">
              <div>
                <span>Inicio</span>
                <p className="font-semibold text-neutral-900">
                  {form.startDeadline}
                </p>
              </div>
              <div>
                <span>Termino</span>
                <p className="font-semibold text-neutral-900">
                  {form.endDeadline}
                </p>
              </div>
              <div>
                <span>Minimo</span>
                <p className="font-semibold text-neutral-900">
                  {form.minCorrect}%
                </p>
              </div>
            </div>
          </button>
        ))}

        {forms.length === 0 && (
          <div className="rounded-md border border-dashed border-primary-200 bg-primary-50 p-4 text-sm text-neutral-700">
            Nenhum formulario criado para esta etapa.
          </div>
        )}
      </div>
    </div>
  );
}
