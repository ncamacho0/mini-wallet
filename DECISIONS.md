# Decisiones de diseño — Mini Wallet

> Documento de decisiones tomadas durante el challenge. Complementa a
> [ARCHITECTURE.md](./ARCHITECTURE.md) (stack y estructura) y explica el **por qué**,
> la separación UI/lógica, los edge cases considerados y qué haría diferente con
> más tiempo.

## 1. Estructura del proyecto

**Decisión:** feature-driven con `app/` delgado, `features/` por dominio, `shared/`
transversal y `server/` aislado detrás de HTTP.

**Por qué:**

- El challenge pide pensar en millones de usuarios y mantenibilidad por varios
  equipos. Un `components/` y `hooks/` globales no escala: cada dominio
  (`auth`, `wallet`, `transactions`, `contacts`) tiene sus componentes, hooks,
  schemas y API, con `index.ts` como API pública.
- `app/` solo decide enrutamiento, layouts y guards. Si una ruta crece, la lógica
  vive en su feature.
- `server/` simula un backend real: el día que exista API real, se reemplaza
  `src/server` y los handlers sin tocar contratos, hooks ni UI.
- Regla de dependencias `app → features → shared`, y el cliente nunca importa
  `server/`.

## 2. Separación UI / lógica de negocio

**Decisión:** reglas de negocio como funciones puras en
`features/transactions/lib/rules.ts`, contratos Zod compartidos y servicios
server-side en `server/services/`.

**Por qué:**

- Las reglas (monto > 0, saldo suficiente, destinatario obligatorio) se ejecutan
  **en el cliente** (feedback inmediato en el wizard) y **en el servidor** (nunca
  confiar en el cliente). Al ser puras, se testean sin React ni HTTP.
- Los schemas Zod son la fuente única de verdad: infieren tipos TS y validan en
  ambos extremos (defensa en profundidad).
- La UI no conoce códigos de error internos: mapea `ErrorCode → pantalla`
  (comprobante, reintentar, mensaje específico o fallback genérico).

## 3. Estado

**Decisión:** TanStack Query para estado servidor + Zustand para estado cliente.

**Por qué:**

- **TanStack Query** resuelve gratis lo que exige el challenge: estados
  loading/error/empty, retries, timeouts (`AbortSignal`), cache y
  stale-while-revalidate, además de invalidar saldo/movimientos al confirmar.
  Reimplementarlo con Context sería duplicar lógica.
- **Zustand** para lo que es puramente cliente y efímero: snapshot de sesión para
  la UI y borrador del wizard (monto, destinatario, paso) que sobrevive a la
  navegación entre pasos. La opcion elegida esta sobre Context porque evita re-renders globales; Y tambien sobre Redux, por boilerplate injustificado para dos stores.
- La URL guarda lo que debe ser compartible (`?redirect=`), y los inputs de
  formulario viven en react-hook-form (no se globaliza lo que no se comparte).

## 4. Rendering

**Decisión:** shell RSC renderizado en servidor bajo demanda + datos de wallet vía
CSR contra Route Handlers.

**Por qué:**

- Los datos son privados por usuario: SSR/SSG no aporta SEO ni TTFB útil y
  complicaría el cache. Un shell server-rendered con datos en cliente es el
  patrón más cercano a un entorno de alto volumen (paginación, reintentos, cache).
- Ni `/login` ni las rutas protegidas pueden ser estáticas: leen la cookie de
  sesión (y `searchParams` para el `?redirect=`), por lo que Next las marca como
  dinámicas (`ƒ`) en el build. La protección real vive en el layout server del
  grupo `(app)`.
- Las hojas interactivas son `'use client'`; los layouts y entry-points siguen
  siendo Server Components.

## 5. API mockeada y fault injection

**Decisión:** Route Handlers `/api/*` con DB en memoria y un motor de
fault-injection con presets por endpoint.

**Por qué:**

- Cumple "API router con datos mockeados" y desacopla UI de datos.
- La confirmación debe comportarse de forma aleatoria: `POST /api/transactions`
  elige ponderadamente entre éxito, error de red, fondos insuficientes, timeout y
  error desconocido, **después** de validar las reglas de negocio.
- El resto de endpoints son **deterministas** (success, sin latencia): home y login
  no deben fallar ni tardar al azar. El header `x-fault` permite forzar cualquier
  escenario de forma reproducible en tests y en pruebas manuales.
- La DB usa un singleton en `globalThis` para sobrevivir al hot-reload de dev, y
  expone `POST /api/reset` (solo no-producción) para tests deterministas.

## 6. Sesión y permisos

**Decisión:** cookie httpOnly `mw_session` + guardia server en `(app)/layout.tsx` +
`src/proxy.ts` para rechazo temprano con `?redirect=`.

**Por qué:**

- No se busca seguridad real, pero sí la **estructura** correcta: nada de tokens en
  `localStorage`.
- El layout del grupo protege todas las rutas presentes y futuras con una sola
  validación server-side.
- El proxy solo mira presencia de cookie (barato) y captura el destino;
  `sanitizeRedirect` evita open redirects. La validación real del token vive en el
  layout.

## 7. Dinero y formato

**Decisión:** montos en **minor units** (enteros) y formateo solo en el borde con
`Intl.NumberFormat("es-MX", …)`.

**Por qué:**

- Evita errores de punto flotante en dinero; los cálculos son enteros.
- El formato (moneda, separadores, fechas) se centraliza en `shared/lib/format.ts`.
- El challenge original no fijaba mercado; se definió **México** (MXN, `es-MX`,
  teléfonos +52, recarga SPEI) por decisión de producto.

## 8. Confirmación aleatoria (controlada)

**Decisión:** la aleatoriedad vive **solo** en `POST /api/transactions`.

**Por qué:**

- El challenge pide que la pantalla de confirmación funcione de manera aleatoria,
  no que toda la app sea inestable.
- Los pesos viven en `TRANSACTION_FAULTS`; el timeout se simula server-side y la
  latencia es configurable (`MW_MOCK_LATENCY`, `0` en tests).
- La UI mapea cada escenario: éxito → comprobante; red/timeout → error con
  **Reintentar** (misma mutation); fondos insuficientes → mensaje descriptivo;
  desconocido → fallback genérico.

## 9. Accesibilidad y tema

**Decisión:** dark mode por `prefers-color-scheme` en CSS (sin next-themes) y
accesibilidad con roles/aria reales.

**Por qué:**

- `next-themes` mutaba `<html>` antes de hidratar (`class="dark"`,
  `color-scheme`), causando un hydration mismatch. Se resolvió **de raíz**: se
  eliminó la dependencia y el tema pasó a una media query CSS (cero JS, sin FOUC).
  No se usó `suppressHydrationWarning` para ocultar el warning.
- Accesibilidad: skip link, `role="alert"` en errores, `aria-invalid` /
  `aria-describedby` en formularios, foco visible, `role="status"` en skeletons y
  contraste con tokens de tema. Cubierto con tests E2E de teclado.

## 10. Testing

**Decisión:** pirámide con Vitest (unit) + Playwright (E2E), cobertura con
umbrales y CI.

**Por qué:**

- Unit: reglas puras, servicios, route handlers, hooks y componentes críticos
  (165 tests). E2E: los flujos que el usuario recorre (36 tests, desktop + móvil).
- Los E2E corren en serie (`workers: 1`) porque comparten la DB mockeada; el reset
  por test garantiza determinismo.
- Cobertura con umbrales (80/75) evita que la suite se degrade con el tiempo.
- CI ejecuta lint, typecheck, tests con cobertura, build y E2E; Lighthouse corre
  como gate local (≥ 90).

## 11. Edge cases considerados

- Monto cero, negativo, no entero o mayor al saldo (cliente y servidor).
- Destinatario ausente, `recipientId` vacío o inexistente, contacto nuevo sin
  nombre ni medio de contacto.
- Contacto nuevo con teléfono inválido o email inválido.
- Timeout del servidor simulado y timeout del cliente (`AbortSignal`).
- Error de red, fondos insuficientes y error desconocido con fallback.
- Rutas privadas sin sesión y open redirect en `?redirect=`.
- Lista de movimientos vacía, cargando y con error.
- Doble submit: botones deshabilitados mientras la mutation está pendiente.
- Tema oscuro del sistema sin parpadeo ni mismatch de hidratación.
- Formulario inválido sin llamar al API (validación local primero).

## 12. Qué haría diferente con más tiempo

- **Backend real o MSW** en lugar del mock casero, con contratos OpenAPI y
  generación de tipos.
- **Paginación por cursor** y scroll infinito en movimientos.
- **Idempotency keys** en la creación de transacciones para evitar duplicados por
  reintentos.
- **E2E para timeout y unknown** forzados, y auditoría automática con axe-core.
- **i18n formal** (`next-intl`) en lugar de textos hardcodeados en español.
- **Toggle de tema manual** persistido en cookie y resuelto server-side (HTML
  correcto desde el primer render, sin sacrificar el no-FOUC).
- **Observabilidad**: logging estructurado, métricas y trazas por request.
- **Storybook** para los componentes de `shared/ui` y **visual regression**.
- **Rate limiting real** para activar el código `RATE_LIMITED` ya declarado.
- **Error boundaries** por feature y estados de recuperación más ricos.
