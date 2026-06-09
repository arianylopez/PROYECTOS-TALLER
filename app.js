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
        await cargarYRenderizarHorarios();
        
        await inicializarCalendario();
        
        await cargarYRenderizarPacientes();

        const turnos = await obtenerTurnos();
        const resumen = obtenerResumenDiario(turnos, new Date());
        
        const progEl = document.getElementById('res-prog');
        const compEl = document.getElementById('res-comp');
        const cancEl = document.getElementById('res-canc');

        if (progEl) progEl.textContent = resumen.programados;
        if (compEl) compEl.textContent = resumen.completados;
        if (cancEl) cancEl.textContent = resumen.cancelados;
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
    } catch (error) {
        console.error('Error crítico durante la inicialización de PsiManager:', error);
    }
});