import { Checkbox } from "@heroui/react"

export interface Option {
  id: string;
  label: string;
  text: string;
}

interface Question {
  id: number;
  title: string;
  options: Option[];
}

// mocks/questions.ts
export const questionsMock: Question[] = [
  {
    id: 1,
    title: "Qual hook é utilizado para gerenciar o estado em componentes funcionais?",
    options: [
      { id: "a", label: "A", text: "useEffect" },
      { id: "b", label: "B", text: "useState" },
      { id: "c", label: "C", text: "useContext" },
      { id: "d", label: "D", text: "useReducer" },
    ],
  },
  {
    id: 2,
    title: "No Tailwind CSS v4, onde as variáveis de tema são preferencialmente definidas?",
    options: [
      { id: "a", label: "A", text: "No arquivo tailwind.config.js" },
      { id: "b", label: "B", text: "Diretamente no HTML via inline-styles" },
      { id: "c", label: "C", text: "No arquivo CSS principal usando a diretiva @theme" },
      { id: "d", label: "D", text: "Dentro do package.json" },
    ],
  },
  {
    id: 3,
    title: "Qual componente do HeroUI/NextUI é usado para agrupar inputs de seleção única?",
    options: [
      { id: "a", label: "A", text: "CheckboxGroup" },
      { id: "b", label: "B", text: "RadioGroup" },
      { id: "c", label: "C", text: "Select" },
      { id: "d", label: "D", text: "Switch" },
    ],
  }
];

export const TestPage = () => {
    const getQuestionOptions = (question: Question) => (
        <>
            {question.options.forEach((option) => (
                <div className="flex gap-2 items-center">
                    <Checkbox id={`question_${question.id}`}>
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                    </Checkbox>
                    <label htmlFor="question_${question.id}" className="cursor-pointer">
                        {option.text}
                    </label>
                </div>
            ))}
        </>
    )

    return (
        <div className="max-w-3xl w-full px-4 mx-auto mt-4 p-4 bg-primary-50 rounded-lg">
            <h1 className="text-2xl font-semibold mb-5.5">Avaliação Final: LGPD e Proteção de Dados</h1>
            <p className="mb-6">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Magnam, vero dolor rerum possimus nemo
            </p>
            <section className="flex flex-col gap-2.5">
                {
                    questionsMock.map((question, index) => (
                        <div key={question.id}>
                            <h2 className="text-lg font-semibold">{`${index+1}. ${question.title}`}</h2>
                            <div className="flex gap-2.5">
                                {getQuestionOptions(question)}
                            </div>
                        </div>
                    ))
                }
            </section>
        </div>
    )
}