module.exports = app => {
  const pagos = require("../controllers/pago.controller.js");
  const router = require("express").Router();

  // 🔹 Rutas de pagos
  router.post("/create", pagos.create);          // Crear pago manual (CASH / CARD)
  router.get("/", pagos.findAll);          // Listar pagos
  router.get("/:id", pagos.findOne);       // Obtener un pago por ID
  router.delete("/:id", pagos.delete);     // Eliminar pago

  // 🔹 Rutas de PayPal
  router.post("/paypal/create-order", pagos.createPaypalOrder);  // Crear orden PayPal
  router.post("/paypal/capture-order", pagos.capturePaypalOrder);  // Capturar pago PayPal

  app.use("/api/pagos", router);
};
