import type { NextApiRequest, NextApiResponse } from 'next';
import { createReadStream, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawn } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const formData = await new Promise<any>((resolve, reject) => {
      const chunks: any[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        resolve(body);
      });
      req.on('error', reject);
    });

    // Save the file temporarily
    const tempFilePath = join(tmpdir(), `upload-${Date.now()}.docx`);
    require('fs').writeFileSync(tempFilePath, formData);

    // Process with Python
    const pythonProcess = spawn('python3', [
      join(process.cwd(), 'scripts', 'process_docx.py'),
      tempFilePath
    ]);

    let resultData = '';
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python error: ${data}`);
    });

    await new Promise((resolve) => {
      pythonProcess.on('close', resolve);
    });

    const outputPath = resultData.trim();
    const fileStream = createReadStream(outputPath);

    // Clean up
    unlinkSync(tempFilePath);
    unlinkSync(outputPath);

    // Send the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=processed_output.xlsx');
    fileStream.pipe(res);

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
}
