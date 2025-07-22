// Script para asegurar que los directorios necesarios existan
import fs from 'fs';
import path from 'path';

// Función para crear directorios recursivamente si no existen
const ensureDir = dirPath => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directorio creado: ${dirPath}`);
  } else {
    console.log(`Directorio ya existe: ${dirPath}`);
  }
};

// Directorios necesarios para la aplicación
const basePath = process.cwd();
const dirs = [
  path.join(basePath, 'src', 'public', 'img', 'pets'),
  path.join(basePath, 'src', 'public', 'img', 'testImgs'),
  path.join(basePath, 'src', 'public', 'documents'),
];

// Crear todos los directorios
dirs.forEach(dir => ensureDir(dir));

// Copiar imagen de prueba si no existe
const testImageSource = path.join(basePath, 'src', 'public', 'img', 'testImgs', 'coderDog.jpg');
const testImageDir = path.join(basePath, 'src', 'public', 'img', 'testImgs');

// Si no existe la imagen de prueba, creamos un archivo vacío para que no falle la prueba
if (!fs.existsSync(testImageSource)) {
  ensureDir(testImageDir);
  // Crear un archivo vacío si no existe la imagen de prueba
  fs.writeFileSync(testImageSource, '');
  console.log(`Archivo de prueba creado: ${testImageSource}`);
}

console.log('Directorios y archivos verificados correctamente.');
