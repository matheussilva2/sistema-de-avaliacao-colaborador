export type TrainingQuestion = {
  id: number;
  question: string;
  options: string[];
  correctOption: number;
};

export type TrainingTestMock = Record<number, { questions: TrainingQuestion[] }>;

export const trainingQuestionsMock: TrainingTestMock = {
  1: {
    questions: [
      {
        id: 1,
        question: "O que é a LGPD?",
        options: [
          "Uma lei brasileira que regula a coleta, o armazenamento e o uso de dados pessoais.",
          "Um protocolo internacional de criptografia para transações bancárias.",
          "Uma norma técnica da ABNT para qualidade de software.",
          "Uma agência federal de segurança cibernética.",
        ],
        correctOption: 0,
      },
      {
        id: 2,
        question: "Qual das opções abaixo é considerada dado pessoal sensível?",
        options: [
          "Nome completo de um funcionário.",
          "Número de registro geral (RG).",
          "Opinião política ou convicção religiosa.",
          "Telefone corporativo do setor de compras.",
        ],
        correctOption: 2,
      },
      {
        id: 3,
        question: "Quando um tratamento de dados pessoais precisa de consentimento explícito?",
        options: [
          "Sempre que os dados forem públicos.",
          "Quando o tratamento for baseado em interesse legítimo da empresa.",
          "Quando o dado pessoal sensível for utilizado.",
          "Nunca, se o dado for armazenado em nuvem.",
        ],
        correctOption: 2,
      },
      {
        id: 4,
        question: "Qual medida ajuda a proteger dados pessoais em sistemas?",
        options: [
          "Manter todas as senhas em notas de texto.",
          "Compartilhar acesso somente com pessoas autorizadas.",
          "Usar a mesma senha para diversos sistemas.",
          "Enviar dados pessoais por e-mail sem criptografia.",
        ],
        correctOption: 1,
      },
      {
        id: 5,
        question: "O que fazer ao detectar um vazamento de dados?",
        options: [
          "Ignorar até o fim do dia útil.",
          "Eliminar os dados sem registrar o incidente.",
          "Comunicar imediatamente à equipe responsável.",
          "Publicar o incidente nas redes sociais.",
        ],
        correctOption: 2,
      },
    ],
  },
};

export type TrainingResultsMock = Record<number, { answers: Record<number, number> }>;

export const trainingResultsMock: TrainingResultsMock = {
  1: {
    answers: {
      1: 0,
      2: 2,
      3: 1,
      4: 1,
      5: 2,
    },
  },
};
