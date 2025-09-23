module.exports = app => {
  const variante = require("../controllers/productoVariante.controller.js");
  const router = require("express").Router();

  // Crear variante
  router.post("/create", variante.create);

  // Listar variantes
  router.get("/", variante.findAll);

  // Detalle de variante
  router.get("/:id", variante.findOne);

  // Actualizar variante
  router.put("/update/:id", variante.update);

  // Eliminar variante
  router.delete("/delete/:id", variante.delete);

  app.use("/api/variantes", router);
};
