import { expect } from 'chai';
import { describe, it } from 'mocha';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app';

//* Para mantener la validación estricta de consultas
mongoose.set('strictQuery', true);

// URL de conexión a la base de datos de testing
// const MONGO_URI = process.env.MONGO_DB_URL;

// Instancia de supertest apuntando a tu servidor
// const requester = supertest("http://localhost:8080");
const requester = supertest(app);

describe('Pruebas de integración en /api/pets/withimage', () => {
  it('Debe poder crearse una mascota con la ruta de la imagen', async () => {
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
    expect({}).to.have.property('_id');
    // expect(result.body.payload).to.have.property('_id');
  });
});
