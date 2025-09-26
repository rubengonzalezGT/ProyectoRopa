module.exports = (sequelize, Sequelize) => {
  const VentaDevolucionItem = sequelize.define("venta_devolucion_item", {
    id_item_dev: { 
      type: Sequelize.BIGINT, 
      autoIncrement: true, 
      primaryKey: true 
    },
    id_variante: {   // 👈 FK a producto_variante
      type: Sequelize.BIGINT,
      allowNull: false
    },
    cantidad: { 
      type: Sequelize.INTEGER, 
      allowNull: false 
    },
    monto: { 
      type: Sequelize.DECIMAL(12,2), 
      allowNull: false 
    }
  }, { 
    tableName: 'venta_devolucion_item',
    freezeTableName: true,
    timestamps: false 
  });

  return VentaDevolucionItem;
};
