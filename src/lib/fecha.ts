// Las fechas de las colecciones se guardan como YYYY-MM-DD (UTC); se formatean en UTC para que no se corran un día.
const pad = (n: number) => String(n).padStart(2, '0');

export const fechaCorta = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;

export const diaMes = (d: Date) =>
  `${d.getUTCDate()} ${new Intl.DateTimeFormat('es-CO', { month: 'short', timeZone: 'UTC' }).format(d).replace('.', '')}`;
