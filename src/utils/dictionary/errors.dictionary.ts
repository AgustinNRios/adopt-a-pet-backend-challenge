const errorsDictionary = {
  // 🔒 Errores de Autenticación y Autorización
  AUTH_INVALID_CREDENTIALS: {
    code: 40101,
    message: 'Usuario o contraseña incorrectos',
    httpStatus: 401,
    isOperational: true, // Error esperado durante la operación normal
  },
  AUTH_TOKEN_EXPIRED: {
    code: 40102,
    message: 'Token expirado',
    httpStatus: 401,
    isOperational: true, // Error común y manejable
  },
  AUTH_TOKEN_INVALID: {
    code: 40103,
    message: 'Token inválido o manipulado',
    httpStatus: 401,
    isOperational: true, // Error de seguridad esperado
  },
  AUTH_FORBIDDEN: {
    code: 40301,
    message: 'El usuario no tiene permisos para esta acción',
    httpStatus: 403,
    isOperational: true, // Error de autorización normal
  },
  AUTH_SCOPE_INSUFFICIENT: {
    code: 40302,
    message: 'El token no tiene el alcance necesario',
    httpStatus: 403,
    isOperational: true, // Error de permisos esperado
  },

  // 📦 Errores de Recursos (RESTful)
  RESOURCE_NOT_FOUND: {
    code: 40401,
    message: 'El recurso solicitado no existe',
    httpStatus: 404,
    isOperational: true, // Error común en operaciones CRUD
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 40901,
    message: 'Conflicto: el recurso ya existe',
    httpStatus: 409,
    isOperational: true, // Error de validación normal
  },
  INVALID_RESOURCE_ID: {
    code: 40001,
    message: 'El ID del recurso no es válido',
    httpStatus: 400,
    isOperational: true, // Error de validación común
  },
  MISSING_REQUIRED_FIELDS: {
    code: 40002,
    message: 'Faltan campos obligatorios',
    httpStatus: 400,
    isOperational: true, // Error de validación esperado
  },

  // 🛂 Errores de Validación
  VALIDATION_ERROR: {
    code: 42201,
    message: 'Los datos enviados no cumplen con el esquema',
    httpStatus: 422,
    isOperational: true, // Error de validación normal
  },
  FIELD_TOO_SHORT: {
    code: 42202,
    message: 'Un campo es demasiado corto',
    httpStatus: 422,
    isOperational: true, // Error de validación esperado
  },
  FIELD_TOO_LONG: {
    code: 42203,
    message: 'Un campo es demasiado largo',
    httpStatus: 422,
    isOperational: true, // Error de validación esperado
  },
  FIELD_INVALID_FORMAT: {
    code: 42204,
    message: 'El formato del campo es incorrecto',
    httpStatus: 422,
    isOperational: true, // Error de validación común
  },
  UNSUPPORTED_FILE_TYPE: {
    code: 42205,
    message: 'Tipo de archivo no permitido',
    httpStatus: 422,
    isOperational: true, // Error de validación esperado
  },

  // 🧩 Errores de Dependencias y Relaciones
  DEPENDENCY_NOT_FOUND: {
    code: 40010,
    message: 'Recurso dependiente no encontrado',
    httpStatus: 400,
    isOperational: true, // Error de validación de relaciones
  },
  CANNOT_DELETE_IN_USE: {
    code: 40011,
    message: 'No se puede eliminar porque está en uso',
    httpStatus: 400,
    isOperational: true, // Error de regla de negocio esperado
  },
  RELATION_ALREADY_EXISTS: {
    code: 40012,
    message: 'La relación ya está registrada',
    httpStatus: 400,
    isOperational: true, // Error de validación de relaciones
  },

  // 🧠 Errores de Lógica de Negocio
  BUSINESS_RULE_VIOLATION: {
    code: 40910,
    message: 'La operación viola una regla de negocio',
    httpStatus: 409,
    isOperational: true, // Error de reglas de negocio esperado
  },
  INCONSISTENT_STATE: {
    code: 40020,
    message: 'El estado actual del recurso no permite esta operación',
    httpStatus: 400,
    isOperational: true, // Error de estado esperado
  },

  // 💥 Errores del Sistema
  INTERNAL_SERVER_ERROR: {
    code: 50001,
    message: 'Error no controlado del servidor',
    httpStatus: 500,
    isOperational: false, // Error técnico inesperado
  },
  DATABASE_ERROR: {
    code: 50002,
    message: 'Fallo al acceder a la base de datos',
    httpStatus: 500,
    isOperational: false, // Error técnico crítico
  },
  THIRD_PARTY_ERROR: {
    code: 50003,
    message: 'Fallo en un servicio externo (API, SMTP, etc.)',
    httpStatus: 500,
    isOperational: false, // Error de dependencia externa
  },
  TIMEOUT: {
    code: 50004,
    message: 'Tiempo de espera excedido',
    httpStatus: 504,
    isOperational: false, // Error técnico de timeout
  },

  // 📋 Errores de Configuración / Entorno
  MISSING_ENV_VARIABLE: {
    code: 50010,
    message: 'Falta una variable de entorno obligatoria',
    httpStatus: 500,
    isOperational: false, // Error de configuración crítico
  },
  INVALID_CONFIG: {
    code: 50011,
    message: 'Configuración inválida',
    httpStatus: 500,
    isOperational: false, // Error de configuración crítico
  },
};

export default errorsDictionary;
