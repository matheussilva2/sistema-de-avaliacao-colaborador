import { Card, Button, Skeleton } from "@heroui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { TestType } from "../../Gerenciar-Treinamentos/Novo-Treinamento/types";
import { getTrainingById, type ApiTraining } from "../../../services/trainingService";
import { getAuthenticatedUser } from "../../../services/authService";
import {
  getFormUserAnswers,
  getTrainingForms,
  type ApiForm,
  type ApiFormAnswer,
  type ApiFormType,
} from "../../../services/formService";
import { getTrashedFormIds } from "../../../services/formTrashService";

const recentTrainingsKeyPrefix = "recentTrainings";

type Tab = TestType | "satisfacao" | "resultado";

type StudentFormSummary = ApiForm & {
  answer?: ApiFormAnswer;
};

export default function TreinamentoAluno() {
  const { id } = useParams();
  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [forms, setForms] = useState<StudentFormSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pre-teste");

  useEffect(() => {
    async function loadTraining() {
      if (!id) {
        return;
      }

      const currentUser = getAuthenticatedUser();

      if (!currentUser) {
        setErrorMessage("Usuario nao autenticado.");
        setIsLoading(false);
        return;
      }

      try {
        const [trainingData, trainingForms] = await Promise.all([
          getTrainingById(id),
          getTrainingForms(id),
        ]);

        const trashedFormIds = getTrashedFormIds(id);
        const activeForms = trainingForms.filter((form) => !trashedFormIds.has(form.idForm));
        const formsWithAnswers = await Promise.all(
          activeForms.map(async (form) => {
            try {
              const answers = await getFormUserAnswers(form.idForm, currentUser.id);

              return {
                ...form,
                answer: answers.at(-1),
              };
            } catch {
              return form;
            }
          }),
        );

        setTraining(trainingData);
        setForms(formsWithAnswers);
        registerRecentTrainingAccess(currentUser.id, trainingData.idTraining);
      } catch {
        setErrorMessage("Nao foi possivel carregar esse treinamento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTraining();
  }, [id]);

  if (isLoading) return <TrainingDetailSkeleton />;
  if (!training) return <div className="p-8 text-red-700">{errorMessage || "Nenhum treinamento com esse id"}</div>;

  const pendingForms = forms.filter((form) => !form.answer);
  const preTestForms = pendingForms.filter((form) => form.formType === "PRE_TEST");
  const postTestForms = pendingForms.filter((form) => form.formType === "POST_TEST");

  const renderTab = () => {
    switch (activeTab) {
      case "pre-teste":
        return <FormsList forms={preTestForms} trainingId={training.idTraining} />;
      case "pos-teste":
        return <FormsList forms={postTestForms} trainingId={training.idTraining} />;
      case "satisfacao":
        return <Satisfacao />;
      case "resultado":
        return <Resultados forms={forms} trainingId={training.idTraining} />;
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
            type="button"
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
  trainingId,
}: {
  forms: StudentFormSummary[];
  trainingId: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4">
      {forms.map((form) => (
        <Card key={form.idForm} className="p-6 border border-gray-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                {formTypeLabel(form.formType)}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                {form.title}
              </h3>
              <div className="mt-4 grid gap-3 text-sm text-neutral-600 md:grid-cols-3">
                <div>
                  <span>Inicio</span>
                  <p className="font-semibold text-neutral-900">{form.initDate}</p>
                </div>
                <div>
                  <span>Prazo final</span>
                  <p className="font-semibold text-neutral-900">{form.endDate}</p>
                </div>
                <div>
                  <span>Minimo</span>
                  <p className="font-semibold text-neutral-900">
                    {form.minCorrectPercentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Pendente
              </span>

              <Button
                className="bg-primary text-white"
                onPress={() =>
                  navigate(`/painel/treinamentos/${trainingId}/formularios/${form.idForm}`)
                }
              >
                Responder formulario
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {forms.length === 0 && (
        <Card className="p-6 border border-dashed border-primary-200">
          <p className="font-semibold text-primary">Nenhum formulario publicado</p>
          <p className="mt-1 text-sm text-neutral-600">
            Quando o gestor liberar um formulario para esta etapa, ele aparecera aqui.
          </p>
        </Card>
      )}
    </div>
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

function Resultados({
  forms,
  trainingId,
}: {
  forms: StudentFormSummary[];
  trainingId: string;
}) {
  const answeredForms = forms.filter((form) => form.answer);
  const navigate = useNavigate();

  return (
    <div className="grid gap-4">
      {answeredForms.map((form) => (
        <Card key={form.idForm} className="p-6 border border-gray-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                {formTypeLabel(form.formType)}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                {form.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600">
                Resultado: {form.answer?.correctAnswers}/{form.answer?.totalQuestions} acertos
                ({form.answer?.scorePercentage}%)
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  form.answer?.approved
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {form.answer?.approved ? "Aprovado" : "Reprovado"}
              </span>
              <Button
                className="bg-primary text-white"
                onPress={() =>
                  navigate(`/painel/treinamentos/${trainingId}/formularios/${form.idForm}`)
                }
              >
                Ver formulario
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {answeredForms.length === 0 && (
        <Card className="p-6 border border-dashed border-primary-200">
          <p className="font-semibold text-primary">Nenhum resultado disponivel</p>
          <p className="mt-1 text-sm text-neutral-600">
            Os resultados aparecerao aqui depois que voce responder os formularios.
          </p>
        </Card>
      )}
    </div>
  );
}

function formTypeLabel(type: ApiFormType) {
  return type === "PRE_TEST" ? "Pre-teste" : "Pos-teste";
}

function TrainingDetailSkeleton() {
  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <Card className="overflow-hidden p-0 mb-6">
        <Skeleton className="h-64 w-full rounded-none" />

        <div className="p-6">
          <Skeleton className="mb-4 h-8 w-72 rounded-md" />

          <div className="grid gap-4 mb-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-primary-50 p-4 rounded-md">
                <Skeleton className="mb-2 h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
            ))}
          </div>

          <Skeleton className="mb-2 h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <Skeleton className="mb-4 h-6 w-56 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </Card>

      <div className="mb-6 flex gap-6 overflow-x-auto border-b border-gray-200">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="mb-2 h-6 w-24 rounded-md" />
        ))}
      </div>

      <div className="grid gap-4">
        {[1, 2].map((item) => (
          <Card key={item} className="p-6 border border-gray-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="mt-3 h-6 w-64 rounded-md" />
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:items-end">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-10 w-40 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function registerRecentTrainingAccess(userId: string, trainingId: string) {
  const storageKey = `${recentTrainingsKeyPrefix}:${userId}`;
  const storedRecentTrainings = localStorage.getItem(storageKey);
  const recentTrainingIds = storedRecentTrainings
    ? (JSON.parse(storedRecentTrainings) as string[])
    : [];
  const nextRecentTrainingIds = [
    trainingId,
    ...recentTrainingIds.filter((item) => item !== trainingId),
  ].slice(0, 3);

  localStorage.setItem(storageKey, JSON.stringify(nextRecentTrainingIds));
}
