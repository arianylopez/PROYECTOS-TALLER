import { ReservaService } from '../src/modules/reservas/ReservaService.js';
import { api } from '../src/core/api.js';

jest.mock('../src/core/api');

describe('HU-02 - Crear reserva de habitación (ReservaService)', () => {

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    // CA 1: Registro correcto
    test('CA1: Dado que existen huéspedes y habitaciones, cuando se completan datos válidos, registra correctamente', async () => {
        // Arrange
        const datosReserva = {
            habitacionId: 'HAB-101',
            fechaIngreso: '2025-10-10',
            fechaSalida: '2025-10-15',
            cantidadPersonas: 2
        };
        const respuestaEsperada = { id: 'RES-001', ...datosReserva, estado: 'Reservada' };

        api.post.mockResolvedValue(respuestaEsperada);

        // Act
        const resultado = await ReservaService.crearReserva(datosReserva);

        // Assert
        expect(api.post).toHaveBeenCalledWith('/estadia', datosReserva);
        expect(api.post).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(respuestaEsperada);
    });

    // CA 2: Validación de fecha de salida
    test('CA2: Dada una fecha de salida no posterior a la de ingreso, impide el registro y muestra validación', async () => {
        // Arrange
        const datosInvalidos = {
            habitacionId: 'HAB-101',
            fechaIngreso: '2025-10-15',
            fechaSalida: '2025-10-10',
            cantidadPersonas: 2
        };
        const errorEsperado = new Error('La fecha de salida debe ser posterior a la fecha de ingreso.');

        api.post.mockRejectedValue(errorEsperado);

        // Act & Assert
        await expect(ReservaService.crearReserva(datosInvalidos)).rejects.toThrow('La fecha de salida debe ser posterior a la fecha de ingreso.');
        expect(api.post).toHaveBeenCalledWith('/estadia', datosInvalidos);
    });

    // CA 3: Solapamiento de fechas
    test('CA3: Dada una habitación ya reservada en ese rango, impide el solapamiento', async () => {
        // Arrange
        const datosSolapados = {
            habitacionId: 'HAB-101',
            fechaIngreso: '2025-10-12',
            fechaSalida: '2025-10-18',
            cantidadPersonas: 1
        };
        const errorEsperado = new Error('La habitación ya está reservada en ese rango de fechas.');

        api.post.mockRejectedValue(errorEsperado);

        // Act & Assert
        await expect(ReservaService.crearReserva(datosSolapados)).rejects.toThrow('La habitación ya está reservada en ese rango de fechas.');
        expect(api.post).toHaveBeenCalledWith('/estadia', datosSolapados);
    });

    // CA 4: Capacidad superada
    test('CA4: Dada una cantidad de personas que supera la capacidad, rechaza la operación', async () => {
        // Arrange
        const datosExcedeCapacidad = {
            habitacionId: 'HAB-101', 
            fechaIngreso: '2025-11-01',
            fechaSalida: '2025-11-05',
            cantidadPersonas: 5 
        };
        const errorEsperado = new Error('La cantidad de personas supera la capacidad de la habitación.');

        api.post.mockRejectedValue(errorEsperado);

        // Act & Assert
        await expect(ReservaService.crearReserva(datosExcedeCapacidad)).rejects.toThrow('La cantidad de personas supera la capacidad de la habitación.');
        expect(api.post).toHaveBeenCalledWith('/estadia', datosExcedeCapacidad);
    });
});