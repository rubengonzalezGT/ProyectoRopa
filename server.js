// Cargar variables de entorno desde .env
require("dotenv").config();

// Importamos los módulos necesarios
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ✅ Configuración de CORS para Render + desarrollo local
const corsOptions = {
  origin: [
    "http://localhost:4200",               // Frontend local (Angular)
    "https://proyectoropa-ijsq.onrender.com" // Dominio de tu backend en Render
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilita preflight requests para todos los endpoints

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos con Sequelize
const db = require("./app/models");
const bcrypt = require("bcryptjs"); 

// Sincronizar la BD (no borra datos)
db.sequelize.sync()
  .then(async () => {
    console.log("Base de datos sincronizada correctamente.");

    try {
      const Rol = db.rol;
      const Usuario = db.usuario;

      // Verificar si ya existe un rol admin
      let rolAdmin = await Rol.findOne({ where: { nombre_rol: "admin" } });
      if (!rolAdmin) {
        rolAdmin = await Rol.create({ nombre_rol: "admin" });
        console.log("Rol admin creado");
      }

      // Verificar si ya existe un usuario admin
      let usuarioAdmin = await Usuario.findOne({ where: { email: "admin@tienda.com" } });
      if (!usuarioAdmin) {
        const hash = await bcrypt.hash("admin123", 10);
        await Usuario.create({
          nombre: "Administrador",
          email: "admin@tienda.com",
          password_hash: hash,
          direccion: "Oficina central",
          id_rol: rolAdmin.id_rol,
          estado: true
        });
        console.log("Usuario admin creado (email: admin@tienda.com | pass: admin123)");
      }
    } catch (err) {
      console.error("Error al crear datos iniciales:", err.message);
    }
  })
  .catch((err) => {
    console.error("Error al sincronizar la BD:", err.message);
  });

// Ruta simple para verificar que el servidor responde
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application - Tienda de Ropa" });
});

// Rutas de la aplicación
require("./app/routes/usuario.routes")(app);
require("./app/routes/rol.routes")(app); 
require("./app/routes/marca.routes")(app);
require("./app/routes/categoria.routes")(app);
require("./app/routes/producto.routes")(app);
require("./app/routes/productoVariante.routes")(app);
require("./app/routes/inventarioMov.routes")(app);
require("./app/routes/inventarioStock.routes")(app);
require("./app/routes/compra.routes")(app);
require("./app/routes/compraItem.routes")(app);
require("./app/routes/proveedor.routes")(app);
require("./app/routes/venta.routes")(app);
require("./app/routes/ventaItem.routes")(app);
require("./app/routes/cliente.routes")(app);
require("./app/routes/ventaDevolucion.routes")(app);
require("./app/routes/factura.routes")(app);
require("./app/routes/pago.routes")(app);
require("./app/routes/productoImagen.routes")(app);

// Endpoints para redirección de PayPal
app.get("/success", (req, res) => {
  const { token } = req.query; // PayPal manda el orderID como token
  res.send(`<h1>Pago aprobado</h1><p>Order ID: ${token}</p>`);
});

app.get("/cancel", (req, res) => {
  res.send("<h1>Pago cancelado</h1><p>El usuario canceló el proceso en PayPal.</p>");
});

// Configuración del puerto y arranque del servidor
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
