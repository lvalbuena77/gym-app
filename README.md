# Gym App — Demo

Demo de una aplicación web para un monitor de gimnasio. El monitor prepara entrenamientos personalizados para sus clientes, y cada cliente consulta desde el móvil la rutina del día (ejercicios, series, repeticiones, peso, descanso y una nota del monitor).

Es una demo: datos de ejemplo, sin pagos, sin dietas, sin vídeos.

## Estado actual

- **Backend**: modelos (`User` con roles, `Exercise`, `Workout`, `WorkoutExercise`), panel de administración de Django, comando de datos de ejemplo (`seed_demo`), API REST completa (JWT, entrenos del cliente, gestión del monitor) con tests de permisos.
- **Frontend**: React + Vite + TypeScript + Tailwind. Login, rutas protegidas por rol, pantalla "Hoy" y detalle de entreno (cliente), lista de clientes y ficha/asignación de entrenos (monitor).

## Requisitos

- Python 3.10+
- Node.js 18+ y npm
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
└── frontend/
    ├── .env.example        # copiar a .env para desarrollo local
    └── src/
        ├── api/            # cliente fetch (client.ts) y tipos TypeScript (types.ts)
        ├── auth/            # AuthContext: sesión, token, login/logout
        ├── components/      # ProtectedRoute (rutas según rol)
        └── pages/           # Login, Today, ExerciseDetail, MonitorClients, MonitorAssign
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

## Frontend: cómo arrancarlo

El backend (paso anterior) debe estar corriendo en `http://127.0.0.1:8000/` para que el frontend pueda iniciar sesión y pedir datos.

### 1. Instalar dependencias

**Windows (PowerShell) y Mac/Linux (mismo comando):**
```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` (no se sube a Git):

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Por defecto apunta al backend local (`VITE_API_URL=http://127.0.0.1:8000`); no hace falta cambiar nada para la demo.

### 3. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173/` y entra con cualquiera de los usuarios de demo de la tabla anterior (excepto `admin`, que solo gestiona usuarios desde `/admin/`, no desde esta app).
