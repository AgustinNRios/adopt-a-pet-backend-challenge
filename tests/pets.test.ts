import { expect } from 'chai';
import { describe, it } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

const MONGO_URI = process.env.MONGO_DB_URL;

await mongoose
  .connect(MONGO_URI || '')
  .then(() => {
    return console.log('Connected to MongoDB for testing');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB for testing:', err);
  });

const request = supertest(app);

describe('Pruebas de integración en /api/pets', () => {
  describe('Pruebas básicas (sin subir imágenes)', () => {
    before(async function before() {
      await mongoose.connection.collection('pets').deleteMany({ name: 'Richard' });
    });

    after(async function after() {
      await mongoose.connection.collection('pets').deleteMany({ name: 'Richard' });
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
