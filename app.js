import { inicializarNavegacion } from './ui/navegacion.js';
import { inicializarCalendario } from './ui/calendario.js';
import { cargarYRenderizarHorarios } from './ui/horariosUI.js';
import { cargarYRenderizarPacientes, inicializarPacientesUI } from './ui/pacientesUI.js';
import { obtenerTurnos, obtenerResumenDiario } from './services/turnosService.js';

document.addEventListener('DOMContentLoaded', async function() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    inicializarNavegacion();
    inicializarPacientesUI();
    
    try {
        await Promise.all([
            cargarYRenderizarHorarios(),
            inicializarCalendario(),
            cargarYRenderizarPacientes()
        ]);

        const turnos = await obtenerTurnos();
        const resumen = obtenerResumenDiario(turnos, new Date());
        
        const mapeoDashboard = [
            { id: 'res-prog', valor: resumen.programados },
            { id: 'res-comp', valor: resumen.completados },
            { id: 'res-canc', valor: resumen.cancelados }
        ];

        mapeoDashboard.forEach(item => {
            const elementoDOM = document.getElementById(item.id);
            if (elementoDOM) elementoDOM.textContent = item.valor;
        });
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
    } catch (error) {
        console.error('Error crítico durante la inicialización de PsiManager:', error);
    }
});