// app/routes/cliente.routes.js
module.exports = app => {
  const clientes = require("../controllers/cliente.controller.js"); // Aquí se importa correctamente el controlador
  const router = require("express").Router();

  // Crear cliente
  router.post("/create", clientes.create);

  // Listar clientes (con búsqueda y paginación)
  router.get("/", clientes.findAll);

  // Obtener un cliente por ID
  router.get("/:id", clientes.findOne);

  // Actualizar cliente
  router.put("/update/:id", clientes.update);

  // Eliminar cliente por ID
  router.delete("/delete/:id", clientes.delete);

  // Eliminar todos los clientes (solo pruebas)
  router.delete("/delete", clientes.deleteAll);

  // Historial de ventas de un cliente
  router.get("/:id/ventas", clientes.findVentasByCliente);

  // Buscar cliente por NIT o Email
  router.post('/find-by-email-or-nit', clientes.findByEmailOrNIT); // Aquí cambiamos a `clientes.findByEmailOrNIT`

  // Obtener cliente por id_usuario (para integración con auth)
  router.get('/by-user/:id_usuario', clientes.getByUser);

  app.use("/api/clientes", router);
};
