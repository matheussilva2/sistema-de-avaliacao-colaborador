import { request, type ApiUser } from "./authService";

export type ApiTraining = {
  idTraining: string;
  title: string;
  initDate: string;
  endDate: string;
  workload: number;
  description: string;
  trainingImage?: string | null;
  manager?: ApiUser;
};

export type CreateTrainingPayload = {
  title: string;
  initDate: string;
  endDate: string;
  workload: number;
  description: string;
};

export const getTrainingImageKey = (trainingId: string) =>
  `trainingImage:${trainingId}`;

export function createTrainingForManager(
  managerId: string,
  payload: CreateTrainingPayload,
) {
  return request<ApiTraining>(`/trainings/managers/${managerId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTrainingsByManager(managerId: string) {
  return request<ApiTraining[]>(`/trainings/managers/${managerId}`, {
    method: "GET",
  });
}

export function getTrainingById(trainingId: string) {
  return request<ApiTraining>(`/trainings/${trainingId}`, {
    method: "GET",
  });
}

export function updateTraining(
  trainingId: string,
  payload: CreateTrainingPayload,
) {
  return request<ApiTraining>(`/trainings/${trainingId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateTrainingImage(trainingId: string, trainingImage: string) {
  return request<ApiTraining>(`/trainings/${trainingId}/image`, {
    method: "PUT",
    body: JSON.stringify({ trainingImage }),
  });
}

export function getTrainingUsers(trainingId: string) {
  return request<ApiUser[]>(`/trainings/${trainingId}/users`, {
    method: "GET",
  });
}

export function addUserToTraining(trainingId: string, userId: string) {
  return request<ApiTraining>(`/trainings/${trainingId}/users/${userId}`, {
    method: "POST",
  });
}

export function removeUserFromTraining(trainingId: string, userId: string) {
  return request<ApiTraining>(`/trainings/${trainingId}/users/${userId}`, {
    method: "DELETE",
  });
}

export function sortTrainingsStable(trainings: ApiTraining[]) {
  return [...trainings].sort((current, next) => {
    const currentStart = Date.parse(`${current.initDate}T00:00:00`) || 0;
    const nextStart = Date.parse(`${next.initDate}T00:00:00`) || 0;

    if (currentStart !== nextStart) {
      return nextStart - currentStart;
    }

    const titleCompare = current.title.localeCompare(next.title, "pt-BR");

    if (titleCompare !== 0) {
      return titleCompare;
    }

    return current.idTraining.localeCompare(next.idTraining);
  });
}

export function readTrainingsCache(key: string) {
  const cached = sessionStorage.getItem(key);

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as ApiTraining[];
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function writeTrainingsCache(key: string, trainings: ApiTraining[]) {
  sessionStorage.setItem(key, JSON.stringify(trainings));
}
