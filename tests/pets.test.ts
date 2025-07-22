import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

const MONGO_URI = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/adopt-a-pet-test';
let mongooseConnected = false;

// Establecemos la conexión a MongoDB antes de todas las pruebas
before(async function setupMongo() {
  this.timeout(30000); // Aumentamos significativamente el timeout para la conexión

  // Aseguramos que cualquier conexión previa esté cerrada
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Conexión previa cerrada');
    }
  } catch (err) {
    console.error('Error al cerrar conexión previa:', err);
  }

  // Intentamos conectar con reintentos
  let retries = 3;

  // Función para intentar conectar
  const tryConnect = async () => {
    try {
      await mongoose.connect(MONGO_URI);
      mongooseConnected = true;
      console.log('Connected to MongoDB for testing pets');
      return true;
    } catch (err) {
      retries -= 1;
      console.error(`Error connecting to MongoDB (intentos restantes: ${retries}):`, err);
      if (retries > 0) {
        // Esperamos 2 segundos antes de reintentar
        await new Promise<void>(resolve => {
          setTimeout(resolve, 2000);
        });
        return tryConnect();
      }
      return false;
    }
  };

  await tryConnect();
});

const request = supertest(app);

describe('Pruebas de integración en /api/pets', () => {
  describe('Pruebas básicas (sin subir imágenes)', () => {
    before(async function setupTestData() {
      this.timeout(10000);

      // Verificamos que la conexión a MongoDB esté establecida
      if (!mongooseConnected || mongoose.connection.readyState !== 1) {
        console.warn('MongoDB no está conectado, intentando conectar nuevamente...');
        try {
          // Cerramos cualquier conexión existente primero
          if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
          }
          await mongoose.connect(MONGO_URI);
          mongooseConnected = true;
          console.log('Connected to MongoDB for testing pets (retry)');
        } catch (err) {
          console.error('Error connecting to MongoDB for testing pets (retry):', err);
          this.skip();
          return;
        }
      }

      try {
        await mongoose.connection.collection('pets').deleteMany({ name: 'Richard' });
      } catch (err) {
        console.error('Error al limpiar la colección de mascotas:', err);
      }
    });

    after(async function cleanupTestData() {
      this.timeout(10000);

      if (mongooseConnected && mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.collection('pets').deleteMany({ name: 'Richard' });
        } catch (err) {
          console.error('Error al limpiar la colección de mascotas:', err);
        }
      }
    });

    it('Debería manejar correctamente las altas de mascotas según los datos enviados', async () => {
      const validPet = {
        name: 'Richard',
        specie: 'Lorito',
        birthDate: new Date('1998-03-10'),
      };

      // const inValidPet = {
      //   specie: 'Lorito',
      //   birthDate: new Date('1998-03-10'),
      // };
      // SubTest 01 - Status 200 al enviar datos correctos
      try {
        const { statusCode } = await request.post('/api/pets').send(validPet);
        expect(statusCode).to.equal(200);
      } catch {
        throw new Error('Falló el subtest: status 200 con datos correctos');
      }
      // SubTest 02 - Verificar que se da de alta correctamente en la DB
      try {
        const { body } = await request.post('/api/pets').send(validPet);
        expect(body).to.have.property('status', 'success');
        expect(body).to.have.property('payload');
        expect(body.payload).to.have.property('name', validPet.name);
      } catch {
        throw new Error('Falló el subtest: creación exitosa con respuesta correcta');
      }
    });

    it('El método get /api/pets, retorna status 200', async () => {
      const { statusCode } = await request.get('/api/pets');
      expect(statusCode).to.equal(200);
    });

    it('El método put /api/pets/:pid, retorna status 200', async () => {});

    it('El método delete /api/pets/:pid, retorna status 200', async () => {});
  });
});
