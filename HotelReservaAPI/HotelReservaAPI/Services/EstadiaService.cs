using System;
using System.Collections.Generic;
using System.Linq;
using HotelReservaAPI.Models;
using HotelReservaAPI.Repositories;
using Supabase;

namespace HotelReservaAPI.Services
{
    public static class EstadosReserva
    {
        public const string Reservada = "Reservada";
        public const string EnCurso = "En curso";
        public const string Finalizada = "Finalizada";
        public const string Cancelada = "Cancelada";
    }
    public class EstadiaService : IEstadiaService
    {
        private readonly IEstadiaRepository _estadiaRepository;
        private readonly IHabitacionRepository _habitacionRepository;
        private readonly IPoliticaCancelacionRepository _politicaRepository;
        private readonly IHuespedRepository _huespedRepository;
        private readonly Client _supabase;

        public EstadiaService(
            IEstadiaRepository estadiaRepository,
            IHabitacionRepository habitacionRepository,
            IPoliticaCancelacionRepository politicaRepository,
            IHuespedRepository huespedRepository,
            Client supabase)
        {
            _estadiaRepository = estadiaRepository;
            _habitacionRepository = habitacionRepository;
            _politicaRepository = politicaRepository;
            _huespedRepository = huespedRepository;
            _supabase = supabase;
        }

        public Estadia CrearReserva(Estadia estadia)
        {
            if (estadia.FechaSalida <= estadia.FechaIngreso)
                throw new Exception("La fecha de salida debe ser posterior a la fecha de ingreso.");

            var habitacion = _habitacionRepository.ObtenerHabitacionPorId(estadia.HabitacionId);
            if (habitacion == null) throw new Exception("La habitación seleccionada no existe.");

            var tipoHabitacion = _habitacionRepository.ObtenerTipoHabitacionPorId(habitacion.TipoHabitacionId);
            if (estadia.CantidadPersonas > tipoHabitacion.Capacidad)
                throw new Exception("La cantidad de personas supera la capacidad de la habitación.");

            ValidarDisponibilidadFechas(estadia);

            estadia.Estado = EstadosReserva.Reservada;
            estadia.PrecioAplicado = tipoHabitacion.PrecioBase;
            estadia.FechaCreacion = DateTime.Now;
            estadia.Mora = 0;

            return _estadiaRepository.Insertar(estadia);
        }

        private void ValidarDisponibilidadFechas(Estadia nuevaEstadia)
        {
            var reservasExistentes = _estadiaRepository.ObtenerTodas()
                .Where(r => r.HabitacionId == nuevaEstadia.HabitacionId &&
                            r.Estado != EstadosReserva.Cancelada && r.Estado != EstadosReserva.Finalizada);

            bool hayConflicto = reservasExistentes.Any(reserva =>
                nuevaEstadia.FechaIngreso < reserva.FechaSalida &&
                nuevaEstadia.FechaSalida > reserva.FechaIngreso);

            if (hayConflicto)
                throw new Exception("Habitación ya reservada en ese rango de fechas");
        }

        public List<Estadia> ObtenerReservasActivasYFuturas()
        {
            return _estadiaRepository.ObtenerTodas()
                .Where(r => r.Estado == "Reservada" || r.Estado == "En curso")
                .OrderBy(r => r.FechaIngreso)
                .ToList();
        }

        public List<Estadia> ObtenerTodas()
        {
            return _estadiaRepository.ObtenerTodas().ToList();
        }

        public Estadia RegistrarCheckIn(string estadiaId, List<string> acompanantesIds)
        {
            var reserva = _estadiaRepository.ObtenerPorId(estadiaId);
            if (reserva == null) throw new Exception("La reserva no existe.");
            if (reserva.Estado == EstadosReserva.Cancelada) throw new Exception("No se puede hacer check-in de una reserva cancelada.");
            if (reserva.Estado == EstadosReserva.EnCurso) throw new Exception("El check-in ya fue realizado anteriormente.");
            if (reserva.Estado != EstadosReserva.Reservada) throw new Exception("Estado inválido para registrar check-in.");

            reserva.Estado = EstadosReserva.EnCurso;
            reserva.FechaHoraCheckin = DateTime.Now;
            _estadiaRepository.Actualizar(reserva);

            if (acompanantesIds != null && acompanantesIds.Any())
            {
                foreach (var huespedId in acompanantesIds)
                {
                    var relacion = new EstadiaHuesped
                    {
                        EstadiaAcompananteId = Guid.NewGuid().ToString(),
                        EstadiaId = estadiaId,
                        HuespedId = huespedId
                    };

                    if (_supabase != null) _supabase.From<EstadiaHuesped>().Insert(relacion).Wait();
                }
            }

            var habitacion = _habitacionRepository.ObtenerHabitacionPorId(reserva.HabitacionId);
            if (habitacion != null)
            {
                habitacion.Estado = "Ocupada";
                if (_supabase != null) _supabase.From<Habitacion>().Update(habitacion).Wait();
            }

            return reserva;
        }

        public Estadia RegistrarCheckOut(string estadiaId, DateTime? fechaSalidaReal = null)
        {
            var reserva = _estadiaRepository.ObtenerPorId(estadiaId);
            if (reserva == null) throw new Exception("La reserva no existe.");

            if (reserva.Estado != "En curso") throw new Exception("Solo se puede hacer check-out de una reserva 'En curso'.");

            reserva.Estado = "Finalizada";
            reserva.FechaHoraCheckout = fechaSalidaReal ?? DateTime.Now;

            const int HORA_LIMITE_CHECKOUT = 12;
            const decimal PENALIDAD_LATE_CHECKOUT = 50m;

            if (reserva.FechaHoraCheckout.Value.Hour > HORA_LIMITE_CHECKOUT)
            {
                reserva.Mora += PENALIDAD_LATE_CHECKOUT;
            }

            _estadiaRepository.Actualizar(reserva);
            return reserva;
        }

        public Estadia CancelarReserva(string estadiaId)
        {
            var reserva = _estadiaRepository.ObtenerPorId(estadiaId);
            if (reserva == null) throw new Exception("La reserva no existe.");
            if (reserva.Estado != "Reservada") throw new Exception("Solo se pueden cancelar reservas en estado 'Reservada'.");

            var politica = _politicaRepository.ObtenerPoliticaActiva();
            var diasAnticipacion = (reserva.FechaIngreso.Date - DateTime.Now.Date).TotalDays;

            if (politica != null && diasAnticipacion <= politica.DiasLimiteSinMora && diasAnticipacion >= 0)
            {
                reserva.Mora = reserva.PrecioAplicado * politica.PorcentajePenalidad;
            }
            else
            {
                reserva.Mora = 0;
            }

            reserva.Estado = "Cancelada";
            return _estadiaRepository.Actualizar(reserva);
        }

        public List<Estadia> BuscarReservasPorHuesped(string terminoBusqueda)
        {
            if (string.IsNullOrWhiteSpace(terminoBusqueda))
                return new List<Estadia>();

            var terminoLower = terminoBusqueda.ToLower();

            return _estadiaRepository.ObtenerTodas()
                .ToList()
                .Where(reserva =>
                {
                    var huesped = _huespedRepository.ObtenerPorId(reserva.HuespedTitularId);
                    if (huesped == null) return false;

                    return (huesped.Nombre ?? "").ToLower().Contains(terminoLower) ||
                           (huesped.DocumentoIdentidad ?? "").ToLower().Contains(terminoLower);
                })
                .ToList();
        }
    }
}