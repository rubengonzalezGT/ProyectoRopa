# TODO: Cambios en Backend para Integración de Cliente con Usuario

## Pasos para Soporte de Auto-Creación de Cliente en Registro y Fetch por Usuario

- [ ] Verificar/Agregar id_usuario en Model Cliente (app/models/cliente.model.js):
  - Asegurar FK a usuario.id_usuario. Si no existe, agregar con migration.

- [ ] Editar app/controllers/cliente.controller.js:
  - En createCliente: Aceptar id_usuario en body, validar que usuario existe (findByPk), crear cliente con id_usuario.
  - Agregar getClienteByUser: GET by id_usuario, return cliente o 404 si no existe.

- [ ] Editar app/routes/cliente.routes.js:
  - Agregar route GET /by-user/:id_usuario -> getClienteByUser.

- [ ] Si needed, crear migration para addColumn id_usuario to cliente (sequelize-cli).

- [ ] Verificar cambios: Test con curl POST /api/clientes/create with id_usuario, GET /api/clientes/by-user/:id.

- [ ] Actualizar este TODO con progreso.

## Notas
- Asumir Sequelize/Express. Si id_usuario ya existe, solo actualizar controller/route.
- Después de edits, restart server (node server.js), test endpoints.
