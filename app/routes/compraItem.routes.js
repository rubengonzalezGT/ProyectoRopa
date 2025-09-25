module.exports = app => {
  const compraItem = require("../controllers/compraItem.controller.js");
  const router = require("express").Router();

  // Crear item
  router.post("/create", compraItem.create);

  // Listar items
  router.get("/", compraItem.findAll);

  // Obtener item por ID
  router.get("/:id", compraItem.findOne);

  // Actualizar item
  router.put("/update/:id", compraItem.update);

  // Eliminar item
  router.delete("/delete/:id", compraItem.delete);

  app.use("/api/compra-items", router);
};
