module.exports = (sequelize, Sequelize) => {
    const InventarioMov = sequelize.define("inventario_mov", {
        id_mov: { 
            type: Sequelize.BIGINT, 
            autoIncrement: true, 
            primaryKey: true 
        },
        tipo: { 
            type: Sequelize.ENUM('IN','OUT','ADJUST'), 
            allowNull: false 
        },
        cantidad: { 
            type: Sequelize.INTEGER, 
            allowNull: false 
        },
        costo_unit: Sequelize.DECIMAL(12,2),
        motivo: Sequelize.STRING,
        ref_tipo: Sequelize.STRING,
        ref_id: Sequelize.BIGINT,
        created_at: { 
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW 
        }
    }, { 
        tableName: 'inventario_mov',
        freezeTableName: true,
        timestamps: false });
    return InventarioMov;
};
