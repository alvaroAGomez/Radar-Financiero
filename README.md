# 📡 Radar Financiero

> Dashboard financiero moderno para el mercado argentino — dólar, criptomonedas, cauciones, CEDEARs y bots de Telegram, todo en un solo lugar.

---

## ¿Qué es Radar Financiero?

Radar Financiero es una plataforma web pensada para inversores y usuarios de finanzas personales que quieren información de mercado actualizada en tiempo real, sin ruido, con una UI de estética tipo terminal financiera profesional.

El sistema actúa como un **agregador inteligente**: el backend en NestJS consume múltiples APIs externas, normaliza los datos, aplica caché y los expone en endpoints propios. El frontend en Angular los visualiza. Esto elimina problemas de CORS, reduce drásticamente las llamadas externas repetitivas y hace el sistema resiliente ante caídas parciales de terceros.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21 (Standalone Components) + TailwindCSS |
| Backend | NestJS 10 + TypeScript |
| HTTP Client | Axios (`@nestjs/axios`) |
| Cache | Memory Cache (`@nestjs/cache-manager`) → Redis (roadmap) |
| Scheduler | `@nestjs/schedule` (cron jobs) |
| Mobile | Ionic 8 + Capacitor (en desarrollo) |
| Deploy | Google Cloud VM e2-micro + Nginx (reverse proxy) |

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────────────────┐
│                     Clientes (Presentación)                     │
│  Angular Web App  │  Ionic Mobile App  │  PWA (futuro)          │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP / JSON
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              NestJS Backend  —  API Gateway + Agregador         │
│                                                                 │
│  Controllers  →  Services  →  Cache (2 min TTL)                 │
│                      ↑                                          │
│               Schedulers (Cron 2 min)                           │
│                                                                 │
│  Módulos: dolar │ crypto │ market │ scheduler │ config-public   │
└──────┬──────────┬──────────┬──────────┬───────────────────────--┘
       │          │          │          │
  DolarAPI   CoinGecko    IOL API    Telegram
  Bluelytics           (OAuth2+     Bot API
  (fallback)            scraping)
```

El ciclo de actualización funciona así:

1. Los **schedulers** se ejecutan cada 2 minutos en background.
2. Consultan las APIs externas, normalizan la respuesta y actualizan la **caché en memoria**.
3. Cuando el cliente pide datos, el backend responde **desde caché en milisegundos** — sin llamadas externas en caliente.

---

## Funcionalidades del MVP

- 💵 **Panel Dólar** — Oficial, Blue, MEP, CCL con fallback automático entre DolarAPI y Bluelytics
- 🪙 **Panel Crypto** — Precios y variaciones en tiempo real vía CoinGecko, selección configurable de monedas
- 📈 **Panel Cauciones** — Tasas mínimas, máximas y promedio vía IOL
- 🏦 **Panel CEDEARs / Mercado USA** — Top subas y bajas vía InvertirOnline (IOL)
- 🔭 **Radar de Oportunidades** — Detección automática de situaciones de mercado destacadas
- 🤖 **Herramientas Pro** — Acceso a los bots de Telegram (cauciones y dividendos)
- ♻️ **Actualización automática** cada 2 minutos con caché backend
- 📱 **Responsive y mobile-first**, preparado para PWA e Ionic

---

## Estructura del repositorio

```
radar-financiero/
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── dolar/        # Cotización del dólar + fallback
│   │   │   ├── crypto/       # Criptomonedas via CoinGecko
│   │   │   ├── market/       # CEDEARs, cauciones vía IOL
│   │   │   ├── scheduler/    # Cron jobs de actualización
│   │   │   └── config-public/# Expone env vars seguras al frontend
│   │   └── common/           # Filtros, constantes globales
│   ├── .env.example          # Variables de entorno documentadas
│   └── package.json
│
├── frontend/                 # SPA Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Servicios, interceptors, guards
│   │   │   ├── features/
│   │   │   │   ├── dashboard/# Shell + paneles (dólar, crypto, etc.)
│   │   │   │   └── admin-tools/ # Herramientas Pro / bots Telegram
│   │   │   └── shared/       # Componentes reutilizables
│   │   └── environments/     # environment.ts / environment.prod.ts
│   └── package.json
│
├── docs/                     # Documentación técnica extendida
│   └── architecture/
└── README.md                 # Este archivo
```

---

## Configuración rápida (desarrollo local)

### Prerequisitos

- Node.js >= 20
- npm >= 10

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Completar con tus valores reales
npm run start:dev      # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start              # http://localhost:4200
```

El frontend en desarrollo ya apunta a `http://localhost:3000/api` por defecto (ver `environment.ts`).

---

## Variables de entorno (backend)

Copiar `backend/.env.example` a `backend/.env` y completar:

```env
PORT=3000

# Dólar
DOLAR_API_URL=https://dolarapi.com/v1/dolares
BLUELYTICS_API_URL=https://api.bluelytics.com.ar/v2/latest

# Crypto
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# InvertirOnline (IOL) — CEDEARs y cauciones
IOL_API_URL=https://api.invertironline.com
IOL_USERNAME=tu_usuario@email.com
IOL_PASSWORD=tu_password

# URL interna de la API de datos de cauciones (backend → backend)
CAUCION_BOT_URL= api de causiones

# Timeout HTTP (ms)
HTTP_TIMEOUT=5000

# Links públicos a Telegram (se exponen al cliente Angular vía GET /api/config)
# NO confundir con CAUCION_BOT_URL — estas son las URLs que el usuario abre en el navegador
TELEGRAM_BOT_CAUCIONES_URL=https://t.me/tu_bot_cauciones
TELEGRAM_BOT_DIVIDENDOS_URL=https://t.me/tu_bot_dividendos
```

> **Sobre la distinción de URLs de bots:**
> | Variable | Propósito |
> |---|---|
> | `CAUCION_BOT_URL` | Endpoint interno para que el **backend** consuma datos de cauciones |
> | `TELEGRAM_BOT_CAUCIONES_URL` | Link de Telegram que el **usuario** abre desde el frontend |
> | `TELEGRAM_BOT_DIVIDENDOS_URL` | Link de Telegram que el **usuario** abre desde el frontend |

---

## Endpoints principales del backend

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/dolar` | Cotizaciones del dólar (Oficial, Blue, MEP, CCL) |
| `GET` | `/api/crypto` | Precios de criptomonedas seleccionadas |
| `GET` | `/api/market/cauciones` | Tasas de cauciones |
| `GET` | `/api/market/cedears` | Top CEDEARs y mercado USA |
| `GET` | `/api/config` | Variables de entorno públicas (URLs de bots Telegram) |

---

## Flujo de variables de entorno al cliente

Angular corre en el navegador y no puede leer `process.env`. La solución implementada:

```
.env (servidor)
    │
    ▼
GET /api/config  (NestJS ConfigPublicModule)
    │
    ▼
AppConfigService.loadConfig()  (Angular, llamado en ngOnInit)
    │
    ▼
botCaucionesUrl / botDividendosUrl  →  [href] en template
```

En producción, `environment.prod.ts` tiene las URLs vacías como strings. Al cargarse la app, `AppConfigService` hace un `GET /api/config` y rellena los valores desde el servidor. Si falla, usa el fallback del `environment.ts`.

---

## Scripts disponibles

### Backend
```bash
npm run start:dev    # Modo desarrollo con hot-reload
npm run start:prod   # Producción (requiere build previo)
npm run build        # Compilar TypeScript → dist/
npm run test         # Tests unitarios (Jest)
npm run lint         # ESLint + Prettier
```

### Frontend
```bash
npm start            # ng serve (dev, puerto 4200)
npm run build        # ng build --configuration production
npm test             # Vitest
```

---

## Roadmap

- [x] Panel dólar con fallback multi-proveedor
- [x] Panel criptomonedas con selección configurable
- [x] Panel cauciones y CEDEARs vía IOL
- [x] Cache backend + schedulers de actualización
- [x] Herramientas Pro con links a bots de Telegram
- [x] Runtime config (env vars → frontend sin hardcoding)
- [ ] Alertas push (precio, tasas, brecha cambiaria)
- [ ] App móvil Ionic/Capacitor

---

## Licencia

Proyecto privado — todos los derechos reservados.
