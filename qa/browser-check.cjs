/* Local frontend QA only: an isolated, headless Chrome; no production requests. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.MANTRALO_PLAYWRIGHT || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const base = 'http://127.0.0.1:8140/';
const report = { time: new Date().toISOString(), checks: [], errors: [], blockedExternalRequests: [], screenshots: [] };
const check = (name, details) => { report.checks.push({ name, ...details }); console.log('PASS ' + name); };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== '127.0.0.1') { report.blockedExternalRequests.push(url.origin + url.pathname); return route.abort(); }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', err => report.errors.push(err.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(response.status() + ' ' + response.url()); });
    page.setDefaultTimeout(6000);
    async function visit(route) {
      await page.goto(base + '#' + route);
      await page.waitForFunction(() => document.querySelector('#main')?.dataset.route !== undefined);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(async image => { image.loading = 'eager'; try { await image.decode(); } catch {} })); });
    }
    async function screenshot(name, fullPage = false) {
      const filename = 'preview/' + name + '.png';
      await page.screenshot({ path: path.join(root, filename), fullPage });
      report.screenshots.push(filename);
    }
    async function layout(name) {
      const result = await page.evaluate(() => ({ width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')), duplicateIds: [...document.querySelectorAll('[id]')].map(el => el.id).filter((id, index, ids) => ids.indexOf(id) !== index) }));
      assert.ok(result.scroll <= result.client + 1, name + ' horizontal overflow: ' + JSON.stringify(result));
      assert.deepEqual(result.broken, [], name + ' broken images');
      assert.deepEqual(result.duplicateIds, [], name + ' duplicate IDs');
      check(name, result);
    }
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      for (const [label, route] of [['home','/'], ['result','/result?chakra=2&outcome=unbalance'], ['book','/book'], ['course','/course'], ['start','/start'], ['library','/library']]) {
        await visit(route);
        await layout(label + ' at ' + width);
        if ([390,1440].includes(width) && ['home','result','book','course'].includes(label)) {
          await page.evaluate(() => scrollTo(0, 0));
          await screenshot(label + '-' + width + '-checked');
          if (width === 390) await screenshot(label + '-390-full-checked', true);
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (let chakra = 1; chakra <= 7; chakra++) {
      for (const outcome of ['balance','unbalance']) {
        await visit('/result?chakra=' + chakra + '&outcome=' + outcome);
        assert.equal(await page.locator('.mr-page').getAttribute('data-result-chakra'), String(chakra));
        assert.equal(await page.locator('.mr-page').getAttribute('data-result-outcome'), outcome);
        await layout('result ' + chakra + ' ' + outcome);
      }
    }
    await visit('/result?chakra=2&outcome=unbalance');
    await page.locator('[data-result-scroll]').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'mr-practice');
    await page.locator('[data-result-practised]').click();
    assert.equal(await page.locator('[data-result-practised]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-result-practised]').click();
    assert.equal(await page.locator('[data-result-practised]').getAttribute('aria-pressed'), 'false');
    await page.locator('[data-result-transcript]').click();
    assert.ok(await page.locator('[data-result-transcript-panel]').evaluate(e => e.open));
    await screenshot('result-mobile-guidance', true);
    check('result practice and readable video script');
    await page.locator('[data-result-preview-chakra]').selectOption('7');
    await page.waitForURL(/chakra=7/);
    await page.locator('[data-result-preview-outcome]').selectOption('balance');
    await page.waitForURL(/outcome=balance/);
    check('preview choices update result content');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const footer = await page.locator('.footer-bottom').boundingBox();
    const sticky = await page.locator('.mr-mobile-bar').boundingBox();
    assert.ok(footer.y + footer.height <= sticky.y + 1, 'sticky CTA obscures shared footer');
    await screenshot('result-mobile-footer');
    check('mobile result footer clears sticky purchase bar');
    await page.locator('.mr-mobile-bar a').click();
    await page.waitForURL('**/#/book');
    await page.locator('.bp-main-cta').click();
    assert.ok(await page.locator('#modal').evaluate(e => e.open));
    assert.match(await page.locator('#modal').innerText(), /290/);
    assert.match(await page.locator('#modal').innerText(), /หนังสือดิจิทัล/);
    assert.equal(await page.locator('#modal .funnel-next-step a').count(), 0, 'unconfigured checkout must stay closed');
    await screenshot('book-mobile-order-summary');
    await page.locator('#modal a[href="#/course"]').click();
    await page.waitForURL('**/#/course');
    assert.equal(await page.locator('[data-course-lesson]').count(), 12);
    assert.equal(await page.locator('#modal').evaluate(e => e.open), false);
    await page.locator('[data-course-expand]').click();
    assert.equal(await page.locator('[data-course-lesson][open]').count(), 12);
    await page.locator('[data-course-expand]').click();
    assert.equal(await page.locator('[data-course-lesson][open]').count(), 0);
    await page.locator('[data-course-credit]').first().click();
    assert.match(await page.locator('#modal').innerText(), /2,610/);
    assert.match(await page.locator('#modal').innerText(), /ยังไม่ได้ยืนยันสิทธิ์/);
    assert.equal(await page.locator('#modal .funnel-next-step a').count(), 0);
    assert.equal(await page.locator('#modal-content').evaluate(e => e.scrollTop), 0, 'credit dialog must open from its title');
    await screenshot('course-mobile-credit-summary');
    await page.locator('#modal-content').evaluate(e => e.scrollTop = e.scrollHeight);
    const closeBox = await page.locator('#modal [data-close]').boundingBox();
    assert.ok(closeBox.y >= 0 && closeBox.y + closeBox.height <= 844, 'close button stays in view while scrolling');
    await page.locator('#modal [data-close]').click();
    check('result → book 290 → course 12 → conditional credit 2610');
    await page.locator('[data-order="course"]').click();
    assert.match(await page.locator('#modal .order-price').innerText(), /2,900/);
    await page.locator('#modal [data-close]').click();
    await visit('/book');
    await page.locator('[data-format="digital"]').click();
    assert.match(await page.locator('#bp-mobile-format').innerText(), /ดิจิทัล/);
    await page.locator('#bp-mobile-button').click();
    assert.match(await page.locator('#dialog-title').innerText(), /ดิจิทัล/);
    await page.locator('#modal [data-close]').click();
    await page.locator('[data-format="paper"]').click();
    assert.match(await page.locator('#bp-mobile-format').innerText(), /เล่มจริง/);
    check('course full price and paper/digital mobile selection');
    await visit('/');
    await page.locator('#menu-toggle').click();
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.locator('#main-nav a[href="#/book"]').click();
    await page.waitForURL('**/#/book');
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
    await visit('/');
    await page.locator('[data-interest="work"]').click();
    assert.match(await page.locator('#interest-copy').innerText(), /งาน/);
    await page.locator('[data-chakra="6"]').click();
    assert.match(await page.locator('#chakra-name').innerText(), /ความหมาย/);
    check('mobile navigation and homepage exploration');
    await visit('/start');
    await page.clock.install();
    await page.locator('[data-timer="start"]').click();
    await page.clock.runFor(61000);
    assert.match(await page.locator('#timer-phase-label').innerText(), /2/);
    await page.locator('[data-timer="pause"]').click();
    const paused = await page.locator('#practice-timer').innerText();
    await page.clock.runFor(10000);
    assert.equal(await page.locator('#practice-timer').innerText(), paused);
    await page.locator('[data-timer="start"]').click();
    await page.clock.runFor(120000);
    assert.match(await page.locator('#practice-status').innerText(), /ครบ 3 นาที/);
    await page.locator('[data-practice-check]').first().check();
    assert.match(await page.locator('#checklist-count').innerText(), /1 จาก 3/);
    check('practice timer start, phases, pause, finish and checklist');
    await visit('/library');
    for (const file of ['free-kit/free-guide.pdf','free-kit/checklist.pdf','free-kit/journal.pdf']) {
      const response = await context.request.get(base + 'assets/' + file);
      assert.equal(response.status(), 200);
      assert.ok((await response.body()).subarray(0,4).toString() === '%PDF');
    }
    check('three current starter-kit PDFs are served');
    await visit('/result?chakra=9&outcome=wrong');
    assert.match(await page.locator('#main').innerText(), /ยังไม่มีผลสำรวจ/);
    assert.equal(await page.locator('.mr-upgrade-card').count(), 0);
    check('invalid result is neutral, not fabricated');
    assert.deepEqual(report.errors, [], 'browser or asset errors');
    assert.deepEqual(report.blockedExternalRequests, [], 'unexpected external request');
    check('no browser errors, failed assets, or external network requests');
    report.status = 'passed';
  } catch (err) { report.status = 'failed'; report.failure = err.stack; console.error(err); process.exitCode = 1; }
  finally { await browser.close(); fs.writeFileSync(path.join(__dirname, 'browser-report.json'), JSON.stringify(report,null,2)); }
})();
