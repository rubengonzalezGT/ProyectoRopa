const db = require("../models");
const Rol = db.rol;

// Crear rol
exports.create = async (req, res) => {
  try {
    if (!req.body.nombre_rol) {
      return res.status(400).send({ message: "El campo nombre_rol es obligatorio." });
    }

    // Verificar duplicados
    const existe = await Rol.findOne({ where: { nombre_rol: req.body.nombre_rol } });
    if (existe) {
      return res.status(409).send({ message: "Ese rol ya existe." });
    }

    const rol = await Rol.create({ nombre_rol: req.body.nombre_rol });
    res.status(201).send(rol);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear rol." });
  }
};

// Listar roles
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
    const [updated] = await Rol.update(
      { nombre_rol: req.body.nombre_rol },
      { where: { id_rol: req.params.id } }
    );

    if (updated !== 1) {
      return res.status(404).send({ message: "Rol no encontrado o sin cambios." });
    }

    const rol = await Rol.findByPk(req.params.id);
    res.send(rol);
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
