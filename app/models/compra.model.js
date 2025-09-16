module.exports = (sequelize, Sequelize) => {
    const Compra = sequelize.define("compra", {
        id_compra: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        fecha: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        },
        subtotal: { 
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
        notas: Sequelize.TEXT
    }, { 
        tableName: 'compra',
        freezeTableName: true,
        timestamps: false });
    return Compra;
};
