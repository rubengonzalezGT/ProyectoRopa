'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('venta', 'stripe_payment_intent_id', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('venta', 'stripe_confirmation_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('venta', 'stripe_payment_intent_id');
    await queryInterface.removeColumn('venta', 'stripe_confirmation_id');
  }
};
