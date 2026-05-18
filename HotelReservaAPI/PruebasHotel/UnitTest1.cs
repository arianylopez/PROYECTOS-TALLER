using NUnit.Framework;
using Moq;
using System;
using HotelReservaAPI.Models;
using HotelReservaAPI.Repositories;
using HotelReservaAPI.Services;

namespace HotelReservaAPI.Tests
{
    public class DummyTest
    {
        [Test]
        public void ForzarCargaDeEnsambladoParaReporte()
        {
            var dummy = new Habitacion();

            Assert.Pass("Prueba base para generar reporte en 0%");
        }
    }

    [TestFixture]
    public class HuespedServiceTests
    {
        private Mock<IHuespedRepository> _mockRepository;
        private HuespedService _huespedService;

        [SetUp]
        public void Setup()
        {
            _mockRepository = new Mock<IHuespedRepository>();
            _huespedService = new HuespedService(_mockRepository.Object);
        }

        [Test]
        public void ActualizarHuesped_HappyPath_ActualizaYRetornaHuesped()
        {
            // Arrange 
            string idHuesped = "1";
            var huespedCreado = new Huesped
            {
                HuespedId = idHuesped,
                Nombre = "Juan",
                Apellido = "Perez",
                DocumentoIdentidad = "123456"
            };

            var datosActualizados = new Huesped
            {
                Nombre = "Juan Carlos", 
                Apellido = "Perez",
                DocumentoIdentidad = "123456",
                Telefono = "7777777" 
            };

            _mockRepository.Setup(repo => repo.ObtenerPorId(idHuesped)).Returns(huespedCreado);
            _mockRepository.Setup(repo => repo.Actualizar(It.IsAny<Huesped>())).Returns(huespedCreado);

            // Act
            var resultado = _huespedService.ActualizarHuesped(idHuesped, datosActualizados);

            // Assert 
            Assert.IsNotNull(resultado);
            Assert.AreEqual("Juan Carlos", resultado.Nombre);
            Assert.AreEqual("7777777", resultado.Telefono);

            _mockRepository.Verify(repo => repo.Actualizar(It.IsAny<Huesped>()), Times.Once);
        }

        [Test]
        public void ActualizarHuesped_IdNoExiste_LanzaExcepcion()
        {
            // Arrange
            string idHuesped = "99"; 
            var datosActualizados = new Huesped
            {
                Nombre = "Pedro",
                Apellido = "Gomez",
                DocumentoIdentidad = "987654"
            };

            _mockRepository.Setup(repo => repo.ObtenerPorId(idHuesped)).Returns((Huesped)null);
            // Act
            var ex = Assert.Throws<Exception>(() => _huespedService.ActualizarHuesped(idHuesped, datosActualizados));
            //Assert
            Assert.AreEqual("El huésped a actualizar no existe.", ex.Message);
        }
    }
}