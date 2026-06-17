export const DATE_INPUT_PLACEHOLDER = "dd/mm/aaaa";
export const TIME_INPUT_PLACEHOLDER = "hh:mm";
export const DEFAULT_START_TIME = "00:00";
export const DEFAULT_END_TIME = "23:59";

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

export function formatTimeForDisplay(value?: string | null) {
  const time = parseTimeValue(value);

  if (!time) {
    return "";
  }

  return `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`;
}

export function isCompleteTimeValue(value: string) {
  return Boolean(parseTimeValue(value));
}

export function parseTimeValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

export function isNowInsideAvailabilityWindow(
  initDate: string,
  initTime: string | null | undefined,
  endDate: string,
  endTime: string | null | undefined,
) {
  const start = buildDateTime(initDate, initTime || DEFAULT_START_TIME);
  const end = buildDateTime(endDate, endTime || DEFAULT_END_TIME, true);

  if (!start || !end) {
    return true;
  }

  const now = new Date();

  return now >= start && now <= end;
}

export function getAvailabilityStatus(
  initDate: string,
  initTime: string | null | undefined,
  endDate: string,
  endTime: string | null | undefined,
) {
  const start = buildDateTime(initDate, initTime || DEFAULT_START_TIME);
  const end = buildDateTime(endDate, endTime || DEFAULT_END_TIME, true);

  if (!start || !end) {
    return "available";
  }

  const now = new Date();

  if (now < start) {
    return "upcoming";
  }

  if (now > end) {
    return "expired";
  }

  return "available";
}

export function formatDateTimeForDisplay(
  date: string,
  time?: string | null,
  fallbackTime = "",
) {
  const dateText = formatDateForDisplay(date);
  const timeText = formatTimeForDisplay(time) || fallbackTime;

  return timeText ? `${dateText} ${timeText}` : dateText;
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

function buildDateTime(dateValue: string, timeValue: string, includeEntireMinute = false) {
  const date = parseDateValue(dateValue);
  const time = parseTimeValue(timeValue);

  if (!date || !time) {
    return null;
  }

  const dateTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.hours,
    time.minutes,
    0,
    0,
  );

  if (includeEntireMinute) {
    dateTime.setMinutes(dateTime.getMinutes() + 1);
    dateTime.setMilliseconds(dateTime.getMilliseconds() - 1);
  }

  return dateTime;
}

function formatDateParts(year: number, month: number, day: number) {
  return [
    String(day).padStart(2, "0"),
    String(month).padStart(2, "0"),
    String(year).padStart(4, "0"),
  ].join("/");
}
