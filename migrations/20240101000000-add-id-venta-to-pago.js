'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pago', 'id_venta', {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'venta',
        key: 'id_venta'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pago', 'id_venta');
  }
};
