# Mini Wallet Web App — Arquitectura

> Documento de arquitectura para una mini wallet que simula el flujo:
> **Login → Home → Nueva Transacción → Confirmación / Comprobante**.
> Datos 100 % mockeados. Diseñada siguiendo Clean Architecture, desarrollo
> feature-driven y pensando en escalabilidad (millones de usuarios) y
> mantenibilidad (múltiples equipos).

Versiones base (sep 2026): Next.js **16.3**, React **19.2**, TypeScript **5 (strict)**,
Tailwind CSS **4**, TanStack Query **5**, Zod **4**, Vitest **5**, Playwright **1.63**.

---

## 1. Stack tecnológico detallado

| Área                      | Decisión                                                                                                                                                            | Justificación                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                 | **Next.js 16 (App Router) + React 19 + TS strict**                                                                                                                  | Requisito del brief. Turbopack por defecto, caching explícito (fetch ya no se cachea implícitamente), React Compiler, `proxy.ts` (renombrado de `middleware.ts`).                                                                                                                                                                            |
| Rendering                 | **Híbrido**: shell/layouts como RSC renderizados bajo demanda (leen sesión); datos de wallet vía **CSR + TanStack Query** contra Route Handlers internos (`/api/*`) | Los datos de la wallet son privados por usuario: SSR/SSG no aporta SEO ni TTFB útil. Un "shell server-rendered + datos en cliente" es el patrón que mejor simula un entorno de alto volumen (paginación, reintentos, cache, stale-while-revalidate). `/login` y las rutas protegidas son dinámicas (`ƒ`) porque validan la cookie de sesión. |
| Estado servidor           | **TanStack Query v5**                                                                                                                                               | Gestiona gratis los estados que exige el brief: carga / error / vacío, reintentos, timeouts (`AbortSignal`), invalidación de saldo tras confirmar. Evita duplicar esa lógica a mano.                                                                                                                                                         |
| Estado cliente            | **Zustand v5**                                                                                                                                                      | Sobre **Context**: sin selectores provoca re-renders en todo el árbol y obliga a providers anidados. Sobre **Redux**: boilerplate (actions/reducers/slices) injustificado para 3–4 stores pequeños. Zustand da stores independientes, selectores finos, persistencia y DevTools con fricción mínima.                                         |
| Servicios                 | **Route Handlers `/api/*`** con DB en memoria (`src/server/`) y **motor de fault-injection**                                                                        | Cumple "API router con datos mockeados" y desacopla UI de datos: el día que haya backend real, solo cambia `src/server/` y los handlers; los contratos Zod y el cliente HTTP permanecen.                                                                                                                                                     |
| Formularios               | **react-hook-form + Zod 4 (`@hookform/resolvers`)**                                                                                                                 | RHF: rendimiento (uncontrolled, sin re-render por tecla). Zod: _schema-first_, una sola fuente de verdad que valida **en el cliente y en el API** (defensa en profundidad).                                                                                                                                                                  |
| Estilos                   | **Tailwind CSS v4** (config CSS-first con `@theme`) + **`prefers-color-scheme`**                                                                                    | v4: tokens de diseño en CSS, build más rápido. Modo oscuro vía media query del sistema: cero JS, sin FOUC ni hydration mismatch. Mobile-first para responsive.                                                                                                                                                                               |
| Fetching                  | `fetch` nativo + **cliente HTTP tipado** (`src/shared/lib/api-client.ts`)                                                                                           | Sin dependencias extra; errores normalizados a `ApiError`; una sola capa donde vivirán timeouts, headers y manejo de sesión.                                                                                                                                                                                                                 |
| Unit testing              | **Vitest 5 + React Testing Library + jest-dom + user-event**                                                                                                        | Mismo ecosistema Vite, rápido, ESM nativo. Foco en reglas de negocio puras, hooks (`renderHook`) y componentes críticos.                                                                                                                                                                                                                     |
| E2E                       | **Playwright**                                                                                                                                                      | Estándar de la industria, multi-navegador, mobile emulation, tracing.                                                                                                                                                                                                                                                                        |
| Calidad                   | ESLint 9 (flat config, `eslint-config-next`) + Prettier (+ plugin Tailwind) + `tsc --noEmit`                                                                        |                                                                                                                                                                                                                                                                                                                                              |
| Package manager / runtime | **npm** · Node ≥ 20.9 (LTS recomendado 22/24)                                                                                                                       |                                                                                                                                                                                                                                                                                                                                              |

---

## 2. Estructura de carpetas (Feature-Driven / Modular)

```
mini-wallet/
├── src/
│   ├── app/                          # THIN APP SHELL: solo rutas y entry-points
│   │   ├── (auth)/
│   │   │   └── login/page.tsx        # ruta pública
│   │   ├── (app)/                    # grupo PROTEGIDO (comparte layout + guardia)
│   │   │   ├── layout.tsx            # guardia de sesión server-side + chrome (nav, theme toggle)
│   │   │   ├── home/page.tsx         # saldo + movimientos + CTA
│   │   │   └── transactions/
│   │   │       ├── new/page.tsx      # wizard: monto → destinatario → resumen
│   │   │       └── [id]/receipt/page.tsx   # comprobante / resultado
│   │   ├── api/                      # "backend" mockeado (Route Handlers)
│   │   │   ├── auth/login/route.ts
│   │   │   ├── me/route.ts           # usuario + saldo
│   │   │   ├── contacts/route.ts     # favoritos (+ crear contacto)
│   │   │   ├── transactions/route.ts       # lista + creación (POST)
│   │   │   └── transactions/[id]/route.ts  # detalle de transacción
│   │   └── api/reset/route.ts              # reset de DB mockeada (solo NODE_ENV=test)
│   │   ├── layout.tsx                # root: Providers (Query, Theme)
│   │   ├── page.tsx                  # redirect según sesión
│   │   ├── globals.css               # tokens @theme, dark variant
│   │   ├── error.tsx / not-found.tsx
│   ├── features/                     # MÓDULOS AUTOCONTENIDOS (lógica + UI por dominio)
│   │   ├── auth/
│   │   │   ├── api/                  # llamadas a /api/auth
│   │   │   ├── components/           # LoginForm, etc.
│   │   │   ├── hooks/                # useLogin, useSession
│   │   │   ├── schemas.ts            # Zod: loginSchema
│   │   │   └── index.ts              # API PÚBLICO del módulo
│   │   ├── wallet/                   # home: saldo, movimientos
│   │   │   ├── api/ components/ hooks/ types.ts index.ts
│   │   ├── transactions/
│   │   │   ├── api/                  # queries + mutations (TanStack Query)
│   │   │   ├── components/           # wizard, resumen, comprobante, error states
│   │   │   ├── hooks/                # useTransactionDraft, useSendMoney
│   │   │   ├── lib/rules.ts          # REGLAS DE NEGOCIO PURAS (testeables sin UI)
│   │   │   ├── schemas.ts            # Zod: createTransactionSchema
│   │   │   └── index.ts
│   │   └── contacts/
│   │       ├── api/ components/ hooks/ schemas.ts index.ts
│   ├── shared/                       # código transversal (sin lógica de negocio)
│   │   ├── components/ui/            # Button, Input, Card, Skeleton, EmptyState, ErrorState…
│   │   ├── hooks/                    # useMediaQuery, etc.
│   │   ├── lib/                      # api-client, http errors, format (currency/date), id
│   │   ├── providers/                # ThemeProvider, QueryProvider
│   │   ├── stores/                   # Zustand: session.store, tx-draft.store
│   │   └── types/                    # contratos de dominio + ApiError
│   ├── server/                       # dominio mockeado — SOLO lo usan los Route Handlers
│       ├── db/                       # seed en memoria (user, account, contacts, txs, sessions) + resetDb()
│       ├── services/                 # auth, session, account, contacts, transaction…
│       ├── faults/                   # motor de fault-injection (latencia/errores aleatorios o forzados)
│       └── lib/                      # helpers HTTP (apiErrorResponse, readJsonBody, status por ErrorCode)
│   └── proxy.ts                      # rechazo temprano (ex-middleware) + captura de ?redirect=
├── e2e/                              # specs Playwright
├── playwright.config.ts · vitest.config.ts · vitest.setup.ts
├── eslint.config.mjs · .prettierrc · tsconfig.json · next.config.ts
└── ARCHITECTURE.md · README.md
```

### Por qué esta estructura

1. **`app/` delgado**: solo decisiones de enrutamiento (layouts, guards, `page.tsx` que componen features). Si una ruta crece, la lógica vive en su feature, no en la ruta.
2. **Feature-driven**: cada dominio (`auth`, `wallet`, `transactions`, `contacts`) es un módulo con `components/hooks/api/schemas` propios y un **`index.ts` como API público**. Nada de `components/` y `hooks/` globales gigantes que no escalan con equipos múltiples.
3. **Regla de dependencias** (arquitectura limpia):
   `app → features → shared`. Las features **no** se importan entre sí por dentro;
   si hace falta, se expone por su `index.ts`. `server/` queda aislado detrás de HTTP:
   el cliente nunca importa código del servidor mockeado.
4. **`server/` separado**: simula un backend real. Reemplazar mocks por APIs reales
   = tocar solo `src/server` + handlers; contratos, stores, hooks y UI no cambian.
5. **Convenciones Next**: route groups `(auth)`/`(app)` para separar públicos/protegidos
   sin afectar la URL; `_folder` privado si se necesita colocalizar algo no enrutable.

---

## 3. Contratos de datos e interfaces (TypeScript + Zod)

> Ya implementados en `src/shared/types/` y `src/features/*/schemas.ts`.
> Los schemas Zod son la fuente única de verdad: infieren los tipos TS y validan
> **en cliente (forms) y servidor (route handlers)**.

```ts
// ── Dominio ────────────────────────────────────────────────
type ISODateString = string;
type Currency = 'MXN';

interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string; // E.164, ej. "+525512345678"
}

interface Account {
  id: string;
  userId: string;
  balanceMinorUnits: number; // centavos: ENTEROS, nunca floats para dinero
  currency: Currency;
}

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isFavorite: boolean;
}

type TransactionStatus = 'pending' | 'completed' | 'failed';

interface Transaction {
  id: string;
  type: 'transfer_out' | 'recharge' | 'transfer_in';
  status: TransactionStatus;
  amountMinorUnits: number;
  recipientName: string;
  createdAt: ISODateString;
  reference: string; // id legible para el comprobante
}

// ── API ────────────────────────────────────────────────────
type ErrorCode =
  | 'VALIDATION_ERROR'      // 400: schema Zod falló
  | 'INVALID_CREDENTIALS'   // 401
  | 'RECIPIENT_REQUIRED'    // 422: regla de negocio
  | 'AMOUNT_INVALID'        // 422: monto ≤ 0 o no entero
  | 'INSUFFICIENT_FUNDS'    // 422: supera saldo disponible
  | 'RATE_LIMITED'          // 429
  | 'NETWORK_ERROR'         // fallo simulado de red
  | 'TIMEOUT'               // latencia excesiva simulada
  | 'UNKNOWN';              // fallback

interface ApiError {
  code: ErrorCode;
  message: string;          // apta para mostrar al usuario
  details?: unknown;        // ej. issues de Zod
}

// ── DTOs (validados con Zod en ambos extremos) ─────────────
// POST /api/auth/login
LoginRequest  { identifier: string }              // email o teléfono
LoginResponse { user: User; account: Account }    // + cookie httpOnly de sesión

// GET /api/me            → { user: User; account: Account }
// GET /api/contacts      → { contacts: Contact[] }
// POST /api/contacts     → NewContactRequest → { contact: Contact }
// GET /api/transactions  → { transactions: Transaction[] }
// POST /api/transactions → CreateTransactionRequest → { transaction: Transaction }

CreateTransactionRequest =
  | { amountMinorUnits: number; recipientId: string }                    // favorito existente
  | { amountMinorUnits: number; newRecipient: { name: string;           // contacto nuevo
      phone?: string; email?: string } };
```

### Reglas de negocio (funciones puras — `features/transactions/lib/rules.ts`)

| Regla                    | Implementación                                   | Error                |
| ------------------------ | ------------------------------------------------ | -------------------- |
| Monto mínimo             | `amountMinorUnits` entero > 0                    | `AMOUNT_INVALID`     |
| Saldo suficiente         | `amountMinorUnits <= balanceMinorUnits`          | `INSUFFICIENT_FUNDS` |
| Destinatario obligatorio | `recipientId` o `newRecipient` presente y válido | `RECIPIENT_REQUIRED` |

Se ejecutan **en el cliente** (feedback inmediato en el wizard) **y en el API**
(nunca confiar en el cliente). Al ser puras, se testean sin React.

---

## 4. Estrategia de estado global y enrutamiento

### Rutas

| Ruta                         | Acceso    | Render                                         |
| ---------------------------- | --------- | ---------------------------------------------- |
| `/login`                     | Pública   | Shell RSC dinámico (lee sesión) + form cliente |
| `/home`                      | Protegida | Shell RSC + datos CSR (Query)                  |
| `/transactions/new`          | Protegida | Wizard cliente (borrador en Zustand)           |
| `/transactions/[id]/receipt` | Protegida | Comprobante (Query por id)                     |
| `/`                          | —         | Redirect: sesión → `/home`, si no → `/login`   |

- **Protección**: guardia en el **`layout.tsx` server del grupo `(app)`**: valida la
  cookie httpOnly `mw_session` contra la sesión en memoria y hace `redirect('/login')`
  si no es válida. Es el patrón recomendado de App Router: cubre **todas** las rutas
  del grupo, incluidas las futuras. Además, **`src/proxy.ts`** (ex-`middleware.ts`
  en Next 16, runtime Node) hace rechazo temprano de usuarios sin cookie y captura
  el destino en `?redirect=`, de modo que tras el login el usuario vuelve a la ruta
  que quería visitar (`sanitizeRedirect` evita open redirects). El proxy solo mira
  presencia de cookie; la validación real del token vive en el layout.
- **Sesión mockeada**: `POST /api/auth/login` valida contra el seed y setea la
  cookie httpOnly. `logout` la borra. No busca seguridad real, sí la _estructura_
  correcta (cookie httpOnly + guardia server, no localStorage).

### Estado global — qué va en cada capa

| Capa                                 | Contenido                                                                                                                   | Motivo                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **TanStack Query** (estado servidor) | saldo, movimientos, contactos, resultado de confirmar (mutation con `retry`, timeout via `AbortSignal`, `gcTime/staleTime`) | Cache + sincronización + estados loading/error/empty declarativos; invalidar `me`/`transactions` al confirmar |
| **Zustand** (estado cliente)         | `session.store` (snapshot user para UI), `tx-draft.store` (borrador del wizard: monto, destinatario, paso)                  | El borrador sobrevive a navegación entre pasos/refresh; selectores finos sin re-render global                 |
| **`prefers-color-scheme`** (CSS)     | tema claro/oscuro                                                                                                           | Lo decide el sistema operativo; sin JS, sin FOUC ni hydration mismatch                                        |
| **URL**                              | paso del wizard opcional, `?redirect=`                                                                                      | Estado compartible/navegable                                                                                  |
| **React state local**                | inputs de formularios (vía RHF), toggles de UI                                                                              | Lo que no se comparte, no se globaliza                                                                        |

### Escenarios de confirmación (aleatoriedad controlada)

**Solo `POST /api/transactions` (la confirmación de transferencia) tiene
comportamiento aleatorio.** Por defecto responde ponderado entre los 5 escenarios
del brief — **éxito, error de red, fondos insuficientes, timeout, error
desconocido** — respetando siempre las reglas de negocio primero. El resto de
endpoints (`GET /api/me`, `GET /api/contacts`, `GET /api/transactions`,
`GET /api/transactions/[id]`, `POST /api/auth/login`, `POST /api/contacts`) son
**deterministas**: responden `success` sin latencia, de modo que home, login y el
paso de destinatario no fallen ni tarden al azar.

Para tests E2E/unitarios cualquier endpoint puede **forzarse de forma determinista**
con el header `x-fault: success | network | timeout | unknown | insufficient_funds |
invalid_credentials`, de modo que cada escenario sea reproducible. El timeout se
simula server-side (`MW_MOCK_TIMEOUT_MS`, default 6000) y la latencia aleatoria con
`MW_MOCK_LATENCY` (escala, default 1; `0` en tests). Los pesos viven en presets por
tipo de endpoint (`READ_FAULTS`, `WRITE_FAULTS`, `LOGIN_FAULTS`,
`TRANSACTION_FAULTS`). La UI mapea `ErrorCode → pantalla`: éxito → comprobante;
red/timeout → estado de error con **Reintentar** (misma mutation); fondos
insuficientes → mensaje descriptivo; resto → fallback genérico.

---

## 5. Roadmap por fases

| Fase                                   | Entregables                                                                                                                                                                                                                                                                                 | Validación                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **0 — Bootstrap** ✅ _(este scaffold)_ | Proyecto Next 16 + TS strict + Tailwind v4; Vitest/Playwright/Prettier configurados; esqueleto feature-driven; contratos (`shared/types`, schemas Zod) y `rules.ts` con tests unitarios; tokens dark mode                                                                                   | `lint`, `test`, `build` en verde                                                                                       |
| **1 — Mock API** ✅                    | `src/server/` (db seed + singleton `globalThis`, services, fault-injection) + Route Handlers (`login`, `logout`, `me`, `contacts`, `transactions`) con validación Zod server-side; `api-client` tipado en `shared/lib`                                                                      | Tests de services/handlers + `curl` manual ✅                                                                          |
| **2 — Auth** ✅                        | `/login` con `LoginForm` (RHF + Zod, estados carga/error simulado vía fault-injection), guardia `(app)` + `proxy.ts` con `?redirect=` sanitizado, `session.store` (Zustand), logout, redirects en `/` y `/login`                                                                            | 112 unit (proxy, store, sanitizeRedirect, LoginForm) + **12 E2E** Playwright (chromium + mobile) ✅                    |
| **3 — Home** ✅                        | `/home`: saldo (jerarquía visual arriba), movimientos recientes con carga/vacío/error (`HomeSkeleton`, `EmptyState`, `ErrorState`), CTAs grandes, responsive, dark mode según sistema; UI base (`Button`, `Card`, `Skeleton`, `Badge`) y hooks `useMe`/`useTransactions` con TanStack Query | 127 unit + **18 E2E** (incluye error `/api/me`) ✅                                                                     |
| **4 — Nueva transacción** ✅           | Wizard `/transactions/new`: monto → destinatario (favoritos + nuevo contacto persistido en mock) → resumen; `tx-draft.store`; reglas de negocio aplicadas en cliente; `GET /api/transactions/[id]`; páginas `/transactions/new` y `/transactions/[id]/receipt`                              | Unit: rules + draft store + wizard components; E2E: flujo completo y validaciones                                      |
| **5 — Confirmación** ✅                | Mutation `useSendTransaction` con los 5 escenarios (aleatorio + header determinista), comprobante `/transactions/[id]/receipt`, reintentos, invalidación de saldo/movimientos tras éxito                                                                                                    | E2E: cada escenario forzado con `x-fault` ✅                                                                           |
| **6 — Testing & a11y** ✅              | Cobertura de componentes críticos (RTL), suite E2E completa (desktop + mobile viewport), accesibilidad (contraste, foco, roles, `aria-invalid`/`aria-describedby`, `role="alert"`, skip link)                                                                                               | **163 unit tests** + cobertura ≥ 80 % statements/branches/functions/lines; **34 E2E** Playwright (desktop + mobile) ✅ |
| **7 — Hardening** ✅                   | `loading.tsx` globales y por ruta para shell instantáneo, CI con GitHub Actions (lint + typecheck + tests + coverage + build + E2E), auditoría Lighthouse                                                                                                                                   | `/login`: Performance 96 · Accessibility 95 · Best Practices 100 · SEO 100 ✅                                          |

### Convenciones de código

- Dinero siempre en **minor units enteros**; formateo solo en el borde (UI) con `formatCurrency()`.
- Componentes: Server Components por defecto; `'use client'` solo en hojas interactivas.
- Imports con alias `@/` → `src/`; entre features solo vía `index.ts`.
- Nombres: `kebab-case` para archivos, `PascalCase` para componentes, `use*` para hooks.
- Tests colocalizados (`*.test.ts(x)` junto al código); E2E en `e2e/`.
- Cada PR: `npm run lint && npm run typecheck && npm test` en verde.

---

## Comandos

```bash
npm run dev            # dev server (Turbopack) → http://localhost:3000
npm run build          # build de producción
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm test               # Vitest (unit) — watch: npm run test:watch
npm run test:coverage  # Vitest con reporte de cobertura
npm run test:e2e       # Playwright (primera vez: npx playwright install)
npm run lighthouse     # Lighthouse sobre /login (hace build y levanta producción)
npm run format         # Prettier
```
