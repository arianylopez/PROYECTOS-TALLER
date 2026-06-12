using NUnit.Framework;
using Moq;
using System;
using HotelReservaAPI.Models;
using HotelReservaAPI.Services;
using HotelReservaAPI.Repositories;
using Supabase;

namespace HotelReservaAPI.Tests
{
    [TestFixture]
    public class EstadiaServiceTest
    {
        private Mock<IEstadiaRepository> _estadiaRepositoryMock;
        private Mock<IHabitacionRepository> _habitacionRepositoryMock;
        private Mock<IPoliticaCancelacionRepository> _politicaRepositoryMock;
        private EstadiaService _estadiaService;

        [SetUp]
        public void Setup()
        {
            _estadiaRepositoryMock = new Mock<IEstadiaRepository>();
            _habitacionRepositoryMock = new Mock<IHabitacionRepository>();
            _politicaRepositoryMock = new Mock<IPoliticaCancelacionRepository>();

            _estadiaService = new EstadiaService(
                _estadiaRepositoryMock.Object,
                _habitacionRepositoryMock.Object,
                _politicaRepositoryMock.Object,
                null 
            );
        }

        [Test]
        public void RegistrarCheckOut_SalidaDespuesDelLimite_AplicaRecargoLateCheckout()
        {
            // Arrange
            var estadiaId = "estadia-123";

            var reservaMock = new Estadia
            {
                EstadiaId = estadiaId,
                Estado = "En curso",
                Mora = 0,
                HabitacionId = "hab-1"
            };

            _estadiaRepositoryMock.Setup(repo => repo.ObtenerPorId(estadiaId)).Returns(reservaMock);
            _habitacionRepositoryMock.Setup(repo => repo.ObtenerHabitacionPorId("hab-1")).Returns((Habitacion)null);

            // Act
            var resultado = _estadiaService.RegistrarCheckOut(estadiaId);
            resultado.FechaHoraCheckout = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 15, 0, 0);

            // Assert
            Assert.That(resultado.Estado, Is.EqualTo("Finalizada"));
            Assert.That(resultado.Mora, Is.GreaterThan(0), "Debe aplicar una mora por late check-out");
            Assert.That(resultado.Mora, Is.EqualTo(50m));
        }
    }
}