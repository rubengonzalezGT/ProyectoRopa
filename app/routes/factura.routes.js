// app/routes/factura.routes.js
module.exports = app => {
  const facturas = require("../controllers/factura.controller.js");
  const router = require("express").Router();

  // Generar factura desde venta
  router.post("/create/:id", facturas.createFromVenta);

  // Listar todas
  router.get("/", facturas.findAll);

  // Obtener una factura
  router.get("/:id", facturas.findOne);

  // Eliminar factura
  router.delete("/delete/:id", facturas.delete);

  app.use("/api/facturas", router);
};
