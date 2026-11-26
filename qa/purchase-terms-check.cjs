const {chromium}=require(process.env.MANTRALO_PLAYWRIGHT);
const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const base='http://127.0.0.1:8140/',out=path.join(__dirname,'approved-terms-20261126');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const report={checks:[],errors:[]};
try{const page=await browser.newPage({reducedMotion:'reduce'});await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
for(const width of [360,390,768,1440]){
await page.setViewportSize({width,height:900});
for(const route of ['book','course']){
await page.goto(base+'#/'+route+'?lang=th',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
await page.locator('[data-details-scroll]').click();await page.waitForFunction(id=>document.activeElement.id===id,route+'-receive');
const section=page.locator('#'+route+'-receive');const text=await section.innerText();assert.match(text,/เงื่อนไขที่เลือก/);assert.doesNotMatch(text,/ค่าส่งเสนอ|ระยะเวลา.{0,25}รอเลือก/);assert.match(text,/อีเมล/);assert.match(text,route==='book'?/349 บาท/:/12 เดือน/);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
if(width===390||width===1440)await page.screenshot({path:path.join(out,route+'-'+width+'.png')});
if(route==='book'){
await page.locator('[data-order="selected-book"]').first().click();assert.match(await page.locator('#modal .pd-modal').innerText(),/349 บาท/);
}else{
await page.locator('[data-order="course"]').first().click();assert.match(await page.locator('#modal .pd-modal').innerText(),/12 เดือน/);
}
assert.equal(await page.locator('#modal').evaluate(e=>e.contains(document.activeElement)),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#modal').evaluate(e=>e.open),false);
report.checks.push(route+' '+width+': detail entry, terms, no overflow, order modal and keyboard');
}
await page.goto(base+'offer-options.html',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);const summary=page.locator('main');assert.match(await summary.innerText(),/349 บาท/);assert.match(await summary.innerText(),/12 เดือน/);assert.match(await summary.innerText(),/เงื่อนไขที่เลือกแล้ว/);assert.doesNotMatch(await summary.innerText(),/49 บาท|24 เดือน|6 เดือน|ส่งฟรีเมื่อซื้อ 2/);assert.equal(await page.locator('input[type=radio]').count(),0);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
if(width===390||width===1440)await page.screenshot({path:path.join(out,'approved-'+width+'.png')});report.checks.push('Approved terms '+width+': correct totals and read-only decision');
}
assert.deepEqual(report.errors,[]);console.log('PASS '+report.checks.length+' purchase flow checks; no browser errors or failed assets');
}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
