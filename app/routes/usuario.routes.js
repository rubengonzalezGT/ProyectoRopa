module.exports = app => {
  const usuario = require("../controllers/usuario.controller.js");
  const auth = require("../middlewares/auth.middlewares.js"); // 👈 importamos middleware
  const router = require("express").Router();

  // Registro (crear usuario con rol)
  router.post("/register", usuario.register);

  // Login
  router.post("/login", usuario.login);

  // Listar todos los usuarios (solo admin)
  router.get("/", [auth.verifyToken, auth.isAdmin], usuario.findAll);

  // Obtener perfil del usuario autenticado
  router.get("/profile", [auth.verifyToken], usuario.profile);

  // Actualizar estado de usuario (solo admin)
  router.put("/:id/estado", [auth.verifyToken, auth.isAdmin], usuario.updateStatus);

  // Alias para /me (para compatibilidad con frontend)
  router.get("/me", [auth.verifyToken], usuario.profile);

  app.use("/api/usuarios", router);
};
