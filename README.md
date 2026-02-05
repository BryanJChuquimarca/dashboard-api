# dashboard-api

API backend para un proyecto de Dashboard. Utiliza Node.js, Express y PostgreSQL. Permite registrar usuarios, iniciar sesión y gestionar datos del dashboard de cada usuario. Incluye autenticación con JWT y endpoints CRUD y llamada a gemini.

## Instalación

1. Clona este repositorio.
2. Instala las dependencias:
   ```
   npm install
   ```
3. Crea un archivo `.env` en la raíz con el siguiente contenido (ajusta los valores según tu entorno):
   ```
   JWT_SECRET=tu_clave_secreta
   PORT=3000
   GEMINI_API_KEY=tu_api_key_de_gemini
   DATABASE_URL=tu_url_de_postgres
   ```
4. Compila el proyecto:
   ```
   npm run dev
   ```

## Endpoints principales

- `POST /api/auth/register` — Registrar usuario (email, nombre, contraseña)
- `POST /api/auth/login` — Iniciar sesión (email, contraseña, devuelve token)
- `POST /api/dashboard` — Crear item en el dashboard (requiere token)
- `GET /api/dashboard` — Listar items del dashboard del usuario
- `GET /api/dashboard/important` — Devuelve los 3 items más importantes según IA
- `PATCH /api/dashboard/:id` — Editar un item del dashboard
- `DELETE /api/dashboard/:id` — Eliminar un item
- `GET /api/user/profile` — Obtener perfil del usuario
- `PATCH /api/user/profile` — Editar nombre del usuario

Todos los endpoints de dashboard y perfil requieren autenticación (token JWT en el header `Authorization`).
