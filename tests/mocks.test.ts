import { expect } from 'chai';
import { describe, it } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

const MONGO_URI = process.env.MONGO_DB_URL;

// Conectamos a MongoDB para los tests
await mongoose
  .connect(MONGO_URI || '')
  .then(() => {
    return console.log('Connected to MongoDB for testing mocks');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB for testing mocks:', err);
  });

const request = supertest(app);

describe('Pruebas de integración en /api/mocks', () => {
  describe('Pruebas del endpoint mockingpets', () => {
    it('El endpoint GET /api/mocks/mockingpets responde con status 200 y genera mascotas correctamente', async () => {
      const { status, body } = await request.get('/api/mocks/mockingpets');

      expect(status).to.equal(200);
      expect(body).to.have.property('status', 'success');
      expect(body).to.have.property('payload');
      expect(body.payload).to.be.an('array');
      expect(body.payload).to.have.lengthOf(100); // Verifica que se crearon 100 mascotas

      // Verificar estructura de una mascota
      const pet = body.payload[0];
      expect(pet).to.have.property('name');
      expect(pet).to.have.property('specie');
      expect(pet).to.have.property('birthDate');
    });
  });

  describe('Pruebas del endpoint mockingusers', () => {
    it('El endpoint GET /api/mocks/mockingusers responde con status 200 y genera usuarios correctamente', async () => {
      const { status, body } = await request.get('/api/mocks/mockingusers');

      expect(status).to.equal(200);
      expect(body).to.have.property('status', 'success');
      expect(body).to.have.property('message', 'Versión actualizada');
      expect(body).to.have.property('payload');
      expect(body.payload).to.be.an('array');
      expect(body.payload).to.have.lengthOf(50); // Verifica que se crearon 50 usuarios

      // Verificar estructura de un usuario
      const user = body.payload[0];
      expect(user).to.have.property('_id');
      expect(user).to.have.property('first_name');
      expect(user).to.have.property('last_name');
      expect(user).to.have.property('email');
      expect(user).to.have.property('password');
      expect(user).to.have.property('role');
      expect(user.role).to.be.oneOf(['user', 'admin']);
    });
  });

  describe('Pruebas del endpoint generateData', () => {
    it('El endpoint POST /api/mocks/generateData responde con status 200 y genera datos según lo solicitado', async () => {
      const testData = {
        users: 5,
        pets: 10,
      };

      const { status, body } = await request.post('/api/mocks/generateData').send(testData);

      expect(status).to.equal(200);
      expect(body).to.have.property('status', 'success');
      expect(body).to.have.property('payload');
      expect(body.payload).to.have.property('users').to.be.an('array');
      expect(body.payload).to.have.property('pets').to.be.an('array');
      expect(body.payload.users).to.have.lengthOf(5); // Verifica que se crearon 5 usuarios
      expect(body.payload.pets).to.have.lengthOf(10); // Verifica que se crearon 10 mascotas

      // Verificar estructura de un usuario generado
      const user = body.payload.users[0];
      expect(user).to.have.property('_id');
      expect(user).to.have.property('first_name');
      expect(user).to.have.property('last_name');
      expect(user).to.have.property('email');
      expect(user).to.have.property('password');
      expect(user).to.have.property('role');

      // Verificar estructura de una mascota generada
      const pet = body.payload.pets[0];
      expect(pet).to.have.property('name');
      expect(pet).to.have.property('specie');
      expect(pet).to.have.property('birthDate');
    });

    it('El endpoint POST /api/mocks/generateData funciona correctamente con valores por defecto', async () => {
      // Enviar un objeto vacío, debería usar los valores por defecto
      const { status, body } = await request.post('/api/mocks/generateData').send({});

      expect(status).to.equal(200);
      expect(body).to.have.property('status', 'success');
      expect(body).to.have.property('payload');
      expect(body.payload).to.have.property('users').to.be.an('array');
      expect(body.payload).to.have.property('pets').to.be.an('array');
      expect(body.payload.users).to.have.lengthOf(0); // Valor por defecto es 0
      expect(body.payload.pets).to.have.lengthOf(0); // Valor por defecto es 0
    });
  });
});
