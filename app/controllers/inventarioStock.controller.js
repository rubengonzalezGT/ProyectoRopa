const db = require("../models");
const Stock = db.inventarioStock;
const Variante = db.productoVariante;

/** Crear registro de stock (automático o manual) */
exports.create = async (req, res) => {
  try {
    const { id_variante, stock = 0 } = req.body;

    if (!id_variante) {
      return res.status(400).send({ message: "El id_variante es obligatorio." });
    }

    // Verificar si ya existe stock para esa variante
    const existente = await Stock.findByPk(id_variante);
    if (existente) {
      // 👇 Si ya existe, solo actualizamos el valor
      existente.stock = stock;
      existente.updated_at = new Date();
      await existente.save();
      return res.status(200).send({
        message: "Stock actualizado correctamente (ya existía).",
        stock: existente
      });
    }

    // Crear nuevo registro
    const nuevo = await Stock.create({
      id_variante,
      stock,
      updated_at: new Date()
    });

    res.status(201).send({
      message: "Stock creado correctamente.",
      stock: nuevo
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear o actualizar stock." });
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
    const { id } = req.params;
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

/** Actualizar stock manualmente */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).send({ message: "Stock no encontrado." });
    }

    stock.stock = cantidad ?? stock.stock;
    stock.updated_at = new Date();
    await stock.save();

    res.send({
      message: "Stock actualizado correctamente.",
      stock
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar stock." });
  }
};

/** Eliminar registro de stock */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Stock.destroy({ where: { id_variante: id } });

    if (deleted !== 1) {
      return res.status(404).send({ message: "Stock no encontrado." });
    }

    res.send({ message: "Stock eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar stock." });
  }
};
