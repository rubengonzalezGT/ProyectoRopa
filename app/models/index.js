// app/models/index.js

// 1) Cargar config y Sequelize (igual a tu ejemplo)
const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false } // útil para NeonDB
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false
});

// 2) Objeto contenedor
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 3) Cargar TODOS los modelos (ajusta nombres si cambian)
db.rol                 = require("./rol.model.js")(sequelize, Sequelize);
db.usuario              = require("./usuario.model.js")(sequelize, Sequelize);

db.marca                = require("./marca.model.js")(sequelize, Sequelize);
db.categoria            = require("./categoria.model.js")(sequelize, Sequelize);
db.producto             = require("./producto.model.js")(sequelize, Sequelize);
db.productoVariante     = require("./productoVariante.model.js")(sequelize, Sequelize);

db.cliente              = require("./cliente.model.js")(sequelize, Sequelize);
db.proveedor           = require("./proveedor.model.js")(sequelize, Sequelize);

db.inventarioMov        = require("./inventarioMov.model.js")(sequelize, Sequelize);
db.inventarioStock      = require("./inventarioStock.model.js")(sequelize, Sequelize);

db.compra               = require("./compra.model.js")(sequelize, Sequelize);
db.compraItem           = require("./compraItem.model.js")(sequelize, Sequelize);

db.venta                = require("./venta.model.js")(sequelize, Sequelize);
db.ventaItem            = require("./ventaItem.model.js")(sequelize, Sequelize);

db.pago                 = require("./pago.model.js")(sequelize, Sequelize);

db.factura              = require("./factura.model.js")(sequelize, Sequelize);
db.facturaItem          = require("./facturaItem.model.js")(sequelize, Sequelize);

db.ventaDevolucion     = require("./ventaDevolucion.model.js")(sequelize, Sequelize);
db.ventaDevolucionItem  = require("./ventaDevolucionItem.model.js")(sequelize, Sequelize);

// 4) ASOCIACIONES (foreign keys)
// -------- Roles / Usuarios --------
db.rol.hasMany(db.usuario,               { foreignKey: "id_rol" });
db.usuario.belongsTo(db.rol,             { foreignKey: "id_rol" });

// -------- Productos / Catálogos --------
db.marca.hasMany(db.producto,             { foreignKey: "id_marca" });
db.producto.belongsTo(db.marca,           { foreignKey: "id_marca" });

db.categoria.hasMany(db.producto,         { foreignKey: "id_categoria" });
db.producto.belongsTo(db.categoria,       { foreignKey: "id_categoria" });

db.producto.hasMany(db.productoVariante,  { foreignKey: "id_producto", onDelete: "CASCADE" });
db.productoVariante.belongsTo(db.producto,{ foreignKey: "id_producto" });

// -------- Inventario --------
db.productoVariante.hasOne(db.inventarioStock, { foreignKey: "id_variante", onDelete: "CASCADE" });
db.inventarioStock.belongsTo(db.productoVariante, { foreignKey: "id_variante" });

db.productoVariante.hasMany(db.inventarioMov, { foreignKey: "id_variante" });
db.inventarioMov.belongsTo(db.productoVariante, { foreignKey: "id_variante" });

// -------- Compras --------
db.proveedor.hasMany(db.compra,          { foreignKey: "id_proveedor" });
db.compra.belongsTo(db.proveedor,        { foreignKey: "id_proveedor" });

db.usuario.hasMany(db.compra,             { foreignKey: "id_usuario" });
db.compra.belongsTo(db.usuario,           { foreignKey: "id_usuario" });

db.compra.hasMany(db.compraItem,          { foreignKey: "id_compra", onDelete: "CASCADE" });
db.compraItem.belongsTo(db.compra,        { foreignKey: "id_compra" });

db.productoVariante.hasMany(db.compraItem,{ foreignKey: "id_variante" });
db.compraItem.belongsTo(db.productoVariante, { foreignKey: "id_variante" });

// -------- Ventas --------
db.cliente.hasMany(db.venta,              { foreignKey: "id_cliente" });
db.venta.belongsTo(db.cliente,            { foreignKey: "id_cliente" });

db.usuario.hasMany(db.venta,              { foreignKey: "id_usuario" });
db.venta.belongsTo(db.usuario,            { foreignKey: "id_usuario" });

db.venta.hasMany(db.ventaItem,            { foreignKey: "id_venta", onDelete: "CASCADE" });
db.ventaItem.belongsTo(db.venta,          { foreignKey: "id_venta" });

db.productoVariante.hasMany(db.ventaItem, { foreignKey: "id_variante" });
db.ventaItem.belongsTo(db.productoVariante, { foreignKey: "id_variante" });

// -------- Pagos --------
db.venta.hasMany(db.pago,                 { foreignKey: "id_venta", onDelete: "CASCADE" });
db.pago.belongsTo(db.venta,               { foreignKey: "id_venta" });

// -------- Facturación --------
// Nota: factura tiene UNIQUE(id_venta) en SQL; Sequelize no fuerza unique aquí,
// pero respetará el FK y podrás definir unique en el model si lo deseas.
db.venta.hasOne(db.factura,               { foreignKey: "id_venta", onDelete: "SET NULL" });
db.factura.belongsTo(db.venta,            { foreignKey: "id_venta" });

db.factura.hasMany(db.facturaItem,        { foreignKey: "id_factura", onDelete: "CASCADE" });
db.facturaItem.belongsTo(db.factura,      { foreignKey: "id_factura" });

// -------- Devoluciones --------
db.venta.hasMany(db.ventaDevolucion,     { foreignKey: "id_venta" });
db.ventaDevolucion.belongsTo(db.venta,   { foreignKey: "id_venta" });

db.usuario.hasMany(db.ventaDevolucion,   { foreignKey: "id_usuario" });
db.ventaDevolucion.belongsTo(db.usuario, { foreignKey: "id_usuario" });

db.ventaDevolucion.hasMany(db.ventaDevolucionItem, { foreignKey: "id_devolucion", onDelete: "CASCADE" });
db.ventaDevolucionItem.belongsTo(db.ventaDevolucion, { foreignKey: "id_devolucion" });

// item de devolución referencia el item original de venta
db.ventaItem.hasMany(db.ventaDevolucionItem, { foreignKey: "id_item_venta" });
db.ventaDevolucionItem.belongsTo(db.ventaItem, { foreignKey: "id_item_venta" });

// 5) Exportar
module.exports = db;
