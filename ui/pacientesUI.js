import { obtenerPacientes, guardarPaciente, eliminarPaciente, marcarPacientesInconsistentes } from '../services/pacientesService.js';
import { recargarTurnosVisuales } from './calendario.js';
import { obtenerTurnos, calcularTasaAsistencia } from '../services/turnosService.js'; 

const tablaPacientesBody = document.getElementById('tablaPacientesBody');
const inputBusquedaTabla = document.getElementById('busquedaTablaPacientes');
const modalPaciente = document.getElementById('modalNuevoPaciente');
const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');
const btnCancelarPaciente = document.getElementById('btnCancelarPaciente');
const formNuevoPaciente = document.getElementById('formNuevoPaciente');

let pacientesGlobal = [];

export async function cargarYRenderizarPacientes() {
    try {
        const pacientesData = await obtenerPacientes();
        const turnosData = await obtenerTurnos(); 
        
        pacientesGlobal = marcarPacientesInconsistentes(pacientesData, turnosData);

        renderizarTablaPacientes(pacientesGlobal);
    } catch (error) {
        console.error('Error al cargar la vista de pacientes:', error);
    }
}

function renderizarTablaPacientes(datos) {
    if (!tablaPacientesBody) return;
    tablaPacientesBody.innerHTML = '';
    
    datos.forEach(paciente => {
        const tr = document.createElement('tr');
        const iconoAlerta = paciente.inconsistente ? 
            '<span title="Múltiples inasistencias detectadas" style="color: #ef4444; font-size: 1.1em; margin-left: 5px; cursor: help;">⚠️</span>' : '';
        tr.innerHTML = `
            <td>${paciente.nombre_completo} ${iconoAlerta}</td>
            <td>${paciente.email || '-'}</td>
            <td>${paciente.telefono || '-'}</td>
            <td>${paciente.notas || '-'}</td>
            <td class="table-actions">
                <button class="btn-icon" onclick="editarPaciente('${paciente.id}')" title="Editar">
                    <i data-lucide="pencil" style="width: 18px; height: 18px;"></i>
                </button>
                <button class="btn-icon btn-icon--danger" onclick="eliminarPaciente('${paciente.id}')" title="Eliminar">
                    <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                </button>
            </td>
        `;
        tablaPacientesBody.appendChild(tr);
    });
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

window.editarPaciente = async function(id) {
    const paciente = pacientesGlobal.find(p => p.id === id);
    if (!paciente) return;

    document.getElementById('modalPacienteTitulo').textContent = 'Editar Paciente';
    document.getElementById('pacienteId').value = paciente.id;
    document.getElementById('nombrePaciente').value = paciente.nombre_completo;
    document.getElementById('emailPaciente').value = paciente.email || '';
    document.getElementById('telefonoPaciente').value = paciente.telefono || '';
    document.getElementById('notasPaciente').value = paciente.notas || '';

    const contenedorEstadistica = document.getElementById('contenedor-estadistica-paciente');
    const valorTasa = document.getElementById('paciente-tasa-valor');
    
    if (contenedorEstadistica && valorTasa) {
        contenedorEstadistica.style.display = 'block';
        valorTasa.textContent = "Calculando...";
        
        try {
            const todosLosTurnos = await obtenerTurnos();
            const turnosDelPaciente = todosLosTurnos.filter(t => t.paciente_id === paciente.id);
            
            const tasa = calcularTasaAsistencia(turnosDelPaciente);
            valorTasa.textContent = tasa;
            
            if (window.lucide) window.lucide.createIcons();
        } catch (error) {
            console.error("Error al calcular tasa:", error);
            valorTasa.textContent = "Error";
        }
    }

    modalPaciente.showModal();
};

window.eliminarPaciente = async function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar a este paciente? IMPORTANTE: Esto también eliminará todos los turnos agendados para esta persona.')) {
        try {
            await eliminarPaciente(id);
            await cargarYRenderizarPacientes();
            await recargarTurnosVisuales(); 
        } catch (error) {
            alert('Error al eliminar el paciente.');
            console.error(error);
        }
    }
};

export function inicializarPacientesUI() {
    inputBusquedaTabla?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtrados = pacientesGlobal.filter(p => 
            p.nombre_completo.toLowerCase().includes(query) || 
            (p.email && p.email.toLowerCase().includes(query))
        );
        renderizarTablaPacientes(filtrados);
    });

    btnNuevoPaciente?.addEventListener('click', () => {
        document.getElementById('modalPacienteTitulo').textContent = 'Nuevo Paciente';
        document.getElementById('pacienteId').value = ''; 
        formNuevoPaciente.reset(); 

        const contenedorEstadistica = document.getElementById('contenedor-estadistica-paciente');
        if (contenedorEstadistica) contenedorEstadistica.style.display = 'none';

        modalPaciente.showModal();
    });
    
    btnCancelarPaciente?.addEventListener('click', () => {
        modalPaciente.close();
        formNuevoPaciente.reset();
    });

    formNuevoPaciente?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formNuevoPaciente);
        const data = Object.fromEntries(formData.entries());
        
        const pacienteData = {
            nombre_completo: data.nombrePaciente,
            email: data.emailPaciente,
            telefono: data.telefonoPaciente,
            notas: data.notasPaciente
        };

        try {
            await guardarPaciente(pacienteData, data.pacienteId || null);
            modalPaciente.close();
            formNuevoPaciente.reset();
            await cargarYRenderizarPacientes(); 
            await recargarTurnosVisuales(); 
        } catch (error) {
            alert('Error al guardar los datos del paciente.');
            console.error(error);
        }
    });
}