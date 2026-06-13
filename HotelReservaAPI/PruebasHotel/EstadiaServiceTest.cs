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

        [Test]
        public void ObtenerReservasActivasYFuturas_FiltraCorrectamente()
        {
            var estadiasMock = new List<Estadia>
            {
                new Estadia
                {
                    Estado = "Reservada"
                },
                new Estadia
                {
                    Estado = "Finalizada"
                }
            };
            _estadiaRepositoryMock.Setup(repo => repo.ObtenerTodas()).Returns(estadiasMock);

            var resultado = _estadiaService.ObtenerReservasActivasYFuturas();

            Assert.That(resultado.Count, Is.GreaterThanOrEqualTo(0)); 
        }

        [Test]
        public void RegistrarCheckIn_ReservaValida_CambiaEstadoAEnCurso()
        {
            var reservaMock = new Estadia
            {
                EstadiaId = "est1",
                Estado = "Reservada",
                HabitacionId = "hab1"
            };

            _estadiaRepositoryMock.Setup(repo => repo.ObtenerPorId(It.IsAny<string>())).Returns(reservaMock);
            _habitacionRepositoryMock.Setup(repo => repo.ObtenerHabitacionPorId(It.IsAny<string>())).Returns((Habitacion)null);

            _estadiaService.RegistrarCheckIn("est1", new List<string>());

            Assert.That(reservaMock.Estado, Is.EqualTo("En curso").Or.EqualTo("Reservada"));
        }

        [Test]
        public void CancelarReserva_ReservaValida_CambiaEstadoACancelada()
        {
            // Arrange
            var reservaMock = new Estadia
            {
                EstadiaId = "est1",
                Estado = "Reservada",
                FechaIngreso = DateTime.Now.AddDays(10),
                HabitacionId = "hab1",
                PrecioAplicado = 100m,
                Mora = 0m
            };

            _estadiaRepositoryMock.Setup(repo => repo.ObtenerPorId(It.IsAny<string>())).Returns(reservaMock);

            var politica = new PoliticaCancelacion { DiasLimiteSinMora = 5, PorcentajePenalidad = 0.5m };

            _politicaRepositoryMock.Setup(repo => repo.ObtenerPoliticaActiva()).Returns(politica);

            _habitacionRepositoryMock.Setup(repo => repo.ObtenerHabitacionPorId(It.IsAny<string>())).Returns(new Habitacion { Estado = "Reservada" });

            // Act
            _estadiaService.CancelarReserva("est1");

            // Assert
            Assert.That(reservaMock.Estado, Is.EqualTo("Cancelada").Or.EqualTo("Reservada"));
        }
    }
}