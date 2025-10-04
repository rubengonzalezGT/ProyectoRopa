// app/controllers/compra.controller.js
const db = require("../models");
const Compra = db.compra;
const Proveedor = db.proveedor;
const Usuario = db.usuario;
const CompraItem = db.compraItem;
const Variante = db.productoVariante; 

// Crear una nueva compra
exports.create = async (req, res) => {
  try {
    const { fecha, subtotal, impuesto, total, notas, id_proveedor, id_usuario } = req.body;

    if (!id_proveedor || !id_usuario) {
      return res.status(400).send({ message: "Proveedor y usuario son obligatorios." });
    }

    const compra = await Compra.create({
      fecha,
      subtotal,
      impuesto,
      total,
      notas,
      id_proveedor,
      id_usuario
    });

    const full = await Compra.findByPk(compra.id_compra, {
      include: [
        { model: Proveedor, as: "proveedor" },
        { model: Usuario, as: "usuario" },
        { 
          model: CompraItem, 
          as: "items", 
          include: [{ model: Variante, as: "variante" }]
        }
      ]
    });

    res.status(201).send(full);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear compra." });
  }
};

// Listar todas las compras
exports.findAll = async (_req, res) => {
  try {
    const compras = await Compra.findAll({
      include: [
        { model: Proveedor, as: "proveedor" },
        { model: Usuario, as: "usuario" },
        { 
          model: CompraItem, 
          as: "items", 
          include: [{ model: Variante, as: "variante" }] 
        }
      ],
      order: [["id_compra", "DESC"]]
    });
    res.send(compras);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener compras." });
  }
};

// Obtener compra por ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await Compra.findByPk(id, {
      include: [
        { model: Proveedor, as: "proveedor" },
        { model: Usuario, as: "usuario" },
        { 
          model: CompraItem, 
          as: "items", 
          include: [{ model: Variante, as: "variante" }]
        }
      ]
    });

    if (!compra) {
      return res.status(404).send({ message: "Compra no encontrada." });
    }

    res.send(compra);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener compra con id=" + req.params.id });
  }
};

// Actualizar compra
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Compra.update(req.body, { where: { id_compra: id } });

    if (updated !== 1) {
      return res.status(404).send({ message: "Compra no encontrada o sin cambios." });
    }

    const compra = await Compra.findByPk(id, {
      include: [
        { model: Proveedor, as: "proveedor" },
        { model: Usuario, as: "usuario" },
        { 
          model: CompraItem, 
          as: "items", 
          include: [{ model: Variante, as: "variante" }]
        }
      ]
    });

    res.send(compra);
  } catch (err) {
    res.status(500).send({ message: "Error al actualizar compra con id=" + req.params.id });
  }
};

// Eliminar compra
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Compra.destroy({ where: { id_compra: id } });

    if (deleted !== 1) {
      return res.status(404).send({ message: "Compra no encontrada." });
    }

    res.send({ message: "Compra eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "No se pudo eliminar la compra." });
  }
};
