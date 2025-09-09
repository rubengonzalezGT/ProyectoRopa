module.exports = (sequelize, Sequelize) => {

    const Rol = sequelize.define("rol", {

        id_rol: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true
        },
        nombre_rol: { 
            type: Sequelize.STRING, 
            allowNull: false, 
            unique: true 
        }
    }, { timestamps: false });
    return Rol;
};
