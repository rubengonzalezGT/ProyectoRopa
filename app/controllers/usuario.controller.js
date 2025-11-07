const db = require("../models");
const Usuario = db.usuario;
const Rol = db.rol;
const Op = db.Sequelize.Op;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config.js"); 

// Crear usuario con rol
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, direccion, id_rol } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Email y password son obligatorios." });
    }

    // Validar duplicados
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).send({ message: "El email ya está registrado." });
    }

    // Encriptar password
    const hash = await bcrypt.hash(password, 10);

    const nuevo = await Usuario.create({
      nombre,
      email,
      password_hash: hash,
      direccion,
      id_rol, 
      estado: true
    });

    res.status(201).send({
      message: "Usuario creado correctamente.",
      id: nuevo.id_usuario,
      rol: id_rol
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al registrar usuario." });
  }
};

// Login con JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Email y password son requeridos." });
    }

    const user = await Usuario.findOne({
      where: { email },
      include: [{ model: Rol, as: "rol" }] 
    });

    if (!user) return res.status(401).send({ message: "Credenciales inválidas." });

    // Verificar si la cuenta está activa
    if (!user.estado) {
      return res.status(403).send({ 
        message: "Tu cuenta está desactivada. Por favor, contacta al administrador."
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).send({ message: "Credenciales inválidas." });

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, rol: user.rol?.nombre_rol },
      authConfig.secret,
      { expiresIn: authConfig.jwtExpiration }
    );

    res.send({
      id: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol?.nombre_rol,
      token
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al hacer login." });
  }
};

// Actualizar estado del usuario
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el usuario existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).send({ 
        message: "Usuario no encontrado." 
      });
    }

    // Actualizar el estado
    await Usuario.update(
      { estado }, 
      { where: { id_usuario: id } }
    );

    res.send({
      message: "Estado del usuario actualizado correctamente.",
      estado
    });
  } catch (err) {
    res.status(500).send({ 
      message: err.message || "Error al actualizar el estado del usuario." 
    });
  }
};

// Listar usuarios (solo admin)
exports.findAll = async (_req, res) => {
  try {
    const users = await Usuario.findAll({
      attributes: ["id_usuario", "nombre", "email", "direccion", "estado", "id_rol"],
      include: [{ model: Rol, as: "rol" }] 
    });
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener usuarios." });
  }
};

// Obtener perfil (basado en token)
exports.profile = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.userId, {
      attributes: ["id_usuario", "nombre", "email", "direccion", "estado"],
      include: [{ model: Rol, as: "rol" }] 
    });
    if (!user) return res.status(404).send({ message: "Usuario no encontrado." });
    res.send(user);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener perfil." });
  }
};
