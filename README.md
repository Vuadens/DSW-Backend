# DSW-Backend

## Modelo de dominio

![Modelo de dominio](modelo-dominio.jpg)

### Herencia de Persona

`Persona` es la superclase de `Profesor`, `Socio` y `Administrador`. Se implementa
con una tabla por subtipo y **clave primaria compartida**: la PK de cada subtipo es
`idPersona`, que a su vez es FK a `Persona`. Cada persona tiene un único id en todo
el sistema, así que `/profesores/:id`, `/socios/:id` y `/administradores/:id` usan
el `idPersona`. `Usuario` se vincula a una `Persona` mediante `personaId`, y el JWT
lleva ese `personaId`.

### Diferencias entre el modelo de dominio y el código

Esta sección registra en qué se aparta la implementación del modelo de dominio.
Mantenerla actualizada cuando cambie el diagrama o el `schema.prisma`.

#### Eliminado del código para alinearlo al modelo de dominio

| Qué se quitó | Dónde estaba | Migración |
|---|---|---|
| Relación "supervisa" entre profesores (`supervisorId`) y los permisos de supervisor | `Profesor` | `20261029210000_quitar_supervisor_profesor` |
| `email` y `direccion` (los datos cargados se perdieron) | `Socio` | `20261029210100_quitar_email_direccion_socio` |
| `idProfesor` / `idSocio` como ids propios: ahora la PK es `idPersona` | `Profesor`, `Socio` | `20261029210200_persona_modelo_dominio` |
| `socioId` / `profesorId`: reemplazados por `personaId` | `Usuario` | `20261029210200_persona_modelo_dominio` |

Además, `nombre`, `apellido`, `DNI`, `telefono` y `fecha_nac` no se eliminaron sino que
**se movieron** de `Socio`/`Profesor` a `Persona` (como `dni`, `nombre`, `apellido`,
`telefono`, `fechaNac`), y `Socio.fecha_baja` pasó a llamarse `fechaBaja`.

#### En el modelo de dominio pero todavía no implementado

- **HistoricoSueldo** (`fechaDesde`, `valor`) y su relación con `Profesor` (1 — 1..*).
- **DetalleCuota** (`concepto`, `subtotal`, `monto`) y su relación con `Cuota` (1..* — 1).
- **Maquina** (`idMaquina`, `nombre`, `descripcion`, `tipo`, `estado`) y **Mantenimiento**
  (`fechaInicio`, `fechaFinEsperada`, `fechaFinReal`, `descripcion`).
- **Material** (`idMaterial`, `descripcion`, `stock`).
- Relación **Plan incluye Actividad** (1..* — 1..*).
- Relación **Clase se dicta en Turno** (0..* — 1).
- `Actividad.tipo`.

#### En el código pero no en el modelo de dominio

- **Usuario**: `username` se llama `usuario` y es solo un nombre visible, opcional y no
  único; se accede con `email` o con el DNI de la persona. La fecha de alta se llama
  `createdAt` (en el modelo, `fechaCreacion`); además tiene `updatedAt`.
- **Plan**: `descripcion`, `duracionMeses`, `activo`, `createdAt`, `updatedAt`.
- **Actividad**: `nombre`, `cupoMaximo`, `creadaEn`; la PK se llama `id` (en el modelo,
  `idActividad`).
- **Clase**: `diaSemana`, `horaDesde`, `horaHasta`. En el modelo el horario está en `Turno`;
  en el código cada clase guarda su propio horario.
- **Turno**: `nombre`, `activo` y una relación muchos a muchos **Turno–Profesor** (turnos de
  trabajo del personal). En el modelo `Turno` se relaciona con `Clase`, no con `Profesor`.
- **Inscripcion**: `activo` (baja lógica de la inscripción).

## Puesta en marcha local

```bash
npm install
cp .env.example .env   # completar DATABASE_URL, JWT_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
npx prisma migrate deploy
npm run seed
npm run dev
```

El seed es idempotente:

- Crea el administrador inicial (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DNI`) o le
  reemplaza el email provisorio.
- Precarga los 21 turnos de trabajo: mañana (07–13), tarde (13–19) y noche (19–23) para
  cada día de la semana.
- Si la base no tiene planes, carga datos de demo: planes, actividades, clases, profesores
  con sus turnos, socios, cuotas del mes e inscripciones.

### Cuentas de demo

Todas usan la contraseña `DEMO_PASSWORD` (por defecto `demo1234`). Se puede entrar con el
email o con el DNI.

| Rol | Email | DNI |
|---|---|---|
| Profesor | `marcos.benitez@hadesgym.com` | `28450111` |
| Profesor | `sofia.rossi@hadesgym.com` | `33120458` |
| Socio (al día) | `lucas.fernandez@gmail.com` | `38450192` |
| Socio (adeuda) | `ignacio.sosa@outlook.com` | `36980112` |

El resto de las cuentas están en `prisma/seed.ts`.
