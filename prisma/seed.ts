import 'dotenv/config';
import {DiaSemana, PrismaClient, Rol} from '@prisma/client';
import {hashPassword} from '../src/utils/password';
import {primerDiaDelMesActual} from '../src/utils/fechas';

const prisma = new PrismaClient();

const DIAS: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

// Tres turnos de trabajo por día de la semana.
const FRANJAS = [
    {nombre: 'Mañana', horaDesde: '07:00', horaHasta: '13:00'},
    {nombre: 'Tarde', horaDesde: '13:00', horaHasta: '19:00'},
    {nombre: 'Noche', horaDesde: '19:00', horaHasta: '23:00'},
];

const seedAdmin = async () => {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const usuario = process.env.ADMIN_USUARIO || 'admin';
    const dni = process.env.ADMIN_DNI || '00000000';
    if (!email || !password) throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios');

    const existente = await prisma.usuario.findFirst({where: {OR: [{email}, {persona: {dni}}]}});
    if (existente) {
        // Reemplaza el email provisorio que dejó la migración de Usuario.email.
        if (existente.email !== email) {
            await prisma.usuario.update({where: {idUsuario: existente.idUsuario}, data: {email}});
        }
        return;
    }
    // Todo usuario se vincula a una persona: el admin inicial se crea como Administrador.
    await prisma.usuario.create({
        data: {
            email,
            usuario,
            passwordHash: await hashPassword(password),
            rol: Rol.ADMINISTRADOR,
            persona: {
                create: {
                    dni,
                    nombre: usuario,
                    apellido: '',
                    telefono: '',
                    fechaNac: new Date('1900-01-01'),
                    administrador: {create: {}},
                },
            },
        },
    });
};

const seedTurnos = async () => {
    if ((await prisma.turno.count()) > 0) return;
    await prisma.turno.createMany({
        data: DIAS.flatMap((diaSemana) => FRANJAS.map((franja) => ({...franja, diaSemana}))),
    });
};

// Datos de demo, solo sobre una base sin planes, para que el front no arranque vacío.
const seedDemo = async () => {
    if ((await prisma.plan.count()) > 0) return;
    const passwordHash = await hashPassword(process.env.DEMO_PASSWORD || 'demo1234');

    const planes = [];
    for (const plan of [
        {nombre: 'Black Pass Total', tipo: 'PREMIUM', precio: 64000, descripcion: 'Pase total: todas las clases y vestuarios premium.'},
        {nombre: 'Fit & Clases', tipo: 'PRO', precio: 49000, descripcion: 'Musculación y clases grupales.'},
        {nombre: 'Musculación Libre', tipo: 'ESTANDAR', precio: 36000, descripcion: 'Solo musculación.'},
    ]) {
        planes.push(await prisma.plan.create({data: plan}));
    }

    const actividades = [];
    for (const actividad of [
        {nombre: 'Cross Functional', cupoMaximo: 20},
        {nombre: 'Cross Functional Matutino', cupoMaximo: 20},
        {nombre: 'Yoga & Flow', cupoMaximo: 18},
        {nombre: 'Spinning Pro', cupoMaximo: 25},
        {nombre: 'Spinning Sunset', cupoMaximo: 25},
        {nombre: 'Musculación', cupoMaximo: 40},
    ]) {
        actividades.push(await prisma.actividad.create({data: actividad}));
    }

    // [nombre, apellido, dni, email, teléfono, cargo, franjas en las que trabaja de lunes a viernes]
    const datosProfesores = [
        ['Marcos', 'Benítez', '28450111', 'marcos.benitez@hadesgym.com', '1145218890', 'Coordinador y preparador físico', ['Mañana']],
        ['Sofía', 'Rossi', '33120458', 'sofia.rossi@hadesgym.com', '1158741233', 'Instructora de Spinning y HIIT', ['Tarde', 'Noche']],
        ['Matías', 'Gómez', '31987220', 'matias.gomez@hadesgym.com', '1163980044', 'Especialista en Musculación y Fuerza', ['Tarde', 'Noche']],
        ['Valentina', 'Paz', '35004127', 'valentina.paz@hadesgym.com', '1131097765', 'Instructora de Yoga y Postura', ['Mañana']],
    ] as const;
    const turnos = await prisma.turno.findMany();
    const profesores = [];
    for (const [nombre, apellido, dni, email, telefono, cargo, franjas] of datosProfesores) {
        const turnosDelProfesor = turnos.filter(
            (t) => t.diaSemana !== 'SABADO' && t.diaSemana !== 'DOMINGO' && (franjas as readonly string[]).includes(t.nombre ?? ''),
        );
        const persona = await prisma.persona.create({
            data: {
                dni, nombre, apellido, telefono, fechaNac: new Date('1990-01-01'),
                profesor: {create: {cargo, turnos: {connect: turnosDelProfesor.map((t) => ({idTurno: t.idTurno}))}}},
                usuario: {create: {email, usuario: nombre, passwordHash, rol: Rol.PROFESOR}},
            },
        });
        profesores.push(persona.idPersona);
    }

    // [nombre, apellido, dni, email, plan]
    const datosSocios = [
        ['Lucas', 'Fernández', '38450192', 'lucas.fernandez@gmail.com', 0],
        ['Camila', 'Vázquez', '40129844', 'camila.vazquez@gmail.com', 1],
        ['Ignacio', 'Sosa', '36980112', 'ignacio.sosa@outlook.com', 2],
        ['Julieta', 'Méndez', '42880314', 'julieta.mendez@hotmail.com', 1],
        ['Esteban', 'Ríos', '35190442', 'esteban.rios@yahoo.com', 0],
        ['Agustina', 'López', '39401889', 'agus.lopez@gmail.com', 2],
    ] as const;
    const socios = [];
    for (const [nombre, apellido, dni, email, plan] of datosSocios) {
        const persona = await prisma.persona.create({
            data: {
                dni, nombre, apellido, telefono: '1100000000', fechaNac: new Date('1995-01-01'),
                socio: {create: {plan: {connect: {idPlan: planes[plan].idPlan}}}},
                usuario: {create: {email, usuario: nombre, passwordHash, rol: Rol.SOCIO}},
            },
        });
        socios.push({idPersona: persona.idPersona, plan: planes[plan]});
    }

    // Ignacio y Julieta adeudan la cuota del mes.
    const mesAnio = primerDiaDelMesActual();
    for (const [i, socio] of socios.entries()) {
        if (i === 2 || i === 3) continue;
        await prisma.cuota.create({data: {socioId: socio.idPersona, mesAnio, valor: socio.plan.precio}});
    }

    // [actividad, día, desde, hasta, cupo, profesor]
    const datosClases = [
        [0, 'LUNES', '08:00', '09:00', 20, 0],
        [2, 'MARTES', '09:00', '10:00', 18, 3],
        [3, 'MIERCOLES', '18:30', '19:30', 25, 1],
        [0, 'JUEVES', '10:00', '11:00', 20, 0],
        [3, 'VIERNES', '19:00', '20:00', 25, 1],
        [1, 'DOMINGO', '10:00', '11:15', 20, 0],
        [4, 'DOMINGO', '17:30', '18:30', 25, 1],
    ] as const;
    const clases = [];
    for (const [actividad, diaSemana, horaDesde, horaHasta, cupo, profesor] of datosClases) {
        clases.push(await prisma.clase.create({
            data: {
                diaSemana, horaDesde, horaHasta, cupo,
                idActividad: actividades[actividad].id,
                idProfesor: profesores[profesor],
            },
        }));
    }

    // Algunas inscripciones para que los listados muestren ocupación.
    for (const [socio, clase] of [[0, 0], [0, 3], [1, 2], [4, 0], [4, 4], [5, 2]] as const) {
        await prisma.inscripcion.create({data: {idSocio: socios[socio].idPersona, idClase: clases[clase].idClase}});
    }
};

const main = async () => {
    await seedAdmin();
    await seedTurnos();
    await seedDemo();
};

main().finally(() => prisma.$disconnect());
