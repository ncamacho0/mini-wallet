# Mini Wallet Web App

![CI](https://github.com/ncamacho0/mini-wallet/actions/workflows/ci.yml/badge.svg)

Mini wallet que simula el flujo básico de una wallet financiera:
**Login → Home → Nueva Transacción → Confirmación / Comprobante** (datos 100 % mockeados).
Construida con Next.js + TypeScript para el mercado de **México** (MXN, `es-MX`).

## Documentación

| Documento                                            | Contenido                                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                 | Stack justificado, estructura feature-driven, contratos, estado global, enrutamiento y roadmap por fases |
| [DECISIONS.md](./DECISIONS.md)                       | Decisiones de diseño, separación UI/lógica, edge cases y qué haría diferente con más tiempo              |
| [AI_USAGE.md](./AI_USAGE.md)                         | Uso de herramientas de IA durante el desarrollo                                                          |
| [docs/original-prompt.md](./docs/original-prompt.md) | Prompt original del que se derivó la arquitectura (trazabilidad)                                         |

## Stack y librerías

| Capa             | Tecnología                             | Versión    | Por qué                                                            |
| ---------------- | -------------------------------------- | ---------- | ------------------------------------------------------------------ |
| Framework        | Next.js (App Router, Turbopack)        | 16.3       | Requisito del challenge; RSC + Route Handlers + `proxy.ts`         |
| UI               | React                                  | 19.2       | Server Components y `use client` solo en hojas interactivas        |
| Lenguaje         | TypeScript (strict)                    | 5.x        | Modelos de dominio y contratos sin `any`                           |
| Estilos          | Tailwind CSS                           | 4.x        | Tokens en CSS (`@theme`), dark mode por `prefers-color-scheme`     |
| Estado servidor  | TanStack Query                         | 5.x        | Cache, retries, timeouts y estados loading/error/empty             |
| Estado cliente   | Zustand                                | 5.x        | Stores pequeños con selectores finos (sesión, borrador del wizard) |
| Formularios      | react-hook-form + @hookform/resolvers  | 7.x / 5.x  | Formularios uncontrolled y performantes                            |
| Validación       | Zod                                    | 4.x        | Schemas como fuente única de verdad (cliente y servidor)           |
| Testing unitario | Vitest + Testing Library               | 5.x / 16.x | Rápido, ESM nativo, foco en reglas y componentes                   |
| Testing E2E      | Playwright                             | 1.63       | Multi-navegador y emulación móvil                                  |
| Calidad          | ESLint 9 + Prettier 3                  | —          | Lint y formato consistentes                                        |
| Auditoría        | Lighthouse + chrome-launcher           | 13.x / 1.x | Gate de performance/accesibilidad en CI local                      |
| Runtime          | Node.js ≥ 20.9 (recomendado 22/24 LTS) | —          | Requisito de Next 16                                               |

## Requisitos

- Node.js ≥ 20.9 (recomendado 22 o 24 LTS)
- npm
- Chrome o Chromium instalado (solo para `npm run lighthouse`)

## Instalación y ejecución

```bash
npm install              # instalar dependencias
npm run dev              # dev server (Turbopack) → http://localhost:3000
```

Para probar el build de producción:

```bash
npm run build
npm run start            # http://localhost:3000
```

### Credenciales demo

Cualquier identificador con formato válido inicia sesión como el usuario demo
(no hay autenticación real, por diseño):

- Email: `noel@example.com`
- Teléfono: `+525512345678`

### Simular errores manualmente

El backend mockeado acepta el header `x-fault` para forzar escenarios deterministas:

```bash
# 1) login para obtener la cookie de sesión
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "content-type: application/json" \
  -d '{"identifier":"noel@example.com"}'

# 2) forzar un escenario en la confirmación
# escenarios: success | network | timeout | unknown | insufficient_funds | invalid_credentials
curl -b cookies.txt -X POST http://localhost:3000/api/transactions \
  -H "content-type: application/json" \
  -H "x-fault: insufficient_funds" \
  -d '{"amountMinorUnits":100000,"recipientId":"cnt_1001"}'
```

Variables de entorno opcionales: `MW_MOCK_LATENCY` (escala de latencia, default `1`) y
`MW_MOCK_TIMEOUT_MS` (delay del escenario timeout, default `6000`).

## Comandos

```bash
npm run dev              # dev server (Turbopack)
npm run build            # build de producción
npm run start            # servidor de producción
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm test                 # Vitest (unitarios, una corrida)
npm run test:watch       # Vitest en modo watch
npm run test:coverage    # Vitest + reporte de cobertura (umbrales 80/75)
npx playwright install   # browsers (solo la primera vez)
npm run test:e2e         # Playwright (E2E)
npm run test:e2e:ui      # Playwright en modo UI interactivo
npm run lighthouse       # Lighthouse sobre /login (hace build y levanta producción)
npm run format           # Prettier (escribe)
npm run format:check     # Prettier (verifica)
```

## Estructura

```
src/
├── app/        # rutas (App Router) — delgado: solo entry-points y layouts
├── features/   # módulos por dominio: auth, wallet, transactions, contacts
├── shared/     # UI base, lib, providers, stores, types
└── server/     # dominio mockeado (db en memoria, services, fault-injection)
public/         # assets estáticos
e2e/            # specs de Playwright
scripts/        # auditoría Lighthouse
```

Regla de dependencias: `app → features → shared`. El cliente nunca importa
`src/server`; todo pasa por los Route Handlers de `/api/*`.

## Testing

- **Unitarios:** 165 tests en 39 archivos (Vitest + Testing Library) — reglas de
  negocio puras, servicios, route handlers, hooks y componentes críticos.
- **Cobertura:** statements 89 %, branches 79 %, functions 84 %, lines 91 %
  (umbrales mínimos: 80/75/80/80).
- **E2E:** 36 tests en 5 specs (Playwright, chromium + emulación móvil) — login,
  home, flujo completo de envío, errores forzados y accesibilidad.
- Los E2E corren en serie (`workers: 1`) porque comparten la DB mockeada en memoria;
  los unitarios sí corren en paralelo.

## Limitaciones conocidas

- **Datos mockeados en memoria:** se reinician al reiniciar el servidor; no hay
  persistencia, concurrencia real ni multi-usuario.
- **Login sin contraseña:** cualquier identificador válido entra como el usuario demo
  (decisión intencional del challenge; no es un sistema de autenticación real).
- **Sin paginación:** `GET /api/transactions` acepta `limit`, pero no hay cursor ni
  scroll infinito.
- **Solo MXN / `es-MX`:** moneda, locale, teléfonos (+52) y SPEI están fijados a México;
  no hay i18n formal.
- **Tema claro/oscuro:** sigue la preferencia del sistema operativo; no hay toggle
  manual persistido (se priorizó evitar hydration mismatches).
- **`RATE_LIMITED`:** está en la taxonomía de errores pero ningún endpoint lo dispara.
- **E2E de escenarios:** `network` e `insufficient_funds` están forzados en E2E;
  `timeout` y `unknown` solo tienen cobertura unitaria.
- **Lighthouse:** audita `/login` (pública); `/home` requiere sesión y no está en el gate.
- **CI:** el badge apunta al repositorio remoto, que debe existir una vez se publique.

## Tiempo invertido

**Total: 18 horas.**

- **4 h — Arquitectura:** redacción de `ARCHITECTURE.md` a partir de un prompt y de los
  requisitos del challenge (stack, estructura feature-driven, contratos, estado y
  roadmap por fases).
- **14 h — Implementación y refinamiento:** ejecución de las fases del plan (bootstrap,
  API mockeada, auth, home, wizard de transacción, confirmación/comprobante, testing y
  hardening), revisión de la funcionalidad esperada e iteraciones corrigiendo errores
  encontrados.

## Uso de IA

Ver [AI_USAGE.md](./AI_USAGE.md).
