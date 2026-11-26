// Isolated local browser tests. No remote service requests or commerce submissions.
const { chromium } = require(process.env.MANTRALO_PLAYWRIGHT || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:8140/';
const root = path.resolve(__dirname, '..');
const report = { checks: [], errors: [], time: new Date().toISOString() };
const pass = (name, details = {}) => { report.checks.push({ name, ...details }); console.log('PASS ' + name); };
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', err => report.errors.push(err.message));
    page.on('response', r => { if (r.status() >= 400) report.errors.push(r.status() + ' ' + r.url()); });
    page.setDefaultTimeout(7000);
    const loaded = async () => page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(async i => { i.loading = 'eager'; await i.decode(); })); });
    const shot = async (name, fullPage = false) => page.screenshot({ path: path.join(root, 'preview', name + '.png'), fullPage });
    for (const width of [360,390,768,1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      await page.goto(base + '#/library'); await loaded();
      assert.equal(await page.locator('[data-library-grid] [data-library-book]').count(), 8);
      assert.equal(await page.locator('.ml-pending [data-library-book]').count(), 3);
      assert.equal(await page.locator('.ml-free a[download]').count(), 3);
      assert.equal(await page.locator('a[href$=".pdf"]').count(), 3, 'Only the three free drafts may be linked');
      const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(size.scroll <= size.client + 1, 'overflow at ' + width);
      const duplicates = await page.locator('[id]').evaluateAll(nodes => nodes.map(n => n.id).filter((id,i,ids) => ids.indexOf(id) !== i));
      assert.deepEqual(duplicates, []);
      if ([390,1440].includes(width)) { await shot('library-' + width, true); await page.locator('[data-library-grid]').screenshot({path:path.join(root,'preview','library-catalog-'+width+'.png')}); }
      pass('8 books + 3 developing + 3 free drafts at ' + width, size);
    }
    for (const [filter, count] of [['begin',1],['life',4],['crystal',3],['all',8]]) {
      await page.locator('[data-library-filter="' + filter + '"]').click();
      assert.equal(await page.locator('[data-library-grid] [data-library-book]').count(), count);
      assert.match(await page.locator('[data-library-count]').innerText(), new RegExp('พบ ' + count));
      pass('category ' + filter);
    }
    await page.locator('[data-library-search]').fill('  OFFICE  ');
    assert.equal(await page.locator('[data-library-grid] [data-library-book]').count(), 1);
    assert.equal(await page.locator('[data-library-grid] [data-library-book]').getAttribute('data-library-book'), 'office-chakra');
    await page.locator('[data-library-search]').fill('ไม่พบเล่มนี้แน่นอน');
    assert.ok(await page.locator('[data-library-empty]').isVisible());
    await page.locator('[data-library-empty] [data-library-clear]').click();
    assert.equal(await page.locator('[data-library-grid] [data-library-book]').count(), 8);
    pass('search, no-results and clear');
    const books = await page.evaluate(() => window.MANTRALO_LIBRARY_BOOKS.map(b => ({id:b.id,title:b.title,offer:b.offer})));
    for (const book of books) {
      await page.locator('[data-ebook-details="' + book.id + '"]').click();
      assert.equal(await page.locator('#dialog-title').innerText(), book.title);
      assert.ok(await page.locator('#modal img').evaluate(i => !!i.naturalWidth || !!i.src));
      assert.equal(await page.locator('#modal-content').evaluate(e => e.scrollTop), 0);
      if (book.offer === 'book') assert.match(await page.locator('#modal').innerText(), /290/);
      if (book.offer === 'developing') {
        assert.match(await page.locator('#modal').innerText(), /ยังไม่เปิดขาย/);
        assert.equal(await page.locator('#modal a[href], #modal [data-order]').count(), 0);
      }
      if (book.offer === 'inquiry') {
        assert.match(await page.locator('#modal').innerText(), /ราคาเสนอ/);
        assert.match(await page.locator('#modal').innerText(), /ยังไม่รับชำระเงิน/);
        assert.equal(await page.locator('#modal [data-ebook-order]').count(), 1);
        assert.equal(await page.locator('#modal a[href^="#/ebooks?offer="]').count(), 1);
      }
      await page.locator('#modal [data-close]').click();
    }
    pass('all 11 original-cover detail dialogs and correct sale states');
    await page.goto(base + '#/library?section=free');
    await page.waitForFunction(() => document.activeElement?.id === 'free-library-heading');
    assert.ok(await page.locator('#free-library-heading').evaluate(e => { const r=e.getBoundingClientRect();return r.top>=0 && r.top<innerHeight; }));
    pass('free-guide deep link lands at free documents');
    for (const width of [390,1440]) {
      await page.setViewportSize({width,height:width===390?844:1000});
      await page.goto(base+'#/'); await loaded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
      await page.locator('.home-ebooks').screenshot({path:path.join(root,'preview','home-ebooks-'+width+'.png')});
      await page.locator('.home-ebooks [data-ebook-details="unlock-love"]').click();
      assert.equal(await page.locator('#dialog-title').innerText(),'Unlock Love');
      await loaded(); await shot('ebook-detail-'+width);
      await page.locator('#modal [data-close]').click();
    }
    pass('homepage featured ebook cards open real details on desktop/mobile');
    await page.goto(base+'preview-tour.html');
    await page.waitForFunction(() => document.querySelector('#tour-frame').contentDocument?.querySelector('#main')?.dataset.route === '/');
    for(const [index,route] of [[0,'/'],[1,'/result'],[2,'/book'],[3,'/course'],[4,'/library'],[5,'/start']]) {
      await page.locator('[data-tour-step="'+index+'"]').click();
      await page.waitForFunction(expected=>document.querySelector('#tour-frame').contentDocument?.querySelector('#main')?.dataset.route===expected,route);
      assert.equal(await page.locator('[data-tour-step="'+index+'"]').getAttribute('aria-current'),'step');
    }
    await page.locator('[data-tour-step="3"]').click();
    const frame = page.frameLocator('#tour-frame');
    await frame.locator('[data-course-credit]').first().click();
    assert.match(await frame.locator('#modal').innerText(),/2,610/);
    assert.match(await frame.locator('#modal').innerText(),/ยังไม่ได้ยืนยันสิทธิ์/);
    await shot('tour-course-credit');
    await frame.locator('#modal [data-close]').click();
    await page.locator('[data-tour-step="1"]').click();
    await frame.locator('[data-result-action="view_book"]').first().click();
    await page.waitForFunction(()=>document.querySelector('[data-tour-step="2"]').getAttribute('aria-current')==='step');
    pass('guided tour six live pages, iframe purchase/credit interaction and route sync');
    for(const width of [390,1440]) {
      await page.setViewportSize({width,height:width===390?844:1000});
      await page.locator('[data-tour-step="0"]').click();
      await page.waitForFunction(()=>document.querySelector('#tour-frame').contentDocument?.querySelector('#main')?.dataset.route==='/');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
      await shot('guided-tour-'+width);
    }
    pass('guided tour responsive layout');
    assert.deepEqual(report.errors, []);
    report.status='passed';
  } catch(error) {report.status='failed';report.failure=error.stack;console.error(error);process.exitCode=1;}
  finally {await browser.close();fs.writeFileSync(path.join(__dirname,'library-report.json'),JSON.stringify(report,null,2));}
})();
