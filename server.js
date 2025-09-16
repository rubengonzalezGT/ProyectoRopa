// Importamos los módulos necesarios
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Configuración de CORS (ajústalo si tu frontend está en otra URL)
var corsOptions = {
  origin: "http://localhost:8081"
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos con Sequelize
const db = require("./app/models");

// Sincronizar la BD (no borra datos)

db.sequelize.sync()
  .then(() => {
    console.log("Base de datos sincronizada correctamente.");
  })
  .catch((err) => {
    console.error("Error al sincronizar la BD:", err.message);
  });

// Si quieres reiniciar las tablas en desarrollo descomenta esto:
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Todas las tablas fueron eliminadas y recreadas.");
// });

// Ruta simple para verificar que el servidor responde
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application - Tienda de Ropa" });
});

// Rutas de la aplicación
/*
require("./app/routes/cliente.routes")(app);
require("./app/routes/factura.routes")(app);
require("./app/routes/pago.routes")(app);
require("./app/routes/producto.routes")(app);
require("./app/routes/venta.routes")(app);
*/
require("./app/routes/usuario.routes")(app);
require("./app/routes/rol.routes")(app); 

// Agrega aquí más rutas según los controladores que vayas creando

// Configuración del puerto y arranque del servidor
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
