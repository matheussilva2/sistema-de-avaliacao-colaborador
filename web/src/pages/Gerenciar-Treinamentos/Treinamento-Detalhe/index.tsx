import { Card, Button, Input, Label } from "@heroui/react";
import { ChevronDown, ChevronUp, Trash2, Undo2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TrainingAnalyticsCharts, {
  type StudentTrainingAnalytics,
} from "./components/TrainingAnalyticsCharts";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  getTrainingById,
  getTrainingUsers,
  type ApiTraining,
  updateTraining,
  updateTrainingImage,
} from "../../../services/trainingService";
import type { ApiUser } from "../../../services/authService";
import {
  deleteTrainingForm,
  getFormQuestions,
  getTrainingResults,
  getTrainingForms,
  type ApiFormAnswer,
  type ApiForm,
  type ApiFormType,
} from "../../../services/formService";
import {
  clearFormTrash,
  getTrashedFormIds,
  getTrashedForms,
  removeFormFromTrash,
  restoreFormFromTrash,
  type TrashedForm,
} from "../../../services/formTrashService";

type TrainingFormSummary = ApiForm & {
  questionCount: number;
};

type StudentStats = {
  preScore: number | null;
  postScore: number | null;
  gain: number | null;
  answeredForms: number;
  totalForms: number;
  progress: number;
};

export default function TreinamentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [linkedUsers, setLinkedUsers] = useState<ApiUser[]>([]);
  const [trainingForms, setTrainingForms] = useState<TrainingFormSummary[]>([]);
  const [trashedForms, setTrashedForms] = useState<TrashedForm[]>([]);
  const [trainingResults, setTrainingResults] = useState<ApiFormAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFormsList, setShowFormsList] = useState(false);
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    workload: "",
    initDate: "",
    endDate: "",
    description: "",
  });

  useEffect(() => {
    async function loadTraining() {
      if (!id) {
        return;
      }

      try {
        const [trainingData, trainingUsers, apiForms, apiResults] = await Promise.all([
          getTrainingById(id),
          getTrainingUsers(id),
          getTrainingForms(id),
          getTrainingResults(id).catch(() => []),
        ]);
        const formsWithQuestionCount = await Promise.all(
          apiForms.map(async (formItem) => {
            const questions = await getFormQuestions(formItem.idForm);

            return {
              ...formItem,
              questionCount: questions.length,
            };
          }),
        );
        const trashedFormIds = getTrashedFormIds(id);

        setTraining(trainingData);
        setLinkedUsers(trainingUsers);
        setTrainingForms(
          formsWithQuestionCount.filter((formItem) => !trashedFormIds.has(formItem.idForm)),
        );
        setTrashedForms(getTrashedForms(id));
        setTrainingResults(apiResults);
        setForm({
          title: trainingData.title,
          workload: String(trainingData.workload),
          initDate: trainingData.initDate,
          endDate: trainingData.endDate,
          description: trainingData.description,
        });
      } catch {
        setErrorMessage("Nao foi possivel carregar esse treinamento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTraining();
  }, [id]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !training) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const updatedTraining = await updateTrainingImage(
          training.idTraining,
          String(reader.result),
        );

        setTraining(updatedTraining);
        setSuccessMessage("Foto do treinamento atualizada com sucesso.");
      } catch {
        setErrorMessage("Nao foi possivel atualizar a foto do treinamento.");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!training) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedTraining = await updateTraining(training.idTraining, {
        title: form.title,
        workload: Number(form.workload),
        initDate: form.initDate,
        endDate: form.endDate,
        description: form.description,
      });

      setTraining(updatedTraining);
      setIsEditing(false);
      setSuccessMessage("Treinamento atualizado com sucesso.");
    } catch {
      setErrorMessage("Nao foi possivel atualizar o treinamento.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-neutral-600">Carregando treinamento...</div>;
  if (!training) return <div className="p-8 text-red-700">{errorMessage || "Nenhum treinamento com esse id"}</div>;

  const preTestForms = trainingForms.filter((formItem) => formItem.formType === "PRE_TEST");
  const postTestForms = trainingForms.filter((formItem) => formItem.formType === "POST_TEST");
  const studentStats = buildStudentStats(linkedUsers, trainingForms, trainingResults);
  const analyticsStudents = buildAnalyticsStudents(linkedUsers, studentStats);

  const handleRestoreForm = (formId: string) => {
    const restoredForm = trashedForms.find((item) => item.form.idForm === formId)?.form;
    const nextTrash = restoreFormFromTrash(training.idTraining, formId);

    setTrashedForms(nextTrash);

    if (restoredForm) {
      setTrainingForms((current) =>
        [...current, { ...restoredForm, questionCount: 0 }].sort(compareFormsByTitle),
      );
    }
  };

  const handleDeleteFormForever = async (formId: string) => {
    const hasAnswers = trainingResults.some((answer) => answer.form.idForm === formId);

    if (hasAnswers) {
      setErrorMessage("Formulario ja tem respostas cadastradas.");
      setSuccessMessage("");
      return;
    }

    try {
      await deleteTrainingForm(formId);
      setTrashedForms(removeFormFromTrash(training.idTraining, formId));
    } catch {
      setErrorMessage("Nao foi possivel excluir definitivamente o formulario.");
      setSuccessMessage("");
    }
  };

  const handleEmptyFormsTrash = async () => {
    const formsWithAnswers = new Set(trainingResults.map((answer) => answer.form.idForm));
    const blockedForms = trashedForms.filter((item) =>
      formsWithAnswers.has(item.form.idForm),
    );

    if (blockedForms.length > 0) {
      setErrorMessage("Formulario ja tem respostas cadastradas.");
      setSuccessMessage("");
      return;
    }

    try {
      await Promise.all(trashedForms.map((item) => deleteTrainingForm(item.form.idForm)));
      clearFormTrash(training.idTraining);
      setTrashedForms([]);
    } catch {
      setErrorMessage("Nao foi possivel esvaziar toda a lixeira de formularios.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      {/* HEADER */}
      <Card className="overflow-hidden p-0 mb-6">
        {training.trainingImage && (
          <img
            src={training.trainingImage}
            alt={training.title}
            className="h-64 w-full object-cover"
          />
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {training.title}
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Edite os dados principais, carga horaria, periodo, descricao e foto.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isEditing && (
                <label className="cursor-pointer rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-50">
                  Trocar foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {!isEditing ? (
                <Button
                  type="button"
                  className="bg-primary text-white"
                  onPress={() => {
                    setIsEditing(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                >
                  Editar dados
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    className="bg-white text-primary border border-primary"
                    onPress={() => {
                      setIsEditing(false);
                      setForm({
                        title: training.title,
                        workload: String(training.workload),
                        initDate: training.initDate,
                        endDate: training.endDate,
                        description: training.description,
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-white"
                    isDisabled={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar alteracoes"}
                  </Button>
                </>
              )}
            </div>
          </div>

        {/* INFO BOXES */}
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
          <div className="bg-primary-50 p-4 rounded-md">
            <Label className="text-sm text-neutral-600">Carga Horária</Label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                value={form.workload}
                onChange={(e) => handleChange("workload", e.target.value)}
                className="mt-2 bg-white"
                required
              />
            ) : (
              <p className="font-bold text-lg">{training.workload}h</p>
            )}
          </div>

          <div className="bg-primary-50 p-4 rounded-md">
            <Label className="text-sm text-neutral-600">Início</Label>
            {isEditing ? (
              <Input
                type="date"
                value={form.initDate}
                onChange={(e) => handleChange("initDate", e.target.value)}
                className="mt-2 bg-white"
                required
              />
            ) : (
              <p className="font-bold text-lg">{training.initDate}</p>
            )}
          </div>

          <div className="bg-primary-50 p-4 rounded-md">
            <Label className="text-sm text-neutral-600">Término</Label>
            {isEditing ? (
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="mt-2 bg-white"
                required
              />
            ) : (
              <p className="font-bold text-lg">{training.endDate}</p>
            )}
          </div>
        </div>

        {/* DESCRIÇÃO */}
          {isEditing && (
            <div className="mb-4 flex flex-col gap-2">
              <Label className="text-sm font-semibold text-neutral-700">
                Titulo
              </Label>
              <Input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="bg-white"
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-neutral-700">
              Descricao
            </Label>
            {isEditing ? (
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-28 rounded-md border border-neutral-300 bg-white p-3 text-sm outline-none focus:border-primary"
                required
              />
            ) : (
              <p className="text-neutral-700">{training.description}</p>
            )}
          </div>

          {errorMessage && (
            <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}
        </form>
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

          <div className="flex flex-row items-center gap-2">
            <Button
              className="bg-primary text-white"
              onPress={() =>
                navigate(
                  `/painel/gerenciar-treinamentos/${training.idTraining}/formularios?acao=novo`,
                )
              }
            >
              Adicionar formulario +
            </Button>
            <Button
              className="bg-white text-primary border border-primary"
              onPress={() => setShowFormsList((current) => !current)}
            >
              {showFormsList ? "Ocultar formularios" : "Visualizar formularios"}
            </Button>
          </div>
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
            <p className="text-xl font-bold text-primary">{trainingForms.length}</p>
          </div>
        </div>

        {showFormsList && (
          <div className="mt-5">
            <FormListGroup
              forms={trainingForms}
              onOpen={(formId) =>
                navigate(
                  `/painel/gerenciar-treinamentos/${training.idTraining}/formularios?formId=${formId}`,
                )
              }
              trashedForms={trashedForms}
              onRestore={handleRestoreForm}
              onDeleteForever={handleDeleteFormForever}
              onEmptyTrash={handleEmptyFormsTrash}
            />
          </div>
        )}
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
              {linkedUsers.length} pessoas
            </span>
          </div>

          <div className="mb-4 flex flex-row items-center justify-end gap-2">
            <Button
              className="bg-primary text-white"
              onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}/adicionar-alunos`)}
            >
              Adicionar Alunos +
            </Button>
            <Button
              className="bg-white text-primary border border-primary"
              onPress={() => setShowStudentsList((current) => !current)}
            >
              {showStudentsList ? "Ocultar alunos" : "Visualizar alunos"}
            </Button>
          </div>

          {showStudentsList && (
            <div className="flex flex-col gap-3">
              {linkedUsers.map((user) => (
                <LinkedStudentCard
                  key={user.id}
                  user={user}
                  stats={studentStats[user.id] ?? createEmptyStudentStats(trainingForms.length)}
                  onInactiveStudent={() => {
                    setErrorMessage("Colaborador inativo.");
                    setSuccessMessage("");
                  }}
                />
              ))}
              {linkedUsers.length === 0 && (
                <p className="text-sm text-neutral-600">
                  Nenhum aluno vinculado a este treinamento ainda.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6 col-span-2">
          {analyticsStudents.length > 0 ? (
            <TrainingAnalyticsCharts students={analyticsStudents} />
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Estatisticas do treinamento
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                As estatisticas reais aparecerao quando houver formularios
                respondidos por colaboradores nos pre-testes e pos-testes.
              </p>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}

function LinkedStudentCard({
  user,
  stats,
  onInactiveStudent,
}: {
  user: ApiUser;
  stats: StudentStats;
  onInactiveStudent: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenStudent = () => {
    if (!user.active) {
      onInactiveStudent();
      return;
    }

    navigate(`/painel/colaboradores/${user.id}`);
  };

  return (
    <div
      className={`rounded-md border bg-white ${
        user.active ? "border-gray-200" : "border-red-100"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div className="flex items-center gap-4">
          <span
            role="button"
            tabIndex={0}
            title={user.active ? "Abrir dados do colaborador" : "Colaborador inativo"}
            onClick={(event) => {
              event.stopPropagation();
              handleOpenStudent();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                handleOpenStudent();
              }
            }}
            className={`rounded-full transition ${
              user.active
                ? "cursor-pointer hover:scale-105"
                : "cursor-not-allowed opacity-60"
            }`}
          >
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className={`size-14 rounded-full object-cover ${
                  user.active ? "" : "grayscale"
                }`}
              />
            ) : (
              <div
                className={`size-14 rounded-full flex items-center justify-center font-bold ${
                  user.active
                    ? "bg-primary-50 text-primary"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {user.name.charAt(0)}
              </div>
            )}
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenStudent();
                }}
                className={`font-semibold ${
                  user.active
                    ? "text-neutral-900 hover:text-primary"
                    : "cursor-not-allowed text-neutral-500"
                }`}
              >
                {user.name} {user.lastName}
              </button>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  user.active
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {user.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="text-sm text-neutral-600">{user.email}</p>
            {!user.active && (
              <p className="mt-1 text-xs font-medium text-red-600">
                Colaborador inativo
              </p>
            )}
          </div>
        </div>

        <span className="flex items-center gap-2 text-sm font-semibold text-primary">
          Estatisticas
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 bg-neutral-50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-white p-4">
              <p className="text-sm text-neutral-600">Pre-teste</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">
                {formatNullableScore(stats.preScore)}
              </p>
            </div>
            <div className="rounded-md bg-white p-4">
              <p className="text-sm text-neutral-600">Pos-teste</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">
                {formatNullableScore(stats.postScore)}
              </p>
            </div>
            <div className="rounded-md bg-white p-4">
              <p className="text-sm text-neutral-600">Ganho</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  stats.gain !== null && stats.gain >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {stats.gain === null ? "Sem dados" : `${stats.gain >= 0 ? "+" : ""}${stats.gain.toFixed(1)}`}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-neutral-700">Progresso no treinamento</span>
              <span className="text-neutral-600">
                {stats.answeredForms}/{stats.totalForms} formularios respondidos
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-300">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type FormListGroupProps = {
  forms: TrainingFormSummary[];
  onOpen: (formId: string) => void;
  trashedForms: TrashedForm[];
  onRestore: (formId: string) => void;
  onDeleteForever: (formId: string) => void;
  onEmptyTrash: () => void;
};

function FormListGroup({
  forms,
  onOpen,
  trashedForms,
  onRestore,
  onDeleteForever,
  onEmptyTrash,
}: FormListGroupProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-gray-200 bg-neutral-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Formularios criados</h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-600">
            {forms.length} formulario(s)
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {forms.map((form) => (
            <button
              key={form.idForm}
              type="button"
              onClick={() => onOpen(form.idForm)}
              className="rounded-md bg-white p-4 text-left shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {trainingFormTypeLabel(form.formType)}
                  </p>
                  <h4 className="font-semibold text-neutral-900">{form.title}</h4>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                  {form.questionCount} perguntas
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm text-neutral-600">
                <div>
                  <span>Inicio</span>
                  <p className="font-semibold text-neutral-900">
                    {form.initDate}
                  </p>
                </div>
                <div>
                  <span>Termino</span>
                  <p className="font-semibold text-neutral-900">
                    {form.endDate}
                  </p>
                </div>
                <div>
                  <span>Minimo</span>
                  <p className="font-semibold text-neutral-900">
                    {form.minCorrectPercentage}%
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

      <FormsTrashList
        forms={trashedForms}
        onRestore={onRestore}
        onDeleteForever={onDeleteForever}
        onEmptyTrash={onEmptyTrash}
      />
    </div>
  );
}

function FormsTrashList({
  forms,
  onRestore,
  onDeleteForever,
  onEmptyTrash,
}: {
  forms: TrashedForm[];
  onRestore: (formId: string) => void;
  onDeleteForever: (formId: string) => void;
  onEmptyTrash: () => void;
}) {
  return (
    <div className="rounded-md border border-red-100 bg-red-50 p-4">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-semibold text-red-800">Lixeira de formularios</h3>
          <p className="text-sm text-red-700">
            Formularios aqui ainda nao foram excluidos definitivamente.
          </p>
        </div>
        <Button
          className="bg-red-600 text-white"
          isDisabled={forms.length === 0}
          onPress={onEmptyTrash}
        >
          <Trash2 size={16} />
          Esvaziar lixeira
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {forms.map(({ form, deletedAt }) => (
          <div
            key={form.idForm}
            className="rounded-md bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {trainingFormTypeLabel(form.formType)}
                </p>
                <h4 className="font-semibold text-neutral-900">{form.title}</h4>
                <p className="mt-1 text-xs text-neutral-500">
                  Movido em {formatTrashDate(deletedAt)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="bg-primary text-white" onPress={() => onRestore(form.idForm)}>
                  <Undo2 size={16} />
                  Restaurar
                </Button>
                <Button className="bg-red-600 text-white" onPress={() => onDeleteForever(form.idForm)}>
                  <Trash2 size={16} />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}

        {forms.length === 0 && (
          <div className="rounded-md border border-dashed border-red-200 bg-white p-4 text-sm text-neutral-600">
            Lixeira vazia.
          </div>
        )}
      </div>
    </div>
  );
}

function trainingFormTypeLabel(type: ApiFormType) {
  return type === "PRE_TEST" ? "Pre-teste" : "Pos-teste";
}

function compareFormsByTitle(current: TrainingFormSummary, next: TrainingFormSummary) {
  return current.title.localeCompare(next.title, "pt-BR");
}

function formatTrashDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data indisponivel";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function buildStudentStats(
  users: ApiUser[],
  forms: TrainingFormSummary[],
  results: ApiFormAnswer[],
) {
  return users.reduce<Record<string, StudentStats>>((acc, user) => {
    const userResults = results.filter((answer) => answer.user?.id === user.id);
    const answeredFormIds = new Set(userResults.map((answer) => answer.form.idForm));
    const answeredForms = forms.filter((form) => answeredFormIds.has(form.idForm)).length;
    const preScore = averageScoreByType(userResults, "PRE_TEST");
    const postScore = averageScoreByType(userResults, "POST_TEST");
    const gain = preScore !== null && postScore !== null ? postScore - preScore : null;

    acc[user.id] = {
      preScore,
      postScore,
      gain,
      answeredForms,
      totalForms: forms.length,
      progress: forms.length > 0 ? Math.round((answeredForms / forms.length) * 100) : 0,
    };

    return acc;
  }, {});
}

function buildAnalyticsStudents(
  users: ApiUser[],
  statsByUser: Record<string, StudentStats>,
): StudentTrainingAnalytics[] {
  return users
    .map((user) => {
      const stats = statsByUser[user.id];

      if (!stats || (stats.preScore === null && stats.postScore === null)) {
        return null;
      }

      return {
        nome: `${user.name} ${user.lastName}`,
        quizResults: [
          { phase: "pre" as const, score: stats.preScore ?? 0 },
          { phase: "post" as const, score: stats.postScore ?? 0 },
        ],
      };
    })
    .filter((student): student is StudentTrainingAnalytics => Boolean(student));
}

function averageScoreByType(results: ApiFormAnswer[], type: ApiFormType) {
  const scores = results
    .filter((answer) => answer.form.formType === type)
    .map((answer) => answer.scorePercentage / 10);

  if (scores.length === 0) {
    return null;
  }

  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function createEmptyStudentStats(totalForms: number): StudentStats {
  return {
    preScore: null,
    postScore: null,
    gain: null,
    answeredForms: 0,
    totalForms,
    progress: 0,
  };
}

function formatNullableScore(value: number | null) {
  return value === null ? "Sem dados" : value.toFixed(1);
}
