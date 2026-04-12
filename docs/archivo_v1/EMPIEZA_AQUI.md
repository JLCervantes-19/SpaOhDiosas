# 🚀 EMPIEZA AQUÍ - Pruebas del Chatbot

## 👋 ¡Hola!

Tu chatbot de gestión de citas está **completamente implementado** y listo para probar.

---

## ⚡ Quick Start (5 minutos)

### Paso 1: Inicia el servidor

```bash
npm start
```

Deberías ver:
```
Server running on http://localhost:3000
Connected to Supabase ✓
```

### Paso 2: Abre el chat

En tu navegador:
```
http://localhost:3000/frontend/chat.html
```

### Paso 3: Prueba el flujo básico

1. Escribe tu nombre cuando te lo pida
2. Haz clic en "Consultar mis citas"
3. Ingresa tu nombre completo
4. Ingresa tu email

**¿Funcionó?** ✅ ¡Perfecto! Continúa con las pruebas completas.

**¿No funcionó?** ❌ Ve a la sección "Problemas Comunes" abajo.

---

## 📋 ¿Qué Puedes Probar?

### ✅ Funcionalidades Implementadas

1. **Consultar Citas**
   - Pide nombre y email
   - Busca por cualquiera de los dos
   - Muestra citas futuras

2. **Cancelar Citas**
   - Valida 24 horas de anticipación
   - Actualiza estado en BD
   - Mensaje de confirmación cálido

3. **Cambiar Fecha**
   - Valida 24 horas de anticipación
   - Redirige a sistema de reservas

4. **Salir del Chat**
   - Limpia sesión
   - Redirige a página principal

---

## 🎯 Prueba Rápida (10 minutos)

### Escenario 1: Ver Citas
1. Abre el chat
2. Da tu nombre
3. Clic en "Consultar mis citas"
4. Ingresa nombre y email
5. ✅ Deberías ver tus citas

### Escenario 2: Cancelar Cita
1. Después de ver citas, clic en "Cancelar cita"
2. Escribe el número de la cita (ej: "1")
3. ✅ Deberías ver confirmación

### Escenario 3: Salir
1. Clic en "Salir"
2. ✅ Deberías volver a la página principal

---

## 🗄️ ¿No Tienes Citas de Prueba?

Crea una rápidamente en Supabase:

```sql
-- 1. Obtén tu cliente_id
SELECT id FROM clientes WHERE email = 'tu_email@example.com';

-- 2. Obtén un servicio_id
SELECT id FROM servicios WHERE activo = true LIMIT 1;

-- 3. Crea la cita (3 días en el futuro)
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen)
VALUES (
  gen_random_uuid(),
  '[TU_CLIENTE_ID]',
  '[UN_SERVICIO_ID]',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  '15:30:00',
  'confirmada',
  'web'
);
```

---

## 🐛 Problemas Comunes

### "Cannot connect to database"
```bash
# Verifica tu .env
cat .env | grep SUPABASE

# Debe tener:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### "No encuentro mis citas"
- Verifica que el email en BD esté en minúsculas
- Verifica que la cita sea futura (fecha >= hoy)
- Verifica que el cliente_id sea correcto

### "El chat no responde"
```javascript
// En consola del navegador (F12)
localStorage.clear();
location.reload();
```

### "Error al cancelar cita"
- Verifica que la cita tenga más de 24h de anticipación
- Verifica que el ID de la cita sea correcto

---

## 📚 Documentación Completa

Si quieres hacer pruebas más exhaustivas:

1. **`INSTRUCCIONES_PRUEBA.md`** - Guía paso a paso completa
2. **`CHECKLIST_PRUEBAS.md`** - Lista de 80+ items para verificar
3. **`COMANDOS_UTILES.md`** - Queries SQL y comandos útiles
4. **`RESUMEN_TRABAJO_COMPLETADO.md`** - Qué se implementó

**Índice completo**: `INDICE_DOCUMENTACION.md`

---

## ✅ Checklist Mínimo

Antes de considerar las pruebas completas:

- [ ] Chat se abre correctamente
- [ ] Pide nombre al inicio
- [ ] "Consultar mis citas" funciona
- [ ] Muestra citas correctamente
- [ ] Botones de acción aparecen
- [ ] "Cancelar cita" funciona (con 24h)
- [ ] "Cancelar cita" muestra error (sin 24h)
- [ ] "Cambiar fecha" redirige a reservas
- [ ] "Salir" limpia sesión y redirige
- [ ] No hay errores en consola

---

## 🎉 ¿Todo Funciona?

¡Excelente! Ahora puedes:

1. ✅ Marcar la Tarea 5 como completada
2. 🚀 Preparar para deploy a Vercel
3. 📊 Documentar cualquier observación
4. 🎊 ¡Celebrar! El chatbot está "bien pilas"

---

## 🚀 Deploy a Producción

Cuando estés listo:

```bash
# Deploy a Vercel
vercel --prod

# Verificar que funciona en producción
# Probar con datos reales
```

---

## 📞 ¿Necesitas Ayuda?

1. Revisa `INSTRUCCIONES_PRUEBA.md` → Sección Troubleshooting
2. Revisa `COMANDOS_UTILES.md` → Comandos de Emergencia
3. Verifica logs del servidor en la terminal
4. Verifica consola del navegador (F12)

---

## 🎯 Próximos Pasos

Después de las pruebas básicas:

1. **Pruebas completas**: Sigue `CHECKLIST_PRUEBAS.md`
2. **Deploy**: Usa `COMANDOS_UTILES.md` → Deploy
3. **Monitoreo**: Configura logging en producción
4. **Feedback**: Obtén feedback de usuarios reales

---

## 💡 Tips

- Mantén la consola del navegador abierta (F12)
- Mantén la terminal visible para ver logs
- Usa Supabase Dashboard para verificar cambios en BD
- Limpia localStorage si algo no funciona

---

## 📊 Tiempo Estimado

- ⚡ Prueba rápida: 10 minutos
- 🧪 Pruebas básicas: 30 minutos
- ✅ Pruebas completas: 60-90 minutos

---

**¡Buena suerte con las pruebas!** 🚀

Si todo funciona bien, el chatbot está listo para producción. 🎊

---

**Archivos importantes**:
- Este archivo: Inicio rápido
- `INSTRUCCIONES_PRUEBA.md`: Guía completa
- `CHECKLIST_PRUEBAS.md`: Lista de verificación
- `INDICE_DOCUMENTACION.md`: Índice de toda la documentación
