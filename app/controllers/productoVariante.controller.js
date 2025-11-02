const db = require("../models");
const Variante = db.productoVariante;
const Producto = db.producto;
const Stock = db.inventarioStock;

/** Crear variante */
exports.create = async (req, res) => {
  try {
    const {
      id_producto,
      sku,
      barcode,
      modelo,
      color,
      talla,
      precio_venta,
      precio_costo,
      descuento = 0,
      imagen_url,
      activo
    } = req.body;

    if (!id_producto) {
      return res.status(400).send({ message: "El id_producto es obligatorio." });
    }
    if (!precio_venta || !precio_costo) {
      return res.status(400).send({ message: "Los precios son obligatorios." });
    }

    // ✅ URL por defecto si no se envía una imagen
    const urlFinal =
      imagen_url && imagen_url.trim() !== ""
        ? imagen_url.trim()
        : "https://placehold.co/400x400?text=Sin+Imagen";

    const nueva = await Variante.create({
      id_producto,
      sku,
      barcode,
      modelo,
      color,
      talla,
      precio_venta,
      precio_costo,
      descuento,
      imagen_url: urlFinal,
      activo: activo ?? true
    });

    const varianteCompleta = await Variante.findByPk(nueva.id_variante, {
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" },
        { model: db.productoImagen, as: "imagenes" }
      ]
    });

    res.status(201).send(varianteCompleta);
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
        { model: Stock, as: "stock" },
        { model: db.productoImagen, as: "imagenes" }
      ]
    });
    res.send(variantes);
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
        { model: Stock, as: "stock" },
        { model: db.productoImagen, as: "imagenes" }
      ]
    });

    if (!variante) {
      return res.status(404).send({ message: "Variante no encontrada." });
    }

    res.send(variante);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener variante." });
  }
};

/** Actualizar variante */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Variante.update(req.body, { where: { id_variante: id } });

    if (updated !== 1) {
      return res.status(404).send({ message: "Variante no encontrada o sin cambios." });
    }

    const varianteActualizada = await Variante.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" },
        { model: db.productoImagen, as: "imagenes" }
      ]
    });

    res.send(varianteActualizada);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar variante." });
  }
};

/** Eliminar variante */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Variante.destroy({ where: { id_variante: id } });

    if (deleted !== 1) {
      return res.status(404).send({ message: "Variante no encontrada." });
    }

    res.send({ message: "Variante eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar variante." });
  }
};
