import cluster from 'cluster';

import app from './app';
import config from './config/config';
import { logger } from './config/logger';

// Definimos el puerto que va a usar el servidor
const PORT = config.PORT || 3000;

// Usamos la configuración simplificada de clusterización
const clusterEnabled = config.CLUSTER.ENABLED;
const numWorkers = config.CLUSTER.NUM_WORKERS;

// Función para iniciar el servidor Express
const startServer = () => {
  const server = app.listen(PORT, () => {
    const message = `Servidor escuchando en puerto http://localhost:${PORT}`;
    logger.info(message);
  });

  return server;
};

// Implementación de clusterización
if (clusterEnabled && cluster.isPrimary) {
  logger.info(`Proceso primario PID ${process.pid} | Generando ${numWorkers} workers...`);

  // Crear workers según la configuración
  for (let i = 0; i < numWorkers; i += 1) {
    cluster.fork();
  }

  // Manejar mensajes de los workers
  cluster.on('message', (worker, message) => {
    logger.debug(`Mensaje del worker ${worker.id}: ${JSON.stringify(message)}`);
  });

  // Manejar desconexiones y crear nuevos workers si es necesario
  cluster.on('disconnect', worker => {
    const message = `Worker PID ${worker.process.pid} (ID: ${worker.id}) desconectado. Creando nuevo worker...`;
    logger.warning(message);
    cluster.fork();
  });

  // Manejar salidas de workers
  cluster.on('exit', (worker, code, signal) => {
    const message = `Worker PID ${worker.process.pid} (ID: ${worker.id}) terminado con código ${code} y señal ${signal}`;
    logger.warning(message);
  });
} else {
  // Proceso worker o modo sin cluster
  // puede guardarse como server en una constante
  startServer();

  if (clusterEnabled) {
    logger.info(`Worker (process) PID ${process.pid} (ID: ${cluster.worker?.id}) iniciado`);
  } else {
    logger.info(`Servidor en modo single-thread, PID ${process.pid}`);
  }
}
