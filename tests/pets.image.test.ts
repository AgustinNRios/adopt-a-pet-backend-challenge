import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

//* Para mantener la validación estricta de consultas
mongoose.set('strictQuery', true);

// URL de conexión a la base de datos de testing
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
      console.log('Connected to MongoDB for testing pets with image');
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

// Cerramos la conexión después de todas las pruebas
after(async function closeMongo() {
  if (mongooseConnected && mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada');
    } catch (error) {
      console.error('Error al cerrar la conexión a MongoDB:', error);
    }
  }
});

// Instancia de supertest apuntando a tu servidor
const requester = supertest(app);

describe('Pruebas de integración en /api/pets/withimage', () => {
  it('Debe poder crearse una mascota con la ruta de la imagen', async function testCreatePetWithImage() {
    this.timeout(15000); // Aumentamos el timeout para esta prueba

    // Verificamos que la conexión a MongoDB esté establecida
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB no está conectado, intentando conectar...');
      try {
        await mongoose.connect(MONGO_URI);
        mongooseConnected = true;
        console.log('Conexión establecida para prueba de mascota con imagen');
      } catch (err) {
        console.error('No se pudo conectar a MongoDB:', err);
        this.skip();
        return;
      }
    }

    try {
      // Primero limpiamos cualquier mascota con el mismo nombre
      if (mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.collection('pets').deleteMany({ name: 'Nemo' });
        } catch (err) {
          console.error('Error al limpiar la colección de mascotas:', err);
        }
      }

      // Mock de mascota a crear
      const mockPet = {
        name: 'Nemo',
        specie: 'Pez',
        birthDate: '10-11-2022',
      };

      // router.post('/withimage',uploader.single('image'), petsController.createPetWithImage);
      const result = await requester
        .post('/api/pets/withimage')
        .field('name', mockPet.name)
        .field('specie', mockPet.specie)
        .field('birthDate', mockPet.birthDate)
        .attach('image', './tests/files/coderDog.jpg');

      expect(result.status).to.be.eql(200);
      expect(result.body.payload).to.have.property('_id');

      // Verificamos que la mascota se haya creado correctamente en la base de datos
      const petId = result.body.payload._id;
      const petResponse = await requester.get(`/api/pets/${petId}`);
      expect(petResponse.status).to.be.eql(200);
      expect(petResponse.body.payload.name).to.be.eql(mockPet.name);
    } catch (error) {
      console.error('Error en la prueba de creación de mascota con imagen:', error);
      throw error;
    }
  });
});
