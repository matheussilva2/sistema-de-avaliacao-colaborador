import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { trainingsMock } from "../../../mock";
import { trainingQuestionsMock, trainingResultsMock } from "../mock";

type LocationState = {
  answers?: Record<number, number>;
};

export default function TreinamentoResultados() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const trainingId = Number(id);
  const training = trainingsMock.find((t) => t.id === trainingId);
  const test = trainingQuestionsMock[trainingId];
  const questions = test?.questions ?? [];
  const storedAnswers = state?.answers ?? trainingResultsMock[trainingId]?.answers ?? {};

  if (!training) return <div>Nenhum treinamento com esse id</div>;
  if (!test) return <div>Nenhum teste disponível para este treinamento</div>;

  const score = questions.reduce(
    (acc, question) => (storedAnswers[question.id] === question.correctOption ? acc + 1 : acc),
    0,
  );

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">{training.title}</h1>
        <p className="text-neutral-700">Veja abaixo as respostas corretas e incorretas do teste.</p>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-white border border-gray-200">
          <p className="text-sm text-neutral-600">Pontuação</p>
          <p className="text-2xl font-bold text-primary">{score} / {questions.length}</p>
        </Card>
        <Card className="p-5 bg-white border border-gray-200">
          <p className="text-sm text-neutral-600">Acertos</p>
          <p className="text-2xl font-bold text-emerald-700">{score}</p>
        </Card>
        <Card className="p-5 bg-white border border-gray-200">
          <p className="text-sm text-neutral-600">Erros</p>
          <p className="text-2xl font-bold text-red-600">{questions.length - score}</p>
        </Card>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="p-6 border border-gray-200">
            <p className="font-semibold mb-4">{question.id}. {question.question}</p>
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isCorrectOption = index === question.correctOption;
                const isSelected = storedAnswers[question.id] === index;
                const optionClass = isCorrectOption
                  ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                  : isSelected
                  ? "bg-red-100 border-red-300 text-red-900"
                  : "bg-white border border-gray-200 text-neutral-700";

                return (
                  <div
                    key={`${question.id}-${index}`}
                    className={`rounded-lg border p-3 ${optionClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                    {isCorrectOption && (
                      <p className="text-xs text-emerald-700 mt-1">Resposta correta</p>
                    )}
                    {!isCorrectOption && isSelected && (
                      <p className="text-xs text-red-700 mt-1">Sua resposta incorreta</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <Button className="bg-neutral-200 text-neutral-900 px-5 py-2 rounded-lg" onClick={() => navigate(`/painel/treinamentos/${trainingId}`)}>
          Voltar
        </Button>
        <Button className="bg-primary text-white px-5 py-2 rounded-lg" onClick={() => navigate(`/painel/treinamentos/${trainingId}`)}>
          Voltar ao treinamento
        </Button>
      </div>
    </div>
  );
}
