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
    }, { timestamps: false });
    return VentaDevolucion;
};
