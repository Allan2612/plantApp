export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  // Trabajamos siempre en zona local; solo tomar YYYY-MM-DD
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function daysInMonthGrid(year: number, month: number): { date: string; inMonth: boolean }[] {
  // Devuelve 42 celdas (6 semanas) empezando en Lunes
  const first = startOfMonth(year, month);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = Lunes
  const start = new Date(year, month, 1 - firstWeekday);
  const cells: { date: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: toISODate(d), inMonth: d.getMonth() === month });
  }
  return cells;
}

export function formatMonthLabel(year: number, month: number): string {
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${months[month]} ${year}`;
}

export function formatDayLabel(iso: string): string {
  const d = parseISODate(iso);
  const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}
