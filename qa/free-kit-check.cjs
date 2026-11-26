const {chromium} = require(process.env.MANTRALO_PLAYWRIGHT || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:8140/';
const root = path.resolve(__dirname,'..');
const report = { time: new Date().toISOString(), checks:[], errors:[], externalRequests:[], writes:[] };
const pass = (name, extra={}) => {report.checks.push({name,...extra});console.log('PASS '+name);};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const context=await browser.newContext({reducedMotion:'reduce',acceptDownloads:true});
  await context.route('**/*',route=>{const r=route.request();if(new URL(r.url()).hostname!=='127.0.0.1'){report.externalRequests.push(r.url());return route.abort();}if(!['GET','HEAD'].includes(r.method())){report.writes.push(r.method()+' '+r.url());return route.abort();}return route.continue();});
  const page=await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
  const loaded=async()=>page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode();}));});
  for(const width of [360,390,768,1440]){
   await page.setViewportSize({width,height:width<768?844:1000});
   for(const route of ['#/free-kit','#/lesson-sample','followup-preview.html']){
    await page.goto(base+route);await loaded();
    const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(dims.scroll<=dims.viewport+1,route+' overflow at '+width);
    const duplicates=await page.locator('[id]').evaluateAll(els=>els.map(e=>e.id).filter((id,i,all)=>all.indexOf(id)!==i));
    assert.deepEqual(duplicates,[]);
    if([390,1440].includes(width))await page.screenshot({path:path.join(root,'preview',`${route.includes('followup')?'followup':route.slice(2)}-${width}.png`),fullPage:true});
    pass(route+' responsive '+width);
   }
  }
  await page.goto(base+'#/free-kit');await loaded();
  assert.equal(await page.locator('.fk-document').count(),3);
  assert.equal(await page.locator('[data-kit-form] input[name="followup"]').isChecked(),false);
  for(let day=0;day<7;day++){
   await page.locator(`[data-kit-day="${day}"]`).click();
   assert.equal(await page.locator(`[data-kit-day="${day}"]`).getAttribute('aria-pressed'),'true');
   assert.match(await page.locator('#fk-day-panel').innerText(),new RegExp('วันที่ '+(day+1)));
  }
  pass('three free documents, seven real daily activities and unchecked consent');
  for(const name of ['free-guide','checklist','journal','course-sample']){
   const res=await context.request.get(base+`assets/free-kit/${name}.pdf`);
   assert.equal(res.status(),200);assert.match(res.headers()['content-type'],/pdf/);
   assert.equal((await res.body()).subarray(0,4).toString(),'%PDF');
  }
  const downloadWait=page.waitForEvent('download');
  await page.locator('.fk-document-actions a[download]').first().click();
  const download=await downloadWait;assert.match(download.suggestedFilename(),/MANTRALO-free-guide/);
  pass('all four PDF assets open and free-guide download works');
  const form=page.locator('[data-kit-form]');
  await form.locator('[type="submit"]').click();assert.ok(await page.locator('[data-kit-result]').isHidden());
  await form.locator('[name="email"]').fill('local-preview@example.com');
  await form.locator('[name="firstName"]').fill('<img src=x onerror=alert(1)>');
  await form.locator('[type="submit"]').click();
  assert.match(await page.locator('[data-kit-result]').innerText(),/ไม่สมัครรับข้อความ/);
  assert.equal(await page.locator('[data-kit-result] img').count(),0);
  assert.equal(await form.locator('[name="email"]').inputValue(),'');
  await form.locator('[name="email"]').fill('local-preview@example.com');
  await form.locator('[name="followup"]').check();
  await form.locator('[type="submit"]').click();
  assert.match(await page.locator('[data-kit-result]').innerText(),/7 วัน/);
  assert.match(await page.locator('[data-kit-result]').innerText(),/ยังไม่ได้บันทึกข้อมูลหรือส่งอีเมล/);
  assert.ok(await page.evaluate(()=>!Object.keys(localStorage).some(k=>/email|lead|contact/i.test(k))));
  await page.locator('[data-kit-result] [data-kit-scroll]').click();
  await page.waitForFunction(()=>document.activeElement?.id==='fk-downloads');
  pass('local form validates, escapes, clears inputs and respects optional followup');
  await page.locator('.fk-sample-bridge a').click();
  assert.equal(await page.locator('.fk-sample-pages article').count(),2);
  await page.locator('.fk-sample-pages summary').last().click();
  assert.ok((await page.locator('.fk-source-text').last().innerText()).length>100);
  assert.match(await page.locator('.fk-sample-context').first().innerText(),/1 และ 4/);
  pass('real course excerpt has original page labels and accessible text');
  await page.locator('.fk-offer a[href="#/book"]').click();
  await page.locator('[data-order="book"]').first().click();
  assert.match(await page.locator('#modal').innerText(),/290/);
  await page.goto(base+'#/lesson-sample');
  await page.locator('.fk-offer a[href="#/course"]').click();
  await page.locator('[data-course-credit]').first().click();
  assert.match(await page.locator('#modal').innerText(),/2,610/);
  assert.match(await page.locator('#modal').innerText(),/ตรวจ/);
  pass('sample to book 290 and conditional course upgrade 2610');
  await page.goto(base+'followup-preview.html');
  for(const group of ['lead','book','course']){
   await page.locator('#fp-audience').selectOption(group);
   for(const channel of ['line','email']){
    await page.locator(`[data-channel="${channel}"]`).click();
    for(let day=1;day<=7;day++){
     await page.locator(`[data-day="${day}"]`).click();
     const msg=await page.locator('#fp-message').inputValue();
     assert.ok(msg.length>150);assert.ok(msg.includes('[ชื่อ]'));
     assert.ok(msg.includes('หยุด'));
     assert.ok((await page.locator('#fp-cta').getAttribute('href')).startsWith('index.html#/'));
    }
   }
  }
  const exportWait=page.waitForEvent('download');await page.locator('#fp-download').click();
  const exported=await exportWait;const downloadPath=await exported.path();
  const exportedText=fs.readFileSync(downloadPath,'utf8');assert.match(exportedText,/วันที่ 7/);assert.match(exportedText,/127\.0\.0\.1/);
  assert.equal(exportedText.match(/วันที่ [1-7]:/g).length,7);
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
  await page.locator('#fp-copy').click();
  const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.match(copied,/MANTRALO|\[ชื่อ\]/);assert.match(copied,/127\.0\.0\.1/);
  pass('42 audience/day/channel messages, copy and seven-day export');
  await page.goto(base+'#/');await loaded();
  await page.locator('.hero-actions a[href="#/free-kit"]').click();
  assert.equal(await page.locator('#main').getAttribute('data-route'),'/free-kit');
  await page.goto(base+'#/library');await page.locator('.mv-guide a').click();
  assert.equal(await page.locator('#main').getAttribute('data-route'),'/free-kit');
  await page.goto(base+'#/course');await page.locator('.cl-real-sample .button').click();
  assert.equal(await page.locator('#main').getAttribute('data-route'),'/lesson-sample');
  pass('home, video library and course entry links work');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.writes,[]);
  pass('no JS/asset failures, external requests or customer-data writes');
 } finally {await browser.close();fs.writeFileSync(path.join(root,'qa/free-kit-report.json'),JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
