module.exports = app => {
  const devoluciones = require("../controllers/ventaDevolucion.controller.js");
  const router = require("express").Router();

  // Crear devolución
  router.post("/create", devoluciones.create);

  // Listar todas las devoluciones
  router.get("/", devoluciones.findAll);

  // Obtener una devolución por ID
  router.get("/:id", devoluciones.findOne);

  // Actualizar devolución (ej. motivo)
  router.put("/update/:id", devoluciones.update);

  // Eliminar devolución
  router.delete("/delete/:id", devoluciones.delete);

  // Montar en /api/devoluciones
  app.use("/api/devoluciones", router);
};
