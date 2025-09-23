module.exports = app => {
  const marca = require("../controllers/marca.controller.js");
  const router = require("express").Router();

  // Crear marca
  router.post("/create", marca.create);

  // Listar todas
  router.get("/", marca.findAll);

  // Buscar por ID
  router.get("/:id", marca.findOne);

  // Actualizar
  router.put("/update/:id", marca.update);

  // Eliminar
  router.delete("/delete/:id", marca.delete);

  app.use("/api/marcas", router);
};
