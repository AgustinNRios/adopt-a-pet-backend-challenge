/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

// URL de conexión a la base de datos de testing
const MONGO_URI = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/adopt-a-pet-test';
let mongooseConnected = false;
let userId: string;
let petId: string;
let adoptionId: string;

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
      console.log('Connected to MongoDB for testing adoptions controller');
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

const request = supertest(app);

describe('Pruebas detalladas del controlador de adopciones', () => {
  // Preparamos los datos necesarios para las pruebas
  before(async function setupTestData() {
    this.timeout(15000);

    // Creamos un usuario para las pruebas
    const userData = {
      firstName: 'Usuario',
      lastName: 'Prueba',
      email: `usuario.prueba.${Date.now()}@test.com`,
      password: 'Password123!',
    };

    try {
      const userResponse = await request.post('/api/users').send(userData);
      expect(userResponse.statusCode).to.equal(200);
      userId = userResponse.body.payload._id;
      console.log('Usuario creado para pruebas:', userId);

      // Creamos una mascota para las pruebas
      const petData = {
        name: `Mascota Prueba ${Date.now()}`,
        specie: 'Perro',
        birthDate: '2020-01-01',
        adopted: false,
      };

      const petResponse = await request.post('/api/pets').send(petData);
      expect(petResponse.statusCode).to.equal(200);
      petId = petResponse.body.payload._id;
      console.log('Mascota creada para pruebas:', petId);
    } catch (error) {
      console.error('Error al preparar datos para pruebas:', error);
      throw error;
    }
  });

  // Pruebas para aumentar la cobertura de ramas

  // Prueba para getAllAdoptions
  it('Debería obtener todas las adopciones correctamente', async () => {
    const response = await request.get('/api/adoptions');
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('status', 'success');
    expect(response.body).to.have.property('payload');
    expect(Array.isArray(response.body.payload)).to.be.true;
  });

  // Prueba para getAdoption - caso de éxito
  it('Debería obtener una adopción específica correctamente después de crearla', async () => {
    // Primero creamos una adopción
    const adoptionResponse = await request.post(`/api/adoptions/${userId}/${petId}`);
    expect(adoptionResponse.statusCode).to.equal(200);

    // Obtenemos el ID de la adopción creada (asumiendo que está en la respuesta o podemos obtenerla de getAllAdoptions)
    const allAdoptionsResponse = await request.get('/api/adoptions');
    const adoptions = allAdoptionsResponse.body.payload;
    const newAdoption = adoptions.find(
      (adoption: { owner: string; pet: string }) =>
        adoption.owner === userId && adoption.pet === petId,
    );

    expect(newAdoption).to.not.be.undefined;
    adoptionId = newAdoption._id;

    // Ahora probamos getAdoption
    const getResponse = await request.get(`/api/adoptions/${adoptionId}`);
    expect(getResponse.statusCode).to.equal(200);
    expect(getResponse.body).to.have.property('status', 'success');
    expect(getResponse.body).to.have.property('payload');
    expect(getResponse.body.payload).to.have.property('_id', adoptionId);
  });

  // Prueba para getAdoption - caso de error (adopción no encontrada)
  it('Debería manejar correctamente el caso de adopción no encontrada', async () => {
    const nonExistentId = '60d5ec9af682fbd12a0f9999'; // ID que no existe

    const response = await request.get(`/api/adoptions/${nonExistentId}`);
    expect(response.statusCode).to.equal(404);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'Adoption not found');
  });

  // Prueba para createAdoption - caso de error (usuario no encontrado)
  it('Debería manejar correctamente el caso de usuario no encontrado al crear adopción', async () => {
    const nonExistentUserId = '60d5ec9af682fbd12a0f9999'; // ID que no existe

    const response = await request.post(`/api/adoptions/${nonExistentUserId}/${petId}`);
    expect(response.statusCode).to.equal(404);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'User not found or invalid');
  });

  // Prueba para createAdoption - caso de error (mascota no encontrada)
  it('Debería manejar correctamente el caso de mascota no encontrada al crear adopción', async () => {
    const nonExistentPetId = '60d5ec9af682fbd12a0f9999'; // ID que no existe

    const response = await request.post(`/api/adoptions/${userId}/${nonExistentPetId}`);
    expect(response.statusCode).to.equal(404);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'Pet not found or invalid');
  });

  // Prueba para createAdoption - caso de error (mascota ya adoptada)
  it('Debería manejar correctamente el caso de mascota ya adoptada', async () => {
    // La mascota ya fue adoptada en una prueba anterior
    expect(petId).to.not.be.undefined;

    // Intentamos adoptar la mascota nuevamente
    const response = await request.post(`/api/adoptions/${userId}/${petId}`);
    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'Pet is already adopted');
  });
});
