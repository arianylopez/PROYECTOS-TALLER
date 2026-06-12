using NUnit.Framework;
using Moq;
using System;
using HotelReservaAPI.Models;
using HotelReservaAPI.Repositories;
using HotelReservaAPI.Services;

namespace HotelReservaAPI.Tests
{
    [TestFixture]
    public class HuespedServiceTests
    {
        private Mock<IHuespedRepository> _huespedRepoMock;
        private HuespedService _huespedService;

        [SetUp]
        public void SetUp()
        {
            _huespedRepoMock = new Mock<IHuespedRepository>();
            _huespedService = new HuespedService(_huespedRepoMock.Object);
        }

        // CA 1: Registro exitoso con datos completos
        [Test]
        public void RegistrarHuesped_DatosCompletos_GuardaCorrectamente()
        {
            // Arrange
            var nuevoHuesped = new Huesped
            {
                Nombre = "Juan",
                Apellido = "Pérez",
                DocumentoIdentidad = "1234567"
            };

            _huespedRepoMock.Setup(repo => repo.ObtenerPorDocumento(It.IsAny<string>()))
                            .Returns((Huesped)null);
            _huespedRepoMock.Setup(repo => repo.Insertar(It.IsAny<Huesped>()))
                            .Returns(nuevoHuesped);

            // Act
            var resultado = _huespedService.RegistrarHuesped(nuevoHuesped);

            // Assert
            Assert.IsNotNull(resultado);
            Assert.AreEqual(DateTime.Now.Date, resultado.FechaRegistro.Date);
            _huespedRepoMock.Verify(repo => repo.Insertar(It.IsAny<Huesped>()), Times.Once);
        }

        // CA 2: Faltan campos obligatorios
        [TestCase("", "Pérez", "1234567")]
        [TestCase("Juan", "", "1234567")]
        [TestCase("Juan", "Pérez", "")]
        [TestCase("", "", "")]
        public void RegistrarHuesped_FaltanDatosObligatorios_LanzaExcepcion(string nombre, string apellido, string documento)
        {
            // Arrange
            var huespedInvalido = new Huesped
            {
                Nombre = nombre,
                Apellido = apellido,
                DocumentoIdentidad = documento
            };

            // Act & Assert
            var excepcion = Assert.Throws<Exception>(() => _huespedService.RegistrarHuesped(huespedInvalido));
            Assert.AreEqual("Nombre, Apellido y Documento son obligatorios.", excepcion.Message);
            _huespedRepoMock.Verify(repo => repo.Insertar(It.IsAny<Huesped>()), Times.Never);
        }

        // CA 3: Documento duplicado
        [Test]
        public void RegistrarHuesped_DocumentoDuplicado_LanzaExcepcion()
        {
            // Arrange
            var huespedDuplicado = new Huesped
            {
                Nombre = "Maria",
                Apellido = "Gomez",
                DocumentoIdentidad = "9876543"
            };

            var huespedExistente = new Huesped { DocumentoIdentidad = "9876543" };

            _huespedRepoMock.Setup(repo => repo.ObtenerPorDocumento("9876543"))
                            .Returns(huespedExistente);

            // Act & Assert
            var excepcion = Assert.Throws<Exception>(() => _huespedService.RegistrarHuesped(huespedDuplicado));
            Assert.AreEqual("Ya existe un huésped registrado con este documento.", excepcion.Message);
            _huespedRepoMock.Verify(repo => repo.Insertar(It.IsAny<Huesped>()), Times.Never);
        }

        [Test]
        public void ObtenerInformacionHuesped_HuespedExistente_RetornaInformacionCorrecta()
        {
            // Arrange
            var huespedId = "h-123";
            var huespedMock = new Huesped
            {
                HuespedId = huespedId,
                Nombre = "Ariany Lopez",
                DocumentoIdentidad = "13174150",
                Telefono = "77205461",
                Correo = "arianylopez@gmail.com"
            };

            _huespedRepoMock.Setup(repo => repo.ObtenerPorId(huespedId)).Returns(huespedMock);

            // Act
            var resultado = _huespedService.ObtenerInformacionHuesped(huespedId);

            // Assert
            Assert.That(resultado, Is.Not.Null, "El huesped no debe ser nulo");
            Assert.That(resultado.Nombre, Is.EqualTo("Ariany Lopez"));
            Assert.That(resultado.DocumentoIdentidad, Is.EqualTo("13174150"));
            Assert.That(resultado.Telefono, Is.EqualTo("77205461"));
            Assert.That(resultado.Correo, Is.EqualTo("arianylopez@gmail.com"));
        }
    }
}