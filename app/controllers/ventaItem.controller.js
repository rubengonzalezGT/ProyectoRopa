const db = require("../models");
const VentaItem = db.ventaItem;
const Venta = db.venta;
const Variante = db.productoVariante;
const Stock = db.inventarioStock;
const InventarioMov = db.inventarioMov;

/* Helper: recalcular totales de la venta */
async function recalcularTotales(id_venta) {
  const items = await VentaItem.findAll({ where: { id_venta } });
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
  const descuento = items.reduce((sum, i) => sum + parseFloat(i.descuento || 0), 0);
  const impuesto = items.reduce((sum, i) => sum + parseFloat(i.impuesto || 0), 0);
  const total = subtotal - descuento + impuesto;

  await Venta.update({ subtotal, descuento, impuesto, total }, { where: { id_venta } });
  return { subtotal, descuento, impuesto, total };
}

/** Crear item de venta */
exports.create = async (req, res) => {
  try {
    const { id_venta, id_variante, cantidad, precio_unit, descuento = 0 } = req.body;
    if (!id_venta || !id_variante || !cantidad) {
      return res.status(400).send({ message: "Faltan datos obligatorios." });
    }

    const variante = await Variante.findByPk(id_variante);
    if (!variante) return res.status(404).send({ message: "Variante no encontrada." });

    //  Validar stock antes de descontar
    const stock = await Stock.findByPk(id_variante);
    if (!stock || stock.stock < cantidad) {
      return res.status(400).send({ message: "Stock insuficiente para esta venta." });
    }

    const precioFinal = precio_unit ?? parseFloat(variante.precio_venta);
    const subtotal = cantidad * precioFinal;
    const impuesto = subtotal * 0.12;
    const total = subtotal - descuento + impuesto;

    const item = await VentaItem.create({
      id_venta,
      id_variante,
      cantidad,
      precio_unit: precioFinal,
      descuento,
      impuesto,
      subtotal,
      total
    });

    await recalcularTotales(id_venta);

    //  Movimiento inventario
    await InventarioMov.create({
      id_variante,
      tipo: "OUT",
      cantidad,
      costo_unit: variante.precio_costo,
      motivo: "Venta",
      ref_tipo: "VENTA",
      ref_id: id_venta
    });

    //  Descontar stock (ahora sí)
    stock.stock -= cantidad;
    stock.updated_at = new Date();
    await stock.save();

    const venta = await Venta.findByPk(id_venta);
    res.status(201).send({ ...item.toJSON(), venta });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear item de venta." });
  }
};


/** Listar todos los items */
exports.findAll = async (_req, res) => {
  try {
    const items = await VentaItem.findAll({
      include: [
        { model: Venta, as: "venta" },
        { model: Variante, as: "variante" }
      ]
    });
    res.send(items);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener items de venta." });
  }
};

/** Buscar item por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await VentaItem.findByPk(id, {
      include: [
        { model: Venta, as: "venta" },
        { model: Variante, as: "variante" }
      ]
    });
    if (!item) return res.status(404).send({ message: "Item de venta no encontrado." });
    res.send(item);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener item con id=" + req.params.id });
  }
};

/** Actualizar item de venta */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, precio_unit, descuento } = req.body;

    const item = await VentaItem.findByPk(id);
    if (!item) return res.status(404).send({ message: "Item no encontrado." });

    // Diferencia de cantidad (para ajustar stock)
    const diffCantidad = cantidad - item.cantidad;

    const variante = await Variante.findByPk(item.id_variante);
    if (!variante) return res.status(404).send({ message: "Variante no encontrada." });

    const precioFinal = precio_unit ?? item.precio_unit;
    const subtotal = cantidad * precioFinal;
    const imp = subtotal * 0.12;
    const total = subtotal - (descuento ?? item.descuento) + imp;

    item.cantidad = cantidad;
    item.precio_unit = precioFinal;
    item.descuento = descuento ?? item.descuento;
    item.impuesto = imp;
    item.subtotal = subtotal;
    item.total = total;
    await item.save();

    // Ajustar stock
    const stock = await Stock.findByPk(item.id_variante);
    if (stock) {
      stock.stock -= diffCantidad;
      stock.updated_at = new Date();
      await stock.save();
    }

    await recalcularTotales(item.id_venta);

    const actualizado = await VentaItem.findByPk(id, {
      include: [
        { model: Venta, as: "venta" },
        { model: Variante, as: "variante" }
      ]
    });
    res.send(actualizado);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar item de venta." });
  }
};

/** Eliminar item de venta */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await VentaItem.findByPk(id);
    if (!item) return res.status(404).send({ message: "Item no encontrado." });

    // Revertir stock
    const stock = await Stock.findByPk(item.id_variante);
    if (stock) {
      stock.stock += item.cantidad;
      stock.updated_at = new Date();
      await stock.save();
    }

    await VentaItem.destroy({ where: { id_item: id } });
    await recalcularTotales(item.id_venta);

    res.send({ message: "Item eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar item de venta." });
  }
};
