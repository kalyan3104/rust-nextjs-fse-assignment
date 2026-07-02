const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return `${pad2(date.getUTCDate())} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return `${pad2(date.getUTCDate())} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()} ${pad2(
    date.getUTCHours()
  )}:${pad2(date.getUTCMinutes())}`;
}

export function formatDaysLeft(daysLeft: number): string {
  if (daysLeft < 0) {
    const overdue = Math.abs(daysLeft);
    return `expired ${overdue} day${overdue === 1 ? "" : "s"} ago`;
  }
  if (daysLeft === 0) return "expires today";
  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
}

export function truncateMiddle(value: string, maxLen = 28): string {
  if (value.length <= maxLen) return value;
  const half = Math.floor((maxLen - 3) / 2);
  return `${value.slice(0, half)}...${value.slice(value.length - half)}`;
}
