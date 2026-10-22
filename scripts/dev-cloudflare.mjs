// Support the standard host/port flags supplied by preview supervisors.
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2).filter(a=>a!=='--strictPort').map(a=>a==='--host'?'--ip':a.startsWith('--host=')?a.replace('--host=','--ip='):a);
const child=spawn(process.execPath,[fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url)),'dev','--config','wrangler.cloudflare.json',...args],{stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
child.on('error',error=>{console.error(error.message);process.exit(1);});
