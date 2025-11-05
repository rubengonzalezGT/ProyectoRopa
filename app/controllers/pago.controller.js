const db = require("../models");
const Pago = db.pago;
const paypalClient = require("../config/paypalClient.config.js");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

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

// Crear orden PayPal
exports.createPaypalOrder = async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body;

    if (!amount) {
      return res.status(400).send({ message: "Monto requerido." });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount
        }
      }]
    });

    const order = await paypalClient.client().execute(request);
    res.status(201).send({ id: order.result.id });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear orden PayPal." });
  }
};

// Capturar orden PayPal
exports.capturePaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).send({ message: "Order ID requerido." });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await paypalClient.client().execute(request);

    // Crear registro de pago en BD
    const pago = await Pago.create({
      metodo: 'PAYPAL',
      monto: capture.result.purchase_units[0].payments.captures[0].amount.value,
      moneda: capture.result.purchase_units[0].payments.captures[0].amount.currency_code,
      estado: 'PAID',
      proveedor: 'PayPal',
      txn_id: capture.result.id,
      paid_at: new Date()
    });

    res.send({ capture: capture.result, pago });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al capturar orden PayPal." });
  }
};
