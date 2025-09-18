module.exports = app => {
  const rol = require("../controllers/rol.controller.js");
  const auth = require("../middlewares/auth.middlewares.js");
  const router = require("express").Router();

  // Crear un rol → /api/roles/create
  router.post("/create", [auth.verifyToken, auth.isAdmin], rol.create);

  // Listar todos los roles → /api/roles/
  router.get("/", [auth.verifyToken, auth.isAdmin], rol.findAll);

  // Buscar un rol por ID → /api/roles/:id
  router.get("/:id", [auth.verifyToken, auth.isAdmin], rol.findOne);

  // Actualizar un rol → /api/roles/update/:id
  router.put("/update/:id", [auth.verifyToken, auth.isAdmin], rol.update);

  // Eliminar un rol → /api/roles/delete/:id
  router.delete("/delete/:id", [auth.verifyToken, auth.isAdmin], rol.delete);

  // Montamos todas las rutas en /api/roles
  app.use("/api/roles", router);
};
