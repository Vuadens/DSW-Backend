import {Router} from "express";
import {authorize} from '../middlewares/auth.middleware';
import {Rol} from '@prisma/client';
import {
    getSocios,
    getSocioById,
    createSocio,
    updateSocio,
    deleteSocio
} from "../controllers/socio.controller";

export const socioRouter = Router();

socioRouter.get("/", authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), getSocios);
socioRouter.get("/:id", authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), getSocioById);
socioRouter.post("/", authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), createSocio);
socioRouter.patch("/:id", authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), updateSocio);
socioRouter.delete("/:id", authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), deleteSocio);