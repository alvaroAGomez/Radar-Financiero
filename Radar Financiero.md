# Radar Financiero – Documento Técnico y

# Funcional Completo

Radar Financiero es una plataforma financiera moderna enfocada en visualización rápida de
información relevante, con estética tipo dashboard financiero profesional y actualización casi en tiempo
real. El proyecto nace con el objetivo de centralizar información de mercados, criptomonedas, dólar,
CEDEARs, cauciones y herramientas automatizadas dentro de un mismo ecosistema visual y técnico.
La plataforma está pensada desde el inicio para soportar:

- Versión web responsive.
- Versión mobile.
- Futuro desarrollo como PWA.
- Integración con bots financieros.
- Alertas y automatizaciones.
- Escalabilidad hacia funcionalidades premium.

## 1. Objetivos del Proyecto

- Centralizar información financiera relevante.
- Crear una experiencia rápida y visual.
- Desarrollar un dashboard moderno tipo terminal financiera.
- Construir una arquitectura modular y escalable.
- Servir como núcleo para herramientas y bots financieros.
- Ofrecer excelente experiencia desktop y mobile.

## 2. Público Objetivo

- Usuarios interesados en finanzas personales.
- Usuarios que siguen dólar y criptomonedas diariamente.
- Inversores retail argentinos.
- Usuarios que consumen bots financieros.
- Usuarios que priorizan información rápida desde el celular.


## 3. Funcionalidades Principales del MVP

- Panel de cotización del dólar.
- Panel configurable de criptomonedas.
- Selector de cryptos con búsqueda.
- Panel de tasas de cauciones.
- Panel de mercado USA y CEDEARs.
- Radar de oportunidades financieras.
- Sección de herramientas y bots.
- Actualización automática cada 2 minutos.
- Cache backend para minimizar requests.
- Diseño completamente responsive.

## 4. Diseño Visual y UX/UI

La estética visual es un componente importante del producto. El diseño toma inspiración de terminales
financieras modernas, dashboards bursátiles y paneles compactos tipo trading. Características
visuales:

- Modo oscuro como interfaz principal.
- Paneles compactos horizontales.
- Indicadores visuales de suba y baja.
- Uso intensivo de colores para estados.
- Jerarquía visual clara.
- Información rápida y fácil de leer.
- Diseño moderno y tecnológico.
- Distribución tipo tablero financiero.
- Tipografía clara y contrastes altos.

## 5. Distribución Visual del Dashboard

La estructura visual principal del dashboard debe respetar la siguiente jerarquía:

- Header compacto superior.
- Bloque principal de cotización del dólar.


- Fila secundaria: Cauciones y CEDEARs.
- Bloque de criptomonedas configurable.
- Radar de oportunidades.
- Herramientas y bots.

## 6. Responsive y Experiencia Mobile

El proyecto debe desarrollarse obligatoriamente contemplando responsive real y experiencia
mobile-first. Consideraciones importantes:

- Adaptación total a celulares.
- Cards reorganizadas automáticamente.
- Touch friendly.
- Tipografías legibles en pantallas pequeñas.
- Optimización de rendimiento móvil.
- Preparación futura para PWA o app híbrida.

## 7. Stack Tecnológico Propuesto

```
Capa Tecnología sugerida
Frontend Angular + TailwindCSS
Backend NestJS
Lenguaje TypeScript
Deploy inicial Google Cloud VM e2-micro
Cache Memory Cache / Redis futuro
Scheduler Nest Schedule / Cron Jobs
HTTP Client Axios / HttpModule
Diseño UI TailwindCSS
```
## 8. Arquitectura Backend

El backend funcionará como capa intermedia entre el frontend y las APIs externas. Responsabilidades:

- Consumir APIs externas.
- Normalizar respuestas.
- Aplicar cache.


- Gestionar fallbacks entre APIs.
- Evitar problemas de CORS.
- Centralizar logs de errores.
- Preparar endpoints reutilizables para web y mobile.
- Reducir consumo innecesario de APIs.

## 9. APIs y Fuentes de Datos

Las siguientes APIs y fuentes de información fueron consideradas para el MVP inicial del proyecto.

Cotización del dólar

- Proveedor principal: DolarAPI
- URL: https://dolarapi.com/v1/dolares
- Uso: cotizaciones Oficial, Blue, MEP y CCL.
- Ventaja: API pública y simple.

Fallback de dólar

- Proveedor: Bluelytics
- URL: https://api.bluelytics.com.ar/v2/latest
- Uso: fallback ante caída de DolarAPI.

Criptomonedas

- Proveedor principal: CoinGecko
- Base URL: https://api.coingecko.com/api/v3/
- Endpoint de mercado: /simple/price
- Endpoint búsqueda: /search
- Uso: precios, cambios porcentuales y catálogo de cryptos.

Mercado USA y CEDEARs

- Fuente: APIs financieras y/o scraping controlado.
- Proveedor posible: Yahoo Finance.
- Uso: top subas y bajas.
- Estado actual: pendiente definición final.

Cauciones


- Fuente: APIs financieras o scraping.
- Posible integración con IOL.
- Uso: tasas mínimas, máximas y promedio.
- Estado actual: pendiente definición técnica.

## 10. Estrategia de Cache y Actualización

- Refresh general cada 2 minutos.
- Cache en memoria inicialmente.
- Preparación futura para Redis.
- Fallback automático entre APIs.
- Optimización de consumo de requests.
- Normalización de respuestas.

## 11. Ecosistema de Bots y Herramientas

La plataforma está pensada como centro principal de un ecosistema financiero.

- Bot de cauciones.
- Bot de dividendos.
- Bot de oportunidades.
- Alertas financieras.
- Integración con Telegram.
- Paneles configurables.
- Herramientas premium futuras.

## 12. Escalabilidad y Roadmap

- Autenticación de usuarios.
- Favoritos personalizados.
- Alertas push.
- Dashboard configurable.
- Integración con inversiones personales.
- Versión mobile.


- Planes premium.
- Analytics financieros.
- Notificaciones inteligentes.

## 13. Consideraciones Técnicas Importantes

- Todo el frontend debe consumir exclusivamente el backend propio.
- La arquitectura debe ser modular y escalable.
- La UI debe mantenerse extremadamente rápida.
- La experiencia mobile es obligatoria.
- La estética visual es parte fundamental del producto.
- La plataforma debe tolerar caídas parciales de APIs externas.
- El sistema debe estar preparado para crecimiento futuro.

Este documento resume la visión funcional, técnica y visual del proyecto Radar Financiero y sirve como
documento base para frontend, backend, UX/UI y arquitectura.
