<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/hades-logo-dark.svg" />
    <img src="docs/assets/hades-logo.svg" alt="Hades" width="180" />
  </picture>
  <h1>Hades Gym Manager API</h1>
  <p><b>API REST para gestionar socios, planes, clases, inscripciones y cuotas de un gimnasio.</b></p>
  <p>
    <a href="https://github.com/Vuadens/DSW-Frontend">Frontend</a> ·
    <a href="https://github.com/Vuadens/Hades-Gym-Manager/blob/main/proposal.md">Propuesta</a>
  </p>
  <a href="https://nodejs.org"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express_4-339933?style=flat-square&logo=node.js&logoColor=white"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white"></a>
  <a href="https://www.prisma.io"><img alt="Prisma 5" src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white"></a>
  <a href="https://www.mysql.com"><img alt="MySQL" src="https://img.shields.io/badge/MySQL-persistencia-4479A1?style=flat-square&logo=mysql&logoColor=white"></a>
  <a href="https://github.com/Vuadens/DSW-Backend/commits"><img alt="Actividad de commits" src="https://img.shields.io/github/commit-activity/m/Vuadens/DSW-Backend?style=flat-square"></a>
</div>

## Contenido

- [Sobre el proyecto](#sobre-el-proyecto)
- [Arquitectura](#arquitectura)
- [Instalación desde cero](#instalación-desde-cero)
- [Actualizar una instalación existente](#actualizar-una-instalación-existente)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Datos de demo](#datos-de-demo)
- [Autenticación](#autenticación)
- [Referencia de la API](#referencia-de-la-api)
- [Reglas de negocio](#reglas-de-negocio)
- [Modelo de dominio](#modelo-de-dominio)
- [Estructura](#estructura)
- [Solución de problemas](#solución-de-problemas)
- [Equipo](#equipo)

## Sobre el proyecto

Hades nació como trabajo práctico de **Desarrollo de Software** en la UTN Facultad Regional Rosario. La [consigna](https://github.com/Vuadens/Hades-Gym-Manager) pide una aplicación full stack con frontend y backend independientes, comunicados por una API. El grupo eligió un problema concreto: centralizar la administración de un gimnasio, con control de cupos, cuotas y actividades.

Este repositorio contiene la API y el esquema de la base de datos. La interfaz está en [DSW-Frontend](https://github.com/Vuadens/DSW-Frontend).

## Arquitectura

El código se organiza en capas: cada pedido atraviesa la validación y los permisos antes de llegar a la lógica de negocio y a la persistencia.

```mermaid
flowchart LR
    F[Frontend] -->|HTTP + JWT| R[Rutas]
    R --> M[Autenticación<br/>y validación Zod]
    M --> C[Controladores]
    C --> S[Servicios]
    S --> P[Repositorios]
    P --> O[Prisma]
    O --> D[(MySQL)]
```

| Capa | Responsabilidad |
|---|---|
| `api/routes` | Define endpoints y permisos |
| `api/middlewares` | Autenticación, validación y manejo de errores |
| `api/controllers` | Traduce HTTP a llamadas de servicio |
| `services` | Reglas de negocio |
| `repositories` | Consultas con Prisma |
| `schemas` | Esquemas de validación con Zod |

## Instalación desde cero

### Requisitos

- [Node.js](https://nodejs.org). El proyecto se probó con la versión 24.
- [Git](https://git-scm.com)
- [MySQL](https://dev.mysql.com/downloads/) en ejecución

### Pasos

1. Cloná el repositorio e instalá las dependencias:

   ```bash
   git clone https://github.com/Vuadens/DSW-Backend.git
   cd DSW-Backend
   npm install
   ```

2. Creá la base de datos desde tu cliente de MySQL:

   ```sql
   CREATE DATABASE hades_gym;
   ```

3. Creá el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

4. Generá un secreto para firmar los tokens:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Completá `.env`, reemplazando `USUARIO`, `CONTRASEÑA` y los valores de ejemplo:

   ```env
   PORT=3000
   DATABASE_URL="mysql://USUARIO:CONTRASEÑA@127.0.0.1:3306/hades_gym"
   JWT_SECRET="el-secreto-generado"
   JWT_EXPIRES_IN=1d
   ADMIN_EMAIL=admin@hadesgym.com
   ADMIN_USUARIO=admin
   ADMIN_PASSWORD=una-contraseña-segura
   ADMIN_DNI=00000000
   DEMO_PASSWORD=demo1234
   ```

6. Aplicá las migraciones y generá el cliente de Prisma:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

7. Cargá los datos iniciales:

   ```bash
   npm run seed
   ```

8. Iniciá el servidor:

   ```bash
   npm run dev
   ```

9. Comprobá que responde:

   ```bash
   curl http://localhost:3000/api/health
   ```

   La respuesta esperada es `{"status":"ok"}`.

Para usar la interfaz, seguí la [guía del frontend](https://github.com/Vuadens/DSW-Frontend#instalación-desde-cero) con `VITE_API_URL=http://localhost:3000`.

## Actualizar una instalación existente

Corré Prisma dentro de esta carpeta y después de `npm install`. Fuera de ella, `npx prisma` descarga otra versión, con comandos distintos.

1. Actualizá el código y las dependencias:

   ```bash
   git switch main
   git pull origin main
   npm install
   ```

2. Elegí una opción según tus datos:

   **Conservar los datos**

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   npm run seed
   ```

   Si la base ya tiene planes, el seed no carga los datos de demo.

   **Empezar de cero**

   Este comando borra todos los datos de la base configurada en `DATABASE_URL`:

   ```bash
   npx prisma migrate reset
   npx prisma generate
   npm run seed
   ```

3. Verificá que no queden migraciones pendientes:

   ```bash
   npx prisma migrate status
   ```

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión a MySQL |
| `JWT_SECRET` | Sí | Secreto para firmar los tokens; sin él, la API no inicia |
| `ADMIN_EMAIL` | Sí, para el seed | Email del administrador inicial |
| `ADMIN_PASSWORD` | Sí, para el seed | Contraseña del administrador inicial |
| `PORT` | No | Puerto de la API; por defecto `3000` |
| `JWT_EXPIRES_IN` | No | Duración del token; por defecto `1d` |
| `ADMIN_USUARIO` | No | Nombre visible del administrador; por defecto `admin` |
| `ADMIN_DNI` | No | DNI del administrador; por defecto `00000000` |
| `DEMO_PASSWORD` | No | Contraseña de las cuentas de demo; por defecto `demo1234` |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila TypeScript en `dist/` |
| `npm start` | Ejecuta la compilación |
| `npm run seed` | Carga los datos iniciales |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Crea y aplica una migración en desarrollo |
| `npm test` | Pruebas con Jest. Todavía no hay pruebas en el repositorio |

## Datos de demo

El seed se puede repetir sin duplicar datos:

- Crea el administrador inicial (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DNI`) o le reemplaza el email provisorio.
- Precarga los 21 turnos de trabajo: mañana (07–13), tarde (13–19) y noche (19–23) para cada día de la semana.
- Si la base no tiene planes, carga planes, actividades, clases, profesores con sus turnos, socios, cuotas del mes e inscripciones.

Las cuentas usan la contraseña `DEMO_PASSWORD`, y se puede ingresar con email o DNI:

| Rol | Email | DNI |
|---|---|---|
| Profesor | `marcos.benitez@hadesgym.com` | `28450111` |
| Profesor | `sofia.rossi@hadesgym.com` | `33120458` |
| Socio al día | `lucas.fernandez@gmail.com` | `38450192` |
| Socio que adeuda | `ignacio.sosa@outlook.com` | `36980112` |

El resto de las cuentas está en `prisma/seed.ts`. Las cuotas de demo pertenecen al mes en que se corre el seed: al cambiar el mes, los socios pasan a adeudar la cuota.

## Autenticación

Iniciá sesión con email o DNI:

```http
POST /api/auth/login
Content-Type: application/json

{ "identificador": "lucas.fernandez@gmail.com", "password": "demo1234" }
```

Enviá el token recibido en cada pedido protegido:

```http
Authorization: Bearer <token>
```

Toda persona nueva recibe su `Usuario` al crearse, por lo que el alta pide un `email`. Esto incluye el registro público `POST /api/auth/registro`.

La contraseña inicial son los **últimos 6 dígitos del DNI**. Hasta cambiarla con `POST /api/auth/cambiar-password`, que devuelve un token nuevo, las rutas protegidas responden 403. Las cuentas anteriores a este cambio no están alcanzadas.

## Referencia de la API

La URL base es `/api`.

Roles: **A** administrador, **P** profesor, **S** socio. Público significa que no requiere iniciar sesión.

### Autenticación y usuarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/health` | Público | Estado del servicio |
| `POST` | `/auth/login` | Público | Iniciar sesión |
| `POST` | `/auth/registro` | Público | Registrar un socio |
| `POST` | `/auth/cambiar-password` | Sesión | Cambiar la contraseña |
| `GET` | `/auth/me` | Sesión | Perfil de la sesión |
| `GET` `POST` | `/usuarios` | A | Listar y crear |
| `GET` `PATCH` `DELETE` | `/usuarios/:id` | A | Consultar, modificar y eliminar |

### Personas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/socios` | A, P, S | Listar. Con `?planId=` filtra por plan; el socio solo se ve a sí mismo |
| `POST` | `/socios` | A | Crear |
| `GET` | `/socios/:id` | A, P, S | Detalle con plan, cuotas y estado |
| `PATCH` `PUT` `DELETE` | `/socios/:id` | A | Modificar y eliminar |
| `GET` | `/profesores` `/profesores/:id` | A, P | Listar y consultar |
| `POST` `DELETE` | `/profesores` `/profesores/:id` | A | Crear y eliminar |
| `PATCH` | `/profesores/:id` | A, P | Modificar |
| `GET` `POST` | `/administradores` | A | Listar y crear |
| `GET` `PATCH` `DELETE` | `/administradores/:id` | A | Consultar, modificar y eliminar |

### Oferta del gimnasio

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/planes` `/planes/:id` | Público | Listar y consultar |
| `POST` `PATCH` `DELETE` | `/planes` `/planes/:id` | A | Crear, modificar y eliminar |
| `GET` | `/actividades` `/actividades/:id` | Público | Listar y consultar |
| `POST` `PATCH` `DELETE` | `/actividades` `/actividades/:id` | A | Crear, modificar y eliminar |
| `GET` | `/clases` | Público | Listar con ocupación. Filtros: `dia`, `fecha`, `idProfesor`, `idActividad` |
| `GET` | `/clases/:id` | Público | Detalle con actividad, profesor y cupos |
| `POST` `PATCH` `DELETE` | `/clases` `/clases/:id` | A | Crear, modificar y eliminar |
| `GET` | `/turnos` `/turnos/:id` | A, P | Listar y consultar |
| `POST` `PATCH` `DELETE` | `/turnos` `/turnos/:id` | A | Crear, modificar y eliminar |
| `PATCH` | `/turnos/:id/cancelar` | A | Cancelar un turno |
| `GET` | `/turnos/:id/profesores` | A, P | Profesores del turno |
| `POST` | `/turnos/:id/profesores` | A | Asignar un profesor |
| `DELETE` | `/turnos/:id/profesores/:idProfesor` | A | Desasignar un profesor |

### Inscripciones y cuotas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/inscripciones` `/inscripciones/:id` | A, P, S | Listar y consultar |
| `POST` | `/inscripciones` | A, P, S | Inscribir a una clase en una fecha |
| `PATCH` | `/inscripciones/:id/cancelar` | A, P, S | Cancelar |
| `PATCH` | `/inscripciones/:id/asistencia` | A, P | Registrar asistencia |
| `DELETE` | `/inscripciones/:id` | A | Eliminar |
| `GET` | `/cuotas` | A, S | Listar; el socio solo ve las propias |
| `POST` | `/cuotas` | A | Registrar un cobro: `{ "socioId": 1, "mes": "2026-10" }`. `mes` es opcional |

### Errores

Los errores responden con un mensaje en formato JSON:

```json
{ "error": "La cuota de ese mes ya fue cobrada" }
```

| Código | Significado |
|---|---|
| `400` | Datos inválidos o regla de negocio incumplida |
| `401` | Sin sesión, o token inválido o vencido |
| `403` | Sin permiso, o contraseña inicial pendiente de cambio |
| `404` | Recurso inexistente |
| `409` | Conflicto, por ejemplo un valor repetido o registros relacionados |
| `500` | Error interno |

## Reglas de negocio

**Inscripciones**

- El socio tiene que estar activo, tener la cuota del mes paga y un plan que incluya la actividad.
- La fecha tiene que coincidir con el día de la clase, y la clase no puede haber comenzado.
- No se permite superar el cupo ni inscribir dos veces al mismo socio.
- Las inscripciones se cancelan con baja lógica, antes de que empiece la clase.
- La asistencia se registra el mismo día de la clase, una vez comenzada.

**Clases**

- Un profesor no puede dictar dos clases superpuestas.
- El cupo no puede quedar por debajo de los inscriptos de una fecha próxima.

**Cuotas**

- Un mes se cobra una sola vez por socio, y no se pueden cobrar meses futuros.
- El valor se toma del plan del socio al registrar el cobro.

**Socios**

- Al dar de baja a un socio, se cancelan sus reservas de hoy en adelante.

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
- **Inscripcion**: es una reserva para una fecha puntual (`fechaClase`), con `estado`
  (`CONFIRMADA` / `CANCELADA`, baja lógica) y `asistio`.

## Estructura

```text
├── prisma/
│   ├── migrations/      Historial de la base de datos
│   ├── schema.prisma    Esquema
│   └── seed.ts          Datos iniciales
├── src/
│   ├── api/             Rutas, controladores y middlewares
│   ├── config/          Entorno y cliente de Prisma
│   ├── repositories/    Acceso a datos
│   ├── schemas/         Validación con Zod
│   ├── services/        Reglas de negocio
│   ├── utils/           Fechas, JWT, contraseñas y errores
│   ├── app.ts           Aplicación Express
│   └── server.ts        Punto de entrada
└── tests/               Pruebas unitarias y de integración
```

## Solución de problemas

| Problema | Solución |
|---|---|
| `ENOENT` o `Could not read package.json` | Corré el comando dentro de `DSW-Backend` |
| `npx` pide instalar Prisma o informa `migrate reset has been replaced` | Corré `npm install` y usá Prisma dentro de esta carpeta |
| `JWT_SECRET es obligatorio` | Completá `JWT_SECRET` en `.env` |
| `Can't reach database server` | Iniciá MySQL y revisá host y puerto en `DATABASE_URL` |
| `Access denied` | Corregí el usuario o la contraseña. Los símbolos de la contraseña tienen que estar codificados para URL |
| `Unknown database` | Creá la base del paso 2 |
| Falla una migración en una base vieja | Si no necesitás los datos, usá `npx prisma migrate reset` |
| Las cuentas de demo no ingresan | El seed no las carga si la base ya tiene planes. Usá una base vacía |
| Un socio al día no puede reservar | Cambió el mes desde el seed: registrá su cobro o recreá los datos |

## Equipo

- Juan Manuel Hidalgo Alcain
- Joaquín Emiliano Maza
- Lucas Emiliano Blesi
- Julieta Romina Méndez
