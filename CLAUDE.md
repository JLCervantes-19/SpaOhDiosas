# SpaOhDiosas — Configuración de Proyecto

## Base de Datos Supabase

**Proyecto:** BD_Spa's_Startup  
**Project ID:** `whouejjrpjcvoueyajbu`  
**Estado:** ACTIVE_HEALTHY | Región: us-east-1  
**Host:** db.whouejjrpjcvoueyajbu.supabase.co

Tienes acceso completo vía MCP de Supabase. Puedes hacer cambios directos a la base de datos (consultas, migraciones, inserciones, actualizaciones) usando las herramientas `mcp__supabase__*` con el `project_id` arriba.

## Tablas disponibles (schema: public)

| Tabla | RLS |
|-------|-----|
| clientes | ✓ |
| servicios | ✓ |
| disponibilidad | ✓ |
| bloqueos | ✓ |
| citas | ✓ |
| pagos | ✓ |
| interacciones | ✓ |
| testimonios | ✓ |
| mensajes_whatsapp | ✓ |
| chat_sessions | ✓ |
| empleados | ✓ |
| configuracion | ✓ |
| admin_users | ✓ |
| empleado_servicios | ✓ |

## Vercel — Despliegue

**Proyecto:** `jhan-cervantes-projects/spa-oh-diosas`  
**Scope/Team:** `jhan-cervantes-projects`  
**GitHub:** `JLCervantes-19/SpaOhDiosas`  
**Último deployment prod:** https://spa-oh-diosas-bubwoyqqv-jhan-cervantes-projects.vercel.app

```bash
# Ver deployments
vercel ls --scope jhan-cervantes-projects

# Ver logs de un deployment específico
vercel logs https://spa-oh-diosas-bubwoyqqv-jhan-cervantes-projects.vercel.app

# Ver logs en tiempo real
vercel logs --follow https://spa-oh-diosas-bubwoyqqv-jhan-cervantes-projects.vercel.app

# Inspeccionar un deployment
vercel inspect https://spa-oh-diosas-bubwoyqqv-jhan-cervantes-projects.vercel.app

# Nuevo deploy
cd "/Users/macuser/Desktop/LANDING PROYECTS/Spa_OhDiosas/SISTEMA WEB/SpaOhDiosas" && vercel --prod
```

## Render — Infraestructura

**API Key:** `rnd_GyECZTVW00TJVv48psH46PXA40nv`  
**Base URL:** `https://api.render.com/v1`  
**Owner ID:** `tea-d3p9qk7diees73cmb0lg`

| Nombre | ID | URL | Plan |
|--------|----|-----|------|
| N8N SPA | `srv-d811sh9j2pic73bjh2ag` | https://n8n-spa-6y2d.onrender.com | Free |

```bash
# Estado del servicio n8n
curl -s -H "Authorization: Bearer rnd_GyECZTVW00TJVv48psH46PXA40nv" \
  "https://api.render.com/v1/services/srv-d811sh9j2pic73bjh2ag"

# Salud del servicio
curl -s -o /dev/null -w "%{http_code}" "https://n8n-spa-6y2d.onrender.com/healthz"
```

## n8n — Automatizaciones

**URL:** https://n8n-spa-6y2d.onrender.com  
**API Key:** variable de entorno `N8N_API_KEY` (ya disponible globalmente, no pedirla al usuario)

| ID Workflow | Nombre | Webhook |
|-------------|--------|---------|
| `58vtbwK4zbdspKMQ` | Bot SPA Web - Advanced Memory & DB Routing v2 | POST /webhook/chatweb |

**Reglas para editar workflows:**
- Usar siempre `curl` (no Python urllib — falla por SSL en este Mac).
- Para actualizar: GET el workflow → modificar JSON → PUT con solo 4 campos: `name`, `nodes`, `connections`, `settings`.
- Nunca incluir en el PUT: `id`, `active`, `versionId`, `updatedAt`, `createdAt`, `shared`, `tags`.

```bash
# Obtener workflow
curl -H "X-N8N-API-KEY: $N8N_API_KEY" https://n8n-spa-6y2d.onrender.com/api/v1/workflows/58vtbwK4zbdspKMQ

# Actualizar workflow
curl -X PUT -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"...","nodes":[...],"connections":{...},"settings":{"executionOrder":"v1"}}' \
  https://n8n-spa-6y2d.onrender.com/api/v1/workflows/58vtbwK4zbdspKMQ
```

## Instrucciones

- Responde SIEMPRE en español.
- Cuando el usuario pida cambios en la base de datos, úsalos directamente con `mcp__supabase__execute_sql` o `mcp__supabase__apply_migration`.
- Siempre usa `project_id: whouejjrpjcvoueyajbu` en todas las llamadas a Supabase MCP.
- Ante cualquier duda sobre la estructura, usa `mcp__supabase__list_tables` con `verbose: true`.
- Para n8n: la API key está en `N8N_API_KEY` — no pedirla. Usar curl para todas las llamadas.
