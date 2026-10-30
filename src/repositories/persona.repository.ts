import { prisma } from '../config/prisma';
import { PersonaInput } from '../schemas/persona.schema';

const CAMPOS_PERSONA = ['dni', 'nombre', 'apellido', 'telefono', 'fechaNac'] as const;

// Separa los atributos de Persona del resto de los datos del subtipo.
export const separarPersona = <T extends Partial<PersonaInput>>(data: T) => {
  const persona: Partial<PersonaInput> = {};
  const resto: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(data)) {
    if ((CAMPOS_PERSONA as readonly string[]).includes(clave)) {
      (persona as Record<string, unknown>)[clave] = valor;
    } else {
      resto[clave] = valor;
    }
  }
  return { persona, resto: resto as Omit<T, keyof PersonaInput> };
};

export const findByDni = (dni: string) =>
  prisma.persona.findUnique({ where: { dni } });

export const findById = (idPersona: number) =>
  prisma.persona.findUnique({
    where: { idPersona },
    include: { profesor: true, socio: true, administrador: true, usuario: true },
  });

// Borra la persona solo si ya no cumple ningún rol (profesor, socio o administrador).
// El borrado arrastra a su usuario por el onDelete: Cascade.
export const eliminarSiNoTieneRoles = (idPersona: number) =>
  prisma.persona.deleteMany({
    where: {
      idPersona,
      profesor: { is: null },
      socio: { is: null },
      administrador: { is: null },
    },
  });
