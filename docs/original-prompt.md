Actúa como un Arquitecto de Software Frontend Senior y experto en React + NextJs + TypeScript + Vite
Quiero crear la arquitectura inicial para un proyecto frontend llamado "Mini Wallet Web App".

El propósito de la aplicación es: Una mini wallet que simule un flujo básico de una
wallet financiera. Login → Home → Nueva Transacción → Confirmación / Comprobante
La web app no necesita conectarse a servicios reales — los datos serán mockeados.
Contexto: El sistema opera en un entorno de alto volumen con millones de
usuarios activos. Dame opciones de diseño que consideren escalabilidad y
mantenibilidad.

Las funcionalidades clave que tendrá son:

1. Login:
   Formulario: Teléfono o email
   Validaciones: Formato de entrada, campos requeridos
   Estados: Carga, error simulado
   Sesión: Persistencia simple de sesión mockeada
   Navegación: Al Home después del login exitoso
   Nota: No se busca seguridad ni autenticación real. Se busca validar estructura, estado, validación, navegación y separación de responsabilidades
2. Home
   Datos: Saldo disponible + nombre del usuario (mockeado)
   Movimientos: Lista de movimientos recientes
   Estados: Carga, vacío y error
   Acción: Botón para iniciar nueva transacción
   Nota: Aquí se valida composición de componentes, listas, estado, diseño responsivo y manejo de información asincrónica.
3. Nueva Transacción: Se debe implementar un flujo de envío de dinero:
   Funcionalidad base:
   Ingresar monto.
   Seleccionar un contacto de la lista de favoritos o ingresar manualmente un nuevo contacto y guardarlo (mockeado)
   Mostrar resumen antes de confirmar.
   Confirmar transacción con respuesta mockeada.
   Mostrar comprobante o pantalla de éxito.
   Reglas de Negocio
   La web app debe implementar las siguientes validaciones antes de confirmar la transacción:
   Monto mínimo: No se permite monto cero ni negativo.
   Saldo suficiente: El monto no puede superar el saldo disponible.
   Destinatario obligatorio: No se puede confirmar sin destinatario.
   Haz esto con las mejores practicas de la industria.

4. Confirmación: Se deberá generar una pantalla de confirmación que debe funcionar de manera aleatoria.
   Éxito: Transacción confirmada, mostrar comprobante
   Error de red: Mostrar estado de error con opción de reintentar
   Fondos insuficientes: Mostrar error descriptivo
   Timeout: Manejar espera excesiva
   Error desconocido: Fallback genérico
   La web app debe manejar estos escenarios — no solo el happy path.

5. Interfaz Limpia y Funcional
   Jerarquía de información: Coloca el saldo total y las acciones principales (enviar, recibir, recargar) en la parte superior y más visible.
   Visualización de datos: Usa gráficos simples o barras de progreso para mostrar movimientos o historiales de transacciones sin saturar la pantalla.
   Modo oscuro/claro: Imprescindible para aplicaciones web financieras que se usan a cualquier hora.
   Accesibilidad y Navegación
   Diseño Adaptable (Responsive): Aunque sea una app web, gran parte de los usuarios ingresarán desde navegadores móviles; el diseño debe ajustarse con fluidez a pantallas pequeñas y grandes.
   Llamados a la acción (CTA) evidentes: Botones grandes y contrastados para las operaciones frecuentes como transferir.

Quiero que utilices las mejores prácticas de la industria (Clean Architecture, desacoplamiento de UI y lógica, y escalabilidad). Por favor, entrégame:

1. **Stack Tecnológico Detallado:** Justifica brevemente las librerías ideales para este caso específico
   Rendering: Considera el uso de SSR, CSR o combinados en ciertas páginas
   Estructura de Navegación: App Route de Nextjs
   Manejo de estado: Con el contexto de la app dime pros y contras entre (Context, Zustand, Redux, etc.) Para mi el ideal es Zustand para el estado del cliente.
   Servicios: Uso de API router con datos mockeados.
   Testing: Creacion de testing unitario de validaciones, hooks y componentes críticos.
   E2E Testing: Creacion de testing e2e con playwright.
   Estilos: Tailwind css
   Validación de formularios,
   Fetching de datos
2. **Estructura de Carpetas Extensible:** Muestra el árbol de directorios detallado enfocado en [Feature-Driven Development / Arquitectura Modular] explicando el porqué de esa estructura.
3. **Contratos de Datos e Interfaces Básicas:** Define los modelos de TypeScript clave basados en las funcionalidades que te di.
4. **Estrategia de Estado Global y Enrutamiento:** Cómo estructurarías las rutas (públicas/protegidas) y qué lógica irá al estado global.
5. **Plan de Acción "Paso a Paso" (Roadmap):** Divide el desarrollo en sprints o fases lógicas para construir el proyecto sin abrumarme.

No escribas código de componentes visuales todavía, enfócate puramente en la arquitectura, configuración inicial y diseño del sistema.
