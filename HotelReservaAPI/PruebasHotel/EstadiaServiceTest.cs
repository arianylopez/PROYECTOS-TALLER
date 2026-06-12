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
        private Mock<IHuespedRepository> _huespedRepositoryMock;
        private EstadiaService _estadiaService;

        [SetUp]
        public void Setup()
        {
            _estadiaRepositoryMock = new Mock<IEstadiaRepository>();
            _habitacionRepositoryMock = new Mock<IHabitacionRepository>();
            _politicaRepositoryMock = new Mock<IPoliticaCancelacionRepository>();
            _huespedRepositoryMock = new Mock<IHuespedRepository>();

            _estadiaService = new EstadiaService(
                _estadiaRepositoryMock.Object,
                _habitacionRepositoryMock.Object,
                _politicaRepositoryMock.Object,
                _huespedRepositoryMock.Object,
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

            var fechaSalidaTardia = new DateTime(2026, 6, 15, 15, 0, 0);

            // Act 
            var resultado = _estadiaService.RegistrarCheckOut(estadiaId, fechaSalidaTardia);

            // Assert 
            Assert.That(resultado.Estado, Is.EqualTo("Finalizada"));
            Assert.That(resultado.Mora, Is.GreaterThan(0), "Debe aplicar una mora por late check-out");
            Assert.That(resultado.Mora, Is.EqualTo(50m));
        }

        [Test]
        public void BuscarReservasPorHuesped_NombreExistente_RetornaCoincidencias()
        {
            // Arrange
            var estadiasMock = new List<Estadia> { new Estadia 
            { 
                EstadiaId = "e1", 
                HuespedTitularId = "h-1" 
            } };
            var huespedMock = new Huesped 
            { 
                HuespedId = "h-1",
                Nombre = "Juan",
                DocumentoIdentidad = "123456" 
            };

            _estadiaRepositoryMock.Setup(repo => repo.ObtenerTodas()).Returns(estadiasMock);
            _huespedRepositoryMock.Setup(repo => repo.ObtenerPorId("h-1")).Returns(huespedMock);

            // Act
            var resultados = _estadiaService.BuscarReservasPorHuesped("juan");

            // Assert
            Assert.That(resultados.Count, Is.EqualTo(1));
            Assert.That(resultados[0].HuespedTitularId, Is.EqualTo("h-1"));
        }
    }
}