import { NextFunction, Request, Response } from "express";
import * as socioService from "../../services/socio.service";

export async function getSocios(req: Request, res: Response, next: NextFunction) {
    try {
        const planId = req.query.planId ? Number(req.query.planId) : undefined;

        if (req.query.planId && isNaN(planId!)) {
            return res.status(400).json({ error: "El planId debe ser un número" });
        }

        const socios = planId
            ? await socioService.getSociosByPlan(planId)
            : await socioService.getAllSocios(req.user!);

        res.json(socios);
    } catch (error) {
        next(error);
    }
}

export async function getSocioById(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "El id debe ser un número" });
    }

    try {
        const socio = await socioService.getSocioDetalle(id, req.user);
        res.json(socio);
    } catch (error) {
        next(error);
    }
}

export async function createSocio(req: Request, res: Response) {
    const socio = await socioService.createSocio(req.body);

    res.status(201).json(socio);
}

export async function updateSocio(req: Request, res: Response) {
    const id = Number(req.params.id);

    const socio = await socioService.updateSocio(id, req.body);

    res.json(socio);
}

export async function deleteSocio(req: Request, res: Response) {
    const id = Number(req.params.id);

    await socioService.borrarSocio(id);

    res.status(200).json({ message: 'Socio eliminado correctamente' });
}