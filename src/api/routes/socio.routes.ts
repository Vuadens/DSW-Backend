import { Router } from "express";
import {
    getSocios,
    getSocioById,
    createSocio,
    updateSocio,
    deleteSocio
} from "../controllers/socio.controller";

export const socioRouter = Router();

socioRouter.get("/", getSocios);
socioRouter.get("/:id", getSocioById);
socioRouter.post("/", createSocio);
socioRouter.put("/:id", updateSocio);
socioRouter.delete("/:id", deleteSocio);