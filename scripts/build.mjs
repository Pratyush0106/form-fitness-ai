import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
import './app-icons.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isFile = (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile();

function resolveFile(candidate) {
  for (const file of [candidate, `${candidate}.js`, `${candidate}.mjs`, `${candidate}.jsx`, path.join(candidate, 'index.js')]) {
    if (isFile(file)) return file;
  }
  throw new Error(`Cannot resolve ${candidate}`);
}

function pickExport(value) {
  if (typeof value === 'string') return value;
  if (!value) return null;
  for (const condition of ['browser', 'import', 'module', 'default', 'require']) {
    const match = pickExport(value[condition]);
    if (match) return match;
  }
  return null;
}

function resolvePackage(specifier, importer) {
  const pieces = specifier.split('/');
  const packageName = specifier.startsWith('@') ? pieces.slice(0, 2).join('/') : pieces[0];
  const subpath = specifier.slice(packageName.length);
  let folder = path.dirname(importer || path.join(root, 'src', 'App.jsx'));
  while (folder.startsWith(root)) {
    const packageRoot = path.join(folder, 'node_modules', packageName);
    const manifestPath = path.join(packageRoot, 'package.json');
    if (isFile(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const exported = manifest.exports && (pickExport(manifest.exports[`.${subpath}`]) || (!subpath && pickExport(manifest.exports)));
      const entry = exported || (subpath ? subpath.slice(1) : (typeof manifest.browser === 'string' ? manifest.browser : manifest.module || manifest.main || 'index.js'));
      return resolveFile(path.join(packageRoot, entry));
    }
    folder = path.dirname(folder);
  }
  throw new Error(`Cannot resolve package ${specifier}`);
}

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['./src/main.jsx'],
  bundle: true,
  format: 'esm',
  splitting: true,
  outdir: path.join(root, 'dist'),
  entryNames: 'app',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  target: ['es2022'],
  plugins: [{
    name: 'portable-file-resolver',
    setup(plugin) {
      plugin.onResolve({ filter: /.*/ }, (args) => ({
        path: args.kind === 'entry-point'
          ? resolveFile(path.join(root, args.path))
          : args.path.startsWith('.')
            ? resolveFile(path.resolve(path.dirname(args.importer), args.path))
            : resolvePackage(args.path, args.importer),
        namespace: 'exact-file',
      }));
      plugin.onLoad({ filter: /.*/, namespace: 'exact-file' }, (args) => ({
        contents: fs.readFileSync(args.path, 'utf8'),
        loader: args.path.endsWith('.jsx') ? 'jsx' : args.path.endsWith('.json') ? 'json' : 'js',
      }));
    },
  }],
});

const tailwind = path.join(root, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
const result = spawnSync(process.execPath, [tailwind, '-i', 'src/style.css', '-o', 'dist/app.css', '--minify'], { cwd: root, stdio: 'inherit' });
if (result.status) process.exit(result.status);
const html=fs.readFileSync(path.join(root,'src','index.html'),'utf8');
fs.writeFileSync(path.join(root,'index.html'),html.replace('</head>','<link rel="apple-touch-icon" href="/app-icon-192.png"><link rel="stylesheet" href="/responsive.css"></head>'));
console.log('FORM production assets built.');
