// server.js (ES Module version)

import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { utils, writeFile } from 'xlsx';
import cors from 'cors';

const app = express();
const PORT = 5000;

// To simulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint
app.post('/api/process-docx', async (req, res) => {
  try {
    const form = new formidable.IncomingForm();

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const uploadedFile = files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tempOutputPath = path.join(__dirname, 'temp_output.xlsx');

    // Sample Excel data
    const wsData = [
      ['Status', 'Task', 'Budget'],
      ['Pending', 'Sample Task 1', '$1000'],
      ['In Progress', 'Sample Task 2', '$2500']
    ];

    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(wsData);
    utils.book_append_sheet(wb, ws, 'Tasks');
    writeFile(wb, tempOutputPath);

    // Send the file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=processed_output.xlsx'
    );

    const fileStream = fs.createReadStream(tempOutputPath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      fs.unlinkSync(tempOutputPath);
      fs.unlinkSync(uploadedFile.filepath);
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
