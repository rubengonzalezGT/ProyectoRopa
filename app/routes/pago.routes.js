module.exports = app => {
  const pagos = require("../controllers/pago.controller.js");  // Verifica que la ruta sea correcta
  const router = require("express").Router();

  // 🔹 Rutas de pagos
  router.post("/", pagos.create);          // Crear pago manual (CASH / CARD)
  router.get("/", pagos.findAll);          // Listar pagos
  router.get("/:id", pagos.findOne);       // Obtener un pago por ID
  router.delete("/:id", pagos.delete);     // Eliminar pago

  // 🔹 Rutas de Stripe
  router.post("/stripe/create-payment-intent", pagos.createStripePaymentIntent);  // Crear PaymentIntent Stripe
  router.post("/stripe/confirm-payment", pagos.confirmStripePayment);  // Confirmar pago Stripe

  app.use("/api/pagos", router);
};
