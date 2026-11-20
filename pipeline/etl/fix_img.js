const fs=require('fs');const IK=new Set(require('./imgkeys.json').pp);const f=process.env.BS_HOME+'/etl/out/SKUNEW.js';let t=fs.readFileSync(f,'utf8');
const pngx=x=>x.replace(/\.(jpe?g|webp)$/i,'.png');let n=0;
t=t.replace(/"img":"([^"]+)"/g,(m,im)=>{if(IK.has('thumbs/'+pngx(im)))return m;n++;return '"img":""'});
fs.writeFileSync(f,t);console.log('img blanked',n);
