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
      descuento = 0,     // 👈 Nuevo campo
      imagen_url = null, // 👈 Nuevo campo
      activo
    } = req.body;

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
      descuento,     // 👈 Guardamos el descuento
      imagen_url,    // 👈 Guardamos la URL de imagen
      activo: activo ?? true
    });

    res.status(201).send(nueva);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear variante." });
  }
};

/** Listar todas las variantes (con producto, stock e imágenes) */
exports.findAll = async (_req, res) => {
  try {
    const variantes = await Variante.findAll({
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" },
        { model: db.productoImagen, as: "imagenes" } // 👈 añadimos imágenes
      ]
    });

    const resultado = variantes.map(v => {
      const json = v.toJSON();

      // Normalizar stock
      json.stock = json.stock
        ? { cantidad: json.stock.stock, updated_at: json.stock.updated_at }
        : { cantidad: 0, updated_at: null };

      // Calcular precio final si hay descuento
      if (json.descuento) {
        const precioNum = parseFloat(json.precio_venta);
        const descuento = parseFloat(json.descuento);
        json.precio_final = +(precioNum - (precioNum * (descuento / 100))).toFixed(2);
      } else {
        json.precio_final = parseFloat(json.precio_venta);
      }

      return json;
    });

    res.send(resultado);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener variantes." });
  }
};


/** Buscar variante por ID (incluye producto, stock e imágenes) */
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

    const json = variante.toJSON();

    json.stock = json.stock
      ? { cantidad: json.stock.stock, updated_at: json.stock.updated_at }
      : { cantidad: 0, updated_at: null };

    if (json.descuento) {
      const precioNum = parseFloat(json.precio_venta);
      const descuento = parseFloat(json.descuento);
      json.precio_final = +(precioNum - (precioNum * (descuento / 100))).toFixed(2);
    } else {
      json.precio_final = parseFloat(json.precio_venta);
    }

    res.send(json);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener variante." });
  }
};


/** Actualizar variante */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // 👇 Permitimos actualizar también descuento e imagen_url
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

    const desc = parseFloat(json.descuento || 0);
    json.precio_final = parseFloat(json.precio_venta) * (1 - desc / 100);

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
