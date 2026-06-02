export function timeAgoAr(ts: number): string {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "أمس";
  if (days < 7) return `منذ ${days} أيام`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `منذ ${weeks} أسبوع`;
  const months = Math.floor(days / 30);
  return `منذ ${months} شهر`;
}

export function daysUntil(dateStr: string | null): { label: string; isOverdue: boolean } {
  if (!dateStr) return { label: "بدون موعد", isOverdue: false };
  const due = new Date(dateStr + "T23:59:59").getTime();
  const diffDays = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `متأخرة ${Math.abs(diffDays)} يوم`, isOverdue: true };
  if (diffDays === 0) return { label: "اليوم", isOverdue: false };
  if (diffDays === 1) return { label: "غداً", isOverdue: false };
  return { label: `خلال ${diffDays} يوم`, isOverdue: false };
}
