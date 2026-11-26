const {chromium}=require(process.env.MANTRALO_PLAYWRIGHT);
const fs=require('node:fs');
const path=require('node:path');
const base='http://127.0.0.1:8140/';
const output=path.join(__dirname,'polish-20261126');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const report={pages:[],errors:[]};
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
  for(const width of [390,1440])for(const route of ['/','/book','/course','/free-kit']){
   await page.setViewportSize({width,height:900});
   await page.goto(base+'#'+route+'?lang=th',{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   const name=(route==='/'?'home':route.slice(1))+'-'+width;
   await page.screenshot({path:path.join(output,name+'.png')});
   const details=await page.evaluate(()=>{
    const rgb=s=>{const a=s.match(/[\d.]+/g)?.map(Number);return a&&a.length>=3?[a[0],a[1],a[2],a[3]??1]:null;};
    const lum=a=>a.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
    const contrast=[];const tiny=[];const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
     const text=walker.currentNode.textContent.trim(),el=walker.currentNode.parentElement;
     if(!text||!visible(el)||el.closest('script,style'))continue;
     const s=getComputedStyle(el),size=parseFloat(s.fontSize),fg=rgb(s.color);
     if(size<14)tiny.push({text:text.slice(0,80),size,selector:el.className});
     if(!fg||fg[3]!==1)continue;
     let bg=null,skip=false;
     for(let p=el;p;p=p.parentElement){const ps=getComputedStyle(p);if(ps.backgroundImage!=='none'||Number(ps.opacity)!==1){skip=true;break;}const c=rgb(ps.backgroundColor);if(c&&c[3]===1){bg=c;break;}if(c&&c[3]>0){skip=true;break;}}
     if(skip)continue;bg??=[255,255,255,1];const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),required=size>=24||(size>=18.66&&Number(s.fontWeight)>=700)?3:4.5;
     if(ratio<required)contrast.push({text:text.slice(0,90),ratio:Number(ratio.toFixed(2)),required,size,fg:s.color,bg,selector:el.className});
    }
    return {h1:[...document.querySelectorAll('main h1')].map(e=>e.innerText),overflow:document.documentElement.scrollWidth>innerWidth+1,pageHeight:document.documentElement.scrollHeight,contrast,tiny,
     buttons:[...document.querySelectorAll('button')].filter(visible).map(e=>({text:e.innerText||e.getAttribute('aria-label'),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)})).filter(e=>e.w<44||e.h<44),
     unlabeledInputs:[...document.querySelectorAll('input,textarea,select')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.name||e.id),
     assets:performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin)).map(e=>({url:e.name.split('/').pop(),bytes:e.transferSize})),
     links:[...document.querySelectorAll('main a')].map(e=>({text:e.innerText,href:e.getAttribute('href')}))};
   });
   fs.writeFileSync(path.join(output,name+'-text.txt'),await page.locator('body').innerText());
   report.pages.push({route,width,...details});
   if(route==='/course'&&width===1440){await page.locator('#cp-pricing').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'course-pricing.png')});}
   console.log(name+': overflow='+details.overflow+', low-contrast='+details.contrast.length+', small-buttons='+details.buttons.length);
  }
  await page.goto(base+'#/book?lang=th');await page.locator('[data-order="selected-book"]').first().click();
  fs.writeFileSync(path.join(output,'book-modal.txt'),await page.locator('#modal').innerText());
  report.bookDialogFocus=await page.evaluate(()=>({open:document.querySelector('#modal').open,focusedInside:document.querySelector('#modal').contains(document.activeElement)}));
  await page.keyboard.press('Escape');report.escapeCloses=await page.locator('#modal').evaluate(e=>!e.open);
 }finally{await browser.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));}
 console.log('Saved audit evidence; browser errors='+report.errors.length);
})().catch(e=>{console.error(e);process.exitCode=1});
