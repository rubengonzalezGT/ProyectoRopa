const db = require("../models");
const VentaDevolucion = db.ventaDevolucion;
const VentaDevolucionItem = db.ventaDevolucionItem;
const Venta = db.venta;
const Variante = db.productoVariante;
const Stock = db.inventarioStock;
const InventarioMov = db.inventarioMov;

/** Crear devolución con items */
exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id_venta, id_usuario, motivo, items } = req.body; // 👈 ahora capturamos id_usuario

    if (!id_venta || !items || items.length === 0) {
      await t.rollback();
      return res.status(400).send({ message: "Faltan datos obligatorios (id_venta, items)." });
    }

    const venta = await Venta.findByPk(id_venta);
    if (!venta) {
      await t.rollback();
      return res.status(404).send({ message: "Venta no encontrada." });
    }

    // 🔹 Crear devolución con usuario incluido
    const devolucion = await VentaDevolucion.create(
      { id_venta, id_usuario, motivo },  // 👈 aquí ya se guarda id_usuario
      { transaction: t }
    );

    // 2. Procesar items devueltos
    for (const i of items) {
      const variante = await Variante.findByPk(i.id_variante);
      if (!variante) {
        await t.rollback();
        return res.status(404).send({ message: `Variante ${i.id_variante} no encontrada.` });
      }

      const monto = i.cantidad * parseFloat(variante.precio_venta);

      // Crear item de devolución
      await VentaDevolucionItem.create(
        {
          id_devolucion: devolucion.id_devolucion,
          id_variante: i.id_variante,
          cantidad: i.cantidad,
          monto
        },
        { transaction: t }
      );

      // Movimiento inventario (IN)
      await InventarioMov.create(
        {
          id_variante: i.id_variante,
          tipo: "IN",
          cantidad: i.cantidad,
          costo_unit: variante.precio_costo,
          motivo: "Devolución de venta",
          ref_tipo: "DEVOLUCION",
          ref_id: devolucion.id_devolucion
        },
        { transaction: t }
      );

      // Actualizar stock
      const stock = await Stock.findByPk(i.id_variante);
      if (stock) {
        stock.stock += i.cantidad;
        stock.updated_at = new Date();
        await stock.save({ transaction: t });
      } else {
        await Stock.create(
          { id_variante: i.id_variante, stock: i.cantidad },
          { transaction: t }
        );
      }
    }

    await t.commit();

    const full = await VentaDevolucion.findByPk(devolucion.id_devolucion, {
      include: [
        { model: Venta, as: "venta" },
        {
          model: VentaDevolucionItem,
          as: "items",
          include: [{ model: Variante, as: "variante" }]
        }
      ]
    });

    res.status(201).send(full);
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error al crear devolución." });
  }
};

/** Listar todas las devoluciones con detalle */
exports.findAll = async (_req, res) => {
  try {
    const devoluciones = await db.ventaDevolucion.findAll({
      include: [
        { model: db.venta, as: "venta" },
        { model: db.usuario, as: "usuario" },
        {
          model: db.ventaDevolucionItem,
          as: "items",
          include: [{ model: db.productoVariante, as: "variante" }]
        }
      ],
      order: [["id_devolucion", "DESC"]]
    });

    res.send(devoluciones);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener devoluciones." });
  }
};


/** Obtener una devolución por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const devolucion = await VentaDevolucion.findByPk(id, {
      include: [
        { model: Venta, as: "venta" },
        {
          model: VentaDevolucionItem,
          as: "items",
          include: [{ model: Variante, as: "variante" }]
        }
      ]
    });

    if (!devolucion) return res.status(404).send({ message: "Devolución no encontrada." });

    res.send(devolucion);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener devolución con id=" + req.params.id });
  }
};

/** Actualizar devolución (solo motivo u otros campos) */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await VentaDevolucion.update(req.body, { where: { id_devolucion: id } });

    if (updated !== 1) {
      return res.status(404).send({ message: "Devolución no encontrada o sin cambios." });
    }

    const devolucion = await VentaDevolucion.findByPk(id, {
      include: [
        { model: Venta, as: "venta" },
        {
          model: VentaDevolucionItem,
          as: "items",
          include: [{ model: Variante, as: "variante" }]
        }
      ]
    });

    res.send(devolucion);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar devolución." });
  }
};

/** Eliminar devolución */
exports.delete = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    const devolucion = await VentaDevolucion.findByPk(id, {
      include: [{ model: VentaDevolucionItem, as: "items" }]
    });

    if (!devolucion) {
      await t.rollback();
      return res.status(404).send({ message: "Devolución no encontrada." });
    }

    // Revertir stock
    for (const item of devolucion.items) {
      const stock = await Stock.findByPk(item.id_variante);
      if (stock) {
        stock.stock -= item.cantidad; // sacamos lo que devolvimos
        stock.updated_at = new Date();
        await stock.save({ transaction: t });
      }
      await VentaDevolucionItem.destroy({ where: { id_item_dev: item.id_item_dev }, transaction: t });
    }

    await VentaDevolucion.destroy({ where: { id_devolucion: id }, transaction: t });

    await t.commit();
    res.send({ message: "Devolución eliminada correctamente, stock ajustado." });
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error al eliminar devolución." });
  }
};
