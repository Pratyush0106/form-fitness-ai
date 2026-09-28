import {spawn} from 'node:child_process';
const run=spawn(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});run.on('exit',code=>{if(code)process.exit(code);spawn(process.execPath,['--watch','server/index.mjs'],{stdio:'inherit'});});
