export type StudentTrainingStatus =
  | "concluido"
  | "em_andamento"
  | "nao_iniciado"
  | "incompleto";

export type StudentQuizResult = {
  quizId: number;
  title: string;
  phase: "pre" | "post";
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  completedAt: string;
};

export type StudentTrainingAnalytics = {
  id: number;
  nome: string;
  status: StudentTrainingStatus;
  foto?: string;
  progress: number;
  notaMedia: number;
  ultimaAtividade: string;
  tarefasConcluidas: number;
  totalTarefas: number;
  comentarios: string;
  quizResults: StudentQuizResult[];
};

export type TrainingAssessmentSummary = {
  titulo: string;
  tipo: string;
  questoes: number;
  data: string;
};

export type TrainingAnalytics = {
  trainingId: number;
  students: StudentTrainingAnalytics[];
  assessments: TrainingAssessmentSummary[];
};

export const trainingAnalyticsMock: TrainingAnalytics[] = [
  {
    trainingId: 1,
    students: [
      {
        id: 1,
        nome: "Joao Silva",
        foto: "https://picsum.photos/seed/joao/80/80",
        status: "concluido",
        progress: 96,
        notaMedia: 9.4,
        ultimaAtividade: "Quiz Final",
        tarefasConcluidas: 12,
        totalTarefas: 12,
        comentarios: "Excelente desempenho nas ultimas avaliacoes.",
        quizResults: [
          {
            quizId: 101,
            title: "Pre-teste LGPD",
            phase: "pre",
            correctAnswers: 5,
            totalQuestions: 10,
            score: 5,
            completedAt: "10/05",
          },
          {
            quizId: 102,
            title: "Pos-teste LGPD",
            phase: "post",
            correctAnswers: 9,
            totalQuestions: 10,
            score: 9.4,
            completedAt: "30/06",
          },
        ],
      },
      {
        id: 2,
        nome: "Maria Souza",
        foto: "https://picsum.photos/seed/maria/80/80",
        status: "em_andamento",
        progress: 72,
        notaMedia: 8.2,
        ultimaAtividade: "Estudo de caso",
        tarefasConcluidas: 8,
        totalTarefas: 11,
        comentarios: "Bom ritmo, faltam apenas duas atividades.",
        quizResults: [
          {
            quizId: 101,
            title: "Pre-teste LGPD",
            phase: "pre",
            correctAnswers: 4,
            totalQuestions: 10,
            score: 4.2,
            completedAt: "10/05",
          },
          {
            quizId: 102,
            title: "Pos-teste LGPD",
            phase: "post",
            correctAnswers: 8,
            totalQuestions: 10,
            score: 8.2,
            completedAt: "30/06",
          },
        ],
      },
      {
        id: 3,
        nome: "Carlos Lima",
        foto: "https://picsum.photos/seed/carlos/80/80",
        status: "nao_iniciado",
        progress: 10,
        notaMedia: 6,
        ultimaAtividade: "Introducao ao curso",
        tarefasConcluidas: 1,
        totalTarefas: 10,
        comentarios: "Ainda nao avancou muito no conteudo.",
        quizResults: [
          {
            quizId: 101,
            title: "Pre-teste LGPD",
            phase: "pre",
            correctAnswers: 3,
            totalQuestions: 10,
            score: 3.4,
            completedAt: "10/05",
          },
          {
            quizId: 102,
            title: "Pos-teste LGPD",
            phase: "post",
            correctAnswers: 6,
            totalQuestions: 10,
            score: 6,
            completedAt: "30/06",
          },
        ],
      },
      {
        id: 4,
        nome: "Ana Costa",
        foto: "https://picsum.photos/seed/ana-costa/80/80",
        status: "incompleto",
        progress: 43,
        notaMedia: 7.1,
        ultimaAtividade: "Aula 4",
        tarefasConcluidas: 5,
        totalTarefas: 12,
        comentarios: "Precisa revisar alguns modulos para completar o curso.",
        quizResults: [
          {
            quizId: 101,
            title: "Pre-teste LGPD",
            phase: "pre",
            correctAnswers: 4,
            totalQuestions: 10,
            score: 4.8,
            completedAt: "10/05",
          },
          {
            quizId: 102,
            title: "Pos-teste LGPD",
            phase: "post",
            correctAnswers: 7,
            totalQuestions: 10,
            score: 7.1,
            completedAt: "30/06",
          },
        ],
      },
      {
        id: 5,
        nome: "Lucas Alves",
        foto: "https://picsum.photos/seed/lucas/80/80",
        status: "em_andamento",
        progress: 58,
        notaMedia: 7.8,
        ultimaAtividade: "Pratica final",
        tarefasConcluidas: 7,
        totalTarefas: 12,
        comentarios: "Avancando bem, mas com margem para melhorar.",
        quizResults: [
          {
            quizId: 101,
            title: "Pre-teste LGPD",
            phase: "pre",
            correctAnswers: 5,
            totalQuestions: 10,
            score: 5.1,
            completedAt: "10/05",
          },
          {
            quizId: 102,
            title: "Pos-teste LGPD",
            phase: "post",
            correctAnswers: 8,
            totalQuestions: 10,
            score: 7.8,
            completedAt: "30/06",
          },
        ],
      },
    ],
    assessments: [
      {
        titulo: "Pre-teste",
        tipo: "Multipla escolha",
        questoes: 10,
        data: "10/05",
      },
      {
        titulo: "Pos-teste",
        tipo: "Multipla escolha",
        questoes: 10,
        data: "30/06",
      },
    ],
  },
];

export const getTrainingAnalyticsById = (trainingId: number) =>
  trainingAnalyticsMock.find((analytics) => analytics.trainingId === trainingId);
