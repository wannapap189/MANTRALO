/* Bilingual local-preview regression checks. Blocks remote and non-read requests. */
const { chromium } = require(process.env.MANTRALO_PLAYWRIGHT);
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:8140/';
const root = path.resolve(__dirname, '..');
const report = { checks: [], errors: [], blocked: [], failures: [] };
const check = async (name, action) => {
  try { await action(); report.checks.push(name); console.log('PASS ' + name); }
  catch (error) { report.failures.push({ name, message: error.message }); console.error('FAIL ' + name + ': ' + error.message); }
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.route('**/*', request => {
      const r = request.request();
      if (!r.url().startsWith(base) || !['GET', 'HEAD'].includes(r.method())) { report.blocked.push(r.url()); return request.abort(); }
      return request.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) report.errors.push(r.status() + ' ' + r.url()); });
    const visit = async (route, language = 'en') => {
      await page.goto(base + '#' + route + (route.includes('?') ? '&' : '?') + 'lang=' + language);
      await page.waitForFunction(lang => window.MANTRALO_I18N?.getLanguage() === lang, language);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })); });
    };
    const untranslated = async () => page.evaluate(() => {
      const results = [];
      const clean = s => s.replaceAll('วรรณนภา ประจักษ์ทิพย์', '').trim();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('script,style,noscript,[data-locale-ui]')) continue;
        if (/[\u0E00-\u0E7F]/.test(clean(node.nodeValue))) results.push(clean(node.nodeValue));
      }
      document.body.querySelectorAll('[alt],[title],[aria-label],[placeholder]').forEach(el => {
        if (el.closest('[data-locale-ui]')) return;
        for (const key of ['alt', 'title', 'aria-label', 'placeholder']) {
          const text = clean(el.getAttribute(key) || '');
          if (/[\u0E00-\u0E7F]/.test(text)) results.push(key + ': ' + text);
        }
      });
      return [...new Set(results)];
    });
    const layout = async () => {
      const data = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        duplicateIds: [...document.querySelectorAll('[id]')].map(e => e.id).filter((id, n, all) => all.indexOf(id) !== n),
        broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
        headings: document.querySelectorAll('main h1').length
      }));
      assert.equal(data.overflow, false); assert.deepEqual(data.duplicateIds, []); assert.deepEqual(data.broken, []); assert.equal(data.headings, 1);
      assert.deepEqual(await untranslated(), []);
    };
    const close = async () => { await page.locator('#modal [data-close]').click(); await page.waitForFunction(() => !document.querySelector('#modal').open); };
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ['/', '/book', '/course']) await check('English ' + route + ' layout and complete UI copy at ' + width, async () => {
        await visit(route); await layout();
        assert.match(await page.locator('#locale-notice').innerText(), /currently in Thai/);
        if (width === 390 || width === 1440) await page.screenshot({ path: path.join(root, 'preview', 'en-' + (route === '/' ? 'home' : route.slice(1)) + '-' + width + '.png') });
      });
    }
    await check('Language switch preserves course route, lesson state and keyboard focus', async () => {
      await visit('/course');
      await page.locator('[data-course-lesson] summary').first().click();
      await page.locator('[data-language="th"]').focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.documentElement.lang === 'th');
      assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('lang'), 'th');
      assert.equal(await page.locator('[data-course-lesson]').first().evaluate(e => e.open), true);
      assert.equal(await page.locator('[data-language="th"]').evaluate(e => e === document.activeElement), true);
      await page.locator('[data-language="en"]').click();
      await page.waitForFunction(() => document.documentElement.lang === 'en');
      assert.match(page.url(), /#\/course\?lang=en/); assert.deepEqual(await untranslated(), []);
    });
    await check('English preference survives navigation and reload; Thai-only pages are clearly labelled', async () => {
      await visit('/');
      await page.locator('.home-concept-paths a[href^="#/book"]').click();
      await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/book');
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      await page.reload(); await page.waitForFunction(() => window.MANTRALO_I18N?.getLanguage() === 'en');
      await page.locator('.bp-free-entry[href^="#/free-kit"]').first().click();
      await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/free-kit');
      assert.equal(await page.locator('html').getAttribute('lang'), 'th');
      assert.match(await page.locator('#locale-notice').innerText(), /This page is currently in Thai/);
      assert.equal(await page.locator('[data-language="en"]').isDisabled(), true);
      await page.locator('#locale-notice a').click();
      await page.waitForFunction(() => window.MANTRALO_I18N?.getLanguage() === 'en');
      assert.match(await page.locator('main h1').innerText(), /A little pause/);
    });
    await check('All seven chakra reflections and four interest choices update in English', async () => {
      await visit('/');
      for (const button of await page.locator('[data-chakra]').all()) { await button.click(); await page.waitForTimeout(20); assert.deepEqual(await untranslated(), []); }
      for (const button of await page.locator('[data-interest]').all()) { await button.click(); await page.waitForTimeout(20); assert.deepEqual(await untranslated(), []); }
    });
    await check('Four home eBook detail dialogs use English and disclose Thai editions', async () => {
      await visit('/');
      for (const button of await page.locator('[data-ebook-details]').all()) {
        await button.click(); await page.waitForFunction(() => document.querySelector('#modal').open);
        assert.deepEqual(await untranslated(), []); assert.match(await page.locator('#modal-content').innerText(), /Thai/i); await close();
      }
    });
    await check('Book print and digital offers retain THB 290 with English summaries', async () => {
      await visit('/book');
      await page.locator('[data-order="book"]').first().click(); await page.waitForFunction(() => document.querySelector('#modal').open);
      assert.match(await page.locator('#modal-content').innerText(), /290/); assert.match(await page.locator('#modal-content').innerText(), /shipping/i); assert.deepEqual(await untranslated(), []); await close();
      await page.locator('[data-format="digital"]').click(); await page.waitForTimeout(20); assert.deepEqual(await untranslated(), []);
      await page.locator('[data-order="selected-book"]').first().click(); await page.waitForFunction(() => document.querySelector('#modal').open);
      assert.match(await page.locator('#dialog-title').innerText(), /Digital Starter/i); assert.match(await page.locator('#modal-content').innerText(), /290/); assert.deepEqual(await untranslated(), []);
      await close(); await page.locator('[data-language="th"]').click(); await page.waitForFunction(() => document.documentElement.lang === 'th');
      await page.locator('[data-order="selected-book"]').first().click(); await page.waitForFunction(() => document.querySelector('#modal').open);
      assert.match(await page.locator('#dialog-title').innerText(), /ดิจิทัล/); await close();
    });
    await check('Exactly 12 lessons, English expand/collapse and verified-credit offer', async () => {
      await visit('/course'); assert.equal(await page.locator('[data-course-lesson]').count(), 12);
      await page.locator('[data-course-expand]').click(); await page.waitForTimeout(20);
      assert.equal(await page.locator('[data-course-lesson][open]').count(), 12); assert.match(await page.locator('[data-course-expand]').innerText(), /Collapse/i); assert.deepEqual(await untranslated(), []);
      await page.locator('[data-course-expand]').click(); assert.equal(await page.locator('[data-course-lesson][open]').count(), 0);
      await page.locator('[data-order="course"]').first().click(); await page.waitForFunction(() => document.querySelector('#modal').open); assert.match(await page.locator('#modal-content').innerText(), /2,900/); assert.deepEqual(await untranslated(), []); await close();
      await page.locator('[data-course-credit]').first().click(); await page.waitForFunction(() => document.querySelector('#modal').open);
      const copy = await page.locator('#modal-content').innerText(); assert.match(copy, /2,610/); assert.match(copy, /verif|eligib|confirm/i); assert.match(copy, /Thai|THB/); assert.deepEqual(await untranslated(), []); await close();
    });
    await check('Contact dialog is English and sends nothing', async () => {
      await visit('/course'); await page.locator('[data-contact]').first().click(); await page.waitForFunction(() => document.querySelector('#modal').open); assert.match(await page.locator('#modal-content').innerText(), /@emcthai/); assert.deepEqual(await untranslated(), []); await close();
    });
    await check('Thai content restores without missing keys or mixed English headings', async () => {
      for (const route of ['/', '/book', '/course']) {
        await visit(route, 'th'); assert.match(await page.locator('main h1').innerText(), /[\u0E00-\u0E7F]/); assert.equal(await page.locator('#locale-notice').isVisible(), false);
      }
    });
    await check('No browser errors, failed assets, external requests or network writes', async () => { assert.deepEqual(report.errors, []); assert.deepEqual(report.blocked, []); });
    fs.writeFileSync(path.join(root, 'qa', 'i18n-report.json'), JSON.stringify(report, null, 2));
    console.log('RESULT: ' + report.checks.length + ' passed; ' + report.failures.length + ' failed');
    if (report.failures.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
