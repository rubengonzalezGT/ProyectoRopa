module.exports = (sequelize, Sequelize) => {
    
    const Usuario = sequelize.define("usuarios", {

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
    }, { timestamps: false });
    return Usuario;
};
