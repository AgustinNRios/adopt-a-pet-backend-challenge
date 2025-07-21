import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

//* Para mantener la validación estricta de consultas
mongoose.set('strictQuery', true);

// URL de conexión a la base de datos de testing
const MONGO_URI = process.env.MONGO_DB_URL;

// Instancia de supertest apuntando a tu servidor
// const request = supertest("http://localhost:8080");
const request = supertest(app);

describe('Pruebas de integración en /api/sessions', function TestUsersApi() {
  // Aumenta el timeout por si la conexión es lenta
  this.timeout(6000);

  // Variables para usar entre tests
  before(async function before() {
    // Usamos la conexión existente en lugar de crear una nueva
    // La aplicación ya debería estar conectada a MongoDB
    if (mongoose.connection.readyState !== 1) {
      // Solo conectamos si no hay una conexión activa
      await mongoose
        .connect(MONGO_URI || '')
        .then(() => {
          return console.log('Connected to MongoDB for testing');
        })
        .catch(err => {
          console.error('Error connecting to MongoDB for testing:', err);
        });
    }
    // Usuario de prueba
    this.mockUser = {
      first_name: 'Usuario de prueba 2',
      last_name: 'Apellido de prueba 2',
      email: 'correodeprueba2@gmail.com',
      password: '123456',
    };
    this.cookie = null;
  });

  after(async function after() {
    // Limpia la colección de usuarios después de correr los tests
    await mongoose.connection.collection('users').deleteMany({
      email: this.mockUser.email,
    });

    // Cierra la conexión a MongoDB después de correr todos los tests
    await mongoose.connection.close();
  });

  // Test 01 - Registro de un User
  it('Test Registro Usuario: Debe poder registrar correctamente un usuario', async function it() {
    const { statusCode } = await request.post('/api/sessions/register').send(this.mockUser);

    expect(statusCode).to.eql(200);
  });

  // Test 02 - Login de un User
  it('Test Login Usuario: Debe poder hacer login correctamente con el usuario registrado previamente y obtener la cookie', async function it() {
    const mockLogin = {
      email: this.mockUser.email,
      password: this.mockUser.password,
    };

    const result = await request.post('/api/sessions/login').send(mockLogin);

    // console.log("result: ", result.header);
    const cookieResult = result.header['set-cookie'][0];
    const cookieData = cookieResult.split('=');

    this.cookie = {
      name: cookieData[0], // -> 'coderCookie'
      value: cookieData[1].split(';')[0],
    };
    expect(this.cookie.name).to.eql('coderCookie');
    expect(!!this.cookie.value).to.equal(true);
  });

  it('Test Current: Debe poder obtener la información del usuario actual usando la cookie', async function it() {
    // En lugar de probar la ruta de mascotas con imagen, probamos la ruta current
    // que es más relevante para las sesiones
    const result = await request
      .get('/api/sessions/current')
      .set('Cookie', [`${this.cookie.name}=${this.cookie.value}`]);

    // Verificamos que la respuesta sea correcta
    expect(result.status).to.be.eql(200);
    expect(result.body.status).to.equal('success');
    // Verificamos que el email en la respuesta coincida con el del usuario de prueba
    expect(result.body.payload.email).to.equal(this.mockUser.email);
    // Verificamos que el payload tenga un name y role
    expect(result.body.payload).to.have.property('name');
    expect(result.body.payload).to.have.property('role');
  });

  it('Test Logout: Debe poder cerrar sesión correctamente', async function it() {
    const result = await request
      .post('/api/sessions/logout')
      .set('Cookie', [`${this.cookie.name}=${this.cookie.value}`]);

    expect(result.status).to.be.eql(200);
    expect(result.body.status).to.equal('success');
    expect(result.body.message).to.equal('Logged out');
  });
});
