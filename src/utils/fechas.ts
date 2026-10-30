const TZ = 'America/Argentina/Buenos_Aires';

export const primerDiaDelMesActual = (ahora: Date = new Date()): Date => {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: TZ, year: 'numeric', month: 'numeric',
    }).formatToParts(ahora);
    const anio = Number(partes.find((p) => p.type === 'year')!.value);
    const mes = Number(partes.find((p) => p.type === 'month')!.value);
    return new Date(Date.UTC(anio, mes - 1, 1));
};

export const mesDesdeTexto = (texto: string): Date => {
    const [anio, mes] = texto.split('-').map(Number);
    return new Date(Date.UTC(anio, mes - 1, 1));
};
// ---- Fechas de clase ----
// Una fecha de clase es un Date a medianoche UTC (columna DATE). Los horarios
// "HH:mm" de las clases son hora de Argentina, que no tiene horario de verano (UTC-3).

const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'] as const;
export type Dia = (typeof DIAS)[number];

const DIA_MS = 24 * 60 * 60 * 1000;

export const fechaDesdeTexto = (texto: string): Date => {
    const [anio, mes, dia] = texto.split('-').map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia));
};

export const fechaATexto = (fecha: Date): string => fecha.toISOString().slice(0, 10);

export const hoy = (ahora: Date = new Date()): Date => {
    const texto = new Intl.DateTimeFormat('en-CA', {timeZone: TZ}).format(ahora);
    return fechaDesdeTexto(texto);
};

export const sumarDias = (fecha: Date, dias: number): Date => new Date(fecha.getTime() + dias * DIA_MS);

export const diaSemanaDe = (fecha: Date): Dia => DIAS[fecha.getUTCDay()];

// Próxima fecha (desde `desde`, inclusive) que cae en ese día de la semana.
export const proximaFecha = (dia: Dia, desde: Date = hoy()): Date =>
    sumarDias(desde, (DIAS.indexOf(dia) - desde.getUTCDay() + 7) % 7);

// Instante en que empieza una clase en una fecha dada.
export const inicioDeClase = (fechaClase: Date, horaDesde: string): Date =>
    new Date(`${fechaATexto(fechaClase)}T${horaDesde}:00-03:00`);

// Fin del día de la clase (medianoche siguiente, hora de Argentina).
export const finDelDia = (fechaClase: Date): Date =>
    new Date(`${fechaATexto(sumarDias(fechaClase, 1))}T00:00:00-03:00`);
