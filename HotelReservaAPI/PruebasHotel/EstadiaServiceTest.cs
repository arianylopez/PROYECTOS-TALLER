using System;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using Moq;
using HotelReservaAPI.Models;
using HotelReservaAPI.Repositories;
using HotelReservaAPI.Services;
using Supabase;


namespace HotelReservaAPI.Tests
{
    [TestFixture]
    public class EstadiaServiceTests
    {
        [Test]
        public void CrearReserva_DatosValidos_DebeRegistrarReservaCorrectamente()
        {
            var mockEstadiaRepo = new Mock<IEstadiaRepository>();
            var mockHabitacionRepo = new Mock<IHabitacionRepository>();
            var mockPoliticaRepo = new Mock<IPoliticaCancelacionRepository>();

            var estadiaInput = new Estadia
            {
                HabitacionId = "1",
                FechaIngreso = DateTime.Now.AddDays(1),
                FechaSalida = DateTime.Now.AddDays(5),
                CantidadPersonas = 2
            };

            var habitacionSimulada = new Habitacion
            {
                TipoHabitacionId = "10"
            };

            var tipoHabitacionSimulada = new TipoHabitacion
            {
                TipoHabitacionId = 1,
                Capacidad = 4,
                PrecioBase = 5000
            };

            mockHabitacionRepo.Setup(repo => repo.ObtenerHabitacionPorId(estadiaInput.HabitacionId))
                              .Returns(habitacionSimulada);

            mockHabitacionRepo.Setup(repo => repo.ObtenerTipoHabitacionPorId(habitacionSimulada.TipoHabitacionId))
                              .Returns(tipoHabitacionSimulada);

            mockEstadiaRepo.Setup(repo => repo.Insertar(It.IsAny<Estadia>()))
                           .Returns((Estadia e) => e);

            var servicio = new EstadiaService(
                mockEstadiaRepo.Object,
                mockHabitacionRepo.Object,
                mockPoliticaRepo.Object,
                null
            );

            var resultado = servicio.CrearReserva(estadiaInput);

            Assert.That(resultado, Is.Not.Null);
            Assert.That(resultado.Estado, Is.EqualTo("Reservada"));
            Assert.That(resultado.PrecioAplicado, Is.EqualTo(5000));
            Assert.That(resultado.Mora, Is.EqualTo(0));
            Assert.That((DateTime.Now - resultado.FechaCreacion).TotalSeconds, Is.LessThan(5));
            mockEstadiaRepo.Verify(repo => repo.Insertar(It.IsAny<Estadia>()), Times.Once);
        }
    }
}