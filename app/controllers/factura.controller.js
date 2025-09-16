// app/controllers/factura.controller.js
// Controller de Factura para tienda de ropa (PostgreSQL + Sequelize)

const db = require("../models");

const Factura = db.facturas;
const FacturaItem = db.facturaItems;

const Venta = db.ventas;
const VentaItem = db.ventaItems;

const Cliente = db.clientes;
const ProductoVariante = db.productoVariantes;
const Producto = db.productos;

const { sequelize } = db;
const Op = db.Sequelize.Op;

/** Helpers de paginación */
const getPagination = (page = 1, size = 10) => {
  const limit = Number(size) > 0 ? Number(size) : 10;
  const offset = Number(page) > 0 ? (Number(page) - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = Number(page) || 1;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return { totalItems, items: rows, totalPages, currentPage };
};

/**
 * Crear factura desde una venta (snapshot fiscal)
 * body: {
 *   id_venta: number (requerido),
 *   serie?: string,
 *   numero?: string,
 *   receptor?: { nit?: string, nombre?: string, direccion?: string },
 *   uuid_sat?: string,
 *   pdf_url?: string
 * }
 */
exports.createFromVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_venta, serie, numero, receptor, uuid_sat, pdf_url } = req.body || {};
    if (!id_venta) return res.status(400).send({ message: "id_venta es requerido." });

    // 1) Validar que la venta exista + traer items y cliente
    const venta = await Venta.findByPk(id_venta, {
      include: [
        { model: VentaItem, include: [{ model: ProductoVariante, include: [Producto] }] },
        { model: Cliente }
      ],
      transaction: t
    });
    if (!venta) {
      await t.rollback();
      return res.status(404).send({ message: "Venta no encontrada." });
    }

    // 2) Asegurar que la venta no tenga ya una factura
    const ya = await Factura.findOne({ where: { id_venta }, transaction: t });
    if (ya) {
      await t.rollback();
      return res.status(409).send({ message: "La venta ya tiene una factura emitida." });
    }

    // 3) Datos del receptor: usa receptor enviado o toma del cliente en la venta
    const nit_receptor = receptor?.nit ?? venta.Cliente?.nit ?? null;
    const nombre_receptor = receptor?.nombre ?? venta.Cliente?.nombre ?? null;
    const direccion_rec = receptor?.direccion ?? venta.Cliente?.direccion ?? null;

    // 4) Totales desde la venta (snapshot)
    const subtotal = venta.subtotal ?? 0;
    const impuesto = venta.impuesto ?? 0;
    const total = venta.total ?? (subtotal + impuesto);

    // 5) Crear encabezado Factura
    const factura = await Factura.create({
      id_venta,
      serie: serie ?? null,
      numero: numero ?? null,
      fecha_emision: new Date(),
      nit_receptor,
      nombre_receptor,
      direccion_rec,
      subtotal,
      impuesto,
      total,
      uuid_sat: uuid_sat ?? null,
      pdf_url: pdf_url ?? null
    }, { transaction: t });

    // 6) Crear items (snapshot fiscal de cada línea de venta)
    // descripcion sugerida: "NombreProducto Color Talla (SKU: xxx)"
    for (const vi of venta.venta_items || venta.VentaItems || []) {
      const pv = vi.producto_variante || vi.ProductoVariante;
      const p = pv?.producto || pv?.Producto;

      const color = pv?.color ? ` ${pv.color}` : "";
      const talla = pv?.talla ? ` ${pv.talla}` : "";
      const skuTxt = pv?.sku ? ` (SKU: ${pv.sku})` : "";
      const nombreProd = p?.nombre ? p.nombre : "Producto";
      const descripcion = `${nombreProd}${color}${talla}${skuTxt}`.trim();

      await FacturaItem.create({
        id_factura: factura.id_factura,
        descripcion,
        cantidad: vi.cantidad,
        precio_unit: vi.precio_unit,
        descuento: vi.descuento ?? 0,
        impuesto: vi.impuesto ?? 0,
        total: vi.total ?? ((vi.precio_unit * vi.cantidad - (vi.descuento || 0)) * 1.12)
      }, { transaction: t });
    }

    await t.commit();

    // 7) Devolver factura con items
    const full = await Factura.findByPk(factura.id_factura, {
      include: [FacturaItem],
    });
    return res.status(201).send(full);

  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error al crear factura desde venta." });
  }
};

/**
 * (Opcional) Crear factura manual (si no proviene de venta)
 * body: {
 *   serie?, numero?, receptor: { nit?, nombre?, direccion? },
 *   items: [{ descripcion, cantidad, precio_unit, descuento?, impuesto?, total? }]
 *   subtotal?, impuesto?, total?, uuid_sat?, pdf_url?
 * }
 */
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { serie, numero, receptor, items, subtotal, impuesto, total, uuid_sat, pdf_url } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).send({ message: "Se requiere al menos un item para la factura." });
    }

    const calcSubtotal = items.reduce((acc, it) => acc + (Number(it.precio_unit) * Number(it.cantidad) - Number(it.descuento || 0)), 0);
    const calcImpuesto = items.reduce((acc, it) => acc + Number(it.impuesto || 0), 0);
    const calcTotal = items.reduce((acc, it) => acc + Number(it.total || ((it.precio_unit * it.cantidad - (it.descuento || 0)) * 1.12)), 0);

    const factura = await Factura.create({
      id_venta: null,
      serie: serie ?? null,
      numero: numero ?? null,
      fecha_emision: new Date(),
      nit_receptor: receptor?.nit ?? null,
      nombre_receptor: receptor?.nombre ?? null,
      direccion_rec: receptor?.direccion ?? null,
      subtotal: subtotal ?? calcSubtotal,
      impuesto: impuesto ?? calcImpuesto,
      total: total ?? calcTotal,
      uuid_sat: uuid_sat ?? null,
      pdf_url: pdf_url ?? null
    }, { transaction: t });

    for (const it of items) {
      await FacturaItem.create({
        id_factura: factura.id_factura,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precio_unit: it.precio_unit,
        descuento: it.descuento ?? 0,
        impuesto: it.impuesto ?? 0,
        total: it.total ?? ((it.precio_unit * it.cantidad - (it.descuento || 0)) * 1.12)
      }, { transaction: t });
    }

    await t.commit();

    const full = await Factura.findByPk(factura.id_factura, { include: [FacturaItem] });
    res.status(201).send(full);
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error al crear la factura." });
  }
};

/**
 * Listar facturas (filtros: q=serie/numero/nit/nombre, fecha_ini, fecha_fin) con paginación
 * query: q?, fecha_ini?, fecha_fin? (YYYY-MM-DD), page?, size?
 */
exports.findAll = async (req, res) => {
  try {
    const { q, fecha_ini, fecha_fin, page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = {};

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      where[Op.or] = [
        { serie: { [Op.iLike]: term } },
        { numero: { [Op.iLike]: term } },
        { nit_receptor: { [Op.iLike]: term } },
        { nombre_receptor: { [Op.iLike]: term } }
      ];
    }

    if (fecha_ini || fecha_fin) {
      where.fecha_emision = {};
      if (fecha_ini) where.fecha_emision[Op.gte] = new Date(`${fecha_ini}T00:00:00`);
      if (fecha_fin) where.fecha_emision[Op.lte] = new Date(`${fecha_fin}T23:59:59`);
    }

    const data = await Factura.findAndCountAll({
      where,
      limit,
      offset,
      order: [["fecha_emision", "DESC"], ["id_factura", "DESC"]],
      include: [] // puedes incluir Cliente vía Venta si quieres
    });

    res.send(getPagingData(data, page, limit));
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener facturas." });
  }
};

/** Obtener una factura con sus items */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const factura = await Factura.findByPk(id, {
      include: [FacturaItem]
    });
    if (!factura) return res.status(404).send({ message: "Factura no encontrada." });
    res.send(factura);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener factura con id=" + req.params.id });
  }
};

/**
 * Actualizar una factura (campos administrativos: serie, numero, uuid_sat, pdf_url, receptor)
 * params: id
 * body: { serie?, numero?, uuid_sat?, pdf_url?, nit_receptor?, nombre_receptor?, direccion_rec? }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const permitted = {
      serie: req.body.serie,
      numero: req.body.numero,
      uuid_sat: req.body.uuid_sat,
      pdf_url: req.body.pdf_url,
      nit_receptor: req.body.nit_receptor,
      nombre_receptor: req.body.nombre_receptor,
      direccion_rec: req.body.direccion_rec
    };

    const [affected] = await Factura.update(permitted, { where: { id_factura: id } });

    if (affected !== 1) {
      return res.status(404).send({ message: "Factura no encontrada o sin cambios." });
    }

    const updated = await Factura.findByPk(id, { include: [FacturaItem] });
    res.send(updated);
  } catch (err) {
    res.status(500).send({ message: "Error actualizando factura con id=" + req.params.id });
  }
};

/** Eliminar factura (y sus items por ON DELETE CASCADE) */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Factura.destroy({ where: { id_factura: id } });
    if (deleted !== 1) {
      return res.status(404).send({ message: "Factura no encontrada." });
    }
    res.send({ message: "Factura eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "No se pudo eliminar la factura." });
  }
};
