module.exports = (sequelize, Sequelize) => {
    const FacturaItem = sequelize.define("factura_item", {
        id_item: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        descripcion: { 
            type: Sequelize.STRING, 
            allowNull: false 
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
        total: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        }
    }, { timestamps: false });
    return FacturaItem;
};
