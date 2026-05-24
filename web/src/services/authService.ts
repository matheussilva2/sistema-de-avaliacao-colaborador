import { userMock } from "../mock";
import type { Cargo } from "../types/User";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const AUTH_USER_KEY = "authUser";
const AUTH_LAST_ACTIVITY_KEY = "authLastActivity";
export const SESSION_TIMEOUT_MS = 7 * 60 * 1000;

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type ApiUserRole = "MANAGER" | "EMPLOYEE";

export type ApiUser = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  cpf: string;
  hireDate?: string | null;
  registrationDate?: string | null;
  profilePhoto?: string | null;
  userRole: ApiUserRole;
  active: boolean;
};

export type LoginPayload = {
  email: string;
  passWord: string;
};

export type CreateUserPayload = {
  name: string;
  lastName: string;
  email: string;
  passWord: string;
  phone: string;
  cpf: string;
  hireDate: string;
  registrationDate: string;
  userRole: ApiUserRole;
  active: boolean;
};

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  touchSession();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new ApiRequestError(
      errorMessage || "Nao foi possivel concluir a requisicao.",
      response.status,
    );
  }

  const responseText = await response.text();

  if (response.status === 204 || !responseText) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return responseText as T;
  }
}

export function mapUserRoleToCargo(userRole: ApiUserRole): Cargo {
  return userRole === "MANAGER" ? "gerenciador" : "colaborador";
}

function getPermissionsByRole(cargo: Cargo) {
  const isManager = cargo === "gerenciador";

  return [
    { name: "verTreinamentos", label: "Ver Treinamentos", isEnabled: true },
    {
      name: "gerenciarUsuarios",
      label: "Gerenciar Usuarios",
      isEnabled: isManager,
    },
    {
      name: "gerenciarTreinamentos",
      label: "Gerenciar Treinamento",
      isEnabled: isManager,
    },
    {
      name: "criarTreinamentos",
      label: "Criar Treinamentos",
      isEnabled: isManager,
    },
  ];
}

export function syncUserMockWithApiUser(user: ApiUser) {
  const cargo = mapUserRoleToCargo(user.userRole);

  userMock.nome = user.name;
  userMock.sobrenome = user.lastName;
  userMock.email = user.email;
  userMock.telefone = user.phone;
  userMock.cargo = cargo;
  userMock.foto = user.profilePhoto ?? undefined;
  userMock.permissoes = getPermissionsByRole(cargo);
}

export function saveAuthenticatedUser(user: ApiUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  markSessionActivity();
  syncUserMockWithApiUser(user);
}

export function getAuthenticatedUser() {
  if (isSessionExpired()) {
    clearAuthenticatedUser();
    return null;
  }

  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as ApiUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function clearAuthenticatedUser() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
  sessionStorage.clear();
}

export function login(payload: LoginPayload) {
  return request<ApiUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createUser(payload: CreateUserPayload) {
  return request<ApiUser>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function touchSession() {
  if (!localStorage.getItem(AUTH_USER_KEY)) {
    return;
  }

  if (!localStorage.getItem(AUTH_LAST_ACTIVITY_KEY)) {
    markSessionActivity();
    return;
  }

  if (isSessionExpired()) {
    clearAuthenticatedUser();
    return;
  }

  markSessionActivity();
}

export function isSessionExpired() {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  const lastActivity = localStorage.getItem(AUTH_LAST_ACTIVITY_KEY);

  if (!storedUser) {
    return false;
  }

  if (!lastActivity) {
    return true;
  }

  return Date.now() - Number(lastActivity) > SESSION_TIMEOUT_MS;
}

function markSessionActivity() {
  localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, String(Date.now()));
}
