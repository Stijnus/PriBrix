type RelativeTimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

function createRelativeTimeFormatter() {
  const RelativeTimeFormatConstructor = globalThis.Intl?.RelativeTimeFormat;

  if (typeof RelativeTimeFormatConstructor !== 'function') {
    return null;
  }

  return new RelativeTimeFormatConstructor('en', {
    numeric: 'auto',
  });
}

const relativeTimeFormatter = createRelativeTimeFormatter();

function formatRelativeTimeFallback(value: number, unit: RelativeTimeUnit) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue === 0) {
    return 'just now';
  }

  const label = absoluteValue === 1 ? unit : `${unit}s`;

  if (value > 0) {
    return `in ${absoluteValue} ${label}`;
  }

  return `${absoluteValue} ${label} ago`;
}

function formatUnit(value: number, unit: RelativeTimeUnit) {
  if (!relativeTimeFormatter) {
    return formatRelativeTimeFallback(value, unit);
  }

  return relativeTimeFormatter.format(value, unit);
}

export function formatRelativeTime(input: Date | string, now = new Date()) {
  const date = input instanceof Date ? input : new Date(input);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMilliseconds = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMilliseconds / 1000);

  if (Math.abs(diffSeconds) < 60) {
    return formatUnit(diffSeconds, 'second');
  }

  const diffMinutes = Math.round(diffSeconds / 60);

  if (Math.abs(diffMinutes) < 60) {
    return formatUnit(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatUnit(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffDays) < 30) {
    return formatUnit(diffDays, 'day');
  }

  const diffMonths = Math.round(diffDays / 30);

  if (Math.abs(diffMonths) < 12) {
    return formatUnit(diffMonths, 'month');
  }

  const diffYears = Math.round(diffMonths / 12);
  return formatUnit(diffYears, 'year');
}
