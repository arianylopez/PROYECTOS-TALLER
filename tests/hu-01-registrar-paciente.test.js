import { guardarPaciente } from '../services/pacientesService.js';
import { supabaseClient } from '../config/supabase.js';

jest.mock('../config/supabase.js', () => ({
    supabaseClient: {
        from: jest.fn()
    }
}));

describe('HU-01: Registrar Nuevo Paciente (Capa de Servicios)', () => {
    let queryBuilder;

    beforeEach(() => {
        jest.clearAllMocks();
        
        queryBuilder = {
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis()
        };
        supabaseClient.from.mockReturnValue(queryBuilder);
    });

    // CA 1: Campos del formulario (Nombre, Email, Teléfono, Notas)
    test('CA1: Debe aceptar y enviar correctamente los campos estructurados (Nombre, Email, Teléfono, Notas) hacia la base de datos', async () => {
        // Arrange
        const nuevoPaciente = {
            nombre_completo: 'Juan Perez',
            email: 'juan@email.com',
            telefono: '77712345',
            notas: 'Paciente derivado'
        };
        queryBuilder.insert.mockResolvedValue({ error: null });

        // Act
        await guardarPaciente(nuevoPaciente);

        // Assert
        expect(supabaseClient.from).toHaveBeenCalledWith('pacientes');
        expect(queryBuilder.insert).toHaveBeenCalledWith([nuevoPaciente]);
    });

    // CA 2: Nombre Completo es obligatorio
    test('CA2: Debe propagar el error (alerta) si se intenta guardar un paciente sin Nombre Completo (rechazado por la BD)', async () => {
        // Arrange
        const pacienteInvalido = { email: 'sin-nombre@email.com' };
        const mockError = new Error('Violación de restricción NOT NULL en nombre_completo');
        
        queryBuilder.insert.mockResolvedValue({ error: mockError });

        // Act & Assert
        await expect(guardarPaciente(pacienteInvalido)).rejects.toThrow('Violación de restricción NOT NULL en nombre_completo');
    });

    // CA 3: Datos se envían a la base de datos al presionar guardar
    test('CA3: Debe ejecutar la inserción exitosamente para que la tabla pueda actualizarse inmediatamente', async () => {
        // Arrange
        const pacienteValido = { nombre_completo: 'Ana Gomez' };
        queryBuilder.insert.mockResolvedValue({ error: null });

        // Act
        await expect(guardarPaciente(pacienteValido)).resolves.not.toThrow();
        
        // Assert
        expect(queryBuilder.insert).toHaveBeenCalledTimes(1);
    });
});