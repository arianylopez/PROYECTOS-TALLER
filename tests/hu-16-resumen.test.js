import { obtenerResumenDiario } from '../services/turnosService.js';

describe('HU-16: Resumen Diario de Estados', () => {
    test('AC1: Contar los estados de los turnos para la fecha actual', () => {
        // Arrange
        const fechaReferencia = new Date('2026-06-09T10:00:00'); 
        const turnosMock = [
            { id: 1, estado: 'Programado', fecha_inicio: '2026-06-09T08:00:00' },
            { id: 2, estado: 'Completado', fecha_inicio: '2026-06-09T10:00:00' },
            { id: 3, estado: 'Cancelado', fecha_inicio: '2026-06-09T15:00:00' },
            { id: 4, estado: 'Completado', fecha_inicio: '2026-06-09T18:00:00' },
            { id: 5, estado: 'Programado', fecha_inicio: '2026-06-10T09:00:00' } 
        ];

        // Act
        const resumen = obtenerResumenDiario(turnosMock, fechaReferencia);

        // Assert
        expect(resumen.programados).toBe(1);
        expect(resumen.completados).toBe(2);
        expect(resumen.cancelados).toBe(1);
        expect(resumen.total).toBe(4);
    });
});