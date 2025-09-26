const db = require("../models");
const Variante = db.productoVariante;
const Producto = db.producto;
const Stock = db.inventarioStock;

/** Crear variante */
exports.create = async (req, res) => {
  try {
    const { id_producto, sku, barcode, modelo, color, talla, precio_venta, precio_costo, activo } = req.body;

    if (!id_producto) {
      return res.status(400).send({ message: "El id_producto es obligatorio." });
    }
    if (!precio_venta || !precio_costo) {
      return res.status(400).send({ message: "Los precios son obligatorios." });
    }

    const nueva = await Variante.create({
      id_producto,
      sku,
      barcode,
      modelo,
      color,
      talla,
      precio_venta,
      precio_costo,
      activo: activo ?? true
    });

    res.status(201).send(nueva);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear variante." });
  }
};

/** Listar todas las variantes */
exports.findAll = async (_req, res) => {
  try {
    const variantes = await Variante.findAll({
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" }
      ]
    });

    const resultado = variantes.map(v => {
      const json = v.toJSON();
      json.stock = json.stock
        ? { cantidad: json.stock.stock, updated_at: json.stock.updated_at }
        : { cantidad: 0, updated_at: null };
      return json;
    });

    res.send(resultado);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener variantes." });
  }
};

/** Buscar variante por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const variante = await Variante.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" }
      ]
    });

    if (!variante) {
      return res.status(404).send({ message: "Variante no encontrada." });
    }

    const json = variante.toJSON();
    json.stock = json.stock
      ? { cantidad: json.stock.stock, updated_at: json.stock.updated_at }
      : { cantidad: 0, updated_at: null };

    res.send(json);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener variante." });
  }
};

/** Actualizar variante */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Variante.update(req.body, {
      where: { id_variante: id }
    });

    if (updated !== 1) {
      return res.status(404).send({ message: "Variante no encontrada o sin cambios." });
    }

    const varianteActualizada = await Variante.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" }
      ]
    });

    const json = varianteActualizada.toJSON();
    json.stock = json.stock
      ? { cantidad: json.stock.stock, updated_at: json.stock.updated_at }
      : { cantidad: 0, updated_at: null };

    res.send(json);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar variante." });
  }
};

/** Eliminar variante */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Variante.destroy({
      where: { id_variante: id }
    });

    if (deleted !== 1) {
      return res.status(404).send({ message: "Variante no encontrada." });
    }

    res.send({ message: "Variante eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar variante." });
  }
};
