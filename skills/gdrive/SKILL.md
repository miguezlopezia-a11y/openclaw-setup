---
name: gdrive
description: Read and search Google Drive documents using a Service Account. Use when asked to read a document from Google Drive, access NotebookLM content, list available documents, or search files. Works with Google Docs, Sheets, Slides, and PDF files.
---

# gdrive — Google Drive Reader

Accede a Google Drive usando Service Account. Ideal para leer documentos exportados de NotebookLM, Docs compartidos, Sheets, y más.

## Prerequisitos

El Service Account debe estar configurado con credenciales en:
`/home/node/.openclaw/gdrive/credentials.json`

Verifica el estado:
```bash
node /home/node/.openclaw/gdrive/gdrive.mjs setup
```

## Comandos

### Listar archivos accesibles
```bash
# Todos los archivos compartidos con el Service Account
node /home/node/.openclaw/gdrive/gdrive.mjs list

# Archivos en una carpeta específica
node /home/node/.openclaw/gdrive/gdrive.mjs list FOLDER_ID
```

### Leer el contenido de un documento
```bash
# Leer un Google Doc / Sheets / PDF
node /home/node/.openclaw/gdrive/gdrive.mjs read FILE_ID

# Ejemplo real:
node /home/node/.openclaw/gdrive/gdrive.mjs read 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

### Buscar archivos por contenido o nombre
```bash
node /home/node/.openclaw/gdrive/gdrive.mjs search "notebooklm inteligencia artificial"
node /home/node/.openclaw/gdrive/gdrive.mjs search "resumen proyecto"
```

### Obtener info/metadatos de un archivo
```bash
node /home/node/.openclaw/gdrive/gdrive.mjs info FILE_ID
```

## Cómo obtener el FILE_ID

El ID de un archivo de Google Drive está en su URL:
- `https://docs.google.com/document/d/**FILE_ID**/edit`
- `https://drive.google.com/file/d/**FILE_ID**/view`

También puedes hacer `list` o `search` para obtener los IDs.

## Formatos soportados

| Tipo | Exportación |
|------|-------------|
| Google Docs | Texto plano |
| Google Sheets | CSV |
| Google Slides | Texto plano |
| PDF | Texto |
| Archivos de texto | Directo |

## Flujo típico para leer NotebookLM

1. Buscar el documento: `node /home/node/.openclaw/gdrive/gdrive.mjs search "nombre del notebook"`
2. Copiar el `id` del resultado
3. Leer: `node /home/node/.openclaw/gdrive/gdrive.mjs read <id>`

## Notas

- Requiere que el archivo esté compartido con el email del Service Account
- Credenciales en `/home/node/.openclaw/gdrive/credentials.json`
- Solo lectura (scope: `drive.readonly`, `documents.readonly`)
