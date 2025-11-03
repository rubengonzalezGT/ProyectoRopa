module.exports = (sequelize, Sequelize) => {
  const ProductoVariante = sequelize.define("producto_variante", {
    id_variante: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    // ✅ FK explícita (antes NO estaba definida)
    id_producto: {
      type: Sequelize.BIGINT,
      allowNull: false
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
    descuento: {
      type: Sequelize.DECIMAL(5,2),
      defaultValue: 0
    },
    imagen_url: {
      type: Sequelize.STRING,
      allowNull: true
    },
    activo: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },

    // ⚡ precio_final virtual
    precio_final: {
      type: Sequelize.VIRTUAL(Sequelize.DECIMAL(12,2), ['precio_venta', 'descuento']),
      get() {
        const precio = parseFloat(this.getDataValue('precio_venta') || 0);
        const desc = parseFloat(this.getDataValue('descuento') || 0);
        return +(precio * (1 - desc / 100)).toFixed(2);
      }
    }
  }, {
    tableName: 'producto_variante',
    freezeTableName: true,
    timestamps: false
  });

  return ProductoVariante;
};
