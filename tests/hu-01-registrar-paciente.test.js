document.body.innerHTML = `
    <button id="btnNuevoPaciente">Nuevo Paciente</button>
    <tbody id="tablaPacientesBody"></tbody>
    <input type="search" id="busquedaTablaPacientes">

    <dialog id="modalNuevoPaciente">
        <h3 id="modalPacienteTitulo"></h3>
        <form id="formNuevoPaciente">
            <input type="hidden" id="pacienteId" name="pacienteId">
            <input type="text" id="nombrePaciente" name="nombrePaciente" required>
            <input type="email" id="emailPaciente" name="emailPaciente">
            <input type="tel" id="telefonoPaciente" name="telefonoPaciente">
            <textarea id="notasPaciente" name="notasPaciente"></textarea>
            
            <button type="button" id="btnCancelarPaciente">Cancelar</button>
            <button type="submit" id="btnGuardarPaciente">Guardar</button>
        </form>
    </dialog>
`;

window.HTMLDialogElement.prototype.showModal = jest.fn();
window.HTMLDialogElement.prototype.close = jest.fn();

const { inicializarPacientesUI } = require('../src/ui/pacientesUI.js');
const { guardarPaciente, obtenerPacientes } = require('../src/services/pacientesService.js');

jest.mock('../src/services/pacientesService.js');
jest.mock('../src/ui/calendario.js', () => ({
    recargarTurnosVisuales: jest.fn()
}));

describe('HU-01: Registrar Nuevo Paciente', () => {
    let formNuevoPaciente;
    let modalPaciente;

    beforeAll(() => {
        inicializarPacientesUI();
        formNuevoPaciente = document.getElementById('formNuevoPaciente');
        modalPaciente = document.getElementById('modalNuevoPaciente');
    });

    beforeEach(() => {
        jest.clearAllMocks();
        formNuevoPaciente.reset();
    });

    test('1: Al presionar "Nuevo Paciente", se abre el modal con los campos estructurados', () => {
        // Act
        document.getElementById('btnNuevoPaciente').click();

        // Assert
        expect(modalPaciente.showModal).toHaveBeenCalled();
        expect(document.getElementById('nombrePaciente')).not.toBeNull();
        expect(document.getElementById('emailPaciente')).not.toBeNull();
        expect(document.getElementById('telefonoPaciente')).not.toBeNull();
        expect(document.getElementById('notasPaciente')).not.toBeNull();
    });

    test('2: El campo "Nombre Completo" es obligatorio y lanza alerta de validación nativa si está vacío', () => {
        // Assert
        const inputNombre = document.getElementById('nombrePaciente');
        expect(inputNombre.required).toBe(true);
    });

    test('3: Al completar datos y guardar, el modal se cierra, envía a BD y recarga la tabla', async () => {
        // Arrange
        guardarPaciente.mockResolvedValue(true); 
        obtenerPacientes.mockResolvedValue([]); 

        document.getElementById('nombrePaciente').value = 'Juan Perez';
        document.getElementById('emailPaciente').value = 'juan@test.com';

        // Act
        const eventoSubmit = new Event('submit', { cancelable: true });
        formNuevoPaciente.dispatchEvent(eventoSubmit);

        // Assert
        await new Promise(process.nextTick);

        expect(guardarPaciente).toHaveBeenCalledWith({
            nombre_completo: 'Juan Perez',
            email: 'juan@test.com',
            telefono: '',
            notas: ''
        }, null);

        expect(modalPaciente.close).toHaveBeenCalled();

        expect(obtenerPacientes).toHaveBeenCalled();
    });
});