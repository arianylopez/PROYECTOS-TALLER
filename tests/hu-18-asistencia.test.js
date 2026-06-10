import { calcularTasaAsistencia } from '../services/turnosService.js';

describe('HU-18: Calculadora de Tasa de Asistencia', () => {
    test('AC1: Debe calcular el porcentaje correcto de turnos completados', () => {
        // Arrange
        const turnosDelPaciente = [
            { estado: 'Completado' },
            { estado: 'Cancelado' },
            { estado: 'Completado' },
            { estado: 'Programado' }
        ];

        // Act
        const resultado = calcularTasaAsistencia(turnosDelPaciente);

        // Assert
        expect(resultado).toBe("50%");
    });
});