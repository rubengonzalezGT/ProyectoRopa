module.exports = (sequelize, Sequelize) => {
    const Cliente = sequelize.define("cliente", {
        id_cliente: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        nombre: { 
            type: Sequelize.STRING, 
            allowNull: false 
        },
        nit: Sequelize.STRING,
        email: Sequelize.STRING,
        telefono: Sequelize.STRING,
        direccion: Sequelize.STRING,
        created_at: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        }
    }, { timestamps: false });
    return Cliente;
};
