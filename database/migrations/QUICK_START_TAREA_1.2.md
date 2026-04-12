# 🚀 Quick Start: Tarea 1.2

## ⚡ Ejecución Rápida (3 minutos)

### 1️⃣ Abre Supabase
👉 https://app.supabase.com → Tu Proyecto → **SQL Editor**

### 2️⃣ Copia el SQL
📄 Abre: `database/migrations/002_add_documento_to_clientes.sql`  
📋 Copia TODO el contenido

### 3️⃣ Ejecuta
✨ Pega en SQL Editor → Click **Run**

### 4️⃣ Verifica
✅ Deberías ver: `Success. No rows returned`

---

## 🔍 Verificación Rápida

Ejecuta esto en SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'clientes' 
  AND column_name = 'documento';
```

**Resultado esperado:**
```
documento | text
```

---

## ✅ ¡Listo!

Si viste el resultado esperado, la tarea está completa.

📚 **Más detalles:** `RESUMEN_TAREA_1.2.md`

---

**Tiempo estimado:** 3 minutos  
**Dificultad:** ⭐ Fácil
