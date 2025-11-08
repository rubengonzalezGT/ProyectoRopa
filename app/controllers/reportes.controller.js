const { DateTime } = require('luxon');
const { Op } = require('sequelize');
const db = require('../models');
const { QueryTypes } = require('sequelize');

const {
venta: Venta,
ventaItem: VentaItem,
productoVariante: ProductoVariante,
usuario: Usuario,
} = db;

const toNum = (v) => Number(v || 0);

exports.ventasDelDia = async (req, res) => {
try {
const { fecha, tz = 'America/Guatemala' } = req.query;
if (!fecha) return res.status(400).json({ message: 'fecha es requerida (YYYY-MM-DD)' });
// Ventana del día según TZ de negocio
const start = DateTime.fromISO(fecha, { zone: tz }).startOf('day').toUTC().toISO();
const end   = DateTime.fromISO(fecha, { zone: tz }).endOf('day').toUTC().toISO();

// Traer ventas con usuario e items->variante
const ventas = await Venta.findAll({
  where: { fecha_venta: { [Op.between]: [start, end] } },
  include: [
    {
      model: Usuario,
      as: 'usuario',
      required: false,
      attributes: ['id_usuario', 'nombre']
    },
    {
      model: VentaItem,
      as: 'items',
      required: false,
      include: [
        {
          model: ProductoVariante,
          as: 'variante',
          required: false,
          attributes: ['id_variante', 'sku', 'modelo', 'color', 'talla']
        }
      ]
    }
  ],
  order: [['fecha_venta', 'ASC']]
});

const orders = ventas.map(v => ({
  id: v.id_venta,
  createdAt: v.fecha_venta, // ISO
  usuarioNombre: v.usuario ? v.usuario.nombre : null,
  items: (v.items || []).map(it => ({
    id_item: it.id_item,
    modelo: it.variante?.modelo || it.variante?.sku || 'Producto',
    sku: it.variante?.sku || null,
    talla: it.variante?.talla || null,  // <-- Agregar la talla
    qty: toNum(it.cantidad),
    unitPrice: toNum(it.precio_unit),
    lineTotal: toNum(it.total) || (toNum(it.cantidad) * toNum(it.precio_unit))
  }))
}));
return res.json({
  date: fecha,
  timezone: tz,
  orders
});;
} catch (err) {
console.error('ventasDia error:', err);
return res.status(500).json({ message: 'Error generando reporte de ventas del día' });
}
};

exports.ventasPorMes = async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(fecha_venta, 'YYYY-MM') as mes,
                SUM(total) as total_ventas
            FROM venta
            WHERE fecha_venta >= NOW() - INTERVAL '12 months'
            GROUP BY TO_CHAR(fecha_venta, 'YYYY-MM')
            ORDER BY mes DESC
            LIMIT 12;
        `;

        const ventas = await db.sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        // Procesar los datos para el formato que espera el frontend
        const meses = [];
        const totales = [];

        ventas.reverse().forEach(venta => {
            const fecha = new Date(venta.mes + '-01');
            meses.push(fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' }));
            totales.push(parseFloat(venta.total_ventas));
        });

        res.json({
            meses: meses,
            ventas: totales
        });

    } catch (error) {
        console.error('Error en ventasPorMes:', error);
        res.status(500).json({
            message: "Error al obtener las ventas por mes",
            error: error.message
        });
    }
};

exports.gananciasPorMes = async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(v.fecha_venta, 'YYYY-MM') as mes,
                SUM(vi.total - (vi.cantidad * c.precio_compra)) as ganancias
            FROM venta v
            JOIN venta_item vi ON v.id_venta = vi.id_venta
            JOIN producto_variante pv ON vi.id_variante = pv.id_variante
            JOIN (
                SELECT ci.id_variante, 
                       COALESCE(ci.precio_unit, 0) as precio_compra
                FROM compra_item ci
                JOIN compra c ON ci.id_compra = c.id_compra
                WHERE c.fecha = (
                    SELECT MAX(c2.fecha)
                    FROM compra c2
                    JOIN compra_item ci2 ON c2.id_compra = ci2.id_compra
                    WHERE ci2.id_variante = ci.id_variante
                )
            ) c ON pv.id_variante = c.id_variante
            WHERE v.fecha_venta >= NOW() - INTERVAL '12 months'
            GROUP BY TO_CHAR(v.fecha_venta, 'YYYY-MM')
            ORDER BY mes DESC
            LIMIT 12;
        `;

        const ganancias = await db.sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        // Procesar los datos para el formato que espera el frontend
        const meses = [];
        const totales = [];

        ganancias.reverse().forEach(ganancia => {
            const fecha = new Date(ganancia.mes + '-01');
            meses.push(fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' }));
            totales.push(parseFloat(ganancia.ganancias));
        });

        res.json({
            meses: meses,
            ganancias: totales
        });

    } catch (error) {
        console.error('Error en gananciasPorMes:', error);
        res.status(500).json({
            message: "Error al obtener las ganancias por mes",
            error: error.message
        });
    }
};