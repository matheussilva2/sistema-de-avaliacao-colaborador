import { Card, Button, Input, Label } from "@heroui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TrainingAnalyticsCharts from "./components/TrainingAnalyticsCharts";
import { getTrainingAnalyticsById } from "../mocks/trainingAnalytics";
import { getFormsByTrainingId, trainingFormTypeLabel } from "../mocks/trainingForms";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  getTrainingById,
  getTrainingUsers,
  type ApiTraining,
  updateTraining,
  updateTrainingImage,
} from "../../../services/trainingService";
import type { ApiUser } from "../../../services/authService";

export default function TreinamentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [training, setTraining] = useState<ApiTraining | null>(null);
  const [linkedUsers, setLinkedUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    workload: "",
    initDate: "",
    endDate: "",
    description: "",
  });

  const numericMockId = Number(id);
  const hasNumericMockId = Number.isFinite(numericMockId);
  const analytics = hasNumericMockId ? getTrainingAnalyticsById(numericMockId) : null;
  const forms = hasNumericMockId ? getFormsByTrainingId(numericMockId) : [];

  useEffect(() => {
    async function loadTraining() {
      if (!id) {
        return;
      }

      try {
        const [trainingData, trainingUsers] = await Promise.all([
          getTrainingById(id),
          getTrainingUsers(id),
        ]);
        setTraining(trainingData);
        setLinkedUsers(trainingUsers);
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

  const preTestForms = forms.filter((form) => form.type === "pre-teste");
  const postTestForms = forms.filter((form) => form.type === "pos-teste");

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

          <Button
            className="bg-primary text-white"
            onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}/formularios`)}
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
              {linkedUsers.length} pessoas
            </span>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              className="bg-primary text-white"
              onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}/adicionar-alunos`)}
            >
              Adicionar Alunos +
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {linkedUsers.map((user) => (
              <LinkedStudentCard key={user.id} user={user} />
            ))}
            {linkedUsers.length === 0 && (
              <p className="text-sm text-neutral-600">
                Nenhum aluno vinculado a este treinamento ainda.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 col-span-2">
          {analytics ? (
            <TrainingAnalyticsCharts students={analytics.students} />
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Estatisticas do treinamento
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                As estatisticas reais aparecerao quando houver formularios
                respondidos por colaboradores. Os graficos anteriores vinham de
                dados mocados e foram removidos para este treinamento real.
              </p>
            </div>
          )}
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
              onOpen={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}/formularios?tipo=pre-teste`)}
            />
            <FormListGroup
              title="Pos-teste"
              forms={postTestForms}
              onOpen={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}/formularios?tipo=pos-teste`)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function LinkedStudentCard({ user }: { user: ApiUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div className="flex items-center gap-4">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <div className="size-14 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0)}
            </div>
          )}

          <div>
            <p className="font-semibold text-neutral-900">
              {user.name} {user.lastName}
            </p>
            <p className="text-sm text-neutral-600">{user.email}</p>
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
              <p className="mt-1 text-lg font-bold text-neutral-900">Sem dados</p>
            </div>
            <div className="rounded-md bg-white p-4">
              <p className="text-sm text-neutral-600">Pos-teste</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">Sem dados</p>
            </div>
            <div className="rounded-md bg-white p-4">
              <p className="text-sm text-neutral-600">Ganho</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">Sem dados</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-neutral-600">
            As estatisticas do colaborador aparecerao aqui quando houver
            formularios respondidos neste treinamento.
          </p>
        </div>
      )}
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
