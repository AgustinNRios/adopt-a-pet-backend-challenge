import fs from 'fs';
import path from 'path';

import { expect } from 'chai';
import { describe, it } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

const MONGO_URI = process.env.MONGO_DB_URL;

await mongoose
  .connect(MONGO_URI || '')
  .then(() => {
    return console.log('Connected to MongoDB for testing utils');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB for testing:', err);
  });

const request = supertest(app);

describe('Pruebas de utilidades y servicios', () => {
  describe('Pruebas del endpoint loggerTest', () => {
    const logFilePath = path.join(process.cwd(), 'src', 'logs', 'errors.log');

    // Función para leer las últimas líneas del archivo de logs
    const readLastLogLines = (numLines = 5) => {
      try {
        const content = fs.readFileSync(logFilePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        return lines.slice(-numLines);
      } catch (error) {
        console.error('Error al leer archivo de logs:', error);
        return [];
      }
    };

    it('El endpoint /loggerTest responde con status 200', async () => {
      const response = await request.get('/loggerTest');
      expect(response.status).to.equal(200);
      expect(response.text).to.equal(
        'Logger test completed. Check your console and errors.log file.',
      );
    });

    it('Los mensajes de error y fatal se escriben en el archivo errors.log', async () => {
      // Llamamos al endpoint para asegurarnos de generar logs frescos
      await request.get('/loggerTest');

      // Esperamos un momento para que el sistema tenga tiempo de escribir en el archivo
      await new Promise(resolve => {
        setTimeout(resolve, 500);
      });

      // Leemos las últimas líneas del archivo de logs
      const lastLogLines = readLastLogLines();

      // Verificamos que haya al menos una línea con level error y otra con level fatal
      const errorLog = lastLogLines.find(line => {
        try {
          const parsed = JSON.parse(line);
          return parsed.level === 'error' && parsed.message === 'Error log test';
        } catch {
          return false;
        }
      });

      const fatalLog = lastLogLines.find(line => {
        try {
          const parsed = JSON.parse(line);
          return parsed.level === 'fatal' && parsed.message === 'Fatal log test';
        } catch {
          return false;
        }
      });

      if (!errorLog) throw new Error('No se encontró el log de error');
      if (!fatalLog) throw new Error('No se encontró el log fatal');

      // Las pruebas pasan si llegamos hasta aquí sin errores
    });
  });
});
