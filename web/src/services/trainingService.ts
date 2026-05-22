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
