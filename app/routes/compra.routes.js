module.exports = app => {
  const compra = require("../controllers/compra.controller.js");
  const router = require("express").Router();

  // Crear compra
  router.post("/create", compra.create);

  // Listar compras
  router.get("/", compra.findAll);

  // Obtener una compra por ID
  router.get("/:id", compra.findOne);

  // Actualizar compra
  router.put("/update/:id", compra.update);

  // Eliminar compra
  router.delete("/delete/:id", compra.delete);

  app.use("/api/compras", router);
};
