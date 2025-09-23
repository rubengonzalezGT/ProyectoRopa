module.exports = app => {
  const producto = require("../controllers/producto.controller.js");
  const router = require("express").Router();

  // Crear producto
  router.post("/create", producto.create);

  // Listar todos los productos
  router.get("/", producto.findAll);

  // Detalle de un producto
  router.get("/:id", producto.findOne);

  // Actualizar producto
  router.put("/update/:id", producto.update);

  // Eliminar producto
  router.delete("/delete/:id", producto.delete);

  // (Opcional) obtener stock de una variante
  if (producto.getStock) {
    router.get("/variante/:id_variante/stock", producto.getStock);
  }

  app.use("/api/productos", router);
};
