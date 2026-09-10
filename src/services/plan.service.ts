import * as PlanRepository from '../repositories/plan.repository';

// Obtener todos los planes activos
export const obtenerTodosLosPlanes = async () => {
    return await PlanRepository.obtenerPlanes();
};

// Obtener un plan por su ID
export const obtenerPlanPorId = async (id: number) => {
    return await PlanRepository.obtenerPlanPorId(id);
};

// Crear un nuevo plan
export const crearNuevoPlan = async (data: any) => {
    // Regla 1: Validar nombre único
    const planExistente = await PlanRepository.obtenerPlanPorNombre(data.nombre);
    if (planExistente) {
        throw new Error("Ya existe un plan con ese nombre exacto");
    }
    // Regla 2: Descuento automático del 15% si pagan 12 meses o mas
    let precioCalculado = data.precio;
    if (data.duracionMeses >= 12) {
        precioCalculado = precioCalculado * 0.85; 
    }

    // Armamos el paquete final con el precio modificado
    const datosFinales = { 
        ...data, 
        precio: precioCalculado 
    };
    return await PlanRepository.crearPlan(datosFinales);
};

// Actualizar un plan existente
export const actualizarPlan = async (id: number, data: any) => {
    if (data.nombre) {
        // Validar que el nuevo nombre no exista en otro plan
        const planExistente = await PlanRepository.obtenerPlanPorNombre(data.nombre);
        if (planExistente && planExistente.idPlan !== id) {
            throw new Error("Ya existe un plan con ese nombre exacto");
        }
    }
    //validar si se actualiza el plan a mayor de 12 meses y si el precio es diferente de undefined, aplicar el descuento del 15%
    if (data.duracionMeses === 12 && data.precio !== undefined) {
        data.precio = data.precio * 0.85; 
    }
    return await PlanRepository.actualizarPlan(id, data);
};

// Eliminar un plan
export const eliminarPlan = async (id: number) => {
    return await PlanRepository.eliminarPlan(id);
};