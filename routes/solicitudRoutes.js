const express = require('express');
const router = express.Router();
const {
  listarSolicitudes,
  crearSolicitud,
  descargarSolicitud, 
  descargarExcel
} = require('../controllers/solicitudController');

// 🟢 Todas estas deben ser funciones válidas
router.get('/', listarSolicitudes);
router.post('/', crearSolicitud);
router.get('/descargar/:id', descargarSolicitud);
router.get('/descargar-excel', descargarExcel);

module.exports = router;

