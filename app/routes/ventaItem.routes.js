module.exports = app => {
  const ventaItem = require("../controllers/ventaItem.controller.js");
  const router = require("express").Router();

  // Crear un item de venta
  router.post("/create", ventaItem.create);

  // Listar todos los items
  router.get("/", ventaItem.findAll);

  // Buscar un item por ID
  router.get("/:id", ventaItem.findOne);

  // Actualizar un item
  router.put("/update/:id", ventaItem.update);

  // Eliminar un item
  router.delete("/delete/:id", ventaItem.delete);

  app.use("/api/venta-items", router);
};
