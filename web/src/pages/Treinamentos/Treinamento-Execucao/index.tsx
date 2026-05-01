import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { trainingsMock } from "../../../mock";
import { trainingQuestionsMock } from "../mock";

export default function TreinamentoExecucao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trainingId = Number(id);
  const training = trainingsMock.find((t) => t.id === trainingId);
  const test = trainingQuestionsMock[trainingId];
  const questions = test?.questions ?? [];
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!training) return <div>Nenhum treinamento com esse id</div>;
  if (!test) return <div>Nenhum teste disponível para este treinamento</div>;

  const handleChange = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const allAnswered = questions.every((question) => answers[question.id] !== undefined);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/painel/treinamentos/${trainingId}/resultado`, {
      state: { answers },
    });
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">{training.title}</h1>
        <p className="text-neutral-700">Responda o formulário abaixo para completar o treinamento.</p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <Card key={question.id} className="p-6 border border-gray-200">
            <p className="font-semibold mb-4">{question.id}. {question.question}</p>
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <label key={option} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary transition">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === index}
                    onChange={() => handleChange(question.id, index)}
                    className="h-4 w-4 text-primary accent-primary"
                  />
                  <span className="text-sm text-neutral-700">{option}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg"
            isDisabled={!allAnswered}
          >
            Enviar Respostas
          </Button>
        </div>
      </form>
    </div>
  );
}
