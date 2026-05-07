import { Card, Button } from "@heroui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { trainingsMock } from "../../../mock";
import {
  getAnsweredFormsByTrainingId,
  getFormsByTrainingId,
  getFormResult,
  trainingFormTypeLabel,
  type AnsweredTrainingForm,
  type ManagedTrainingForm,
} from "../../Gerenciar-Treinamentos/mocks/trainingForms";
import type { TestType } from "../../Gerenciar-Treinamentos/Novo-Treinamento/types";

type Tab = TestType | "satisfacao" | "resultado";
const currentStudentId = 1;

export default function TreinamentoAluno() {
  const { id } = useParams();
  const trainingId = Number(id);
  const training = trainingsMock.find((t) => t.id === trainingId);
  const forms = getFormsByTrainingId(trainingId);
  const answeredForms = getAnsweredFormsByTrainingId(trainingId, currentStudentId);

  const [activeTab, setActiveTab] = useState<Tab>("pre-teste");

  if (!training) return <div>Nenhum treinamento com esse id</div>;

  const renderTab = () => {
    switch (activeTab) {
      case "pre-teste":
      case "pos-teste":
        return (
          <FormsList
            answers={answeredForms}
            forms={forms.filter((form) => form.type === activeTab)}
          />
        );
      case "satisfacao":
        return <Satisfacao />;
      case "resultado":
        return <Resultados answers={answeredForms} forms={forms} />;
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
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

function FormsList({
  forms,
  answers,
}: {
  forms: ManagedTrainingForm[];
  answers: AnsweredTrainingForm[];
}) {
  const navigate = useNavigate();
  const { id } = useParams();

  if (forms.length === 0) {
    return (
      <Card className="p-6 border border-dashed border-primary-200">
        <p className="font-semibold text-primary">Nenhum formulario publicado</p>
        <p className="mt-1 text-sm text-neutral-600">
          Quando o gestor liberar um formulario para esta etapa, ele aparecera aqui.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {forms.map((form) => (
        <Card key={form.id} className="p-6">
          {(() => {
            const answer = answers.find((item) => item.formId === form.id);
            const result = getFormResult(form, answer);

            return (
              <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                {trainingFormTypeLabel[form.type]}
              </span>
              <h2 className="mt-3 text-xl font-semibold text-neutral-900">
                {form.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                {form.questions.length} perguntas - minimo de {form.minCorrect}% de acertos
              </p>
              {result.isAnswered && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  Respondido em {answer?.answeredAt} - {result.correctAnswers}/
                  {result.totalQuestions} acertos
                </p>
              )}
            </div>

            <Button
              className={result.isAnswered ? "bg-green-600 text-white" : "bg-primary text-white"}
              onPress={() => navigate(`/painel/treinamentos/${id}/formularios/${form.id}`)}
            >
              {result.isAnswered ? "Ver formulario" : "Responder formulario"}
            </Button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-primary-50 p-4">
              <p className="text-sm text-neutral-600">Disponivel a partir de</p>
              <p className="font-bold text-neutral-900">{form.startDeadline}</p>
            </div>
            <div className="rounded-md bg-primary-50 p-4">
              <p className="text-sm text-neutral-600">Prazo final</p>
              <p className="font-bold text-neutral-900">{form.endDeadline}</p>
            </div>
          </div>
              </>
            );
          })()}
        </Card>
      ))}
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

function Resultados({
  forms,
  answers,
}: {
  forms: ManagedTrainingForm[];
  answers: AnsweredTrainingForm[];
}) {
  const answeredResults = answers
    .map((answer) => {
      const form = forms.find((item) => item.id === answer.formId);
      if (!form) return null;

      return {
        answer,
        form,
        result: getFormResult(form, answer),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (answeredResults.length === 0) {
    return (
      <Card className="p-6 border border-dashed border-primary-200">
        <p className="font-semibold text-primary">Nenhum resultado disponivel</p>
        <p className="mt-1 text-sm text-neutral-600">
          Os resultados aparecerao aqui depois que voce responder os formularios.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-primary">
        Resultado por formulario respondido
      </p>

      {answeredResults.map(({ answer, form, result }) => (
        <Card key={answer.id} className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                {trainingFormTypeLabel[form.type]}
              </span>
              <h2 className="mt-3 text-xl font-semibold text-neutral-900">
                {form.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Respondido em {answer.answeredAt}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                result.isApproved
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {result.isApproved ? "Aprovado" : "Reprovado"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-primary-50 p-4">
              <p className="text-sm text-neutral-600">Acertos</p>
              <p className="font-bold text-neutral-900">
                {result.correctAnswers}/{result.totalQuestions}
              </p>
            </div>
            <div className="rounded-md bg-primary-50 p-4">
              <p className="text-sm text-neutral-600">Nota</p>
              <p className="font-bold text-neutral-900">
                {result.scorePercentage}%
              </p>
            </div>
            <div className="rounded-md bg-primary-50 p-4">
              <p className="text-sm text-neutral-600">Minimo</p>
              <p className="font-bold text-neutral-900">{form.minCorrect}%</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
