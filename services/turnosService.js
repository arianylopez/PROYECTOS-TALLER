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