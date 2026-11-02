# Gym App — Contexto del proyecto

Demo de app web para un monitor de gimnasio. El monitor prepara entrenamientos personalizados; cada cliente consulta desde el móvil la rutina del día (ejercicios, series, repeticiones, peso, descanso, nota del monitor). Si un entreno no se hace el día previsto, queda "pendiente" (`status=PENDING`) y se puede hacer otro día. Tres roles: **ADMIN** (gestiona usuarios, solo vía Django admin), **MONITOR** (gestiona sus clientes y rutinas), **CLIENTE** (solo ve lo suyo).

Es una demo: datos de ejemplo, sin pagos, sin dietas, sin vídeos.

## Stack

- **Backend**: Python 3.10, Django 5, Django REST Framework, djangorestframework-simplejwt (JWT), django-cors-headers, SQLite (con switch a PostgreSQL vía variables de entorno). Entorno virtual en `backend/.venv`.
- **Frontend**: React + Vite + TypeScript, React Router, Tailwind CSS. Mobile-first. (Pendiente de crear.)
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
frontend/        # (pendiente)
```

## Convenciones

- Código y comentarios en inglés; textos de interfaz (UI) en español.
- No instalar librerías innecesarias; ante dos opciones, elegir la más simple.
- `AUTH_USER_MODEL` ya fijado a `users.User` desde el principio (no se puede cambiar después sin recrear la BD).
- Músculos: lista fija de códigos (`chest`, `front_delts`, `rear_delts`, `triceps`, `biceps`, `traps`, `lats`, `lower_back`, `abs`, `obliques`, `quads`, `glutes`, `hamstrings`, `calves`, `forearms`), guardados como `JSONField` en `Exercise.primary_muscles` / `secondary_muscles`.
- Gestión de usuarios (crear/editar/desactivar/borrar) es responsabilidad del admin de Django, no del frontend — decisión tomada para mantener la demo simple.
- Trabajar en pasos pequeños, pidiendo confirmación antes de ejecutar comandos (instalar, migrar, arrancar servidor, etc.), y explicando las decisiones de diseño no obvias.

## Fase actual

**Fase 1 — en progreso.**

Hecho:
- Modelo `User` con `role` (ADMIN/MONITOR/CLIENT) y `monitor` (FK self, solo para clientes).
- Modelos `Exercise`, `Workout`, `WorkoutExercise`.
- Todo registrado en el admin de Django (con inline de `WorkoutExercise` dentro de `Workout`).
- Comando `seed_demo`: 1 admin, 1 monitor (Julio), 3 clientes (Laura, Marcos, Sofía), 15 ejercicios, 5 entrenos por cliente.
- `README.md` con instrucciones de arranque y usuarios de demo.

Pendiente:
- API REST (JWT login, `/api/me/`, `/api/my-workouts/`, `/api/workouts/<id>/`, `/api/workouts/<id>/complete/`, endpoints de monitor para clientes/entrenos).
- Tests de permisos.
- Frontend completo (Vite + React + TS + Tailwind): login, rutas protegidas por rol, pantallas Cliente (Hoy, detalle de ejercicio) y Monitor (lista de clientes, asignar entrenos).

Fase posterior (no en Fase 1): mapa muscular visual.
