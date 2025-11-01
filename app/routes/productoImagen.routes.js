// app/routes/productoImagen.routes.js
module.exports = (app) => {
  const imagenes = require("../controllers/productoImagen.controller.js");
  const router = require("express").Router();

  // CRUD de imágenes
  router.post("/", imagenes.create);          // Crear nueva imagen
  router.get("/", imagenes.findAll);          // Listar imágenes (puede filtrar por ?id_variante)
  router.get("/:id", imagenes.findOne);       // Ver imagen específica
  router.put("/:id", imagenes.update);        // Actualizar imagen
  router.delete("/:id", imagenes.delete);     // Eliminar imagen

  app.use("/api/imagenes", router);
};
