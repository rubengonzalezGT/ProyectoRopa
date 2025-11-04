const db = require("../models");
const Producto = db.producto;
const ProductoVariante = db.productoVariante;
const Marca = db.marca;
const Categoria = db.categoria;
const Stock = db.inventarioStock;
const Op = db.Sequelize.Op;

/** Crear producto */
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, id_marca, id_categoria, genero } = req.body;

    if (!nombre) {
      return res.status(400).send({ message: "El nombre del producto es obligatorio." });
    }

    // Crear producto con género
    const producto = await Producto.create({
      nombre,
      descripcion,
      id_marca,
      id_categoria,
      genero, // ✅ nuevo campo
      activo: true
    });

    // Devolver producto con relaciones
    const full = await Producto.findByPk(producto.id_producto, {
      include: [
        { model: Marca, as: "marca" },
        { model: Categoria, as: "categoria" },
        { model: ProductoVariante, as: "variantes", include: [{ model: Stock, as: "stock" }] }
      ]
    });

    res.status(201).send(full);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error al crear producto."
    });
  }
};


/** Obtener todos los productos */
exports.findAll = async (req, res) => {
  try {
    const { q, id_marca, id_categoria, genero } = req.query; // ✅ nuevo

    const where = {};
    if (q) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { descripcion: { [Op.iLike]: `%${q}%` } }
      ];
    }
    if (id_marca) where.id_marca = id_marca;
    if (id_categoria) where.id_categoria = id_categoria;
    if (genero) where.genero = genero; // ✅ soporte de filtro

    const productos = await Producto.findAll({
      where,
      include: [
        { model: Marca, as: "marca" },
        { model: Categoria, as: "categoria" },
        { model: ProductoVariante, as: "variantes", include: [{ model: Stock, as: "stock" }] }
      ],
      order: [["id_producto", "DESC"]]
    });

    res.send(productos);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error al obtener productos."
    });
  }
};


/** Obtener un producto por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [
        { model: Marca, as: "marca" },
        { model: Categoria, as: "categoria" },
        { model: ProductoVariante, as: "variantes", include: [{ model: Stock, as: "stock" }] }
      ]
    });

    if (!producto) {
      return res.status(404).send({ message: "Producto no encontrado." });
    }

    res.send(producto);
  } catch (err) {
    res.status(500).send({
      message: "Error al obtener producto con id=" + req.params.id
    });
  }
};

/** Actualizar producto */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Producto.update(req.body, {
      where: { id_producto: id }
    });

    if (updated !== 1) {
      return res.status(404).send({
        message: "Producto no encontrado o sin cambios."
      });
    }

    const producto = await Producto.findByPk(id, {
      include: [
        { model: Marca, as: "marca" },
        { model: Categoria, as: "categoria" },
        { model: ProductoVariante, as: "variantes", include: [{ model: Stock, as: "stock" }] }
      ]
    });

    res.send(producto);
  } catch (err) {
    res.status(500).send({
      message: "Error al actualizar producto con id=" + req.params.id
    });
  }
};

/** Eliminar producto */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Producto.destroy({
      where: { id_producto: id }
    });

    if (deleted !== 1) {
      return res.status(404).send({ message: "Producto no encontrado." });
    }

    res.send({ message: "Producto eliminado correctamente." });
  } catch (err) {
    res.status(500).send({
      message: err.message || "No se pudo eliminar el producto."
    });
  }
};
