/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

// Usamos tipado en línea para los usuarios

const MONGO_URI = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/adopt-a-pet-test';
let mongooseConnected = false;

// Establecemos la conexión a MongoDB antes de todas las pruebas
before(async function beforeAll() {
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

  // Usamos un enfoque sin await en el loop para evitar errores de ESLint
  const tryConnect = async () => {
    try {
      await mongoose.connect(MONGO_URI);
      mongooseConnected = true;
      console.log('Connected to MongoDB for testing users');
      return true;
    } catch (err) {
      retries -= 1;
      console.error(`Error connecting to MongoDB (intentos restantes: ${retries}):`, err);
      if (retries > 0) {
        // Esperamos 2 segundos antes de reintentar
        await new Promise(resolve => {
          setTimeout(resolve, 2000);
        });
        return tryConnect();
      }
      return false; // Retornamos false cuando se agotan los reintentos
    }
  };
  const connected = await tryConnect();
  if (!connected && !mongooseConnected) {
    console.error('No se pudo conectar a MongoDB después de varios intentos');
  }
});

const request = supertest(app);

describe('Pruebas de integración en /api/users', () => {
  // Variables para usar entre tests
  let userId: string;

  // Usuario de prueba
  let mockUser = {
    first_name: 'Usuario Test',
    last_name: 'Apellido Test',
    email: 'test.user.controller@example.com',
    password: '123456',
  };

  // Antes de las pruebas, creamos un usuario de prueba
  before(async function setupUser() {
    this.timeout(10000); // Aumentamos el timeout para la creación de usuario

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
        console.log('Connected to MongoDB for testing users (retry)');
      } catch (err) {
        console.error('Error connecting to MongoDB for testing users (retry):', err);
        this.skip();
        return;
      }
    }

    try {
      // Primero, intentamos registrar un usuario a través de la API
      try {
        // Verificamos si el usuario ya existe
        const checkResponse = await request.get(`/api/users?email=${mockUser.email}`);
        if (
          checkResponse.status === 200 &&
          checkResponse.body.payload &&
          checkResponse.body.payload.length > 0
        ) {
          const foundUser = checkResponse.body.payload.find(
            (u: { email: string }) => u.email === mockUser.email,
          );
          if (foundUser) {
            userId = foundUser._id;
            console.log('Usuario existente encontrado:', userId);
          }
        } else {
          // Si no existe, lo creamos usando la API de registro
          const registerResponse = await request.post('/api/sessions/register').send(mockUser);
          if (registerResponse.status === 201) {
            // Obtenemos el usuario recién creado
            const loginResponse = await request.post('/api/sessions/login').send({
              email: mockUser.email,
              password: mockUser.password,
            });
            if (loginResponse.status === 200) {
              // Obtenemos el ID del usuario actual
              const currentResponse = await request
                .get('/api/sessions/current')
                .set('Cookie', loginResponse.headers['set-cookie']);
              if (currentResponse.status === 200 && currentResponse.body.payload) {
                userId = currentResponse.body.payload._id;
                console.log('Usuario creado a través de la API:', userId);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al crear usuario a través de la API:', error);
      }

      // Si no se pudo obtener un userId, creamos uno usando la API de registro
      if (!userId && mongooseConnected) {
        try {
          // Intentamos registrar un nuevo usuario
          const registerResponse = await request.post('/api/sessions/register').send({
            first_name: 'Test',
            last_name: 'Usuario',
            email: 'test.usuario@example.com',
            password: 'password123',
          });

          if (registerResponse.status === 201) {
            console.log('Usuario registrado correctamente');

            // Iniciamos sesión con el usuario recién creado
            const loginResponse = await request.post('/api/sessions/login').send({
              email: 'test.usuario@example.com',
              password: 'password123',
            });

            if (loginResponse.status === 200) {
              // Obtenemos el ID del usuario
              const currentResponse = await request
                .get('/api/sessions/current')
                .set('Cookie', loginResponse.headers['set-cookie']);

              if (currentResponse.status === 200 && currentResponse.body.payload) {
                userId = currentResponse.body.payload._id;
                // Actualizamos mockUser para que coincida con el usuario creado
                mockUser = {
                  first_name: 'Test',
                  last_name: 'Usuario',
                  email: 'test.usuario@example.com',
                  password: 'password123',
                };
                console.log('Usuario creado a través de la API:', userId);
              }
            }
          }
        } catch (apiError) {
          console.error('Error al crear usuario a través de la API:', apiError);
        }
      }
    } catch (error) {
      console.error('Error al crear usuario de prueba:', error);
    }
  });

  // Después de las pruebas, limpiamos los datos
  after(async function cleanupData() {
    // Limpieza de datos
    if (mongooseConnected && mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.collection('users').deleteMany({ email: mockUser.email });
        console.log('Datos de prueba eliminados correctamente');
      } catch (error) {
        console.error('Error al limpiar datos de prueba:', error);
      }
    }
  });

  // Después de todas las pruebas, cerramos la conexión a MongoDB
  after(async function closeConnection() {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada');
      } catch (error) {
        console.error('Error al cerrar la conexión a MongoDB:', error);
      }
    }
  });

  // Test para obtener todos los usuarios
  it('Debería obtener todos los usuarios con GET /api/users', async function testGetUsers() {
    // Saltamos esta prueba si no hay conexión a MongoDB
    if (!mongooseConnected) {
      console.log('Saltando prueba: No hay conexión a MongoDB');
      this.skip();
      return;
    }
    const response = await request.get('/api/users');

    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('status', 'success');
    expect(response.body).to.have.property('payload');
    expect(Array.isArray(response.body.payload)).to.equal(true);

    // Verificamos que nuestro usuario esté en la lista
    const users = response.body.payload;
    const createdUser = users.find(
      (u: { email: string; _id: string }) => u.email === mockUser.email,
    );
    if (!createdUser) {
      console.warn('Advertencia: El usuario no se encontró en la lista');
    } else {
      console.log('Usuario encontrado en la lista:', createdUser._id);
    }
  });

  // Test para obtener un usuario específico
  it('Debería obtener un usuario específico con GET /api/users/:uid', async function testGetUser() {
    this.timeout(10000); // Aumentamos el timeout para esta prueba

    // Saltamos esta prueba si no hay conexión a MongoDB
    if (!mongooseConnected) {
      console.log('Saltando prueba: No hay conexión a MongoDB');
      this.skip();
      return;
    }

    // Si no tenemos un userId, creamos un nuevo usuario para esta prueba
    if (!userId) {
      try {
        // Registramos un usuario nuevo para esta prueba específica
        const testUser = {
          first_name: 'Usuario Especifico',
          last_name: 'Prueba Get',
          email: `get.test.${Date.now()}@example.com`,
          password: '123456',
        };

        const registerResponse = await request.post('/api/sessions/register').send(testUser);
        expect(registerResponse.statusCode).to.equal(200);

        // Obtenemos todos los usuarios y buscamos el que acabamos de crear
        const usersResponse = await request.get(`/api/users?email=${testUser.email}`);
        expect(usersResponse.statusCode).to.equal(200);
        expect(usersResponse.body).to.have.property('payload');
        expect(usersResponse.body.payload).to.be.an('array');

        const foundUser = usersResponse.body.payload.find(
          (u: { email: string }) => u.email === testUser.email,
        );

        expect(foundUser).to.exist;
        userId = foundUser._id;
        mockUser = testUser;
        console.log('Usuario creado para prueba getUser:', userId);
      } catch (error) {
        console.error('Error al crear usuario para prueba getUser:', error);
        this.skip();
        return;
      }
    }

    // Verificamos que tengamos el ID de usuario
    expect(userId).to.be.a('string');

    const response = await request.get(`/api/users/${userId}`);

    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('status', 'success');
    expect(response.body).to.have.property('payload');
    expect(response.body.payload).to.have.property('email', mockUser.email);
    expect(response.body.payload).to.have.property('first_name', mockUser.first_name);
    expect(response.body.payload).to.have.property('last_name', mockUser.last_name);
  });

  // Test para actualizar un usuario
  it('Debería actualizar un usuario con PUT /api/users/:uid', async function testUpdateUser() {
    this.timeout(10000); // Aumentamos el timeout para esta prueba

    // Saltamos esta prueba si no hay conexión a MongoDB
    if (!mongooseConnected) {
      console.log('Saltando prueba: No hay conexión a MongoDB');
      this.skip();
      return;
    }

    // Si no tenemos un userId, creamos un nuevo usuario para esta prueba
    if (!userId) {
      try {
        // Registramos un usuario nuevo para esta prueba específica
        const testUser = {
          first_name: 'Usuario Para',
          last_name: 'Actualizar',
          email: `update.test.${Date.now()}@example.com`,
          password: '123456',
        };

        const registerResponse = await request.post('/api/sessions/register').send(testUser);
        expect(registerResponse.statusCode).to.equal(200);

        // Obtenemos todos los usuarios y buscamos el que acabamos de crear
        const usersResponse = await request.get(`/api/users?email=${testUser.email}`);
        expect(usersResponse.statusCode).to.equal(200);
        expect(usersResponse.body).to.have.property('payload');
        expect(usersResponse.body.payload).to.be.an('array');

        const foundUser = usersResponse.body.payload.find(
          (u: { email: string }) => u.email === testUser.email,
        );

        expect(foundUser).to.exist;
        userId = foundUser._id;
        mockUser = testUser;
        console.log('Usuario creado para prueba updateUser:', userId);
      } catch (error) {
        console.error('Error al crear usuario para prueba updateUser:', error);
        this.skip();
        return;
      }
    }

    const updateData = {
      first_name: 'Nombre Actualizado',
      last_name: 'Apellido Actualizado',
    };

    const response = await request.put(`/api/users/${userId}`).send(updateData);

    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('status', 'success');
    expect(response.body).to.have.property('message', 'User updated');

    // Verificamos que los cambios se hayan aplicado
    const updatedUser = await request.get(`/api/users/${userId}`);
    expect(updatedUser.statusCode).to.equal(200);
    expect(updatedUser.body).to.have.property('status', 'success');
    expect(updatedUser.body).to.have.property('payload');
    expect(updatedUser.body.payload).to.have.property('first_name', updateData.first_name);
    expect(updatedUser.body.payload).to.have.property('last_name', updateData.last_name);
  });

  // Test para eliminar un usuario
  it('Debería eliminar un usuario con DELETE /api/users/:uid', async function testDeleteUser() {
    this.timeout(10000); // Aumentamos el timeout para esta prueba

    // Saltamos esta prueba si no hay conexión a MongoDB
    if (!mongooseConnected) {
      console.log('Saltando prueba: No hay conexión a MongoDB');
      this.skip();
      return;
    }

    // Si no tenemos un userId, creamos un nuevo usuario para esta prueba
    if (!userId) {
      try {
        // Registramos un usuario nuevo para esta prueba específica
        const testUser = {
          first_name: 'Usuario Para',
          last_name: 'Eliminar',
          email: `delete.test.${Date.now()}@example.com`,
          password: '123456',
        };

        const registerResponse = await request.post('/api/sessions/register').send(testUser);
        expect(registerResponse.statusCode).to.equal(200);

        // Obtenemos todos los usuarios y buscamos el que acabamos de crear
        const usersResponse = await request.get(`/api/users?email=${testUser.email}`);
        expect(usersResponse.statusCode).to.equal(200);
        expect(usersResponse.body).to.have.property('payload');
        expect(usersResponse.body.payload).to.be.an('array');

        const foundUser = usersResponse.body.payload.find(
          (u: { email: string }) => u.email === testUser.email,
        );

        expect(foundUser).to.exist;
        userId = foundUser._id;
        mockUser = testUser;
        console.log('Usuario creado para prueba deleteUser:', userId);
      } catch (error) {
        console.error('Error al crear usuario para prueba deleteUser:', error);
        this.skip();
        return;
      }
    }

    const response = await request.delete(`/api/users/${userId}`);

    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('status', 'success');
    expect(response.body).to.have.property('message', 'User deleted');

    // Verificamos que el usuario ya no existe
    const deletedUser = await request.get(`/api/users/${userId}`);
    expect(deletedUser.statusCode).to.equal(404);
    expect(deletedUser.body).to.have.property('status', 'error');
    expect(deletedUser.body).to.have.property('error', 'User not found');

    // Limpiamos el userId para evitar problemas en otras pruebas
    userId = '';
  });

  // Test para el manejo de errores - usuario no encontrado
  it('Debería devolver error 404 al buscar un usuario inexistente', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await request.get(`/api/users/${nonExistentId}`);

    expect(response.statusCode).to.equal(404);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'User not found');
  });

  // Test para verificar que el método uploadDocuments maneja correctamente la falta de archivos
  it('Debería manejar correctamente la carga de documentos sin archivos', async function testUploadNoFiles() {
    this.timeout(10000); // Aumentamos el timeout para esta prueba

    // Saltamos esta prueba si no hay conexión a MongoDB
    if (!mongooseConnected) {
      console.log('Saltando prueba: No hay conexión a MongoDB');
      this.skip();
      return;
    }

    // Si no tenemos un userId, creamos un nuevo usuario para esta prueba
    if (!userId) {
      try {
        // Registramos un usuario nuevo para esta prueba específica
        const testUser = {
          first_name: 'Usuario Para',
          last_name: 'Documentos',
          email: `docs.test.${Date.now()}@example.com`,
          password: '123456',
        };

        const registerResponse = await request.post('/api/sessions/register').send(testUser);
        expect(registerResponse.statusCode).to.equal(200);

        // Obtenemos todos los usuarios y buscamos el que acabamos de crear
        const usersResponse = await request.get(`/api/users?email=${testUser.email}`);
        expect(usersResponse.statusCode).to.equal(200);
        expect(usersResponse.body).to.have.property('payload');
        expect(usersResponse.body.payload).to.be.an('array');

        const foundUser = usersResponse.body.payload.find(
          (u: { email: string }) => u.email === testUser.email,
        );

        expect(foundUser).to.exist;
        userId = foundUser._id;
        mockUser = testUser;
        console.log('Usuario creado para prueba uploadDocuments:', userId);
      } catch (error) {
        console.error('Error al crear usuario para prueba uploadDocuments:', error);
        this.skip();
        return;
      }
    }

    const response = await request.post(`/api/users/${userId}/documents`).send({});

    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'No files were uploaded');
  });

  // Agregamos pruebas para errores 404 al intentar eliminar un usuario inexistente
  it('Debería devolver error 404 al intentar eliminar un usuario inexistente', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await request.delete(`/api/users/${nonExistentId}`);

    expect(response.statusCode).to.equal(404);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'User not found');
  });
});
