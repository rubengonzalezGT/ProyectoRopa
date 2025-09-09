module.exports = (sequelize, Sequelize) => {
    const VentaDevolucionItem = sequelize.define("venta_devolucion_item", {
        id_item_dev: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        cantidad: { 
            type: Sequelize.INTEGER, 
            allowNull: false 
        },
        monto: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        }
    }, { timestamps: false });
    return VentaDevolucionItem;
};
