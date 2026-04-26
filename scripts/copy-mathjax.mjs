import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const vendorDir = join(root, 'public', 'vendor');

async function getPackageRoot(packageName) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  return dirname(packageJsonPath);
}

async function copyPackageAsset(packageName, sourceSubpath, outputPath) {
  const packageRoot = await getPackageRoot(packageName);
  const source = join(packageRoot, sourceSubpath);
  const destination = join(vendorDir, outputPath);

  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
}

async function copyComponentFile(packageName, sourceFile, outputPath) {
  const packageRoot = await getPackageRoot(packageName);
  const destination = join(vendorDir, outputPath);

  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(packageRoot, sourceFile), destination);
}

async function sanitizeJavaScriptTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      await sanitizeJavaScriptTree(path);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.js')) {
      continue;
    }

    const source = await readFile(path, 'utf8');
    const sanitized = source
      .replaceAll('http://www.w3.org', 'http\\u003a//www.w3.org')
      .replace(/https?:\/\/[^\s"'`\\<>)]+/g, '.')
      .replaceAll('cdn.jsdelivr.net', 'local-disabled.invalid');

    if (sanitized !== source) {
      await writeFile(path, sanitized);
    }
  }
}

await mkdir(vendorDir, { recursive: true });
await rm(vendorDir, { recursive: true, force: true });
await mkdir(vendorDir, { recursive: true });
await copyComponentFile('mathjax', 'tex-svg.js', 'mathjax/tex-svg.js');
await copyPackageAsset('mathjax', 'input/tex/extensions', 'mathjax/input/tex/extensions');
await copyPackageAsset('mathjax', 'sre', 'mathjax/sre');
await copyComponentFile('@mathjax/mathjax-newcm-font', 'svg.js', 'mathjax-newcm-font/svg.js');
await copyPackageAsset('@mathjax/mathjax-newcm-font', 'svg', 'mathjax-newcm-font/svg');
await sanitizeJavaScriptTree(vendorDir);
