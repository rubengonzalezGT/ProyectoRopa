const db = require("../models");
const Factura = db.factura;
const FacturaItem = db.facturaItem;
const Venta = db.venta;
const VentaItem = db.ventaItem;
const Variante = db.productoVariante;
const Cliente = db.cliente;

/** Crear factura desde una venta */
exports.createFromVenta = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente, as: "cliente" },
        { model: VentaItem, as: "items", include: [{ model: Variante, as: "variante" }] }
      ]
    });

    if (!venta) {
      await t.rollback();
      return res.status(404).send({ message: "Venta no encontrada." });
    }

    // Verificar si ya existe factura para esta venta
    const existeFactura = await Factura.findOne({ where: { id_venta: venta.id_venta } });
    if (existeFactura) {
      await t.rollback();
      return res.status(400).send({ message: "Ya existe una factura para esta venta." });
    }

    // Crear factura
    const factura = await Factura.create({
      id_venta: venta.id_venta,
      serie: "A", 
      numero: `F-${venta.id_venta.toString().padStart(5, "0")}`,
      nit_receptor: venta.cliente?.nit || "CF",
      nombre_receptor: venta.cliente?.nombre || "Consumidor Final",
      direccion_rec: venta.cliente?.direccion || "Ciudad",
      subtotal: venta.subtotal,
      impuesto: venta.impuesto,
      total: venta.total
    }, { transaction: t });

    // Crear items de factura desde ventaItems
    for (const item of venta.items) {
      await FacturaItem.create({
        id_factura: factura.id_factura,
        descripcion: item.variante.modelo + (item.variante.color ? ` - ${item.variante.color}` : ""),
        cantidad: item.cantidad,
        precio_unit: item.precio_unit,
        descuento: item.descuento,
        impuesto: item.impuesto,
        total: item.total
      }, { transaction: t });
    }

    await t.commit();

    const full = await Factura.findByPk(factura.id_factura, {
      include: [
        { model: Venta, as: "venta" },
        { model: FacturaItem, as: "items" }
      ]
    });

    res.status(201).send(full);
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error al generar factura." });
  }
};

/** Listar todas las facturas */
exports.findAll = async (_req, res) => {
  try {
    const facturas = await Factura.findAll({
      include: [
        { model: Venta, as: "venta" },
        { model: FacturaItem, as: "items" }
      ],
      order: [["id_factura", "DESC"]]
    });
    res.send(facturas);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener facturas." });
  }
};

/** Obtener factura por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const factura = await Factura.findByPk(id, {
      include: [
        { model: Venta, as: "venta" },
        { model: FacturaItem, as: "items" }
      ]
    });

    if (!factura) return res.status(404).send({ message: "Factura no encontrada." });

    res.send(factura);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener factura con id=" + req.params.id });
  }
};

/** Eliminar factura */
exports.delete = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    await FacturaItem.destroy({ where: { id_factura: id }, transaction: t });
    const deleted = await Factura.destroy({ where: { id_factura: id }, transaction: t });

    if (deleted !== 1) {
      await t.rollback();
      return res.status(404).send({ message: "Factura no encontrada." });
    }

    await t.commit();
    res.send({ message: "Factura eliminada correctamente." });
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error al eliminar factura." });
  }
};
