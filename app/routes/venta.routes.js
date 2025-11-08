module.exports = app => {
  const venta = require("../controllers/venta.controller.js");
  const router = require("express").Router();

  // Crear venta
  router.post("/create", venta.create);

  // Listar ventas
  router.get("/", venta.findAll);

  // Obtener movimientos de ventas
  router.get("/mov", venta.getMovimientos);

  // Buscar venta por ID
  router.get("/:id", venta.findOne);

  // Actualizar venta
  router.put("/update/:id", venta.update);

  // Eliminar venta
  router.delete("/delete/:id", venta.delete);

  app.use("/api/ventas", router);
};