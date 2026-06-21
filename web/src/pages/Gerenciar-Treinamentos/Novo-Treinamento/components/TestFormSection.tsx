import { Button, Card, Input } from "@heroui/react";
import type { Question, TestType } from "../types";

export type QuestionFieldErrors = {
  title?: string;
  alternatives?: string;
  correctOption?: string;
  optionsById?: Record<string, string>;
};

export type TestFormSectionErrors = {
  questions?: string;
  byQuestion?: Record<string, QuestionFieldErrors>;
};

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
  isReadOnly?: boolean;
  errors?: TestFormSectionErrors;
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
  isReadOnly = false,
  errors,
}: TestFormSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-primary px-2">
        Avaliação do Treinamento - {testTypeLabel[testType]}
      </h2>

      {questions.map((q, qIndex) => {
        const questionErrors = errors?.byQuestion?.[q.id];

        return (
        <Card
          key={q.id}
          className={`p-6 border-l-4 shadow-sm ${
            questionErrors ? "border-l-red-500" : "border-l-primary"
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <Input
                  placeholder={`Pergunta ${qIndex + 1}`}
                  value={q.title}
                  onChange={(e) => onQuestionTitleChange(q.id, e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full bg-neutral-50 font-medium border-2 focus:ring-2 ${
                    questionErrors?.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-neutral-300 focus:border-primary focus:ring-primary/20"
                  }`}
                />
                <FieldError message={questionErrors?.title} />
              </div>
              <Button
                isIconOnly
                onPress={() => onRemoveQuestion(q.id)}
                isDisabled={isReadOnly}
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

                  <div className="flex-1">
                    <Input
                      placeholder={`Opção ${optIndex + 1}`}
                      value={opt.text}
                      onChange={(e) => onOptionChange(q.id, opt.id, e.target.value)}
                      readOnly={isReadOnly}
                      className={`w-full bg-white border-2 focus:ring-2 ${
                        questionErrors?.optionsById?.[opt.id]
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-neutral-300 focus:border-primary focus:ring-primary/20"
                      }`}
                    />
                    <FieldError message={questionErrors?.optionsById?.[opt.id]} />
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="radio"
                      name={`correct-option-${q.id}`}
                      checked={opt.isCorrect}
                      onChange={() => onToggleCorrectOption(q.id, opt.id)}
                      disabled={isReadOnly}
                      className="h-4 w-4 rounded border-neutral-300 text-primary accent-primary"
                    />
                    Correta
                  </label>

                  {q.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveOption(q.id, opt.id)}
                      disabled={isReadOnly}
                      className="text-neutral-400 hover:text-danger p-2 transition-colors text-xl font-light"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <FieldError message={questionErrors?.alternatives} />
            <FieldError message={questionErrors?.correctOption} />

            <div className="flex items-center gap-3 mt-1 ml-1">
              <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0 opacity-50" />
              <button
                type="button"
                onClick={() => onAddOption(q.id)}
                disabled={isReadOnly}
                className="text-sm text-neutral-500 hover:text-primary hover:underline"
              >
                Adicionar opção
              </button>
            </div>
          </div>
        </Card>
        );
      })}

      <FieldError message={errors?.questions} />

      <Button
        className="bg-primary/10 text-primary font-medium w-full py-6 mt-2 border border-primary/20 border-dashed"
        onPress={onAddQuestion}
        isDisabled={isReadOnly}
      >
        + Adicionar Pergunta
      </Button>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null;
}
