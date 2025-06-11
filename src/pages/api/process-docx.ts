import { IncomingForm } from 'formidable';
import { spawn } from 'child_process';
import { createReadStream, unlink } from 'fs';
import { join } from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err || !files.file) {
      return res.status(500).json({ error: 'File upload error' });
    }

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0].filepath
      : files.file.filepath;

    const python = spawn('python3', ['scripts/process_docx.py', uploadedFile]);

    let result = '';
    python.stdout.on('data', (data) => {
      result += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
    });

    python.on('close', (code) => {
      const outputPath = result.trim();

      if (!outputPath || code !== 0) {
        return res.status(500).json({ error: 'Python script failed' });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="processed_output.xlsx"');

      const fileStream = createReadStream(outputPath);
      fileStream.pipe(res);

      fileStream.on('close', () => {
        unlink(uploadedFile, () => {});
        unlink(outputPath, () => {});
      });
    });
  });
}
