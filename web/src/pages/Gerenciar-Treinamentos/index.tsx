import { Button, Input, Card } from "@heroui/react";
import { Eye, EyeOff, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Training } from "../../types/Training";
import { trainingsMock } from "../../mock";
import { useEffect, useState } from "react";

type StatusFilter = "todos" | "em_andamento" | "concluido" | "oculto";

export const GerenciarTreinamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("todos");

  const [allTrainings, setAllTrainings] = useState<Training[]>(trainingsMock);
  const [trainings, setTrainings] = useState<Training[]>(trainingsMock);
  const [hiddenStatusMap, setHiddenStatusMap] = useState<Record<number, Training["status"]>>({});

  const navigate = useNavigate();

  useEffect(() => {
    let result = allTrainings;

    if (searchTerm !== "") {
      result = result.filter((training) =>
        training.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedStatus === "oculto") {
      result = result.filter((training) => training.status === "oculto");
    } else if (selectedStatus !== "todos") {
      result = result.filter((training) => training.status === selectedStatus);
    } else {
      result = result.filter((training) => training.status !== "oculto");
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrainings(result);
  }, [selectedStatus, searchTerm, allTrainings]);

  // 🔥 ocultar treinamento
  const toggleOculto = (id: number) => {
    const training = allTrainings.find((t) => t.id === id);
    if (!training) return;

    if (training.status === "oculto") {
      const originalStatus = hiddenStatusMap[id] ?? "em_andamento";
      setAllTrainings((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: originalStatus } : t)),
      );
      setHiddenStatusMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setHiddenStatusMap((prev) => ({ ...prev, [id]: training.status }));
      setAllTrainings((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "oculto" } : t)),
      );
    }
  };

  const getButtonStyle = (training: Training) => {
    switch (training.status) {
      case "em_andamento":
        if (training.daysLeft) {
          return {
            bgColor: "#F5A623",
            text: `Expira em ${training.daysLeft} dias`,
          };
        } else {
          return {
            bgColor: "#006FEE",
            text: "Em Andamento",
          };
        }
      case "avaliacao":
        return {
          bgColor: "#17C964",
          text: "Avaliação Final Disponível",
        };
      case "pre_avaliacao":
        return {
          bgColor: "#006FEE",
          text: "Pré-avaliação Disponível",
        };
      case "pendencia":
        return {
          bgColor: "#616161",
          text: "Concluído com Pendências",
        };
      case "aguardando_feedback":
        return {
          bgColor: "#616161",
          text: "Aguardando Feedback",
        };
      case "concluido":
        return {
          bgColor: "#BDBDBD",
          text: "Concluído",
        };
      case "oculto":
        return {
          bgColor: "#999",
          text: "Oculto",
        };
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">

      {/* HEADER */}
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
          onPress={() => {
            navigate("/painel/gerenciar-treinamentos/novo-treinamento")  
          }}
        >
          + Novo Treinamento
        </Button>
      </div>

      {/* FILTROS */}
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
              ? "Concluído"
              : "Ocultos"}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => {
          const buttonStyle = getButtonStyle(training);

          return (
            <Card
              key={training.id}
              onClick={() => navigate(`/painel/gerenciar-treinamentos/${training.id}`)}
              className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-md p-0 cursor-pointer"
            >
              <div className="w-full h-40 bg-linear-to-br from-primary-200 to-primary-400 relative flex items-start justify-end p-4">

                {/* BOTÃO OLHO */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOculto(training.id);
                  }}
                  className="bg-neutral-300 hover:bg-neutral-400 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {training.status === "oculto" ? (
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
                <h3 className="font-bold text-neutral-900 text-lg">
                  {training.title}
                </h3>

                <div className="flex flex-col gap-2 text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span className="font-medium">{training.hours} horas</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>
                      <strong>Início:</strong> {training.startDate}
                    </span>
                    <span>
                      <strong>Término:</strong> {training.endDate}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full text-white font-semibold py-3 rounded-md"
                  style={{ backgroundColor: buttonStyle.bgColor }}
                  onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.id}`)}
                >
                  {buttonStyle.text}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {trainings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600">Nenhum treinamento encontrado</p>
        </div>
      )}
    </div>
  );
};