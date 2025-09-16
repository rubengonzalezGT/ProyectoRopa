module.exports = (sequelize, Sequelize) => {
    const VentaDevolucion = sequelize.define("venta_devolucion", {
        id_devolucion: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        fecha: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        },
        motivo: Sequelize.STRING
    }, { 
        tableName: 'venta_devolucion',
        freezeTableName: true,
        timestamps: false });
    return VentaDevolucion;
};
