import { obtenerHorarios, actualizarEstadoDia, actualizarRangoHoras } from '../services/horariosService.js';
import { aplicarRestriccionesCalendario } from './calendario.js';

const tablaHorariosBody = document.getElementById('tablaHorariosBody');
const modalEditarHorario = document.getElementById('modalEditarHorario');
const formEditarHorario = document.getElementById('formEditarHorario');
const btnCancelarHorario = document.getElementById('btnCancelarHorario');

let horariosGlobal = [];

export async function cargarYRenderizarHorarios() {
    try {
        horariosGlobal = await obtenerHorarios();
        renderizarTablaHorarios(horariosGlobal);
        aplicarRestriccionesCalendario(horariosGlobal);
    } catch (error) {
        console.error("Error al cargar horarios:", error);
    }
}

function renderizarTablaHorarios(datos) {
    tablaHorariosBody.innerHTML = '';
    
    const datosOrdenados = [...datos].sort((a, b) => (a.dia_semana === 0 ? 7 : a.dia_semana) - (b.dia_semana === 0 ? 7 : b.dia_semana));

    datosOrdenados.forEach(horario => {
        const tr = document.createElement('tr');
        const inicio = horario.hora_inicio.slice(0, 5);
        const fin = horario.hora_fin.slice(0, 5);
        
        tr.innerHTML = `
            <td style="font-weight: 500;">${horario.nombre_dia}</td>
            <td>
                <div class="horario-acciones">
                    <span style="opacity: ${horario.activo ? '1' : '0.5'}">${inicio} - ${fin}</span>
                    <button class="btn-icon btn-editar-horario" data-dia="${horario.dia_semana}" ${!horario.activo ? 'disabled' : ''}>
                        <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </td>
            <td>
                <label class="toggle">
                    <input type="checkbox" class="toggle-dia" data-dia="${horario.dia_semana}" ${horario.activo ? 'checked' : ''}>
                    <span class="toggle__slider"></span>
                </label>
            </td>
        `;
        tablaHorariosBody.appendChild(tr);
    });

    lucide.createIcons();
    asignarEventosHorarios();
}

function asignarEventosHorarios() {
    document.querySelectorAll('.toggle-dia').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
            const dia = e.target.dataset.dia;
            const activo = e.target.checked;
            await actualizarEstadoDia(dia, activo);
            await cargarYRenderizarHorarios();
        });
    });

    document.querySelectorAll('.btn-editar-horario').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dia = e.currentTarget.dataset.dia;
            abrirModalEditarHorario(parseInt(dia));
        });
    });
}

function abrirModalEditarHorario(dia_semana) {
    const horario = horariosGlobal.find(h => h.dia_semana === dia_semana);
    document.getElementById('diaEditarNombre').textContent = horario.nombre_dia;
    document.getElementById('diaEditarId').value = horario.dia_semana;
    document.getElementById('horaInicioHorario').value = horario.hora_inicio.slice(0, 5);
    document.getElementById('horaFinHorario').value = horario.hora_fin.slice(0, 5);
    modalEditarHorario.showModal();
}

btnCancelarHorario?.addEventListener('click', () => modalEditarHorario.close());

formEditarHorario?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const diaId = document.getElementById('diaEditarId').value;
    const inicio = document.getElementById('horaInicioHorario').value + ':00';
    const fin = document.getElementById('horaFinHorario').value + ':00';

    try {
        await actualizarRangoHoras(diaId, inicio, fin);
        modalEditarHorario.close();
        await cargarYRenderizarHorarios(); 
    } catch (error) {
        alert("Error al actualizar el horario.");
    }
});