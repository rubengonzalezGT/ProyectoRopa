// app/models/index.js

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

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// MODELOS
db.rol              = require("./rol.model.js")(sequelize, Sequelize);
db.usuario          = require("./usuario.model.js")(sequelize, Sequelize);

db.marca            = require("./marca.model.js")(sequelize, Sequelize);
db.categoria        = require("./categoria.model.js")(sequelize, Sequelize);
db.producto         = require("./producto.model.js")(sequelize, Sequelize);
db.productoVariante = require("./productoVariante.model.js")(sequelize, Sequelize);

db.cliente          = require("./cliente.model.js")(sequelize, Sequelize);
db.proveedor        = require("./proveedor.model.js")(sequelize, Sequelize);

db.inventarioMov    = require("./inventarioMov.model.js")(sequelize, Sequelize);
db.inventarioStock  = require("./inventarioStock.model.js")(sequelize, Sequelize);

db.compra           = require("./compra.model.js")(sequelize, Sequelize);
db.compraItem       = require("./compraItem.model.js")(sequelize, Sequelize);

db.venta            = require("./venta.model.js")(sequelize, Sequelize);
db.ventaItem        = require("./ventaItem.model.js")(sequelize, Sequelize);

db.pago             = require("./pago.model.js")(sequelize, Sequelize);

db.factura          = require("./factura.model.js")(sequelize, Sequelize);
db.facturaItem      = require("./facturaItem.model.js")(sequelize, Sequelize);

db.ventaDevolucion  = require("./ventaDevolucion.model.js")(sequelize, Sequelize);
db.ventaDevolucionItem = require("./ventaDevolucionItem.model.js")(sequelize, Sequelize);

// ====================
// ASOCIACIONES
// ====================

// Roles / Usuarios
db.rol.hasMany(db.usuario, { foreignKey: "id_rol", as: "usuarios" });
db.usuario.belongsTo(db.rol, { foreignKey: "id_rol", as: "rol" });

// Productos / Catálogos
db.marca.hasMany(db.producto, { foreignKey: "id_marca", as: "productos" });
db.producto.belongsTo(db.marca, { foreignKey: "id_marca", as: "marca" });

db.categoria.hasMany(db.producto, { foreignKey: "id_categoria", as: "productos" });
db.producto.belongsTo(db.categoria, { foreignKey: "id_categoria", as: "categoria" });

// Producto -> Variantes
db.producto.hasMany(db.productoVariante, { 
  foreignKey: "id_producto", 
  as: "variantes", 
  onDelete: "CASCADE" 
});
db.productoVariante.belongsTo(db.producto, { 
  foreignKey: "id_producto", 
  as: "producto" 
});

// Variante -> Stock
db.productoVariante.hasOne(db.inventarioStock, { 
  foreignKey: "id_variante", 
  as: "stock", 
  onDelete: "CASCADE" 
});
db.inventarioStock.belongsTo(db.productoVariante, { 
  foreignKey: "id_variante", 
  as: "variante" 
});

// Variante -> Movimientos
db.productoVariante.hasMany(db.inventarioMov, { 
  foreignKey: "id_variante", 
  as: "movimientos" 
});
db.inventarioMov.belongsTo(db.productoVariante, { 
  foreignKey: "id_variante", 
  as: "variante" 
});

// Compras
db.proveedor.hasMany(db.compra, { foreignKey: "id_proveedor", as: "compras" });
db.compra.belongsTo(db.proveedor, { foreignKey: "id_proveedor", as: "proveedor" });

db.usuario.hasMany(db.compra, { foreignKey: "id_usuario", as: "compras" });
db.compra.belongsTo(db.usuario, { foreignKey: "id_usuario", as: "usuario" });

db.compra.hasMany(db.compraItem, { foreignKey: "id_compra", as: "items", onDelete: "CASCADE" });
db.compraItem.belongsTo(db.compra, { foreignKey: "id_compra", as: "compra" });

db.productoVariante.hasMany(db.compraItem, { foreignKey: "id_variante", as: "itemsCompra" });
db.compraItem.belongsTo(db.productoVariante, { foreignKey: "id_variante", as: "variante" });

// Ventas
db.cliente.hasMany(db.venta, { foreignKey: "id_cliente", as: "ventas" });
db.venta.belongsTo(db.cliente, { foreignKey: "id_cliente", as: "cliente" });

db.usuario.hasMany(db.venta, { foreignKey: "id_usuario", as: "ventas" });
db.venta.belongsTo(db.usuario, { foreignKey: "id_usuario", as: "usuario" });

db.venta.hasMany(db.ventaItem, { foreignKey: "id_venta", as: "items", onDelete: "CASCADE" });
db.ventaItem.belongsTo(db.venta, { foreignKey: "id_venta", as: "venta" });

db.productoVariante.hasMany(db.ventaItem, { foreignKey: "id_variante", as: "itemsVenta" });
db.ventaItem.belongsTo(db.productoVariante, { foreignKey: "id_variante", as: "variante" });

// Pagos
db.venta.hasMany(db.pago, { foreignKey: "id_venta", as: "pagos", onDelete: "CASCADE" });
db.pago.belongsTo(db.venta, { foreignKey: "id_venta", as: "venta" });

// Facturación
db.venta.hasOne(db.factura, { foreignKey: "id_venta", as: "factura", onDelete: "SET NULL" });
db.factura.belongsTo(db.venta, { foreignKey: "id_venta", as: "venta" });

db.factura.hasMany(db.facturaItem, { foreignKey: "id_factura", as: "items", onDelete: "CASCADE" });
db.facturaItem.belongsTo(db.factura, { foreignKey: "id_factura", as: "factura" });

// Devoluciones
db.venta.hasMany(db.ventaDevolucion, { foreignKey: "id_venta", as: "devoluciones" });
db.ventaDevolucion.belongsTo(db.venta, { foreignKey: "id_venta", as: "venta" });

db.usuario.hasMany(db.ventaDevolucion, { foreignKey: "id_usuario", as: "devoluciones" });
db.ventaDevolucion.belongsTo(db.usuario, { foreignKey: "id_usuario", as: "usuario" });

db.ventaDevolucion.hasMany(db.ventaDevolucionItem, { foreignKey: "id_devolucion", as: "items", onDelete: "CASCADE" });
db.ventaDevolucionItem.belongsTo(db.ventaDevolucion, { foreignKey: "id_devolucion", as: "devolucion" });

db.ventaItem.hasMany(db.ventaDevolucionItem, { foreignKey: "id_item_venta", as: "itemsDevolucion" });
db.ventaDevolucionItem.belongsTo(db.ventaItem, { foreignKey: "id_item_venta", as: "itemVenta" });

module.exports = db;
