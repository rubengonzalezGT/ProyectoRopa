const db = require("../models");
const Proveedor = db.proveedor;

// Crear proveedor
exports.create = async (req, res) => {
  try {
    const { nombre, direccion, telefono, email, activo } = req.body;

    if (!nombre) {
      return res.status(400).send({ message: "El nombre del proveedor es obligatorio." });
    }

    const proveedor = await Proveedor.create({
      nombre,
      direccion: direccion || null,
      telefono: telefono || null,
      email: email || null,
      activo: activo ?? true
    });

    res.status(201).send(proveedor);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear proveedor." });
  }
};

// Obtener todos los proveedores
exports.findAll = async (_req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.send(proveedores);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener proveedores." });
  }
};

// Obtener proveedor por ID
exports.findOne = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).send({ message: "Proveedor no encontrado." });
    res.send(proveedor);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener proveedor." });
  }
};

// Actualizar proveedor
exports.update = async (req, res) => {
  try {
    const [updated] = await Proveedor.update(req.body, { where: { id_proveedor: req.params.id } });
    if (updated !== 1) return res.status(404).send({ message: "Proveedor no encontrado o sin cambios." });

    const proveedor = await Proveedor.findByPk(req.params.id);
    res.send(proveedor);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar proveedor." });
  }
};

// Eliminar proveedor
exports.delete = async (req, res) => {
  try {
    const deleted = await Proveedor.destroy({ where: { id_proveedor: req.params.id } });
    if (deleted !== 1) return res.status(404).send({ message: "Proveedor no encontrado." });

    res.send({ message: "Proveedor eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar proveedor." });
  }
};
