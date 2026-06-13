using NUnit.Framework;
using Moq;
using System.Collections.Generic;
using HotelReservaAPI.Models;
using HotelReservaAPI.Services;
using HotelReservaAPI.Repositories;

namespace HotelReservaAPI.Tests
{
    [TestFixture]
    public class ServicioServiceTests
    {
        private Mock<IServicioRepository> _servicioRepoMock;
        private ServicioService _servicioService;

        [SetUp]
        public void Setup()
        {
            _servicioRepoMock = new Mock<IServicioRepository>();
            _servicioService = new ServicioService(_servicioRepoMock.Object);
        }

        [Test]
        public void ObtenerAreas_RetornaListaDeAreas()
        {
            // Arrange
            var areasMock = new List<AreaServicio>
            {
                new AreaServicio
                {
                    AreaId = "area1",
                    NombreArea = "Limpieza"
                }
            };

            _servicioRepoMock.Setup(r => r.ObtenerAreas()).Returns(areasMock);

            // Act
            var resultado = _servicioService.ObtenerAreas();

            // Assert
            Assert.That(resultado, Is.Not.Null);
            Assert.That(resultado.Count, Is.EqualTo(1));
        }
    }
}