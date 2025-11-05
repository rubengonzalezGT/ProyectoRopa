const db = require("../models");
const Pago = db.pago;
const Venta = db.venta;
const paypalClient = require("../config/paypalClient.config.js");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// Helper: calcula total pagado y saldo pendiente de una venta
async function calcularResumenPagos(id_venta) {
  const pagos = await Pago.findAll({ where: { id_venta } });
  const totalPagado = pagos.reduce(
    (s, p) => (p.estado === "PAID" ? s + parseFloat(p.monto) : s),
    0
  );
  const venta = await Venta.findByPk(id_venta);
  const totalVenta = venta ? parseFloat(venta.total) : 0;
  const restante = parseFloat((totalVenta - totalPagado).toFixed(2));
  return { totalPagado, restante, totalVenta };
}

// ==================== 🔹 PAGOS MANUALES (CASH / CARD) ====================

// Crear pago manual
exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id_venta, metodo, monto, referencia } = req.body;

    if (!id_venta || !metodo || monto == null) {
      await t.rollback();
      return res
        .status(400)
        .send({ message: "Faltan datos: id_venta, metodo, monto." });
    }

    if (!["CASH", "CARD"].includes(metodo)) {
      await t.rollback();
      return res
        .status(400)
        .send({ message: "Método inválido. Use 'CASH' o 'CARD'." });
    }

    const venta = await Venta.findByPk(id_venta);
    if (!venta) {
      await t.rollback();
      return res.status(404).send({ message: "Venta no encontrada." });
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      await t.rollback();
      return res.status(400).send({ message: "Monto inválido." });
    }

    // Validar que no se exceda el saldo
    const resumen = await calcularResumenPagos(id_venta);
    if (montoNum > resumen.restante) {
      await t.rollback();
      return res.status(400).send({
        message: "El pago excede el saldo pendiente.",
        totalVenta: resumen.totalVenta,
        totalPagado: resumen.totalPagado,
        restante: resumen.restante,
      });
    }

    const pago = await Pago.create(
      {
        id_venta,
        metodo,
        monto: montoNum,
        estado: "PAID",
        proveedor: metodo === "CARD" ? "VISA" : "CAJA",
        txn_id: referencia || null,
        paid_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    const nuevoResumen = await calcularResumenPagos(id_venta);

    res.status(201).send({ pago, resumen: nuevoResumen });
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error al crear pago." });
  }
};

// ==================== 🔹 PAYPAL ====================

// Crear orden PayPal
exports.createPaypalOrder = async (req, res) => {
  try {
    const { id_venta } = req.body;
    if (!id_venta) return res.status(400).send({ message: "id_venta es requerido" });

    const venta = await Venta.findByPk(id_venta);
    if (!venta) return res.status(404).send({ message: "Venta no encontrada" });

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `VENTA-${id_venta}`,
          amount: {
            currency_code: "USD",
            value: venta.total.toString(),  // Total de la venta
          },
        },
      ],
      application_context: {
        brand_name: "UMG Tienda Ropa",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: "http://localhost:8081/success",  // Cambiar con tu URL
        cancel_url: "http://localhost:8081/cancel"   // Cambiar con tu URL
      }
    });

    const order = await paypalClient.client().execute(request);
    res.send({
      orderID: order.result.id,
      links: order.result.links,
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creando orden PayPal" });
  }
};

// Capturar orden PayPal
exports.capturePaypalOrder = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { orderID, id_venta } = req.body;

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await paypalClient.client().execute(request);

    const amount = capture.result.purchase_units[0].payments.captures[0].amount.value;
    const currency = capture.result.purchase_units[0].payments.captures[0].amount.currency_code;
    const txnId = capture.result.purchase_units[0].payments.captures[0].id;

    // Guardar pago en la base de datos
    const pago = await Pago.create(
      {
        id_venta,
        metodo: "PAYPAL",
        monto: amount,
        moneda: currency,
        estado: "PAID",
        proveedor: "PAYPAL",
        txn_id: txnId,
        auth_code: txnId.substring(0, 8),
        card_brand: "PAYPAL",
        card_last4: "0000",
        paid_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).send({ pago, raw: capture.result });
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error capturando orden PayPal" });
  }
};
