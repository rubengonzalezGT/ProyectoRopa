const db = require("../models");
const Pago = db.pago;
const paypalClient = require("../config/paypalClient.config.js");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crear un nuevo pago (CASH o CARD)
exports.create = async (req, res) => {
  try {
    const { metodo, monto, moneda, estado, proveedor, txn_id, auth_code, card_brand, card_last4 } = req.body;

    if (!metodo || !monto) {
      return res.status(400).send({ message: "Faltan datos obligatorios (metodo, monto)." });
    }

    const pago = await Pago.create({
      metodo,
      monto,
      moneda: moneda || 'GTQ',
      estado: estado || 'PENDING',
      proveedor,
      txn_id,
      auth_code,
      card_brand,
      card_last4,
      paid_at: estado === 'PAID' ? new Date() : null
    });

    res.status(201).send(pago);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear el pago." });
  }
};

// Listar todos los pagos
exports.findAll = async (_req, res) => {
  try {
    const pagos = await Pago.findAll({
      order: [["id_pago", "DESC"]]
    });
    res.send(pagos);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener pagos." });
  }
};

// Obtener un pago por ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findByPk(id);

    if (!pago) return res.status(404).send({ message: "Pago no encontrado." });

    res.send(pago);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener pago con id=" + req.params.id });
  }
};

// Eliminar un pago
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pago.destroy({ where: { id_pago: id } });

    if (deleted === 0) {
      return res.status(404).send({ message: "Pago no encontrado." });
    }

    res.send({ message: "Pago eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "No se pudo eliminar el pago." });
  }
};

/** Crear PaymentIntent Stripe asociado a una venta */
exports.createStripePaymentIntent = async (req, res) => {
  try {
    const { id_venta, amount, currency = 'USD' } = req.body;

    if (!id_venta || !amount) {
      return res.status(400).send({ message: "id_venta y monto requeridos." });
    }

    // Crear PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: currency.toLowerCase(),
      metadata: {
        id_venta: id_venta.toString()
      },
      description: `Venta ID: ${id_venta}`
    });

    // Crear registro de pago pendiente asociado a la venta
    const pago = await Pago.create({
      id_venta,
      metodo: 'STRIPE',
      monto: amount,
      moneda: currency,
      estado: 'PENDING',
      proveedor: 'Stripe',
      txn_id: paymentIntent.id, // Guardar payment_intent_id como txn_id
      paid_at: null
    });

    // Actualizar venta con payment_intent_id
    const Venta = db.venta;
    await Venta.update(
      { stripe_payment_intent_id: paymentIntent.id, estado: 'PAGO_PENDING' },
      { where: { id_venta } }
    );

    res.status(201).send({ 
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      pago_id: pago.id_pago 
    });
  } catch (err) {
    console.error('Error en createStripePaymentIntent:', err);
    res.status(500).send({ message: err.message || "Error al crear PaymentIntent Stripe." });
  }
};

 /** Confirmar PaymentIntent Stripe y actualizar venta */
exports.confirmStripePayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body;

    if (!payment_intent_id) {
      return res.status(400).send({ message: "Payment Intent ID requerido." });
    }

    // Recuperar el PaymentIntent de Stripe para verificar status (no confirmar de nuevo)
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).send({ message: `Pago no completado. Status: ${paymentIntent.status}` });
    }

    const amount = paymentIntent.amount / 100; // Convertir de centavos
    const currency = paymentIntent.currency.toUpperCase();

    // Buscar el pago pendiente por txn_id (payment_intent_id)
    const pago = await Pago.findOne({ where: { txn_id: payment_intent_id } });

    if (!pago) {
      return res.status(404).send({ message: "Pago pendiente no encontrado para este PaymentIntent." });
    }

    // Actualizar pago a PAID
    await pago.update({
      estado: 'PAID',
      auth_code: paymentIntent.id, // O paymentIntent.charges.data[0]?.id si hay charge
      paid_at: new Date()
    });

    // Actualizar venta asociada a COMPLETED
    const Venta = db.venta;
    await Venta.update(
      { estado: 'COMPLETED', stripe_confirmation_id: paymentIntent.id },
      { where: { id_venta: pago.id_venta } }
    );

    res.send({ 
      success: true, 
      payment_intent: paymentIntent,
      pago_id: pago.id_pago,
      message: "Pago confirmado y venta completada exitosamente."
    });
  } catch (err) {
    console.error('Error en confirmStripePayment:', err);
    res.status(500).send({ message: err.message || "Error al verificar PaymentIntent Stripe." });
  }
};
