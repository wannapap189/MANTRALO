const {chromium}=require(process.env.MANTRALO_PLAYWRIGHT);
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const base='http://127.0.0.1:8140/',out=path.join(__dirname,'post-purchase-20261126');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const report={checks:[],errors:[],blocked:[]};try{
const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});await page.route('**/*',r=>{if(!r.request().url().startsWith(base)||!['GET','HEAD'].includes(r.request().method())){report.blocked.push(r.request().url());return r.abort();}return r.continue();});
const visit=async(product,status,view='receipt')=>{await page.goto(base+`post-purchase.html?product=${product}&status=${status}&view=${view}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);};
for(const width of [360,390,768,1440]){
await page.setViewportSize({width,height:900});
for(const product of ['book','digital','course','upgrade']){
await visit(product,'pending');assert.match(await page.locator('main').innerText(),/ยังไม่ยืนยันการชำระเงิน/);
await page.locator('#status').selectOption('ready');assert.match(await page.locator('.total').innerText(),new RegExp(({book:'349',digital:'290',course:'2,900',upgrade:'2,610'})[product]));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
await page.getByRole('link',{name:'ดูตัวอย่างอีเมลที่ได้รับ',exact:true}).click();const frame=page.frameLocator('#email-preview');await frame.getByRole('link',{name:'เปิดคลังหนังสือดิจิทัล'}).waitFor();assert.match(await frame.locator('body').innerText(),/customer_name/);
if(product==='course'||product==='upgrade'){assert.match(await frame.locator('body').innerText(),/12 เดือน/);assert.match(await frame.locator('body').innerText(),/access_expires_at/);await frame.getByRole('link',{name:'เข้าสู่คอร์ส 12 บทเรียน'}).click();await page.waitForURL(/view=classroom/);assert.equal(await page.locator('.lessons li').count(),12);}else{await frame.getByRole('link',{name:'เปิดคลังหนังสือดิจิทัล'}).click();await page.waitForURL(/view=library/);assert.match(await page.locator('main').innerText(),/ยังไม่ใส่ลิงก์ไฟล์จำหน่าย/);}
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
report.checks.push(`${product} ${width}: receipt, totals, email links, correct library/classroom`);
}
await visit('course','expired','classroom');assert.equal(await page.locator('.lessons').count(),0);await page.locator('[data-recovery]').click();assert.match(await page.locator('#recovery').innerText(),/ไม่ได้ส่งคำขอหรืออีเมล/);report.checks.push(`Expired link ${width}: no media, clear recovery, no request`);
if(width===390||width===1440){for(const [product,status,view] of [['book','ready','receipt'],['course','ready','email'],['course','ready','classroom'],['course','expired','classroom']]){await visit(product,status,view);await page.screenshot({path:path.join(out,`${product}-${status}-${view}-${width}.png`)});}}
}
await visit('book','pending','email');assert.equal(await page.frameLocator('#email-preview').locator('a').count(),0);report.checks.push('Pending email contains no access links');
await visit('book','pending','library');assert.match(await page.locator('h1').innerText(),/สิทธิ์ยังไม่พร้อม/);report.checks.push('Pending account cannot show library preview');
await page.goto(base+'post-purchase.html?product=%3Cscript%3E&status=paid&view=admin');assert.equal(await page.locator('#product').inputValue(),'book');assert.equal(await page.locator('#status').inputValue(),'pending');report.checks.push('Unknown parameters fall back to a safe pending example');
await page.goto(base+'#/book?lang=th');await page.locator('#book-receive .pd-preview-link').click();await page.waitForURL(/post-purchase.html\?product=book/);report.checks.push('Book page connects to local after-purchase preview');
await page.goto(base+'#/course?lang=th');await page.locator('#course-receive .pd-preview-link').click();await page.waitForURL(/product=course/);report.checks.push('Course page connects to local after-purchase preview');
assert.deepEqual(report.errors,[]);assert.deepEqual(report.blocked,[]);console.log('PASS '+report.checks.length+' checks, no failed assets, browser errors or remote/write requests');
}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
