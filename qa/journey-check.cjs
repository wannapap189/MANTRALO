/* Local-only journey QA: no contacts, orders, registrations or remote service requests. */
const { chromium } = require(process.env.MANTRALO_PLAYWRIGHT || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = process.env.MANTRALO_PREVIEW_URL || 'http://127.0.0.1:8140/';
const origin = new URL(base).origin;
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname));
const freeNames = ['free-kit/free-guide.pdf', 'free-kit/checklist.pdf', 'free-kit/journal.pdf'];
const freePaths = new Set(freeNames.map(name => new URL('assets/' + name, base).pathname));
const videoUrl = new URL('assets/videos/emc-quiz-introduction.mp4', base).href;
const quizUrl = 'https://chakra.emcthai.com/7-chakras-testing';
const answers = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const extraTitles = ['Lucky by Design', 'Unlock Love', 'Office Chakra', 'เปล่งประกายภายใน', 'Crystal Harmony', 'ขวดน้ำอมฤตคริสตัล', 'The Power of Crystal Healing'];
const report = { time: new Date().toISOString(), base, checks: [], failures: [], errors: [], blockedRequests: [], screenshots: [], requestCount: 0 };
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
      const request = route.request(); const url = new URL(request.url()); report.requestCount++;
      const reason = !['GET', 'HEAD'].includes(request.method()) ? 'network mutation' : url.origin !== origin ? 'external request' : /\.pdf$/i.test(url.pathname) && !freePaths.has(url.pathname) ? 'paid or unknown PDF' : null;
      if (reason) { report.blockedRequests.push({ reason, method: request.method(), url: request.url() }); return route.abort(); }
      return route.continue();
    });
    const page = await context.newPage(); page.setDefaultTimeout(7000);
    page.on('pageerror', error => report.errors.push({ type: 'javascript', message: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.errors.push({ type: 'console', message: message.text() }); });
    page.on('response', response => { if (response.status() >= 400) report.errors.push({ type: 'http', status: response.status(), url: response.url() }); });
    const loaded = async () => {
      const failures = await page.evaluate(async () => { await document.fonts.ready; return (await Promise.all([...document.images].map(async image => { image.loading = 'eager'; try { await image.decode(); return null; } catch { return image.getAttribute('src'); } }))).filter(Boolean); });
      assert.deepEqual(failures, [], 'Image decoding failed');
    };
    const visit = async route => { await page.goto(base + '#' + route); await page.waitForFunction(expected => document.querySelector('#main')?.dataset.route === expected, route.split('?')[0]); await loaded(); };
    const fresh = async route => { await visit('/'); await visit(route); };
    const layout = async () => {
      const result = await page.evaluate(() => ({ width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, broken: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.getAttribute('src')), duplicates: [...document.querySelectorAll('[id]')].map(element => element.id).filter((id, index, ids) => ids.indexOf(id) !== index) }));
      assert.ok(result.scroll <= result.client + 1, 'Horizontal overflow: ' + JSON.stringify(result)); assert.deepEqual(result.broken, []); assert.deepEqual(result.duplicates, []); return result;
    };
    const safeContent = async () => {
      assert.equal(await page.locator('#main form').count(), 0, 'No account/contact/checkout form is expected');
      const urls = await page.locator('a[href], iframe[src], embed[src], object[data]').evaluateAll(nodes => nodes.map(node => node.href || node.src || node.data).filter(Boolean));
      for (const value of urls) { const url = new URL(value, base); if (/\.pdf$/i.test(url.pathname)) assert.ok(url.origin === origin && freePaths.has(url.pathname), 'Paid PDF exposed: ' + value); assert.ok(!/^(javascript|vbscript):/.test(url.protocol)); }
      const stateKeys = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter(key => /entitle|access.?token|paid|purchase|order|member/i.test(key)));
      assert.deepEqual(stateKeys, [], 'No simulated ownership, order or account should be persisted');
    };
    const capture = async name => { await loaded(); await page.evaluate(() => scrollTo(0, 0)); const filename = path.join(root, 'preview', name + '.png'); await page.screenshot({ path: filename, fullPage: true }); report.screenshots.push(filename); };
    const close = async () => { if (await page.locator('#modal').evaluate(element => element.open)) await page.locator('#modal [data-close]').click(); };

    const routes = [['discover','/discover','.ld-page'],['member','/member','.ms-member-page'],['shop','/shop','.ms-shop-page'],['next-book','/next-step?from=book','.ms-next-page'],['next-course','/next-step?from=course','.ms-next-page']];
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      for (const [label, route, selector] of routes) {
        await check(label + ' layout and assets at ' + width, async () => {
          await visit(route); assert.equal(await page.locator(selector).count(), 1); await safeContent(); const result = await layout();
          if ([390,1440].includes(width)) await capture('journey-' + label + '-' + width); return result;
        });
      }
    }

    await check('discovery links to the actual EMC quiz without visiting or submitting it', async () => {
      await fresh('/discover');
      const links = page.locator('.ld-page a[href="' + quizUrl + '"]'); assert.ok(await links.count() >= 1);
      for (const link of await links.all()) { assert.equal(await link.getAttribute('target'), '_blank'); assert.match(await link.getAttribute('rel'), /noopener/); }
      assert.match(await page.locator('.ld-page').innerText(), /EMC.*แท็บใหม่/s);
      assert.equal(await page.locator('.ld-page iframe').count(), 0);
      assert.ok(await page.locator('.ld-page a[href="#/start"]').count() > 0);
      assert.ok(await page.locator('.ld-page a[href="#/library?section=free"]').count() > 0);
      assert.match(await page.locator('.ld-book-offer').innerText(), /290/);
      assert.match(await page.locator('.ld-course-offer').innerText(), /2,900/);
      assert.match(await page.locator('.ld-course-offer').innerText(), /12 บท/);
    });
    await check('native introduction video loads, plays, seeks and stops on route departure', async () => {
      await fresh('/discover');
      const video = page.locator('.ld-page video'); assert.equal(await video.count(), 1);
      await page.waitForFunction(() => { const video = document.querySelector('.ld-page video'); return video?.readyState >= 1 && Number.isFinite(video.duration); }, null, { timeout: 20000 });
      const initial = await video.evaluate(element => ({ duration: element.duration, autoplay: element.autoplay, paused: element.paused, controls: element.controls, source: element.currentSrc, error: element.error?.message || null }));
      assert.ok(Math.abs(initial.duration - 89.43) < 0.25, 'Unexpected source duration'); assert.equal(initial.autoplay, false); assert.equal(initial.paused, true); assert.equal(initial.controls, true); assert.equal(initial.source, videoUrl); assert.equal(initial.error, null);
      await video.scrollIntoViewIfNeeded(); await video.click();
      await video.evaluate(async element => { element.currentTime = 40; await element.play(); });
      await page.waitForFunction(() => { const video = document.querySelector('.ld-page video'); return !video.paused && video.currentTime > 40.1 && video.readyState >= 2; }, null, { timeout: 20000 });
      await video.evaluate(element => { window.__qaDepartedVideo = element; });
      await visit('/member');
      assert.equal(await page.evaluate(() => window.__qaDepartedVideo.paused), true, 'Detached video continues playing');
      await visit('/discover'); assert.equal(await page.locator('.ld-page video').evaluate(element => element.paused), true);
      return initial;
    });
    await check('video HTTP byte ranges support seek and reject invalid ranges', async () => {
      const partial = await context.request.get(videoUrl, { headers: { Range: 'bytes=0-31' }, maxRedirects: 0 });
      assert.equal(partial.status(), 206); assert.equal((await partial.body()).length, 32); assert.match(partial.headers()['content-type'], /video\/mp4/); assert.match(partial.headers()['content-range'], /^bytes 0-31\/\d+$/); assert.equal(partial.headers()['content-length'], '32');
      const invalid = await context.request.get(videoUrl, { headers: { Range: 'bytes=999999999999-' }, maxRedirects: 0 });
      assert.equal(invalid.status(), 416); assert.match(invalid.headers()['content-range'], /^bytes \*\/\d+$/);
      return { partialStatus: 206, partialBytes: 32, invalidStatus: 416 };
    });

    const answerGame = async (choices, keyboard = false) => {
      for (let index = 0; index < choices.length; index++) {
        assert.equal(await page.locator('[data-game-number]').innerText(), String(index + 1));
        assert.equal(await page.locator('[data-game-answer]').count(), 7);
        assert.equal(await page.locator('[data-game-next]').isVisible(), false);
        const answer = page.locator('[data-game-answer="' + choices[index] + '"]');
        if (keyboard) { await answer.focus(); await answer.press(index % 2 ? 'Space' : 'Enter'); } else await answer.click();
        assert.equal(await page.locator('[data-game-answer]:disabled').count(), 7);
        assert.equal(await page.locator('[data-game-feedback]').getAttribute('data-feedback-state'), choices[index] === answers[index] ? 'correct' : 'learn');
        assert.equal(await page.locator('[data-game-completed]').innerText(), 'ตอบแล้ว ' + (index + 1) + ' ข้อ');
        assert.equal(await page.locator('#ld-game-progress').getAttribute('value'), String(index + 1));
        assert.equal(await page.locator('[data-answer-state="correct"]').count(), 1);
        const next = page.locator('[data-game-next]');
        if (keyboard) { await next.focus(); await next.press(index % 2 ? 'Enter' : 'Space'); } else await next.click();
        assert.ok(await page.locator('[data-game-focus]').evaluate(element => element === document.activeElement));
      }
      const score = choices.filter((choice,index) => choice === answers[index]).length;
      assert.equal(await page.locator('.ld-game-score strong').innerText(), String(score));
      assert.equal(await page.locator('.ld-result-colours li').count(), 7);
      assert.match(await page.locator('.ld-game-result').innerText(), /ไม่ใช่ผลประเมินจักระหรือพลังงาน/);
      assert.equal(await page.locator('[data-game-completed]').innerText(), 'ตอบครบแล้ว 7 ข้อ');
      assert.equal(await page.locator('[data-game-answer]').count(), 0);
      return score;
    };
    await check('knowledge game all correct by keyboard gives 7 of 7 without chakra diagnosis', async () => {
      await fresh('/discover');
      assert.match(await page.locator('.ld-game-note').innerText(), /ไม่ใช่คะแนนพลังงานหรือผลประเมินสมดุลจักระ/);
      assert.equal(await page.locator('[data-game-feedback]').getAttribute('aria-live'), 'polite');
      assert.equal(await answerGame(answers, true), 7);
    });
    await check('game reset and mixed answers give exactly 4 of 7', async () => {
      await page.locator('.ld-game-result [data-game-reset]').click();
      assert.equal(await page.locator('[data-game-number]').innerText(), '1'); assert.equal(await page.locator('#ld-game-progress').getAttribute('value'), '0'); assert.equal(await page.locator('[data-game-answer]:disabled').count(), 0);
      assert.equal(await answerGame(['red', 'red', 'yellow', 'red', 'blue', 'red', 'violet']), 4);
      await page.locator('[data-game-reset]').first().click();
      assert.equal(await page.locator('[data-game-number]').innerText(), '1'); assert.equal(await page.locator('[data-game-feedback]').innerText(), ''); assert.equal(await page.locator('.ld-game-result').count(), 0);
    });
    await check('game remount resets progress and does not accumulate answer handlers', async () => {
      for (let index = 0; index < 3; index++) { await visit('/member'); await visit('/discover'); assert.equal(await page.locator('[data-game-number]').innerText(), '1'); }
      await page.locator('[data-game-answer="red"]').click();
      assert.equal(await page.locator('[data-game-completed]').innerText(), 'ตอบแล้ว 1 ข้อ');
      assert.equal(await page.locator('[data-answer-state="correct"] small').count(), 1);
      await page.locator('[data-game-next]').click(); assert.equal(await page.locator('[data-game-number]').innerText(), '2');
      await page.locator('[data-game-reset]').first().click(); assert.equal(await answerGame(answers), 7);
      await safeContent();
    });

    await check('member shelf stays locked and exposes only the three free PDFs', async () => {
      await fresh('/member');
      assert.equal(await page.locator('[data-member-book]').count(), 8);
      assert.equal(await page.locator('[data-member-book] .ms-lock-label').count(), 8);
      for (const card of await page.locator('[data-member-book]').all()) assert.match(await card.innerText(), /ยังไม่ตรวจสิทธิ์/);
      assert.match(await page.locator('.ms-course-status').innerText(), /ยังไม่ตรวจสิทธิ์คอร์ส/);
      assert.match(await page.locator('.ms-member-page').innerText(), /ยังไม่มีบัญชี คำสั่งซื้อ หรือสิทธิ์สมาชิกของคุณ/);
      assert.equal(await page.locator('.ms-member-page video, .ms-member-page iframe, .ms-member-page input').count(), 0);
      assert.equal(await page.locator('.ms-member-page a[download]').count(), 3);
      for (const name of freeNames) {
        assert.equal(await page.locator('.ms-member-page a[download][href="assets/' + name + '"]').count(), 1);
        const response = await context.request.get(new URL('assets/' + name, base).href, { maxRedirects: 0 }); assert.equal(response.status(), 200); assert.equal((await response.body()).subarray(0,4).toString(), '%PDF');
      }
      const dashboardLinks = page.locator('.ms-member-page a[href="https://unlockchakra.emcthai.com/course-dashboard"]'); assert.equal(await dashboardLinks.count(), 2);
      await safeContent();
    });
    await check('accessory catalog uses six reference prices and has no checkout or added credit', async () => {
      await fresh('/shop');
      const expected = [['seven-crystals',990],['seven-pendant',990],['rose-notebook',990],['seven-notebook',1290],['aquarius-kit',1250],['chakra-basics',590]];
      assert.equal(await page.locator('[data-accessory]').count(), 6);
      for (const [id,price] of expected) {
        const product = page.locator('[data-accessory="' + id + '"]'); assert.equal(Number((await product.locator('.ms-product-price strong').innerText()).replace(/[^0-9]/g,'')), price);
        assert.match(await product.innerText(), /ราคาอ้างอิงเดิม.*รอยืนยัน/s);
        const source = product.locator('a[href^="https://shop.emcthai.com/store/"]'); assert.equal(await source.count(), 1); assert.equal(await source.getAttribute('target'), '_blank');
      }
      assert.equal(await page.locator('.ms-shop-page [data-order], .ms-shop-page [data-ebook-order]').count(), 0);
      assert.match(await page.locator('.ms-shop-page').innerText(), /สินค้า.*ไม่เพิ่มเครดิตคอร์ส/s); await safeContent();
    });

    await check('after book: delivery first, verified 2610 upgrade, optional downsell and route to content', async () => {
      await fresh('/next-step?from=book');
      assert.ok(await page.locator('.ms-delivery').evaluate(element => !!(element.compareDocumentPosition(document.querySelector('.ms-next-offer')) & Node.DOCUMENT_POSITION_FOLLOWING)));
      assert.match(await page.locator('.ms-delivery').innerText(), /เมื่อทีมงานยืนยัน/);
      const offer = await page.locator('.ms-next-offer').innerText(); assert.match(offer, /2,610/); assert.match(offer, /2,900/); assert.match(offer, /290/); assert.match(offer, /หนึ่งครั้ง/); assert.match(offer, /ไม่สะสม/); assert.match(offer, /ไม่รวมค่าจัดส่ง/);
      await page.locator('.ms-next-offer [data-course-credit]').click(); assert.match(await page.locator('#modal').innerText(), /2,610/); assert.match(await page.locator('#modal').innerText(), /ยังไม่ได้ยืนยันสิทธิ์/); await close();
      const alternate = page.locator('details.ms-alternative'); assert.equal(await alternate.evaluate(element => element.open), false);
      await alternate.locator('summary').focus(); await alternate.locator('summary').press('Enter'); assert.ok(await alternate.evaluate(element => element.open));
      assert.match(await alternate.innerText(), /800/); assert.match(await alternate.innerText(), /ไม่เพิ่มเครดิตคอร์ส/);
      await alternate.locator('a[href="#/ebooks?offer=complete-seven"]').click(); await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/ebooks');
      await visit('/next-step?from=book'); await page.locator('.ms-delivery a[href="#/member"]').click(); await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/member');
      assert.match(await page.locator('.ms-course-status').innerText(), /ยังไม่ตรวจสิทธิ์/);
    });
    await check('after course: 800 buys seven distinct extras and can be skipped for delivery', async () => {
      await fresh('/next-step?from=course');
      assert.match(await page.locator('.ms-next-offer').innerText(), /2,900.*800.*3,700/s); assert.match(await page.locator('.ms-next-offer').innerText(), /ไม่เพิ่มเครดิตคอร์ส/);
      await page.locator('[data-ebook-order="complete-seven"]').click();
      assert.equal(Number((await page.locator('.eo-summary-price').innerText()).replace(/[^0-9]/g,'')), 800);
      assert.deepEqual((await page.locator('.eo-summary > ul > li').allTextContents()).map(text => text.trim()), extraTitles);
      assert.match(await page.locator('#modal').innerText(), /ไม่มี 7 วัน 7 จักระ/); assert.match(await page.locator('#modal').innerText(), /ไม่สร้างคำสั่งซื้อ/); await close();
      await page.locator('.ms-decline[href="#/member"]').click(); await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/member');
      await safeContent();
    });
    await check('unknown next-step source stays neutral and does not imply a purchase', async () => {
      for (const value of ['unknown', '"><svg/onload=window.__qaJourneyInjected=1>']) {
        await visit('/next-step?from=' + encodeURIComponent(value)); assert.equal(await page.evaluate(() => window.__qaJourneyInjected), undefined);
        assert.equal(await page.locator('.ms-route-choices a').count(), 2); assert.equal(await page.locator('.ms-delivery').count(), 0); assert.equal(await page.locator('#main [data-course-credit], #main [data-ebook-order]').count(), 0);
      }
    });

    await check('homepage cards, mobile navigation and footer connect new routes', async () => {
      for (const route of ['/discover','/member','/shop']) {
        await visit('/'); const card = page.locator('.home-journey a[href="#' + route + '"]'); assert.equal(await card.count(), 1); await card.click(); await page.waitForFunction(expected => document.querySelector('#main').dataset.route === expected, route);
        const footer = page.locator('.site-footer a[href="#' + route + '"]'); assert.equal(await footer.count(), 1);
      }
      await page.setViewportSize({ width: 390, height: 844 }); await visit('/'); await page.locator('#menu-toggle').click(); await page.locator('#main-nav a[href="#/discover"]').click(); await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/discover'); assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
      await page.evaluate(() => scrollTo(0, 0)); await page.locator('#menu-toggle').click(); await page.locator('#main-nav a[href="#/member"]').click(); await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/member'); assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
      await page.locator('.site-footer a[href="#/shop"]').click(); await page.waitForFunction(() => document.querySelector('#main').dataset.route === '/shop');
    });
    for (const width of [360,390,768,1440]) {
      await check('owner funnel plan responsive and navigable at ' + width, async () => {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 }); await page.goto(new URL('funnel-plan.html', base).href); await loaded(); const result = await layout();
        assert.ok(await page.locator('a[href="index.html#/discover"]').count() > 0); assert.ok(await page.locator('a[href="index.html#/member"]').count() > 0); assert.ok(await page.locator('a[href="index.html#/shop"]').count() > 0);
        const details = page.locator('details').first(); await details.locator('summary').focus(); const before = await details.evaluate(element => element.open); await details.locator('summary').press('Enter'); assert.equal(await details.evaluate(element => element.open), !before);
        if ([390,1440].includes(width)) await capture('journey-funnel-plan-' + width);
        await page.locator('nav a[href="index.html#/member"]').click(); await page.waitForFunction(() => document.querySelector('#main')?.dataset.route === '/member'); return result;
      });
    }
    await check('no browser errors, failed assets, external traffic, submissions or accounts', async () => { assert.deepEqual(report.errors, []); assert.deepEqual(report.blockedRequests, []); return { requestCount: report.requestCount, externalRequests: 0, networkMutations: 0, accountSubmissions: 0 }; });
  } catch (error) { report.failures.push({ name: 'setup or route availability', error: error.stack }); console.error(error); }
  finally { if (browser) await browser.close(); report.status = report.failures.length ? 'failed' : 'passed'; if (report.failures.length) process.exitCode = 1; fs.writeFileSync(path.join(__dirname, 'journey-report.json'), JSON.stringify(report,null,2)); console.log(report.status.toUpperCase() + ': ' + report.checks.length + ' checks; ' + report.failures.length + ' failures'); }
})();
