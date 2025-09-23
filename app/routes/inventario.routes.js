module.exports = app => {
  const inventario = require("../controllers/inventario.controller.js");
  const router = require("express").Router();

  // Ver stock actual por producto/variante
  router.get("/stock/:id_variante", inventario.getStock);

  // Listar movimientos de inventario de una variante
  router.get("/movimientos/:id_variante", inventario.getMovimientos);

  // Ajustar stock manualmente (solo admin idealmente)
  router.post("/ajustar/:id_variante", inventario.ajustarStock);

  app.use("/api/inventario", router);
};
