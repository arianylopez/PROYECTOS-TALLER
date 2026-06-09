import { supabaseClient } from '../config/supabase.js';

export async function obtenerTurnos() {
    const { data, error } = await supabaseClient
        .from('turnos')
        .select(`
            id, paciente_id, fecha_inicio, fecha_fin, estado, notas_sesion,
            pacientes ( nombre_completo )
        `);

    if (error) throw error;
    return data;
}

export async function guardarTurno(turnoData, id = null) {
    if (id) {
        const { error } = await supabaseClient
            .from('turnos')
            .update(turnoData)
            .eq('id', id);
        if (error) throw error;
    } else {
        const { error } = await supabaseClient
            .from('turnos')
            .insert([turnoData]);
        if (error) throw error;
    }
}

export async function eliminarTurno(id) {
    const { error } = await supabaseClient
        .from('turnos')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
}

export function obtenerResumenDiario(turnos, fechaBase = new Date()) {
    const resumen = { programados: 0, completados: 0, cancelados: 0, total: 0 };
    
    const inicioHoy = new Date(fechaBase);
    inicioHoy.setHours(0, 0, 0, 0);
    
    const finHoy = new Date(inicioHoy);
    finHoy.setDate(finHoy.getDate() + 1);

    for (let i = 0; i < turnos.length; i++) {
        const fechaTurno = new Date(turnos[i].fecha_inicio);
        
        if (fechaTurno >= inicioHoy && fechaTurno < finHoy) {
            resumen.total++;
            if (turnos[i].estado === 'Programado'){
                resumen.programados++;
            }
            if (turnos[i].estado === 'Completado'){
                resumen.completados++;
            }
            if (turnos[i].estado === 'Cancelado'){
                resumen.cancelados++;
            }
        }
    }
    return resumen;
}