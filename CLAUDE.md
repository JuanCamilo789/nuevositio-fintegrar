# Sistema de diseño — uso obligatorio de variables CSS

Todo valor visual debe obtenerse a través de variables CSS definidas en `src/styles/global.css`. Está prohibido utilizar valores hardcodeados en los componentes.

Valores que **no deben aparecer directamente** en un componente:

- Colores (`#2563eb`, `rgb()`, `hsl()`, etc.)
- `font-size`, `font-weight`, `line-height`
- `border-radius`, `box-shadow`, `border`
- `padding`, `margin`, `gap` (cuando correspondan a tamaños del sistema)
- `width` / `height` de tamaños del sistema
- `transition`, `animation-duration`
- `z-index` (debe existir una escala definida)
- Opacidades reutilizables
- Breakpoints

Todos estos valores deben invocarse mediante `var(--...)` o clases utilitarias del sistema.

## Tono y personalidad de marca

Definición del diseñador de marca (Personalidad de marca), que debe guiar todo copy/redacción del sitio (textos de UI, formularios, mensajes de error, CTAs, contenido editorial):

> FINTEGRAR es un amigo, un aliado estratégico que quiere ver crecer en todos los aspectos de la vida del asociado, simplemente te viene a ayudar, apoyarte y verte crecer. Y lo más importante de todo es que enseñará a vivir y te educará financieramente para tu futuro. Aman a los asociados porque son su razón de ser y de construir país.

> FINTEGRAR es una marca que habla fuerte y claro, enseña y educa en un tono amigable y alegre, pero nunca te hablará fuerte, como un profesor que se preocupa por enseñar y por tu bienestar.

En la práctica esto significa:
- Hablar como un amigo cercano y aliado, no como una institución fría o corporativa. Tono cálido, cercano, en segunda persona ("tú"/"usted" según el contexto ya establecido en el sitio).
- Enfocar el copy en el crecimiento y bienestar del asociado (económico, personal, familiar), no solo en el producto o trámite.
- Transmitir acompañamiento y educación financiera — cuando aplique, el copy puede explicar el "por qué" o dar contexto útil, no solo instruir.
- Comunicar con claridad y firmeza (mensajes directos, sin ambigüedad), pero siempre en tono amigable y alegre — como un profesor que enseña con cariño, nunca con autoridad fría o regaño.
- Nunca sonar transaccional, distante, ni "hablar fuerte" (imperativo duro, tono de reclamo o urgencia agresiva). Evitar jerga bancaria fría; preferir lenguaje humano y claro.
- El asociado es el centro: los mensajes deben sentirse hechos para su beneficio, no para conveniencia administrativa de Fintegrar.

## Regla de actualización

Antes de modificar o agregar cualquier estilo, valor visual o componente, **remitirse primero a `global.css`**: revisar qué tokens ya existen, si el cambio debe reflejarse ahí, y si toca algún valor que ya esté tokenizado (para actualizar el token en un solo lugar en vez de crear un duplicado o dejar un valor suelto). Esto aplica también a cambios que a primera vista parecen aislados a un solo componente — casi siempre hay un token relacionado.

## Antes de escribir CSS o modificar un componente

1. Verificar si el valor ya existe como token en `global.css`.
2. Si no existe: evaluar si aporta al sistema de diseño.
3. Si aporta, agregar primero el token en `global.css`, luego usarlo con `var(--nombre-del-token)`.
4. Nunca escribir el valor directamente en el componente primero.

`global.css` es la única fuente de verdad para tipografía, colores, espaciados, border-radius, sombras, bordes, breakpoints, z-index, transiciones, animaciones, opacidades y variables de layout.

## Excepciones técnicas (no son pretexto para hardcodear el resto)

- **Breakpoints en `@media`**: `var()` no se resuelve dentro de la condición de una media query — es una limitación de CSS. El valor de breakpoint se deja literal; todo lo demás dentro del bloque sí debe usar tokens.
- **`<meta name="theme-color" content="...">`**: el navegador lee ese atributo directamente, sin pasar por CSS — `var()` no se resuelve ahí. Se deja el hex literal (debe coincidir con `--color-ink`).
- **`stop-color` en `<stop>` de un `<linearGradient>` SVG inline**: no se pudo verificar de forma confiable que `var()` se resuelva ahí en todos los navegadores soportados, y es el gradiente más visible del sitio (íconos del Hero). Se dejó en hex literal a propósito; si se retoma, verificar visualmente antes de convertir.

Si aparece un caso nuevo de este tipo (un atributo/contexto que no pasa por la cascada CSS normal), aplica la misma lógica: literal + nota aquí, no forzar `var()` a ciegas.

## Estado de la migración (2026-07-28)

- **Hecho:** colores hex sólidos dentro de bloques `<style>` de `.astro`, en atributos `style="..."` inline y en clases Tailwind arbitrarias (`text-[#...]`, `bg-[#...]`) migrados a `var(--color-*)` en `global.css` (~600 reemplazos en total). `border-radius` consolidado (`--radius-sm/md/lg/xl/full`).
- **Pendiente (alto volumen, requiere pasada dedicada con revisión visual):**
  - `box-shadow` — ~46 valores rgba únicos, mayoría bespoke por componente.
  - `font-size` — ~50 valores (incluye `clamp()` responsivos únicos por componente).
  - `padding` / `margin` / `gap` arbitrarios — no hay escala de espaciado definida aún.
  - `z-index`, `opacity`, `transition`/`animation-duration` — sin escala definida.

Al retomar cualquiera de estos puntos, definir primero la escala/tokens en `global.css`, migrar de a pocos componentes por vez, y verificar visualmente (build + navegador) antes de seguir — el volumen es alto y el riesgo de romper el diseño visual es real si se hace sin revisión.
