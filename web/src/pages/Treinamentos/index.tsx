import { useEffect, useState } from "react";
import { Button, Input, Card } from "@heroui/react";
import type { Training } from "../../types/Training";
import { trainingsMock } from "../../mock";
import { useNavigate } from "react-router-dom"; // 👈 add

type StatusFilter = "todos" | "em_andamento" | "concluido" | "oculto";

export const Treinamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("todos");
  const [trainings, setTrainings] = useState<Training[]>(trainingsMock);

  const navigate = useNavigate(); // 👈 add

  useEffect(() => {
    let result = trainingsMock;

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
  }, [selectedStatus, searchTerm]);

  const handleClick = (id: number) => {
    navigate(`/painel/treinamentos/${id}`); // 👈 rota de detalhes
  };

  const getButtonStyle = (training: Training) => {
    switch (training.status) {
      case "em_andamento":
        return {
          bgColor: "#F5A623",
          text: `Expira em ${training.daysLeft} dias`,
        };
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
    }
  };

  const getProgressBarColor = (status: Training["status"]) => {
    switch (status) {
      case "pre_avaliacao":
        return "bg-primary";
      case "em_andamento":
        return "#F5A623";
      case "avaliacao":
        return "bg-primary";
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
      <div className="mb-6 flex items-center gap-4 w-full">
        <Input
          type="text"
          placeholder="Procurar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white flex-1"
        />
        <div className="flex-1" />
      </div>

      <div className="flex gap-3 flex-wrap mb-8">
        {/* filtros (mantidos iguais) */}
        {["todos", "em_andamento", "concluido", "oculto"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status as StatusFilter)}
            className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
              selectedStatus === status
                ? "bg-primary text-white"
                : "bg-white text-primary border-2 border-primary hover:bg-primary-50"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => {
          const buttonStyle = getButtonStyle(training);
          const progressColor = getProgressBarColor(training.status);

          return (
            <Card
              key={training.id}
              onClick={() => handleClick(training.id)} // 👈 click no card
              className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-md p-0 cursor-pointer"
            >
              <div className="w-full h-40 bg-linear-to-br from-primary-200 to-primary-400 relative flex items-start justify-end p-4">
                {/* botão não propaga clique */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 👈 ESSENCIAL
                    console.log("ocultar", training.id);
                  }}
                  className="bg-neutral-300 hover:bg-neutral-400 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  Ocultar
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
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-neutral-900">
                      Progresso: {training.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-300 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: `${training.progress}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <span className="text-neutral-600">
                    <strong>Início:</strong> {training.startDate}
                  </span>
                  <span className="text-neutral-600">
                    <strong>Término:</strong> {training.endDate}
                  </span>
                </div>

                <Button
                  className="w-full text-white font-semibold py-3 rounded-md"
                  style={{ backgroundColor: buttonStyle?.bgColor }}
                >
                  {buttonStyle?.text}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
