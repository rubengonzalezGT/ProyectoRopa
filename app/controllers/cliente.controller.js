const db = require("../models");
const Cliente = db.cliente;
const Venta = db.venta;
const VentaItem = db.ventaItem;
const ProductoVariante = db.productoVariante;
const Producto = db.producto;

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

// Crear cliente (si no existe) o usar el cliente existente
exports.create = async (req, res) => {
  try {
    const { nombre, nit, email, telefono, direccion } = req.body;

    if (!nombre || String(nombre).trim() === "") {
      return res.status(400).send({ message: "El campo 'nombre' es obligatorio." });
    }

    // Verificar si ya existe el cliente por NIT o Email
    let cliente = await Cliente.findOne({
      where: {
        [Op.or]: [
          nit ? { nit } : null,
          email ? { email } : null
        ].filter(Boolean)
      }
    });

    if (cliente) {
      return res.status(200).send(cliente); // Devuelve el cliente existente
    }

    // Si no existe, crear el nuevo cliente
    cliente = await Cliente.create({
      nombre: String(nombre).trim(),
      nit: nit ?? null,
      email: email ?? null,
      telefono: telefono ?? null,
      direccion: direccion ?? null
    });

    res.status(201).send(cliente);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear el cliente." });
  }
};


/**
 * Listar clientes con búsqueda y paginación
 * query: q? (busca en nombre, nit, email, telefono), page?, size?
 */
exports.findAll = async (req, res) => {
  try {
    const { q, page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = q && q.trim()
      ? {
          [Op.or]: [
            { nombre:   { [Op.iLike]: `%${q}%` } },
            { nit:      { [Op.iLike]: `%${q}%` } },
            { email:    { [Op.iLike]: `%${q}%` } },
            { telefono: { [Op.iLike]: `%${q}%` } }
          ]
        }
      : undefined;

    const data = await Cliente.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id_cliente", "DESC"]]
    });

    res.send(getPagingData(data, page, limit));
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener clientes." });
  }
};

/** Obtener un cliente por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).send({ message: "Cliente no encontrado." });
    res.send(cliente);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener el cliente con id=" + req.params.id });
  }
};

/*Actualizar cliente por ID (mantiene unicidad NIT/Email si cambian)*/
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // si envían nit/email nuevos, validar unicidad
    const { nit, email } = req.body || {};
    if (nit || email) {
      const dup = await Cliente.findOne({
        where: {
          [Op.and]: [
            { id_cliente: { [Op.ne]: id } },
            {
              [Op.or]: [
                nit ? { nit } : null,
                email ? { email } : null
              ].filter(Boolean)
            }
          ]
        }
      });
      if (dup) {
        return res.status(409).send({ message: "NIT o Email ya están asociados a otro cliente." });
      }
    }

    const [affected] = await Cliente.update(req.body, { where: { id_cliente: id } });

    if (affected !== 1) {
      return res.status(404).send({ message: "Cliente no encontrado o sin cambios." });
    }

    const updated = await Cliente.findByPk(id);
    res.send(updated);
  } catch (err) {
    res.status(500).send({ message: "Error actualizando cliente con id=" + req.params.id });
  }
};

/* Eliminar cliente por ID */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    // Nota: si hay ventas/facturas asociadas, el FK podría impedir delete.
    const deleted = await Cliente.destroy({ where: { id_cliente: id } });
    if (deleted !== 1) {
      return res.status(404).send({ message: "Cliente no encontrado." });
    }
    res.send({ message: "Cliente eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "No se pudo eliminar el cliente." });
  }
};

/** Eliminar todos (solo pruebas) */
exports.deleteAll = async (_req, res) => {
  try {
    const deleted = await Cliente.destroy({ where: {}, truncate: false });
    res.send({ message: `Se eliminaron ${deleted} clientes.` });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar todos los clientes." });
  }
};

/*Historial de ventas del cliente (útil en tienda de ropa)*/
exports.findVentasByCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const ventas = await db.venta.findAll({
      where: { id_cliente: id },
      order: [["fecha_venta", "DESC"]],
      include: [
        {
          model: db.ventaItem,
          as: "items", 
          include: [
            {
              model: db.productoVariante,
              as: "variante", 
              include: [
                {
                  model: db.producto,
                  as: "producto" 
                }
              ]
            }
          ]
        }
      ]
    });

    res.send(ventas);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error al obtener ventas del cliente."
    });
  }
};

// Buscar cliente por NIT o Email
exports.findByEmailOrNIT = async (req, res) => {
  try {
    const { email, nit } = req.body;

    const cliente = await Cliente.findOne({
      where: {
        [Op.or]: [
          nit ? { nit } : null,
          email ? { email } : null
        ].filter(Boolean)
      }
    });

    if (!cliente) {
      return res.status(404).send({ message: "Cliente no encontrado." });
    }

    res.send(cliente);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener el cliente." });
  }
};


