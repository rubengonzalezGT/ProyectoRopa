module.exports = app => {
  const proveedor = require("../controllers/proveedor.controller.js");
  const router = require("express").Router();

  // Crear
  router.post("/create", proveedor.create);

  // Listar todos
  router.get("/", proveedor.findAll);

  // Buscar por ID
  router.get("/:id", proveedor.findOne);

  // Actualizar
  router.put("/update/:id", proveedor.update);

  // Eliminar
  router.delete("/delete/:id", proveedor.delete);

  app.use("/api/proveedores", router);
};
