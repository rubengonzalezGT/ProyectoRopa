module.exports = (sequelize, Sequelize) => {
    const VentaItem = sequelize.define("venta_item", {
        id_item: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        cantidad: { 
            type: Sequelize.INTEGER, 
            allowNull: false 
        },
        precio_unit: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        },
        descuento: { 
            type: Sequelize.DECIMAL(12,2), 
            defaultValue: 0 
        },
        impuesto: { 
            type: Sequelize.DECIMAL(12,2), 
            defaultValue: 0 
        },
        subtotal: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        },
        total: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        }
    }, { 
        tableName: 'venta_item',
        freezeTableName: true,
        timestamps: false });
    return VentaItem;
};
