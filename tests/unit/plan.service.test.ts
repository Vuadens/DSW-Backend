import * as PlanRepository from '../../src/repositories/plan.repository';
import * as planService from '../../src/services/plan.service';
import { HttpError } from '../../src/utils/http-error';

// El repositorio se reemplaza por un mock: el test no usa la base de datos.
jest.mock('../../src/repositories/plan.repository');
const repo = jest.mocked(PlanRepository);

const planBasico = {
  nombre: 'Plan Musculación',
  tipo: 'ESTANDAR',
  precio: 20000,
  duracionMeses: 1,
};

describe('planService.crearNuevoPlan', () => {
  it('crea el plan cuando el nombre no existe', async () => {
    repo.obtenerPlanPorNombre.mockResolvedValue(null);
    repo.crearPlan.mockResolvedValue({ idPlan: 1, ...planBasico } as never);

    const creado = await planService.crearNuevoPlan(planBasico);

    expect(repo.obtenerPlanPorNombre).toHaveBeenCalledWith('Plan Musculación');
    expect(repo.crearPlan).toHaveBeenCalledWith(planBasico);
    expect(creado).toMatchObject({ idPlan: 1, nombre: 'Plan Musculación' });
  });

  it('rechaza con 409 un nombre que ya existe y no crea nada', async () => {
    repo.obtenerPlanPorNombre.mockResolvedValue({ idPlan: 7, nombre: 'Plan Musculación' } as never);

    const intento = planService.crearNuevoPlan(planBasico);

    await expect(intento).rejects.toThrow(HttpError);
    await expect(intento).rejects.toMatchObject({ status: 409 });
    expect(repo.crearPlan).not.toHaveBeenCalled();
  });

  // Fija el comportamiento actual. Por la decisión D5 el descuento se borra:
  // en ese PR estos dos casos pasan a esperar el precio sin descuento.
  it('aplica el 15% de descuento a planes de 12 meses o más', async () => {
    repo.obtenerPlanPorNombre.mockResolvedValue(null);

    await planService.crearNuevoPlan({ ...planBasico, precio: 100000, duracionMeses: 12 });

    expect(repo.crearPlan).toHaveBeenCalledWith(expect.objectContaining({ precio: 85000 }));
  });

  it('no aplica descuento a planes de menos de 12 meses', async () => {
    repo.obtenerPlanPorNombre.mockResolvedValue(null);

    await planService.crearNuevoPlan({ ...planBasico, precio: 100000, duracionMeses: 11 });

    expect(repo.crearPlan).toHaveBeenCalledWith(expect.objectContaining({ precio: 100000 }));
  });
});

describe('planService.actualizarPlan', () => {
  it('permite guardar el plan con su mismo nombre', async () => {
    repo.obtenerPlanPorNombre.mockResolvedValue({ idPlan: 3, nombre: 'Plan Full' } as never);
    repo.actualizarPlan.mockResolvedValue({ idPlan: 3, nombre: 'Plan Full' } as never);

    await planService.actualizarPlan(3, { nombre: 'Plan Full' });

    expect(repo.actualizarPlan).toHaveBeenCalledWith(3, { nombre: 'Plan Full' });
  });

  it('rechaza con 409 un nombre que ya usa otro plan', async () => {
    repo.obtenerPlanPorNombre.mockResolvedValue({ idPlan: 9, nombre: 'Plan Full' } as never);

    const intento = planService.actualizarPlan(3, { nombre: 'Plan Full' });

    await expect(intento).rejects.toMatchObject({ status: 409 });
    expect(repo.actualizarPlan).not.toHaveBeenCalled();
  });

  it('no consulta el nombre si no se está cambiando', async () => {
    repo.actualizarPlan.mockResolvedValue({ idPlan: 3, precio: 25000 } as never);

    await planService.actualizarPlan(3, { precio: 25000 });

    expect(repo.obtenerPlanPorNombre).not.toHaveBeenCalled();
    expect(repo.actualizarPlan).toHaveBeenCalledWith(3, { precio: 25000 });
  });
});
