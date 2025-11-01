module.exports = (sequelize, Sequelize) => {
  const ProductoImagen = sequelize.define("producto_imagen", {
    id_imagen: { 
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    id_variante: { 
      type: Sequelize.BIGINT,
      allowNull: false
    },
    url: { 
      type: Sequelize.TEXT,
      allowNull: false
    },
    orden: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      comment: "Orden de visualización (1 = principal)"
    }
  }, { 
    tableName: 'producto_imagen',
    freezeTableName: true,
    timestamps: false
  });

  return ProductoImagen;
};
