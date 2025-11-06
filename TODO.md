# TODO: Corregir Backend para Integración Cliente con Front-End (Retornar null en findByEmailOrNIT)

## Pasos del Plan Aprobado

- [x] Editar `app/controllers/cliente.controller.js`:
  - En `findByEmailOrNIT`: Cambiar `if (!cliente) return res.status(404).send({ message: "Cliente no encontrado." });` a `if (!cliente) return res.send(null);` (retorna null en lugar de 404 para compatibilidad con front, que espera null para fallback a create).

- [ ] Verificar cambios: Asegurar que búsqueda por email/nit inexistente retorne null sin 404.

- [ ] Test con curl: POST /api/clientes/find-by-email-or-nit -d '{"email":"noexist@test.com"}' (debe retornar null).
- [ ] Redeploy: git add . && git commit -m "Fix findByEmailOrNIT to return null instead of 404" && git push origin main (Render auto-deploys).
- [ ] Probar front: Datos cliente nuevos, primera vez busca (null), crea, procede a Stripe sin error.

- [ ] Actualizar este TODO con el progreso completado.

## Notas
- Esto resuelve el catch en front por 404, permitiendo fallback a create.
- Después, probar flujo completo en front-end.
- Si surgen errores, revisar logs en Render dashboard.
