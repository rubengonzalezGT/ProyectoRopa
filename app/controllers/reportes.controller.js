const { DateTime } = require('luxon');
const { Op } = require('sequelize');
const db = require('../models');

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

// Mapear al contrato mínimo que usa la UI
const orders = ventas.map(v => ({
  id: v.id_venta,
  createdAt: v.fecha_venta, // ISO
  usuarioNombre: v.usuario ? v.usuario.nombre : null,
  items: (v.items || []).map(it => ({
    id_item: it.id_item,
    modelo: it.variante?.modelo || it.variante?.sku || 'Producto',
    sku: it.variante?.sku || null,
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