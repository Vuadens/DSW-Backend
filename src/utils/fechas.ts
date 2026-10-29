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