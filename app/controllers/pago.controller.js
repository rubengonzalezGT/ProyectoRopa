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

/** Crear orden PayPal asociada a una venta */
exports.createPaypalOrder = async (req, res) => {
  try {
    const { id_venta, amount, currency = 'USD' } = req.body;

    if (!id_venta || !amount) {
      return res.status(400).send({ message: "id_venta y monto requeridos." });
    }

    // Crear orden PayPal
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount
        },
        description: `Venta ID: ${id_venta}` // Descripción para referencia
      }]
    });

    const order = await paypalClient.client().execute(request);

    // Crear registro de pago pendiente asociado a la venta
    const pago = await Pago.create({
      id_venta, // Asociar con la venta
      metodo: 'PAYPAL',
      monto: amount,
      moneda: currency,
      estado: 'PENDING',
      proveedor: 'PayPal',
      txn_id: order.result.id, // Guardar orderId como txn_id
      paid_at: null
    });

    // Opcional: Actualizar venta con orderId si hay campo
    const Venta = db.venta;
    await Venta.update(
      { paypal_order_id: order.result.id, estado: 'PAGO_PENDING' },
      { where: { id_venta } }
    );

    res.status(201).send({ id: order.result.id, pago_id: pago.id_pago });
  } catch (err) {
    console.error('Error en createPaypalOrder:', err);
    res.status(500).send({ message: err.message || "Error al crear orden PayPal." });
  }
};

/** Capturar orden PayPal y actualizar venta */
exports.capturePaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).send({ message: "Order ID requerido." });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await paypalClient.client().execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).send({ message: "Captura no completada." });
    }

    const captureData = capture.result.purchase_units[0].payments.captures[0];
    const amount = captureData.amount.value;
    const currency = captureData.amount.currency_code;

    // Buscar el pago pendiente por txn_id (orderId)
    const pago = await Pago.findOne({ where: { txn_id: orderId } });

    if (!pago) {
      return res.status(404).send({ message: "Pago pendiente no encontrado para esta orden." });
    }

    // Actualizar pago a PAID
    await pago.update({
      estado: 'PAID',
      auth_code: captureData.id,
      paid_at: new Date(),
      // Agregar más detalles si necesario: captureData.seller_protection, etc.
    });

    // Actualizar venta asociada a COMPLETED
    const Venta = db.venta;
    await Venta.update(
      { estado: 'COMPLETED', paypal_capture_id: captureData.id },
      { where: { id_venta: pago.id_venta } }
    );

    res.send({ 
      success: true, 
      capture: captureData, 
      pago_id: pago.id_pago,
      message: "Pago capturado y venta completada exitosamente."
    });
  } catch (err) {
    console.error('Error en capturePaypalOrder:', err);
    res.status(500).send({ message: err.message || "Error al capturar orden PayPal." });
  }
};
