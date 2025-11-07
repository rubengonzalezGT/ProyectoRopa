// Cargar variables de entorno desde .env
require("dotenv").config();

// Importamos los módulos necesarios
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ✅ CORS dinámico: permite Angular local y Render
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origin (ej. Postman, curl)
    if (!origin) return callback(null, true);

    // Lista de orígenes permitidos
    const allowedOrigins = [
      "http://localhost:4200",                // Frontend local
      "https://proyectoropa-ijsq.onrender.com", // Backend Render
      "https://neonvibe.onrender.com"         // Frontend Render
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Bloqueado por CORS:", origin);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Soporte para preflight requests

// Middleware para parsear JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos con Sequelize
const db = require("./app/models");
const bcrypt = require("bcryptjs"); 

// Sincronizar la BD (sin borrar datos)
db.sequelize.sync()
  .then(async () => {
    console.log("Base de datos sincronizada correctamente.");

    try {
      const Rol = db.rol;
      const Usuario = db.usuario;

      // Crear rol admin si no existe
      let rolAdmin = await Rol.findOne({ where: { nombre_rol: "admin" } });
      if (!rolAdmin) {
        rolAdmin = await Rol.create({ nombre_rol: "admin" });
        console.log("✅ Rol admin creado");
      }

      // Crear usuario admin si no existe
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
        console.log("✅ Usuario admin creado (email: admin@tienda.com | pass: admin123)");
      }
    } catch (err) {
      console.error("⚠️ Error al crear datos iniciales:", err.message);
    }
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la BD:", err.message);
  });

// Ruta simple para probar servidor
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application - Tienda de Ropa (Render + Angular)" });
});

// Rutas principales
require("./app/routes/usuario.routes")(app);
require("./app/routes/rol.routes")(app);
require("./app/routes/marca.routes")(app);
require("./app/routes/categoria.routes")(app);
require("./app/routes/producto.routes")(app);
require("./app/routes/productoVariante.routes")(app);
require("./app/routes/productoImagen.routes")(app);
require("./app/routes/inventarioMov.routes")(app);
require("./app/routes/inventarioStock.routes")(app);
require("./app/routes/compra.routes")(app);
require("./app/routes/compraItem.routes")(app);
require("./app/routes/proveedor.routes")(app);
require("./app/routes/venta.routes")(app);
require("./app/routes/ventaItem.routes")(app);
require("./app/routes/ventaDevolucion.routes")(app);
require("./app/routes/cliente.routes")(app);
require("./app/routes/factura.routes")(app);
require("./app/routes/pago.routes")(app);

// Endpoints para redirección de PayPal
app.get("/success", (req, res) => {
  const { token } = req.query;
  res.send(`<h1>✅ Pago aprobado</h1><p>Order ID: ${token}</p>`);
});

app.get("/cancel", (req, res) => {
  res.send("<h1>❌ Pago cancelado</h1><p>El usuario canceló el proceso en PayPal.</p>");
});

// Iniciar servidor
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}.`);
});
