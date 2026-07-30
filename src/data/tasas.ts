// EDITAR AQUÍ cuando cambien las tasas — alimenta TasasVigentes.astro y el ticker del topbar.
export const fechaActualizacion = '27 de julio de 2026';

export const cdtCondiciones = [
  { label: 'Monto mínimo', valor: '$875.000' },
  { label: 'Plazo mínimo', valor: '90 días' },
  { label: 'Plazo máximo', valor: '720 días' },
  { label: 'Tasa y periodicidad', valor: 'A elección', destacado: true },
];

export const creditos = [
  { icon: 'tabler:credit-card', nombre: 'Crédito Ordinario', modalidad: 'Deducción quincenal, hasta el 30 de nov.', tasa: '1.53% M.V.' },
  { icon: 'tabler:wallet', nombre: 'Anticipo Ahorro Navideño', modalidad: 'Se liquida en diciembre', tasa: '1.53% M.V.' },
  { icon: 'tabler:calendar-event', nombre: 'Eventos Especiales', modalidad: 'Fechas programadas por Fintegrar', tasa: '0%' },
  { icon: 'tabler:receipt', nombre: 'Cuota Especial (Prima)', modalidad: 'Anticipo prima jun. / dic.', tasa: 'Según estudio', muted: true },
  { icon: 'tabler:home-heart', nombre: 'Calamidad Doméstica', modalidad: 'Plazo máximo 12 meses', tasa: '0.5% M.V.' },
  { icon: 'tabler:plane', nombre: 'Plan Vacacional', modalidad: 'Con convenios aliados', tasa: '1.53% M.V.' },
  { icon: 'tabler:calendar-check', nombre: 'Crédito Largo Plazo', modalidad: 'Hasta 36 meses', tasa: '1.53% M.V.' },
  { icon: 'tabler:school', nombre: 'Crédito para Educación', modalidad: 'Instituciones certificadas', tasa: '1% M.V.' },
  { icon: 'tabler:home', nombre: 'Mejoras de Vivienda', modalidad: 'Vivienda propia del asociado', tasa: '1% M.V.' },
  { icon: 'tabler:building-bank', nombre: 'Compra de Cartera', modalidad: 'Consolide sus obligaciones', tasa: 'Inferior, según estudio', muted: true },
];

// Subconjunto destacado para el ticker rotativo del topbar (excluye tasas variables/"según estudio").
export const tasasDestacadas = creditos.filter((c) => !c.muted);
