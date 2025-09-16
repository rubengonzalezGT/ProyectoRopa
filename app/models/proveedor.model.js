module.exports = (sequelize, Sequelize) => {
    const Proveedor = sequelize.define("proveedor", {
        id_proveedor: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        nombre: { 
            type: Sequelize.STRING, 
            allowNull: false 
        },
        telefono: Sequelize.STRING,
        email: Sequelize.STRING,
        direccion: Sequelize.STRING,
        activo: { 
            type: Sequelize.BOOLEAN, 
            defaultValue: true 
        }
    }, { 
        tableName: 'proveedor',
        freezeTableName: true,
        timestamps: false });
    return Proveedor;
};
