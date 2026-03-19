#!/usr/bin/env node
/**
 * gdrive.mjs — Google Drive reader para MaiA
 * Uso: node gdrive.mjs <comando> [args]
 *
 * Comandos:
 *   list [folderId]           — listar archivos (Drive raíz o carpeta)
 *   read <fileId>             — leer contenido de un Google Doc como texto
 *   search <query>            — buscar archivos en Drive
 *   export <fileId> [format]  — exportar archivo (txt, md, pdf)
 *   info <fileId>             — metadatos de un archivo
 *   setup                     — verificar credenciales
 */

import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Cargar googleapis desde el directorio de instalación
let google;
try {
  const { google: g } = await import(join(__dirname, 'node_modules/googleapis/build/src/index.js'));
  google = g;
} catch (e) {
  try {
    const mod = require(join(__dirname, 'node_modules/googleapis'));
    google = mod.google;
  } catch (e2) {
    console.error('ERROR: googleapis no instalado. Ejecuta: npm install en', __dirname);
    process.exit(1);
  }
}

const CREDS_PATH = join(__dirname, 'credentials.json');

function getAuth() {
  if (!existsSync(CREDS_PATH)) {
    console.error('ERROR: Credenciales no configuradas.');
    console.error('Crea un Service Account en Google Cloud Console y guarda el JSON en:');
    console.error(CREDS_PATH);
    console.error('Luego comparte tus documentos de Drive con el email del Service Account.');
    process.exit(1);
  }

  const creds = JSON.parse(readFileSync(CREDS_PATH, 'utf8'));

  // Service Account
  if (creds.type === 'service_account') {
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDS_PATH,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      ],
    });
    return auth;
  }

  console.error('ERROR: Solo se soportan Service Accounts (type: service_account)');
  process.exit(1);
}

async function listFiles(folderId = null) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  let q = "trashed = false";
  if (folderId) {
    q = `'${folderId}' in parents and trashed = false`;
  }

  const res = await drive.files.list({
    q,
    pageSize: 50,
    fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink)',
    orderBy: 'modifiedTime desc',
  });

  const files = res.data.files || [];
  if (files.length === 0) {
    console.log('No hay archivos. Asegúrate de haber compartido la carpeta con el Service Account.');
    return;
  }

  console.log(JSON.stringify(files.map(f => ({
    id: f.id,
    name: f.name,
    type: f.mimeType.replace('application/vnd.google-apps.', ''),
    modified: f.modifiedTime,
    url: f.webViewLink,
  })), null, 2));
}

async function readDoc(fileId) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  // Obtener info del archivo
  const meta = await drive.files.get({
    fileId,
    fields: 'name, mimeType',
  });

  const mimeType = meta.data.mimeType;
  const name = meta.data.name;
  console.error(`Archivo: ${name} (${mimeType})`);

  if (mimeType === 'application/vnd.google-apps.document') {
    // Google Doc — exportar como texto plano
    const res = await drive.files.export(
      { fileId, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    console.log(`# ${name}\n\n${res.data}`);
  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    // Google Sheets — exportar como CSV
    const res = await drive.files.export(
      { fileId, mimeType: 'text/csv' },
      { responseType: 'text' }
    );
    console.log(`# ${name}\n\n${res.data}`);
  } else if (mimeType === 'application/vnd.google-apps.presentation') {
    // Google Slides — exportar como texto
    const res = await drive.files.export(
      { fileId, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    console.log(`# ${name}\n\n${res.data}`);
  } else if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) {
    // PDF o texto — descargar directamente
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    console.log(res.data);
  } else {
    console.error(`Tipo no soportado para lectura: ${mimeType}`);
    console.error('Tipos soportados: Google Docs, Sheets, Slides, PDF, texto');
    process.exit(1);
  }
}

async function searchFiles(query) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: `fullText contains '${query.replace(/'/g, "\\'")}' and trashed = false`,
    pageSize: 20,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
    orderBy: 'modifiedTime desc',
  });

  const files = res.data.files || [];
  console.log(JSON.stringify(files.map(f => ({
    id: f.id,
    name: f.name,
    type: f.mimeType.replace('application/vnd.google-apps.', ''),
    modified: f.modifiedTime,
    url: f.webViewLink,
  })), null, 2));
}

async function getInfo(fileId) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.get({
    fileId,
    fields: '*',
  });

  const f = res.data;
  console.log(JSON.stringify({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    size: f.size,
    owners: f.owners?.map(o => o.emailAddress),
    url: f.webViewLink,
    parents: f.parents,
    shared: f.shared,
  }, null, 2));
}

async function setup() {
  if (!existsSync(CREDS_PATH)) {
    console.log('Credenciales NO configuradas.');
    console.log('');
    console.log('Pasos para configurar:');
    console.log('1. Ve a https://console.cloud.google.com');
    console.log('2. Crea un proyecto nuevo (ej: "MaiA Drive")');
    console.log('3. Activa Google Drive API y Google Docs API');
    console.log('4. Crea un Service Account (IAM > Service Accounts)');
    console.log('5. Crea una clave JSON y descárgala');
    console.log('6. Guarda el JSON en:', CREDS_PATH);
    console.log('7. Comparte tus documentos/carpetas de Drive con el email del Service Account');
    console.log('');
    console.log('El email del Service Account tiene el formato:');
    console.log('  nombre@proyecto.iam.gserviceaccount.com');
    return;
  }

  const creds = JSON.parse(readFileSync(CREDS_PATH, 'utf8'));
  console.log('Credenciales encontradas:');
  console.log('  Tipo:', creds.type);
  console.log('  Email SA:', creds.client_email || 'N/A');
  console.log('  Proyecto:', creds.project_id || 'N/A');

  try {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.list({ pageSize: 1 });
    console.log('  Autenticación: OK');
  } catch (e) {
    console.error('  Autenticación: ERROR -', e.message);
  }
}

// Main
const [,, cmd, ...args] = process.argv;

try {
  switch (cmd) {
    case 'list':    await listFiles(args[0]);        break;
    case 'read':    await readDoc(args[0]);           break;
    case 'search':  await searchFiles(args.join(' ')); break;
    case 'info':    await getInfo(args[0]);           break;
    case 'setup':   await setup();                    break;
    default:
      console.log('Uso: node gdrive.mjs <list|read|search|info|setup> [args]');
      console.log('  list [folderId]   — listar archivos accesibles');
      console.log('  read <fileId>     — leer contenido de un documento');
      console.log('  search <query>    — buscar archivos por texto');
      console.log('  info <fileId>     — metadatos del archivo');
      console.log('  setup             — verificar configuración');
  }
} catch (err) {
  console.error('ERROR:', err.message);
  if (err.code === 403) console.error('Sin permisos. Comparte el archivo con el Service Account.');
  if (err.code === 404) console.error('Archivo no encontrado. Verifica el ID.');
  process.exit(1);
}
