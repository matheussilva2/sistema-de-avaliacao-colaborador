import type { Question, TestType } from "../Novo-Treinamento/types";

export type ManagedTrainingForm = {
  id: string;
  trainingId: number;
  title: string;
  type: TestType;
  startDeadline: string;
  endDeadline: string;
  minCorrect: string;
  questions: Question[];
};

export type AnsweredTrainingForm = {
  id: string;
  formId: string;
  trainingId: number;
  studentId: number;
  answeredAt: string;
  answers: Record<string, string>;
};

export const trainingFormTypeLabel: Record<TestType, string> = {
  "pre-teste": "Pre-teste",
  "pos-teste": "Pos-teste",
};

export const managedTrainingFormsMock: ManagedTrainingForm[] = [
  {
    id: "form-pre-lgpd-1",
    trainingId: 1,
    title: "Diagnostico inicial LGPD",
    type: "pre-teste",
    startDeadline: "2026-05-10",
    endDeadline: "2026-05-18",
    minCorrect: "50",
    questions: [
      {
        id: "pre-q1",
        title: "O que e a LGPD?",
        options: [
          {
            id: "pre-q1-a",
            text: "Uma lei brasileira sobre tratamento de dados pessoais.",
            isCorrect: true,
          },
          {
            id: "pre-q1-b",
            text: "Uma ferramenta para criar senhas seguras.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "pre-q2",
        title: "Qual dado abaixo pode ser considerado sensivel?",
        options: [
          {
            id: "pre-q2-a",
            text: "Cargo profissional.",
            isCorrect: false,
          },
          {
            id: "pre-q2-b",
            text: "Conviccao religiosa.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
  {
    id: "form-pos-lgpd-1",
    trainingId: 1,
    title: "Avaliacao final LGPD",
    type: "pos-teste",
    startDeadline: "2026-06-20",
    endDeadline: "2026-06-30",
    minCorrect: "70",
    questions: [
      {
        id: "pos-q1",
        title: "Quando o consentimento explicito e mais importante?",
        options: [
          {
            id: "pos-q1-a",
            text: "Quando houver tratamento de dado pessoal sensivel.",
            isCorrect: true,
          },
          {
            id: "pos-q1-b",
            text: "Apenas quando o dado estiver impresso em papel.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "pos-q2",
        title: "Qual atitude ajuda a proteger dados pessoais?",
        options: [
          {
            id: "pos-q2-a",
            text: "Compartilhar acessos com toda a equipe.",
            isCorrect: false,
          },
          {
            id: "pos-q2-b",
            text: "Liberar acesso somente para pessoas autorizadas.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
];

export const answeredTrainingFormsMock: AnsweredTrainingForm[] = [
  {
    id: "answer-pos-lgpd-joao-1",
    formId: "form-pos-lgpd-1",
    trainingId: 1,
    studentId: 1,
    answeredAt: "2026-06-25",
    answers: {
      "pos-q1": "pos-q1-a",
      "pos-q2": "pos-q2-b",
    },
  },
];

export const getFormsByTrainingId = (trainingId: number) =>
  managedTrainingFormsMock.filter((form) => form.trainingId === trainingId);

export const getFormById = (formId: string) =>
  managedTrainingFormsMock.find((form) => form.id === formId);

export const getAnsweredFormsByTrainingId = (trainingId: number, studentId: number) =>
  answeredTrainingFormsMock.filter(
    (answer) => answer.trainingId === trainingId && answer.studentId === studentId,
  );

export const getAnsweredForm = (formId: string, studentId: number) =>
  answeredTrainingFormsMock.find(
    (answer) => answer.formId === formId && answer.studentId === studentId,
  );

export const getFormResult = (
  form: ManagedTrainingForm,
  answer?: AnsweredTrainingForm,
) => {
  if (!answer) {
    return {
      correctAnswers: 0,
      totalQuestions: form.questions.length,
      scorePercentage: 0,
      isApproved: false,
      isAnswered: false,
    };
  }

  const correctAnswers = form.questions.filter((question) => {
    const selectedOptionId = answer.answers[question.id];
    const selectedOption = question.options.find((option) => option.id === selectedOptionId);
    return selectedOption?.isCorrect ?? false;
  }).length;
  const totalQuestions = form.questions.length;
  const scorePercentage = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  return {
    correctAnswers,
    totalQuestions,
    scorePercentage,
    isApproved: scorePercentage >= Number(form.minCorrect),
    isAnswered: true,
  };
};
