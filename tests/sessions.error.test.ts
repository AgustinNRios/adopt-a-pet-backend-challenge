import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

// Para mantener la validación estricta de consultas
mongoose.set('strictQuery', true);

// URL de conexión a la base de datos de testing
const MONGO_URI = process.env.MONGO_DB_URL;

// Instancia de supertest apuntando a tu servidor
const request = supertest(app);

describe('Pruebas de casos de error en /api/sessions', function TestSessionsErrorCases() {
  // Aumenta el timeout por si la conexión es lenta
  this.timeout(10000);

  // Variables para usar entre tests
  before(async function before() {
    // Usamos la conexión existente en lugar de crear una nueva
    if (mongoose.connection.readyState !== 1) {
      // Solo conectamos si no hay una conexión activa
      await mongoose
        .connect(MONGO_URI || '')
        .then(() => {
          return console.log('Connected to MongoDB for testing sessions errors');
        })
        .catch(err => {
          console.error('Error connecting to MongoDB for testing sessions errors:', err);
        });
    }

    // Usuario de prueba que ya existe
    this.existingUser = {
      first_name: 'Usuario Existente',
      last_name: 'Apellido Existente',
      email: 'usuario.existente@test.com',
      password: '123456',
    };

    // Creamos el usuario existente para las pruebas
    try {
      // Primero eliminamos si ya existe
      await mongoose.connection.collection('users').deleteMany({
        email: this.existingUser.email,
      });

      // Luego lo creamos
      await request.post('/api/sessions/register').send(this.existingUser);
    } catch (error) {
      console.error('Error al crear usuario de prueba:', error);
    }
  });

  after(async function after() {
    // Limpia la colección de usuarios después de correr los tests
    await mongoose.connection.collection('users').deleteMany({
      email: this.existingUser.email,
    });

    // Cierra la conexión a MongoDB después de correr todos los tests
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada después de pruebas de errores de sesiones');
    }
  });

  // Test para registro con datos incompletos
  it('Registro: Debe manejar correctamente el caso de datos incompletos', async function testIncompleteRegistration() {
    const incompleteUser = {
      first_name: 'Usuario Incompleto',
      // Faltan campos obligatorios
    };

    const response = await request.post('/api/sessions/register').send(incompleteUser);

    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'Incomplete values');
  });

  // Test para registro con usuario ya existente
  it('Registro: Debe manejar correctamente el caso de usuario ya existente', async function testExistingUserRegistration() {
    // Intentamos registrar el mismo usuario que ya existe
    const response = await request.post('/api/sessions/register').send(this.existingUser);

    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'User already exists');
  });

  // Test para login con datos incompletos
  it('Login: Debe manejar correctamente el caso de datos incompletos', async function testIncompleteLogin() {
    const incompleteLogin = {
      email: 'usuario@test.com',
      // Falta password
    };

    const response = await request.post('/api/sessions/login').send(incompleteLogin);

    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'Incomplete values');
  });

  // Test para login con usuario que no existe
  it('Login: Debe manejar correctamente el caso de usuario que no existe', async function testNonExistentUserLogin() {
    const nonExistentUser = {
      email: 'usuario.noexiste@test.com',
      password: '123456',
    };

    const response = await request.post('/api/sessions/login').send(nonExistentUser);

    expect(response.statusCode).to.equal(404);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', "User doesn't exist");
  });

  // Test para login con contraseña incorrecta
  it('Login: Debe manejar correctamente el caso de contraseña incorrecta', async function testWrongPasswordLogin() {
    const wrongPasswordLogin = {
      email: this.existingUser.email,
      password: 'contraseña_incorrecta',
    };

    const response = await request.post('/api/sessions/login').send(wrongPasswordLogin);

    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'Incorrect password');
  });

  // Test para current sin cookie
  it('Current: Debe manejar correctamente el caso de no tener cookie', async function testNoCookieCurrent() {
    const response = await request.get('/api/sessions/current');

    expect(response.statusCode).to.equal(401);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'No autenticado');
  });

  // Test para current con cookie inválida
  it('Current: Debe manejar correctamente el caso de cookie inválida', async function testInvalidCookieCurrent() {
    const response = await request
      .get('/api/sessions/current')
      .set('Cookie', ['coderCookie=token_invalido']);

    expect(response.statusCode).to.equal(401);
    expect(response.body).to.have.property('status', 'error');
  });

  // Test para logout sin cookie
  it('Logout: Debe manejar correctamente el caso de no tener cookie', async function testNoCookieLogout() {
    const response = await request.post('/api/sessions/logout');

    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'No session');
  });

  // Test para unprotectedLogin con datos incompletos
  it('UnprotectedLogin: Debe manejar correctamente el caso de datos incompletos', async function testIncompleteUnprotectedLogin() {
    const incompleteLogin = {
      email: 'usuario@test.com',
      // Falta password
    };

    const response = await request.post('/api/sessions/unprotectedLogin').send(incompleteLogin);

    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'Incomplete values');
  });

  // Test para unprotectedCurrent sin cookie
  it('UnprotectedCurrent: Debe manejar correctamente el caso de no tener cookie', async function testNoCookieUnprotectedCurrent() {
    const response = await request.get('/api/sessions/unprotectedCurrent');

    expect(response.statusCode).to.equal(401);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('error', 'No autenticado');
  });

  // Test para unprotectedCurrent con cookie inválida
  it('UnprotectedCurrent: Debe manejar correctamente el caso de cookie inválida', async function testInvalidCookieUnprotectedCurrent() {
    const response = await request
      .get('/api/sessions/unprotectedCurrent')
      .set('Cookie', ['unprotectedCookie=token_invalido']);

    expect(response.statusCode).to.equal(401);
    expect(response.body).to.have.property('status', 'error');
  });
});
