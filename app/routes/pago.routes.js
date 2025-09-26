module.exports = app => {
  const pagos = require("../controllers/pago.controller.js");
  const router = require("express").Router();

  // 🔹 Pagos manuales
  router.post("/", pagos.create);          // Crear pago manual (CASH / CARD)
  router.get("/", pagos.findAll);          // Listar pagos
  router.get("/:id", pagos.findOne);       // Obtener un pago por ID
  router.delete("/:id", pagos.delete);     // Eliminar pago

  // 🔹 Rutas PayPal (Sandbox)
  router.post("/paypal/create-order", pagos.createPaypalOrder);
  router.post("/paypal/capture-order", pagos.capturePaypalOrder);

  app.use("/api/pagos", router);
};
