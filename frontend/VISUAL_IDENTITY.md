# Radar Financiero — Identidad visual y reglas de interfaz

Estado: propuesta aprobada por el propietario el 16/10/2026 e implementada en la rama `feat/dashboard-visual-identity`. Esta rama se prueba antes de integrarla a `main`.

Referencia visual: https://radar-financiero-concepto.handypin16.chatgpt.site
La referencia usa datos ilustrativos. El frontend Angular de esta rama sigue conectado a los servicios existentes; no copiar valores de ejemplo al producto.

## Dirección de marca

Una terminal financiera clara, sobria y accesible para consultar el mercado argentino. Nombre: **Radar Financiero**. Descriptor: **El mercado, en perspectiva**. Encabezado del dashboard: **Tu panorama del mercado.**

Mantener el fondo azul noche, tarjetas ligeramente más claras, una marca celeste y números protagonistas. La versión móvil es una experiencia de primera clase, no una versión reducida de escritorio.

No incorporar efectos de cursor, neón, sombras extensas, glassmorphism, emojis decorativos, animaciones constantes ni tarjetas que aparenten ser clickeables sin tener acción. Usar el radar SVG de la cabecera como símbolo; los iconos deben compartir grosor y estilo. No depender de una fuente remota para el logo.

## Tokens y fuente de verdad

`src/dashboard-theme.css` contiene los tokens y primitivas del dashboard, acotados por `.rf-dashboard`. `src/styles.css` importa ese archivo. Los estilos antiguos de Tailwind siguen disponibles para las otras pantallas; no extender la paleta antigua al nuevo dashboard ni cambiar páginas administrativas incidentalmente.

| Token        | Color     | Uso                               |
| ------------ | --------- | --------------------------------- |
| `--rf-bg`    | `#0B1220` | Fondo principal                   |
| `--rf-card`  | `#151F30` | Tarjetas y paneles                |
| `--rf-text`  | `#E8EEF7` | Texto y precios principales       |
| `--rf-muted` | `#A6B3C6` | Etiquetas, fuentes y contexto     |
| `--rf-line`  | `#263246` | Bordes y separadores              |
| `--rf-blue`  | `#62B5F5` | Marca, foco, selección y acciones |
| `--rf-up`    | `#54D5A2` | Variación positiva                |
| `--rf-down`  | `#FF8092` | Variación negativa y error        |

Verde/rojo deben expresar significado, no decorar el precio de venta del dólar. Las variaciones siempre llevan signo; cero utiliza estilo neutral. La última TNA usa celeste como dato destacado, sin sugerir rentabilidad garantizada ni premiar la tasa máxima.

## Tipografía y espaciado

- Inter, con `system-ui` y `sans-serif` de fallback. Texto habitual de 14–16 px.
- H1: 29 px escritorio, 26 px móvil. H2: 17/16 px. Pesos 500–700.
- Precios de dólar: 27 px; TNA: 31/28 px; cripto: 23/20 px, adaptable a valores largos.
- Metadatos 11–12 px; no usar estos tamaños para precios o controles principales. No reducir texto para esconder desbordamientos.
- `font-variant-numeric: tabular-nums` en valores y tablas. Precios y porcentajes alineados a la derecha.
- Contenedor de hasta 1320 px; márgenes internos de 36 px, 24 px en tablet y 18 px en móvil (12 px a 360 px o menos).
- Espaciado basado en 4 px: 8, 12, 16, 24, 32. Bordes de 1 px, tarjetas de radio 12 px.
- Evitar títulos extensos en mayúsculas. Reservarlas para siglas financieras y el descriptor de marca.

## Estructura y responsive

Orden DOM y visual compartido: cabecera → introducción/estado → dólares → cauciones → ETFs y ranking → criptomonedas → herramientas → pie.

| Bloque         | Escritorio                             | Hasta 700 px                                                      |
| -------------- | -------------------------------------- | ----------------------------------------------------------------- |
| Navegación     | Marca, enlaces y estado en una fila    | Marca y enlaces en una segunda fila; estado/fecha en introducción |
| Dólares        | Cinco columnas                         | Dos columnas; tarjeta ocupa todo el ancho final                   |
| Cauciones      | Descripción, última TNA y estadísticas | Descripción y TNA; estadísticas debajo                            |
| ETFs / CEDEARs | Dos paneles de igual ancho             | Paneles apilados, mismo contenido                                 |
| Criptos        | Cuatro columnas; dos bajo 1100 px      | Dos columnas, gráficos debajo del precio                          |
| Herramientas   | Dos columnas                           | Una columna                                                       |

Usar `minmax(0, 1fr)` y `min-width: 0` en grids. No ocultar desbordamientos globalmente para disimular errores. Nombres largos pueden envolver; el ticker sigue siendo protagonista. No duplicar el DOM con una tabla distinta para móvil. Los datos disponibles no desaparecen por tamaño de pantalla.

## Reglas por componente

### Dólares

Venta como número principal; compra secundaria con etiqueta explícita. Tarjeta muestra referencia, sin inventar precio de compra. Moneda ARS visible. Brecha blue/oficial calculada por el servicio y visible incluso si es 0. Datos ausentes se representan con `—`, no con una cotización ficticia. Mostrar actualización y advertencia de caché cuando la fuente lo indique.

### Cauciones

Identificar plazo y TNA. Última tasa destacada; mínima, promedio y máxima como contexto. No usar el fuego del diseño anterior. El timestamp corresponde a la fuente de cauciones, no al cierre de CEDEARs. Un error de red o falta de tasa no se presenta como una inversión al 0%.

### ETFs y movimientos

Etiquetar `ETFs vía CEDEARs` y `Precio ARS`: el proveedor actual filtra cotizaciones locales en pesos. Si el backend cambia para entregar activos USA en USD, actualizar modelo y etiquetas antes de mostrarlos; no asumir moneda por ticker. Ticker primero, descripción debajo. Columnas: instrumento, precio, variación diaria. `Subas` / `Bajas` son botones de selección con estado accesible. Fuente y cierre se consultan con `details/summary`, también desde teclado y touch.

### Criptomonedas

Precios USD y variación de **24 horas**. El backend actual proporciona `sparkline_in_7d`; etiquetar gráficos como **7 días**, nunca como 24 h. Línea celeste neutral para no confundir el signo de 24 h con la evolución semanal. No dibujar una línea de ejemplo si no hay historial. Separar gráfico y texto; no superponerlos.

Edición inline mediante botón `Editar selección`. Máximo 4 activos, límite visible y resultados no seleccionables deshabilitados cuando se alcanza. Quitar activos mediante botones con nombre accesible. Permitir selección vacía con acción para agregar. Mantener búsqueda con debounce y cancelación de consultas. Los cambios usan `DashboardDataService.updateCryptoSelection`; no reemplazar con un catálogo estático.

### Herramientas

Conservar URLs obtenidas de `AppConfigService`. Texto explica qué hace cada bot y que abre Telegram. Links externos usan `target="_blank"` y `rel="noopener noreferrer"`. No copiar al producto los links de prueba de tests.

## Datos, formatos y estados

- Locale `es-AR`: miles con punto y decimales con coma. `CurrencyFormatterPipe` conserva ARS/USD y precisión de monedas pequeñas.
- Fechas en `America/Argentina/Buenos_Aires`, con fecha y sufijo ART. No decir “hoy” para caché de jornadas anteriores.
- Distinguir carga inicial, actualización, error, vacío y caché. No reemplazar errores de API con datos inventados.
- Mantener servicios, endpoints, polling y configuración del backend. El concepto visual no implica cambios a integraciones.
- Un fallo de mercado se etiqueta como estado no disponible; no presentarlo como mercado abierto.
- No interpretar precios, subas o rankings como recomendación de inversión.

## Accesibilidad

- Semántica nativa: encabezados, regiones, tablas con caption y `scope`, botones y enlaces reales.
- Controles touch de aproximadamente 44 px; tabs de ranking de 40 px con separación y foco visible.
- Foco celeste visible; enlace para saltar al contenido. Nunca eliminar outline sin alternativa.
- Color acompañado por signo, etiqueta o texto. Contraste AA como objetivo y revisión con valores finales.
- Inputs con label; expansión con `aria-expanded`; selección con `aria-pressed`.
- Fuentes y ayuda accesibles sin hover. Texto alternativo para gráficos; iconos decorativos con `aria-hidden`.
- Respetar `prefers-reduced-motion`. Zoom al 200% no debe ocultar las acciones.

## Mapa de implementación

- `src/dashboard-theme.css`: tokens, layout, componentes y breakpoints.
- `features/dashboard/pages/dashboard-shell`: cabecera, navegación, orden y estado del mercado.
- `features/dashboard/components/*`: templates conectados a signals existentes.
- `features/dashboard/services/dashboard-data.service.ts`: se conserva polling; se transporta además el timestamp de cauciones.
- `src/main.ts` y `app.config.ts`: registro/provisión de locale argentino.
- `dashboard-shell.spec.ts`: verificación integrada con respuestas controladas, sin llamadas externas.

Todas las rutas `features/...` anteriores son relativas a `src/app/`.

## Cómo probar esta rama

Desde la raíz del repositorio:

```bash
git fetch origin
git switch feat/dashboard-visual-identity
cd frontend
npm ci
npm start
```

Abrir `http://localhost:4200/dashboard`. El entorno de desarrollo existente espera el backend en `http://localhost:3000/api`; iniciarlo con su configuración habitual. Sin backend se pueden verificar los estados de error, pero no las cotizaciones reales. Para pruebas desde un teléfono, recordar que `localhost` apunta al propio teléfono; usar el mecanismo de acceso local/proxy del proyecto, no cambiar silenciosamente los endpoints de producción.

```bash
npm run build -- --configuration development
npm test -- --watch=false
```

El build de producción requiere `src/environments/environment.prod.ts`, generado por el flujo de despliegue existente y excluido de Git. No agregar secretos ni generar una configuración productiva ficticia para hacer pasar el build.

## Checklist manual antes de integrar

- [ ] 320, 360, 390, 430, 768, 1024 y 1440 px sin scroll horizontal global.
- [ ] Safari iOS y Chrome Android reales, además de emulación desktop.
- [ ] Cinco dólares legibles; tarjeta a ancho completo en móvil.
- [ ] Valores grandes, cripto de precio pequeño y nombres largos sin solapamientos.
- [ ] Subas/bajas, editor cripto, selección vacía, límite de 4, búsquedas vacías y sin resultados.
- [ ] Navegación completa por teclado; foco visible; zoom 200%; movimiento reducido.
- [ ] Backend conectado: actualización, errores parciales, mercado abierto/cerrado, cierre anterior y caché.
- [ ] Los links de Telegram corresponden a la configuración del entorno.

## Validación de esta entrega

Se ejecutan compilación Angular y tests de integración con datos controlados. La revisión visual en navegador móvil real queda pendiente; los tests de DOM no validan medidas o renderizado CSS. No desplegar ni fusionar la rama como parte de una simple revisión de identidad.

## Reglas para próximos agentes y colaboradores

1. Leer este documento antes de modificar el dashboard.
2. Tomar los tokens de `dashboard-theme.css`; no crear colores equivalentes por componente.
3. Preservar datos reales, señales, estados y configuración; no incrustar datos de la maqueta.
4. Mantener igual funcionalidad en escritorio y móvil y actualizar este documento ante cambios de diseño aprobados.
5. Validar compilación, interacciones afectadas y anchos relevantes; comunicar límites de verificación.
6. Trabajar en rama y dejar cambios revisables; no integrar ni desplegar sin la instrucción correspondiente.
