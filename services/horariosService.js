import { supabaseClient } from '../config/supabase.js';

export async function obtenerHorarios() {
    const { data, error } = await supabaseClient
        .from('horarios')
        .select('*');
        
    if (error) throw error;
    return data;
}

export async function actualizarEstadoDia(dia_semana, activo) {
    const { error } = await supabaseClient
        .from('horarios')
        .update({ activo: activo })
        .eq('dia_semana', dia_semana);
        
    if (error) throw error;
}

export async function actualizarRangoHoras(diaId, inicio, fin) {
    const { error } = await supabaseClient
        .from('horarios')
        .update({ hora_inicio: inicio, hora_fin: fin })
        .eq('dia_semana', diaId);
        
    if (error) throw error;
}