import { obtenerTurnos, guardarTurno, eliminarTurno } from '../services/turnosService.js';
import { obtenerPacientes } from '../services/pacientesService.js';
import { formatFechaYYYYMMDD, formatHoraHHMM } from '../utils/dateHelper.js';

export let calendar; 
let pacienteSeleccionadoId = null;
let pacientesParaCombobox = [];

export async function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', 
        locale: 'es', 
        headerToolbar: {
            left: 'prev,next today', 
            center: 'title',       
            right: 'dayGridMonth,timeGridWeek,timeGridDay' 
        },
        buttonText: { today: 'Hoy', month: 'Mensual', week: 'Semanal', day: 'Diario' },
        slotMinTime: '08:00:00',
        slotMaxTime: '18:00:00',
        allDaySlot: false, 
        expandRows: true,
        height: '100%',
        selectable: true, 
        selectOverlap: false, 
        eventOverlap: false, 
        
        select: function(info) {
            prepararModalNuevoTurno(info.start, info.end, info.view.type);
            calendar.unselect();
        },
        eventClick: function(info) {
            prepararModalEditarTurno(info.event);
        }
    });
    calendar.render();
    
    configurarEventosTurnos();
    await cargarYRenderizarTurnos();
}

async function cargarYRenderizarTurnos() {
    try {
        const data = await obtenerTurnos();
        actualizarProximosTurnos(data);
        
        const eventosFullCalendar = data.map(turno => {
            let colorFondo = 'var(--color-primary)'; 
            if (turno.estado === 'Completado') colorFondo = '#10B981'; 
            if (turno.estado === 'Cancelado') colorFondo = '#EF4444'; 

            return {
                id: turno.id,
                title: turno.pacientes.nombre_completo,
                start: turno.fecha_inicio,
                end: turno.fecha_fin,
                backgroundColor: colorFondo,
                borderColor: 'transparent',
                extendedProps: {
                    pacienteId: turno.paciente_id, 
                    estado: turno.estado,
                    notas: turno.notas_sesion
                }
            };
        });

        calendar.removeAllEvents();
        calendar.addEventSource(eventosFullCalendar);
    } catch (error) {
        console.error("Error cargando turnos:", error);
    }
}

export function aplicarRestriccionesCalendario(horariosGlobal) {
    if (!calendar) return;

    const horariosActivos = horariosGlobal.filter(h => h.activo);
    const businessHours = horariosActivos.map(h => ({
        daysOfWeek: [h.dia_semana],
        startTime: h.hora_inicio,
        endTime: h.hora_fin
    }));
    
    calendar.setOption('businessHours', businessHours);

    if (horariosActivos.length > 0) {
        const minHora = horariosActivos.reduce((min, h) => (h.hora_inicio < min ? h.hora_inicio : min), '23:59:59');
        const maxHora = horariosActivos.reduce((max, h) => (h.hora_fin > max ? h.hora_fin : max), '00:00:00');
        calendar.setOption('slotMinTime', minHora);
        calendar.setOption('slotMaxTime', maxHora);
    } else {
        calendar.setOption('slotMinTime', '08:00:00');
        calendar.setOption('slotMaxTime', '18:00:00');
    }
    
    calendar.setOption('selectConstraint', 'businessHours');
    calendar.setOption('eventConstraint', 'businessHours');
}

const inputBusqueda = document.getElementById('busquedaPaciente');
const combobox = document.getElementById('comboboxPacientes');
const listaResultados = document.getElementById('listaResultadosPacientes');

function renderizarResultadosCombobox(datosFiltrados) {
    listaResultados.innerHTML = '';
    if (datosFiltrados.length === 0) {
        combobox.classList.remove('combobox--active');
        return;
    }
    datosFiltrados.forEach(paciente => {
        const li = document.createElement('li');
        li.className = 'combobox__item';
        li.textContent = paciente.nombre_completo;
        li.dataset.id = paciente.id;
        li.addEventListener('click', () => {
            inputBusqueda.value = paciente.nombre_completo;
            pacienteSeleccionadoId = paciente.id;
            combobox.classList.remove('combobox--active');
        });
        listaResultados.appendChild(li);
    });
    combobox.classList.add('combobox--active');
}

function configurarEventosTurnos() {
    const modalTurno = document.getElementById('modalNuevoTurno');
    const formNuevoTurno = document.getElementById('formNuevoTurno');
    const btnNuevoTurno = document.getElementById('btnNuevoTurno');
    const btnCancelarTurno = document.getElementById('btnCancelarTurno');
    const btnEliminarTurno = document.getElementById('btnEliminarTurno');

    inputBusqueda?.addEventListener('input', async function() {
        const query = this.value.toLowerCase().trim();
        pacienteSeleccionadoId = null; // Reiniciar si escribe algo nuevo
        
        if (query === '') {
            combobox.classList.remove('combobox--active');
            return;
        }
        
        if (pacientesParaCombobox.length === 0) {
            pacientesParaCombobox = await obtenerPacientes(); // Cargar si está vacío
        }
        
        const resultadosFiltrados = pacientesParaCombobox.filter(p => 
            p.nombre_completo.toLowerCase().includes(query)
        );
        renderizarResultadosCombobox(resultadosFiltrados);
    });

    document.addEventListener('click', function(e) {
        if (combobox && !combobox.contains(e.target)) {
            combobox.classList.remove('combobox--active');
        }
    });

    btnNuevoTurno?.addEventListener('click', () => {
        prepararModalNuevoTurno(new Date(), new Date(), 'dayGridMonth');
    });

    btnCancelarTurno?.addEventListener('click', () => {
        modalTurno.close();
        formNuevoTurno.reset();
        pacienteSeleccionadoId = null;
    });

    formNuevoTurno?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!pacienteSeleccionadoId) {
            alert('Por favor, seleccione un paciente de la lista.');
            return;
        }

        const formData = new FormData(formNuevoTurno);
        const data = Object.fromEntries(formData.entries());
        
        if(data.horaInicio >= data.horaFin) {
            alert('La hora de fin debe ser posterior a la hora de inicio.');
            return;
        }

        const inicioDate = new Date(`${data.fechaTurno}T${data.horaInicio}:00`);
        const finDate = new Date(`${data.fechaTurno}T${data.horaFin}:00`);

        const eventosActuales = calendar.getEvents();
        let existeChoque = false;

        for (let evento of eventosActuales) {
            if (data.turnoId && evento.id === data.turnoId) continue;
            if (inicioDate < evento.end && finDate > evento.start) {
                existeChoque = true;
                break;
            }
        }

        if (existeChoque) {
            alert('Error al guardar. Verifica que no se sobreponga con otro turno.');
            return; 
        }

        const turnoData = {
            paciente_id: pacienteSeleccionadoId,
            fecha_inicio: inicioDate.toISOString(),
            fecha_fin: finDate.toISOString(),
            estado: data.estadoTurno,
            notas_sesion: data.notasTurno
        };

        try {
            await guardarTurno(turnoData, data.turnoId || null);
            modalTurno.close();
            await cargarYRenderizarTurnos();
        } catch (error) {
            alert('Hubo un error del servidor al intentar guardar.');
        }
    });

    btnEliminarTurno?.addEventListener('click', async () => {
        const id = document.getElementById('turnoId').value;
        if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            try {
                await eliminarTurno(id);
                modalTurno.close();
                await cargarYRenderizarTurnos();
            } catch (error) {
                alert('Error al eliminar la cita.');
            }
        }
    });
}

function prepararModalNuevoTurno(start, end, viewType) {
    document.getElementById('formNuevoTurno').reset();
    document.getElementById('modalTurnoTitulo').textContent = 'Nuevo Turno';
    document.getElementById('turnoId').value = '';
    document.getElementById('btnEliminarTurno').style.display = 'none';
    pacienteSeleccionadoId = null;

    document.getElementById('fechaTurno').value = formatFechaYYYYMMDD(start);

    if (viewType !== 'dayGridMonth') {
        document.getElementById('horaInicio').value = formatHoraHHMM(start);
        document.getElementById('horaFin').value = formatHoraHHMM(end);
    } else {
        document.getElementById('horaInicio').value = '09:00';
        document.getElementById('horaFin').value = '10:00';
    }

    document.getElementById('modalNuevoTurno').showModal();
}

function prepararModalEditarTurno(ev) {
    document.getElementById('modalTurnoTitulo').textContent = 'Editar Turno';
    document.getElementById('turnoId').value = ev.id;
    document.getElementById('btnEliminarTurno').style.display = 'block';

    const start = ev.start;
    const end = ev.end;
    
    document.getElementById('fechaTurno').value = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
    document.getElementById('horaInicio').value = String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0');
    document.getElementById('horaFin').value = String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0');
    
    document.getElementById('estadoTurno').value = ev.extendedProps.estado;
    document.getElementById('notasTurno').value = ev.extendedProps.notas || '';
    
    document.getElementById('busquedaPaciente').value = ev.title;
    pacienteSeleccionadoId = ev.extendedProps.pacienteId;

    document.getElementById('modalNuevoTurno').showModal();
}

function actualizarProximosTurnos(turnosData) {
    const contenedor = document.getElementById('listaProximosTurnos');
    contenedor.innerHTML = '';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const pasadoManana = new Date(hoy);
    pasadoManana.setDate(pasadoManana.getDate() + 2); 

    const turnosProximos = turnosData.filter(turno => {
        if (turno.estado !== 'Programado') return false; 
        const fechaTurno = new Date(turno.fecha_inicio);
        return fechaTurno >= hoy && fechaTurno < pasadoManana;
    });

    turnosProximos.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

    if(turnosProximos.length === 0) {
        contenedor.innerHTML = '<p class="upcoming-empty">No hay turnos próximos para hoy o mañana.</p>';
        return;
    }

    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    turnosProximos.forEach(turno => {
        const fecha = new Date(turno.fecha_inicio);
        const div = document.createElement('div');
        div.className = 'upcoming-item';
        div.innerHTML = `
            <div class="upcoming-date">
                <span>${meses[fecha.getMonth()]}</span>
                <span>${String(fecha.getDate()).padStart(2, '0')}</span>
            </div>
            <div class="upcoming-info">
                <span class="upcoming-name">${turno.pacientes.nombre_completo}</span>
                <span class="upcoming-time">
                    <i data-lucide="clock" style="width: 14px; height: 14px;"></i> 
                    ${fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})} - ${new Date(turno.fecha_fin).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
        `;
        contenedor.appendChild(div);
    });
    
    lucide.createIcons();
}

export async function recargarTurnosVisuales() {
    await cargarYRenderizarTurnos();
}