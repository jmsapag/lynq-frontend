# Documentación del Frontend — LYNQ

Última revisión: 2025-11-04

## Propósito y alcance

Este documento describe en detalle la arquitectura, organización, flujos y convenciones del frontend del proyecto LYNQ (lynq-frontend). Está dirigido a desarrolladores que trabajarán en la UI: onboarding, desarrollo de nuevas páginas, componentes, integración con APIs y despliegue.

Incluye:

- Setup local y dependencias.
- Estructura del repositorio y significado de cada carpeta.
- Flujos críticos (auth, roles, data fetching).
- Patrones para componentes, servicios y hooks.
- Guías prácticas y ejemplos.

---

## Tabla de contenidos

1. Setup y requisitos
2. Estructura del repositorio (por carpeta)
3. Flujos principales
4. Patrones y convenciones
5. Guías prácticas (ejemplos)
6. Testing y calidad
7. Seguridad y manejo de tokens
8. Deploy y scripts
9. Onboarding / Checklist rápido
10. Referencias internas (.ai/) y recursos

---

## 1. Setup y requisitos

- Node.js: LTS (recomendado 18+).
- npm: última compatible con Node. El repositorio usa npm.
- Vite + React 18 + TypeScript.
- Tailwind CSS y Hero UI (Hero design system).
- Recomendado: VSCode con eslint, Prettier y plugins TypeScript/React.

Pasos iniciales:

1. Clonar repositorio:
   - `git clone git@...:lynq/lynq-frontend.git`
2. Instalar dependencias:
   - `cd lynq-frontend`
   - `npm install`
3. Variables de entorno:
   - Copiar `.env.example` → `.env` y ajustar:
     - `VITE_API_BASE_URL`
     - `VITE_SOME_FEATURE_FLAG`
     - (No guardar secretos en el repo)
4. Correr la app en dev:
   - `npm run dev`
5. Build:
   - `npm run build`
6. Lint y formateo:
   - `npm run lint`
   - `npm run format`

Scripts relevantes (package.json):

- `dev`, `build`, `preview`, `lint`, `test`, `format`, `typecheck`.

---

## 2. Estructura del repositorio (explicación por carpeta)

Ruta base: `src/`

- src/
  - pages/
    - Contiene las páginas principales (rutas). Ej: Dashboard, Comparison, UserManagement, Login, NotFound.
    - Cada page suele exportar un componente por defecto y, cuando aplica, loaders/fetchers.
    - Convención: carpetas por página con `index.tsx` y subcomponentes si es necesario.
  - components/
    - Componentes reutilizables (UI primitives y layout).
    - Estructura: `components/ui/` para elementos visuales (Buttons, Cards reutilizables), `components/layout/` para Header, Sidebar, Footer.
    - Usar Hero UI para componentes básicos y estilos Tailwind.
  - services/
    - Lógica para llamadas a API. Ej: `auth.service.ts`, `location.service.ts`, `user.service.ts`.
    - Debe exportar funciones que usan `axiosPrivate` (o axios público) y retornar tipos fuertes.
    - Patrón: funciones `getX`, `createX`, `updateX`, `deleteX`.
  - hooks/
    - Hooks personalizados: `useAuth`, `useAxiosPrivate`, `useDebounce`, `useChartData`.
    - Reutilizar hooks para separar lógica de presentación.
  - types/
    - Definiciones TypeScript: `User.ts`, `Location.ts`, `ApiResponses.ts`.
    - Mantener tipos pequeños y composables.
  - utils/
    - Helpers puros (fecha, formateo, validaciones).
    - No lógica con efectos o hooks.
  - i18n/
    - Configuración internacionalización (si aplica), recursos de idioma.
  - assets/
    - Imágenes, íconos, fuentes locales.
  - styles/
    - Configuración Tailwind (tailwind.config.cjs) y temas globales.
  - routes/
    - Definición central de rutas, RoleRoute/PrivateRoute wrappers.
  - store/ (opcional)
    - Si se usa estado global (context o redux), aquí vive la implementación.
  - .ai/
    - Documentación generada (arquitectura, estándares, ejemplos).
    - Recurso clave para patrones internos.
  - tests/
    - Tests unitarios e2e (jest, react-testing-library, cypress si existe).

Detalles por carpeta clave

- pages/

  - Dashboard/: punto central con resumen por business/location.
  - Comparison/: vistas que comparan métricas entre ubicaciones.
  - UserManagement/: administración de usuarios y roles.
  - Cada carpeta puede incluir `index.tsx`, `styles.module.css` (si se usa), y subcomponentes.

- components/

  - layout/
    - AppShell, Header, Sidebar, Breadcrumbs, ProtectedLayout.
  - ui/
    - Atomic components (Button, Input, Select, Modal, Table).
  - charts/
    - Wrappers para ECharts con props tipadas y comportamiento responsive.

- services/
  - axios.ts o axiosPrivate.ts:
    - Configuración de axios con interceptores para inyectar tokens y manejar 401.
    - Exponer axiosPublic y axiosPrivate si aplica.

---

## 3. Flujos principales

Autenticación / Autorización

- Login:
  - Form envía credenciales al endpoint `POST /auth/login`.
  - Backend devuelve tokens (acceso/refresh) guardados en httpOnly cookies.
  - Frontend usa cookie para futuras llamadas; axiosPrivate se encarga de headers si necesario.
- PrivateRoute / RoleRoute:
  - `PrivateRoute` valida si existe sesión (token o contexto).
  - `RoleRoute` recibe `allowedRoles` y compara con rol del token/user.
  - Roles principales: LYNQ_TEAM > ADMIN > STANDARD.
- Token refresh:
  - Interceptor axios detecta 401 y realiza reintento con refresh; en fallos fuerza logout.
- Logout:
  - Limpiar cookies / llamar endpoint logout / redireccionar a login.

Data fetching

- Usar axiosPrivate y funciones en `services/`.
- Preferir React Query (o patrón similar) para caching, refetch y estados.
- Manejar loading, error y empty states en cada page/component.

Rutas y navegación

- Centralizar rutas en `routes/` con React Router v6.
- Agrupar rutas por roles con wrappers:
  - `<Route element={<RoleRoute allowedRoles={["ADMIN","LYNQ_TEAM"]}/>}>`
- Lazy load (React.lazy + Suspense) para mejorar performance en grandes páginas.

Charts y visualización

- ECharts para gráficas de sensores. Crear wrapper que:
  - Acepta data tipada, opciones default y breakpoints.
  - Maneja reflows en resize y soporte mobile.

---

## 4. Patrones y convenciones

TypeScript y tipado

- Usar `strict` y tipos reutilizables en `src/types/`.
- Tipar siempre params y respuestas de servicios: `Promise<LocationData>`.

Componentes

- Componentes puros (funcionales) con props tipadas.
- Separar container vs presentational cuando la lógica es compleja:
  - `PageContainer.tsx` -> peticiones, estado.
  - `PageView.tsx` -> presentación.
- Usar Hero UI para consistencia visual; pasan clases Tailwind para customización.

Hooks

- Prefijo `use`: `useAuth`, `useAxiosPrivate`, `useFetchLocations`.
- Hooks no deben acceder a DOM de forma directa; para eso refs o efectos concretos.

Servicios / APIs

- `services/*` — cada servicio exporta funciones específicas.
- Centralizar base URL en axios y env vars.
- Manejar errores con excepciones tipadas y toasts para feedback.

Errores y notificaciones

- Implementar `ErrorBoundary` global para capturar excepciones de render.
- Mostrar toasts (success/error) por operaciones de usuario.

Estilos

- Tailwind util classes.
- Evitar CSS globales; preferir clases utilitarias y variables de tema.
- Configurar tokens de diseño en `tailwind.config.cjs`.

Accesibilidad

- ARIA labels en controles dinámicos.
- Keyboard navigation para modals y dropdowns.
- Alt en imágenes y roles semánticos.

---

## 5. Guías prácticas (ejemplos rápidos)

Cómo agregar una nueva página (ej: Reports)

1. Crear carpeta `src/pages/Reports/`
   - `index.tsx` (export default ReportsPage)
   - `ReportsView.tsx` (componente presentacional)
   - `reports.service.ts` (en services/ si necesita API)
2. Añadir ruta en `src/routes/index.tsx`:
   - Incluir RoleRoute/PrivateRoute según permisos.
3. Estilizar con Hero UI / Tailwind.

Proveer servicio API (ejemplo)

- `src/services/reports.service.ts`:
  - Exportar `getReports`, `getReportById`.
  - Usar `axiosPrivate.get('/reports')`.

Agregar ruta protegida

- En `routes/`:
  - `<Route element={<RoleRoute allowedRoles={['ADMIN','LYNQ_TEAM']} />}>`
  - Dentro: `<Route path="/user-management" element={<UserManagement/>} />`

Agregar chart con ECharts

1. Crear wrapper `src/components/charts/EChartWrapper.tsx`.
2. Props: `data`, `options`, `height`, `onClick`.
3. Usar `useEffect` para init/destroy y `echartsInstance.resize()` en resize.

Manejo de estado global (si aplica)

- Usar Context API para auth y settings.
- Reducer pattern para operaciones complejas.

---

## 6. Testing y calidad

- Unit tests: Jest + React Testing Library.
- E2E (opcional): Cypress.
- QAs:
  - Testear componentes críticos (Login, Dashboard).
  - Mockear servicios API con MSW o jest mocks.
- Lint: ESLint con reglas para TypeScript y React.
- Formateo: Prettier; ejecutar pre-commit hooks (husky) si están configurados.

---

## 7. Seguridad y manejo de tokens

- Tokens de acceso y refresh deben almacenarse en httpOnly cookies.
- No exponer tokens en localStorage.
- axiosPrivate:
  - Interceptor request: incluye cookies si requiere.
  - Interceptor response: en 401 intenta refresh; en fallo, logout.
- Validar roles en frontend pero siempre confiar en backend para autorización final.

---

## 8. Deploy y scripts

- Build con `npm run build`.
- Servir el `dist` en CDN / server estático (Netlify, Vercel, S3+CloudFront).
- Variables env en CI/CD: `VITE_API_BASE_URL`, claves de feature flags.
- Recomendación: Invalidate cache tras deploy si se usa CDN.

CI/CD

- Pipeline:
  - Install, lint, test, build.
  - Publicar artefacto y despliegue.
- Versionamiento:
  - Tagging semántico para releases.

---

## 9. Onboarding / Checklist rápido

- [ ] Instala Node y npm.
- [ ] Clona repo y ejecuta `npm install`.
- [ ] Crea `.env` desde `.env.example`.
- [ ] Ejecuta `npm run dev` y abre `http://localhost:5173`.
- [ ] Revisa `.ai/` para arquitectura y patrones.
- [ ] Ejecuta `npm run lint` y `npm run test`.

---

## 10. Referencias internas y recursos

- `.ai/00_architecture.md` — Diagrama y rol del frontend.
- `.ai/01_standard_formats.md` — Estándares de respuestas API.
- `.ai/03_code_base.md` — Patrones de código (componentes, hooks).
- `.ai/04_tech_stack.md` — Detalles de React, Vite, TypeScript, Hero UI.
- `.ai/05_libraries.md` — Dependencias principales.
- `.ai/07_secure_development_mcp.md` — Buenas prácticas de seguridad.
- `.ai/08_system_flows.md` — Flujos auth y datos.

---

Apéndice: Buenas prácticas y tips rápidos

- Siempre tipar respuestas API.
- Evitar lógica compleja dentro de JSX; extraer a hooks o helpers.
- Reutilizar componentes de `components/ui`.
- Añadir tests básicos cuando se introduce lógica no trivial.
- Mantener PRs pequeños y atómicos; describir cambios y migraciones en la descripción.

---

Contacto interno

- Revisar README principal y tickets relacionados en el tracker (Jira/GitHub Issues) para requisitos de producto.
