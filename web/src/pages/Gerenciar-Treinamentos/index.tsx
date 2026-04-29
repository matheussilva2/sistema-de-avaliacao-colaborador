import { Button, Input, Card } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
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

  const navigate = useNavigate();

  useEffect(() => {
    let result = allTrainings;

    if (searchTerm !== "") {
      result = result.filter((training) =>
        training.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedStatus !== "todos") {
      result = result.filter((training) => training.status === selectedStatus);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrainings(result);
  }, [selectedStatus, searchTerm, allTrainings]);

  // 🔥 ocultar treinamento
  const toggleOculto = (id: number) => {
    setAllTrainings((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "oculto" ? "em_andamento" : "oculto",
            }
          : t,
      ),
    );
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

  const getProgressBarColor = (status: Training["status"]) => {
    switch (status) {
      case "pre_avaliacao":
        return "#176dc9";
      case "em_andamento":
        return "#F5A623";
      case "avaliacao":
        return "#006FEE";
      case "aguardando_feedback":
        return "#BDBDBD";
      case "concluido":
        return "#17C964";
      case "pendencia":
        return "#F5A623";
      default:
        return "#F5A623";
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
          const progressColor = getProgressBarColor(training.status);

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

                <div className="flex items-center gap-2 text-neutral-600">
                  <span className="font-medium">{training.hours} horas</span>
                </div>

                <div>
                  <span className="font-semibold text-neutral-900">
                    Progresso: {training.progress}%
                  </span>

                  <div className="w-full bg-neutral-300 rounded-full h-2 mt-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${training.progress}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full text-white font-semibold py-3 rounded-md"
                  style={{ backgroundColor: buttonStyle.bgColor }}
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