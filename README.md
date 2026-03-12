# Cocos Security Portal

**Anti-Phishing & Brand Protection Platform** — Cocos Capital

> Portal interno para el equipo de seguridad. Monitoreo de amenazas en tiempo real: dominios typosquatting, URLs de phishing, cuentas falsas en redes sociales y filtraciones en dark web.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | Shadcn/ui + Tailwind CSS |
| Base de datos | PostgreSQL + Prisma ORM |
| Cola de trabajos | BullMQ + Redis |
| Autenticación | NextAuth v5 |
| Package manager | pnpm |

---

## Requisitos

- **Node.js** 20+
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** 14+ (local o Docker)
- **Redis** 7+ (local o Docker — solo para workers)

### Iniciar PostgreSQL + Redis con Docker (opcional)

```bash
docker run -d --name cocos-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cocos_security -p 5432:5432 postgres:16
docker run -d --name cocos-redis -p 6379:6379 redis:7
```

---

## Setup inicial

```bash
# 1. Clonar y entrar al proyecto
cd cocos-security

# 2. Instalar dependencias
pnpm install

# 3. Copiar variables de entorno
cp .env.example .env
# Editá .env con tus valores (mínimo: DATABASE_URL y AUTH_SECRET)

# 4. Crear tablas en la base de datos
pnpm db:push

# 5. Cargar datos de prueba
pnpm db:seed

# 6. Iniciar servidor de desarrollo
pnpm dev
```

Abrir: **http://localhost:3000**

---

## Credenciales de demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@cocos-capital.com.ar | admin123 |
| Analista | maria.gonzalez@cocos-capital.com.ar | analyst123 |

---

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/dashboard` | Resumen general de amenazas |
| Domain Watchdog | `/dashboard/domains` | Dominios typosquatting/phishing |
| URL Analyzer | `/dashboard/phishing` | Análisis de URLs sospechosas |
| Social Monitor | `/dashboard/social` | Cuentas falsas en RRSS |
| Dark Web | `/dashboard/darkweb` | Filtraciones de credenciales (HIBP) |
| Alertas | `/dashboard/alerts` | Historial de notificaciones |
| Configuración | `/dashboard/settings` | Usuarios y configuración |

---

## APIs externas (requieren configuración)

Todas están scaffoldeadas en `src/services/`. Para activarlas:

| Servicio | Variable env | Propósito |
|----------|-------------|-----------|
| VirusTotal | `VIRUSTOTAL_API_KEY` | Análisis de URLs y dominios |
| URLScan.io | `URLSCAN_API_KEY` | Screenshots y análisis de páginas |
| HaveIBeenPwned | `HIBP_API_KEY` | Detección de filtraciones |
| Slack | `SLACK_WEBHOOK_URL` | Alertas en tiempo real |
| crt.sh | — (libre) | Certificados SSL (sin API key) |

---

## Estructura del proyecto

```
src/
├── app/                    # Rutas Next.js (App Router)
│   ├── (auth)/login/       # Página de login
│   ├── (dashboard)/        # Layout + todas las páginas del portal
│   └── api/                # API routes (REST)
├── components/
│   ├── ui/                 # Primitivos Shadcn/ui
│   ├── layout/             # Sidebar, Header, ThreatBadge
│   ├── dashboard/          # StatsCards, RecentThreats
│   └── modules/            # ThreatTable, ScannerControls
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma singleton
│   ├── queue.ts            # BullMQ queues
│   └── utils.ts            # Utilidades (cn, formatDate)
├── services/               # Integraciones externas (TODO: implementar)
│   ├── crtsh.service.ts    # Certificate Transparency
│   ├── whois.service.ts    # WHOIS lookups
│   ├── urlscan.service.ts  # URLScan.io
│   ├── virustotal.service.ts
│   ├── hibp.service.ts
│   └── slack.service.ts
└── workers/                # BullMQ processors (TODO: descomentar)
    ├── domain.worker.ts
    ├── phishing.worker.ts
    ├── hibp.worker.ts
    └── index.ts            # Entry point para los workers
```

---

## Comandos útiles

```bash
pnpm dev              # Dev server (http://localhost:3000)
pnpm build            # Build de producción
pnpm lint             # ESLint

pnpm db:push          # Sync schema → DB (sin migrations)
pnpm db:migrate       # Crear migration SQL
pnpm db:seed          # Cargar datos de prueba
pnpm db:studio        # Prisma Studio (GUI para DB)

pnpm workers:dev      # Iniciar workers BullMQ (separado del dev server)
```

---

## Cómo agregar un nuevo módulo

1. **Servicio**: Crear `src/services/nuevo.service.ts` con la integración
2. **Worker**: Crear `src/workers/nuevo.worker.ts` con el job processor
3. **Schema**: Agregar modelos en `prisma/schema.prisma` + `pnpm db:migrate`
4. **Página**: Crear `src/app/(dashboard)/nuevo/page.tsx`
5. **Nav**: Agregar entrada en `src/components/layout/Sidebar.tsx`

---

## Deploy

Para producción, se recomienda:

- **Base de datos**: Supabase, Railway PostgreSQL, o RDS
- **Redis**: Upstash Redis (serverless)
- **App**: Vercel (Next.js nativo) o Railway
- **Workers**: Proceso separado en Railway/Fly.io (workers no corren en Vercel)

---

## Seguridad

- Las páginas del dashboard requieren autenticación (NextAuth session)
- Las API routes deben validar la sesión (TODO: agregar middleware)
- Los secrets van en `.env` — **nunca** commitear `.env`
- Las contraseñas se hashean con bcrypt (cost factor 12)

---

*Desarrollado por el equipo de Seguridad de Cocos Capital.*
