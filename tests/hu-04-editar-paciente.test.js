document.body.innerHTML = `
    <tbody id="tablaPacientesBody"></tbody>
    
    <dialog id="modalNuevoPaciente">
        <h3 id="modalPacienteTitulo"></h3>
        <form id="formNuevoPaciente">
            <input type="hidden" id="pacienteId" name="pacienteId">
            <input type="text" id="nombrePaciente" name="nombrePaciente">
            <input type="email" id="emailPaciente" name="emailPaciente">
            <input type="tel" id="telefonoPaciente" name="telefonoPaciente">
            <textarea id="notasPaciente" name="notasPaciente"></textarea>
            
            <button type="submit" id="btnGuardarPaciente">Guardar</button>
        </form>
    </dialog>
`;

window.HTMLDialogElement.prototype.showModal = jest.fn();
window.HTMLDialogElement.prototype.close = jest.fn();
window.lucide = { createIcons: jest.fn() };

const { cargarYRenderizarPacientes, inicializarPacientesUI } = require('../src/ui/pacientesUI.js');
const { guardarPaciente, obtenerPacientes } = require('../src/services/pacientesService.js');

jest.mock('../src/services/pacientesService.js');
jest.mock('../src/ui/calendario.js', () => ({
    recargarTurnosVisuales: jest.fn()
}));

describe('HU-04: Editar Datos de Paciente', () => {
    let formNuevoPaciente;
    let modalPaciente;

    const mockPaciente = {
        id: '123-abc',
        nombre_completo: 'Roberto Sanchez',
        email: 'roberto@mail.com',
        telefono: '77788899',
        notas: 'Paciente frecuente'
    };

    beforeAll(() => {
        inicializarPacientesUI();
        formNuevoPaciente = document.getElementById('formNuevoPaciente');
        modalPaciente = document.getElementById('modalNuevoPaciente');
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        formNuevoPaciente.reset();
        
        obtenerPacientes.mockResolvedValue([mockPaciente]);
        await cargarYRenderizarPacientes();
    });

    test('1: Al hacer clic en Editar (Lápiz), se abre el modal con los datos pre-cargados', () => {
        // Act
        window.editarPaciente('123-abc');

        // Assert
        expect(modalPaciente.showModal).toHaveBeenCalled();
        expect(document.getElementById('modalPacienteTitulo').textContent).toBe('Editar Paciente');

        // Assert
        expect(document.getElementById('pacienteId').value).toBe('123-abc');
        expect(document.getElementById('nombrePaciente').value).toBe('Roberto Sanchez');
        expect(document.getElementById('emailPaciente').value).toBe('roberto@mail.com');
        expect(document.getElementById('telefonoPaciente').value).toBe('77788899');
        expect(document.getElementById('notasPaciente').value).toBe('Paciente frecuente');
    });

    test('2: Al modificar los datos y guardar, actualiza en BD y refresca la tabla', async () => {
        // Arrange
        guardarPaciente.mockResolvedValue(true);
        window.editarPaciente('123-abc');
        
        document.getElementById('telefonoPaciente').value = '00000000';

        // Act
        formNuevoPaciente.dispatchEvent(new Event('submit', { cancelable: true }));
        await new Promise(process.nextTick); 

        // Assert
        expect(guardarPaciente).toHaveBeenCalledWith({
            nombre_completo: 'Roberto Sanchez',
            email: 'roberto@mail.com',
            telefono: '00000000', 
            notas: 'Paciente frecuente'
        }, '123-abc');

        // Assert
        expect(modalPaciente.close).toHaveBeenCalled();
        expect(obtenerPacientes).toHaveBeenCalledTimes(2);
    });
});