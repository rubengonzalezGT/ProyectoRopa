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
        barcode: Sequelize.STRING,
        modelo: Sequelize.STRING,
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
        activo: { 
            type: Sequelize.BOOLEAN, 
            defaultValue: true 
        }
    }, { 
        tableName: 'producto_variante',
        freezeTableName: true,
        timestamps: false });
    return ProductoVariante;
};
