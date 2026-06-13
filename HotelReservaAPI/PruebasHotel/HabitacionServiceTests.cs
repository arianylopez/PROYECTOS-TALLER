using NUnit.Framework;
using Moq;
using System.Collections.Generic;
using HotelReservaAPI.Models;
using HotelReservaAPI.Services;
using HotelReservaAPI.Repositories;

namespace HotelReservaAPI.Tests
{
    [TestFixture]
    public class HabitacionServiceTests
    {
        private Mock<IHabitacionRepository> _habitacionRepoMock;
        private HabitacionService _habitacionService;

        [SetUp]
        public void Setup()
        {
            _habitacionRepoMock = new Mock<IHabitacionRepository>();
            _habitacionService = new HabitacionService(_habitacionRepoMock.Object);
        }

        [Test]
        public void ObtenerHabitaciones_RetornaListaDeHabitaciones()
        {
            var listaMock = new List<Habitacion>
            {
                new Habitacion
                {
                    HabitacionId = "hab1",
                    Estado = "Disponible"
                }
            };

            _habitacionRepoMock.Setup(r => r.ObtenerHabitaciones()).Returns(listaMock);

            var resultado = _habitacionService.ObtenerHabitaciones();

            Assert.That(resultado.Count, Is.EqualTo(1));
            Assert.That(resultado[0].HabitacionId, Is.EqualTo("hab1"));
        }

        [Test]
        public void ObtenerTiposHabitacion_RetornaListaDeTipos()
        {
            var listaMock = new List<TipoHabitacion>
            {
                new TipoHabitacion
                {
                    TipoHabitacionId = "tipo1"
                }
            };

            _habitacionRepoMock.Setup(r => r.ObtenerTiposHabitacion()).Returns(listaMock);

            var resultado = _habitacionService.ObtenerTiposHabitacion();

            Assert.That(resultado.Count, Is.EqualTo(1));
            Assert.That(resultado[0].TipoHabitacionId, Is.EqualTo("tipo1"));
        }
    }
}