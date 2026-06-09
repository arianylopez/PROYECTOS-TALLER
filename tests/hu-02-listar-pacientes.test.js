import { obtenerPacientes } from '../services/pacientesService.js';
import { supabaseClient } from '../config/supabase.js';

jest.mock('../config/supabase.js', () => ({
    supabaseClient: {
        from: jest.fn()
    }
}));

describe('HU-02: Listar Directorio de Pacientes (Capa de Servicios)', () => {
    let queryBuilder;

    beforeEach(() => {
        jest.clearAllMocks();
        
        queryBuilder = {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis()
        };
        supabaseClient.from.mockReturnValue(queryBuilder);
    });

    // CA 1: Renderiza la tabla con las columnas
    test('CA1: Debe consultar la tabla pacientes solicitando todas las columnas y ordenándolas por fecha de creación', async () => {
        // Arrange
        const mockData = [
            { id: 1, nombre_completo: 'Carlos Ruiz', email: 'carlos@mail.com', telefono: '78945612', notas: 'Ansiedad' }
        ];
        queryBuilder.order.mockResolvedValue({ data: mockData, error: null });

        // Act
        const resultado = await obtenerPacientes();

        // Assert
        expect(supabaseClient.from).toHaveBeenCalledWith('pacientes');
        expect(queryBuilder.select).toHaveBeenCalledWith('*');
        expect(queryBuilder.order).toHaveBeenCalledWith('creado_en', { ascending: false });
        expect(resultado).toEqual(mockData);
    });

    // CA 2: Paciente sin datos muestra un guión en la UI
    test('CA2: Debe retornar correctamente los registros que tengan campos de contacto nulos para que la UI los formatee (muestre guiones)', async () => {
        // Arrange
        const mockDataIncompleta = [
            { 
                id: 2, 
                nombre_completo: 'Maria Lopez', 
                email: null, 
                telefono: null, 
                notas: '' 
            }
        ];
        queryBuilder.order.mockResolvedValue({ data: mockDataIncompleta, error: null });

        // Act
        const resultado = await obtenerPacientes();

        // Assert
        expect(resultado[0].email).toBeNull();
        expect(resultado[0].telefono).toBeNull();
    });
});