module.exports = (sequelize, Sequelize) => {
    const Pago = sequelize.define("pago", {
        id_pago: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true },
        metodo: { 
            type: Sequelize.ENUM('CASH','CARD', 'PAYPAL', 'STRIPE'), 
            allowNull: false 
        },
        monto: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        },
        moneda: { 
            type: Sequelize.STRING, 
            defaultValue: 'GTQ' 
        },
        estado: { 
            type: Sequelize.ENUM('PENDING','PAID','FAILED','REFUNDED'), 
            defaultValue: 'PENDING' 
        },
        proveedor: Sequelize.STRING,
        txn_id: Sequelize.STRING,
        auth_code: Sequelize.STRING,
        card_brand: Sequelize.STRING,
        card_last4: Sequelize.STRING,
        paid_at: Sequelize.DATE,
        id_venta: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
                model: 'venta',
                key: 'id_venta'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, { 
        tableName: 'pago',
        freezeTableName: true,
        timestamps: false });
    return Pago;
};
