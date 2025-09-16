const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config.js");

// Middleware para verificar el token JWT
exports.verifyToken = (req, res, next) => {
  let token =
    req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res
      .status(403)
      .send({ message: "No se proporcionó un token en la petición." });
  }

  // Si viene con el prefijo "Bearer ", lo quitamos
  if (typeof token === "string" && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Token inválido o expirado." });
    }
    // Guardamos los datos del token en la request
    req.userId = decoded.id;
    req.userRol = decoded.rol;
    next();
  });
};

// Middleware para validar si el usuario es admin
exports.isAdmin = (req, res, next) => {
  if (req.userRol !== "admin") {
    return res
      .status(403)
      .send({ message: "Acceso denegado: se requiere rol de administrador." });
  }
  next();
};
