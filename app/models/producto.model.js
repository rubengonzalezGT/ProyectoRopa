module.exports = (sequelize, Sequelize) => {
  const Producto = sequelize.define("producto", {
    id_producto: { 
      type: Sequelize.BIGINT, 
      autoIncrement: true, 
      primaryKey: true 
    },
    nombre: { 
      type: Sequelize.STRING, 
      allowNull: false 
    },
    descripcion: Sequelize.TEXT,
    activo: { 
      type: Sequelize.BOOLEAN, 
      defaultValue: true 
    },
    // 🔑 Foreign keys para Marca y Categoría
    id_marca: { 
      type: Sequelize.BIGINT,
      allowNull: false
    },
    id_categoria: { 
      type: Sequelize.BIGINT,
      allowNull: false
    }
  }, { 
    tableName: 'producto',
    freezeTableName: true,
    timestamps: false 
  });

  return Producto;
};
