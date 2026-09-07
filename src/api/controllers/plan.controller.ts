import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';      //funciona como los import de phyton, trae herramientas de express

// Instanciamos Prisma para poder hablar con la base de datos
const prisma = new PrismaClient(); 

// Exportamos la función para poder usarla en las rutas
export const getPlanes = async (req: Request, res: Response) => {
    //req (Request / Petición): Tiene toda la info de quien te llama (parámetros, datos ocultos, IPs).
    //res (Response / Respuesta): Es lo que le vas a devolver a quien te llama (código de error, datos, etc).
  try {
    // await hace que el código "espere" hasta que MySQL devuelva los datos
    const planes = await prisma.plan.findMany({
      where: { activo: true } // Prisma se encarga de traducir esto a la consulta SQL: SELECT * FROM Plan WHERE activo = true.
    });
    
    // Si sale bien, respondemos con código HTTP 200 (OK) y mandamos la lista en JSON
    res.status(200).json(planes);

  } catch (error) {
    console.log("Error real de Prisma:", error);
    // Esto es el equivalente a un try/except en Python. Si MySQL falla, no se cae el servidor.
    res.status(500).json({ error: 'Error al obtener la lista de planes' });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    // 1. Extraemos los datos que nos envía el cliente en el "body"
    const { nombre, tipo, precio, descripcion, duracionMeses, activo } = req.body;
    // 2. Usamos Prisma para crear un nuevo registro en la tabla "Plan"
    const nuevoPlan = await prisma.plan.create({        //El await hace que el código espere ahí mismo hasta que MySQL confirme que se guardó.
      data: {
        nombre,
        tipo,
        precio: Number(precio),
        descripcion,
        duracionMeses: duracionMeses !== undefined ? Number(duracionMeses) : undefined,
        activo: activo !== undefined ? Boolean(activo) : undefined
      }
    });
    // 3. Respondemos con un código 201 (que en HTTP significa "Creado exitosamente")
    res.status(201).json(nuevoPlan);
  } catch (error) {
    console.log("Error real de Prisma al crear:", error);
    res.status(500).json({ error: 'Error al crear el nuevo plan' });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await prisma.plan.findUnique({
      where: { idPlan: Number(id) } // Asegúrate de que coincida con el nombre de tu clave primaria en el schema
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.log("Error al buscar el plan por ID:", error);
    res.status(500).json({ error: 'Error al obtener el plan' });
  }
};