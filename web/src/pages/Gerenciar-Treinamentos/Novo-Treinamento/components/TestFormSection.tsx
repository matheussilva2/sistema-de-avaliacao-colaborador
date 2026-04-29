import { Button, Card, Input } from "@heroui/react";
import type { Question, TestType } from "../types";

type TestFormSectionProps = {
  testType: TestType;
  questions: Question[];
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onQuestionTitleChange: (questionId: string, value: string) => void;
  onAddOption: (questionId: string) => void;
  onOptionChange: (questionId: string, optionId: string, value: string) => void;
  onToggleCorrectOption: (questionId: string, optionId: string) => void;
  onRemoveOption: (questionId: string, optionId: string) => void;
};

const testTypeLabel: Record<TestType, string> = {
  "pre-teste": "Pré-teste",
  "pos-teste": "Pós-teste",
};

export function TestFormSection({
  testType,
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionTitleChange,
  onAddOption,
  onOptionChange,
  onToggleCorrectOption,
  onRemoveOption,
}: TestFormSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-primary px-2">
        Avaliação do Treinamento - {testTypeLabel[testType]}
      </h2>

      {questions.map((q, qIndex) => (
        <Card key={q.id} className="p-6 border-l-4 border-l-primary shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <Input
                placeholder={`Pergunta ${qIndex + 1}`}
                value={q.title}
                onChange={(e) => onQuestionTitleChange(q.id, e.target.value)}
                className="bg-neutral-50 flex-1 font-medium border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button
                isIconOnly
                onPress={() => onRemoveQuestion(q.id)}
                aria-label="Remover pergunta"
                className="!bg-transparent hover:!bg-danger/10 text-danger"
              >
                ✕
              </Button>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {q.options.map((opt, optIndex) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />

                  <Input
                    placeholder={`Opção ${optIndex + 1}`}
                    value={opt.text}
                    onChange={(e) => onOptionChange(q.id, opt.id, e.target.value)}
                    className="bg-white flex-1 border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={() => onToggleCorrectOption(q.id, opt.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary accent-primary"
                    />
                    Correta
                  </label>

                  {q.options.length > 1 && (
                    <button
                      onClick={() => onRemoveOption(q.id, opt.id)}
                      className="text-neutral-400 hover:text-danger p-2 transition-colors text-xl font-light"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-1 ml-1">
              <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0 opacity-50" />
              <button
                onClick={() => onAddOption(q.id)}
                className="text-sm text-neutral-500 hover:text-primary hover:underline"
              >
                Adicionar opção
              </button>
            </div>
          </div>
        </Card>
      ))}

      <Button
        className="bg-primary/10 text-primary font-medium w-full py-6 mt-2 border border-primary/20 border-dashed"
        onPress={onAddQuestion}
      >
        + Adicionar Pergunta
      </Button>
    </div>
  );
}
