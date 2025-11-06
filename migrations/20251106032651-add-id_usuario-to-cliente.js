'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('cliente', 'id_usuario', {
      type: Sequelize.INTEGER,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cliente', 'id_usuario');
  }
};
