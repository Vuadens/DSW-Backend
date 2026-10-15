import { NextFunction, Request, Response } from "express";
import * as socioService from "../../services/socio.service";

export async function getSocios(_req: Request, res: Response, next: NextFunction) {
    try {
        const socios = await socioService.getAllSocios(_req.user!);
        res.json(socios);
    } catch (error) {
        next(error);
    }
}

export async function getSocioById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const socio = await socioService.getSocioById(id, req.user);
        if (!socio) return res.status(404).json({error: "Socio no encontrado"});
        res.json(socio);
    } catch (error) {
        next(error);
    }
}

export async function createSocio(req: Request, res: Response, next: NextFunction) {
    try {
        const socio = await socioService.createSocio(req.body);
        res.status(201).json(socio);
    } catch (error) {
        next(error);
    }
}

export async function updateSocio(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const socio = await socioService.updateSocio(id, req.body, req.user);
        res.json(socio);
    } catch (error) {
        next(error);
    }
}

export async function deleteSocio(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        await socioService.borrarSocio(id, req.user);
        res.status(200).json({message: 'Socio eliminado correctamente'});
    } catch (error) {
        next(error);
    }
}