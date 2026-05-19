import { calendar } from './calendario.js';

export function inicializarNavegacion() {
    const linkCalendario = document.getElementById('linkCalendario');
    const linkPacientes = document.getElementById('linkPacientes');
    const linkHorarios = document.getElementById('linkHorarios');
    
    const vistaCalendario = document.getElementById('vistaCalendario');
    const vistaPacientes = document.getElementById('vistaPacientes');
    const vistaHorarios = document.getElementById('vistaHorarios');

    function cambiarVista(vistaActiva, linkActivo) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
        document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
        
        vistaActiva.classList.add('view--active');
        linkActivo.classList.add('sidebar__link--active');
        
        if(vistaActiva.id === 'vistaCalendario' && calendar) {
            calendar.render();
        }
    }

    linkCalendario?.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVista(vistaCalendario, linkCalendario);
    });

    linkPacientes?.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVista(vistaPacientes, linkPacientes);
    });

    linkHorarios?.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVista(vistaHorarios, linkHorarios);
    });
}