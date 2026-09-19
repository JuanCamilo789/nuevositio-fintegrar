// EDITAR AQUÍ cuando cambien las tasas — alimenta TasasVigentes.astro y el ticker del topbar.
export const fechaActualizacion = '27 de julio de 2026';

export const cdtCondiciones = [
  { label: 'Monto mínimo', valor: '$875.000' },
  { label: 'Plazo mínimo', valor: '90 días' },
  { label: 'Plazo máximo', valor: '720 días' },
];

// Plazos confirmados en /creditos: maxMeses (Calamidad 12, Largo Plazo 36) y hastaNoviembre (Ordinario: se cancela
// antes del 30 de nov. del año de aprobación). Las demás líneas no publican plazo máximo.
export const creditos = [
  { id: 'ordinario', icon: 'tabler:credit-card', nombre: 'Crédito Ordinario', modalidad: 'Deducción quincenal, hasta el 30 de nov.', tasa: '1.7% M.V.', hastaNoviembre: true },
  { id: 'ahorro-navideno-anticipo', icon: 'tabler:credit-card', nombre: 'Anticipo Ahorro Navideño', modalidad: 'Se liquida en diciembre', tasa: '1.7% M.V.' },
  { id: 'eventos-especiales', icon: 'tabler:credit-card', nombre: 'Eventos Especiales', modalidad: 'Fechas programadas por Fintegrar', tasa: '0%' },
  { id: 'cuota-especial', icon: 'tabler:credit-card', nombre: 'Cuota Especial (Prima)', modalidad: 'Anticipo prima jun. / dic.', tasa: 'Según estudio', muted: true },
  { id: 'calamidad', icon: 'tabler:credit-card', nombre: 'Calamidad Doméstica', modalidad: 'Plazo máximo 12 meses', tasa: '0.5% M.V.', maxMeses: 12 },
  { id: 'vacacional', icon: 'tabler:credit-card', nombre: 'Plan Vacacional', modalidad: 'Con convenios aliados', tasa: '1.7% M.V.', muted: true },
  { id: 'largo-plazo', icon: 'tabler:credit-card', nombre: 'Crédito Largo Plazo', modalidad: 'Hasta 36 meses', tasa: '1.7% M.V.', maxMeses: 36 },
  { id: 'educacion', icon: 'tabler:credit-card', nombre: 'Crédito para Educación', modalidad: 'Instituciones certificadas', tasa: '1% M.V.' },
  { id: 'mejoras-vivienda', icon: 'tabler:credit-card', nombre: 'Mejoras de Vivienda', modalidad: 'Vivienda propia del asociado', tasa: '1% M.V.' },
  { id: 'compra-cartera', icon: 'tabler:credit-card', nombre: 'Compra de Cartera', modalidad: 'Consolide sus obligaciones', tasa: 'Según estudio', muted: true },
];

// Acceso directo a la tasa vigente de una línea de crédito por su id — úsalo en vez de
// escribir el valor de nuevo en otro componente, así solo se edita aquí.
export const tasaPorId: Record<string, string> = Object.fromEntries(
  creditos.map((c) => [c.id, c.tasa]),
);

// Extrae el valor numérico de una tasa tipo "1.53% M.V." → 1.53 (para cálculos, p. ej. el simulador).
export function tasaNumero(tasa: string): number {
  const match = tasa.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// Subconjunto destacado para el ticker rotativo del topbar (excluye tasas variables/"según estudio").
export const tasasDestacadas = creditos.filter((c) => !c.muted);
