const db = require("../models");
const CompraItem = db.compraItem;
const Compra = db.compra;
const Variante = db.productoVariante;
const Proveedor = db.proveedor;
const Usuario = db.usuario;
const InventarioMov = db.inventarioMov;
const Stock = db.inventarioStock;

/* Helper: recalcular totales y devolver la compra con todo */
async function getCompraCompleta(id_compra) {
  // recalcular totales
  const items = await CompraItem.findAll({ where: { id_compra } });
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
  const impuesto = subtotal * 0.12;
  const total = subtotal + impuesto;

  await Compra.update({ subtotal, impuesto, total }, { where: { id_compra } });

  // devolver compra completa
  return Compra.findByPk(id_compra, {
    include: [
      { model: Proveedor, as: "proveedor" },
      { model: Usuario, as: "usuario" },
      {
        model: CompraItem,
        as: "items",
        include: [{ model: Variante, as: "variante" }]
      }
    ]
  });
}

/** Crear item */
exports.create = async (req, res) => {
  try {
    const { id_compra, id_variante, cantidad, costo_unit } = req.body;
    if (!id_compra || !id_variante || !cantidad || !costo_unit) {
      return res.status(400).send({ message: "Faltan datos obligatorios." });
    }

    // crear item
    const subtotalItem = cantidad * costo_unit;
    await CompraItem.create({
      id_compra,
      id_variante,
      cantidad,
      costo_unit,
      subtotal: subtotalItem
    });

    // movimiento inventario
    await InventarioMov.create({
      id_variante,
      tipo: "IN",
      cantidad,
      costo_unit,
      motivo: "Compra",
      ref_tipo: "COMPRA",
      ref_id: id_compra
    });

    // stock
    const stock = await Stock.findByPk(id_variante);
    if (stock) {
      stock.stock += cantidad;
      stock.updated_at = new Date();
      await stock.save();
    } else {
      await Stock.create({ id_variante, stock: cantidad, updated_at: new Date() });
    }

    const compra = await getCompraCompleta(id_compra);
    res.status(201).send(compra);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear compra item." });
  }
};

/** Listar todos los items */
exports.findAll = async (_req, res) => {
  try {
    const items = await CompraItem.findAll({
      include: [
        { model: Compra, as: "compra" },
        { model: Variante, as: "variante" }
      ]
    });
    res.send(items);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener items de compra." });
  }
};

/** Buscar item por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CompraItem.findByPk(id, {
      include: [
        { model: Compra, as: "compra" },
        { model: Variante, as: "variante" }
      ]
    });
    if (!item) return res.status(404).send({ message: "Item de compra no encontrado." });
    res.send(item);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener item con id=" + req.params.id });
  }
};

/** Actualizar item */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, costo_unit } = req.body;

    const item = await CompraItem.findByPk(id);
    if (!item) return res.status(404).send({ message: "Item no encontrado." });

    // ajustar stock
    const diffCantidad = cantidad - item.cantidad;
    const stock = await Stock.findByPk(item.id_variante);
    if (stock) {
      stock.stock += diffCantidad;
      stock.updated_at = new Date();
      await stock.save();
    }

    // actualizar item
    item.cantidad = cantidad;
    item.costo_unit = costo_unit;
    item.subtotal = cantidad * costo_unit;
    await item.save();

    const compra = await getCompraCompleta(item.id_compra);
    res.send(compra);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar item." });
  }
};

/** Eliminar item */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CompraItem.findByPk(id);
    if (!item) return res.status(404).send({ message: "Item no encontrado." });

    // restar stock
    const stock = await Stock.findByPk(item.id_variante);
    if (stock) {
      stock.stock -= item.cantidad;
      stock.updated_at = new Date();
      await stock.save();
    }

    // eliminar item
    await CompraItem.destroy({ where: { id_item: id } });

    const compra = await getCompraCompleta(item.id_compra);
    res.send(compra);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar item." });
  }
};
