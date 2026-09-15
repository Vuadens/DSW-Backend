import { Request, Response } from "express";
import * as socioService from "../../services/socio.service";

export async function getSocios(_req: Request, res: Response) {
    const socios = await socioService.getAllSocios();

    res.json(socios);
}

export async function getSocioById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const socio = await socioService.getSocioById(id);

    if (!socio) {
        return res.status(404).json({
            error: "Socio no encontrado"
        });
    }

    res.json(socio);
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

    res.status(204).send();
}