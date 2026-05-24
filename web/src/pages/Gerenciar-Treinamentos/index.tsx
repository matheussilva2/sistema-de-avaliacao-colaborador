import { Button, Input, Card } from "@heroui/react";
import { Eye, EyeOff, Clock, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getAuthenticatedUser } from "../../services/authService";
import {
  getTrainingsByManager,
  readTrainingsCache,
  sortTrainingsStable,
  type ApiTraining,
  writeTrainingsCache,
} from "../../services/trainingService";

type StatusFilter = "todos" | "em_andamento" | "concluido" | "oculto";

const hiddenTrainingsKey = "hiddenTrainings";
const managerTrainingsCachePrefix = "managerTrainings";

export const GerenciarTreinamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("todos");
  const [trainings, setTrainings] = useState<ApiTraining[]>([]);
  const [hiddenTrainingIds, setHiddenTrainingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedHiddenTrainings = localStorage.getItem(hiddenTrainingsKey);

    if (storedHiddenTrainings) {
      setHiddenTrainingIds(JSON.parse(storedHiddenTrainings) as string[]);
    }
  }, []);

  useEffect(() => {
    async function loadTrainings() {
      const manager = getAuthenticatedUser();

      if (!manager || manager.userRole !== "MANAGER") {
        setErrorMessage("Faca login como gestor para gerenciar treinamentos.");
        setIsLoading(false);
        return;
      }

      const cacheKey = `${managerTrainingsCachePrefix}:${manager.id}`;
      const cachedTrainings = readTrainingsCache(cacheKey);

      if (cachedTrainings) {
        setTrainings(sortTrainingsStable(cachedTrainings));
        setIsLoading(false);
      }

      try {
        const managerTrainings = await getTrainingsByManager(manager.id);
        const sortedTrainings = sortTrainingsStable(managerTrainings);
        setTrainings(sortedTrainings);
        writeTrainingsCache(cacheKey, sortedTrainings);
      } catch {
        setErrorMessage("Nao foi possivel carregar os treinamentos deste gestor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTrainings();
  }, []);

  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const isHidden = hiddenTrainingIds.includes(training.idTraining);
      const isConcluded = isTrainingConcluded(training.endDate);
      const matchesSearch = training.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (selectedStatus === "oculto") {
        return isHidden;
      }

      if (selectedStatus === "concluido") {
        return !isHidden && isConcluded;
      }

      if (selectedStatus === "em_andamento") {
        return !isHidden && !isConcluded;
      }

      return !isHidden;
    });
  }, [hiddenTrainingIds, searchTerm, selectedStatus, trainings]);

  const toggleOculto = (id: string) => {
    setHiddenTrainingIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((trainingId) => trainingId !== id)
        : [...prev, id];

      localStorage.setItem(hiddenTrainingsKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex items-center gap-4 w-full">
        <Input
          type="text"
          placeholder="Procurar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white flex-1"
        />

        <Button
          className="bg-primary text-white"
          onPress={() => navigate("/painel/gerenciar-treinamentos/novo-treinamento")}
        >
          + Novo Treinamento
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap mb-8">
        {(["todos", "em_andamento", "concluido", "oculto"] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
              selectedStatus === status
                ? "bg-primary text-white"
                : "bg-white text-primary border-2 border-primary hover:bg-primary-50"
            }`}
          >
            {status === "todos"
              ? "Todos"
              : status === "em_andamento"
                ? "Em Andamento"
                : status === "concluido"
                  ? "Concluidos"
                : "Ocultos"}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-neutral-600">Carregando treinamentos...</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.map((training) => {
            const isHidden = hiddenTrainingIds.includes(training.idTraining);
            const isConcluded = isTrainingConcluded(training.endDate);
            const imageUrl = training.trainingImage;

            return (
              <Card
                key={training.idTraining}
                onClick={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}`)}
                className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-md p-0 cursor-pointer"
              >
                <div className="w-full h-44 bg-primary-50 relative flex items-start justify-end p-4 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={training.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-primary-100 to-primary-400" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOculto(training.idTraining);
                    }}
                    className="relative bg-white/90 hover:bg-white text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors shadow"
                  >
                    {isHidden ? (
                      <>
                        <EyeOff size={14} /> Mostrar
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Ocultar
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">
                      {training.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-neutral-600">
                      {training.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span className="font-medium">{training.workload} horas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays size={16} />
                      <span>
                        <strong>Inicio:</strong> {training.initDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays size={16} />
                      <span>
                        <strong>Termino:</strong> {training.endDate}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full text-white font-semibold py-3 rounded-md"
                    style={{
                      backgroundColor: isConcluded ? "#71717a" : "#006FEE",
                    }}
                    onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.idTraining}`)}
                  >
                    {isConcluded ? "Concluido" : "Gerenciar treinamento"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredTrainings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600">Nenhum treinamento encontrado</p>
        </div>
      )}
    </div>
  );
};

function isTrainingConcluded(endDate: string) {
  if (!endDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trainingEndDate = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(trainingEndDate.getTime())) {
    return false;
  }

  return trainingEndDate < today;
}
