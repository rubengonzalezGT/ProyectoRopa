const db = require("../models");
const Venta = db.venta;
const Cliente = db.cliente;
const Usuario = db.usuario;
const VentaItem = db.ventaItem;
const Variante = db.productoVariante;
const Producto = db.producto;

// Crear una nueva venta
exports.create = async (req, res) => {
  try {
    const { canal, id_cliente, id_usuario, estado } = req.body;

    if (!canal || !id_cliente || !id_usuario) {
      return res.status(400).send({ message: "Faltan datos obligatorios (canal, cliente, usuario)." });
    }

    // Generar número de factura basado en la última venta
    const ultimaVenta = await Venta.findOne({ order: [["id_venta", "DESC"]] });
    const nextNumber = ultimaVenta ? ultimaVenta.id_venta + 1 : 1;
    const numeroFactura = `FAC-${nextNumber.toString().padStart(4, "0")}`;

    // Crear la venta
    const venta = await Venta.create({
      canal,
      id_cliente,
      id_usuario,
      estado: estado || "PENDING",  // Estado "PENDING" hasta que se complete el pago
      numero_factura: numeroFactura,
      subtotal: 0,  // Inicializa con 0
      descuento: 0,  // Inicializa con 0
      impuesto: 0,  // Inicializa con 0
      total: 0  // Inicializa con 0
    });

    // Devolver el id_venta al frontend para usarlo en el proceso de pago
    res.status(201).send({ id_venta: venta.id_venta });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear la venta." });
  }
};


/** Listar todas las ventas */
exports.findAll = async (_req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [
        { model: Cliente, as: "cliente" },
        { model: Usuario, as: "usuario" },
        {
          model: VentaItem,
          as: "items",
          include: [
            {
              model: Variante,
              as: "variante",
              include: [{ model: Producto, as: "producto" }]
            }
          ]
        }
      ],
      order: [["id_venta", "DESC"]]
    });
    res.send(ventas);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener ventas." });
  }
};

/** Obtener una venta por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente, as: "cliente" },
        { model: Usuario, as: "usuario" },
        {
          model: VentaItem,
          as: "items",
          include: [
            {
              model: Variante,
              as: "variante",
              include: [{ model: Producto, as: "producto" }]
            }
          ]
        }
      ]
    });

    if (!venta) return res.status(404).send({ message: "Venta no encontrada." });

    res.send(venta);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener venta con id=" + req.params.id });
  }
};

/** Actualizar venta */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Venta.update(req.body, { where: { id_venta: id } });

    if (updated !== 1) {
      return res.status(404).send({ message: "Venta no encontrada o sin cambios." });
    }

    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente, as: "cliente" },
        { model: Usuario, as: "usuario" },
        {
          model: VentaItem,
          as: "items",
          include: [
            {
              model: Variante,
              as: "variante",
              include: [{ model: Producto, as: "producto" }]
            }
          ]
        }
      ]
    });

    res.send(venta);
  } catch (err) {
    res.status(500).send({ message: "Error al actualizar venta con id=" + req.params.id });
  }
};

/** Eliminar venta */
exports.delete = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    const venta = await Venta.findByPk(id, {
      include: [{ model: VentaItem, as: "items" }]
    });

    if (!venta) {
      await t.rollback();
      return res.status(404).send({ message: "Venta no encontrada." });
    }

    // 🔹 Revertir stock por cada item
    for (const item of venta.items) {
      const stock = await db.inventarioStock.findByPk(item.id_variante);
      if (stock) {
        stock.stock += item.cantidad;
        stock.updated_at = new Date();
        await stock.save({ transaction: t });
      }
      // eliminar item
      await VentaItem.destroy({ where: { id_item: item.id_item }, transaction: t });
    }

    // 🔹 Eliminar venta
    await Venta.destroy({ where: { id_venta: id }, transaction: t });

    await t.commit();
    res.send({ message: "Venta e items eliminados correctamente, stock revertido." });
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "No se pudo eliminar la venta." });
  }
};

// Agregar esto junto a tus otros exports en venta.controller.js
exports.getMovimientos = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        const movimientos = await Venta.findAll({
            attributes: [
                'fecha_creacion',
                ['id_venta', 'id'],
                [db.sequelize.col('items.cantidad'), 'cantidad'],
                [db.sequelize.col('items.precio_unit'), 'precioUnitario'],
                [db.sequelize.col('items.total'), 'total']
            ],
            include: [
                {
                    model: VentaItem,
                    as: 'items',
                    attributes: [],
                    include: [{
                        model: Variante,
                        as: 'variante',
                        attributes: [],
                        include: [{
                            model: Producto,
                            as: 'producto',
                            attributes: ['nombre']
                        }]
                    }]
                },
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['nombre']
                },
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nombre']
                }
            ],
            where: {
                fecha_creacion: {
                    [db.Sequelize.Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`
                    ]
                }
            },
            order: [['fecha_creacion', 'DESC']]
        });

        const ventasFormateadas = movimientos.map(venta => ({
            fecha: venta.fecha_creacion,
            producto: venta.items[0]?.variante?.producto?.nombre || 'Producto no disponible',
            cantidad: venta.cantidad,
            precioUnitario: venta.precioUnitario,
            total: venta.total,
            cliente: venta.cliente?.nombre || 'Cliente General',
            vendedor: venta.usuario?.nombre || 'Sistema'
        }));

        res.json({
            ventas: ventasFormateadas
        });

    } catch (error) {
        console.error('Error en movimientos de ventas:', error);
        res.status(500).json({
            error: 'Error al obtener los movimientos de ventas',
            details: error.message
        });
    }
};