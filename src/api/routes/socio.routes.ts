import {Router} from "express";
import {authorize} from '../middlewares/auth.middleware';
import {Rol} from '@prisma/client';
import {
  getSocios,
  getSocioById,
  createSocio,
  updateSocio,
  deleteSocio,
  darDeBajaSocio,
  reactivarSocio
} from "../controllers/socio.controller";
import { validate } from "../middlewares/validate.middleware";
import { bajaSocioSchema, createSocioSchema, updateSocioSchema } from "../../schemas/socio.schema";

export const socioRouter = Router();

socioRouter.get("/", authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), getSocios);
socioRouter.get("/:id", authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), getSocioById);
socioRouter.post("/", authorize(Rol.ADMINISTRADOR), validate(createSocioSchema), createSocio);
socioRouter.patch("/:id", authorize(Rol.ADMINISTRADOR), validate(updateSocioSchema), updateSocio);
socioRouter.put("/:id", authorize(Rol.ADMINISTRADOR), validate(updateSocioSchema), updateSocio);
// Baja lógica: el socio puede darse de baja a sí mismo.
socioRouter.patch("/:id/baja", authorize(Rol.ADMINISTRADOR, Rol.SOCIO), validate(bajaSocioSchema), darDeBajaSocio);
socioRouter.patch("/:id/reactivar", authorize(Rol.ADMINISTRADOR), reactivarSocio);
socioRouter.delete("/:id", authorize(Rol.ADMINISTRADOR), deleteSocio);
