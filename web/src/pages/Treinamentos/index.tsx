import { useState } from "react";
import { Button, Input, Card } from "@heroui/react";

interface Training {
    id: number;
    title: string;
    hours: number;
    progress: number;
    startDate: string;
    endDate: string;
    daysLeft: number;
    status: "em-andamento" | "concluido" | "avaliacao" | "pre-avaliacao" | "breve" | "pendencias";
}

const trainingsMock: Training[] = [
    {
        id: 1,
        title: "LGPD e Proteção de Dados",
        hours: 72,
        progress: 40,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 5,
        status: "em-andamento",
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
        progress: 100,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 0,
        status: "pre-avaliacao",
    },
    {
        id: 4,
        title: "Lorem ipsum dolor",
        hours: 72,
        progress: 0,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 15,
        status: "breve",
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
        progress: 100,
        startDate: "20/05",
        endDate: "30/06",
        daysLeft: 0,
        status: "pendencias",
    },
];

type StatusFilter = "todos" | "em-andamento" | "concluido" | "oculto";

export const Treinamentos = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("todos");

    const filteredTrainings = trainingsMock.filter((training) => {
        const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getButtonStyle = (training: Training) => {
        switch (training.status) {
            case "em-andamento":
                return {
                    bgColor: "#F5A623",
                    text: `Expira em ${training.daysLeft} dias`,
                };
            case "avaliacao":
                return {
                    bgColor: "#17C964",
                    text: "Avaliação Final Disponível",
                };
            case "pre-avaliacao":
                return {
                    bgColor: "#006FEE",
                    text: "Pré-avaliação Disponível",
                };
            case "breve":
                return {
                    bgColor: "#616161",
                    text: "Em Breve",
                };
            case "concluido":
                return {
                    bgColor: "#BDBDBD",
                    text: "Concluído",
                };
            case "pendencias":
                return {
                    bgColor: "#616161",
                    text: "Concluído com Pendências",
                };
        }
    };

    const getProgressBarColor = (status: Training["status"]) => {
        switch (status) {
            case "em-andamento":
                return "#F5A623";
            case "avaliacao":
            case "pre-avaliacao":
            case "concluido":
                return "#17C964";
            case "pendencias":
                return "#17C964";
            case "breve":
                return "#BDBDBD";
            default:
                return "#F5A623";
        }
    };

    return (
        <div className="p-8 bg-neutral-50 min-h-screen">
            {/* Header com busca e filtro */}
            <div className="mb-6 flex items-center gap-4">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Procurar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                        startContent={
                            <svg
                                className="w-5 h-5 text-neutral-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        }
                    />
                </div>
                <Button className="bg-primary text-white font-semibold px-6 flex items-center gap-2">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                    Filtrar
                </Button>
            </div>

            {/* Abas de status */}
            <div className="flex gap-3 flex-wrap mb-8">
                <button
                    onClick={() => setSelectedStatus("todos")}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "todos"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setSelectedStatus("em-andamento")}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "em-andamento"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Em Andamento
                </button>
                <button
                    onClick={() => setSelectedStatus("concluido")}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "concluido"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Concluído
                </button>
                <button
                    onClick={() => setSelectedStatus("oculto")}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedStatus === "oculto"
                            ? "bg-secondary text-white"
                            : "bg-white text-secondary border-2 border-secondary hover:bg-secondary-50"
                    }`}
                >
                    Ocultos
                </button>
            </div>

            {/* Grid de treinamentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrainings.map((training) => {
                    const buttonStyle = getButtonStyle(training);
                    const progressColor = getProgressBarColor(training.status);

                    return (
                        <Card
                            key={training.id}
                            className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-2xl"
                        >
                            {/* Imagem/Header azul */}
                            <div className="w-full h-40 bg-gradient-to-br from-primary-200 to-primary-400 relative flex items-start justify-end p-4">
                                <button className="bg-neutral-300 hover:bg-neutral-400 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ocultar
                                </button>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-5 flex flex-col gap-4">
                                {/* Título */}
                                <h3 className="font-bold text-neutral-900 text-lg">
                                    {training.title}
                                </h3>

                                {/* Horas */}
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">{training.hours} horas</span>
                                </div>

                                {/* Progresso */}
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

                                {/* Botão de ação */}
                                <Button
                                    className="w-full text-white font-semibold py-3 rounded-xl transition-all text-base"
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

            {/* Mensagem quando não há resultados */}
            {filteredTrainings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-neutral-600">Nenhum treinamento encontrado</p>
                </div>
            )}
        </div>
    );
};