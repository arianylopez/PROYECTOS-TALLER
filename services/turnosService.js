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
    const query = id 
        ? supabaseClient.from('turnos').update(turnoData).eq('id', id)
        : supabaseClient.from('turnos').insert([turnoData]);

    const { error } = await query;
    
    if (error) throw error;
}

export async function eliminarTurno(id) {
    const { error } = await supabaseClient
        .from('turnos')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
}

export function obtenerResumenDiario(turnos, fechaBase = new Date()) {
    const inicioHoy = new Date(fechaBase).setHours(0, 0, 0, 0);
    const limiteManana = new Date(inicioHoy).setDate(new Date(inicioHoy).getDate() + 1);

    return turnos.reduce((acc, turno) => {
        const tiempoTurno = new Date(turno.fecha_inicio).getTime();
        
        if (tiempoTurno >= inicioHoy && tiempoTurno < limiteManana) {
            acc.total++;
            const estadoKey = turno.estado.toLowerCase() + 's'; 
            if (acc[estadoKey] !== undefined) {
                acc[estadoKey]++;
            }
        }
        return acc;
    }, { programados: 0, completados: 0, cancelados: 0, total: 0 });
}

export function calcularTasaAsistencia(turnos) {
    if (!turnos || turnos.length === 0) return "N/A";
    
    const completados = turnos.filter(t => t.estado === 'Completado').length;
    const porcentaje = Math.round((completados / turnos.length) * 100);
    
    return `${porcentaje}%`;
}