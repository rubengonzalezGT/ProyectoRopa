const db = require("../models");
const Marca = db.marca;
const Producto = db.producto;

// Crear nueva marca
exports.create = async (req, res) => {
  try {
    if (!req.body.nombre) {
      return res.status(400).send({ message: "El nombre de la marca es obligatorio." });
    }

    const marca = await Marca.create({
      nombre: req.body.nombre,
      imagen: req.body.imagen || null
    });

    res.status(201).send(marca);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear la marca." });
  }
};

// Actualizar marca
exports.update = async (req, res) => {
  try {
    const updateData = {
      nombre: req.body.nombre,
      imagen: req.body.imagen
    };

    // Eliminamos los campos undefined o null
    Object.keys(updateData).forEach(key => 
      (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]
    );

    const [updated] = await Marca.update(updateData, { 
      where: { id_marca: req.params.id } 
    });
    
    if (updated !== 1) return res.status(404).send({ message: "Marca no encontrada o sin cambios." });

    const marca = await Marca.findByPk(req.params.id, {
      include: [{ model: Producto, as: "productos" }]
    });
    res.send(marca);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar la marca." });
  }
};


// Listar todas las marcas con sus productos
exports.findAll = async (_req, res) => {
  try {
    const marcas = await Marca.findAll({
      include: [{ model: Producto, as: "productos" }]
    });
    res.send(marcas);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener marcas." });
  }
};

// Buscar marca por ID
exports.findOne = async (req, res) => {
  try {
    const marca = await Marca.findByPk(req.params.id, {
      include: [{ model: Producto, as: "productos" }]
    });
    if (!marca) return res.status(404).send({ message: "Marca no encontrada." });
    res.send(marca);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener la marca." });
  }
};


// Eliminar marca
exports.delete = async (req, res) => {
  try {
    const deleted = await Marca.destroy({ where: { id_marca: req.params.id } });
    if (deleted !== 1) return res.status(404).send({ message: "Marca no encontrada." });

    res.send({ message: "Marca eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar la marca." });
  }
};
