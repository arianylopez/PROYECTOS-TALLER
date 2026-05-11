# PsiManager - Sistema de Gestión para Consultorios Psicológicos

## Descripción General

**PsiManager** es una aplicación web de uso interno diseñada específicamente para psicólogos clínicos que operan en consultorios unipersonales. El sistema centraliza y automatiza la gestión administrativa, eliminando la dependencia de agendas físicas y la coordinación manual de citas por mensajería.

El objetivo principal es optimizar el tiempo del profesional, permitiéndole enfocarse en la atención clínica al proveer herramientas ágiles para el control de pacientes, configuración de horarios laborables reales y un calendario interactivo con validación inteligente para evitar conflictos de horarios.

## Funcionalidades Principales

El sistema está dividido en cuatro módulos funcionales clave, accesibles a través de una navegación SPA (Single Page Application) fluida.

### 1. Dashboard (Vista General)

Al iniciar sesión, el profesional accede a una panorámica inmediata de su actividad inminente.

**Widget "Próximos Turnos":** Lista cronológica de las citas en estado "Programado" para el día actual y el día siguiente. Permite anticipar la jornada sin explorar el calendario completo.

<img width="1916" height="1027" alt="imagen1" src="https://github.com/user-attachments/assets/1f98d69b-67f4-46d6-a226-355d19c29d1f" />

### 2. Gestión de Pacientes (CRUD)
Un directorio centralizado y seguro para administrar la base de contactos.

**- Registro Completo:** Formulario para capturar Nombre Completo (obligatorio), Email, Teléfono y Notas logísticas.

**- Búsqueda en Tiempo Real:** Barra de búsqueda predictiva que filtra la tabla de pacientes por nombre o email instantáneamente mientras se escribe.

**- Edición y Eliminación:** Permite actualizar datos o dar de baja a un paciente (incluyendo borrado en cascada de sus turnos asociados tras confirmación).

<img width="1917" height="1025" alt="image" src="https://github.com/user-attachments/assets/09d9844e-c2cd-4c41-8d17-f065249e78fc" />

### 3. Configuración de Horarios
Permite adaptar el sistema a la jornada laboral real del terapeuta.

**- Activación de Días:** Interruptores para habilitar o deshabilitar la atención de Lunes a Domingo.

**- Rangos Horarios:** Definición de Hora Inicio y Hora Fin por cada día activo. Esta configuración restringe visualmente el calendario para impedir agendar citas fuera de turno.

<img width="1919" height="1024" alt="image" src="https://github.com/user-attachments/assets/57a09405-aceb-4e09-b9c6-53397135097e" />

### 4. Calendario Interactivo y Motor de Turnos
El núcleo operativo del sistema, potenciado por la librería FullCalendar.

**- Vistas Dinámicas:** Cambio entre vistas Mensual, Semanal y Diaria.

**- Creación Ágil:** Permite arrastrar sobre la cuadrícula de tiempo (slots) para abrir el formulario de cita pre-completado con fecha y hora.

**- Buscador Predictivo de Pacientes:** Al agendar, el sistema sugiere nombres de la base de datos para garantizar la vinculación correcta.

**- Control de Estados:**

  **🟣 Programado:** Cita pendiente.

  **🟢 Completado:** Sesión realizada.

  **🔴 Cancelado:** Cita anulada.

**- Prevención de Solapamiento (Doble Reserva):** Validación inteligente que impide guardar un turno si interfiere total o parcialmente con otro existente.

<img width="1919" height="1028" alt="image" src="https://github.com/user-attachments/assets/07993f8e-2f1a-49bf-81cb-7249769be360" />

## Ciclo de Vida del Desarrollo de Software

Este proyecto se ha desarrollado siguiendo un enfoque iterativo y estructurado, asegurando que la implementación técnica responda directamente a las necesidades operativas identificadas.

### 1. Fase de Análisis (Requerimientos)

Se identificaron los cuellos de botella del proceso manual (agendas de papel, chats de WhatsApp): pérdida de trazabilidad, errores de doble reserva y carga administrativa excesiva.

Resultado: Definición de historias de usuario detalladas que mapean el "flujo principal" necesario: registro de pacientes -> configuración de disponibilidad -> agendamiento sin conflictos -> monitorización de estados.

[Enlace al Documento de Analisis de Requerimientos](https://docs.google.com/document/d/16CowSFZi3roO9Cc2wlwK9R_u_kZ6v1btZLs0iW79BG4/edit?usp=sharing) 

### 2. Fase de Diseño

Se crearon prototipos de alta fidelidad en Figma para definir la experiencia de usuario (UX) y la interfaz (UI). El enfoque se centró en la simplicidad, permitiendo al psicólogo realizar gestiones con el mínimo número de clics.

[Enlace al Proyecto en Figma](https://www.figma.com/design/Sabi6tVdRuJBopVHTzo1zd/GESTION-DE-TURNOS-PSICOLOGICO?node-id=0-1&t=IRq75y7eAeMmgKq5-1)

![AgendaMensual](https://github.com/user-attachments/assets/e6be2807-0c88-45b9-8430-e868a839a3ce)

![Pacientes](https://github.com/user-attachments/assets/f1c531c9-309d-4c42-a752-37b4351cb82e)

![Horarios](https://github.com/user-attachments/assets/6fa176ad-9c29-4822-91ed-d694b8201816)

### 3. Fase de Implementación

La construcción técnica se realizó alineada estrictamente con el diseño validado y los requerimientos funcionales.

**Frontend:** Vanilla JavaScript, HTML5 y CSS3

**Librerías Key:** FullCalendar JS para la matriz del calendario.

**Backend/Base de Datos:** Supabase (BaaS) para la persistencia de datos y gestión de la lógica de negocio (validaciones).

## Diagrama de Arquitectura

![arquitectura](https://github.com/user-attachments/assets/9ebcb182-ecb4-4df6-ab4c-e8f65bce625d)

**Descripción del flujo:** El usuario interactúa con la UI (Vanilla JS + FullCalendar). La lógica de cliente utiliza el SDK de Supabase para enviar/recibir datos. Supabase gestiona la autenticación y persiste los datos en PostgreSQL, ejecutando validaciones críticas (como evitar solapamientos de turnos) antes de confirmar cambios.

## Distribucion de Carpetas

```
proyecto-taller-4/
├── docs/                     
│   ├── HISTORIAS DE USUARIO.docx     # Anexo de historias de usuario del sistema
|   ├── PROYECTO 4 - TALLER DE DISEÑO DE SOFTWARE.docx  # Analisis de Requerimientos
│   ├── arquitectura.jpg              # Diagrama de arquitectura 
├── src/                  # Implementacion del sistema
│   ├── app.js
|   ├── index.html
│   ├── styles.css
└── video/                
    ├── video.mp4         
```

## Instalación y Configuración local

Para ejecutar este proyecto en tu entorno local para desarrollo o pruebas, sigue estos pasos:

**1. Clonar el repositorio:**

```
git clone https://github.com/arianylopez/PROYECTO-TALLER-4.git
cd PROYECTO-TALLER-4
code .
```

**2. Ejecutar localmente:**

- Abre el proyecto en tu editor de código (ej. VS Code).

- Inicia tu servidor local preferido apuntando a index.html.

- Ejemplo con VS Code Live Server: Haz clic derecho sobre index.html y selecciona "Open with Live Server".

La aplicación se abrirá en tu navegador, generalmente en `http://127.0.0.1:5500`
