document.body.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Nombre</th><th>Email</th><th>Teléfono</th><th>Notas</th><th>Acciones</th>
            </tr>
        </thead>
        <tbody id="tablaPacientesBody"></tbody>
    </table>
`;

window.lucide = {
    createIcons: jest.fn()
};

const { cargarYRenderizarPacientes } = require('../src/ui/pacientesUI.js');
const { obtenerPacientes } = require('../src/services/pacientesService.js');

jest.mock('../src/services/pacientesService.js');

describe('HU-02: Listar Directorio de Pacientes', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        document.getElementById('tablaPacientesBody').innerHTML = '';
    });

    test('1: Al cargar la vista, se renderiza la tabla con los datos del paciente', async () => {
        // Arrange
        const mockPacientes = [
            {
                id: '1',
                nombre_completo: 'Ana Gomez',
                email: 'ana@ejemplo.com',
                telefono: '12345678',
                notas: 'Paciente de prueba'
            }
        ];
        obtenerPacientes.mockResolvedValue(mockPacientes);

        // Act
        await cargarYRenderizarPacientes();

        // Assert
        const filas = document.getElementById('tablaPacientesBody').querySelectorAll('tr');
        expect(filas.length).toBe(1);
        
        const celdas = filas[0].querySelectorAll('td');
        expect(celdas[0].textContent).toBe('Ana Gomez');
        expect(celdas[1].textContent).toBe('ana@ejemplo.com');
        expect(celdas[2].textContent).toBe('12345678');
        expect(celdas[3].textContent).toBe('Paciente de prueba');
        expect(celdas[4].querySelector('.btn-icon')).not.toBeNull();
    });

    test('2: Si un paciente no tiene email, teléfono o notas, se muestra un guión ("-")', async () => {
        // Arrange
        const mockPacientes = [
            {
                id: '2',
                nombre_completo: 'Carlos Silva',
                email: null,
                telefono: '',
                notas: undefined
            }
        ];
        obtenerPacientes.mockResolvedValue(mockPacientes);

        // Act
        await cargarYRenderizarPacientes();

        // Assert
        const filas = document.getElementById('tablaPacientesBody').querySelectorAll('tr');
        const celdas = filas[0].querySelectorAll('td');
        
        expect(celdas[0].textContent).toBe('Carlos Silva');
        expect(celdas[1].textContent).toBe('-');
        expect(celdas[2].textContent).toBe('-'); 
        expect(celdas[3].textContent).toBe('-'); 
    });
});