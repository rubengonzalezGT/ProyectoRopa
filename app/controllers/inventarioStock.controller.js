const db = require("../models");
const Stock = db.inventarioStock;
const Variante = db.productoVariante;

/** Crear registro de stock (solo si no existe para esa variante) */
exports.create = async (req, res) => {
  try {
    const { id_variante, stock } = req.body;

    if (!id_variante) {
      return res.status(400).send({ message: "El id_variante es obligatorio." });
    }

    // Verificar si ya existe stock para esa variante
    const existe = await Stock.findByPk(id_variante);
    if (existe) {
      return res.status(400).send({ message: "El stock ya existe para esta variante." });
    }

    const nuevo = await Stock.create({
      id_variante,
      stock: stock ?? 0
    });

    res.status(201).send(nuevo);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear registro de stock." });
  }
};

/** Listar todos los registros de stock */
exports.findAll = async (_req, res) => {
  try {
    const stocks = await Stock.findAll({
      include: [{ model: Variante, as: "variante" }]
    });
    res.send(stocks);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener stocks." });
  }
};

/** Obtener stock de una variante */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params; // id = id_variante
    const stock = await Stock.findByPk(id, {
      include: [{ model: Variante, as: "variante" }]
    });

    if (!stock) {
      return res.status(404).send({ message: "Stock no encontrado." });
    }

    res.send(stock);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener stock." });
  }
};

/** Actualizar stock */
exports.update = async (req, res) => {
  try {
    const { id } = req.params; // id = id_variante
    const [updated] = await Stock.update(
      { ...req.body, updated_at: new Date() },
      { where: { id_variante: id } }
    );

    if (updated !== 1) {
      return res.status(404).send({ message: "Stock no encontrado o sin cambios." });
    }

    const stock = await Stock.findByPk(id, {
      include: [{ model: Variante, as: "variante" }]
    });

    res.send(stock);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar stock." });
  }
};

/** Eliminar stock */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params; // id = id_variante
    const deleted = await Stock.destroy({ where: { id_variante: id } });

    if (deleted !== 1) {
      return res.status(404).send({ message: "Stock no encontrado." });
    }

    res.send({ message: "Stock eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar stock." });
  }
};
