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
db.roles                 = require("./rol.model.js")(sequelize, Sequelize);
db.usuarios              = require("./usuario.model.js")(sequelize, Sequelize);

db.marcas                = require("./marca.model.js")(sequelize, Sequelize);
db.categorias            = require("./categoria.model.js")(sequelize, Sequelize);
db.productos             = require("./producto.model.js")(sequelize, Sequelize);
db.productoVariantes     = require("./productoVariante.model.js")(sequelize, Sequelize);

db.clientes              = require("./cliente.model.js")(sequelize, Sequelize);
db.proveedores           = require("./proveedor.model.js")(sequelize, Sequelize);

db.inventarioMovs        = require("./inventarioMov.model.js")(sequelize, Sequelize);
db.inventarioStocks      = require("./inventarioStock.model.js")(sequelize, Sequelize);

db.compras               = require("./compra.model.js")(sequelize, Sequelize);
db.compraItems           = require("./compraItem.model.js")(sequelize, Sequelize);

db.ventas                = require("./venta.model.js")(sequelize, Sequelize);
db.ventaItems            = require("./ventaItem.model.js")(sequelize, Sequelize);

db.pagos                 = require("./pago.model.js")(sequelize, Sequelize);

db.facturas              = require("./factura.model.js")(sequelize, Sequelize);
db.facturaItems          = require("./facturaItem.model.js")(sequelize, Sequelize);

db.ventaDevoluciones     = require("./ventaDevolucion.model.js")(sequelize, Sequelize);
db.ventaDevolucionItems  = require("./ventaDevolucionItem.model.js")(sequelize, Sequelize);

// 4) ASOCIACIONES (foreign keys)
// -------- Roles / Usuarios --------
db.roles.hasMany(db.usuarios,               { foreignKey: "id_rol" });
db.usuarios.belongsTo(db.roles,             { foreignKey: "id_rol" });

// -------- Productos / Catálogos --------
db.marcas.hasMany(db.productos,             { foreignKey: "id_marca" });
db.productos.belongsTo(db.marcas,           { foreignKey: "id_marca" });

db.categorias.hasMany(db.productos,         { foreignKey: "id_categoria" });
db.productos.belongsTo(db.categorias,       { foreignKey: "id_categoria" });

db.productos.hasMany(db.productoVariantes,  { foreignKey: "id_producto", onDelete: "CASCADE" });
db.productoVariantes.belongsTo(db.productos,{ foreignKey: "id_producto" });

// -------- Inventario --------
db.productoVariantes.hasOne(db.inventarioStocks, { foreignKey: "id_variante", onDelete: "CASCADE" });
db.inventarioStocks.belongsTo(db.productoVariantes, { foreignKey: "id_variante" });

db.productoVariantes.hasMany(db.inventarioMovs, { foreignKey: "id_variante" });
db.inventarioMovs.belongsTo(db.productoVariantes, { foreignKey: "id_variante" });

// -------- Compras --------
db.proveedores.hasMany(db.compras,          { foreignKey: "id_proveedor" });
db.compras.belongsTo(db.proveedores,        { foreignKey: "id_proveedor" });

db.usuarios.hasMany(db.compras,             { foreignKey: "id_usuario" });
db.compras.belongsTo(db.usuarios,           { foreignKey: "id_usuario" });

db.compras.hasMany(db.compraItems,          { foreignKey: "id_compra", onDelete: "CASCADE" });
db.compraItems.belongsTo(db.compras,        { foreignKey: "id_compra" });

db.productoVariantes.hasMany(db.compraItems,{ foreignKey: "id_variante" });
db.compraItems.belongsTo(db.productoVariantes, { foreignKey: "id_variante" });

// -------- Ventas --------
db.clientes.hasMany(db.ventas,              { foreignKey: "id_cliente" });
db.ventas.belongsTo(db.clientes,            { foreignKey: "id_cliente" });

db.usuarios.hasMany(db.ventas,              { foreignKey: "id_usuario" });
db.ventas.belongsTo(db.usuarios,            { foreignKey: "id_usuario" });

db.ventas.hasMany(db.ventaItems,            { foreignKey: "id_venta", onDelete: "CASCADE" });
db.ventaItems.belongsTo(db.ventas,          { foreignKey: "id_venta" });

db.productoVariantes.hasMany(db.ventaItems, { foreignKey: "id_variante" });
db.ventaItems.belongsTo(db.productoVariantes, { foreignKey: "id_variante" });

// -------- Pagos --------
db.ventas.hasMany(db.pagos,                 { foreignKey: "id_venta", onDelete: "CASCADE" });
db.pagos.belongsTo(db.ventas,               { foreignKey: "id_venta" });

// -------- Facturación --------
// Nota: factura tiene UNIQUE(id_venta) en SQL; Sequelize no fuerza unique aquí,
// pero respetará el FK y podrás definir unique en el model si lo deseas.
db.ventas.hasOne(db.facturas,               { foreignKey: "id_venta", onDelete: "SET NULL" });
db.facturas.belongsTo(db.ventas,            { foreignKey: "id_venta" });

db.facturas.hasMany(db.facturaItems,        { foreignKey: "id_factura", onDelete: "CASCADE" });
db.facturaItems.belongsTo(db.facturas,      { foreignKey: "id_factura" });

// -------- Devoluciones --------
db.ventas.hasMany(db.ventaDevoluciones,     { foreignKey: "id_venta" });
db.ventaDevoluciones.belongsTo(db.ventas,   { foreignKey: "id_venta" });

db.usuarios.hasMany(db.ventaDevoluciones,   { foreignKey: "id_usuario" });
db.ventaDevoluciones.belongsTo(db.usuarios, { foreignKey: "id_usuario" });

db.ventaDevoluciones.hasMany(db.ventaDevolucionItems, { foreignKey: "id_devolucion", onDelete: "CASCADE" });
db.ventaDevolucionItems.belongsTo(db.ventaDevoluciones, { foreignKey: "id_devolucion" });

// item de devolución referencia el item original de venta
db.ventaItems.hasMany(db.ventaDevolucionItems, { foreignKey: "id_item_venta" });
db.ventaDevolucionItems.belongsTo(db.ventaItems, { foreignKey: "id_item_venta" });

// 5) Exportar
module.exports = db;
