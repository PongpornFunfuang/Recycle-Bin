const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const files = new Map([
  ['/','index.html'],
  ['/index.html','index.html'],
  ['/supabase-config.js','supabase-config.js'],
  ['/supabase-schema.sql','supabase-schema.sql']
]);
const server = http.createServer((request,response)=>{
  const pathname = new URL(request.url,'http://127.0.0.1').pathname;
  const file = files.get(pathname);
  if(!file){response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Not found');return;}
  fs.readFile(path.join(root,file),(error,content)=>{
    if(error){response.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});response.end('Unable to read local app files');return;}
    const type=file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.sql')?'text/plain; charset=utf-8':'text/html; charset=utf-8';
    response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});
    response.end(content);
  });
});
server.listen(4173,'127.0.0.1',()=>process.stdout.write('Recycle Bin local preview: http://127.0.0.1:4173\n'));
