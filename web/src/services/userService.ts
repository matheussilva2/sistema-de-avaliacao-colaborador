import {
  request,
  type ApiUser,
  type ApiUserRole,
  type CreateUserPayload,
} from "./authService";
import type { ApiTraining } from "./trainingService";

export type UserFormPayload = {
  name: string;
  lastName: string;
  email: string;
  passWord?: string;
  phone: string;
  cpf: string;
  hireDate: string;
  registrationDate: string;
  userRole: ApiUserRole;
  active: boolean;
};

export function getUsers() {
  return request<ApiUser[]>("/users", {
    method: "GET",
  });
}

export function getEmployeesByManager(managerId: string) {
  return request<ApiUser[]>(`/users/managers/${managerId}/employees`, {
    method: "GET",
  });
}

export function getUserById(id: string) {
  return request<ApiUser>(`/users/${id}`, {
    method: "GET",
  });
}

export function createUser(payload: CreateUserPayload) {
  return request<ApiUser>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createEmployeeForManager(
  managerId: string,
  payload: CreateUserPayload,
) {
  return request<ApiUser>(`/users/managers/${managerId}/employees`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: string, payload: UserFormPayload) {
  return request<ApiUser>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateUserPhoto(id: string, profilePhoto: string) {
  return request<ApiUser>(`/users/${id}/photo`, {
    method: "PUT",
    body: JSON.stringify({ profilePhoto }),
  });
}

export function deleteUser(id: string) {
  return request<string>(`/users/${id}`, {
    method: "DELETE",
  });
}

export function getUserTrainings(userId: string) {
  return request<ApiTraining[]>(`/users/${userId}/trainings`, {
    method: "GET",
  });
}
