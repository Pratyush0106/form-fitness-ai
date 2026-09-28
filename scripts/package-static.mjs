import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const dest=path.join(root,'public');fs.mkdirSync(dest,{recursive:true});
for(const folder of ['assets','data','dist'])fs.cpSync(path.join(root,folder),path.join(dest,folder),{recursive:true});fs.copyFileSync(path.join(root,'index.html'),path.join(dest,'index.html'));console.log('Public deployment assets prepared; no private data or secrets copied.');
