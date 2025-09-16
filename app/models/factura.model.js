module.exports = (sequelize, Sequelize) => {
    const Factura = sequelize.define("factura", {
        id_factura: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        serie: Sequelize.STRING,
        numero: Sequelize.STRING,
        fecha_emision: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        },
        nit_receptor: Sequelize.STRING,
        nombre_receptor: Sequelize.STRING,
        direccion_rec: Sequelize.STRING,
        subtotal: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        },
        impuesto: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        },
        total: { 
            type: Sequelize.DECIMAL(12,2), 
            allowNull: false 
        },
        uuid_sat: Sequelize.STRING,
        pdf_url: Sequelize.STRING
    }, { 
        tableName: 'factura',
        freezeTableName: true,
        timestamps: false });
    return Factura;
};
