module.exports = (sequelize, Sequelize) => {
    const Venta = sequelize.define("venta", {
        id_venta: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        canal: { 
            type: Sequelize.ENUM('STORE','ONLINE'), 
            allowNull: false 
        },
        fecha_venta: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        },
        subtotal: { 
            type: Sequelize.DECIMAL(12,2), 
            defaultValue: 0 
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
            defaultValue: 0 
        },
        estado: { 
            type: Sequelize.STRING, 
            defaultValue: 'COMPLETED' 
        },
        numero_factura: { 
            type: Sequelize.STRING, 
            unique: true 
        },
        stripe_payment_intent_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
        stripe_confirmation_id: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, { 
        tableName: 'venta',
        freezeTableName: true,
        timestamps: false });
    return Venta;
};
