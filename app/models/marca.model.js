module.exports = (sequelize, Sequelize) => {
    
    const Marca = sequelize.define("marca", {

        id_marca: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        nombre: { 
            type: Sequelize.STRING, 
            allowNull: false, 
            unique: true 
        }
    }, { timestamps: false });
    return Marca;
};
