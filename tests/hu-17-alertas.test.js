import { marcarPacientesInconsistentes } from '../services/pacientesService.js';

describe('HU-17: Alerta de Pacientes que no asisten', () => {
    test('AC1: Debe marcar "inconsistente: true" si el paciente tiene 2 o mas citas canceladas', () => {
        // Arrange
        const pacientesMock = [
            { id: 'uuid-1', nombre_completo: 'Juan Perez' },
            { id: 'uuid-2', nombre_completo: 'Maria Gomez' }
        ];
        
        const turnosMock = [
            { paciente_id: 'uuid-1', estado: 'Cancelado' },
            { paciente_id: 'uuid-1', estado: 'Cancelado' }, 
            { paciente_id: 'uuid-2', estado: 'Cancelado' }, 
            { paciente_id: 'uuid-2', estado: 'Completado' }
        ];

        // Act
        const resultado = marcarPacientesInconsistentes(pacientesMock, turnosMock);

        // Assert
        expect(resultado[0].inconsistente).toBe(true);
        expect(resultado[1].inconsistente).toBe(false);
    });
});