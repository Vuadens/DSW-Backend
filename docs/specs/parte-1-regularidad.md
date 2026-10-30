# Spec — Parte 1: conexión front + back para la regularidad

Estado: **aprobada**.

## 1. Objetivo

Conectar el frontend (`DSW-Frontend`) con este backend para cubrir los requisitos de regularidad,
corriendo en local. El deploy queda para una etapa posterior.

| Requisito | Entidades |
|---|---|
| CRUD simples | Socio, Profesor, Actividad, Turno |
| CRUD dependientes | Clase, Inscripción |
| Listado 1 | Clases filtradas por día de la semana, con horarios y cupos |
| Listado 2 | Socios filtrados por plan, con nombre, apellido y DNI |

Prerrequisito (no es requisito de regularidad, pero sin él no se puede conectar nada):
**login real con email o DNI**.

## 2. Fuera de alcance

- CRUD de planes (el front solo los lee para los selects y el filtro).
- Cuotas, finanzas, máquinas, mantenimiento, materiales, sueldos (HistoricoSueldo).
- Registro de cuentas, recuperación de clave y foto de perfil.
- Pantalla de gestión de usuarios: las cuentas de demo las crea el seed.
- Deploy.

## 3. Decisiones tomadas

| # | Decisión |
|---|---|
| D1 | El email vive en `Usuario` (como en el modelo de dominio), obligatorio y único. El DNI se toma de `Persona`. |
| D2 | `Usuario.usuario` queda como nombre visible personalizable. **No es credencial**: deja de ser único y obligatorio. |
| D3 | El seed crea datos de demo con cuentas de los tres roles. |
| D4 | Se precargan 21 turnos: mañana, tarde y noche para cada día de la semana. El profesor se relaciona con los turnos (turno + día) en los que trabaja, usando la relación Profesor–Turno existente. |
| D5 | Inscripción completa: reserva para una fecha puntual, cancelación y asistencia. |
| D6 | Pueden inscribir el socio (a sí mismo), el profesor y el admin, siempre validando el cupo y las reglas de negocio. Las reglas se validan en el backend; el front las anticipa para dar feedback, pero la fuente de verdad es el backend. |
| D7 | El listado de clases muestra inscriptos y lugares disponibles, además del cupo total. |
| D8 | En el listado de socios por plan, el estado de la cuota se muestra solo al admin. El resto de los permisos no cambia (admin y profesor ven el listado; el socio no). |
| D9 | Con el front en modo conectado (`VITE_API_URL` definido) se ocultan del menú y de las rutas los módulos fuera de alcance. El modo demo (sin `VITE_API_URL`) sigue funcionando igual que hoy. |
| D10 | De los atributos que el front tiene y el backend no, se conservan solo **sueldo** y **turno** del profesor. Cada campo se muestra recién cuando el backend tiene lo necesario: turno se muestra en esta parte (la relación ya existe); sueldo queda oculto hasta que exista HistoricoSueldo. El resto (email y dirección del socio, supervisor del profesor) se elimina del front. |
| D11 | Reglas de reserva que dependen del plan y las cuotas: se implementa la relación Plan–Actividad del modelo de dominio (el plan del socio debe incluir la actividad) y se rechaza la reserva si el socio no pagó la cuota del mes actual. El tope de clases por mes y el cobro adicional quedan para cuando exista DetalleCuota. |
| D12 | Horarios de los turnos: mañana 07:00–13:00, tarde 13:00–19:00, noche 19:00–23:00. |
| D13 | Ventana de reserva: desde hoy hasta 7 días adelante. |
| D14 | Se puede cancelar hasta el horario de inicio de la clase. La asistencia se marca desde el inicio de la clase hasta el final de ese día. |
| D15 | El profesor solo inscribe socios en las clases que dicta. |

## 4. Cambios en el backend

### B1. Login con email o DNI

- Migración: `Usuario.email` (obligatorio, único). `Usuario.usuario` pasa a opcional y no único.
  Las filas existentes reciben un email provisorio `<idUsuario>@sin-email.local`, que hay que reemplazar.
- `POST /api/auth/login`
  - Body: `{ "identificador": string, "password": string }`
  - Si `identificador` contiene `@`, se busca el usuario por email; si no, por el DNI de su persona.
  - Respuesta 200: `{ token, usuario: { idUsuario, usuario, email, rol, personaId } }`
  - 401 `Credenciales inválidas` si no existe, la contraseña no coincide o el usuario está inactivo.
- `GET /api/auth/me`: incluye `email` y los datos de `persona`.
- `POST/PATCH /api/usuarios`: aceptan `email` (obligatorio al crear, 409 si está repetido) y `usuario` opcional.

### B2. Turnos precargados

- El seed crea los 21 turnos (7 días × mañana/tarde/noche) con nombre `Mañana`, `Tarde`, `Noche`.
  Horarios según D12.
- Sin cambios de API: el CRUD y la asignación (`POST /turnos/:id/profesores`,
  `DELETE /turnos/:id/profesores/:idProfesor`) ya existen.
- `GET /api/profesores` y `GET /api/profesores/:id` incluyen los `turnos` de cada profesor, para que el
  front pueda mostrarlos sin un pedido por turno.

### B3. Inscripción por fecha, con cancelación y asistencia

Modelo:

| Campo | Tipo | Notas |
|---|---|---|
| `fechaClase` | fecha | Nuevo. Debe caer en el `diaSemana` de la clase. |
| `estado` | `CONFIRMADA` \| `CANCELADA` | Reemplaza a `activo`. |
| `asistio` | boolean, default `false` | Nuevo. |

Único: `(idSocio, idClase, fechaClase)` (reemplaza a `(idSocio, idClase)`).

Endpoints:

| Método y ruta | Quién | Descripción |
|---|---|---|
| `GET /inscripciones?idClase=&idSocio=&fecha=` | admin, profesor; socio solo las propias | Listado con filtros opcionales |
| `GET /inscripciones/:id` | admin, profesor; socio solo la propia | |
| `POST /inscripciones` `{ idSocio, idClase, fechaClase }` | admin; profesor solo en clases que dicta (D15); socio solo para sí mismo | Reserva |
| `PATCH /inscripciones/:id/cancelar` | admin; profesor solo en clases que dicta; socio solo la propia | Ver RN-C |
| `PATCH /inscripciones/:id/asistencia` `{ asistio }` | admin; profesor solo si dicta esa clase | Ver RN-A |
| `DELETE /inscripciones/:id` | admin | Borrado físico |

Reglas de negocio de la reserva (RN-R), en este orden:

1. El socio existe y no está dado de baja.
2. La clase existe.
3. `fechaClase` cae en el `diaSemana` de la clase y está dentro de la ventana de reserva (D13).
4. El socio no tiene otra inscripción `CONFIRMADA` para esa clase y fecha. Si tiene una `CANCELADA`, se reactiva.
5. Hay cupo: inscripciones `CONFIRMADA` de esa clase y fecha < `cupo`.
6. El plan del socio incluye la actividad de la clase (D11).
7. El socio pagó la cuota del mes actual (D11).

RN-C (cancelación): solo inscripciones `CONFIRMADA`, antes del horario de inicio de la clase (D14).

RN-A (asistencia): solo inscripciones `CONFIRMADA`, desde el horario de inicio de la clase hasta el final de ese día (D14).

Plan–Actividad (D11): relación muchos a muchos entre `Plan` y `Actividad`. Los planes existentes quedan
asociados a todas las actividades para no bloquear reservas; el seed de demo define las asociaciones reales.
`GET /api/planes` incluye las actividades de cada plan y `GET /api/actividades` los planes de cada actividad.
Las asociaciones se editan desde la actividad: `POST/PATCH /api/actividades` aceptan `planes: number[]`.

Migración de datos: cada inscripción existente pasa a `fechaClase` = próxima fecha de su clase a partir de la fecha de
la migración, con `estado` según `activo` y `asistio = false`.

### B4. Clases con ocupación

- `GET /api/clases?dia=&idProfesor=&idActividad=&fecha=`
- Cada clase incluye, además de lo actual:
  - `fecha`: la fecha consultada (`fecha` si se pasa; si no, la próxima ocurrencia de la clase desde hoy).
  - `inscriptos`: inscripciones `CONFIRMADA` de la clase en esa fecha.
  - `disponibles`: `cupo - inscriptos`.
- `PATCH /api/clases/:id`: rechaza bajar el `cupo` por debajo de los inscriptos de cualquier fecha futura (resuelve el TODO actual).

### B5. Socios por plan

- `GET /api/socios?planId=` devuelve `idPersona`, `persona { dni, nombre, apellido }` y,
  **solo para el admin**, `estadoCuota`.

### B6. Seed de demo

Datos parecidos a los del front, para que la demo no arranque vacía:

- Los planes, actividades y clases del seed del front.
- Los 21 turnos (B2), con profesores asignados.
- Un admin, al menos dos profesores y varios socios en planes distintos, cada uno con su usuario.
- Algunas inscripciones para que los listados muestren ocupación.
- Las credenciales de demo se documentan en el README del backend.

## 5. Cambios en el frontend

### F1. Login real y sesión

- `LoginPage`: un solo campo "Email o DNI" + contraseña. Se elimina el selector de rol (el rol viene del backend).
- `POST /auth/login` → guardar el token (`localStorage`), llamar a `setAuthToken` y cargar el usuario con `/auth/me`.
- Al recargar la página, se recupera la sesión desde el token guardado. Un 401 en cualquier pedido cierra la sesión.
- `hydrate()` se ejecuta después del login y pide solo lo que el rol puede ver.
- Modo demo: se mantienen las cuentas y el login local actuales.

### F2. Socios y profesores

- Los adaptadores pasan al formato de Persona (`idPersona`, `persona.{dni, nombre, apellido, telefono, fechaNac}`).
- Socio: formulario con dni, nombre, apellido, teléfono, fecha de nacimiento, plan, fecha de alta y fecha de baja.
  Se eliminan email y dirección.
- Profesor: formulario con dni, nombre, apellido, teléfono, fecha de nacimiento y cargo. Se elimina supervisor.
  Se muestran sus turnos (B2) y se pueden asignar y desasignar. Sueldo queda oculto (D10).
- El email que se muestra en el perfil sale del usuario (`/auth/me`).

### F3. Actividades y turnos

- Actividades: se corrige `PUT` → `PATCH` y se agrega el campo `cupoMaximo` al formulario (hoy va fijo en 20).
- Turnos: CRUD con día, horario y nombre, siguiendo el formato del backend. En modo conectado, `CatalogosPage` muestra
  solo la pestaña de turnos.

### F4. Clases e inscripciones

- Clases: CRUD conectado. Mapeo de días `Lun` ↔ `LUNES`, `desde`/`hasta` ↔ `horaDesde`/`horaHasta`.
  Se elimina `ocupadosBase`: la ocupación viene de B4.
- Reservar (socio): inscribirse a una clase para una fecha, con los mensajes de error del backend.
- Mis reservas (socio): listado y cancelación.
- Agenda del profesor: alumnos por clase y fecha, y marcar asistencia.
- Admin: inscribir a un socio y cancelar o borrar inscripciones.

### F5. Listados

- Clases: filtro por día de la semana; cada clase muestra horario, cupo, inscriptos y disponibles.
- Socios: filtro por plan; cada socio muestra nombre, apellido y DNI. El admin ve además el estado de la cuota.

### F6. Módulos ocultos en modo conectado (D9)

Planes (CRUD), Finanzas, Máquinas, Materiales, Mis cuotas, registro, recuperar clave, foto de perfil y los
indicadores del inicio que dependen de esos módulos.

## 6. Orden de trabajo y PRs

Un PR por bloque, en este orden. Cada PR del front se prueba contra el backend ya mergeado.

1. Back: B1 (login).
2. Back: B2 + B5 + B6 (turnos precargados, socios por plan, seed).
3. Back: B3 + B4 (inscripción por fecha, Plan–Actividad y ocupación de clases).
4. Front: F1 + F6 (login, sesión y módulos ocultos).
5. Front: F2 (socios y profesores).
6. Front: F3 (actividades y turnos).
7. Front: F4 (clases e inscripciones).
8. Front: F5 (listados).

## 7. Criterios de aceptación

- Con backend + MySQL + front corriendo en local, los tres roles entran con email o con DNI.
- Cada CRUD de la sección 1 crea, lista, edita y borra contra la base, y los errores del backend se muestran en la UI.
- Una reserva que viola una regla (sin cupo, duplicada, socio dado de baja, fecha inválida, actividad fuera del plan,
  cuota del mes impaga) se rechaza en el backend
  aunque se saltee la validación del front.
- El listado de clases por día muestra horarios, cupo, inscriptos y disponibles correctos.
- El listado de socios por plan muestra nombre, apellido y DNI; el estado de la cuota aparece solo para el admin.
- Sin `VITE_API_URL`, el modo demo funciona igual que antes.
