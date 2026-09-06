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