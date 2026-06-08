import { inicializarNavegacion } from './ui/navegacion.js';
import { inicializarCalendario } from './ui/calendario.js';
import { cargarYRenderizarHorarios } from './ui/horariosUI.js';
import { cargarYRenderizarPacientes, inicializarPacientesUI } from './ui/pacientesUI.js';

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
        
    } catch (error) {
        console.error('Error crítico durante la inicialización de PsiManager:', error);
    }
});