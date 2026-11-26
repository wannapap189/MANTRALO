/* Local sales-preview QA. External, non-read-only, and paid-PDF requests are blocked. */
const { chromium } = require(process.env.MANTRALO_PLAYWRIGHT || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const base = process.env.MANTRALO_PREVIEW_URL || 'http://127.0.0.1:8140/';
const origin = new URL(base).origin;
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname), 'Only a local preview may be tested');
const report = { time: new Date().toISOString(), base, checks: [], failures: [], errors: [], blockedRequests: [], screenshots: [], requestCount: 0 };
const bookRows = [
  ['seven-days', '7 วัน 7 จักระ', 290],
  ['lucky-by-design', 'Lucky by Design', 190],
  ['unlock-love', 'Unlock Love', 190],
  ['office-chakra', 'Office Chakra', 190],
  ['inner-radiance', 'เปล่งประกายภายใน', 190],
  ['crystal-harmony', 'Crystal Harmony', 190],
  ['crystal-water', 'ขวดน้ำอมฤตคริสตัล', 99],
  ['crystal-healing', 'The Power of Crystal Healing', 149]
];
const titles = Object.fromEntries(bookRows.map(([id, title]) => [id, title]));
const allIds = bookRows.map(([id]) => id);
const lifeIds = ['lucky-by-design', 'unlock-love', 'office-chakra', 'inner-radiance'];
const expected = [
  ...bookRows.map(([id, title, price]) => ({ id: 'ebook-' + id, title, price, bookIds: [id] })),
  { id: 'life-four', price: 590, bookIds: lifeIds, total: 760, savings: 170 },
  { id: 'all-eight', price: 1090, bookIds: allIds, total: 1488, savings: 398 },
  { id: 'complete-seven', price: 800, bookIds: allIds.filter(id => id !== 'seven-days'), total: 1198, savings: 398 },
  { id: 'complete-from-four', price: 500, bookIds: allIds.filter(id => !lifeIds.includes(id)), total: 728, savings: 228, requires: 'life-four' }
];
const freePaths = new Set(['free-kit/free-guide.pdf', 'free-kit/checklist.pdf', 'free-kit/journal.pdf', 'free-kit/course-sample.pdf'].map(name => new URL('assets/' + name, base).pathname));
const moneyPattern = value => new RegExp('(?:^|[^0-9])' + String(value).split('').join(',?') + '(?![0-9])');
const check = async (name, test) => {
  try { const details = await test(); report.checks.push({ name, ...details }); console.log('PASS ' + name); }
  catch (error) { report.failures.push({ name, error: error.stack }); console.error('FAIL ' + name + ': ' + error.message); }
};

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', deviceScaleFactor: 1, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      report.requestCount++;
      const reason = !['GET', 'HEAD'].includes(request.method()) ? 'non-read-only request'
        : url.origin !== origin ? 'external request'
          : /\.pdf$/i.test(url.pathname) && !freePaths.has(url.pathname) ? 'paid or unknown PDF request' : null;
      if (reason) { report.blockedRequests.push({ reason, method: request.method(), url: request.url() }); return route.abort(); }
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => report.errors.push({ type: 'javascript', message: error.message }));
    page.on('response', response => {
      if (response.status() >= 400) report.errors.push({ type: 'http', status: response.status(), url: response.url() });
      if (/application\/pdf/i.test(response.headers()['content-type'] || '') && !freePaths.has(new URL(response.url()).pathname)) {
        report.errors.push({ type: 'unexpected-pdf-response', url: response.url() });
      }
    });
    const loaded = async () => {
      const failures = await page.evaluate(async () => {
        await document.fonts.ready;
        return (await Promise.all([...document.images].map(async image => {
          image.loading = 'eager';
          try { await image.decode(); return null; } catch { return image.getAttribute('src'); }
        }))).filter(Boolean);
      });
      assert.deepEqual(failures, [], 'Image decoding failed');
    };
    const visit = async hash => {
      await page.goto(base + '#' + hash);
      await page.waitForFunction(route => document.querySelector('#main')?.dataset.route === route, hash.split('?')[0]);
      await loaded();
    };
    const layout = async () => {
      const result = await page.evaluate(() => ({
        width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.getAttribute('src')),
        duplicateIds: [...document.querySelectorAll('[id]')].map(element => element.id).filter((id, index, ids) => ids.indexOf(id) !== index)
      }));
      assert.ok(result.scroll <= result.client + 1, 'Horizontal overflow: ' + JSON.stringify(result));
      assert.deepEqual(result.brokenImages, [], 'Broken images');
      assert.deepEqual(result.duplicateIds, [], 'Duplicate IDs');
      return result;
    };
    const safeLinks = async () => {
      const exposed = await page.locator('a[href], iframe[src], embed[src], object[data]').evaluateAll(nodes => nodes.map(node => node.href || node.src || node.data).filter(Boolean));
      for (const value of exposed) {
        const url = new URL(value, base);
        if (/\.pdf$/i.test(url.pathname)) assert.ok(url.origin === origin && freePaths.has(url.pathname), 'Paid or unknown PDF is publicly linked: ' + value);
        assert.ok(!/^(javascript|vbscript):/i.test(url.protocol), 'Executable link: ' + value);
      }
      assert.equal(await page.locator('form').count(), 0, 'Sales preview must not submit an order or contact form');
    };
    const closeDialog = async () => {
      if (await page.locator('#modal').evaluate(element => element.open)) await page.locator('#modal [data-close]').click();
    };
    const verifySummary = async offer => {
      assert.ok(await page.locator('#modal').evaluate(element => element.open), 'Summary did not open');
      const summary = page.locator('#modal .eo-summary');
      assert.equal(await summary.count(), 1, 'Expected an offer summary');
      const shownPrice = await summary.locator('.eo-summary-price').innerText();
      assert.equal(Number(shownPrice.replace(/[^0-9]/g, '')), offer.price, 'Summary selling price');
      const shownTitles = (await summary.locator(':scope > ul > li').allTextContents()).map(text => text.trim());
      assert.deepEqual(shownTitles, offer.bookIds.map(id => titles[id]), 'Summary must contain precisely the purchased books');
      const text = await summary.innerText();
      assert.match(text, /ยังไม่รับชำระเงิน/);
      assert.match(text, /ไม่สร้างคำสั่งซื้อ/);
      assert.match(text, /ไม่เปิดสิทธิ์อัตโนมัติ/);
      assert.match(text, /กำลังตรวจฉบับส่งมอบ/);
      assert.match(text, /ไม่มีการจัดส่งเล่มพิมพ์/);
      assert.match(text, /Checklist/);
      if (offer.total) {
        assert.match(text, moneyPattern(offer.total), 'Comparison total missing');
        assert.match(text, moneyPattern(offer.savings), 'Savings amount missing');
      }
      if (offer.bookIds.includes('seven-days')) {
        assert.match(text, /2,610/);
        assert.match(text, /2,900/);
        assert.match(text, /ตรวจ/);
        assert.match(text, /หนึ่งครั้ง/);
        assert.match(text, /ไม่สะสมกับเครดิตหนังสือเดิม/);
      } else {
        assert.match(text, /ไม่เพิ่มเครดิตคอร์ส/);
        assert.doesNotMatch(await summary.locator('.eo-summary-credit').innerText(), /2,610/, 'Non-Starter purchase must not itself qualify for the upgrade price');
      }
      if (offer.id === 'complete-seven') assert.match(text, /ไม่มี 7 วัน 7 จักระ/);
      if (offer.requires) {
        assert.match(text, /ผู้ซื้อชุดชีวิตประจำวัน/);
        assert.match(text, /ตรวจรายการเดิม/);
        assert.match(text, /ยังไม่ถูกอนุมัติ/);
        assert.match(text, /1,090/);
      }
      if (offer.id === 'ebook-seven-days') {
        assert.match(text, /ไม่ต้องซื้อหนังสือดิจิทัลซ้ำ/);
        assert.match(text, /ค่าจัดส่งแยก/);
        assert.equal(await summary.locator('a[href="#/book"]').count(), 1);
      }
      assert.equal(await page.locator('#modal-content').evaluate(element => element.scrollTop), 0, 'Summary must start at the title');
      await safeLinks();
    };

    await visit('/ebooks');
    assert.ok(await page.evaluate(() => !!window.MANTRALO_EBOOK_OFFERS), 'Offer script is missing');
    await check('catalog and offer arithmetic preserve ownership and course credit', async () => {
      const data = await page.evaluate(() => {
        const offers = window.MANTRALO_EBOOK_OFFERS;
        return { singles: offers.singles, bundles: offers.bundles, coursePrice: offers.coursePrice, creditMax: offers.creditMax,
          details: [...offers.singles, ...offers.bundles].map(offer => ({ id: offer.id, total: offers.listTotal(offer), savings: offers.savings(offer), titles: offers.books(offer).map(book => book.title), sameLookup: offers.get(offer.id) === offer })),
          unknown: offers.get('missing-offer') };
      });
      assert.equal(data.singles.length, 8);
      assert.equal(data.bundles.length, 4);
      assert.deepEqual(data.singles.map(offer => offer.price), [290, 190, 190, 190, 190, 190, 99, 149]);
      assert.equal(data.singles.reduce((sum, offer) => sum + offer.price, 0), 1488);
      assert.equal(data.coursePrice, 2900);
      assert.equal(data.creditMax, 290);
      for (const item of expected) {
        const actual = [...data.singles, ...data.bundles].find(offer => offer.id === item.id);
        assert.ok(actual, 'Missing offer ' + item.id);
        assert.equal(actual.price, item.price);
        assert.deepEqual(actual.bookIds, item.bookIds);
        if (item.requires) assert.equal(actual.requires, item.requires);
        const detail = data.details.find(offer => offer.id === item.id);
        assert.deepEqual(detail.titles, item.bookIds.map(id => titles[id]));
        assert.equal(detail.total, item.total || item.price);
        assert.equal(detail.savings, item.savings || 0);
        assert.ok(detail.sameLookup);
      }
      assert.equal(data.unknown, null);
      const byId = Object.fromEntries(data.bundles.map(offer => [offer.id, offer]));
      assert.equal(byId['life-four'].price + byId['complete-from-four'].price, byId['all-eight'].price);
      const remainingCourse = data.coursePrice - data.creditMax;
      assert.equal(remainingCourse, 2610);
      assert.equal(byId['all-eight'].price + remainingCourse, 3700);
      assert.equal(data.coursePrice + byId['complete-seven'].price, 3700);
      return { singles: 8, offers: 12, standaloneTotal: 1488, combinedCourseCost: 3700 };
    });

    for (const width of [360, 390, 768, 1440]) {
      await check('all 12 offers, original covers and layout at ' + width, async () => {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
        await visit('/ebooks');
        assert.equal(await page.locator('[data-offer-card]').count(), 12);
        for (const offer of expected) {
          const card = page.locator('[data-offer-card="' + offer.id + '"]');
          assert.equal(await card.count(), 1, 'Offer card missing or duplicated: ' + offer.id);
          assert.ok(await card.isVisible());
          assert.match(await card.innerText(), moneyPattern(offer.price), 'Card selling price: ' + offer.id);
          assert.equal(await card.locator('[data-ebook-order="' + offer.id + '"]').count(), 1, 'Real purchase-summary button required');
          if (offer.title) {
            assert.ok((await card.innerText()).includes(offer.title));
            assert.ok(await card.locator('img').count() > 0, 'Single title has no cover');
          }
        }
        await safeLinks();
        const result = await layout();
        if ([390, 1440].includes(width)) {
          await loaded();
          await page.evaluate(() => scrollTo(0, 0));
          const filename = 'ebooks-final-' + (width === 390 ? 'mobile' : 'desktop') + '.png';
          await page.screenshot({ path: path.join(root, 'preview', filename), fullPage: true });
          report.screenshots.push(path.join(root, 'preview', filename));
        }
        return result;
      });
    }

    for (const offer of expected) {
      await check('real button opens exact summary: ' + offer.id, async () => {
        await visit('/ebooks');
        const button = page.locator('[data-offer-card="' + offer.id + '"] [data-ebook-order="' + offer.id + '"]');
        assert.equal(await button.count(), 1, 'Missing actual button; no synthetic fallback is used');
        await button.click();
        await verifySummary(offer);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#modal').evaluate(element => element.open), false);
        assert.ok(await button.evaluate(element => element === document.activeElement), 'Escape must restore the opener focus');
        return { price: offer.price, includedBooks: offer.bookIds.map(id => titles[id]) };
      });
    }

    await check('selected-offer deep links, browser Back and Forward', async () => {
      await visit('/ebooks');
      await page.goto(base + '#/ebooks?offer=complete-seven');
      await page.waitForFunction(() => {
        const card = document.querySelector('[data-offer-card="complete-seven"]');
        if (!card) return false;
        const rectangle = card.getBoundingClientRect();
        return rectangle.top < innerHeight && rectangle.bottom > 0;
      });
      await page.locator('[data-offer-card="complete-seven"] [data-ebook-order]').click();
      await verifySummary(expected.find(offer => offer.id === 'complete-seven'));
      await closeDialog();
      await page.goBack();
      assert.equal(new URL(page.url()).hash, '#/ebooks');
      await page.goForward();
      assert.equal(new URL(page.url()).hash, '#/ebooks?offer=complete-seven');
    });

    await check('unknown and executable-looking offer parameters remain inert', async () => {
      for (const id of ['unknown-offer', '__proto__', '"><svg/onload=window.__ebookQAInjected=1>']) {
        await visit('/ebooks?offer=' + encodeURIComponent(id));
        assert.equal(await page.evaluate(() => window.__ebookQAInjected), undefined);
        assert.equal(await page.locator('[data-offer-card]').count(), 12, 'Invalid input should leave the real catalog available');
        assert.equal(await page.locator('#modal').evaluate(element => element.open), false);
        assert.equal(await page.locator('#main svg[onload], #main img[onerror]').count(), 0);
        await safeLinks();
      }
    });

    await check('library shows all eight prices and working detail-to-offer paths', async () => {
      await visit('/library');
      assert.equal(await page.locator('[data-library-grid] [data-library-book]').count(), 8);
      for (const [id, title, price] of bookRows) {
        const card = page.locator('[data-library-grid] [data-library-book="' + id + '"]');
        assert.match(await card.innerText(), moneyPattern(price), 'Library card price: ' + id);
        await card.locator('[data-ebook-details="' + id + '"]').click();
        assert.equal(await page.locator('#dialog-title').innerText(), title);
        assert.match(await page.locator('#modal').innerText(), moneyPattern(price));
        await loaded();
        if (id === 'seven-days') {
          assert.equal(await page.locator('#modal a[href="#/book"]').count(), 1);
        } else {
          const offer = expected.find(item => item.id === 'ebook-' + id);
          assert.equal(await page.locator('#modal a[href="#/ebooks?offer=' + offer.id + '"]').count(), 1);
          await page.locator('#modal [data-ebook-order="' + offer.id + '"]').click();
          await verifySummary(offer);
        }
        await closeDialog();
      }
      await page.locator('[data-library-grid] [data-ebook-details="office-chakra"]').click();
      await page.locator('#modal a[href="#/ebooks?offer=ebook-office-chakra"]').click();
      await page.waitForFunction(() => document.querySelector('#main')?.dataset.route === '/ebooks');
      assert.equal(new URL(page.url()).hash, '#/ebooks?offer=ebook-office-chakra');
      assert.equal(await page.locator('#modal').evaluate(element => element.open), false);
      await safeLinks();
    });

    for (const route of ['/book', '/course']) {
      await check(route + ' links to seven additional books without reselling Starter', async () => {
        await visit(route);
        const bridge = page.locator('.eo-bridge');
        assert.equal(await bridge.count(), 1);
        assert.match(await bridge.innerText(), /800/);
        assert.match(await bridge.innerText(), /ไม่ซื้อเล่มเดิมซ้ำ/);
        assert.match(await bridge.innerText(), /ไม่เพิ่มเครดิตคอร์ส/);
        const link = bridge.locator('a[href="#/ebooks?offer=complete-seven"]');
        assert.equal(await link.count(), 1);
        await link.click();
        await page.waitForFunction(() => document.querySelector('#main')?.dataset.route === '/ebooks');
        assert.equal(new URL(page.url()).hash, '#/ebooks?offer=complete-seven');
      });
    }

    await check('book gift, 12 lessons, full course price and conditional verified credit remain intact', async () => {
      await visit('/book');
      await page.locator('[data-order="book"]').first().click();
      const bookText = await page.locator('#modal').innerText();
      assert.match(bookText, /290/);
      assert.match(bookText, /แถมหนังสือดิจิทัล/);
      assert.match(bookText, /ค่าจัดส่งแยก/);
      await closeDialog();
      await visit('/course');
      assert.equal(await page.locator('[data-course-lesson]').count(), 12);
      await page.locator('[data-order="course"]').first().click();
      assert.match(await page.locator('#modal .order-price').innerText(), /2,900/);
      await closeDialog();
      await page.locator('[data-course-credit]').first().click();
      const text = await page.locator('#modal').innerText();
      assert.match(text, /2,610/);
      assert.match(text, /ยังไม่ได้ยืนยันสิทธิ์/);
      assert.match(text, /ตรวจสอบ/);
      assert.match(text, /หนึ่งครั้ง/);
      assert.match(text, /ไม่รวมค่าจัดส่งและสินค้าเพิ่ม/);
      await closeDialog();
    });

    await check('no JavaScript errors, failed assets, external requests, submissions or paid PDFs', async () => {
      assert.deepEqual(report.errors, []);
      assert.deepEqual(report.blockedRequests, []);
      return { requestCount: report.requestCount, commerceSubmissions: 0, externalRequests: 0, paidPdfRequests: 0 };
    });
  } catch (error) {
    report.failures.push({ name: 'test setup or route availability', error: error.stack });
    console.error(error);
  } finally {
    if (browser) await browser.close();
    report.status = report.failures.length ? 'failed' : 'passed';
    if (report.failures.length) process.exitCode = 1;
    fs.writeFileSync(path.join(__dirname, 'ebook-sales-report.json'), JSON.stringify(report, null, 2));
    console.log(report.status.toUpperCase() + ': ' + report.checks.length + ' checks; ' + report.failures.length + ' failures');
  }
})();
