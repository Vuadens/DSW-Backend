import {NextFunction, Request, Response} from 'express';
import {usuarioService} from '../../services/usuario.service';

export const usuarioController = {
    getAll: async (_req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await usuarioService.getAll());
        } catch (error) {
            next(error);
        }
    },
    getById: async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({error: 'El id debe ser un número'});
        try {
            res.json(await usuarioService.getById(id));
        } catch (error) {
            next(error);
        }
    },
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(201).json(await usuarioService.create(req.body));
        } catch (error) {
            next(error);
        }
    },
    update: async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({error: 'El id debe ser un número'});
        try {
            res.json(await usuarioService.update(id, req.body, req.user!.id));
        } catch (error) {
            next(error);
        }
    },
    remove: async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({error: 'El id debe ser un número'});
        try {
            await usuarioService.remove(id, req.user!.id);
            res.json({message: 'Usuario eliminado correctamente'});
        } catch (error) {
            next(error);
        }
    },
};
