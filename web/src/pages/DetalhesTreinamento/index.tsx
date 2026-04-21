import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, Input, Checkbox, Tabs } from "@heroui/react";
import type { Training } from "../../types/Training";

export const trainingsMock: Training[] = [
    {
        id: 1,
        title: "Introdução ao Docker e Microserviços",
        hours: 10,
        progress: 0,
        startDate: "2026-05-01",
        endDate: "2026-05-15",
        daysLeft: 14,
        status: "em_breve"
    },
    {
        id: 2,
        title: "Desenvolvimento Fullstack com Laravel",
        hours: 40,
        progress: 45,
        startDate: "2026-04-01",
        endDate: "2026-04-30",
        daysLeft: 13,
        status: "em_andamento"
    },
    {
        id: 3,
        title: "Arquitetura de Softwares e Design Patterns",
        hours: 25,
        progress: 90,
        startDate: "2026-03-15",
        endDate: "2026-04-18",
        daysLeft: 1,
        status: "pre_avaliacao"
    },
    {
        id: 4,
        title: "Segurança em APIs REST",
        hours: 15,
        progress: 100,
        startDate: "2026-03-01",
        endDate: "2026-04-10",
        daysLeft: 0,
        status: "avaliacao"
    },
    {
        id: 5,
        title: "Gestão de Projetos Ágeis",
        hours: 20,
        progress: 100,
        startDate: "2026-02-10",
        endDate: "2026-03-15",
        daysLeft: 0,
        status: "aguardando_feedback"
    },
    {
        id: 6,
        title: "React Avançado e Context API",
        hours: 30,
        progress: 100,
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        daysLeft: 0,
        status: "concluido"
    },
    {
        id: 7,
        title: "Testes Automatizados com Jest",
        hours: 12,
        progress: 60,
        startDate: "2026-01-15",
        endDate: "2026-02-15",
        daysLeft: 0,
        status: "pendencia"
    }
];

const TABS_ITEMS = [
    {
        label: "PRÉ-AVALIAÇÃO",
        value: "pre_avaliacao"
    },
    {
        label: "SATISFAÇÃO",
        value: "satisfacao"
    },
    {
        label: "AVALIAÇÃO",
        value: "avaliacao"
    },
]

type Tab = "pre_avaliacao" | "satisfacao" | "avaliacao";

export const DetalhesTreinamento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("pre_avaliacao");
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
            <Card className="mb-8 bg-white p-0 gap-0">
                <Card.Header className="bg-primary-100 border-primary-200 p-0 mb-0">
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <h2 className="text-lg font-semibold text-primary-700">{training.title}</h2>
                            <p className="text-primary-700 text-lg">Compliance</p>
                        </div>
                        <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-semibold">
                            {training.status}
                        </span>
                    </div>
                </Card.Header>

                <Card.Content className="grid grid-cols-4 gap-4 py-2 px-4 bg-primary-50">
                    <div className="px-2 py-4 rounded-lg bg-primary-300">
                        <p className="text-primary-700 text-sm font-semibold">Tipo</p>
                        <p className="text-primary-700 font-bold">Presencial</p>
                    </div>
                    <div className="px-2 py-4 rounded-lg bg-primary-300">
                        <p className="text-primary-700 text-sm font-semibold">Carga Horária</p>
                        <p className="text-primary-700 font-bold">8h</p>
                    </div>
                    <div className="px-2 py-4 rounded-lg bg-primary-300">
                        <p className="text-primary-700 text-sm font-semibold">Data de Início</p>
                        <p className="text-primary-700 font-bold">05/06/2026</p>
                    </div>
                    <div className="px-2 py-4 rounded-lg bg-primary-300">
                        <p className="text-primary-700 text-sm font-semibold">Data do Fim</p>
                        <p className="text-primary-700 font-bold">25/06/2026</p>
                    </div>
                </Card.Content>
            </Card>

            <div className="py-3">
                <Tabs
                    variant="secondary"
                    className="w-full w-max-md"
                    onSelectionChange={(key) => setActiveTab(key)}
                    defaultSelectedKey={activeTab}
                >
                    <Tabs.ListContainer>
                        <Tabs.List>
                            {
                                TABS_ITEMS.map((item) => (
                                    <Tabs.Tab
                                        key={item.value}
                                        id={item.value}
                                        className="aria-selected:text-primary aria-selected:font-semibold font-normal"
                                    >
                                        <span>
                                            {item.label}
                                        </span>
                                        <Tabs.Indicator />
                                    </Tabs.Tab>
                                ))
                            }
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
            </div>

            <div className="px-6">
                {activeTab === "pre_avaliacao" && (
                    <Card className="p-0">
                        <Card.Header className="bg-primary-200 py-7 px-6 rounded-t-lg">
                            <h3 className="font-bold text-primary-700">Pré-teste - Resultado</h3>
                        </Card.Header>
                        <Card.Content className="px-4">
                            <div className="grid grid-cols-2 gap-2.5 py-3 px-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <p className="text-primary-700 text-lg font-semibold mb-1">Acertos</p>
                                    <p className="text-primary-700 text-lg font-bold">3 de 5</p>
                                </div>
                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <p className="text-primary-700 text-lg font-semibold mb-1">Mínimo Exigido</p>
                                    <p className="text-primary-700 text-lg font-bold">0 de 5</p>
                                </div>
                            </div>

                            <div className="mb-8 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <p className="font-bold text-neutral-900 mb-4 text-base">1) O que é a LGPD?</p>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                                        <input type="radio" className="mt-1" disabled />
                                        <span className="text-neutral-700">Um sistema de segurança cibernética criado pelo governo federal para proteger redes de computadores contra ataques.</span>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-100 border-2 border-green-300">
                                        <input type="radio" className="mt-1" disabled />
                                        <span className="text-neutral-900 font-medium">Uma lei brasileira que regula a coleta, o armazenamento e o uso de dados pessoais por empresas e órgãos públicos.</span>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                                        <input type="radio" className="mt-1" disabled />
                                        <span className="text-neutral-700">Um protocolo internacional de criptografia adotado pelo Brasil para garantir a segurança de transações de empresas e órgãos públicos.</span>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-pink-100 border-2 border-pink-300">
                                        <input type="radio" className="mt-1" disabled checked />
                                        <span className="text-neutral-900 font-medium">Uma norma técnica da ABNT que estabelece padrões de qualidade de software desenvolvidos no território nacional. (Sua resposta)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <p className="font-bold text-neutral-900 mb-4 text-base">2) Como a sua equipe lida com dados pessoais?</p>
                                <Input
                                    type="text"
                                    placeholder="Nessa equipe coleta dados de clientes por formulário e os armazena no sistema interno. Não temos política formal definida ainda."
                                    className="w-full"
                                />
                            </div>
                        </Card.Content>
                    </Card>
                )}

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

                {activeTab === "avaliacao" && (
                    <div>
                        <div className="bg-primary-100 p-4 rounded-lg mb-4">
                            <h3 className="font-bold text-neutral-900 mb-2">Pós-teste - Resultado</h3>
                        </div>
                        
                        <div className="space-y-4 mb-4">
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
                        </div>

                        <Link to="teste">
                            <Button className="w-full bg-primary text-white font-semibold py-3">
                                Iniciar Teste
                            </Button>
                        </Link>

                    </div>
                )}
            </div>
        </div>
    );
};
