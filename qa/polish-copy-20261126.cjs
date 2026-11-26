const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const backup=path.resolve(root,'../design-preview/polish-backup-20261126');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const runtime=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
const files=['index.html',...runtime.filter(p=>!p.startsWith('locales/'))];
const terms=s=>s.replace(/อีบุ๊ก|อีบุ๊ค|อีบุค/g,'หนังสือดิจิทัล').replace(/\bE-book\b/gi,'หนังสือดิจิทัล').replace(/\bStarter ดิจิทัล/g,'ชุดเริ่มต้นดิจิทัล').replace(/\bStarter\b/g,'ชุดเริ่มต้นดิจิทัล');
const assets=s=>s.replaceAll('assets/logo.png','assets/logo.webp').replaceAll('assets/book-new-edition.png','assets/book-new-edition.webp').replaceAll('assets/book-cover.png','assets/book-new-edition.webp').replaceAll('assets/instructor-wannapa.png','assets/instructor-wannapa.webp');
function save(file,next){const p=path.join(root,file),prev=fs.readFileSync(p,'utf8');if(prev===next)return;const b=path.join(backup,file);fs.mkdirSync(path.dirname(b),{recursive:true});if(!fs.existsSync(b))fs.writeFileSync(b,prev);fs.writeFileSync(p,next);console.log('Updated '+file);}
for(const file of files)save(file,assets(terms(fs.readFileSync(path.join(root,file),'utf8'))));
for(const name of ['home','book','course','common']){
 const file='locales/'+name+'.en.js',ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 const variable='MANTRALO_EN_'+name.toUpperCase(),map=ctx.window[variable],next={};
 for(const [key,value] of Object.entries(map))next[terms(key)]=value;
 save(file,'/* Editorial English copy; keys match the Thai product terminology. */\nwindow.'+variable+' = Object.freeze('+JSON.stringify(next,null,2)+');\n');
}
// Keep translated metadata aligned with the Thai-facing product terms.
save('locales/i18n.js',terms(fs.readFileSync(path.join(root,'locales/i18n.js'),'utf8')));
