import { useEffect, useState } from "react";
import { Button, Input, Card } from "@heroui/react";
import type { Training } from "../../types/Training";

const trainingsMock: Training[] = [
    {
        id: 1,
        title: "LGPD e Proteção de Dados",
        hours: 72,
        progress: 10,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 5,
        status: "em_andamento",
    },
    {
        id: 2,
        title: "Lorem ipsum dolor",
        hours: 72,
        progress: 85,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 2,
        status: "avaliacao",
    },
    {
        id: 3,
        title: "Lorem ipsum dolor",
        hours: 72,
        progress: 15,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 0,
        status: "pre_avaliacao",
    },
    {
        id: 4,
        title: "Lorem ipsum dolor",
        hours: 72,
        progress: 0,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 15,
        status: "aguardando_feedback",
    },
    {
        id: 5,
        title: "Lorem ipsum dolor",
        hours: 72,
        progress: 100,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 0,
        status: "concluido",
    },
    {
        id: 6,
        title: "Lorem ipsum dolor",
        hours: 72,
        progress: 85,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 0,
        status: "pendencia",
    },
];

type StatusFilter = "todos" | "em_andamento" | "concluido" | "oculto";

export const Treinamentos = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("todos");
    const [trainings, setTrainings] = useState<Training[]>(trainingsMock);

    useEffect(() => {
        let result = trainingsMock;
        if(searchTerm !== "") {
            result = result.filter((training) => (
                training.title.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        }

        if(selectedStatus !== "todos") {
            result = result.filter((training) => (
                training.status === selectedStatus
            ));
        }

        setTrainings(result);
    }, [selectedStatus, searchTerm]);

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
                <button
                    onClick={() => setSelectedStatus("todos")}
                    className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "todos"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setSelectedStatus("em_andamento")}
                    className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "em_andamento"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Em Andamento
                </button>
                <button
                    onClick={() => setSelectedStatus("concluido")}
                    className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "concluido"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Concluído
                </button>
                <button
                    onClick={() => setSelectedStatus("oculto")}
                    className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "oculto"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Ocultos
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainings.map((training) => {
                    const buttonStyle = getButtonStyle(training);
                    const progressColor = getProgressBarColor(training.status);

                    return (
                        <Card
                            key={training.id}
                            className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-md p-0"
                        >
                            <div className="w-full h-40 bg-linear-to-br from-primary-200 to-primary-400 relative flex items-start justify-end p-4">
                                <button className="bg-neutral-300 hover:bg-neutral-400 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ocultar
                                </button>
                            </div>

                            <div className="p-5 flex flex-col gap-4">
                                <h3 className="font-bold text-neutral-900 text-lg">
                                    {training.title}
                                </h3>

                                <div className="flex items-center gap-2 text-neutral-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">{training.hours} horas</span>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-neutral-900">Progresso: {training.progress}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-300 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full transition-all rounded-full"
                                            style={{
                                                width: `${training.progress}%`,
                                                backgroundColor: progressColor,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Datas */}
                                <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F5A623" }}></span>
                                        <span className="text-neutral-600">
                                            <strong>Início:</strong> {training.startDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F5A623" }}></span>
                                        <span className="text-neutral-600">
                                            <strong>Término:</strong> {training.endDate}
                                        </span>
                                    </div>
                                </div>
                                
                                <Button
                                    className="w-full text-white font-semibold py-3 rounded-md transition-all text-base"
                                    style={{
                                        backgroundColor: buttonStyle.bgColor,
                                    }}
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