const db = require("../models");
const InventarioMov = db.inventarioMov;
const Stock = db.inventarioStock;
const Variante = db.productoVariante;

/**
 * Crear un movimiento de inventario
 * tipo: "IN", "OUT", "ADJUST"
 */
exports.create = async (req, res) => {
  try {
    const { id_variante, tipo, cantidad, costo_unit, motivo, ref_tipo, ref_id } = req.body;

    if (!id_variante || !tipo || !cantidad) {
      return res.status(400).send({ message: "id_variante, tipo y cantidad son obligatorios." });
    }

    // Crear movimiento
    const mov = await InventarioMov.create({
      id_variante,
      tipo,
      cantidad,
      costo_unit: costo_unit || null,
      motivo: motivo || null,
      ref_tipo: ref_tipo || null,
      ref_id: ref_id || null,
      created_at: new Date()
    });

    // Buscar stock actual
    let stock = await Stock.findOne({ where: { id_variante } });

    if (!stock) {
      stock = await Stock.create({ id_variante, stock: 0 });
    }

    // Ajustar stock según el tipo
    if (tipo === "IN") {
      stock.stock += cantidad;
    } else if (tipo === "OUT") {
      stock.stock -= cantidad;
      if (stock.stock < 0) stock.stock = 0; // evitar negativos
    } else if (tipo === "ADJUST") {
      stock.stock = cantidad; // en ajuste la cantidad es el nuevo stock
    }

    await stock.save();

    res.status(201).send({ mov, stock });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al registrar movimiento." });
  }
};

/** Listar todos los movimientos */
exports.findAll = async (_req, res) => {
  try {
    const movimientos = await InventarioMov.findAll({
      include: [{ model: Variante, as: "variante" }],
      order: [["created_at", "DESC"]]
    });
    res.send(movimientos);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener movimientos." });
  }
};

/** Obtener un movimiento por ID */
exports.findOne = async (req, res) => {
  try {
    const mov = await InventarioMov.findByPk(req.params.id, {
      include: [{ model: Variante, as: "variante" }]
    });
    if (!mov) return res.status(404).send({ message: "Movimiento no encontrado." });
    res.send(mov);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener movimiento." });
  }
};

/* Eliminar un movimiento */
exports.delete = async (req, res) => {
  try {
    const deleted = await InventarioMov.destroy({ where: { id_mov: req.params.id } });
    if (deleted !== 1) {
      return res.status(404).send({ message: "Movimiento no encontrado." });
    }
    res.send({ message: "Movimiento eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar movimiento." });
  }
};
