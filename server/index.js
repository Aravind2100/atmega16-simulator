import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Locate avr-gcc toolchain
function findAvrToolchain() {
  const candidates = [
    path.join(os.homedir(), '.platformio/packages/toolchain-atmelavr/bin'),
    '/usr/bin',
    '/usr/local/bin',
  ];
  for (const dir of candidates) {
    const gccPath = path.join(dir, 'avr-gcc');
    if (fs.existsSync(gccPath)) {
      return dir;
    }
  }
  return null;
}

const TOOLCHAIN_DIR = findAvrToolchain();
console.log('AVR Toolchain directory:', TOOLCHAIN_DIR || 'NOT FOUND (Will use built-in browser assembler)');

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasNativeCompiler: !!TOOLCHAIN_DIR,
    toolchainPath: TOOLCHAIN_DIR,
    target: 'ATmega16',
  });
});

app.post('/api/compile', async (req, res) => {
  const { code, language = 'c', fCpu = 8000000 } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, errors: 'No code provided' });
  }

  if (!TOOLCHAIN_DIR) {
    return res.status(503).json({
      success: false,
      errors: 'Native avr-gcc toolchain not found on host. Client will use built-in assembler.',
    });
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atmega16-'));
  const avrGcc = path.join(TOOLCHAIN_DIR, 'avr-gcc');
  const avrObjcopy = path.join(TOOLCHAIN_DIR, 'avr-objcopy');
  const avrObjdump = path.join(TOOLCHAIN_DIR, 'avr-objdump');
  const avrSize = path.join(TOOLCHAIN_DIR, 'avr-size');

  try {
    let elfPath = path.join(tmpDir, 'output.elf');
    let hexPath = path.join(tmpDir, 'output.hex');

    if (language === 'c') {
      const srcPath = path.join(tmpDir, 'main.c');
      fs.writeFileSync(srcPath, code);

      try {
        await execFileAsync(avrGcc, [
          '-mmcu=atmega16',
          `-DF_CPU=${fCpu}UL`,
          '-Os',
          '-Wall',
          '-o',
          elfPath,
          srcPath,
        ]);
      } catch (err) {
        const errorOutput = (err.stderr || err.stdout || err.message || '').toString();
        // Clean up file path from error messages to make them learner-friendly
        const cleanedErrors = errorOutput.replace(new RegExp(tmpDir + '/?', 'g'), '');
        return res.json({ success: false, errors: cleanedErrors });
      }
    } else {
      // Assembly
      const srcPath = path.join(tmpDir, 'main.s');
      fs.writeFileSync(srcPath, code);

      try {
        await execFileAsync(avrGcc, [
          '-mmcu=atmega16',
          '-nostdlib',
          '-o',
          elfPath,
          srcPath,
        ]);
      } catch (err) {
        const errorOutput = (err.stderr || err.stdout || err.message || '').toString();
        const cleanedErrors = errorOutput.replace(new RegExp(tmpDir + '/?', 'g'), '');
        return res.json({ success: false, errors: cleanedErrors });
      }
    }

    // Convert ELF to Intel HEX
    await execFileAsync(avrObjcopy, ['-O', 'ihex', '-R', '.eeprom', elfPath, hexPath]);
    const hex = fs.readFileSync(hexPath, 'utf-8');

    // Generate Disassembly
    let disassembly = '';
    try {
      const { stdout } = await execFileAsync(avrObjdump, ['-d', '-S', elfPath]);
      disassembly = stdout;
    } catch {
      disassembly = 'Disassembly generation unavailable.';
    }

    // Parse Memory Usage
    let flashBytes = 0;
    let sramBytes = 0;
    try {
      const { stdout } = await execFileAsync(avrSize, ['--format=avr', '--mcu=atmega16', elfPath]);
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('Program:')) {
          const m = line.match(/Program:\s+(\d+)\s+bytes/);
          if (m) flashBytes = parseInt(m[1], 10);
        }
        if (line.includes('Data:')) {
          const m = line.match(/Data:\s+(\d+)\s+bytes/);
          if (m) sramBytes = parseInt(m[1], 10);
        }
      }
    } catch {
      // Estimate from HEX file size if size fails
      flashBytes = hex.length / 3;
    }

    return res.json({
      success: true,
      hex,
      disassembly,
      flashUsed: flashBytes,
      flashMax: 16384, // ATmega16: 16KB Flash
      sramUsed: sramBytes,
      sramMax: 1024,  // ATmega16: 1KB SRAM
      message: `Build succeeded! Flash: ${flashBytes} B / 16384 B (${((flashBytes / 16384) * 100).toFixed(1)}%), SRAM: ${sramBytes} B / 1024 B.`,
    });
  } catch (error) {
    console.error('Compilation error:', error);
    return res.status(500).json({ success: false, errors: error.message || 'Internal build error' });
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
});

// Serve frontend in production
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ATmega16 Simulator Server listening on port ${PORT}`);
});
