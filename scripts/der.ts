// Genera el DER (diagrama entidad-relación) de la base a partir de prisma/schema.prisma,
// como diagrama Mermaid en docs/der.md. Toma el modelo del cliente de Prisma generado,
// así que hay que correr `npx prisma generate` después de cambiar el schema.
import { Prisma } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type Campo = Prisma.DMMF.Field;
type Modelo = Prisma.DMMF.Model;

const raiz = join(__dirname, '..');
const schema = readFileSync(join(raiz, 'prisma', 'schema.prisma'), 'utf8');
const { models: modelos, enums } = Prisma.dmmf.datamodel;

// Tipos nativos (@db.X) declarados en el schema, que el DMMF no informa: "Modelo.campo" → "DATE".
const nativos = new Map<string, string>();
for (const bloque of schema.matchAll(/model (\w+) \{([^}]*)\}/g)) {
  for (const linea of bloque[2].split('\n')) {
    const nativo = linea.match(/^\s*(\w+)\s+\S+.*@db\.(\w+)(?:\(([^)]*)\))?/);
    if (nativo) nativos.set(`${bloque[1]}.${nativo[1]}`, nativo[3] ? `${nativo[2].toUpperCase()}(${nativo[3]})` : nativo[2].toUpperCase());
  }
}

// Tipo de la columna en MySQL según cómo lo crea Prisma.
const tipoSql = (modelo: Modelo, campo: Campo) => {
  const nativo = nativos.get(`${modelo.name}.${campo.name}`);
  if (nativo) return nativo;
  if (campo.kind === 'enum') return `ENUM(${enums.find((e) => e.name === campo.type)!.values.map((v) => v.name).join(', ')})`;
  return ({ Int: 'INT', String: 'VARCHAR(191)', DateTime: 'DATETIME(3)', Decimal: 'DECIMAL(65,30)', Boolean: 'BOOLEAN' } as Record<string, string>)[campo.type] ?? campo.type.toUpperCase();
};

// Mermaid no admite paréntesis ni comas en el tipo: se muestra el tipo base y el detalle va en el comentario.
const tipoCorto = (sql: string) => sql.replace(/\(.*$/, '').toLowerCase();

const clavesForaneas = (modelo: Modelo) =>
  new Set(modelo.fields.flatMap((f) => (f.kind === 'object' ? f.relationFromFields ?? [] : [])));

const unicosCompuestos = (modelo: Modelo) => modelo.uniqueFields.filter((u) => u.length > 1);

const lineas: string[] = ['erDiagram'];

for (const modelo of modelos) {
  const fks = clavesForaneas(modelo);
  lineas.push(`  ${modelo.name} {`);
  for (const campo of modelo.fields.filter((f) => f.kind !== 'object')) {
    const claves = [campo.isId && 'PK', fks.has(campo.name) && 'FK', campo.isUnique && 'UK'].filter(Boolean).join(', ');
    const sql = tipoSql(modelo, campo);
    const detalle = [sql, campo.isRequired ? 'NOT NULL' : 'NULL', campo.hasDefaultValue && 'con valor por defecto']
      .filter(Boolean)
      .join(', ');
    lineas.push(`    ${tipoCorto(sql)} ${campo.name}${claves ? ` ${claves}` : ''} "${detalle}"`);
  }
  lineas.push('  }');
}

// Relaciones con clave foránea: el modelo que la declara es el lado "muchos" (o "uno" si la FK es única).
const relaciones: string[] = [];
for (const modelo of modelos) {
  for (const campo of modelo.fields) {
    if (campo.kind !== 'object' || !campo.relationFromFields?.length) continue;
    const [fk] = campo.relationFromFields;
    const columna = modelo.fields.find((f) => f.name === fk)!;
    const unoAUno = columna.isId || columna.isUnique;
    const padre = campo.isRequired ? '||' : '|o';
    const hijo = unoAUno ? 'o|' : 'o{';
    relaciones.push(`  ${campo.type} ${padre}--${hijo} ${modelo.name} : "${fk}"`);
  }
}

// Relaciones muchos a muchos implícitas: Prisma crea la tabla _<relación> con las columnas A y B,
// donde A apunta al modelo que va primero en orden alfabético.
const intermedias: string[] = [];
const vistas = new Set<string>();
for (const modelo of modelos) {
  for (const campo of modelo.fields) {
    if (campo.kind !== 'object' || !campo.isList || vistas.has(campo.relationName!)) continue;
    const otro = modelos.find((m) => m.name === campo.type)!;
    const inverso = otro.fields.find((f) => f.relationName === campo.relationName && f !== campo);
    if (!inverso?.isList) continue;
    vistas.add(campo.relationName!);
    const [a, b] = [modelo.name, otro.name].sort();
    const tabla = `_${campo.relationName}`;
    const pk = (nombre: string) => modelos.find((m) => m.name === nombre)!.fields.find((f) => f.isId)!.name;
    intermedias.push(
      `  ${tabla} {`,
      `    int A PK, FK "INT, NOT NULL, ${a}.${pk(a)}"`,
      `    int B PK, FK "INT, NOT NULL, ${b}.${pk(b)}"`,
      '  }'
    );
    relaciones.push(`  ${a} ||--o{ ${tabla} : "A"`, `  ${b} ||--o{ ${tabla} : "B"`);
  }
}

const restricciones = modelos.flatMap((m) =>
  unicosCompuestos(m).map((u) => `- \`${m.name}\`: (${u.map((c) => `\`${c}\``).join(', ')})`)
);

const salida = `# DER de la base de datos

> Generado con \`npm run der\` a partir de \`prisma/schema.prisma\`. No lo edites a mano: cambiá el schema,
> corré \`npx prisma generate\` y volvé a generar este archivo.

Tablas, columnas y relaciones tal como Prisma las crea en MySQL. Incluye las tablas intermedias de las
relaciones muchos a muchos implícitas. En cada columna se indica el tipo SQL, si admite nulos y si tiene
valor por defecto.

\`\`\`mermaid
${[...lineas, ...intermedias, ...relaciones].join('\n')}
\`\`\`

## Restricciones únicas compuestas

${restricciones.join('\n') || 'No hay.'}

## Enumeraciones

${enums.map((e) => `- \`${e.name}\`: ${e.values.map((v) => `\`${v.name}\``).join(', ')}`).join('\n')}
`;

writeFileSync(join(raiz, 'docs', 'der.md'), salida);
console.log('DER generado en docs/der.md');
