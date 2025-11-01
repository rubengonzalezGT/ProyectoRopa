module.exports = (sequelize, Sequelize) => {
  const ProductoVariante = sequelize.define("producto_variante", {
    id_variante: { 
      type: Sequelize.BIGINT, 
      autoIncrement: true, 
      primaryKey: true 
    },
    sku: { 
      type: Sequelize.STRING, 
      allowNull: false, 
      unique: true 
    },
    barcode: { 
      type: Sequelize.STRING, 
      allowNull: false 
    },
    modelo: { 
      type: Sequelize.STRING, 
      allowNull: false 
    },
    color: Sequelize.STRING,
    talla: Sequelize.STRING,
    precio_venta: { 
      type: Sequelize.DECIMAL(12,2), 
      allowNull: false 
    },
    precio_costo: { 
      type: Sequelize.DECIMAL(12,2), 
      allowNull: false 
    },

    // 💸 Campo nuevo: descuento por variante (en porcentaje)
    descuento: { 
      type: Sequelize.DECIMAL(5,2), 
      defaultValue: 0.00,
      comment: "Porcentaje de descuento aplicado a esta variante (0-100)"
    },

    // 🖼️ Campo nuevo: URL principal de imagen
    imagen_url: { 
      type: Sequelize.TEXT, 
      allowNull: true,
      comment: "URL de la imagen principal del producto o variante"
    },

    activo: { 
      type: Sequelize.BOOLEAN, 
      defaultValue: true 
    }
  }, { 
    tableName: 'producto_variante',
    freezeTableName: true,
    timestamps: false 
  });

  return ProductoVariante;
};
