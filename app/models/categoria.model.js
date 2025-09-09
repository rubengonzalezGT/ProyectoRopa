module.exports = (sequelize, Sequelize) => {

    const Categoria = sequelize.define("categoria", {

        id_categoria: { 
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
    return Categoria;
};
