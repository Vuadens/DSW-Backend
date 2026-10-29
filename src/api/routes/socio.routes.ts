import { Router } from "express";
import {
  getSocios,
  getSocioById,
  createSocio,
  updateSocio,
  deleteSocio
} from "../controllers/socio.controller";
import { validate } from "../middlewares/validate.middleware";
import { createSocioSchema, updateSocioSchema } from "../../schemas/socio.schema";

export const socioRouter = Router();

socioRouter.get("/", getSocios);
socioRouter.get("/:id", getSocioById);
socioRouter.post("/", validate(createSocioSchema), createSocio);
socioRouter.patch("/:id", validate(updateSocioSchema), updateSocio);
socioRouter.put("/:id", validate(updateSocioSchema), updateSocio);
socioRouter.delete("/:id", deleteSocio);