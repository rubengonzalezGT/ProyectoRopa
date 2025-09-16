const db = require("../models");
const Rol = db.rol;
const Op = db.Sequelize.Op;

// Crear un rol
exports.create = async (req, res) => {
  try {
    if (!req.body.nombre_rol) {
      return res.status(400).send({ message: "El campo nombre_rol es obligatorio." });
    }

    const rol = await Rol.create({ nombre_rol: req.body.nombre_rol });
    res.status(201).send(rol);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear rol." });
  }
};

// Listar todos los roles
exports.findAll = async (_req, res) => {
  try {
    const roles = await Rol.findAll();
    res.send(roles);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener roles." });
  }
};

// Buscar rol por ID
exports.findOne = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (!rol) return res.status(404).send({ message: "Rol no encontrado." });
    res.send(rol);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener rol." });
  }
};

// Actualizar rol
exports.update = async (req, res) => {
  try {
    const [affected] = await Rol.update(
      { nombre_rol: req.body.nombre_rol },
      { where: { id_rol: req.params.id } }
    );

    if (affected !== 1) {
      return res.status(404).send({ message: "Rol no encontrado o sin cambios." });
    }

    const updated = await Rol.findByPk(req.params.id);
    res.send(updated);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar rol." });
  }
};

// Eliminar rol
exports.delete = async (req, res) => {
  try {
    const deleted = await Rol.destroy({ where: { id_rol: req.params.id } });
    if (deleted !== 1) {
      return res.status(404).send({ message: "Rol no encontrado." });
    }
    res.send({ message: "Rol eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar rol." });
  }
};
