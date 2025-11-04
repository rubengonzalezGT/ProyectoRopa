// app/controllers/productoImagen.controller.js
const db = require("../models");
const Imagen = db.productoImagen;
const Variante = db.productoVariante;

/** Crear imagen */
/** Crear imagen */
exports.create = async (req, res) => {
  try {
    const { id_variante, url, orden } = req.body;

    if (!id_variante || !url) {
      return res.status(400).send({
        message: "Faltan datos obligatorios (id_variante, url)."
      });
    }

    // 🔹 Validar que la variante exista
    const variante = await Variante.findByPk(id_variante);
    if (!variante) {
      return res.status(404).send({ message: "Variante no encontrada." });
    }

    // 🔹 Buscar la última imagen (para saber cuál es el orden más alto)
    const ultima = await Imagen.findOne({
      where: { id_variante },
      order: [["orden", "DESC"]],
    });

    // ✅ Si el usuario manda un orden manual, se respeta; de lo contrario, se calcula automáticamente
    const nuevoOrden =
      orden !== undefined && orden !== null
        ? parseInt(orden)
        : ultima
        ? ultima.orden + 1
        : 1;

    // 🔹 Crear nueva imagen
    const nueva = await Imagen.create({
      id_variante,
      url,
      orden: nuevoOrden,
    });

    // 🔹 Si es la primera imagen, actualizar la imagen principal de la variante
    if (!ultima) {
      await Variante.update(
        { imagen_url: url },
        { where: { id_variante } }
      );
    }

    res.status(201).send({
      message: !ultima
        ? "✅ Imagen principal agregada correctamente."
        : `✅ Imagen agregada correctamente con orden ${nuevoOrden}.`,
      imagen: nueva,
    });
  } catch (err) {
    console.error("❌ Error al crear imagen:", err);
    res.status(500).send({ message: err.message || "Error al crear imagen." });
  }
};


/** Listar todas las imágenes (opcionalmente por variante) */
exports.findAll = async (req, res) => {
  try {
    const { id_variante } = req.query;
    const where = id_variante ? { id_variante } : {};

    const imagenes = await Imagen.findAll({
      where,
      include: [
        { model: Variante, as: "variante", attributes: ["id_variante", "modelo", "color", "talla"] }
      ],
      order: [["orden", "ASC"]]
    });

    res.send(imagenes);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener imágenes." });
  }
};

/** Buscar imagen por ID */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const imagen = await Imagen.findByPk(id, {
      include: [{ model: Variante, as: "variante" }]
    });

    if (!imagen) {
      return res.status(404).send({ message: "Imagen no encontrada." });
    }

    res.send(imagen);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener imagen." });
  }
};

/** Actualizar imagen */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Imagen.update(req.body, {
      where: { id_imagen: id }
    });

    if (updated !== 1) {
      return res.status(404).send({ message: "Imagen no encontrada o sin cambios." });
    }

    const imagenActualizada = await Imagen.findByPk(id);
    res.send({
      message: "Imagen actualizada correctamente.",
      imagen: imagenActualizada
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar imagen." });
  }
};

/** Eliminar imagen */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Imagen.destroy({
      where: { id_imagen: id }
    });

    if (deleted !== 1) {
      return res.status(404).send({ message: "Imagen no encontrada." });
    }

    res.send({ message: "Imagen eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar imagen." });
  }
};
