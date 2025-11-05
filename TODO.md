# TODO: Implementar Endpoints PayPal en Backend

## Pasos del Plan Aprobado

- [x] Instalar `@paypal/checkout-server-sdk` (npm install).

- [x] Editar `app/config/paypalClient.config.js`: Asegurar export del client PayPal configurado con env vars (PAYPAL_CLIENT_ID, PAYPAL_SECRET). (Ya configurado correctamente).

- [x] Editar `app/controllers/pago.controller.js`:
  - Agregar `createPaypalOrder`: Recibe { id_venta, amount, currency }, crea orden con SDK, crea registro en pagos con orderId asociado a id_venta, retorna { id: orderId }.
  - Agregar `capturePaypalOrder`: Recibe { orderId }, captura orden, crea registro en pagos con detalles, actualiza venta a 'COMPLETED', retorna éxito.

- [x] Editar `app/routes/pago.routes.js`: Agregar POST /paypal/create-order y /paypal/capture-order (sin auth, como confirmado). (Ya existían las rutas, solo se actualizó la lógica en controller).

- [ ] Verificar cambios en archivos.

- [ ] Probar endpoints con curl (e.g., curl -X POST http://localhost:3000/api/pagos/paypal/create-order -H "Content-Type: application/json" -d '{"id_venta":1,"amount":"10.00","currency":"USD"}').

- [ ] Reiniciar servidor backend (node server.js) y probar flujo completo con frontend (agregar items, proceder a pago, verificar cierre de popup).

- [ ] Actualizar este TODO con progreso completado.

## Notas
- Usar env vars para CLIENT_ID y SECRET de PayPal sandbox.
- Asumir models (pago, venta) soportan campos para orderId, paypal_details, estado. Si no, agregar migraciones (e.g., id_venta en pago.model.js, paypal_order_id y paypal_capture_id en venta.model.js).
- Si hay errores en models (e.g., asociaciones), ajustar después de pruebas.
- Testing: Enfocarse en flujo principal; casos de error (e.g., orden inválida) si necesario.
- Despliega en Render después de pruebas locales para probar con frontend.
