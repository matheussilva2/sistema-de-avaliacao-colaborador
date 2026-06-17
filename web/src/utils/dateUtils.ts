export const DATE_INPUT_PLACEHOLDER = "dd/mm/aaaa";

export function formatDateInput(value: string) {
  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return formatDateForDisplay(trimmedValue);
  }

  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function formatDateForDisplay(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = parseDateValue(value);

  if (!date) {
    return value;
  }

  return formatDateParts(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

export function getTodayDisplayDate() {
  const today = new Date();

  return formatDateParts(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );
}

export function isCompleteDateValue(value: string) {
  const trimmedValue = value.trim();

  return (
    /^\d{2}\/\d{2}\/\d{4}$/.test(trimmedValue) ||
    /^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)
  );
}

export function parseDateValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  const brDateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedValue);
  const shortBrDateMatch = /^(\d{2})\/(\d{2})$/.exec(trimmedValue);
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);

  if (brDateMatch) {
    return buildDate(
      Number(brDateMatch[3]),
      Number(brDateMatch[2]),
      Number(brDateMatch[1]),
    );
  }

  if (isoDateMatch) {
    return buildDate(
      Number(isoDateMatch[1]),
      Number(isoDateMatch[2]),
      Number(isoDateMatch[3]),
    );
  }

  if (shortBrDateMatch) {
    return buildDate(
      new Date().getFullYear(),
      Number(shortBrDateMatch[2]),
      Number(shortBrDateMatch[1]),
    );
  }

  return null;
}

function buildDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateParts(year: number, month: number, day: number) {
  return [
    String(day).padStart(2, "0"),
    String(month).padStart(2, "0"),
    String(year).padStart(4, "0"),
  ].join("/");
}
