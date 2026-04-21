import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, Input, Checkbox, Tabs, RadioGroup, Radio } from "@heroui/react";
import type { Training } from "../../types/Training";
import type { Question } from "../../types/Quiz";

export const trainingMock: Training = {
    id: 1,
    title: "Introdução ao Docker e Microserviços",
    hours: 10,
    progress: 0,
    startDate: "2026-05-01",
    endDate: "2026-05-15",
    daysLeft: 14,
    status: "em_breve",
    avaliation: {
        id: 1,
        type: 'pre_avaliacao',
        status: 'INDISPONIVEL',
        min_required: 3,
        questions: [
            {
                id: 1,
                title: "Qual hook é utilizado para gerenciar o estado em componentes funcionais?",
                options: [
                { id: 1, label: "A", text: "useEffect" },
                { id: 2, label: "B", text: "useState" },
                { id: 3, label: "C", text: "useContext" },
                { id: 4, label: "D", text: "useReducer" },
                ],
            },
            {
                id: 2,
                title: "No Tailwind CSS v4, onde as variáveis de tema são preferencialmente definidas?",
                options: [
                { id: 5, label: "A", text: "No arquivo tailwind.config.js" },
                { id: 6, label: "B", text: "Diretamente no HTML via inline-styles" },
                { id: 7, label: "C", text: "No arquivo CSS principal usando a diretiva @theme" },
                { id: 8, label: "D", text: "Dentro do package.json" },
                ],
            },
            {
                id: 3,
                title: "Qual componente do HeroUI/NextUI é usado para agrupar inputs de seleção única?",
                options: [
                { id: 9, label: "A", text: "CheckboxGroup" },
                { id: 10, label: "B", text: "RadioGroup" },
                { id: 11, label: "C", text: "Select" },
                { id: 12, label: "D", text: "Switch" },
                ],
            }
        ]
    }
}

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

export const ManageTrainingsData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("pre_avaliacao");
    const [ratings, setRatings] = useState({
        relevancia: 0,
        instrutor: 0,
        material: 0,
        duracao: 0,
    });
    const [training, setTraining] = useState<Training>(trainingMock);
    const [feedback, setFeedback] = useState("");

    const addNewQuestionOption = (questionId: number) => {
        setTraining((prev) => {
            if (!prev.avaliation?.questions) return prev;

            return {
            ...prev,
            avaliation: {
                ...prev.avaliation,
                questions: prev.avaliation.questions.map((q) => {
                if (q.id !== questionId) return q;

                const nextLabel = String.fromCharCode(65 + q.options.length);

                return {
                    ...q,
                    options: [
                    ...q.options,
                    {
                        id: Date.now(),
                        label: nextLabel,
                        text: "",
                    },
                    ],
                };
                }),
            },
            };
        });
        };

    const addNewQuestion = () => {
        setTraining((prev) => {
            if (!prev.avaliation) return prev;

            const newQuestionId = prev.avaliation.questions.length > 0 
            ? Math.max(...prev.avaliation.questions.map(q => q.id)) + 1 
            : 1;

            const newQuestion: Question = {
            id: newQuestionId,
            title: "Nova pergunta sem título",
            options: [
                { id: Date.now(), label: "A", text: "Clique para editar a alternativa" }
            ],
            };

            return {
            ...prev,
            avaliation: {
                ...prev.avaliation,
                questions: [...prev.avaliation.questions, newQuestion],
            },
            };
        });
        };

    const getQuestionOptions = (question: Question) => (
        <>
                <RadioGroup name={`question_${question.id}_answer`} className="gap-2 mb-4">
                    {question.options.map((option) => (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                            <input type="radio" className="mt-1" disabled />
                            <Input defaultValue={option.text} className="flex-1" />
                        </div>
                    ))}
                    <div className="w-full flex justify-center">
                        <Button onClick={() => addNewQuestionOption(question.id)}>+ Adicionar alternativa</Button>
                    </div>
                </RadioGroup>
        </>
    )

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
                            <h3 className="font-bold text-primary-700">Pré-avaliação</h3>
                        </Card.Header>
                        <Card.Content className="px-4">
                            <div className="grid grid-cols-2 gap-2.5 py-3 px-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <p className="text-primary-700 text-lg font-semibold mb-1">Mínimo Exigido</p>
                                    <p className="text-primary-700 text-lg font-bold">
                                        {training.avaliation?.questions.length}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-8 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                {
                                    training.avaliation?.questions.map((question, index) => (
                                        <>
                                            <p className="font-bold text-neutral-900 mb-4 text-base flex items-center">
                                                {index + 1}.&nbsp;
                                                <Input defaultValue={question.title} className="flex-1" />
                                            </p>
                                            <div className="space-y-3">
                                                { getQuestionOptions(question) }
                                            </div>
                                            {
                                                training.avaliation?.questions.length === (index+1) && (
                                                    <Button onPress={addNewQuestion}>+ Adicionar Questão</Button>
                                                )
                                            }
                                        </>
                                    ))
                                }

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
