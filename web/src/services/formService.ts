import { request, type ApiUser } from "./authService";

export type ApiFormType = "PRE_TEST" | "POST_TEST";

export type ApiForm = {
  idForm: string;
  title: string;
  formType: ApiFormType;
  initDate: string;
  endDate: string;
  minCorrectPercentage: number;
};

export type ApiQuestion = {
  idQuestion: string;
  title: string;
};

export type ApiAlternative = {
  idAlternative: string;
  text: string;
  correct: boolean;
};

export type ApiQuestionWithAlternatives = ApiQuestion & {
  alternatives: ApiAlternative[];
};

export type ApiFormWithQuestions = ApiForm & {
  questions: ApiQuestionWithAlternatives[];
};

export type ApiQuestionAnswer = {
  idQuestionAnswer: string;
  correct: boolean;
  question: ApiQuestion;
  selectedAlternative: ApiAlternative;
};

export type ApiFormAnswer = {
  idAnswer: string;
  answeredAt: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  approved: boolean;
  form: ApiForm;
  user?: ApiUser;
  questionAnswers: ApiQuestionAnswer[];
};

export type FormPayload = {
  title: string;
  formType: ApiFormType;
  initDate: string;
  endDate: string;
  minCorrectPercentage: number;
};

export type FormAnswerPayload = {
  answers: {
    questionId: string;
    alternativeId: string;
  }[];
};

export function getTrainingForms(trainingId: string) {
  return request<ApiForm[]>(`/trainings/${trainingId}/forms`, {
    method: "GET",
  });
}

export function getFormById(formId: string) {
  return request<ApiForm>(`/forms/${formId}`, {
    method: "GET",
  });
}

export function createTrainingForm(trainingId: string, payload: FormPayload) {
  return request<ApiForm>(`/trainings/${trainingId}/forms`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTrainingForm(formId: string, payload: FormPayload) {
  return request<ApiForm>(`/forms/${formId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTrainingForm(formId: string) {
  return request<string>(`/forms/${formId}`, {
    method: "DELETE",
  });
}

export function getFormQuestions(formId: string) {
  return request<ApiQuestion[]>(`/forms/${formId}/questions`, {
    method: "GET",
  });
}

export function createFormQuestion(formId: string, title: string) {
  return request<ApiQuestion>(`/forms/${formId}/questions`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function getQuestionAlternatives(questionId: string) {
  return request<ApiAlternative[]>(`/questions/${questionId}/alternatives`, {
    method: "GET",
  });
}

export function createQuestionAlternative(
  questionId: string,
  text: string,
  correct: boolean,
) {
  return request<ApiAlternative>(`/questions/${questionId}/alternatives`, {
    method: "POST",
    body: JSON.stringify({ text, correct }),
  });
}

export async function getFormWithQuestions(formId: string): Promise<ApiFormWithQuestions> {
  const form = await getFormById(formId);
  const questions = await getFormQuestions(formId);
  const questionsWithAlternatives = await Promise.all(
    questions.map(async (question) => ({
      ...question,
      alternatives: await getQuestionAlternatives(question.idQuestion),
    })),
  );

  return {
    ...form,
    questions: questionsWithAlternatives,
  };
}

export function createFormAnswer(
  formId: string,
  userId: string,
  payload: FormAnswerPayload,
) {
  return request<ApiFormAnswer>(`/forms/${formId}/users/${userId}/answers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getFormUserAnswers(formId: string, userId: string) {
  return request<ApiFormAnswer[]>(`/forms/${formId}/users/${userId}/answers`, {
    method: "GET",
  });
}

export function getTrainingResults(trainingId: string) {
  return request<ApiFormAnswer[]>(`/results/trainings/${trainingId}`, {
    method: "GET",
  });
}

export function getTrainingUserResults(trainingId: string, userId: string) {
  return request<ApiFormAnswer[]>(`/results/trainings/${trainingId}/users/${userId}`, {
    method: "GET",
  });
}
