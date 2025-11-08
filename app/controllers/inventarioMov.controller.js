const db = require("../models");
const InventarioMov = db.inventarioMov;
const Stock = db.inventarioStock;
const Variante = db.productoVariante;

/**
 * Crear un movimiento de inventario
 * tipo: "IN", "OUT", "ADJUST"
 */
exports.create = async (req, res) => {
  try {
    const { 
      id_variante, 
      tipo, 
      cantidad, 
      costo_unit, 
      motivo, 
      ref_tipo, 
      ref_id,
      id_usuario 
    } = req.body;

    if (!id_variante || !tipo || !cantidad) {
      return res.status(400).send({ message: "id_variante, tipo y cantidad son obligatorios." });
    }

    // Buscar stock actual antes de crear el movimiento
    let stock = await Stock.findOne({ where: { id_variante } });
    const stockAntes = stock ? stock.stock : 0;

    if (!stock) {
      stock = await Stock.create({ id_variante, stock: 0 });
    }

    // Calcular stock después según el tipo
    let stockDespues = stockAntes;
    if (tipo === "IN") {
      stockDespues = stockAntes + cantidad;
    } else if (tipo === "OUT") {
      stockDespues = Math.max(0, stockAntes - cantidad); // evitar negativos
    } else if (tipo === "ADJUST") {
      stockDespues = cantidad;
    }

    // Crear movimiento
    const mov = await InventarioMov.create({
      id_variante,
      tipo,
      cantidad,
      costo_unit: costo_unit || null,
      motivo: motivo || null,
      ref_tipo: ref_tipo || null,
      ref_id: ref_id || null,
      created_at: new Date(),
      stockAntes,
      stockDespues,
      id_usuario
    });

    // Actualizar stock
    stock.stock = stockDespues;
    await stock.save();

    res.status(201).send({ mov, stock });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al registrar movimiento." });
  }
};

/** Listar todos los movimientos */
exports.findAll = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Construir el where según los filtros
    let where = {};
    if (fechaInicio && fechaFin) {
      where.created_at = {
        [db.Sequelize.Op.between]: [
          new Date(fechaInicio), 
          new Date(fechaFin + ' 23:59:59')
        ]
      };
    }

    const movimientos = await InventarioMov.findAll({
      where,
      include: [
        { 
          model: Variante, 
          as: "variante",
          include: [
            {
              model: db.producto,
              as: 'producto',
              attributes: ['nombre']
            }
          ]
        },
        {
          model: db.usuario,
          as: 'usuario',
          attributes: ['nombre']
        }
      ],
      order: [["created_at", "DESC"]]
    });

    // Transformar los datos al formato que espera el frontend
    const movimientosFormateados = movimientos.map(mov => {
      const tipoMovimiento = {
        'IN': 'Entrada',
        'OUT': 'Salida',
        'ADJUST': 'Ajuste'
      };

      return {
        fecha: mov.created_at,
        cantidad: mov.tipo === 'OUT' ? -mov.cantidad : mov.cantidad,
        producto: mov.variante.producto.nombre + ' - ' + mov.variante.talla,
        usuario: mov.usuario ? mov.usuario.nombre : 'Sistema',
        tipo: tipoMovimiento[mov.tipo],
        descripcion: mov.motivo || 'Sin descripción',
        precioUnitario: mov.costo_unit || 0,
        stockAntes: mov.stockAntes || 0, // Necesitamos agregar estos campos al modelo
        stockDespues: mov.stockDespues || 0
      };
    });

    res.json({
      movimientos: movimientosFormateados
    });

  } catch (err) {
    console.error('Error al obtener movimientos:', err);
    res.status(500).send({ message: err.message || "Error al obtener movimientos." });
  }
};

/** Obtener un movimiento por ID */
exports.findOne = async (req, res) => {
  try {
    const mov = await InventarioMov.findByPk(req.params.id, {
      include: [{ model: Variante, as: "variante" }]
    });
    if (!mov) return res.status(404).send({ message: "Movimiento no encontrado." });
    res.send(mov);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener movimiento." });
  }
};

/* Eliminar un movimiento */
exports.delete = async (req, res) => {
  try {
    const deleted = await InventarioMov.destroy({ where: { id_mov: req.params.id } });
    if (deleted !== 1) {
      return res.status(404).send({ message: "Movimiento no encontrado." });
    }
    res.send({ message: "Movimiento eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar movimiento." });
  }
};
