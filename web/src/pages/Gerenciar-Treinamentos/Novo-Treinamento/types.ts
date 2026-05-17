export type TestType = "pre-teste" | "pos-teste";

export type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  title: string;
  options: Option[];
};

export type TrainingFormData = {
  title: string;
  hours: string;
  startDate: string;
  endDate: string;
  description: string;
};
