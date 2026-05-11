const { createClient } = supabase;
const supabaseUrl = 'https://hxkpieimehhfiwoucwhk.supabase.co';
const supabaseKey = 'sb_publishable_UXlAmeHYcClyM3BlcbVTXQ_3DRRIZzy';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

lucide.createIcons();

document.addEventListener('DOMContentLoaded', async function() {
    
    let pacientesGlobal = [];

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', 
        locale: 'es', 
        headerToolbar: {
            left: 'prev,next today', 
            center: 'title',       
            right: 'dayGridMonth,timeGridWeek,timeGridDay' 
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mensual',
            week: 'Semanal',
            day: 'Diario'
        },
        slotMinTime: '08:00:00',
        slotMaxTime: '18:00:00',
        allDaySlot: false, 
        expandRows: true,
        height: '100%',
        
        
        selectable: true, 
        selectOverlap: false, 
        eventOverlap: false, 
        
        
        select: function(info) {
            
            const start = info.start;
            const end = info.end;

            
            const fecha = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
            const horaInicio = String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0');
            const horaFin = String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0');

            
            document.getElementById('fechaTurno').value = fecha;
            
            
            if (info.view.type !== 'dayGridMonth') {
                document.getElementById('horaInicio').value = horaInicio;
                document.getElementById('horaFin').value = horaFin;
            } else {
                
                document.getElementById('horaInicio').value = '09:00';
                document.getElementById('horaFin').value = '10:00';
            }

            
            document.getElementById('modalNuevoTurno').showModal();
            
            
            calendar.unselect();
        },

        eventClick: function(info) {
            const ev = info.event;
            
            
            document.getElementById('modalTurnoTitulo').textContent = 'Editar Turno';
            document.getElementById('turnoId').value = ev.id;
            document.getElementById('btnEliminarTurno').style.display = 'block';

            
            const start = ev.start;
            const end = ev.end;
            
            
            const fecha = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
            const horaInicio = String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0');
            const horaFin = String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0');

            
            document.getElementById('fechaTurno').value = fecha;
            document.getElementById('horaInicio').value = horaInicio;
            document.getElementById('horaFin').value = horaFin;
            
            document.getElementById('estadoTurno').value = ev.extendedProps.estado;
            document.getElementById('notasTurno').value = ev.extendedProps.notas || '';
            
            
            document.getElementById('busquedaPaciente').value = ev.title;
            pacienteSeleccionadoId = ev.extendedProps.pacienteId;

            
            document.getElementById('modalNuevoTurno').showModal();
        }
    });
    calendar.render();

    const linkCalendario = document.getElementById('linkCalendario');
    const linkPacientes = document.getElementById('linkPacientes');
    const vistaCalendario = document.getElementById('vistaCalendario');
    const vistaPacientes = document.getElementById('vistaPacientes');

    function cambiarVista(vistaActiva, linkActivo) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
        document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
        vistaActiva.classList.add('view--active');
        linkActivo.classList.add('sidebar__link--active');
        if(vistaActiva.id === 'vistaCalendario') calendar.render();
    }

    linkCalendario?.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVista(vistaCalendario, linkCalendario);
    });

    linkPacientes?.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVista(vistaPacientes, linkPacientes);
    });

    const tablaPacientesBody = document.getElementById('tablaPacientesBody');
    const inputBusquedaTabla = document.getElementById('busquedaTablaPacientes');

    function renderizarTablaPacientes(datos) {
        tablaPacientesBody.innerHTML = '';
        datos.forEach(paciente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${paciente.nombre_completo}</td>
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
        lucide.createIcons();
    }

    async function cargarPacientes() {
        const { data, error } = await supabaseClient
            .from('pacientes')
            .select('*')
            .order('creado_en', { ascending: false });
            
        if (error) {
            console.error('Error al cargar pacientes:', error);
            return;
        }
        pacientesGlobal = data;
        renderizarTablaPacientes(pacientesGlobal);
    }

    window.editarPaciente = function(id) {
        
        const paciente = pacientesGlobal.find(p => p.id === id);
        if (!paciente) return;

        
        document.getElementById('modalPacienteTitulo').textContent = 'Editar Paciente';
        document.getElementById('pacienteId').value = paciente.id;
        document.getElementById('nombrePaciente').value = paciente.nombre_completo;
        document.getElementById('emailPaciente').value = paciente.email || '';
        document.getElementById('telefonoPaciente').value = paciente.telefono || '';
        document.getElementById('notasPaciente').value = paciente.notas || '';

        
        document.getElementById('modalNuevoPaciente').showModal();
    };

    
    window.eliminarPaciente = async function(id) {
        
        if (confirm('¿Estás seguro de que deseas eliminar a este paciente? IMPORTANTE: Esto también eliminará todos los turnos agendados para esta persona.')) {
            const { error } = await supabaseClient
                .from('pacientes')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Error al eliminar el paciente.');
                console.error(error);
            } else {
                
                cargarPacientes();
                cargarTurnos(); 
            }
        }
    };

    inputBusquedaTabla?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtrados = pacientesGlobal.filter(p => 
            p.nombre_completo.toLowerCase().includes(query) || 
            (p.email && p.email.toLowerCase().includes(query))
        );
        renderizarTablaPacientes(filtrados);
    });

    const modalPaciente = document.getElementById('modalNuevoPaciente');
    const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');
    const btnCancelarPaciente = document.getElementById('btnCancelarPaciente');
    const formNuevoPaciente = document.getElementById('formNuevoPaciente');

    btnNuevoPaciente?.addEventListener('click', () => {
        document.getElementById('modalPacienteTitulo').textContent = 'Nuevo Paciente';
        document.getElementById('pacienteId').value = ''; 
        formNuevoPaciente.reset(); 
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

        let error;
        if (data.pacienteId) {
            const result = await supabaseClient.from('pacientes').update(pacienteData).eq('id', data.pacienteId);
            error = result.error;
        } else {
            const result = await supabaseClient.from('pacientes').insert([pacienteData]);
            error = result.error;
        }

        if (error) {
            alert('Error al guardar los datos del paciente.');
            console.error(error);
        } else {
            modalPaciente.close();
            formNuevoPaciente.reset();
            cargarPacientes(); 
            cargarTurnos(); 
        }
    });

    const modalTurno = document.getElementById('modalNuevoTurno');
    const btnNuevoTurno = document.getElementById('btnNuevoTurno');
    const btnCancelarTurno = document.getElementById('btnCancelarTurno');
    const formNuevoTurno = document.getElementById('formNuevoTurno');
    const combobox = document.getElementById('comboboxPacientes');
    const inputBusqueda = document.getElementById('busquedaPaciente');
    const listaResultados = document.getElementById('listaResultadosPacientes');
    let pacienteSeleccionadoId = null;

    function renderizarResultados(datosFiltrados) {
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
                seleccionarPaciente(paciente);
            });
            listaResultados.appendChild(li);
        });
        combobox.classList.add('combobox--active');
    }

    function seleccionarPaciente(paciente) {
        inputBusqueda.value = paciente.nombre_completo;
        pacienteSeleccionadoId = paciente.id;
        combobox.classList.remove('combobox--active');
        inputBusqueda.dataset.pacienteValido = 'true';
    }

    inputBusqueda?.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        pacienteSeleccionadoId = null;
        inputBusqueda.dataset.pacienteValido = 'false';
        if (query === '') {
            combobox.classList.remove('combobox--active');
            return;
        }
        const resultadosFiltrados = pacientesGlobal.filter(paciente => 
            paciente.nombre_completo.toLowerCase().includes(query)
        );
        renderizarResultados(resultadosFiltrados);
    });

    inputBusqueda?.addEventListener('focus', function() {
        if (this.value === '') {
            renderizarResultados(pacientesGlobal);
        }
    });

    document.addEventListener('click', function(e) {
        if (combobox && !combobox.contains(e.target)) {
            combobox.classList.remove('combobox--active');
        }
    });

    btnNuevoTurno?.addEventListener('click', () => {
        formNuevoTurno.reset();
        document.getElementById('modalTurnoTitulo').textContent = 'Nuevo Turno';
        document.getElementById('turnoId').value = '';
        document.getElementById('btnEliminarTurno').style.display = 'none';
        pacienteSeleccionadoId = null;
        modalTurno.showModal();
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
        
        const inicioIso = new Date(`${data.fechaTurno}T${data.horaInicio}:00`).toISOString();
        const finIso = new Date(`${data.fechaTurno}T${data.horaFin}:00`).toISOString();

        const turnoData = {
            paciente_id: pacienteSeleccionadoId,
            fecha_inicio: inicioIso,
            fecha_fin: finIso,
            estado: data.estadoTurno,
            notas_sesion: data.notasTurno
        };

        let error;
        if (data.turnoId) {
            const result = await supabaseClient.from('turnos').update(turnoData).eq('id', data.turnoId);
            error = result.error;
        } else {
            const result = await supabaseClient.from('turnos').insert([turnoData]);
            error = result.error;
        }

        if (error) {
            alert('Error al guardar. Verifica que no se sobreponga con otro turno.');
            console.error(error);
        } else {
            modalTurno.close();
            cargarTurnos(); 
        }
    });

    document.getElementById('btnEliminarTurno')?.addEventListener('click', async () => {
        const id = document.getElementById('turnoId').value;
        if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            const { error } = await supabaseClient.from('turnos').delete().eq('id', id);
            
            if (error) {
                alert('Error al eliminar la cita.');
            } else {
                modalTurno.close();
                cargarTurnos();
            }
        }
    });

    cargarPacientes();

    const linkHorarios = document.getElementById('linkHorarios');
    const vistaHorarios = document.getElementById('vistaHorarios');

    linkHorarios?.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVista(vistaHorarios, linkHorarios);
    });

    const tablaHorariosBody = document.getElementById('tablaHorariosBody');
    let horariosGlobal = [];

    function actualizarRestriccionesCalendario() {
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
                        <button class="btn-icon" onclick="abrirModalEditarHorario(${horario.dia_semana})" ${!horario.activo ? 'disabled' : ''}>
                            <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <label class="toggle">
                        <input type="checkbox" onchange="toggleDiaHorario(${horario.dia_semana}, this.checked)" ${horario.activo ? 'checked' : ''}>
                        <span class="toggle__slider"></span>
                    </label>
                </td>
            `;
            tablaHorariosBody.appendChild(tr);
        });
        lucide.createIcons();
    }

    async function cargarHorarios() {
        const { data, error } = await supabaseClient.from('horarios').select('*');
        if (!error) {
            horariosGlobal = data;
            renderizarTablaHorarios(horariosGlobal);
            actualizarRestriccionesCalendario();
        }
    }

    window.toggleDiaHorario = async function(dia_semana, activo) {
        const { error } = await supabaseClient
            .from('horarios')
            .update({ activo: activo })
            .eq('dia_semana', dia_semana);
        if (!error) cargarHorarios(); 
    };

    const modalEditarHorario = document.getElementById('modalEditarHorario');
    const formEditarHorario = document.getElementById('formEditarHorario');
    const btnCancelarHorario = document.getElementById('btnCancelarHorario');

    window.abrirModalEditarHorario = function(dia_semana) {
        const horario = horariosGlobal.find(h => h.dia_semana === dia_semana);
        document.getElementById('diaEditarNombre').textContent = horario.nombre_dia;
        document.getElementById('diaEditarId').value = horario.dia_semana;
        document.getElementById('horaInicioHorario').value = horario.hora_inicio.slice(0, 5);
        document.getElementById('horaFinHorario').value = horario.hora_fin.slice(0, 5);
        modalEditarHorario.showModal();
    };

    btnCancelarHorario?.addEventListener('click', () => modalEditarHorario.close());

    formEditarHorario?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const diaId = document.getElementById('diaEditarId').value;
        const inicio = document.getElementById('horaInicioHorario').value + ':00';
        const fin = document.getElementById('horaFinHorario').value + ':00';

        const { error } = await supabaseClient
            .from('horarios')
            .update({ hora_inicio: inicio, hora_fin: fin })
            .eq('dia_semana', diaId);

        if (!error) {
            modalEditarHorario.close();
            cargarHorarios(); 
        }
    });

    
    cargarHorarios();

    
    async function cargarTurnos() {
        const { data, error } = await supabaseClient
            .from('turnos')
            .select(`
                id, paciente_id, fecha_inicio, fecha_fin, estado, notas_sesion,
                pacientes ( nombre_completo )
            `);

        if (error) {
            console.error('Error al cargar turnos:', error);
            return;
        }

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
    }

    cargarTurnos();

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
            const mesStr = meses[fecha.getMonth()];
            const diaStr = String(fecha.getDate()).padStart(2, '0');
            
            const horaInicio = fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            const horaFin = new Date(turno.fecha_fin).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});

            const div = document.createElement('div');
            div.className = 'upcoming-item';
            div.innerHTML = `
                <div class="upcoming-date">
                    <span>${mesStr}</span>
                    <span>${diaStr}</span>
                </div>
                <div class="upcoming-info">
                    <span class="upcoming-name">${turno.pacientes.nombre_completo}</span>
                    <span class="upcoming-time">
                        <i data-lucide="clock" style="width: 14px; height: 14px;"></i> 
                        ${horaInicio} - ${horaFin}
                    </span>
                </div>
            `;
            contenedor.appendChild(div);
        });
        
        lucide.createIcons();
    }
});