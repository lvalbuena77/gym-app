# Gym App — Contexto del proyecto

Demo de app web para un monitor de gimnasio. El monitor prepara entrenamientos personalizados; cada cliente consulta desde el móvil la rutina del día (ejercicios, series, repeticiones, peso, descanso, nota del monitor). Si un entreno no se hace el día previsto, queda "pendiente" (`status=PENDING`) y se puede hacer otro día. Tres roles: **ADMIN** (gestiona usuarios, solo vía Django admin), **MONITOR** (gestiona sus clientes y rutinas), **CLIENTE** (solo ve lo suyo).

Es una demo: datos de ejemplo, sin pagos, sin dietas, sin vídeos.

## Stack

- **Backend**: Python 3.10, Django 5, Django REST Framework, djangorestframework-simplejwt (JWT), django-cors-headers, SQLite (con switch a PostgreSQL vía variables de entorno). Entorno virtual en `backend/.venv`.
- **Frontend**: React + Vite + TypeScript, React Router, Tailwind CSS. Mobile-first.
- Configuración sensible en `backend/.env` (gitignored); `.env.example` documenta las variables.

## Comandos habituales

```bash
# Backend — desde backend/, con el venv activado (o usando .venv/Scripts/python.exe en Windows)
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo          # recrea datos de ejemplo (idempotente)
python manage.py test               # tests
```

Usuarios de demo y credenciales: ver [README.md](README.md).

## Estructura

```
backend/
├── config/      # settings, urls raíz
├── users/       # modelo User (AbstractUser + role + monitor FK)
├── exercises/   # modelo Exercise (JSONField para músculos)
└── workouts/    # Workout, WorkoutExercise, comando seed_demo
frontend/
└── src/
    ├── api/         # client.ts (fetch + JWT), types.ts
    ├── auth/        # AuthContext (sesión, login/logout)
    ├── components/  # ProtectedRoute
    └── pages/       # Login, Today, ExerciseDetail, MonitorClients, MonitorAssign
```

## Convenciones

- Código y comentarios en inglés; textos de interfaz (UI) en español.
- No instalar librerías innecesarias; ante dos opciones, elegir la más simple.
- `AUTH_USER_MODEL` ya fijado a `users.User` desde el principio (no se puede cambiar después sin recrear la BD).
- Músculos: lista fija de códigos (`chest`, `front_delts`, `rear_delts`, `triceps`, `biceps`, `traps`, `lats`, `lower_back`, `abs`, `obliques`, `quads`, `glutes`, `hamstrings`, `calves`, `forearms`), guardados como `JSONField` en `Exercise.primary_muscles` / `secondary_muscles`.
- Gestión de usuarios (crear/editar/desactivar/borrar) es responsabilidad del admin de Django, no del frontend — decisión tomada para mantener la demo simple.
- Trabajar en pasos pequeños, pidiendo confirmación antes de ejecutar comandos (instalar, migrar, arrancar servidor, etc.), y explicando las decisiones de diseño no obvias.

## Fase actual

**Fase 1 — completa.**

Hecho:
- Modelo `User` con `role` (ADMIN/MONITOR/CLIENT) y `monitor` (FK self, solo para clientes).
- Modelos `Exercise`, `Workout`, `WorkoutExercise`.
- Todo registrado en el admin de Django (con inline de `WorkoutExercise` dentro de `Workout`).
- Comando `seed_demo`: 1 admin, 1 monitor (Julio), 3 clientes (Laura, Marcos, Sofía), 15 ejercicios, 5 entrenos por cliente (fechas relativas a "hoy" — volver a ejecutar el comando si las fechas de la demo quedan desactualizadas).
- `README.md` con instrucciones de arranque (backend y frontend, Windows y Mac/Linux) y usuarios de demo.
- API REST completa:
  - `POST /api/token/`, `POST /api/token/refresh/` (login JWT, de simplejwt).
  - `GET /api/me/`.
  - `GET /api/my-workouts/?week=YYYY-MM-DD`, `GET /api/workouts/<id>/`, `POST /api/workouts/<id>/complete/` (cliente).
  - `GET /api/exercises/`, `GET /api/monitor/clients/`, `GET/POST /api/monitor/workouts/?client=<id>`, `PUT /api/monitor/workouts/<id>/` (monitor, protegidos con el permiso `IsMonitor` en `users/permissions.py`).
  - Aislamiento de datos: un cliente nunca ve entrenos ajenos (404, no 403, para no revelar su existencia); un monitor no puede crear/editar entrenos de clientes que no son suyos.
- 13 tests de permisos en `workouts/tests.py` (login real vía JWT + `force_authenticate` para los casos de permisos), todos en verde.
- Frontend (Vite + React + TS + Tailwind): login, rutas protegidas por rol (`ProtectedRoute`), sesión vía `AuthContext` (tokens en `localStorage`, refresh automático en `api/client.ts`).
  - Cliente: pantalla "Hoy" (entreno del día o pendiente) y detalle de entreno (tabla de series, hueco de "Mapa muscular", botón marcar como hecho).
  - Monitor: lista de clientes y ficha de cliente (ver entrenos asignados, crear uno nuevo, editar uno existente).

Pendiente / ideas para retomar:
- Vista semanal o calendario para el cliente (ahora "Hoy" solo muestra el entreno de hoy o uno pendiente, no la semana completa).
- Formato visual de marca (logo, paleta de colores propia) — de momento usa un azul/blanco genérico con Tailwind.

Fase posterior (no en Fase 1): mapa muscular visual.

Hay una vista previa visual (mockup, datos falsos, sin backend) publicada aparte para mostrar a terceros — no vive en este repositorio.
