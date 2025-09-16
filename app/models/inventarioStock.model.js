module.exports = (sequelize, Sequelize) => {
    const InventarioStock = sequelize.define("inventario_stock", {
        id_variante: { 
            type: Sequelize.BIGINT, 
            primaryKey: true 
        },
        stock: { 
            type: Sequelize.INTEGER, 
            defaultValue: 0 
        },
        updated_at: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        }
    }, { 
        tableName: 'inventario_stock',
        freezeTableName: true,
        timestamps: false });
    return InventarioStock;
};
