const express = require('express');
const router = express.Router();
const reportesCtrl = require('../controllers/reportes.controller');

// IMPORTANTE: pasar el handler (no dejarlo vacío)
    router.get('/ventas-dia', reportesCtrl.ventasDelDia);
    router.get("/ventas-mes", reportesCtrl.ventasPorMes);
    router.get("/ganancias-mes", reportesCtrl.gananciasPorMes);

module.exports = router;