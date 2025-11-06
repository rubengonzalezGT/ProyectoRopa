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
        },
        imagen: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, { 
        tableName: 'marca',
        freezeTableName: true,
        timestamps: false 
    });
    return Marca;
};