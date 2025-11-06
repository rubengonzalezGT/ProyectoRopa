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
        id_usuario: {
            type: Sequelize.INTEGER,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        created_at: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        }
    }, { 
        tableName: 'cliente',
        freezeTableName: true,
        timestamps: false });
    return Cliente;
};
