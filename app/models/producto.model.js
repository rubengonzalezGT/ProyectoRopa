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
        }
    }, { timestamps: false });
    return Producto;
};
