# Uso de Inteligencia Artificial — Mini Wallet

> Declaración de uso de IA durante el desarrollo de Mini Wallet. La IA actuó como
> **implementador**: el criterio de ingeniería, las decisiones de producto y la
> validación de cada cambio fueron míos.

## 1. Herramientas usadas y en qué partes

| Herramienta                                         | Uso                                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **opencode (CLI)** con modelo `qwen3.8-max`         | Creación de `ARCHITECTURE.md` (diseño de la arquitectura) y scaffold inicial del proyecto     |
| **opencode (CLI)** con modelo `deepseek-v4.1-flash` | Implementación de features, tests unit/E2E, refactors, correcciones y documentación posterior |
| **Context7 (MCP remoto)**                           | Consulta de documentación oficial actualizada (Next.js 16, Zod 4, TanStack Query, Playwright) |
| **AGENTS.md generado por Next.js 16**               | Reglas automáticas del framework para agentes (recordatorio de APIs nuevas y docs locales)    |
| **Vitest / Playwright / Lighthouse / ESLint / CI**  | Verificación automatizada; no son IA, pero validan cada cambio                                |

La IA se usó principalmente en:

- Diseño de arquitectura y scaffold inicial (`qwen3.8-max`), incluida la estructura feature-driven y la configuración de Vitest, Playwright, ESLint y Prettier.
- Contratos Zod, tipos de dominio y cliente HTTP tipado.
- Backend mockeado (`src/server`: db, services, fault-injection) y Route Handlers.
- Pantallas y componentes (login, home, wizard, resumen, comprobante).
- Suite de tests unitarios y E2E.
- Documentación: `ARCHITECTURE.md`, `DECISIONS.md`, `README.md` y este documento. Siempre supervisada por mi. La AI es una herramienta que potencializa a los ingenieros.

**Trazabilidad:** el prompt original con el que pedí la arquitectura está guardado tal cual
en [`docs/original-prompt.md`](./docs/original-prompt.md); su resultado es
[`ARCHITECTURE.md`](./ARCHITECTURE.md) y el detalle de cada trade-off está en
[`DECISIONS.md`](./DECISIONS.md).

## 2. Flujo de trabajo

1. **Arquitectura primero:** con `qwen3.8-max` redacté `ARCHITECTURE.md` a partir de un
   prompt y de los requisitos del challenge — stack justificado, estructura feature-driven,
   contratos de datos, estrategia de estado, enrutamiento/permisos y un roadmap por fases.
2. **Plan por fases:** el roadmap se dividió en fases 0–7 (bootstrap, API mockeada, auth,
   home, wizard de transacción, confirmación/comprobante, testing & accesibilidad,
   hardening), cada una con entregables y criterio de validación propios.
3. **Validación por fase:** ninguna fase se cerró sin `npm run lint`, `npm run typecheck`,
   `npm test` y `npm run build` en verde; las fases con UI sumaron E2E de Playwright.
4. **Iteración y corrección:** sobre esa base pedí cambios concretos (mercado MXN,
   aleatoriedad solo en la confirmación, accesibilidad sin `suppressHydrationWarning`,
   tests en inglés, branding) y revisé cada resultado contra el código y los tests, no
   solo contra la salida de la IA.

## 3. Qué acepté y por qué

Ninguna propuesta se aceptó por defecto: cada una se contrastó con un criterio antes de
darla por buena.

| Propuesta de la IA                                          | Criterio que apliqué para aceptarla                                                                                                                                                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estructura feature-driven y regla `app → features → shared` | Verifiqué que cada feature expusiera `index.ts` como API pública y que ningún código de cliente importara `src/server`. Sin esa frontera, el proyecto no escala a varios equipos                                                                   |
| TanStack Query (estado servidor) + Zustand (estado cliente) | Comprobé que Query cubriera loading/error/empty, retries y timeout vía `AbortSignal`, y que Zustand quedara limitado a dos stores efímeros (sesión y borrador). Descarté Context global por re-renders                                             |
| Motor de fault-injection con presets y header `x-fault`     | Lo acepté **modificado**: la aleatoriedad se acotó a la confirmación y el header existe para que cualquier escenario sea reproducible en tests                                                                                                     |
| Contratos Zod compartidos entre cliente y servidor          | Validé que el mismo schema infiriera los tipos TS **y** se ejecutara en el Route Handler, no solo en el formulario (defensa en profundidad)                                                                                                        |
| Suite de tests y documentación técnica                      | Revisé caso por caso y agregué lo que faltaba: casos límite (monto 0/negativo/no entero, destinatario inexistente, respuestas 204, timeout del cliente), umbrales de cobertura 80/75, endpoint de reset para E2E deterministas y títulos en inglés |

### Criterios que exigí a toda sugerencia de la IA

- **TypeScript strict y sin `any`** en `src/`; tipos de dominio y contratos explícitos.
- **Reglas de negocio también en el servidor**, no solo validación en la UI.
- **Dinero en minor units** (enteros), nunca floats; formateo solo en el borde.
- **Tests junto al código** que prueban, y E2E para los flujos críticos.
- **Accesibilidad real** (roles, `aria-*`, foco visible), no solo apariencia.
- **Ningún cambio se daba por bueno** sin `lint`, `typecheck`, `test` y `build` en verde.

## 4. Qué corregí o rechacé

| Propuesta inicial                                                          | Corrección / rechazo                                                                                                                   |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Usar `suppressHydrationWarning` para silenciar el warning de `next-themes` | **Rechazado.** Se eliminó `next-themes` y se migró el tema a `prefers-color-scheme` en CSS para resolver el hydration mismatch de raíz |
| Aleatoriedad (faults + latencia) en todos los endpoints                    | **Corregido.** Solo `POST /api/transactions` (confirmación) es aleatorio; home, login y contactos son deterministas                    |
| Moneda COP, locale `es-CO` y teléfonos `+57`                               | **Corregido.** Migrado a MXN, `es-MX`, `+52` y recarga SPEI (mercado México)                                                           |
| Usuario demo "Camila Restrepo"                                             | **Corregido.** Renombrado a "Noel Camacho" en todo el proyecto                                                                         |
| Títulos de tests en español                                                | **Corregido.** Traducidos a inglés (los textos de UI se mantienen en español)                                                          |
| `AmountStep` con `type="number"` y `valueAsNumber`                         | **Corregido.** Fallaba en jsdom; se pasó a input de texto con `z.coerce.number()`                                                      |
| Tests E2E con datos que se pisaban entre sí                                | **Corregido.** Endpoint de reset + `workers: 1` + dependencia entre proyectos                                                          |
| Script de Lighthouse dejaba servidores huérfanos                           | **Corregido.** Se mata el process group al terminar                                                                                    |

## 5. Decisiones tomadas por mí (no por la IA)

Ninguna decisión de producto la tomó la IA: mercado y moneda (México / MXN), branding y
usuario demo, nivel y alcance de la aleatoriedad, política de accesibilidad e idioma de los
tests fueron definidos o validados por mí. La IA aportó opciones e implementación; el
criterio final fue humano.

**Producto**

- **Mercado objetivo: México** (moneda MXN, locale `es-MX`, teléfonos +52, SPEI).
- **Branding y usuario demo** del proyecto.
- **Tests en inglés** manteniendo la UI en español.

**Ingeniería**

- **Dinero en minor units** (enteros) y formateo con `Intl` solo en el borde.
- **Reglas de negocio validadas en cliente y servidor** (`rules.ts` + `transaction.service.ts`).
- **Sesión en cookie `httpOnly` + guard en tres capas**, nunca en `localStorage`:
  `src/proxy.ts` (redirige a `/login` con `?redirect=` si no hay cookie),
  `src/app/(app)/layout.tsx` (`getServerSession()` + `redirect("/login")` en servidor) y
  `getAuthenticatedUserId()` en cada Route Handler (401 si el token no existe en la db).
- **Aleatoriedad acotada a la confirmación**; el resto de endpoints deterministas.
- **Eliminar `next-themes`** y resolver el tema con `prefers-color-scheme` en CSS, en vez
  de silenciar el warning de hidratación.
- **Taxonomía `ErrorCode`** mapeada a pantallas, en lugar de mensajes sueltos por componente.
- **E2E en serie (`workers: 1`) con endpoint de reset**, por la DB mockeada compartida.
- **Umbrales de cobertura (80/75) y Lighthouse ≥ 90** como gates de calidad.
- **Secretos fuera del código:** `opencode.json` referencia la API key como
  `{env:CONTEXT7_API_KEY}`, el valor vive en `.env` (gitignoreado) y `.env.example` documenta
  las variables. Ninguna credencial se commitea.

**Proceso**

- **Aceptar el plan por fases 0–7** y exigir validación (lint, typecheck, tests, build)
  antes de cerrar cada fase.
- **Pedir explícitamente** no usar `suppressHydrationWarning`, limitar la aleatoriedad a la
  confirmación, localizar la app a México y revisar la documentación contra el código real.

## 6. Nota

Cada fase se revisó y validó con `npm run lint`, `npm run typecheck`, `npm test`,
`npm run test:e2e` y `npm run build` antes de darla por cerrada, y los cambios se
contrastaron contra el código real (no solo contra la salida de la IA).

Estado verificado al cerrar el proyecto:

| Gate                    | Resultado                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `npm run lint`          | 0 errores                                                                              |
| `npm run typecheck`     | 0 errores (TS `strict`, sin `any` en `src/`)                                           |
| `npm test`              | 165 tests en verde (39 archivos)                                                       |
| `npm run test:coverage` | 89 % statements · 79 % branches · 84 % functions · 91 % lines                          |
| `npm run build`         | Compila                                                                                |
| `npm run test:e2e`      | 36 tests en verde (Chromium + Mobile Chrome, en serie con `workers: 1` y `/api/reset`) |

El detalle de los trade-offs técnicos (estructura, estado, rendering, fault injection,
sesión, dinero, accesibilidad, testing y edge cases) está en
[`DECISIONS.md`](./DECISIONS.md); la arquitectura y el roadmap por fases, en
[`ARCHITECTURE.md`](./ARCHITECTURE.md).
