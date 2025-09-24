module.exports = app => {
  const inventarioMov = require("../controllers/inventarioMov.controller.js");
  const router = require("express").Router();

  // Crear movimiento
  router.post("/create", inventarioMov.create);

  // Listar todos los movimientos
  router.get("/", inventarioMov.findAll);

  // Obtener un movimiento por ID
  router.get("/:id", inventarioMov.findOne);

  // Eliminar un movimiento
  router.delete("/delete/:id", inventarioMov.delete);

  // Registrar el router en express
  app.use("/api/inventario/mov", router);
};
