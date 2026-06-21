import type { ApiUser } from "./authService";

export type TrashedEmployee = {
  user: ApiUser;
  deletedAt: string;
};

const getTrashKey = (managerId: string) => `employeeTrash:${managerId}`;

export function getTrashedEmployees(managerId: string) {
  const storedTrash = localStorage.getItem(getTrashKey(managerId));

  if (!storedTrash) {
    return [];
  }

  try {
    return JSON.parse(storedTrash) as TrashedEmployee[];
  } catch {
    localStorage.removeItem(getTrashKey(managerId));
    return [];
  }
}

export function getTrashedEmployeeIds(managerId: string) {
  return new Set(getTrashedEmployees(managerId).map((item) => item.user.id));
}

export function moveEmployeeToTrash(managerId: string, user: ApiUser) {
  const currentTrash = getTrashedEmployees(managerId);
  const nextTrash = [
    { user, deletedAt: new Date().toISOString() },
    ...currentTrash.filter((item) => item.user.id !== user.id),
  ];

  localStorage.setItem(getTrashKey(managerId), JSON.stringify(nextTrash));
  return nextTrash;
}

export function restoreEmployeeFromTrash(managerId: string, userId: string) {
  const nextTrash = getTrashedEmployees(managerId).filter(
    (item) => item.user.id !== userId,
  );

  localStorage.setItem(getTrashKey(managerId), JSON.stringify(nextTrash));
  return nextTrash;
}

export function removeEmployeeFromTrash(managerId: string, userId: string) {
  return restoreEmployeeFromTrash(managerId, userId);
}

export function clearEmployeeTrash(managerId: string) {
  localStorage.removeItem(getTrashKey(managerId));
}
