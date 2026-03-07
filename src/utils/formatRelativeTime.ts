const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

export function formatRelativeTime(input: Date | string, now = new Date()) {
  const date = input instanceof Date ? input : new Date(input);
  const diffMilliseconds = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMilliseconds / 1000);

  if (Math.abs(diffSeconds) < 60) {
    return relativeTimeFormatter.format(diffSeconds, 'second');
  }

  const diffMinutes = Math.round(diffSeconds / 60);

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffDays) < 30) {
    return relativeTimeFormatter.format(diffDays, 'day');
  }

  const diffMonths = Math.round(diffDays / 30);

  if (Math.abs(diffMonths) < 12) {
    return relativeTimeFormatter.format(diffMonths, 'month');
  }

  const diffYears = Math.round(diffMonths / 12);
  return relativeTimeFormatter.format(diffYears, 'year');
}
