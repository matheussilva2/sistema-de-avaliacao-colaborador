import type { ApiForm } from "./formService";

export type TrashedForm = {
  form: ApiForm;
  deletedAt: string;
};

const getTrashKey = (trainingId: string) => `formTrash:${trainingId}`;

export function getTrashedForms(trainingId: string) {
  const storedTrash = localStorage.getItem(getTrashKey(trainingId));

  if (!storedTrash) {
    return [];
  }

  try {
    return JSON.parse(storedTrash) as TrashedForm[];
  } catch {
    localStorage.removeItem(getTrashKey(trainingId));
    return [];
  }
}

export function getTrashedFormIds(trainingId: string) {
  return new Set(getTrashedForms(trainingId).map((item) => item.form.idForm));
}

export function moveFormToTrash(trainingId: string, form: ApiForm) {
  const currentTrash = getTrashedForms(trainingId);
  const nextTrash = [
    { form, deletedAt: new Date().toISOString() },
    ...currentTrash.filter((item) => item.form.idForm !== form.idForm),
  ];

  localStorage.setItem(getTrashKey(trainingId), JSON.stringify(nextTrash));
  return nextTrash;
}

export function restoreFormFromTrash(trainingId: string, formId: string) {
  const nextTrash = getTrashedForms(trainingId).filter(
    (item) => item.form.idForm !== formId,
  );

  localStorage.setItem(getTrashKey(trainingId), JSON.stringify(nextTrash));
  return nextTrash;
}

export function removeFormFromTrash(trainingId: string, formId: string) {
  return restoreFormFromTrash(trainingId, formId);
}

export function clearFormTrash(trainingId: string) {
  localStorage.removeItem(getTrashKey(trainingId));
}
