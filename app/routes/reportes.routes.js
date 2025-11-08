const express = require('express');
const router = express.Router();
const reportesCtrl = require('../controllers/reportes.controller');

// IMPORTANTE: pasar el handler (no dejarlo vacío)
    router.get('/ventas-dia', reportesCtrl.ventasDelDia);
    router.get("/ventas-mes", reportes.ventasPorMes);
    router.get("/ganancias-mes", reportes.gananciasPorMes);

module.exports = router;