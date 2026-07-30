# Fintegrar — Landing Page

Sitio web institucional de **Fintegrar**, Fondo de Empleados, construido con [Astro](https://astro.build). Incluye la landing pública, formularios de servicio (actualización de datos, PQRSF), páginas legales/normativas y un panel de administración liviano para gestionar contenido (normatividad, legales).

> **Nota de contexto:** este código proviene de un sitio previamente construido para otro proyecto, adaptado y rebrandeado para Fintegrar. Ver `CLAUDE.md` para el detalle del sistema de diseño y las reglas de estilo/tono.

## Stack técnico

- **[Astro](https://astro.build) 7** — SSR (`output: 'server'`) con adaptador `@astrojs/node` en modo standalone.
- **Tailwind CSS 4** (vía `@tailwindcss/vite`) + tokens propios en `src/styles/global.css`.
- **[Supabase](https://supabase.com)** — persistencia de contenido editable (normatividad, legales) desde el panel admin.
- **astro-icon** (set `tabler`) para iconografía.
- **GSAP** y **sanitize-html** como utilidades puntuales.
- **DM Sans** (`@fontsource/dm-sans`) — única tipografía del sitio.

## Requisitos previos

- Node.js 20+
- Un proyecto de Supabase (URL + claves) si se va a trabajar con el panel de administración o contenido dinámico.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar las variables (ver abajo)
npm run dev
```

El sitio queda disponible en `http://localhost:4321`.

## Variables de entorno

Definidas en `.env` (ver `.env.example`):

| Variable | Uso |
|---|---|
| `PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (cliente y servidor) |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave con permisos elevados — **solo servidor**, nunca prefijo `PUBLIC_`/`VITE_`. Usada en `src/pages/api/admin-normatividad.ts` para escrituras autenticadas por el panel admin |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del panel de administración (`/admin/landing-page`) |
| `ADMIN_SESSION_SECRET` | Secreto para firmar la cookie de sesión admin (`admin_lp`) |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción (SSR) en `dist/` |
| `npm run start` | Levanta el build de producción (`node dist/server/entry.mjs`) |
| `npm run preview` | Previsualiza el build con el preview server de Astro |

## Estructura del proyecto

```
src/
├── components/       # Secciones y piezas reutilizables (.astro)
│   └── form/          # Inputs flotantes reutilizados en formularios
├── data/              # Datos estáticos (tasas, legales en HTML)
├── layouts/           # Layout.astro (base), InnerLayout.astro (páginas internas),
│                       # LegalLayout.astro (páginas legales, envuelve InnerLayout)
├── pages/             # Rutas del sitio (file-based routing)
│   ├── admin/          # Panel de administración (excluido del sitemap)
│   └── api/            # Endpoints server-side (Supabase, guardado de legales)
└── styles/
    └── global.css      # Única fuente de verdad para colores, tipografía,
                          # espaciados, sombras, radios, breakpoints, etc.
```

### Páginas principales

- `/` — Home
- `/nosotros`, `/creditos`, `/ahorros`, `/convenios`, `/directorio`, `/cuerpos-colegiados` — secciones institucionales
- `/normatividad`, `/aviso-privacidad`, `/politica-tratamiento-datos`, `/terminos-condiciones`, `/sarlaft`, `/manual-procedimientos` — legales y normativos
- `/actualizacion-datos`, `/pqrsf` — formularios de servicio al asociado
- `/admin/landing-page` — panel de administración (protegido por sesión)

## Sistema de diseño

Todo valor visual (colores, tipografía, espaciados, sombras, radios, breakpoints, z-index, transiciones) debe salir de variables CSS definidas en `src/styles/global.css` — **no se permiten valores hardcodeados** en componentes, salvo las excepciones técnicas documentadas explícitamente en `CLAUDE.md`.

**Antes de tocar cualquier estilo o componente**, leer `CLAUDE.md` — ahí está:
- La regla completa de tokens/variables y su estado de migración.
- La paleta oficial de marca y el degradado (`--gradient-brand`, diagonal 135deg).
- El tono y personalidad de marca que debe reflejarse en todo el copy del sitio.
- Excepciones técnicas conocidas (SVG `stop-color`, `meta theme-color`, breakpoints en `@media`).

## Despliegue

El sitio corre en modo SSR standalone (`@astrojs/node`), pensado para desplegarse en un entorno Node persistente (actualmente Railway — ver `allowedHosts` en `astro.config.mjs`). El build genera `dist/server/entry.mjs`, ejecutable con `npm run start`.

## Panel de administración

Ubicado en `/admin/landing-page`, protegido por credenciales (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) y cookie de sesión firmada (`admin_lp`). Permite editar contenido de normatividad y páginas legales, persistido en Supabase. Las rutas `/admin/*` y `/api/*` están excluidas del sitemap generado por `@astrojs/sitemap`.
