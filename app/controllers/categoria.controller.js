const db = require("../models");
const Categoria = db.categoria;
const Producto = db.producto;

// Crear nueva categoría
exports.create = async (req, res) => {
  try {
    if (!req.body.nombre) {
      return res.status(400).send({ message: "El nombre de la categoría es obligatorio." });
    }

    const categoria = await Categoria.create({
      nombre: req.body.nombre
    });

    res.status(201).send(categoria);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear la categoría." });
  }
};

// Listar todas las categorías con sus productos
exports.findAll = async (_req, res) => {
  try {
    const categorias = await Categoria.findAll({
      include: [{ model: Producto, as: "productos" }]
    });
    res.send(categorias);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener categorías." });
  }
};

// Buscar categoría por ID
exports.findOne = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: [{ model: Producto, as: "productos" }]
    });
    if (!categoria) return res.status(404).send({ message: "Categoría no encontrada." });
    res.send(categoria);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener la categoría." });
  }
};

// Actualizar categoría
exports.update = async (req, res) => {
  try {
    const [updated] = await Categoria.update(req.body, { where: { id_categoria: req.params.id } });
    if (updated !== 1) return res.status(404).send({ message: "Categoría no encontrada o sin cambios." });

    const categoria = await Categoria.findByPk(req.params.id, {
      include: [{ model: Producto, as: "productos" }]
    });
    res.send(categoria);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar la categoría." });
  }
};

// Eliminar categoría
exports.delete = async (req, res) => {
  try {
    const deleted = await Categoria.destroy({ where: { id_categoria: req.params.id } });
    if (deleted !== 1) return res.status(404).send({ message: "Categoría no encontrada." });

    res.send({ message: "Categoría eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar la categoría." });
  }
};
