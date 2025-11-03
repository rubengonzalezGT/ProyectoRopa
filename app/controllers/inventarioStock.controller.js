const db = require("../models");
const Stock = db.inventarioStock;
const Variante = db.productoVariante;
const Mov = db.inventarioMov;

/** Crear o actualizar stock */
exports.create = async (req, res) => {
  try {
    const { id_variante, stock = 0 } = req.body;

    if (!id_variante) {
      return res.status(400).send({ message: "El id_variante es obligatorio." });
    }

    // Buscar stock existente
    let registro = await Stock.findByPk(id_variante);

    let tipoMovimiento = "ADJUST";
    let diferencia = 0;

    if (registro) {
      diferencia = stock - registro.stock;
      if (diferencia > 0) tipoMovimiento = "IN";
      else if (diferencia < 0) tipoMovimiento = "OUT";

      registro.stock = stock;
      registro.updated_at = new Date();
      await registro.save();
    } else {
      registro = await Stock.create({ id_variante, stock, updated_at: new Date() });
      tipoMovimiento = "IN"; // nuevo registro => entrada inicial
    }

    // Registrar movimiento
    if (diferencia !== 0) {
      await Mov.create({
        id_variante,
        tipo: tipoMovimiento,
        cantidad: Math.abs(diferencia),
        costo_unit: null,
        motivo: "Ajuste de stock manual",
        ref_tipo: "STOCK",
        ref_id: id_variante
      });
    }

    res.status(200).send({
      message: "Stock actualizado correctamente.",
      stock: registro
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

    if (!stock) return res.status(404).send({ message: "Stock no encontrado." });

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

    const registro = await Stock.findByPk(id);
    if (!registro) {
      return res.status(404).send({ message: "Stock no encontrado." });
    }

    const diferencia = cantidad - registro.stock;
    let tipoMovimiento = "ADJUST";
    if (diferencia > 0) tipoMovimiento = "IN";
    else if (diferencia < 0) tipoMovimiento = "OUT";

    registro.stock = cantidad;
    registro.updated_at = new Date();
    await registro.save();

    // Registrar movimiento
    if (diferencia !== 0) {
      await Mov.create({
        id_variante: id,
        tipo: tipoMovimiento,
        cantidad: Math.abs(diferencia),
        costo_unit: null,
        motivo: "Ajuste manual",
        ref_tipo: "STOCK",
        ref_id: id
      });
    }

    res.send({
      message: "Stock actualizado y movimiento registrado.",
      stock: registro
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar stock." });
  }
};

/** Eliminar registro */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Stock.destroy({ where: { id_variante: id } });

    if (deleted !== 1)
      return res.status(404).send({ message: "Stock no encontrado." });

    res.send({ message: "Stock eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar stock." });
  }
};
