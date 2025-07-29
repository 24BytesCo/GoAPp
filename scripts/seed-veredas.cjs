// scripts/seed-veredas.cjs
const admin = require('firebase-admin');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// 1) Carga tu serviceAccountKey.json como objeto
const serviceAccount = require(resolve(__dirname, '../serviceAccountKey.json'));

// 2) Inicializa Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// 3) Lee el JSON de veredas
const veredas = require(resolve(__dirname, './set-data-veredas.json'));

// 4) Sembrado masivo con batch
async function seed() {
  const batch = db.batch();
  veredas.forEach(v => {
    const ref = db.collection('veredas').doc(v.id);
    batch.set(ref, { name: v.name });
  });
  await batch.commit();
  console.log(`✅ Sembradas ${veredas.length} veredas.`);
}

seed().catch(err => {
  console.error('Error al sembrar veredas:', err);
  process.exit(1);
});
