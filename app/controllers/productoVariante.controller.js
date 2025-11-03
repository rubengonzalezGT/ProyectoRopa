const db = require("../models");
const Variante = db.productoVariante;
const Producto = db.producto;
const Stock = db.inventarioStock;

/** Crear variante */
exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    let {
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

    // ✅ Normalizaciones y validaciones
    const productoId = parseInt(id_producto, 10);
    if (!productoId || Number.isNaN(productoId)) {
      await t.rollback();
      return res.status(400).send({ message: "El id_producto es obligatorio y debe ser numérico." });
    }
    if (!precio_venta || !precio_costo) {
      await t.rollback();
      return res.status(400).send({ message: "Los precios son obligatorios." });
    }

    // Verificar que el producto exista
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      await t.rollback();
      return res.status(404).send({ message: "El producto no existe." });
    }

    // ✅ URL por defecto si no se envía una imagen
    const urlFinal = (imagen_url && imagen_url.trim() !== "")
      ? imagen_url.trim()
      : "https://placehold.co/400x400?text=Sin+Imagen";

    // 🔹 Crear variante
    const nueva = await Variante.create({
      id_producto: productoId,       // ✅ aseguramos que va numérico
      sku: sku?.trim(),
      barcode: barcode?.trim(),
      modelo: modelo?.trim(),
      color: color?.trim(),
      talla: talla?.trim(),
      precio_venta,
      precio_costo,
      descuento,
      imagen_url: urlFinal,
      activo: (typeof activo === 'boolean') ? activo : true
    }, { transaction: t });

    // ✅ Si se envió imagen_url real (no placeholder), crear también en producto_imagen (orden: 1)
    if (imagen_url && imagen_url.trim() !== "" && !imagen_url.includes('placehold')) {
      const Imagen = db.productoImagen;

      // Evitar duplicar principal si ya existe una imagen con orden 1
      const yaTienePrincipal = await Imagen.findOne({
        where: { id_variante: nueva.id_variante, orden: 1 },
        transaction: t
      });

      if (!yaTienePrincipal) {
        await Imagen.create({
          id_variante: nueva.id_variante,
          url: imagen_url.trim(),
          orden: 1
        }, { transaction: t });
      }
    }

    await t.commit();

    // 🔹 Devolver con include + orden por imagen
    const varianteCompleta = await Variante.findByPk(nueva.id_variante, {
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" },
        { model: db.productoImagen, as: "imagenes" }
      ],
      // ✅ ordenar imágenes por 'orden'
      order: [[{ model: db.productoImagen, as: 'imagenes' }, 'orden', 'ASC']]
    });

    res.status(201).send(varianteCompleta);
  } catch (err) {
    try { await t.rollback(); } catch {}
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
      ],
      order: [[{ model: db.productoImagen, as: 'imagenes' }, 'orden', 'ASC']]
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
      ],
      order: [[{ model: db.productoImagen, as: 'imagenes' }, 'orden', 'ASC']]
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
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    // Si viene id_producto en update, normalizarlo a entero
    if (req.body.id_producto !== undefined) {
      const pId = parseInt(req.body.id_producto, 10);
      if (!pId || Number.isNaN(pId)) {
        await t.rollback();
        return res.status(400).send({ message: "id_producto debe ser numérico." });
      }
      // validar existencia
      const existe = await Producto.findByPk(pId);
      if (!existe) {
        await t.rollback();
        return res.status(404).send({ message: "El producto indicado no existe." });
      }
      req.body.id_producto = pId;
    }

    const [updated] = await Variante.update(req.body, { where: { id_variante: id }, transaction: t });
    if (updated !== 1) {
      await t.rollback();
      return res.status(404).send({ message: "Variante no encontrada o sin cambios." });
    }

    // Si actualizan imagen_url, sincronizar principal en producto_imagen
    if (req.body.imagen_url !== undefined) {
      const nuevaUrl = (req.body.imagen_url || '').trim();
      const Imagen = db.productoImagen;

      // eliminar principal anterior si existe (opcional)
      await Imagen.destroy({ where: { id_variante: id, orden: 1 }, transaction: t });

      if (nuevaUrl && !nuevaUrl.includes('placehold')) {
        await Imagen.create({
          id_variante: id,
          url: nuevaUrl,
          orden: 1
        }, { transaction: t });
      }
    }

    await t.commit();

    const varianteActualizada = await Variante.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: Stock, as: "stock" },
        { model: db.productoImagen, as: "imagenes" }
      ],
      order: [[{ model: db.productoImagen, as: 'imagenes' }, 'orden', 'ASC']]
    });

    res.send(varianteActualizada);
  } catch (err) {
    try { await t.rollback(); } catch {}
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
