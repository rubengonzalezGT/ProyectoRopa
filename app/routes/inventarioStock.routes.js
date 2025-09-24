module.exports = app => {
  const stock = require("../controllers/inventarioStock.controller.js");
  const router = require("express").Router();

  // Crear stock manualmente (opcional; para seeding/migraciones)
  router.post("/create", stock.create);

  // Listar todos los registros de stock
  router.get("/", stock.findAll);

  // Obtener stock de una variante (id = id_variante)
  router.get("/:id", stock.findOne);

  // Actualizar stock manualmente (ajuste directo)
  router.put("/update/:id", stock.update);

  // Eliminar registro de stock
  router.delete("/delete/:id", stock.delete);

  app.use("/api/inventario/stock", router);
};
