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

export function marcarPacientesInconsistentes(pacientes, turnos) {
    const pacientesProcesados = [];
    
    for (let i = 0; i < pacientes.length; i++) {
        const paciente = { ...pacientes[i] };
        let cancelaciones = 0;
        
        for (let j = 0; j < turnos.length; j++) {
            if (turnos[j].paciente_id === paciente.id && turnos[j].estado === 'Cancelado') {
                cancelaciones++;
            }
        }
        
        if (cancelaciones >= 2) {
            paciente.inconsistente = true;
        } else {
            paciente.inconsistente = false;
        }
        
        pacientesProcesados.push(paciente);
    }
    
    return pacientesProcesados;
}