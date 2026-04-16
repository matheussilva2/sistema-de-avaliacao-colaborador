import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Input, Checkbox } from "@heroui/react";

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

type Tab = "pre-teste" | "satisfacao" | "pos-teste";

export const DetalhesTrainamento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("pre-teste");
    const [ratings, setRatings] = useState({
        relevancia: 0,
        instrutor: 0,
        material: 0,
        duracao: 0,
    });
    const [feedback, setFeedback] = useState("");
    const [posTesteAnswers, setPosTesteAnswers] = useState({
        q1: "",
        q2: "",
        q3: "",
    });

    const training = trainingsMock.find((t) => t.id === Number(id));

    if (!training) {
        return (
            <div className="p-8">
                <p className="text-neutral-600">Treinamento não encontrado</p>
                <Button onClick={() => navigate("/painel/treinamentos")} className="mt-4 bg-primary text-white">
                    Voltar
                </Button>
            </div>
        );
    }

    const renderStars = (rating: number, onRate: (value: number) => void, label: string) => {
        return (
            <div className="mb-4">
                <label className="block text-neutral-700 font-semibold mb-2">{label}</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => onRate(star)}
                            className="transition-all hover:scale-110"
                        >
                            <span className={`text-2xl ${star <= rating ? "text-blue-500" : "text-neutral-300"}`}>★</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 bg-neutral-50 min-h-screen">
            {/* Header com voltar */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Dados do Treinamento do Aluno</h1>
                </div>
                <Button
                    onClick={() => navigate("/painel/treinamentos")}
                    className="bg-neutral-200 text-neutral-700 font-semibold"
                >
                    ← Voltar
                </Button>
            </div>

            {/* Card com info do treinamento */}
            <Card className="mb-8 bg-white">
                <div className="flex items-center justify-between p-6 rounded-lg bg-primary-100 border-2 border-primary-200">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900">{training.title}</h2>
                        <p className="text-neutral-600">Compliance</p>
                    </div>
                    <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-semibold">
                        Em treinamento
                    </span>
                </div>

                {/* Info detalhes */}
                <div className="grid grid-cols-4 gap-4 mb-6 mt-6 p-6">
                    <div className="bg-primary-100 p-4 rounded-lg border-2 border-primary-200">
                        <p className="text-neutral-600 text-sm font-semibold">Tipo</p>
                        <p className="text-neutral-900 font-bold">Presencial</p>
                    </div>
                    <div className="bg-primary-100 p-4 rounded-lg border-2 border-primary-200">
                        <p className="text-neutral-600 text-sm font-semibold">Carga Horária</p>
                        <p className="text-neutral-900 font-bold">8h</p>
                    </div>
                    <div className="bg-primary-100 p-4 rounded-lg border-2 border-primary-200">
                        <p className="text-neutral-600 text-sm font-semibold">Data de Início</p>
                        <p className="text-neutral-900 font-bold">05/06/2026</p>
                    </div>
                    <div className="bg-primary-100 p-4 rounded-lg border-2 border-primary-200">
                        <p className="text-neutral-600 text-sm font-semibold">Data do Fim</p>
                        <p className="text-neutral-900 font-bold">25/06/2026</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b-2 border-neutral-200">
                    <button
                        onClick={() => setActiveTab("pre-teste")}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === "pre-teste"
                                ? "text-primary border-b-4 border-primary -mb-0.5"
                                : "text-neutral-600 hover:text-neutral-900"
                        }`}
                    >
                        PRÉ-TESTE
                    </button>
                    <button
                        onClick={() => setActiveTab("satisfacao")}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === "satisfacao"
                                ? "text-primary border-b-4 border-primary -mb-0.5"
                                : "text-neutral-600 hover:text-neutral-900"
                        }`}
                    >
                        SATISFAÇÃO
                    </button>
                    <button
                        onClick={() => setActiveTab("pos-teste")}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === "pos-teste"
                                ? "text-primary border-b-4 border-primary -mb-0.5"
                                : "text-neutral-600 hover:text-neutral-900"
                        }`}
                    >
                        PÓS-TESTE
                    </button>
                </div>

                {/* Conteúdo dos Tabs */}
                <div className="mt-8 p-6">
                    {/* PRÉ-TESTE */}
                    {activeTab === "pre-teste" && (
                        <div>
                            <div className="bg-primary-100 p-4 rounded-lg mb-6">
                                <h3 className="font-bold text-neutral-900 mb-2">Pré-teste - Resultado</h3>
                            </div>

                            {/* Acertos e Mínimo Exigido */}
                            <div className="grid grid-cols-2 gap-4 mb-8 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <p className="text-neutral-600 text-sm font-semibold mb-1">Acertos</p>
                                    <p className="text-neutral-900 font-bold text-lg">3 de 5</p>
                                </div>
                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <p className="text-neutral-600 text-sm font-semibold mb-1">Mínimo Exigido</p>
                                    <p className="text-neutral-900 font-bold text-lg">0 de 5</p>
                                </div>
                            </div>

                            {/* Pergunta 1 */}
                            <div className="mb-8 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <p className="font-bold text-neutral-900 mb-4 text-base">1) O que é a LGPD?</p>

                                {/* Opções de resposta */}
                                <div className="space-y-3">
                                    {/* Opção 1 - Neutra */}
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                                        <input type="radio" className="mt-1" disabled />
                                        <div className="flex items-start gap-2 w-full">
                                            <span className="text-neutral-400 text-lg mt-1">●</span>
                                            <span className="text-neutral-700">Um sistema de segurança cibernética criado pelo governo federal para proteger redes de computadores contra ataques.</span>
                                        </div>
                                    </div>

                                    {/* Opção 2 - Verde (Correta) */}
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-100 border-2 border-green-300">
                                        <input type="radio" className="mt-1" disabled />
                                        <div className="flex items-start gap-2 w-full">
                                            <span className="text-green-600 text-lg mt-1">✓</span>
                                            <span className="text-neutral-900 font-medium">Uma lei brasileira que regula a coleta, o armazenamento e o uso de dados pessoais por empresas e órgãos públicos.</span>
                                        </div>
                                    </div>

                                    {/* Opção 3 - Neutra */}
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                                        <input type="radio" className="mt-1" disabled />
                                        <div className="flex items-start gap-2 w-full">
                                            <span className="text-neutral-400 text-lg mt-1">●</span>
                                            <span className="text-neutral-700">Um protocolo internacional de criptografia adotado pelo Brasil para garantir a segurança de transações de empresas e órgãos públicos.</span>
                                        </div>
                                    </div>

                                    {/* Opção 4 - Rosa/Vermelha (Incorreta) */}
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-pink-100 border-2 border-pink-300">
                                        <input type="radio" className="mt-1" disabled />
                                        <div className="flex items-start gap-2 w-full">
                                            <span className="text-pink-600 text-lg mt-1">✕</span>
                                            <span className="text-neutral-900 font-medium">Uma norma técnica da ABNT que estabelece padrões de qualidade de software desenvolvidos no território nacional. (Sua resposta)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pergunta 2 */}
                            <div className="mb-6 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <p className="font-bold text-neutral-900 mb-4 text-base">2) Como a sua equipe lida com dados pessoais?</p>
                                <Input
                                    type="text"
                                    placeholder="Nessa equipe coleta dados de clientes por formulário e os armazena no sistema interno. Não temos política formal definida ainda."
                                    className="w-full"
                                />
                            </div>

                            <Button className="w-full bg-primary text-white font-semibold py-3 rounded-lg">
                                Salvar Alterações
                            </Button>
                        </div>
                    )}

                    {/* SATISFAÇÃO */}
                    {activeTab === "satisfacao" && (
                        <div>
                            <div className="bg-primary-100 p-4 rounded-lg mb-6">
                                <h3 className="font-bold text-neutral-900 mb-2">Avaliar Treinamento</h3>
                            </div>

                            <div className="space-y-6">
                                {renderStars(
                                    ratings.relevancia,
                                    (val) => setRatings({ ...ratings, relevancia: val }),
                                    "Quão relevante foi o conteúdo para o trabalho diário (1 a 5)?"
                                )}

                                {renderStars(
                                    ratings.instrutor,
                                    (val) => setRatings({ ...ratings, instrutor: val }),
                                    "Deme uma avaliação para o(a) instrutor(a) (1 a 5)?"
                                )}

                                {renderStars(
                                    ratings.material,
                                    (val) => setRatings({ ...ratings, material: val }),
                                    "O que você achou da avaliação final?"
                                )}

                                {renderStars(
                                    ratings.duracao,
                                    (val) => setRatings({ ...ratings, duracao: val }),
                                    "Gostaria de deixar um comentário adicional?"
                                )}

                                <div className="mt-6">
                                    <label className="block text-neutral-700 font-semibold mb-2">Deixe um comentário:</label>
                                    <Input
                                        type="text"
                                        placeholder="Deixe um comentário..."
                                        className="w-full"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button className="w-full mt-6 bg-primary text-white font-semibold py-3">
                                Salvar Alterações
                            </Button>
                        </div>
                    )}

                    {/* PÓS-TESTE */}
                    {activeTab === "pos-teste" && (
                        <div>
                            <div className="bg-primary-100 p-4 rounded-lg mb-6">
                                <h3 className="font-bold text-neutral-900 mb-2">Pós-teste - Resultado</h3>
                            </div>

                            <Button className="w-full mb-6 bg-primary text-white font-semibold py-3">
                                Iniciar Teste
                            </Button>

                            <div className="space-y-4">
                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Checkbox />
                                        <div>
                                            <p className="font-semibold text-neutral-900">
                                                Acertos: 3 de 5
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-neutral-600">
                                        <p className="text-sm">Mínimo Exigido: 0 de 5</p>
                                    </div>
                                </div>

                                <div className="bg-primary-100 p-4 rounded-lg mt-6">
                                    <p className="font-semibold text-neutral-900 mb-3">1) O que é a LGPD?</p>
                                    <div className="text-neutral-600 text-sm space-y-2">
                                        <p>O que achei da forma que o conteúdo foi apresentado foi abordado?</p>
                                    </div>
                                </div>

                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <p className="font-semibold text-neutral-900 mb-3">O que você achou de avaliação final?</p>
                                    <Input
                                        type="text"
                                        placeholder="Deixe um feedback sobre a avaliação final."
                                        className="w-full"
                                        value={posTesteAnswers.q3}
                                        onChange={(e) => setPosTesteAnswers({ ...posTesteAnswers, q3: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button className="w-full mt-6 bg-primary text-white font-semibold py-3">
                                Salvar Alterações
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
