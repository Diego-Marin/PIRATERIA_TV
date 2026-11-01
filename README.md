# Mi Streaming

Primera versión funcional de una biblioteca de videos con estilo minimalista.

## Qué incluye

- Registro e inicio de sesión con correo y contraseña (Supabase Auth).
- Catálogo visible únicamente para usuarios autenticados.
- Búsqueda por título, descripción y categoría.
- Reproductor integrado mediante Google Drive Preview.
- Panel básico para que el administrador agregue y elimine títulos.
- Políticas RLS: solo el administrador puede modificar el catálogo.
- Diseño adaptable a escritorio y móvil.

## Arquitectura y limitaciones

- **Frontend:** Vite + JavaScript.
- **Autenticación y base de datos:** Supabase.
- **Archivos de video:** Google Drive.
- **Hosting web:** Cloudflare Pages.

Este MVP usa el reproductor de Drive en un iframe. Para que se reproduzca sin iniciar sesión en Google, cada archivo debe compartirse como **Cualquier persona con el enlace — Lector**. Eso significa que el archivo no queda realmente privado: un usuario puede extraer y compartir el enlace de Drive. El login protege la interfaz y el catálogo, no el video original.

Google Drive no es un servicio CDN para transmitir videos a un público grande. Puede imponer límites temporales de reproducción o descarga y el plan gratuito tiene almacenamiento limitado. Usa solo material propio o material que tengas derecho a distribuir.

## 1. Crear proyecto Supabase

1. Abre https://supabase.com/dashboard y crea un proyecto Free.
2. En **Project Settings → API** copia la Project URL y la **Publishable key** (o la `anon` legacy si tu proyecto todavía la muestra).
3. En **SQL Editor**, crea una consulta nueva, pega todo `supabase/schema.sql` y ejecútala.
4. En **Authentication → URL Configuration**, configura la URL local `http://localhost:5173` durante desarrollo. Después agrega la URL de Cloudflare Pages (por ejemplo `https://mi-streaming.pages.dev`) a Site URL / Redirect URLs.
5. Decide si deseas confirmación de correo. Si está activa, el usuario tendrá que abrir el correo antes de iniciar sesión.

## 2. Configurar el proyecto local

Necesitas Node.js LTS y npm.

```bash
# Descomprime la carpeta y entra en ella
cd mi-streaming

# Crea el archivo de variables locales
cp .env.example .env.local
```

En Windows PowerShell puedes usar:

```powershell
Copy-Item .env.example .env.local
```

Edita `.env.local` y completa:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
```

Instala dependencias y arranca:

```bash
npm install
npm run dev
```

Abre la dirección local que muestra Vite (normalmente http://localhost:5173).

## 3. Crear tu cuenta y convertirla en administrador

1. Entra a la web local y crea una cuenta con tu correo.
2. Si Supabase pide confirmar el correo, abre el mensaje y confirma.
3. En Supabase abre **SQL Editor** y ejecuta (cambia el correo por el que registraste):

```sql
update public.profiles
set is_admin = true
where id = (
  select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
);
```

4. Cierra sesión y vuelve a entrar. Verás el panel de administración.

No agregues una opción de frontend para cambiar `is_admin`. El rol se asigna manualmente desde el SQL Editor.

## 4. Subir un video y añadirlo al catálogo

1. Sube el video a Google Drive.
2. En Drive, abre **Compartir** y configura **Cualquier persona con el enlace — Lector**.
3. Copia el enlace de Drive. Normalmente se parece a `https://drive.google.com/file/d/ID_DEL_ARCHIVO/view?usp=sharing`.
4. En Mi Streaming, usa el panel de administración y completa título, categoría, año, descripción, enlace y portada opcional.
5. Guarda. El video aparecerá en el catálogo para usuarios con sesión iniciada.

La portada debe ser una URL pública HTTP/HTTPS de una imagen. El enlace de video debe ser de un archivo de Drive.

## 5. Publicar gratis en Cloudflare Pages

La forma sencilla es conectar el proyecto a un repositorio de GitHub y luego importarlo en Cloudflare Pages.

1. Crea un repositorio GitHub y sube el contenido de esta carpeta (no subas `.env.local`).
2. En Cloudflare Dashboard abre **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecciona el repositorio.
4. Configura:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
5. En las variables de entorno de Pages define las mismas dos variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Despliega el proyecto.
7. Agrega el dominio `https://TU-PROYECTO.pages.dev` a las URL permitidas de Supabase Auth.

Cada cambio que subas a la rama conectada hará que Cloudflare reconstruya el sitio.

## Seguridad básica

- El frontend usa únicamente la **Publishable key** de Supabase; es normal que sea visible en el navegador cuando RLS está correctamente configurado.
- Nunca publiques una `service_role` / `secret` key.
- No permitas que los usuarios cambien `is_admin`.
- Activa confirmación de correo y límites antispam de Supabase antes de invitar usuarios.
- El acceso de Drive es público para cualquiera que tenga el enlace. No lo uses para material que necesite control de acceso real.
- No publiques material protegido por derechos de autor sin autorización.

## Próximas mejoras recomendadas

- Lista de favoritos y continuar viendo.
- Paginación para catálogos grandes.
- Perfiles y registro de reproducciones.
- Una función de servidor / proveedor de video con tokens firmados si se requiere protección real del contenido.
- Un proveedor de almacenamiento y streaming diseñado para video si la audiencia crece.
