import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, Input, Checkbox, Tabs, RadioGroup, Radio } from "@heroui/react";
import type { Training } from "../../types/Training";
import type { Question, Quiz } from "../../types/Quiz";

export const trainingMock: Training = {
    id: 1,
    title: "Introdução ao Docker e Microserviços",
    hours: 10,
    progress: 0,
    startDate: "2026-05-01",
    endDate: "2026-05-15",
    daysLeft: 14,
    status: "em_breve",
    pretest: {
        id: 1,
        type: 'pre_avaliacao',
        status: 'INDISPONIVEL',
        min_required: 0,
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
    },
    test: {
        id: 2,
        type: 'avaliacao',
        status: 'INDISPONIVEL',
        min_required: 3,
        questions: [
            {
                id: 1,
                title: "Qual a principal diferença entre o useMemo e o useCallback?",
                right_answer: 2,
                options: [
                    { id: 1, label: "A", text: "Não há diferença, são apenas aliases para a mesma função." },
                    { id: 2, label: "B", text: "O useMemo memoriza um valor calculado, enquanto o useCallback memoriza uma função." },
                    { id: 3, label: "C", text: "O useCallback só funciona em componentes de classe." },
                    { id: 4, label: "D", text: "O useMemo é disparado em todo render, independente das dependências." }
                ]
            },
            {
                id: 2,
                title: "No TypeScript, o que o operador 'readonly' faz em uma propriedade de interface?",
                right_answer: 5,
                options: [
                    { id: 5, label: "A", text: "Impede que a propriedade seja modificada após a inicialização do objeto." },
                    { id: 6, label: "B", text: "Torna a propriedade opcional (pode ser undefined)." },
                    { id: 7, label: "C", text: "Garante que a propriedade seja sempre do tipo string." },
                    { id: 8, label: "D", text: "Permite que a propriedade seja acessada apenas dentro de classes herdadas." }
                ]
            },
            {
                id: 3,
                title: "Qual o comando SQL utilizado para remover todos os registros de uma tabela sem excluir a sua estrutura?",
                right_answer: 11,
                options: [
                    { id: 9, label: "A", text: "DROP TABLE" },
                    { id: 10, label: "B", text: "REMOVE ALL" },
                    { id: 11, label: "C", text: "TRUNCATE TABLE" },
                    { id: 12, label: "D", text: "DELETE DATABASE" }
                ]
            },
            {
                id: 4,
                title: "No ecossistema Laravel, para que serve o Eloquent?",
                right_answer: 13,
                options: [
                    { id: 13, label: "A", text: "É o mapeador objeto-relacional (ORM) padrão para interagir com o banco de dados." },
                    { id: 14, label: "B", text: "É uma engine de templates para renderizar o frontend." },
                    { id: 15, label: "C", text: "Serve exclusivamente para gerenciar as rotas da API." },
                    { id: 16, label: "D", text: "É a ferramenta de linha de comando para rodar migrações." }
                ]
            },
            {
                id: 5,
                title: "Qual propriedade CSS é usada no Tailwind para controlar o espaçamento interno (padding) de um elemento?",
                right_answer: 17,
                options: [
                    { id: 17, label: "A", text: "A família de classes que começa com 'p-' (ex: p-4, px-2)." },
                    { id: 18, label: "B", text: "A família de classes que começa com 'm-' (ex: m-4, my-2)." },
                    { id: 19, label: "C", text: "A classe 'space-x' apenas." },
                    { id: 20, label: "D", text: "A classe 'gap-4'." }
                ]
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
    const [test, setTest] = useState<Quiz | null>(null);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        switch(activeTab) {
            case "pre_avaliacao":
                if(training.pretest)
                    setTest(training.pretest);
                break;
            case "avaliacao":
                if(training.test)
                    setTest(training.test);
                break
        }
    }, [activeTab]);

    const addNewQuestionOption = (questionId: number) => {
        setTest((prev) => {
            if(!prev || !test) return prev;

            return {
                ...prev,
                questions: test.questions.map((q) => {
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
            };
        });
    };

    const addNewQuestion = () => {
        setTest((prev) => {
            if (!prev) return prev;

            const newQuestionId = prev.questions.length > 0 
            ? Math.max(...prev.questions.map(q => q.id)) + 1 
            : 1;

            const newQuestion: Question = {
                id: newQuestionId,
                title: "Nova pergunta sem título",
                options: [
                    { 
                    id: Date.now(), 
                    label: "A", 
                    text: "Clique para editar a alternativa" 
                    }
                ],
            };

            return {
                ...prev,
                questions: [...prev.questions, newQuestion],
            };
        });
        };

    const getQuestionOptions = (question: Question) => (
        <>
            <RadioGroup name={`question_${question.id}_answer`} className="gap-2 mb-4">
                {question.options.map((option) => (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                        <input type="radio" className="mt-1" disabled />
                        <Input value={option.text} className="flex-1" />
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
                {["pre_avaliacao", "avaliacao"].includes(activeTab) && (
                    <Card className="p-0">
                        <Card.Header className="bg-primary-200 py-7 px-6 rounded-t-lg">
                            <h3 className="font-bold text-primary-700">Pré-avaliação</h3>
                        </Card.Header>
                        <Card.Content className="px-4">
                            <div className="grid grid-cols-2 gap-2.5 py-3 px-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                <div className="bg-primary-100 p-4 rounded-lg">
                                    <p className="text-primary-700 text-lg font-semibold mb-1">Acertos mínimos</p>
                                    <Input value={test?.min_required} className="text-primary-700 text-lg font-bold" />
                                </div>
                            </div>

                            <div className="mb-8 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
                                {
                                    test?.questions.map((question, index) => (
                                        <>
                                            <p className="font-bold text-neutral-900 mb-4 text-base flex items-center">
                                                {index + 1}.&nbsp;
                                                <Input value={question.title} className="flex-1" />
                                            </p>
                                            <div className="space-y-3">
                                                { getQuestionOptions(question) }
                                            </div>
                                            {
                                                test?.questions.length === (index+1) && (
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
            </div>
        </div>
    );
};
