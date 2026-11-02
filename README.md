# Gym App — Demo

Demo de una aplicación web para un monitor de gimnasio. El monitor prepara entrenamientos personalizados para sus clientes, y cada cliente consulta desde el móvil la rutina del día (ejercicios, series, repeticiones, peso, descanso y una nota del monitor).

Es una demo: datos de ejemplo, sin pagos, sin dietas, sin vídeos.

## Estado actual

- **Backend**: modelos (`User` con roles, `Exercise`, `Workout`, `WorkoutExercise`), panel de administración de Django, comando de datos de ejemplo (`seed_demo`). La API REST para el frontend está en construcción.
- **Frontend**: todavía no creado.

## Requisitos

- Python 3.10+
- Node.js 18+ y npm (cuando se cree el frontend)
- Git

## Estructura de carpetas

```
gym-app/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example       # copiar a .env para desarrollo local
│   ├── config/             # settings, urls, wsgi/asgi del proyecto Django
│   ├── users/              # modelo de usuario personalizado (role, monitor)
│   ├── exercises/          # catálogo de ejercicios (músculos principales/secundarios)
│   └── workouts/           # entrenos y su contenido (WorkoutExercise) + comando seed_demo
└── frontend/               # (pendiente) React + Vite + TypeScript
```

## Backend: cómo arrancarlo

### 1. Crear y activar el entorno virtual

**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` (este archivo no se sube a Git):

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Por defecto usa SQLite, sin necesidad de cambiar nada para la demo. El propio `.env.example` documenta las variables para cambiar a PostgreSQL (`DB_ENGINE=postgresql` y datos de conexión).

### 4. Aplicar migraciones

```bash
python manage.py migrate
```

### 5. Cargar datos de ejemplo

```bash
python manage.py seed_demo
```

Esto crea los usuarios de demo (ver tabla abajo), 15 ejercicios y una semana de entrenos por cliente (uno ya hecho, uno pendiente, el resto planificados). Se puede ejecutar varias veces sin duplicar datos.

### 6. Arrancar el servidor

```bash
python manage.py runserver
```

Panel de administración: http://127.0.0.1:8000/admin/

## Usuarios de demo

Todos creados por `seed_demo`.

| Usuario | Contraseña | Rol | Notas |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | Superusuario, gestiona todos los usuarios desde `/admin/` |
| `julio` | `demo123` | MONITOR | Monitor de los 3 clientes siguientes |
| `laura` | `demo123` | CLIENT | Cliente de Julio |
| `marcos` | `demo123` | CLIENT | Cliente de Julio |
| `sofia` | `demo123` | CLIENT | Cliente de Julio |

⚠️ Contraseñas de demo únicamente — no usar en producción.

## Frontend

Pendiente de crear (React + Vite + TypeScript + Tailwind). Esta sección se actualizará cuando exista.
