module.exports = app => {
  const categoria = require("../controllers/categoria.controller.js");
  const router = require("express").Router();

  // Crear
  router.post("/create", categoria.create);

  // Listar todas
  router.get("/", categoria.findAll);

  // Buscar por id
  router.get("/:id", categoria.findOne);

  // Actualizar
  router.put("/update/:id", categoria.update);

  // Eliminar
  router.delete("/delete/:id", categoria.delete);

  app.use("/api/categorias", router);
};
