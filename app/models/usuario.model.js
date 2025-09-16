module.exports = (sequelize, Sequelize) => {
    
    const Usuario = sequelize.define("usuario", {

        id_usuario: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        nombre: { 
            type: Sequelize.STRING, 
            allowNull: false 
        },
        email: { 
            type: Sequelize.STRING, 
            allowNull: false, 
            unique: true 
        },
        password_hash: { 
            type: Sequelize.STRING, 
            allowNull: false 
        },
        direccion: Sequelize.STRING,
        estado: { 
            type: Sequelize.BOOLEAN, 
            defaultValue: true 
        },
        created_at: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        }
    }, { 
        tableName: 'usuario',
        freezeTableName: true,
        timestamps: false });
    return Usuario;
};
