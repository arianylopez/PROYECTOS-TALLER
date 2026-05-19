import { supabaseClient } from '../config/supabase.js';

export async function obtenerPacientes() {
    const { data, error } = await supabaseClient
        .from('pacientes')
        .select('*')
        .order('creado_en', { ascending: false });
        
    if (error) throw error;
    return data;
}

export async function guardarPaciente(pacienteData, id = null) {
    if (id) {
        const { error } = await supabaseClient
            .from('pacientes')
            .update(pacienteData)
            .eq('id', id);
        if (error) throw error;
    } else {
        const { error } = await supabaseClient
            .from('pacientes')
            .insert([pacienteData]);
        if (error) throw error;
    }
}

export async function eliminarPaciente(id) {
    const { error } = await supabaseClient
        .from('pacientes')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
}