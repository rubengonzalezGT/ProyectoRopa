module.exports = (sequelize, Sequelize) => {
    const CompraItem = sequelize.define("compra_item", {
        id_item: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true },
        cantidad: { 
            type: Sequelize.INTEGER, 
            allowNull: false 
        },
        costo_unit: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        },
        subtotal: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        }
    }, { 
        tableName: 'compra_item',
        freezeTableName: true,
        timestamps: false });
    return CompraItem;
};
